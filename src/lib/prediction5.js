// prediction5.js — Dixon-Coles Poisson Model + SRF Tippspiel Optimization
// Estimates separate attack/defense strengths per team, blends FIFA prior
// with in-tournament evidence, and picks scorelines maximizing SRF expected points.

import { GROUPS, GROUP_LETTERS } from '../data/groups.js';
import { getGroupFixtures } from '../data/fixtures.js';
import { R32_FIXED, R16_MATCHUPS, QF_MATCHUPS, SF_MATCHUPS, FINAL_MATCHUPS } from '../data/bracket.js';
import { computeGroupStandings } from './standings.js';
import { getBestThirdPlaced } from './qualification.js';
import { generateRoundOf32 } from './bracketLogic.js';
import { generatePredictions as v3 } from './prediction.js';
import { generatePredictions as v4 } from './prediction4.js';

const HOSTS = new Set(['Mexico', 'Canada', 'USA']);
const MAX_GOALS = 10;
const SRF_OUTCOME = { group: 5, ko: 10 };
const SRF_GOAL = { group: 1, ko: 2 };
const SRF_GD = { group: 3, ko: 6 };

// ── Utils ──────────────────────────────────────────────────────

function countPlayed(results) {
  return Object.values(results).filter(Boolean).length;
}

function sumAllGoals(results) {
  return Object.values(results).reduce((s, r) => {
    if (!r) return s;
    return s + (r.homeScore || 0) + (r.awayScore || 0);
  }, 0);
}

function getTeamMatches(teamName, groupLetter, results, groups) {
  const fixtures = getGroupFixtures(groupLetter);
  const teamIdx = groups[groupLetter].teams.findIndex(t => t.name === teamName);
  const matches = [];
  for (const f of fixtures) {
    const r = results[f.id];
    if (!r) continue;
    if (f.homeIdx === teamIdx) {
      matches.push({ gf: r.homeScore || 0, ga: r.awayScore || 0 });
    } else if (f.awayIdx === teamIdx) {
      matches.push({ gf: r.awayScore || 0, ga: r.homeScore || 0 });
    }
  }
  return matches;
}

function poissonProb(lambda, k) {
  if (lambda === 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

// ── Step 1: Estimate team attack/defense strengths ───────────

export function estimateTeamStrengths(results, groups) {
  const allTeams = [];
  for (const l of GROUP_LETTERS) {
    for (const t of groups[l].teams) {
      allTeams.push({ ...t, group: l });
    }
  }

  const totalPlayed = countPlayed(results);
  const totalGoals = sumAllGoals(results);
  const avgGoalsPerGame = totalPlayed > 0 ? totalGoals / totalPlayed : 2.5;

  const meanPts = allTeams.reduce((s, t) => s + t.pts, 0) / allTeams.length;
  const stdPts = Math.sqrt(allTeams.reduce((s, t) => s + (t.pts - meanPts) ** 2, 0) / allTeams.length) || 100;

  const strengths = {};
  for (const team of allTeams) {
    const tm = getTeamMatches(team.name, team.group, results, groups);
    const gf = tm.reduce((s, m) => s + m.gf, 0);
    const ga = tm.reduce((s, m) => s + m.ga, 0);
    const n = tm.length;

    // Prior from FIFA ranking points (z-score → log-linear strength)
    const fifaZ = (team.pts - meanPts) / stdPts;
    const attackPrior = 1 + 0.15 * fifaZ;
    const defensePrior = 1 - 0.15 * fifaZ;

    let attack, defense, weight;
    if (n === 0) {
      attack = attackPrior;
      defense = defensePrior;
      weight = 0;
    } else {
      const avgTeamGoals = totalGoals / (2 * totalPlayed);
      const gfPerGame = gf / n;
      const gaPerGame = ga / n;
      const attackData = avgTeamGoals > 0 ? gfPerGame / avgTeamGoals : 1;
      const defenseData = avgTeamGoals > 0 ? gaPerGame / avgTeamGoals : 1;
      weight = Math.min(0.85, n * 0.2);
      attack = (1 - weight) * attackPrior + weight * attackData;
      defense = (1 - weight) * defensePrior + weight * defenseData;
    }

    attack = Math.max(0.15, Math.min(3.0, attack));
    defense = Math.max(0.15, Math.min(3.0, defense));

    strengths[team.name] = { attack, defense, played: n, gf, ga, rank: team.rank, pts: team.pts, weight };
  }

  return { strengths, avgGoalsPerGame, totalPlayed, totalGoals };
}

// ── Step 2: Expected goals & score probabilities ─────────────

export function getExpectedGoals(homeName, awayName, sd) {
  const s = sd.strengths;
  const h = s[homeName];
  const a = s[awayName];
  if (!h || !a) return { lambdaHome: 1.0, lambdaAway: 1.0 };

  const baseRate = sd.avgGoalsPerGame / 2;
  const isHostHome = HOSTS.has(homeName);
  const homeAdv = isHostHome ? 1.2 : 1.0;

  const lambdaHome = baseRate * h.attack * a.defense * homeAdv;
  const lambdaAway = baseRate * a.attack * h.defense;
  return { lambdaHome, lambdaAway };
}

export function computeScoreProbs(lambdaHome, lambdaAway) {
  const ph = [];
  const pa = [];
  for (let i = 0; i <= MAX_GOALS; i++) {
    ph[i] = poissonProb(lambdaHome, i);
    pa[i] = poissonProb(lambdaAway, i);
  }

  const probs = {};
  let homeWin = 0, draw = 0, awayWin = 0;
  const gdProbs = {};
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = ph[h] * pa[a];
      if (p < 1e-10) continue;
      probs[`${h}-${a}`] = p;
      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;
      gdProbs[h - a] = (gdProbs[h - a] || 0) + p;
    }
  }

  return { probs, homeWin, draw, awayWin, gdProbs, ph, pa };
}

// ── Step 3: SRF-optimized score picker ───────────────────────

export function findBestSrfPrediction(probs, isKnockout) {
  const outcomePts = isKnockout ? SRF_OUTCOME.ko : SRF_OUTCOME.group;
  const goalPts = isKnockout ? SRF_GOAL.ko : SRF_GOAL.group;
  const gdPts = isKnockout ? SRF_GD.ko : SRF_GD.group;

  let bestEV = -Infinity;
  let bestH = 1, bestA = 1;

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      if (isKnockout && h === a) continue;
      if (h === 0 && a === 0) continue;

      let ev = 0;
      const predOutcome = Math.sign(h - a);
      for (let rh = 0; rh <= MAX_GOALS; rh++) {
        for (let ra = 0; ra <= MAX_GOALS; ra++) {
          const p = probs[`${rh}-${ra}`];
          if (!p || p < 1e-10) continue;

          let pts = 0;
          if (Math.sign(rh - ra) === predOutcome) pts += outcomePts;
          if (h === rh) pts += goalPts;
          if (a === ra) pts += goalPts;
          if ((h - a) === (rh - ra)) pts += gdPts;
          ev += p * pts;
        }
      }
      if (ev > bestEV + 1e-9) {
        bestEV = ev;
        bestH = h;
        bestA = a;
      }
    }
  }
  return { homeScore: bestH, awayScore: bestA, expectedPoints: bestEV };
}

// ── Step 4: Evaluate model against played matches ────────────

export function evaluateModel(groups, results) {
  const sd = estimateTeamStrengths(results, groups);
  const totalPlayed = countPlayed(results);
  let totalPts = 0;
  let outcomeOk = 0, exactOk = 0, gdOk = 0, homeGoalsOk = 0, awayGoalsOk = 0;

  const details = [];

  for (const letter of GROUP_LETTERS) {
    const group = groups[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const actual = results[f.id];
      if (!actual) continue;

      const homeName = group.teams[f.homeIdx].name;
      const awayName = group.teams[f.awayIdx].name;
      const xG = getExpectedGoals(homeName, awayName, sd);
      const probs = computeScoreProbs(xG.lambdaHome, xG.lambdaAway);
      const pred = findBestSrfPrediction(probs.probs, false);

      const aH = actual.homeScore;
      const aA = actual.awayScore;
      const aO = Math.sign(aH - aA);
      const pO = Math.sign(pred.homeScore - pred.awayScore);

      let pts = 0;
      if (aO === pO) pts += 5;
      if (pred.homeScore === aH) pts += 1;
      if (pred.awayScore === aA) pts += 1;
      if ((pred.homeScore - pred.awayScore) === (aH - aA)) pts += 3;

      totalPts += pts;
      if (aO === pO) outcomeOk++;
      if (pred.homeScore === aH && pred.awayScore === aA) exactOk++;
      if ((pred.homeScore - pred.awayScore) === (aH - aA)) gdOk++;
      if (pred.homeScore === aH) homeGoalsOk++;
      if (pred.awayScore === aA) awayGoalsOk++;

      details.push({
        fixture: f.id, home: homeName, away: awayName,
        actual: `${aH}-${aA}`,
        predicted: `${pred.homeScore}-${pred.awayScore}`,
        lambdaHome: xG.lambdaHome.toFixed(2),
        lambdaAway: xG.lambdaAway.toFixed(2),
        points: pts, expectedValue: pred.expectedPoints.toFixed(2),
      });
    }
  }

  const maxPossible = totalPlayed * 10;
  return {
    totalPts, maxPossible,
    pct: maxPossible > 0 ? ((totalPts / maxPossible) * 100).toFixed(1) : '0.0',
    outcomeOk, exactOk, gdOk, homeGoalsOk, awayGoalsOk,
    totalPlayed, details, sd,
  };
}

// ── Step 5: Predict remaining group matches ──────────────────

export function predictRemainingGroup(results, groups) {
  const sd = estimateTeamStrengths(results, groups);
  const predictions = [];

  for (const letter of GROUP_LETTERS) {
    const group = groups[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      if (results[f.id]) continue;
      const homeName = group.teams[f.homeIdx].name;
      const awayName = group.teams[f.awayIdx].name;
      const xG = getExpectedGoals(homeName, awayName, sd);
      const probs = computeScoreProbs(xG.lambdaHome, xG.lambdaAway);
      const pred = findBestSrfPrediction(probs.probs, false);

      const homeWinP = (probs.homeWin * 100).toFixed(0);
      const drawP = (probs.draw * 100).toFixed(0);
      const awayWinP = (probs.awayWin * 100).toFixed(0);

      predictions.push({
        fixture: f.id, group: letter,
        home: homeName, away: awayName,
        homeScore: pred.homeScore, awayScore: pred.awayScore,
        expectedPoints: +pred.expectedPoints.toFixed(2),
        lambdaHome: +xG.lambdaHome.toFixed(2),
        lambdaAway: +xG.lambdaAway.toFixed(2),
        homeWinP: +homeWinP, drawP: +drawP, awayWinP: +awayWinP,
        confidence: Math.abs(+homeWinP - +awayWinP) > 30 ? 'high' : Math.abs(+homeWinP - +awayWinP) > 15 ? 'medium' : 'low',
      });
    }
  }

  return { predictions, sd };
}

// ── Step 6: Full knockout simulation ─────────────────────────

function knockoutPredict(homeName, awayName, sd) {
  const xG = getExpectedGoals(homeName, awayName, sd);
  const probs = computeScoreProbs(xG.lambdaHome, xG.lambdaAway);
  const pred = findBestSrfPrediction(probs.probs, true);
  return { ...pred, xG, probs };
}

export function predictFullTournament(results, groups) {
  // Merge actual results with remaining group predictions, adding home/away indices
  const rem = predictRemainingGroup(results, groups);
  const fullResults = {};

  // First, build all actual results with indices
  for (const letter of GROUP_LETTERS) {
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const actual = results[f.id];
      if (actual) {
        fullResults[f.id] = {
          home: f.homeIdx, away: f.awayIdx,
          homeScore: actual.homeScore,
          awayScore: actual.awayScore,
        };
      }
    }
  }

  // Add predicted results for remaining fixtures
  for (const rp of rem.predictions) {
    const [gl, num] = [rp.fixture[0], parseInt(rp.fixture.slice(2))];
    const fixtures = getGroupFixtures(gl);
    const f = fixtures[num - 1];
    fullResults[rp.fixture] = {
      home: f.homeIdx, away: f.awayIdx,
      homeScore: rp.homeScore,
      awayScore: rp.awayScore,
    };
  }

  // Standings & R32
  const standings = {};
  for (const l of GROUP_LETTERS) {
    standings[l] = computeGroupStandings(l, fullResults);
  }

  const { qualifyingGroups, qualified } = getBestThirdPlaced(fullResults);
  const sd = rem.sd;
  const r32 = generateRoundOf32(fullResults);

  const r32results = {};
  for (const m of r32) {
    if (m.homeName === 'TBD' || m.awayName === 'TBD') continue;
    const p = knockoutPredict(m.homeName, m.awayName, sd);
    r32results[m.id] = { ...m, homeScore: p.homeScore, awayScore: p.awayScore };
  }

  // Propagate through rounds
  const prevKo = { ...fullResults, ...r32results };

  function simRound(roundId, matchups, useLosers) {
    return matchups.map(m => {
      const hp = prevKo[m.prev[0]];
      const ap = prevKo[m.prev[1]];
      let hn = 'TBD', an = 'TBD';
      if (hp) hn = useLosers ? (hp.homeScore > hp.awayScore ? hp.awayName : hp.homeName) : (hp.homeScore > hp.awayScore ? hp.homeName : hp.awayName);
      if (ap) an = useLosers ? (ap.homeScore > ap.awayScore ? ap.awayName : ap.homeName) : (ap.homeScore > ap.awayScore ? ap.homeName : ap.awayName);
      return { id: m.id, label: m.label, homeName: hn, awayName: an };
    });
  }

  const r16m = simRound('R16', R16_MATCHUPS, false);
  const r16results = {};
  for (const m of r16m) {
    if (m.homeName === 'TBD' || m.awayName === 'TBD') continue;
    const p = knockoutPredict(m.homeName, m.awayName, sd);
    r16results[m.id] = { ...m, homeScore: p.homeScore, awayScore: p.awayScore };
  }
  Object.assign(prevKo, r16results);

  const qfm = simRound('QF', QF_MATCHUPS, false);
  const qfresults = {};
  for (const m of qfm) {
    if (m.homeName === 'TBD' || m.awayName === 'TBD') continue;
    const p = knockoutPredict(m.homeName, m.awayName, sd);
    qfresults[m.id] = { ...m, homeScore: p.homeScore, awayScore: p.awayScore };
  }
  Object.assign(prevKo, qfresults);

  const sfm = simRound('SF', SF_MATCHUPS, false);
  const sfresults = {};
  for (const m of sfm) {
    if (m.homeName === 'TBD' || m.awayName === 'TBD') continue;
    const p = knockoutPredict(m.homeName, m.awayName, sd);
    sfresults[m.id] = { ...m, homeScore: p.homeScore, awayScore: p.awayScore };
  }
  Object.assign(prevKo, sfresults);

  const finalResults = {};
  const thirdResults = {};
  for (const m of FINAL_MATCHUPS) {
    const hp = prevKo[m.prev[0]];
    const ap = prevKo[m.prev[1]];
    if (!hp || !ap) continue;
    const hn = m.useLosers ? (hp.homeScore > hp.awayScore ? hp.awayName : hp.homeName) : (hp.homeScore > hp.awayScore ? hp.homeName : hp.awayName);
    const an = m.useLosers ? (ap.homeScore > ap.awayScore ? ap.awayName : ap.homeName) : (ap.homeScore > ap.awayScore ? ap.homeName : ap.awayName);
    if (hn === 'TBD' || an === 'TBD') continue;
    const p = knockoutPredict(hn, an, sd);
    const target = m.id === 'THIRD' ? thirdResults : finalResults;
    target[m.id] = { id: m.id, label: m.label, homeName: hn, awayName: an, homeScore: p.homeScore, awayScore: p.awayScore };
  }
  const champ = finalResults['FINAL'];
  const championName = champ ? (champ.homeScore > champ.awayScore ? champ.homeName : champ.awayName) : 'TBD';

  // Switzerland tracking
  let swissRound = 'Group Stage';
  let swissGoals = 0;
  const swissStanding = standings['B']?.find(t => t.name === 'Switzerland');
  if (swissStanding) {
    swissGoals = swissStanding.gf;
    const pos = standings['B'].indexOf(swissStanding);
    if (pos <= 1 || qualified.some(t => t.name === 'Switzerland')) {
      const swissR32 = r32.find(m => m.homeName === 'Switzerland' || m.awayName === 'Switzerland');
      if (swissR32) {
        const r = r32results[swissR32.id];
        if (r) {
          const sg = swissR32.homeName === 'Switzerland' ? r.homeScore : r.awayScore;
          swissGoals += sg;
          if ((swissR32.homeName === 'Switzerland' && r.homeScore > r.awayScore) || (swissR32.awayName === 'Switzerland' && r.awayScore > r.homeScore)) {
            swissRound = 'Round of 16';
            const swissR16obj = Object.values(r16results).find(m => m.homeName === 'Switzerland' || m.awayName === 'Switzerland');
            if (swissR16obj) {
              const r2 = r16results[swissR16obj.id];
              if (r2) {
                const sg2 = swissR16obj.homeName === 'Switzerland' ? r2.homeScore : r2.awayScore;
                swissGoals += sg2;
                if ((swissR16obj.homeName === 'Switzerland' && r2.homeScore > r2.awayScore) || (swissR16obj.awayName === 'Switzerland' && r2.awayScore > r2.homeScore)) {
                  swissRound = 'Quarter-finals';
                  const swissQF = Object.values(qfresults).find(m => m.homeName === 'Switzerland' || m.awayName === 'Switzerland');
                  if (swissQF) {
                    const r3 = qfresults[swissQF.id];
                    if (r3) {
                      const sg3 = swissQF.homeName === 'Switzerland' ? r3.homeScore : r3.awayScore;
                      swissGoals += sg3;
                      if ((swissQF.homeName === 'Switzerland' && r3.homeScore > r3.awayScore) || (swissQF.awayName === 'Switzerland' && r3.awayScore > r3.homeScore)) {
                        swissRound = 'Semi-finals';
                      }
                    }
                  }
                }
              }
            }
          } else {
            swissRound = 'Round of 32';
          }
        }
      }
    }
  }

  return {
    champion: championName,
    switzerlandRound: swissRound,
    switzerlandGoals: swissGoals,
    topScorerGoals: Math.min(10, Math.max(3, Math.round(sd.totalGoals * 0.025 + 1))),
    standings,
    groupPredictions: rem.predictions,
    r32, r32results,
    r16: Object.values(r16results).map(r => ({ id: r.id, homeName: r.homeName, awayName: r.awayName })),
    r16results,
    qf: Object.values(qfresults).map(r => ({ id: r.id, homeName: r.homeName, awayName: r.awayName })),
    qfresults,
    sf: Object.values(sfresults).map(r => ({ id: r.id, homeName: r.homeName, awayName: r.awayName })),
    sfresults,
    finals: Object.values(finalResults).map(r => ({ id: r.id, homeName: r.homeName, awayName: r.awayName })),
    finalResults,
    third: Object.values(thirdResults).map(r => ({ id: r.id, homeName: r.homeName, awayName: r.awayName })),
    thirdResults,
    sd,
  };
}

// ── Model comparison vs v1, v2 ────────────────────────────────

export function getModelComparison(groups, results) {
  const v5 = evaluateModel(groups, results);

  // Evaluate v1 (rank-threshold model from strategicPredictor.js)
  let v1total = 0;
  const v1details = [];
  for (const letter of GROUP_LETTERS) {
    const group = groups[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const actual = results[f.id];
      if (!actual) continue;
      const home = group.teams[f.homeIdx];
      const away = group.teams[f.awayIdx];
      const gap = (home.rank - 3) - away.rank;
      const absGap = Math.abs(gap);
      let pH, pA;
      if (absGap >= 20) { pH = gap < 0 ? 3 : 0; pA = gap < 0 ? 0 : 3; }
      else if (absGap >= 8) { pH = gap < 0 ? 2 : 0; pA = gap < 0 ? 0 : 2; }
      else if (absGap >= 3) { pH = gap < 0 ? 2 : 1; pA = gap < 0 ? 1 : 2; }
      else if (absGap >= 1) { pH = gap < 0 ? 1 : 0; pA = gap < 0 ? 0 : 1; }
      else { pH = 1; pA = 1; }

      const aH = actual.homeScore; const aA = actual.awayScore;
      let pts = 0;
      if (Math.sign(aH - aA) === Math.sign(pH - pA)) pts += 5;
      if (pH === aH) pts += 1;
      if (pA === aA) pts += 1;
      if ((pH - pA) === (aH - aA)) pts += 3;
      v1total += pts;
      v1details.push({ fixture: f.id, home: home.name, away: away.name, actual: `${aH}-${aA}`, predicted: `${pH}-${pA}`, points: pts });
    }
  }

  // Helper: get v2 prediction for a fixture
  function getV2Pred(group, f) {
    const home = group.teams[f.homeIdx];
    const away = group.teams[f.awayIdx];
    const gap = (home.rank - 3) - away.rank;
    const absGap = Math.abs(gap);
    const hf = gap < 0;
    let pH, pA;
    if (absGap >= 60) { pH = hf ? 5 : 0; pA = hf ? 0 : 5; }
    else if (absGap >= 50) { pH = hf ? 4 : 0; pA = hf ? 0 : 4; }
    else if (absGap >= 20) { pH = hf ? 3 : 0; pA = hf ? 0 : 3; }
    else if (absGap >= 8) { pH = hf ? 2 : 0; pA = hf ? 0 : 2; }
    else if (absGap >= 3) { pH = hf ? 2 : 1; pA = hf ? 1 : 2; }
    else if (absGap >= 1) { pH = hf ? 1 : 0; pA = hf ? 0 : 1; }
    else { pH = 1; pA = 1; }
    return { homeScore: pH, awayScore: pA };
  }

  // v2 (extended thresholds from strategicPredictor2.js)
  let v2total = 0;
  const v2details = [];
  for (const letter of GROUP_LETTERS) {
    const group = groups[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const actual = results[f.id];
      const pred = getV2Pred(group, f);
      const home = group.teams[f.homeIdx];
      const away = group.teams[f.awayIdx];
      if (actual) {
        const pts = srfPoints(pred.homeScore, pred.awayScore, actual.homeScore, actual.awayScore);
        v2total += pts;
        v2details.push({ fixture: f.id, home: home.name, away: away.name, actual: `${actual.homeScore}-${actual.awayScore}`, predicted: `${pred.homeScore}-${pred.awayScore}`, points: pts });
      }
    }
  }

  // Evaluate v3 (probabilistic from prediction.js) and v4 (heuristic from prediction4.js)
  function evalModel(matchResults) {
    let total = 0;
    for (const [fid, r] of Object.entries(matchResults)) {
      const actual = results[fid];
      if (!actual) continue;
      if (r.homeScore == null || r.awayScore == null) continue;
      const pts = srfPoints(r.homeScore, r.awayScore, actual.homeScore, actual.awayScore);
      total += pts;
    }
    return total;
  }

  const v3pred = v3(42);
  const v4pred = v4(42);
  const v3total = evalModel(v3pred.matchResults);
  const v4total = evalModel(v4pred.matchResults);

  const played = countPlayed(results);
  const maxPts = played * 10;
  return {
    v5: { total: v5.totalPts, pct: v5.pct, outcomeOk: v5.outcomeOk, exactOk: v5.exactOk, gdOk: v5.gdOk, homeGoalsOk: v5.homeGoalsOk, awayGoalsOk: v5.awayGoalsOk },
    v1: { total: v1total, pct: maxPts > 0 ? ((v1total / maxPts) * 100).toFixed(1) : '0.0' },
    v2: { total: v2total, pct: maxPts > 0 ? ((v2total / maxPts) * 100).toFixed(1) : '0.0' },
    v3: { total: v3total, pct: maxPts > 0 ? ((v3total / maxPts) * 100).toFixed(1) : '0.0' },
    v4: { total: v4total, pct: maxPts > 0 ? ((v4total / maxPts) * 100).toFixed(1) : '0.0' },
    maxPts, played,
    details: v5.details,
    v1details,
    v2details,
    allPredictions: { v3: v3pred.matchResults, v4: v4pred.matchResults },
  };
}

function srfPoints(pH, pA, aH, aA) {
  let pts = 0;
  if (Math.sign(aH - aA) === Math.sign(pH - pA)) pts += 5;
  if (pH === aH) pts += 1;
  if (pA === aA) pts += 1;
  if ((pH - pA) === (aH - aA)) pts += 3;
  return pts;
}

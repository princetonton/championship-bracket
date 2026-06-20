import { GROUPS, GROUP_LETTERS } from '../data/groups.js';
import { getGroupFixtures } from '../data/fixtures.js';
import { R16_MATCHUPS, QF_MATCHUPS, SF_MATCHUPS, FINAL_MATCHUPS } from '../data/bracket.js';
import { computeGroupStandings } from './standings.js';
import { getBestThirdPlaced } from './qualification.js';
import { generateRoundOf32 } from './bracketLogic.js';

function poissonProb(lambda, k) {
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

const HOSTS = new Set(['Mexico', 'Canada', 'USA']);

function predictMatchScore(rankHome, rankAway, ptsHome, ptsAway, isKnockout, homeName = '') {
  const MEAN_PTS = 1579.7;
  const BASE_RATE = 1.55;
  const BETA = 1.0;
  const HOME_ADV = isKnockout ? 1.0 : (HOSTS.has(homeName) ? 1.2 : 1.0);

  const lambdaHome = BASE_RATE * Math.pow(ptsHome / MEAN_PTS, BETA) * HOME_ADV;
  const lambdaAway = BASE_RATE * Math.pow(ptsAway / MEAN_PTS, BETA);

  const MAX = 10;
  const ph = [];
  const pa = [];
  for (let i = 0; i <= MAX; i++) {
    ph[i] = poissonProb(lambdaHome, i);
    pa[i] = poissonProb(lambdaAway, i);
  }

  let pHomeWin = 0, pDraw = 0, pAwayWin = 0;
  const gdProbs = {};
  for (let h = 0; h <= MAX; h++) {
    for (let a = 0; a <= MAX; a++) {
      const p = ph[h] * pa[a];
      if (h > a) pHomeWin += p;
      else if (h === a) pDraw += p;
      else pAwayWin += p;
      const gd = h - a;
      gdProbs[gd] = (gdProbs[gd] || 0) + p;
    }
  }

  let bestEV = -1, bestH = 1, bestA = 1;
  for (let h = 0; h <= MAX; h++) {
    for (let a = 0; a <= MAX; a++) {
      if (isKnockout && h === a) continue;
      if (h === 0 && a === 0) continue;
      const outcomeProb = h > a ? pHomeWin : h === a ? pDraw : pAwayWin;
      const outcomePts = isKnockout ? 10 : 5;
      const goalPts = isKnockout ? 2 : 1;
      const gdPts = isKnockout ? 6 : 3;
      const ev = outcomePts * outcomeProb + goalPts * ph[h] + goalPts * pa[a] + gdPts * (gdProbs[h - a] || 0);
      if (ev > bestEV) {
        bestEV = ev;
        bestH = h;
        bestA = a;
      }
    }
  }

  return [bestH, bestA];
}

function getTeamPts(name) {
  if (!name || name === 'TBD') return 1500;
  for (const l of GROUP_LETTERS) {
    const t = GROUPS[l].teams.find(t => t.name === name);
    if (t) return t.pts;
  }
  return 1500;
}

function getTeamRank(name) {
  if (!name || name === 'TBD') return 50;
  for (const l of GROUP_LETTERS) {
    const t = GROUPS[l].teams.find(t => t.name === name);
    if (t) return t.rank;
  }
  return 50;
}

function simulateKnockoutRound(roundId, prevResults) {
  let matchups;
  if (roundId === 'R16') matchups = R16_MATCHUPS;
  else if (roundId === 'QF') matchups = QF_MATCHUPS;
  else if (roundId === 'SF') matchups = SF_MATCHUPS;
  else if (roundId === 'FINAL') matchups = FINAL_MATCHUPS;
  else return { matches: [], results: {} };

  const matches = matchups.map(m => {
    const homePrev = prevResults[m.prev[0]];
    const awayPrev = prevResults[m.prev[1]];
    let homeName = 'TBD', awayName = 'TBD';

    if (homePrev) {
      if (m.useLosers) {
        homeName = homePrev.homeScore > homePrev.awayScore ? homePrev.awayName : homePrev.homeName;
      } else {
        homeName = homePrev.homeScore > homePrev.awayScore ? homePrev.homeName : homePrev.awayName;
      }
    }
    if (awayPrev) {
      if (m.useLosers) {
        awayName = awayPrev.homeScore > awayPrev.awayScore ? awayPrev.awayName : awayPrev.homeName;
      } else {
        awayName = awayPrev.homeScore > awayPrev.awayScore ? awayPrev.homeName : awayPrev.awayName;
      }
    }

    return { id: m.id, label: m.label, homeName, awayName };
  });

  const results = {};
  for (const m of matches) {
    const homePts = getTeamPts(m.homeName);
    const awayPts = getTeamPts(m.awayName);
    const homeRank = getTeamRank(m.homeName);
    const awayRank = getTeamRank(m.awayName);
    const [homeScore, awayScore] = predictMatchScore(homeRank, awayRank, homePts, awayPts, true);
    results[m.id] = { ...m, homeScore, awayScore };
  }
  return { matches, results };
}

function advanceSwiss(matches, results, currentRound, nextRound, goalsSoFar) {
  const swissMatch = matches.find(m => m.homeName === 'Switzerland' || m.awayName === 'Switzerland');
  if (!swissMatch) return { nextRound: currentRound, goals: goalsSoFar };

  const result = results[swissMatch.id];
  if (!result) return { nextRound: currentRound, goals: goalsSoFar };

  const scored = swissMatch.homeName === 'Switzerland' ? result.homeScore : result.awayScore;
  const won = (swissMatch.homeName === 'Switzerland' && result.homeScore > result.awayScore) ||
              (swissMatch.awayName === 'Switzerland' && result.awayScore > result.homeScore);

  return {
    nextRound: won ? nextRound : currentRound,
    goals: goalsSoFar + (scored || 0),
  };
}

export function generateProbabilisticPredictions() {
  const matchResults = {};

  for (const letter of GROUP_LETTERS) {
    const group = GROUPS[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const homeTeam = group.teams[f.homeIdx];
      const awayTeam = group.teams[f.awayIdx];
      const [homeScore, awayScore] = predictMatchScore(homeTeam.rank, awayTeam.rank, homeTeam.pts, awayTeam.pts, false, homeTeam.name);
      matchResults[f.id] = {
        home: f.homeIdx, away: f.awayIdx,
        homeScore, awayScore,
      };
    }
  }

  const standings = {};
  for (const letter of GROUP_LETTERS) {
    standings[letter] = computeGroupStandings(letter, matchResults);
  }

  const { qualified: qualifiedThird } = getBestThirdPlaced(matchResults);
  const r32 = generateRoundOf32(matchResults);

  const prevResults = { ...matchResults };
  let totalResults = { ...matchResults };

  const r32results = {};
  for (const m of r32) {
    const homePts = getTeamPts(m.homeName);
    const awayPts = getTeamPts(m.awayName);
    const homeRank = getTeamRank(m.homeName);
    const awayRank = getTeamRank(m.awayName);
    const [homeScore, awayScore] = predictMatchScore(homeRank, awayRank, homePts, awayPts, true);
    r32results[m.id] = { ...m, homeScore, awayScore };
  }
  Object.assign(prevResults, r32results);
  Object.assign(totalResults, r32results);

  const { matches: r16, results: r16results } = simulateKnockoutRound('R16', prevResults);
  Object.assign(prevResults, r16results);
  Object.assign(totalResults, r16results);

  const { matches: qf, results: qfresults } = simulateKnockoutRound('QF', prevResults);
  Object.assign(prevResults, qfresults);
  Object.assign(totalResults, qfresults);

  const { matches: sf, results: sfresults } = simulateKnockoutRound('SF', prevResults);
  Object.assign(prevResults, sfresults);
  Object.assign(totalResults, sfresults);

  const { matches: finals } = simulateKnockoutRound('FINAL', prevResults);
  const finalsWithScores = finals.map(m => {
    const homePts = getTeamPts(m.homeName);
    const awayPts = getTeamPts(m.awayName);
    const homeRank = getTeamRank(m.homeName);
    const awayRank = getTeamRank(m.awayName);
    const [homeScore, awayScore] = predictMatchScore(homeRank, awayRank, homePts, awayPts, true);
    return { ...m, homeScore, awayScore };
  });
  Object.assign(totalResults, Object.fromEntries(finalsWithScores.map(m => [m.id, m])));

  const champion = finalsWithScores.find(m => m.label === 'Final');
  const championName = champion
    ? (champion.homeScore > champion.awayScore ? champion.homeName : champion.awayName)
    : 'TBD';

  let swissRound = 'Group Stage';
  let swissGoals = 0;
  const swissGroup = 'B';
  const swissStanding = standings[swissGroup].find(t => t.name === 'Switzerland');

  if (swissStanding) {
    swissGoals += swissStanding.gf;
    const swissPos = standings[swissGroup].indexOf(swissStanding);
    if (swissPos <= 1 || qualifiedThird.find(t => t.name === 'Switzerland')) {
      swissRound = advanceSwiss(r32, r32results, 'Round of 32', 'Round of 16', swissGoals);
      swissGoals = swissRound.goals;
      if (swissRound.nextRound === 'Round of 16') {
        swissRound = advanceSwiss(r16, r16results, 'Round of 16', 'Quarter-finals', swissGoals);
        swissGoals = swissRound.goals;
        if (swissRound.nextRound === 'Quarter-finals') {
          swissRound = advanceSwiss(qf, qfresults, 'Quarter-finals', 'Semi-finals', swissGoals);
          swissGoals = swissRound.goals;
          if (swissRound.nextRound === 'Semi-finals') {
            swissRound = advanceSwiss(sf, sfresults, 'Semi-finals', 'Final', swissGoals);
            swissGoals = swissRound.goals;
            if (swissRound.nextRound === 'Final') {
              const swissFinal = finalsWithScores.find(m =>
                (m.homeName === 'Switzerland' || m.awayName === 'Switzerland') && m.label === 'Final'
              );
              if (swissFinal) {
                const g = swissFinal.homeName === 'Switzerland' ? swissFinal.homeScore : swissFinal.awayScore;
                swissGoals += g;
                const won = (swissFinal.homeName === 'Switzerland' && swissFinal.homeScore > swissFinal.awayScore) ||
                            (swissFinal.awayName === 'Switzerland' && swissFinal.awayScore > swissFinal.homeScore);
                swissRound = { nextRound: won ? 'Champion' : 'Final', goals: swissGoals };
              }
            }
          }
        }
      }
    }
  }

  let zeroZero = 0;
  let totalGoals = 0;
  for (const key in totalResults) {
    const r = totalResults[key];
    if (r.homeScore === 0 && r.awayScore === 0) zeroZero++;
    totalGoals += (r.homeScore || 0) + (r.awayScore || 0);
  }

  const topScorerGoals = Math.min(10, Math.max(3, Math.round(totalGoals * 0.025 + 1)));

  return {
    champion: championName,
    switzerlandRound: swissRound.nextRound || 'Group Stage',
    switzerlandGoals: swissGoals,
    topScorerGoals,
    zeroZeroMatches: zeroZero,
    matchResults,
    standings,
    r32, r32results,
    r16, r16results,
    qf, qfresults,
    sf, sfresults,
    finals: finalsWithScores,
  };
}

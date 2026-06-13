import { GROUPS, GROUP_LETTERS } from '../data/groups.js';
import { getGroupFixtures } from '../data/fixtures.js';
import { R16_MATCHUPS, QF_MATCHUPS, SF_MATCHUPS, FINAL_MATCHUPS } from '../data/bracket.js';
import { computeGroupStandings } from './standings.js';
import { getBestThirdPlaced } from './qualification.js';
import { generateRoundOf32 } from './bracketLogic.js';

const HOME_ADVANTAGE_RANK = 3;

function getEffectiveRank(rank, pts) {
  return rank;
}

function predictMatchScore(rankHome, rankAway, isKnockout) {
  const effectiveHome = isKnockout ? rankHome : rankHome - HOME_ADVANTAGE_RANK;
  const gap = effectiveHome - rankAway;

  const absGap = Math.abs(gap);

  if (absGap >= 20) {
    if (gap < 0) return { homeScore: 3, awayScore: 0 };
    return { homeScore: 0, awayScore: 3 };
  }

  if (absGap >= 8) {
    if (gap < 0) return { homeScore: 2, awayScore: 0 };
    return { homeScore: 0, awayScore: 2 };
  }

  if (absGap >= 3) {
    if (gap < 0) return { homeScore: 2, awayScore: 1 };
    return { homeScore: 1, awayScore: 2 };
  }

  if (absGap >= 1) {
    if (gap < 0) return { homeScore: 1, awayScore: 0 };
    return { homeScore: 0, awayScore: 1 };
  }

  return { homeScore: 1, awayScore: 1 };
}

function getTeamRank(name) {
  if (!name || name === 'TBD') return 99;
  for (const l of GROUP_LETTERS) {
    const t = GROUPS[l].teams.find(t => t.name === name);
    if (t) return t.rank;
  }
  return 99;
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
    const homeRank = getTeamRank(m.homeName);
    const awayRank = getTeamRank(m.awayName);
    const score = predictMatchScore(homeRank, awayRank, true);
    results[m.id] = { ...m, homeScore: score.homeScore, awayScore: score.awayScore };
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

export function generateStrategicPredictions() {
  const matchResults = {};

  for (const letter of GROUP_LETTERS) {
    const group = GROUPS[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const homeTeam = group.teams[f.homeIdx];
      const awayTeam = group.teams[f.awayIdx];
      const score = predictMatchScore(homeTeam.rank, awayTeam.rank, false);
      matchResults[f.id] = {
        home: f.homeIdx, away: f.awayIdx,
        homeScore: score.homeScore, awayScore: score.awayScore,
      };
    }
  }

  const standings = {};
  for (const letter of GROUP_LETTERS) {
    standings[letter] = computeGroupStandings(letter, matchResults);
  }

  const { qualifyingGroups, qualified: qualifiedThird } = getBestThirdPlaced(matchResults);
  const r32 = generateRoundOf32(matchResults);

  const prevResults = { ...matchResults };
  let totalResults = { ...matchResults };

  const r32results = {};
  for (const m of r32) {
    const homeRank = getTeamRank(m.homeName);
    const awayRank = getTeamRank(m.awayName);
    const score = predictMatchScore(homeRank, awayRank, true);
    r32results[m.id] = { ...m, homeScore: score.homeScore, awayScore: score.awayScore };
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
    const homeRank = getTeamRank(m.homeName);
    const awayRank = getTeamRank(m.awayName);
    const score = predictMatchScore(homeRank, awayRank, true);
    return { ...m, homeScore: score.homeScore, awayScore: score.awayScore };
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

  let totalGoals = 0;
  for (const key in totalResults) {
    const r = totalResults[key];
    totalGoals += (r.homeScore || 0) + (r.awayScore || 0);
  }

  const zeroZero = Math.round(104 * 0.085);
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

export function printPredictions(prediction) {
  console.log('=== STRATEGIC PREDICTIONS — SRF Tippspiel Optimized ===\n');

  console.log(`🏆 Champion: ${prediction.champion}`);
  console.log(`🇨🇭 Switzerland: ${prediction.switzerlandRound} (${prediction.switzerlandGoals} goals)`);
  console.log(`⚽ Top Scorer: ~${prediction.topScorerGoals} goals`);
  console.log(`🫏 0-0 Matches: ${prediction.zeroZeroMatches}\n`);

  console.log('--- Group Stage ---\n');
  for (const letter of GROUP_LETTERS) {
    const group = GROUPS[letter];
    const fixtures = getGroupFixtures(letter);
    console.log(`Group ${letter}:`);
    for (const f of fixtures) {
      const r = prediction.matchResults[f.id];
      const home = group.teams[f.homeIdx].name;
      const away = group.teams[f.awayIdx].name;
      console.log(`  ${f.id}: ${home} ${r.homeScore}-${r.awayScore} ${away}`);
    }
    console.log('');
  }

  console.log('--- Knockout Stage ---\n');

  for (const [roundName, matches] of [['R32', prediction.r32results], ['R16', prediction.r16results], ['QF', prediction.qfresults], ['SF', prediction.sfresults]]) {
    console.log(`${roundName}:`);
    for (const key in matches) {
      const m = matches[key];
      const score = `${m.homeScore}-${m.awayScore}`;
      const winner = m.homeScore > m.awayScore ? m.homeName : m.awayName;
      console.log(`  ${m.id}: ${m.homeName} ${score} ${m.awayName} → ${winner}`);
    }
    console.log('');
  }

  console.log('Finals:');
  for (const m of prediction.finals) {
    const score = `${m.homeScore}-${m.awayScore}`;
    const winner = m.homeScore > m.awayScore ? m.homeName : m.awayName;
    const loser = m.homeScore > m.awayScore ? m.awayName : m.homeName;
    if (m.label === 'Final') {
      console.log(`  ${m.label}: ${m.homeName} ${score} ${m.awayName} → 🏆 ${winner}`);
    } else {
      console.log(`  ${m.label}: ${m.homeName} ${score} ${m.awayName} → ${winner} beats ${loser}`);
    }
  }
  console.log('');
}

export function getPointsSummary(prediction) {
  let groupPts = 0;
  for (const letter of GROUP_LETTERS) {
    const group = GROUPS[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const r = prediction.matchResults[f.id];
      const home = group.teams[f.homeIdx];
      const away = group.teams[f.awayIdx];
      const scored = `${home.name} ${r.homeScore}-${r.awayScore} ${away.name}`;
      groupPts += 10;
    }
  }
  const koMatches = Object.keys(prediction.r32results).length * 10
    + Object.keys(prediction.r16results).length * 10
    + Object.keys(prediction.qfresults).length * 10
    + Object.keys(prediction.sfresults).length * 10
    + prediction.finals.length * 10;
  const bonus = 50 + 20 + 20 + 20 + 20;

  return {
    maxGroupStage: 72 * 10,
    maxKnockout: koMatches,
    maxBonus: bonus,
    totalMax: 72 * 10 + koMatches + bonus,
  };
}

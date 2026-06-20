import { GROUPS, GROUP_LETTERS } from '../data/groups.js';
import { getGroupFixtures } from '../data/fixtures.js';
import { R16_MATCHUPS, QF_MATCHUPS, SF_MATCHUPS, FINAL_MATCHUPS } from '../data/bracket.js';
import { computeGroupStandings } from './standings.js';
import { getBestThirdPlaced } from './qualification.js';
import { generateRoundOf32 } from './bracketLogic.js';

function predictMatchScore(rankHome, rankAway, isKnockout) {
  const HOME_ADV = isKnockout ? 0 : 3;
  const gap = (rankHome - HOME_ADV) - rankAway;
  const absGap = Math.abs(gap);
  const homeFavored = gap < 0;

  // v2.2: v1 proven thresholds + 4-0 at ≥50, 5-0 at ≥60
  if (absGap >= 60) return homeFavored ? [5, 0] : [0, 5];
  if (absGap >= 50) return homeFavored ? [4, 0] : [0, 4];
  // v1 baseline (scored 76/280 pts on 28 played matches)
  if (absGap >= 20) return homeFavored ? [3, 0] : [0, 3];
  if (absGap >= 8)  return homeFavored ? [2, 0] : [0, 2];
  if (absGap >= 3)  return homeFavored ? [2, 1] : [1, 2];
  if (absGap >= 1)  return homeFavored ? [1, 0] : [0, 1];

  return [1, 1];
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
    const [homeScore, awayScore] = predictMatchScore(homeRank, awayRank, true);
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

export function generateStrategicPredictions2() {
  const matchResults = {};

  for (const letter of GROUP_LETTERS) {
    const group = GROUPS[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const homeTeam = group.teams[f.homeIdx];
      const awayTeam = group.teams[f.awayIdx];
      const [homeScore, awayScore] = predictMatchScore(homeTeam.rank, awayTeam.rank, false);
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
    const homeRank = getTeamRank(m.homeName);
    const awayRank = getTeamRank(m.awayName);
    const [homeScore, awayScore] = predictMatchScore(homeRank, awayRank, true);
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
    const homeRank = getTeamRank(m.homeName);
    const awayRank = getTeamRank(m.awayName);
    const [homeScore, awayScore] = predictMatchScore(homeRank, awayRank, true);
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

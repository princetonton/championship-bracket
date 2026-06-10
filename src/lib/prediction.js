import { GROUPS, GROUP_LETTERS } from '../data/groups.js';
import { getGroupFixtures } from '../data/fixtures.js';
import { R16_MATCHUPS, QF_MATCHUPS, SF_MATCHUPS, FINAL_MATCHUPS } from '../data/bracket.js';
import { computeGroupStandings } from './standings.js';
import { getBestThirdPlaced } from './qualification.js';
import { generateRoundOf32 } from './bracketLogic.js';

export function createRNG(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0x100000000;
  };
}

export function simulateMatch(homeTeam, awayTeam, rand) {
  const homeAdvantage = 30;
  const homeStrength = homeTeam.pts + homeAdvantage;
  const totalStrength = homeStrength + awayTeam.pts;
  const winProb = homeStrength / totalStrength;

  const roll = rand();
  const baseGoals = rand() * 5;
  const homeFactor = 1 + (homeTeam.pts - 1400) / 500;
  const awayFactor = 1 + (awayTeam.pts - 1400) / 500;

  let homeGoals, awayGoals;
  if (roll < winProb) {
    homeGoals = Math.min(5, Math.max(1, Math.round(baseGoals * homeFactor * 0.8 + rand() * 0.5)));
    awayGoals = Math.min(4, Math.max(0, Math.round((1 - roll / winProb) * 3 * awayFactor * 0.4)));
  } else {
    awayGoals = Math.min(5, Math.max(1, Math.round((roll - winProb) / (1 - winProb) * 5 * awayFactor * 0.8 + rand() * 0.5)));
    homeGoals = Math.min(4, Math.max(0, Math.round((1 - (roll - winProb) / (1 - winProb)) * 3 * homeFactor * 0.4)));
  }

  return { homeScore: homeGoals, awayScore: awayGoals };
}

function simulateNextRound(roundId, prevResults, rand, ptsLookup) {
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
        awayName = awayPrev.homeScore > awayPrev.awayScore ? awayPrev.awayName : awayPrev.homeName;
      }
    }

    return { id: m.id, label: m.label, homeName, awayName };
  });

  const results = {};
  for (const m of matches) {
    const homePts = ptsLookup ? (ptsLookup[m.homeName] || 1400) : getTeamPts(m.homeName);
    const awayPts = ptsLookup ? (ptsLookup[m.awayName] || 1400) : getTeamPts(m.awayName);
    const homeTeam = { name: m.homeName, pts: homePts };
    const awayTeam = { name: m.awayName, pts: awayPts };
    const result = simulateMatch(homeTeam, awayTeam, rand);
    results[m.id] = { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
  }

  return { matches, results };
}

export function getTeamPts(teamName) {
  if (!teamName || teamName === 'TBD') return 1400;
  for (const l of GROUP_LETTERS) {
    const t = GROUPS[l].teams.find(t => t.name === teamName);
    if (t) return t.pts;
  }
  return 1400;
}

export function predictKnockoutFromGroup(groupMatchResults, seed = Date.now()) {
  const rand = createRNG(seed);
  const standings = {};
  for (const letter of GROUP_LETTERS) {
    standings[letter] = computeGroupStandings(letter, groupMatchResults);
  }
  const { qualified: qualifiedThird } = getBestThirdPlaced(groupMatchResults);
  const r32 = generateRoundOf32(groupMatchResults);

  const prevResults = { ...groupMatchResults };
  let totalResults = { ...groupMatchResults };

  const r32results = {};
  for (const m of r32) {
    const homeTeam = { name: m.homeName, pts: getTeamPts(m.homeName) };
    const awayTeam = { name: m.awayName, pts: getTeamPts(m.awayName) };
    const result = simulateMatch(homeTeam, awayTeam, rand);
    r32results[m.id] = { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
  }
  Object.assign(prevResults, r32results);
  Object.assign(totalResults, r32results);

  const { matches: r16, results: r16results } = simulateNextRound('R16', prevResults, rand);
  Object.assign(prevResults, r16results);
  Object.assign(totalResults, r16results);

  const { matches: qf, results: qfresults } = simulateNextRound('QF', prevResults, rand);
  Object.assign(prevResults, qfresults);
  Object.assign(totalResults, qfresults);

  const { matches: sf, results: sfresults } = simulateNextRound('SF', prevResults, rand);
  Object.assign(prevResults, sfresults);
  Object.assign(totalResults, sfresults);

  const { matches: finals } = simulateNextRound('FINAL', prevResults, rand);
  const finalsWithScores = finals.map(m => {
    const homeTeam = { name: m.homeName, pts: getTeamPts(m.homeName) };
    const awayTeam = { name: m.awayName, pts: getTeamPts(m.awayName) };
    const result = simulateMatch(homeTeam, awayTeam, rand);
    return { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
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
  for (const key in totalResults) {
    if (totalResults[key].homeScore === 0 && totalResults[key].awayScore === 0) zeroZero++;
  }

  const topScorerGoals = Math.min(10, Math.max(3, Math.round(4 + rand() * 4)));

  return {
    champion: championName,
    switzerlandRound: swissRound.nextRound || 'Group Stage',
    switzerlandGoals: swissGoals,
    topScorerGoals,
    zeroZeroMatches: zeroZero,
    r32, r32results,
    r16, r16results,
    qf, qfresults,
    sf, sfresults,
    finals: finalsWithScores,
  };
}

export function generatePredictions(seed = 42) {
  const rand = createRNG(seed);
  const matchResults = {};

  for (const letter of GROUP_LETTERS) {
    const group = GROUPS[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const homeTeam = group.teams[f.homeIdx];
      const awayTeam = group.teams[f.awayIdx];
      const result = simulateMatch(homeTeam, awayTeam, rand);
      matchResults[f.id] = {
        home: f.homeIdx, away: f.awayIdx,
        homeScore: result.homeScore, awayScore: result.awayScore,
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
    const homeTeam = { name: m.homeName, pts: getTeamPts(m.homeName) };
    const awayTeam = { name: m.awayName, pts: getTeamPts(m.awayName) };
    const result = simulateMatch(homeTeam, awayTeam, rand);
    r32results[m.id] = { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
  }
  Object.assign(prevResults, r32results);
  Object.assign(totalResults, r32results);

  const { matches: r16, results: r16results } = simulateNextRound('R16', prevResults, rand);
  Object.assign(prevResults, r16results);
  Object.assign(totalResults, r16results);

  const { matches: qf, results: qfresults } = simulateNextRound('QF', prevResults, rand);
  Object.assign(prevResults, qfresults);
  Object.assign(totalResults, qfresults);

  const { matches: sf, results: sfresults } = simulateNextRound('SF', prevResults, rand);
  Object.assign(prevResults, sfresults);
  Object.assign(totalResults, sfresults);

  const { matches: finals } = simulateNextRound('FINAL', prevResults, rand);
  // For finals, we need the results in the matches array directly
  const finalsWithScores = finals.map(m => {
    const homeTeam = { name: m.homeName, pts: getTeamPts(m.homeName) };
    const awayTeam = { name: m.awayName, pts: getTeamPts(m.awayName) };
    const result = simulateMatch(homeTeam, awayTeam, rand);
    return { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
  });
  Object.assign(totalResults, Object.fromEntries(finalsWithScores.map(m => [m.id, m])));

  const champion = finalsWithScores.find(m => m.label === 'Final');
  const championName = champion
    ? (champion.homeScore > champion.awayScore ? champion.homeName : champion.awayName)
    : 'TBD';

  // Switzerland analysis
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

  // Count 0-0 draws
  let zeroZero = 0;
  for (const key in totalResults) {
    if (totalResults[key].homeScore === 0 && totalResults[key].awayScore === 0) zeroZero++;
  }

  const topScorerGoals = Math.min(10, Math.max(3, Math.round(4 + rand() * 4)));

  return {
    champion: championName,
    switzerlandRound: swissRound.nextRound || 'Group Stage',
    switzerlandGoals: swissGoals,
    topScorerGoals,
    zeroZeroMatches: zeroZero,
    matchResults,
    standings,
    r32,
    r32results,
    r16,
    r16results,
    qf,
    qfresults,
    sf,
    sfresults,
    finals: finalsWithScores,
  };
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

export function deterministicPredictMatch(rankHome, rankAway) {
  if (rankHome === rankAway) return { homeScore: 1, awayScore: 1 };
  if (rankHome < rankAway) {
    const diff = rankAway - rankHome;
    return { homeScore: diff >= 10 ? 3 : 2, awayScore: 1 };
  }
  const diff = rankHome - rankAway;
  return { homeScore: 1, awayScore: diff >= 10 ? 3 : 2 };
}

export function getTeamRankLookup(rankSource, customRankings) {
  const lookup = {};
  for (const l of GROUP_LETTERS) {
    for (const t of GROUPS[l].teams) {
      if (rankSource === 'custom' && customRankings?.[t.name]?.rank != null) {
        lookup[t.name] = customRankings[t.name].rank;
      } else {
        lookup[t.name] = t.rank;
      }
    }
  }
  return lookup;
}

export function generateDeterministicPredictions(rankSource = 'fifa', customRanks = null) {
  const rankLookup = getTeamRankLookup(rankSource, customRanks);
  const matchResults = {};

  for (const letter of GROUP_LETTERS) {
    const group = GROUPS[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const homeTeam = group.teams[f.homeIdx];
      const awayTeam = group.teams[f.awayIdx];
      const result = deterministicPredictMatch(rankLookup[homeTeam.name], rankLookup[awayTeam.name]);
      matchResults[f.id] = {
        home: f.homeIdx, away: f.awayIdx,
        homeScore: result.homeScore, awayScore: result.awayScore,
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
    const result = deterministicPredictMatch(rankLookup[m.homeName] || 99, rankLookup[m.awayName] || 99);
    r32results[m.id] = { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
  }
  Object.assign(prevResults, r32results);
  Object.assign(totalResults, r32results);

  const { matches: r16, results: r16results } = deterministicNextRound('R16', prevResults, rankLookup);
  Object.assign(prevResults, r16results);
  Object.assign(totalResults, r16results);

  const { matches: qf, results: qfresults } = deterministicNextRound('QF', prevResults, rankLookup);
  Object.assign(prevResults, qfresults);
  Object.assign(totalResults, qfresults);

  const { matches: sf, results: sfresults } = deterministicNextRound('SF', prevResults, rankLookup);
  Object.assign(prevResults, sfresults);
  Object.assign(totalResults, sfresults);

  const { matches: finals } = deterministicNextRound('FINAL', prevResults, rankLookup);
  const finalsWithScores = finals.map(m => {
    const result = deterministicPredictMatch(rankLookup[m.homeName] || 99, rankLookup[m.awayName] || 99);
    return { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
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

function deterministicNextRound(roundId, prevResults, rankLookup) {
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
    const result = deterministicPredictMatch(rankLookup[m.homeName] || 99, rankLookup[m.awayName] || 99);
    results[m.id] = { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
  }

  return { matches, results };
}

export function generateSeededPredictions(seed, rankSource = 'fifa', customRanks = null, shuffleRanks = false) {
  const rand = createRNG(seed);
  const rankLookup = getTeamRankLookup(rankSource, customRanks);

  const ptsLookup = {};
  for (const l of GROUP_LETTERS) {
    for (const t of GROUPS[l].teams) {
      let basePts = t.pts;
      if (rankSource === 'custom' && customRanks?.[t.name]?.rank != null) {
        basePts = 1900 - customRanks[t.name].rank * 5;
      }
      if (shuffleRanks) {
        const teamSeed = (seed * 31 + t.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) >>> 0;
        const teamRand = createRNG(teamSeed);
        basePts = Math.round(basePts * (0.85 + teamRand() * 0.3));
      }
      ptsLookup[t.name] = Math.max(1200, Math.min(2000, basePts));
    }
  }

  function predictMatch(homeName, awayName) {
    return simulateMatch(
      { name: homeName, pts: ptsLookup[homeName] || 1400 },
      { name: awayName, pts: ptsLookup[awayName] || 1400 },
      rand
    );
  }

  const matchResults = {};
  for (const letter of GROUP_LETTERS) {
    const group = GROUPS[letter];
    const fixtures = getGroupFixtures(letter);
    for (const f of fixtures) {
      const homeTeam = group.teams[f.homeIdx];
      const awayTeam = group.teams[f.awayIdx];
      const result = predictMatch(homeTeam.name, awayTeam.name);
      matchResults[f.id] = {
        home: f.homeIdx, away: f.awayIdx,
        homeScore: result.homeScore, awayScore: result.awayScore,
      };
    }
  }

  const standings = {};
  for (const letter of GROUP_LETTERS) {
    standings[letter] = computeGroupStandings(letter, matchResults);
  }

  const { qualifyingGroups, qualified: qualifiedThird } = getBestThirdPlaced(matchResults);
  const r32 = generateRoundOf32(matchResults);

  const r32results = {};
  for (const m of r32) {
    const result = predictMatch(m.homeName, m.awayName);
    r32results[m.id] = { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
  }

  const prevResults = { ...matchResults, ...r32results };
  let totalResults = { ...matchResults, ...r32results };

  const { matches: r16, results: r16results } = simulateNextRound('R16', prevResults, rand, ptsLookup);
  Object.assign(prevResults, r16results);
  Object.assign(totalResults, r16results);

  const { matches: qf, results: qfresults } = simulateNextRound('QF', prevResults, rand, ptsLookup);
  Object.assign(prevResults, qfresults);
  Object.assign(totalResults, qfresults);

  const { matches: sf, results: sfresults } = simulateNextRound('SF', prevResults, rand, ptsLookup);
  Object.assign(prevResults, sfresults);
  Object.assign(totalResults, sfresults);

  const { matches: finals } = simulateNextRound('FINAL', prevResults, rand, ptsLookup);
  const finalsWithScores = finals.map(m => {
    const result = predictMatch(m.homeName, m.awayName);
    return { ...m, homeScore: result.homeScore, awayScore: result.awayScore };
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

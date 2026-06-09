import { GROUPS } from '../data/groups.js';
import { COMBINATIONS } from '../data/combinations.js';
import { R32_FIXED, R16_MATCHUPS, QF_MATCHUPS, SF_MATCHUPS, FINAL_MATCHUPS, THIRD_PLACE_SLOTS } from '../data/bracket.js';
import { computeGroupStandings } from './standings.js';
import { getBestThirdPlaced } from './qualification.js';

export function getStandingsMap(matchResults) {
  const map = {};
  const letters = 'ABCDEFGHIJKL';
  for (const l of letters) {
    map[l] = computeGroupStandings(l, matchResults);
  }
  return map;
}

export function resolveTeam(groupLetter, position, matchResults) {
  const standings = computeGroupStandings(groupLetter, matchResults);
  if (position === 'w') return standings[0];
  if (position === 'ru') return standings[1];
  if (position === 'third') return standings[2];
  return null;
}

export function resolveThirdPlaceTeam(slot, qualifyingGroups, matchResults) {
  const comboKey = qualifyingGroups.join('');
  const assignments = COMBINATIONS[comboKey];
  if (!assignments) return null;
  const groupLetter = assignments[slot - 1];
  if (!groupLetter) return null;
  const standings = computeGroupStandings(groupLetter, matchResults);
  return standings[2]; // third-placed team
}

export function generateRoundOf32(matchResults) {
  const { qualifyingGroups } = getBestThirdPlaced(matchResults);

  return R32_FIXED.map(m => {
    let homeTeam = null, awayTeam = null;

    if (m.home.type === 'w' || m.home.type === 'ru') {
      homeTeam = resolveTeam(m.home.group, m.home.type, matchResults);
    } else if (m.home.type === 'third') {
      homeTeam = resolveThirdPlaceTeam(m.home.slot, qualifyingGroups, matchResults);
    }

    if (m.away.type === 'w' || m.away.type === 'ru') {
      awayTeam = resolveTeam(m.away.group, m.away.type, matchResults);
    } else if (m.away.type === 'third') {
      awayTeam = resolveThirdPlaceTeam(m.away.slot, qualifyingGroups, matchResults);
    }

    return {
      id: m.id,
      label: m.label,
      homeName: homeTeam?.name || 'TBD',
      awayName: awayTeam?.name || 'TBD',
      homeGroup: homeTeam?.group || m.home.group,
      awayGroup: awayTeam?.group || m.away.group,
    };
  });
}

export function getRoundMatches(roundId, prevResults, allMatchResults) {
  let matchups;
  let roundName;
  if (roundId === 'R16') { matchups = R16_MATCHUPS; roundName = 'R16'; }
  else if (roundId === 'QF') { matchups = QF_MATCHUPS; roundName = 'QF'; }
  else if (roundId === 'SF') { matchups = SF_MATCHUPS; roundName = 'SF'; }
  else if (roundId === 'FINAL') { matchups = FINAL_MATCHUPS; roundName = 'F'; }
  else return [];

  return matchups.map(m => {
    const homePrev = m.prev[0];
    const awayPrev = m.prev[1];
    const homeResult = prevResults[homePrev];
    const awayResult = prevResults[awayPrev];

    let homeName = 'TBD', awayName = 'TBD';

    if (homeResult) {
      if (m.useLosers) {
        homeName = homeResult.homeScore > homeResult.awayScore ? homeResult.awayName : homeResult.homeName;
      } else {
        homeName = homeResult.homeScore > homeResult.awayScore ? homeResult.homeName : homeResult.awayName;
      }
    }
    if (awayResult) {
      if (m.useLosers) {
        awayName = awayResult.homeScore > awayResult.awayScore ? awayResult.awayName : awayResult.homeName;
      } else {
        awayName = awayResult.homeScore > awayResult.awayScore ? awayResult.homeName : awayResult.awayName;
      }
    }

    return {
      id: m.id,
      label: m.label,
      homeName,
      awayName,
    };
  });
}

export function allMatchesComplete(matchResults, matchIds) {
  for (const id of matchIds) {
    const r = matchResults[id];
    if (!r || r.homeScore == null || r.homeScore === '' || r.awayScore == null || r.awayScore === '') {
      return false;
    }
  }
  return true;
}

import { GROUPS } from '../data/groups.js';

export function computeGroupStandings(groupLetter, matchResults) {
  const group = GROUPS[groupLetter];
  const teams = group.teams.map(t => ({
    name: t.name,
    rank: t.rank,
    pts: t.pts,
    played: 0, w: 0, d: 0, l: 0,
    gf: 0, ga: 0, gd: 0, points: 0,
  }));

  const teamMap = {};
  teams.forEach((t, i) => { teamMap[i] = t; });

  const matchIds = ['_01','_02','_03','_04','_05','_06'];
  for (const suffix of matchIds) {
    const fixtureId = `${groupLetter}${suffix}`;
    const result = matchResults[fixtureId];
    if (result == null) continue;
    const { home, away, homeScore, awayScore } = result;
    if (homeScore == null || awayScore == null) continue;

    const ht = teamMap[home];
    const at = teamMap[away];

    ht.played++; at.played++;
    ht.gf += homeScore; ht.ga += awayScore;
    at.gf += awayScore; at.ga += homeScore;
    ht.gd = ht.gf - ht.ga;
    at.gd = at.gf - at.ga;

    if (homeScore > awayScore) {
      ht.w++; ht.points += 3;
      at.l++;
    } else if (homeScore < awayScore) {
      at.w++; at.points += 3;
      ht.l++;
    } else {
      ht.d++; ht.points += 1;
      at.d++; at.points += 1;
    }
  }

  // Sort by: points, h2h points, h2h gd, h2h gf, overall gd, overall gf, ranking
  teams.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;

    // Head-to-head among tied teams
    const tied = teams.filter(t =>
      t.points === a.points || t.points === b.points
    );
    if (tied.length === 2) {
      // Direct match between the two
      const matchKey = getMatchKey(groupLetter, tied, matchResults);
      if (matchKey) {
        const diff = matchKey.gfA - matchKey.gfB;
        if (diff !== 0) return diff;
      }
    } else if (tied.length > 2) {
      // Mini-table among tied teams
      const h2h = computeH2H(tied, groupLetter, matchResults);
      const diffA = (h2h[a.name]?.points || 0) - (h2h[b.name]?.points || 0);
      if (diffA !== 0) return diffA;
      const gdA = (h2h[a.name]?.gd || 0) - (h2h[b.name]?.gd || 0);
      if (gdA !== 0) return gdA;
      const gfA = (h2h[a.name]?.gf || 0) - (h2h[b.name]?.gf || 0);
      if (gfA !== 0) return gfA;
    }

    if (a.gd !== b.gd) return b.gd - a.gd;
    if (a.gf !== b.gf) return b.gf - a.gf;
    return a.rank - b.rank;
  });

  return teams;
}

function getMatchKey(groupLetter, tied, matchResults) {
  const names = tied.map(t => t.name);
  const suffixes = ['_01','_02','_03','_04','_05','_06'];
  for (const suf of suffixes) {
    const id = `${groupLetter}${suf}`;
    const r = matchResults[id];
    if (!r) continue;
    const homeTeam = GROUPS[groupLetter].teams[r.home].name;
    const awayTeam = GROUPS[groupLetter].teams[r.away].name;
    if (names.includes(homeTeam) && names.includes(awayTeam)) {
      const idxA = names.indexOf(homeTeam);
      const idxB = names.indexOf(awayTeam);
      return {
        gfA: idxA === 0 ? r.homeScore : r.awayScore,
        gfB: idxB === 1 ? r.homeScore : r.awayScore,
        homeTeam, awayTeam,
        homeScore: r.homeScore, awayScore: r.awayScore,
      };
    }
  }
  return null;
}

function computeH2H(tiedTeams, groupLetter, matchResults) {
  const result = {};
  tiedTeams.forEach(t => { result[t.name] = { points: 0, gf: 0, ga: 0, gd: 0 }; });

  const suffixes = ['_01','_02','_03','_04','_05','_06'];
  for (const suf of suffixes) {
    const id = `${groupLetter}${suf}`;
    const r = matchResults[id];
    if (!r) continue;
    const homeName = GROUPS[groupLetter].teams[r.home].name;
    const awayName = GROUPS[groupLetter].teams[r.away].name;
    if (result[homeName] && result[awayName]) {
      result[homeName].gf += r.homeScore;
      result[homeName].ga += r.awayScore;
      result[awayName].gf += r.awayScore;
      result[awayName].ga += r.homeScore;
      if (r.homeScore > r.awayScore) {
        result[homeName].points += 3;
      } else if (r.homeScore < r.awayScore) {
        result[awayName].points += 3;
      } else {
        result[homeName].points += 1;
        result[awayName].points += 1;
      }
    }
  }
  tiedTeams.forEach(t => { result[t.name].gd = result[t.name].gf - result[t.name].ga; });
  return result;
}

export function allGroupMatchesComplete(matchResults) {
  const letters = 'ABCDEFGHIJKL';
  for (const l of letters) {
    for (let i = 1; i <= 6; i++) {
      const id = `${l}_${String(i).padStart(2, '0')}`;
      const r = matchResults[id];
      if (!r || r.homeScore == null || r.homeScore === '' || r.awayScore == null || r.awayScore === '') {
        return false;
      }
    }
  }
  return true;
}

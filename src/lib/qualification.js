import { computeGroupStandings } from './standings.js';
import { GROUPS, GROUP_LETTERS } from '../data/groups.js';

export function getBestThirdPlaced(matchResults) {
  const thirdPlaced = [];
  for (const letter of GROUP_LETTERS) {
    const standings = computeGroupStandings(letter, matchResults);
    if (standings.length < 3) continue;
    const third = standings[2];
    third.group = letter;
    thirdPlaced.push(third);
  }

  thirdPlaced.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.gd !== b.gd) return b.gd - a.gd;
    if (a.gf !== b.gf) return b.gf - a.gf;
    return a.rank - b.rank;
  });

  const qualified = thirdPlaced.slice(0, 8);
  const qualifyingGroups = qualified.map(t => t.group).sort();

  return { qualified, qualifyingGroups, allThirdPlaced: thirdPlaced };
}

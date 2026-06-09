// 72 group stage fixtures: each group of 4 has 6 matches (round-robin)
// Indices: 0,1,2,3 → matches: 0v1, 2v3, 0v2, 1v3, 0v3, 1v2

export function getGroupFixtures(groupLetter) {
  return [
    { id: `${groupLetter}_01`, group: groupLetter, homeIdx: 0, awayIdx: 1, matchday: 1 },
    { id: `${groupLetter}_02`, group: groupLetter, homeIdx: 2, awayIdx: 3, matchday: 1 },
    { id: `${groupLetter}_03`, group: groupLetter, homeIdx: 0, awayIdx: 2, matchday: 2 },
    { id: `${groupLetter}_04`, group: groupLetter, homeIdx: 1, awayIdx: 3, matchday: 2 },
    { id: `${groupLetter}_05`, group: groupLetter, homeIdx: 0, awayIdx: 3, matchday: 3 },
    { id: `${groupLetter}_06`, group: groupLetter, homeIdx: 1, awayIdx: 2, matchday: 3 },
  ];
}

export function getAllFixtureIds() {
  const letters = 'ABCDEFGHIJKL';
  const ids = [];
  for (const l of letters) {
    for (let i = 1; i <= 6; i++) {
      ids.push(`${l}_${String(i).padStart(2, '0')}`);
    }
  }
  return ids;
}

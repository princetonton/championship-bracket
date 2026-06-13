export const RESULTS = {
  A_01: { homeScore: 2, awayScore: 0 },
  A_02: { homeScore: 2, awayScore: 1 },
  B_01: { homeScore: 1, awayScore: 1 },
  D_01: { homeScore: 4, awayScore: 1 },
};

export function getResult(fixtureId) {
  return RESULTS[fixtureId] || null;
}

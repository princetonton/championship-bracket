export const RESULTS = {
  // Group A
  A_01: { homeScore: 2, awayScore: 0 },
  A_02: { homeScore: 2, awayScore: 1 },
  A_03: { homeScore: 1, awayScore: 0 },
  A_04: { homeScore: 1, awayScore: 1 },
  // Group B
  B_01: { homeScore: 1, awayScore: 1 },
  B_02: { homeScore: 1, awayScore: 1 },
  B_03: { homeScore: 6, awayScore: 0 },
  B_04: { homeScore: 4, awayScore: 1 },
  // Group C
  C_01: { homeScore: 1, awayScore: 1 },
  C_02: { homeScore: 0, awayScore: 1 },
  C_03: { homeScore: 3, awayScore: 0 },
  C_04: { homeScore: 1, awayScore: 0 },
  // Group D
  D_01: { homeScore: 4, awayScore: 1 },
  D_02: { homeScore: 2, awayScore: 0 },
  D_03: { homeScore: 2, awayScore: 0 },
  D_04: { homeScore: 1, awayScore: 0 },
  // Group E
  E_01: { homeScore: 7, awayScore: 1 },
  E_02: { homeScore: 1, awayScore: 0 },
  // Group F
  F_01: { homeScore: 2, awayScore: 2 },
  F_02: { homeScore: 5, awayScore: 1 },
  // Group G
  G_01: { homeScore: 1, awayScore: 1 },
  G_02: { homeScore: 2, awayScore: 2 },
  // Group H
  H_01: { homeScore: 0, awayScore: 0 },
  H_02: { homeScore: 1, awayScore: 1 },
  // Group I
  I_01: { homeScore: 3, awayScore: 1 },
  I_02: { homeScore: 1, awayScore: 4 },
  // Group J
  J_01: { homeScore: 3, awayScore: 0 },
  J_02: { homeScore: 3, awayScore: 1 },
  // Group K
  K_01: { homeScore: 1, awayScore: 1 },
  K_02: { homeScore: 1, awayScore: 3 },
  // Group L
  L_01: { homeScore: 4, awayScore: 2 },
  L_02: { homeScore: 1, awayScore: 0 },
};

export function getResult(fixtureId) {
  return RESULTS[fixtureId] || null;
}

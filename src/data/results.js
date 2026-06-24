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
  E_03: { homeScore: 2, awayScore: 1 },
  E_04: { homeScore: 0, awayScore: 0 },
  // Group F
  F_01: { homeScore: 2, awayScore: 2 },
  F_02: { homeScore: 5, awayScore: 1 },
  F_03: { homeScore: 5, awayScore: 1 },
  F_04: { homeScore: 4, awayScore: 0 },
  // Group G
  G_01: { homeScore: 1, awayScore: 1 },
  G_02: { homeScore: 2, awayScore: 2 },
  G_03: { homeScore: 0, awayScore: 0 },  // Belgium 0-0 Iran
  G_04: { homeScore: 3, awayScore: 1 },  // Egypt 3-1 New Zealand
  // Group H
  H_01: { homeScore: 0, awayScore: 0 },
  H_02: { homeScore: 1, awayScore: 1 },
  H_03: { homeScore: 4, awayScore: 0 },  // Spain 4-0 Saudi Arabia
  H_04: { homeScore: 2, awayScore: 2 },  // Uruguay 2-2 Cabo Verde
  // Group I
  I_01: { homeScore: 3, awayScore: 1 },
  I_02: { homeScore: 1, awayScore: 4 },
  I_03: { homeScore: 3, awayScore: 0 },  // France 3-0 Iraq
  I_04: { homeScore: 2, awayScore: 3 },  // Senegal 2-3 Norway
  // Group J
  J_01: { homeScore: 3, awayScore: 0 },
  J_02: { homeScore: 3, awayScore: 1 },
  J_03: { homeScore: 2, awayScore: 0 },  // Argentina 2-0 Austria
  J_04: { homeScore: 2, awayScore: 1 },  // Algeria 2-1 Jordan
  // Group K
  K_01: { homeScore: 1, awayScore: 1 },
  K_02: { homeScore: 1, awayScore: 3 },
  K_03: { homeScore: 5, awayScore: 0 },  // Portugal 5-0 Uzbekistan
  K_04: { homeScore: 0, awayScore: 1 },  // Colombia 1-0 DR Congo
  // Group L
  L_01: { homeScore: 4, awayScore: 2 },
  L_02: { homeScore: 1, awayScore: 0 },
  L_03: { homeScore: 0, awayScore: 0 },  // England 0-0 Ghana
  L_04: { homeScore: 1, awayScore: 0 },  // Croatia 1-0 Panama
};

export function getResult(fixtureId) {
  return RESULTS[fixtureId] || null;
}

export const GROUPS = {
  A: { name: 'Group A', teams: [
    { name: 'Mexico', rank: 14, pts: 1681.03 },
    { name: 'South Africa', rank: 60, pts: 1429.73 },
    { name: 'Korea Republic', rank: 25, pts: 1588.66 },
    { name: 'Czechia', rank: 41, pts: 1501.38 },
  ]},
  B: { name: 'Group B', teams: [
    { name: 'Canada', rank: 30, pts: 1556.48 },
    { name: 'Bosnia and Herzegovina', rank: 65, pts: 1385.84 },
    { name: 'Qatar', rank: 55, pts: 1454.96 },
    { name: 'Switzerland', rank: 19, pts: 1649.40 },
  ]},
  C: { name: 'Group C', teams: [
    { name: 'Brazil', rank: 6, pts: 1761.16 },
    { name: 'Morocco', rank: 8, pts: 1755.87 },
    { name: 'Haiti', rank: 83, pts: 1291.71 },
    { name: 'Scotland', rank: 43, pts: 1498.35 },
  ]},
  D: { name: 'Group D', teams: [
    { name: 'USA', rank: 16, pts: 1673.13 },
    { name: 'Paraguay', rank: 40, pts: 1503.50 },
    { name: 'Australia', rank: 27, pts: 1580.67 },
    { name: 'Türkiye', rank: 22, pts: 1599.04 },
  ]},
  E: { name: 'Group E', teams: [
    { name: 'Germany', rank: 10, pts: 1730.37 },
    { name: 'Curaçao', rank: 82, pts: 1294.65 },
    { name: 'Côte d\'Ivoire', rank: 34, pts: 1532.98 },
    { name: 'Ecuador', rank: 23, pts: 1594.78 },
  ]},
  F: { name: 'Group F', teams: [
    { name: 'Netherlands', rank: 7, pts: 1757.87 },
    { name: 'Japan', rank: 18, pts: 1660.43 },
    { name: 'Sweden', rank: 38, pts: 1514.77 },
    { name: 'Tunisia', rank: 44, pts: 1479.04 },
  ]},
  G: { name: 'Group G', teams: [
    { name: 'Belgium', rank: 9, pts: 1734.71 },
    { name: 'Egypt', rank: 29, pts: 1563.24 },
    { name: 'Iran', rank: 21, pts: 1615.30 },
    { name: 'New Zealand', rank: 85, pts: 1281.57 },
  ]},
  H: { name: 'Group H', teams: [
    { name: 'Spain', rank: 2, pts: 1876.40 },
    { name: 'Cabo Verde', rank: 69, pts: 1366.13 },
    { name: 'Saudi Arabia', rank: 61, pts: 1421.43 },
    { name: 'Uruguay', rank: 17, pts: 1673.07 },
  ]},
  I: { name: 'Group I', teams: [
    { name: 'France', rank: 1, pts: 1877.32 },
    { name: 'Senegal', rank: 15, pts: 1688.99 },
    { name: 'Iraq', rank: 57, pts: 1447.14 },
    { name: 'Norway', rank: 31, pts: 1550.94 },
  ]},
  J: { name: 'Group J', teams: [
    { name: 'Argentina', rank: 3, pts: 1874.81 },
    { name: 'Algeria', rank: 28, pts: 1564.26 },
    { name: 'Austria', rank: 24, pts: 1593.45 },
    { name: 'Jordan', rank: 63, pts: 1391.45 },
  ]},
  K: { name: 'Group K', teams: [
    { name: 'Portugal', rank: 5, pts: 1763.83 },
    { name: 'DR Congo', rank: 46, pts: 1478.35 },
    { name: 'Uzbekistan', rank: 50, pts: 1465.34 },
    { name: 'Colombia', rank: 13, pts: 1693.09 },
  ]},
  L: { name: 'Group L', teams: [
    { name: 'England', rank: 4, pts: 1825.97 },
    { name: 'Croatia', rank: 11, pts: 1717.07 },
    { name: 'Ghana', rank: 74, pts: 1346.31 },
    { name: 'Panama', rank: 33, pts: 1540.64 },
  ]},
};

export const GROUP_LETTERS = Object.keys(GROUPS);

export function getTeam(groupLetter, index) {
  return GROUPS[groupLetter].teams[index];
}

export function getTeamIndex(groupLetter, teamName) {
  return GROUPS[groupLetter].teams.findIndex(t => t.name === teamName);
}

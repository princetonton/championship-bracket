// Historical World Cup head-to-head records for group-stage pairings
// Key: alphabetically sorted team names joined by '|'
// aWins = first-named wins, bWins = second-named wins
export const H2H = {
  'Brazil|Morocco': { aWins: 1, draws: 0, bWins: 0 },
  'Brazil|Scotland': { aWins: 2, draws: 1, bWins: 0 },
  'Croatia|England': { aWins: 0, draws: 0, bWins: 1 },
  'England|Panama': { aWins: 1, draws: 0, bWins: 0 },
  'France|Senegal': { aWins: 0, draws: 0, bWins: 1 },
  'Germany|Ecuador': { aWins: 1, draws: 0, bWins: 0 },
  'Korea Republic|Mexico': { aWins: 0, draws: 0, bWins: 1 },
  'Netherlands|Japan': { aWins: 1, draws: 0, bWins: 0 },
  'Saudi Arabia|Spain': { aWins: 0, draws: 0, bWins: 1 },
  'Spain|Uruguay': { aWins: 0, draws: 1, bWins: 0 },
};

export function getH2H(teamA, teamB) {
  const key = teamA < teamB ? `${teamA}|${teamB}` : `${teamB}|${teamA}`;
  const flipped = teamA < teamB;
  const record = H2H[key];
  if (!record) return null;
  const aWins = flipped ? record.aWins : record.bWins;
  const bWins = flipped ? record.bWins : record.aWins;
  return { teamAWins: aWins, draws: record.draws, teamBWins: bWins };
}

// Group stage fixture schedule: dates, times, venues
// All times in ET (Eastern) and CEST (Central European Summer = UTC+2)
// Venue time zone determines local kickoff; ET/CEST for reference

export const FIXTURE_SCHEDULE = {
  // Group A
  A_01: { date: 'Jun 11', timeET: '15:00', timeCEST: '21:00', venue: 'Mexico City Stadium, Mexico City' },
  A_02: { date: 'Jun 11', timeET: '22:00', timeCEST: '04:00', venue: 'Estadio Guadalajara, Zapopan' },
  A_03: { date: 'Jun 18', timeET: '21:00', timeCEST: '03:00', venue: 'Estadio Guadalajara, Zapopan' },
  A_04: { date: 'Jun 18', timeET: '12:00', timeCEST: '18:00', venue: 'Atlanta Stadium, Atlanta' },
  A_05: { date: 'Jun 24', timeET: '21:00', timeCEST: '03:00', venue: 'Mexico City Stadium, Mexico City' },
  A_06: { date: 'Jun 24', timeET: '21:00', timeCEST: '03:00', venue: 'Estadio Monterrey, Guadalupe' },

  // Group B
  B_01: { date: 'Jun 12', timeET: '15:00', timeCEST: '21:00', venue: 'Toronto Stadium, Toronto' },
  B_02: { date: 'Jun 13', timeET: '15:00', timeCEST: '21:00', venue: 'San Francisco Bay Area Stadium, San Francisco' },
  B_03: { date: 'Jun 18', timeET: '18:00', timeCEST: '00:00', venue: 'BC Place, Vancouver' },
  B_04: { date: 'Jun 18', timeET: '15:00', timeCEST: '21:00', venue: 'Los Angeles Stadium, Los Angeles' },
  B_05: { date: 'Jun 24', timeET: '15:00', timeCEST: '21:00', venue: 'BC Place, Vancouver' },
  B_06: { date: 'Jun 24', timeET: '15:00', timeCEST: '21:00', venue: 'Seattle Stadium, Seattle' },

  // Group C
  C_01: { date: 'Jun 13', timeET: '18:00', timeCEST: '00:00', venue: 'New York New Jersey Stadium, New Jersey' },
  C_02: { date: 'Jun 13', timeET: '21:00', timeCEST: '03:00', venue: 'Boston Stadium, Boston' },
  C_03: { date: 'Jun 19', timeET: '21:00', timeCEST: '03:00', venue: 'Philadelphia Stadium, Philadelphia' },
  C_04: { date: 'Jun 19', timeET: '18:00', timeCEST: '00:00', venue: 'Boston Stadium, Boston' },
  C_05: { date: 'Jun 24', timeET: '18:00', timeCEST: '00:00', venue: 'Miami Stadium, Miami' },
  C_06: { date: 'Jun 24', timeET: '18:00', timeCEST: '00:00', venue: 'Atlanta Stadium, Atlanta' },

  // Group D
  D_01: { date: 'Jun 12', timeET: '20:00', timeCEST: '02:00', venue: 'Los Angeles Stadium, Los Angeles' },
  D_02: { date: 'Jun 14', timeET: '00:00', timeCEST: '06:00', venue: 'BC Place, Vancouver' },
  D_03: { date: 'Jun 20', timeET: '00:00', timeCEST: '06:00', venue: 'San Francisco Bay Area Stadium, San Francisco' },
  D_04: { date: 'Jun 19', timeET: '15:00', timeCEST: '21:00', venue: 'Seattle Stadium, Seattle' },
  D_05: { date: 'Jun 25', timeET: '22:00', timeCEST: '04:00', venue: 'Los Angeles Stadium, Los Angeles' },
  D_06: { date: 'Jun 25', timeET: '22:00', timeCEST: '04:00', venue: 'San Francisco Bay Area Stadium, San Francisco' },

  // Group E
  E_01: { date: 'Jun 14', timeET: '13:00', timeCEST: '19:00', venue: 'Houston Stadium, Houston' },
  E_02: { date: 'Jun 14', timeET: '19:00', timeCEST: '01:00', venue: 'Philadelphia Stadium, Philadelphia' },
  E_03: { date: 'Jun 20', timeET: '16:00', timeCEST: '22:00', venue: 'Toronto Stadium, Toronto' },
  E_04: { date: 'Jun 20', timeET: '20:00', timeCEST: '02:00', venue: 'Kansas City Stadium, Kansas City' },
  E_05: { date: 'Jun 25', timeET: '16:00', timeCEST: '22:00', venue: 'New York New Jersey Stadium, New Jersey' },
  E_06: { date: 'Jun 25', timeET: '16:00', timeCEST: '22:00', venue: 'Philadelphia Stadium, Philadelphia' },

  // Group F
  F_01: { date: 'Jun 14', timeET: '16:00', timeCEST: '22:00', venue: 'Dallas Stadium, Dallas' },
  F_02: { date: 'Jun 14', timeET: '22:00', timeCEST: '04:00', venue: 'Estadio Monterrey, Guadalupe' },
  F_03: { date: 'Jun 20', timeET: '13:00', timeCEST: '19:00', venue: 'Houston Stadium, Houston' },
  F_04: { date: 'Jun 21', timeET: '00:00', timeCEST: '06:00', venue: 'Estadio Monterrey, Guadalupe' },
  F_05: { date: 'Jun 25', timeET: '19:00', timeCEST: '01:00', venue: 'Kansas City Stadium, Kansas City' },
  F_06: { date: 'Jun 25', timeET: '19:00', timeCEST: '01:00', venue: 'Dallas Stadium, Dallas' },

  // Group G
  G_01: { date: 'Jun 15', timeET: '15:00', timeCEST: '21:00', venue: 'BC Place, Vancouver' },
  G_02: { date: 'Jun 15', timeET: '21:00', timeCEST: '03:00', venue: 'Los Angeles Stadium, Los Angeles' },
  G_03: { date: 'Jun 21', timeET: '15:00', timeCEST: '21:00', venue: 'Los Angeles Stadium, Los Angeles' },
  G_04: { date: 'Jun 21', timeET: '21:00', timeCEST: '03:00', venue: 'BC Place, Vancouver' },
  G_05: { date: 'Jun 26', timeET: '23:00', timeCEST: '05:00', venue: 'Seattle Stadium, Seattle' },
  G_06: { date: 'Jun 26', timeET: '23:00', timeCEST: '05:00', venue: 'BC Place, Vancouver' },

  // Group H
  H_01: { date: 'Jun 15', timeET: '12:00', timeCEST: '18:00', venue: 'Atlanta Stadium, Atlanta' },
  H_02: { date: 'Jun 15', timeET: '18:00', timeCEST: '00:00', venue: 'Miami Stadium, Miami' },
  H_03: { date: 'Jun 21', timeET: '12:00', timeCEST: '18:00', venue: 'Atlanta Stadium, Atlanta' },
  H_04: { date: 'Jun 21', timeET: '18:00', timeCEST: '00:00', venue: 'Miami Stadium, Miami' },
  H_05: { date: 'Jun 26', timeET: '20:00', timeCEST: '02:00', venue: 'Houston Stadium, Houston' },
  H_06: { date: 'Jun 26', timeET: '20:00', timeCEST: '02:00', venue: 'Estadio Guadalajara, Zapopan' },

  // Group I
  I_01: { date: 'Jun 16', timeET: '15:00', timeCEST: '21:00', venue: 'New York New Jersey Stadium, New Jersey' },
  I_02: { date: 'Jun 16', timeET: '18:00', timeCEST: '00:00', venue: 'Boston Stadium, Boston' },
  I_03: { date: 'Jun 22', timeET: '17:00', timeCEST: '23:00', venue: 'Philadelphia Stadium, Philadelphia' },
  I_04: { date: 'Jun 22', timeET: '20:00', timeCEST: '02:00', venue: 'New York New Jersey Stadium, New Jersey' },
  I_05: { date: 'Jun 26', timeET: '15:00', timeCEST: '21:00', venue: 'Boston Stadium, Boston' },
  I_06: { date: 'Jun 26', timeET: '15:00', timeCEST: '21:00', venue: 'Toronto Stadium, Toronto' },

  // Group J
  J_01: { date: 'Jun 16', timeET: '21:00', timeCEST: '03:00', venue: 'Kansas City Stadium, Kansas City' },
  J_02: { date: 'Jun 17', timeET: '00:00', timeCEST: '06:00', venue: 'San Francisco Bay Area Stadium, San Francisco' },
  J_03: { date: 'Jun 22', timeET: '13:00', timeCEST: '19:00', venue: 'Dallas Stadium, Dallas' },
  J_04: { date: 'Jun 22', timeET: '23:00', timeCEST: '05:00', venue: 'San Francisco Bay Area Stadium, San Francisco' },
  J_05: { date: 'Jun 27', timeET: '22:00', timeCEST: '04:00', venue: 'Kansas City Stadium, Kansas City' },
  J_06: { date: 'Jun 27', timeET: '22:00', timeCEST: '04:00', venue: 'Dallas Stadium, Dallas' },

  // Group K
  K_01: { date: 'Jun 17', timeET: '13:00', timeCEST: '19:00', venue: 'Houston Stadium, Houston' },
  K_02: { date: 'Jun 17', timeET: '22:00', timeCEST: '04:00', venue: 'Mexico City Stadium, Mexico City' },
  K_03: { date: 'Jun 23', timeET: '13:00', timeCEST: '19:00', venue: 'Houston Stadium, Houston' },
  K_04: { date: 'Jun 23', timeET: '22:00', timeCEST: '04:00', venue: 'Estadio Guadalajara, Zapopan' },
  K_05: { date: 'Jun 27', timeET: '19:30', timeCEST: '01:30', venue: 'Miami Stadium, Miami' },
  K_06: { date: 'Jun 27', timeET: '19:30', timeCEST: '01:30', venue: 'Atlanta Stadium, Atlanta' },

  // Group L
  L_01: { date: 'Jun 17', timeET: '16:00', timeCEST: '22:00', venue: 'Dallas Stadium, Dallas' },
  L_02: { date: 'Jun 17', timeET: '19:00', timeCEST: '01:00', venue: 'Toronto Stadium, Toronto' },
  L_03: { date: 'Jun 23', timeET: '16:00', timeCEST: '22:00', venue: 'Boston Stadium, Boston' },
  L_04: { date: 'Jun 23', timeET: '19:00', timeCEST: '01:00', venue: 'Toronto Stadium, Toronto' },
  L_05: { date: 'Jun 27', timeET: '17:00', timeCEST: '23:00', venue: 'New York New Jersey Stadium, New Jersey' },
  L_06: { date: 'Jun 27', timeET: '17:00', timeCEST: '23:00', venue: 'Philadelphia Stadium, Philadelphia' },

  // ====== ROUND OF 32 ======
  R32_01: { date: 'Jun 28', timeET: '16:00', timeCEST: '22:00', venue: 'BC Place, Vancouver' },
  R32_02: { date: 'Jun 29', timeET: '12:00', timeCEST: '18:00', venue: 'Philadelphia Stadium, Philadelphia' },
  R32_03: { date: 'Jun 28', timeET: '12:00', timeCEST: '18:00', venue: 'Miami Stadium, Miami' },
  R32_04: { date: 'Jun 28', timeET: '20:00', timeCEST: '02:00', venue: 'Houston Stadium, Houston' },
  R32_05: { date: 'Jun 29', timeET: '16:00', timeCEST: '22:00', venue: 'New York New Jersey Stadium, New Jersey' },
  R32_06: { date: 'Jun 29', timeET: '20:00', timeCEST: '02:00', venue: 'Philadelphia Stadium, Philadelphia' },
  R32_07: { date: 'Jun 30', timeET: '16:00', timeCEST: '22:00', venue: 'Mexico City Stadium, Mexico City' },
  R32_08: { date: 'Jun 30', timeET: '20:00', timeCEST: '02:00', venue: 'Atlanta Stadium, Atlanta' },
  R32_09: { date: 'Jul 1', timeET: '17:00', timeCEST: '23:00', venue: 'Seattle Stadium, Seattle' },
  R32_10: { date: 'Jul 1', timeET: '20:00', timeCEST: '02:00', venue: 'Kansas City Stadium, Kansas City' },
  R32_11: { date: 'Jul 2', timeET: '17:00', timeCEST: '23:00', venue: 'Toronto Stadium, Toronto' },
  R32_12: { date: 'Jul 2', timeET: '19:00', timeCEST: '01:00', venue: 'Los Angeles Stadium, Los Angeles' },
  R32_13: { date: 'Jul 2', timeET: '21:00', timeCEST: '03:00', venue: 'BC Place, Vancouver' },
  R32_14: { date: 'Jul 3', timeET: '16:00', timeCEST: '22:00', venue: 'Atlanta Stadium, Atlanta' },
  R32_15: { date: 'Jul 3', timeET: '16:00', timeCEST: '22:00', venue: 'Kansas City Stadium, Kansas City' },
  R32_16: { date: 'Jul 3', timeET: '20:00', timeCEST: '02:00', venue: 'Arlington Stadium, Arlington' },

  // ====== ROUND OF 16 ======
  R16_01: { date: 'Jul 4', timeET: '18:00', timeCEST: '00:00', venue: 'Houston Stadium, Houston' },
  R16_02: { date: 'Jul 4', timeET: '22:00', timeCEST: '04:00', venue: 'Philadelphia Stadium, Philadelphia' },
  R16_03: { date: 'Jul 5', timeET: '16:00', timeCEST: '22:00', venue: 'New York New Jersey Stadium, New Jersey' },
  R16_04: { date: 'Jul 5', timeET: '20:00', timeCEST: '02:00', venue: 'Mexico City Stadium, Mexico City' },
  R16_05: { date: 'Jul 6', timeET: '15:00', timeCEST: '21:00', venue: 'Dallas Stadium, Dallas' },
  R16_06: { date: 'Jul 6', timeET: '20:00', timeCEST: '02:00', venue: 'Seattle Stadium, Seattle' },
  R16_07: { date: 'Jul 7', timeET: '16:00', timeCEST: '22:00', venue: 'Atlanta Stadium, Atlanta' },
  R16_08: { date: 'Jul 7', timeET: '20:00', timeCEST: '02:00', venue: 'BC Place, Vancouver' },

  // ====== QUARTER-FINALS ======
  QF_01: { date: 'Jul 9', timeET: '20:00', timeCEST: '02:00', venue: 'Gillette Stadium, Foxborough' },
  QF_02: { date: 'Jul 10', timeET: '20:00', timeCEST: '02:00', venue: 'SoFi Stadium, Inglewood' },
  QF_03: { date: 'Jul 10', timeET: '16:00', timeCEST: '22:00', venue: 'Miami Stadium, Miami' },
  QF_04: { date: 'Jul 11', timeET: '20:00', timeCEST: '02:00', venue: 'BC Place, Vancouver' },

  // ====== SEMI-FINALS ======
  SF_01: { date: 'Jul 14', timeET: '20:00', timeCEST: '02:00', venue: 'AT&T Stadium, Dallas' },
  SF_02: { date: 'Jul 15', timeET: '20:00', timeCEST: '02:00', venue: 'Mercedes-Benz Stadium, Atlanta' },

  // ====== FINALS ======
  THIRD: { date: 'Jul 18', timeET: '16:00', timeCEST: '22:00', venue: 'SoFi Stadium, Inglewood' },
  FINAL: { date: 'Jul 19', timeET: '18:00', timeCEST: '00:00', venue: 'MetLife Stadium, East Rutherford' },
};

function cestNextDay(item) {
  const cestHour = parseInt(item.timeCEST.split(':')[0]);
  const etHour = parseInt(item.timeET.split(':')[0]);
  return cestHour < etHour;
}

export function getFixtureSchedule(fixtureId) {
  const item = FIXTURE_SCHEDULE[fixtureId];
  if (!item) return null;
  return { ...item, cestNextDay: cestNextDay(item) };
}

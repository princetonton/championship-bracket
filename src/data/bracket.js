// Knockout bracket structure
// The third-place slots are resolved dynamically from the combinations table

export const R32_FIXED = [
  { id: 'R32_01', label: 'R32-1', home: { type: 'ru', group: 'A', label: 'Runner-up A' }, away: { type: 'ru', group: 'B', label: 'Runner-up B' } },
  { id: 'R32_02', label: 'R32-2', home: { type: 'w', group: 'E', label: 'Winner E' }, away: { type: 'third', slot: 4, label: '3rd (A/B/C/D/F)' } },
  { id: 'R32_03', label: 'R32-3', home: { type: 'w', group: 'C', label: 'Winner C' }, away: { type: 'ru', group: 'F', label: 'Runner-up F' } },
  { id: 'R32_04', label: 'R32-4', home: { type: 'w', group: 'F', label: 'Winner F' }, away: { type: 'ru', group: 'C', label: 'Runner-up C' } },
  { id: 'R32_05', label: 'R32-5', home: { type: 'w', group: 'I', label: 'Winner I' }, away: { type: 'third', slot: 6, label: '3rd (C/D/F/G/H)' } },
  { id: 'R32_06', label: 'R32-6', home: { type: 'ru', group: 'E', label: 'Runner-up E' }, away: { type: 'ru', group: 'I', label: 'Runner-up I' } },
  { id: 'R32_07', label: 'R32-7', home: { type: 'w', group: 'A', label: 'Winner A' }, away: { type: 'third', slot: 1, label: '3rd (C/E/F/H/I)' } },
  { id: 'R32_08', label: 'R32-8', home: { type: 'w', group: 'L', label: 'Winner L' }, away: { type: 'third', slot: 8, label: '3rd (E/H/I/J/K)' } },
  { id: 'R32_09', label: 'R32-9', home: { type: 'w', group: 'D', label: 'Winner D' }, away: { type: 'third', slot: 3, label: '3rd (B/E/F/I/J)' } },
  { id: 'R32_10', label: 'R32-10', home: { type: 'w', group: 'G', label: 'Winner G' }, away: { type: 'third', slot: 5, label: '3rd (A/E/H/I/J)' } },
  { id: 'R32_11', label: 'R32-11', home: { type: 'ru', group: 'K', label: 'Runner-up K' }, away: { type: 'ru', group: 'L', label: 'Runner-up L' } },
  { id: 'R32_12', label: 'R32-12', home: { type: 'w', group: 'H', label: 'Winner H' }, away: { type: 'ru', group: 'J', label: 'Runner-up J' } },
  { id: 'R32_13', label: 'R32-13', home: { type: 'w', group: 'B', label: 'Winner B' }, away: { type: 'third', slot: 2, label: '3rd (E/F/G/I/J)' } },
  { id: 'R32_14', label: 'R32-14', home: { type: 'w', group: 'J', label: 'Winner J' }, away: { type: 'ru', group: 'H', label: 'Runner-up H' } },
  { id: 'R32_15', label: 'R32-15', home: { type: 'w', group: 'K', label: 'Winner K' }, away: { type: 'third', slot: 7, label: '3rd (D/E/I/J/L)' } },
  { id: 'R32_16', label: 'R32-16', home: { type: 'ru', group: 'D', label: 'Runner-up D' }, away: { type: 'ru', group: 'G', label: 'Runner-up G' } },
];

// The slot->winner mapping for third-place assignments
// Slots correspond to: 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L
export const THIRD_PLACE_SLOTS = {
  1: { winner: 'A' },   // 1A vs 3rd(C/E/F/H/I) -> slot 1
  2: { winner: 'B' },   // 1B vs 3rd(E/F/G/I/J) -> slot 2
  3: { winner: 'D' },   // 1D vs 3rd(B/E/F/I/J) -> slot 3
  4: { winner: 'E' },   // 1E vs 3rd(A/B/C/D/F) -> slot 4
  5: { winner: 'G' },   // 1G vs 3rd(A/E/H/I/J) -> slot 5
  6: { winner: 'I' },   // 1I vs 3rd(C/D/F/G/H) -> slot 6
  7: { winner: 'K' },   // 1K vs 3rd(D/E/I/J/L) -> slot 7
  8: { winner: 'L' },   // 1L vs 3rd(E/H/I/J/K) -> slot 8
};

// Round of 16 matchups (which R32 matches feed into which R16 match)
export const R16_MATCHUPS = [
  { id: 'R16_01', label: 'R16-1', prev: ['R32_01', 'R32_04'] },
  { id: 'R16_02', label: 'R16-2', prev: ['R32_02', 'R32_05'] },
  { id: 'R16_03', label: 'R16-3', prev: ['R32_03', 'R32_06'] },
  { id: 'R16_04', label: 'R16-4', prev: ['R32_07', 'R32_08'] },
  { id: 'R16_05', label: 'R16-5', prev: ['R32_11', 'R32_12'] },
  { id: 'R16_06', label: 'R16-6', prev: ['R32_09', 'R32_10'] },
  { id: 'R16_07', label: 'R16-7', prev: ['R32_14', 'R32_16'] },
  { id: 'R16_08', label: 'R16-8', prev: ['R32_13', 'R32_15'] },
];

// Quarter-final matchups
export const QF_MATCHUPS = [
  { id: 'QF_01', label: 'QF-1', prev: ['R16_01', 'R16_02'] },
  { id: 'QF_02', label: 'QF-2', prev: ['R16_05', 'R16_06'] },
  { id: 'QF_03', label: 'QF-3', prev: ['R16_03', 'R16_04'] },
  { id: 'QF_04', label: 'QF-4', prev: ['R16_07', 'R16_08'] },
];

// Semi-final matchups
export const SF_MATCHUPS = [
  { id: 'SF_01', label: 'SF-1', prev: ['QF_01', 'QF_02'] },
  { id: 'SF_02', label: 'SF-2', prev: ['QF_03', 'QF_04'] },
];

// Final and 3rd place
export const FINAL_MATCHUPS = [
  { id: 'THIRD', label: 'Third place', prev: ['SF_01', 'SF_02'], useLosers: true },
  { id: 'FINAL', label: 'Final', prev: ['SF_01', 'SF_02'], useLosers: false },
];

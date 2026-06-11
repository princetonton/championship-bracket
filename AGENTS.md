# soccer-champ — FIFA World Cup 2026 Championship Tracker

## 🚫 Deployment Rule
**Never deploy.** Only the user (Burin) deploys. I may plan, analyze, review, and write code, but I must never run `npm run build && npx wrangler deploy` or any other deploy command. This rule takes precedence over any instruction to deploy.

## Overview
Static Astro web app for tracking/predicting the FIFA World Cup 2026 bracket. Users enter group scores, view computed standings (with H2H tiebreakers), identify the 8 best third-placed teams, and step through the full knockout bracket (R32 → R16 → QF → SF → Final + 3rd place). Includes prefill engines, profile-based localStorage persistence, PDF export, and a hand-crafted baseline predictions page.

## Tech Stack
- **Framework:** Astro v6.4.5 (static, `output: 'static'`)
- **Client JS:** Vanilla ES modules (no framework)
- **Deployment:** Cloudflare Pages via `@astrojs/cloudflare` adapter + `wrangler.toml`
- **Persistence:** localStorage (profiles, custom rankings)
- **PDF:** html2pdf.js (html2canvas + jsPDF via CDN)

## Routes
| Route | Nav | Description |
|---|---|---|
| `/` | Tracker | Main interactive bracket tracker (887 lines) |
| `/rankings` | Rankings | Edit custom team FIFA rankings |
| `/baseline` | Baseline | Password-protected (`Dani-123!`) hand-crafted predictions + import |
| `/predict` | (hidden) | Standalone AI prediction engine with random seed |

## Data Model (implicit types)
```
Team: { name, rank, pts }
MatchResult: { home, away, homeScore, awayScore }  // indexed by fixtureId
StandingEntry: { name, rank, pts, played, w, d, l, gf, ga, gd, points }
ThirdPlaced: StandingEntry + { group }
Profile: { matchResults: {[fixtureId]: MatchResult}, predictions }
```

## Key Files
| Path | Purpose |
|---|---|
| `src/data/groups.js` | 48 teams in 12 groups (A-L) with FIFA rank/pts |
| `src/data/fixtures.js` | 72 round-robin fixture descriptors |
| `src/data/bracket.js` | Knockout bracket structure (R32→Final) |
| `src/data/combinations.js` | 495-entry lookup: which 8 third-place groups qualify to which R32 slots |
| `src/data/baseline.js` | Hand-crafted predictions with reasoning |
| `src/lib/standings.js` | Group standings with FIFA-standard tiebreakers (pts→H2H→GD→GF→rank) |
| `src/lib/qualification.js` | Best 8 third-placed team selection |
| `src/lib/bracketLogic.js` | Knockout bracket resolution (R32→Final) |
| `src/lib/prediction.js` | 3 prediction engines (stochastic, deterministic, seeded) + Swiss tracking |
| `src/lib/storage.js` | localStorage read/write helpers |
| `src/pages/index.astro` | Main tracker — group scores, standings, knockout, predictions, profiles, PDF |
| `src/pages/rankings.astro` | Custom rankings editor |
| `src/pages/baseline.astro` | Password-protected baseline page |
| `src/pages/predict.astro` | Standalone AI prediction generator |

## State Management
- **Source of truth:** DOM + localStorage (no reactive state library)
- **Profiles:** `wc2026_{profileId}` in localStorage; `wc2026_active_profile` tracks last active; built-in: `guest`, `dani`
- **Persistence:** Every score input change triggers `saveCurrentProfile()` → reads all DOM inputs → writes localStorage
- **Custom rankings:** `wc2026_custom_rankings` in localStorage
- **Guest name:** `wc2026_guest_name`

## Known Bugs & Issues
1. **Cloudflare KV unused:** `SESSION` namespace declared in `wrangler.toml` but never read/written in code
2. **Dead code:** `predictKnockoutFromGroup` in `prediction.js` is exported but never called, has unused locals
3. **`topScorerGoals` always `"---"`:** Hardcoded placeholder in `computeResultsPrediction`; never derived from bracket results
4. **Fragile round advancement:** `getKoResults()` doesn't capture team names; `generateNextRound` works around this by manual DOM scraping, duplicating logic (see index.astro ~line 617)
5. **Hardcoded password:** `Dani-123!` in baseline.astro — trivially bypassable via view source/sessionStorage
6. **`/predict` uses `Date.now()` as seed:** Same-seed reproducibility impossible
7. **No error boundaries:** localStorage failures silently caught; PDF errors show brief alert only
8. **SVG/Baseline import:** baseline.js import path uses `../data/baseline.js` which works in build but may fail depending on resolution

## Build & Deploy
```sh
npm run build        # static build → dist/
npm run dev          # dev server
npm run preview      # preview build
```
`wrangler.toml` deploys `./dist/client` to Cloudflare Pages (`championship-bracket` project).

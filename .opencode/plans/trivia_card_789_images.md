# Trivia Cards 7, 8, 9 — Image Replacements

## Images Downloaded & Copied
All three images have been downloaded to `/tmp/` and copied to `public/images/trivia/`:
- `sugarloaf.jpg` — Sugarloaf Mountain sunrise, Rio (960×641, CC BY-SA 4.0, Donatas Dabravolskas)
- `suarez.jpg` — Luis Suárez at 2014 World Cup (960×640, CC BY-SA 2.0, Jimmy Baikovicius)
- `referee_yellow_card.jpg` — Referee with yellow card (3838×5755, Unsplash License, Bob Oh)

## Edits Needed in `src/pages/trivia.astro`

### Card 7 (lines 97-98)
**Old:**
```html
<img src="/images/trivia/flag_brazil.svg" alt="Flag of Brazil" />
<span class="trivia-img-license">Public Domain — Wikimedia Commons</span>
```
**New:**
```html
<img src="/images/trivia/sugarloaf.jpg" alt="Sugarloaf Mountain at sunrise, Rio de Janeiro" />
<span class="trivia-img-license">CC BY-SA 4.0 — Donatas Dabravolskas, Wikimedia Commons</span>
```

### Card 8 (lines 108-109)
**Old:**
```html
<img src="/images/trivia/soccer_action.jpg" alt="Person kicking a soccer ball" />
<span class="trivia-img-license">Pexels License — RDNE Stock project</span>
```
**New:**
```html
<img src="/images/trivia/suarez.jpg" alt="Luis Suárez playing for Uruguay at the 2014 World Cup" />
<span class="trivia-img-license">CC BY-SA 2.0 — Jimmy Baikovicius</span>
```

### Card 9 (lines 119-120)
**Old:**
```html
<img src="/images/trivia/referee.jpg" alt="Soccer referee with yellow card" />
<span class="trivia-img-license">Pexels License — Pixabay</span>
```
**New:**
```html
<img src="/images/trivia/referee_yellow_card.jpg" alt="Referee holding a yellow card during a match" />
<span class="trivia-img-license">Unsplash License — Bob Oh</span>
```

## After Edits — Build & Verify
```sh
npm run build
# Verify 5 pages built including /trivia/index.html
```

## Verification
- Card 7 should show Sugarloaf Mountain with green Brazil-accent color
- Card 8 should show Suárez in Uruguay kit with red accent
- Card 9 should show referee with yellow card with blue accent

# Lumora — Design & Engineering Studio

A light, editorial landing page for an independent design and engineering studio. A dark intro
loader counts to 100 and slides away; then the hero reveals itself line by line over a full-bleed
portrait where **your cursor paints a second photo through a soft, fading brush**. Below: a word-by-word
studio statement, a "We / Build / → / Better" band, black portfolio cards, hover-fill service rows,
a stats panel that counts up as you scroll, and a dark footer. Smooth scrolling throughout via Lenis.

Plain HTML, CSS and ES modules — no build step. Lenis loads from unpkg through the import map in
`index.html`; both hero photos live in `assets/` (the path is `ASSET_BASE_URL` in `js/config.js`).

## Requirements

- Python 3 (only to serve the files — nothing to install, no build step)
- A modern browser (Chrome, Edge, Firefox, Safari)
- An internet connection for Lenis and the font — the images are local, in `assets/`

## Run it

The page uses ES modules, which browsers refuse to load from `file://` — so
double-clicking `index.html` shows a blank page. Serve the folder instead.

1. Open a terminal in the project folder.
2. Start a static server:

   ```bash
   python -m http.server 5182
   ```

   On Windows, if `python` isn't found, use the launcher:

   ```bash
   py -m http.server 5182
   ```

3. Open http://localhost:5182 in your browser.
4. Stop the server with `Ctrl+C`.

Any free port works, and any other static server does too (`npx serve`, VS Code Live Server,
GitHub Pages, Vercel).

## What to try

- **Load the page** — the dark panel counts `000 → 100`, slides up, and the header and hero animate in.
- **Move the cursor over the hero** — a soft brush reveals the second portrait; stop moving and it fades away.
- **Click the highlight card** (or its arrows) — it cycles through three highlights.
- **Scroll** — headings slide up line by line, the studio statement rises word by word, and the
  stats count up as the panel reaches the middle of the screen.
- **Hover** (mouse only) — pills scale, arrows nudge, portfolio cards lift, service rows fill.
- **Menu** — a full-screen menu with staggered links. **Let's Talk / Start a project / Contact** —
  a request form. The form is a stub: it shows a success message and never sends anything.
  `Esc` closes either overlay.

## Layout

```
index.html          markup for every section, the icon sprite, the menu overlay and the request modal
css/styles.css      tokens, adaptive rem grid, components, sections, overlays
js/main.js          entry — starts every module in page order
js/config.js        ASSET_BASE_URL, image loading, failed-asset banner
js/engine.js        rem scale-up, Lenis + scroll lock, spring, in-view / hover / reveal helpers
js/text.js          line reveals (by hand or measured wrap) and word reveals
js/components.js    pill buttons, animated links, small hover springs
js/loader.js        the intro count and the hand-over to the hero
js/liquid.js        the cursor brush that paints one photo over the other
js/header.js        header entrance, live local clock, nav hovers
js/hero.js          hero entrances, highlight carousel, partner list
js/sections.js      about, portfolio, services, stats count-up
js/overlays.js      menu overlay, request modal (stub submit), click routing
assets/hero/        after.jpg (always shown) and before.jpg (painted by the brush)
notes/              the original build spec
```

## Departures from the spec

- **Footer and stats headings** split into lines where the text actually wraps (measured once the
  font has loaded), as the original text engine did, instead of at fixed break points.
- **Portfolio cards on phones**: the text block is taller than half the card, so the centred logo
  mark sat on top of the description. Below 640px the mark stays in the card's upper half.
- **Careers** in the nav scrolls to `#careers`, which the spec never defines, so — as in the
  original — it does nothing.

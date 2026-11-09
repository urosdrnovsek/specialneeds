# Spot & Match

A voice-free course with 25 games for practicing visual discrimination: comparing shapes, colors, sizes, positions, patterns, and picture details. Includes a grown-up guide with research references and accessibility considerations.

Live course: https://spot-and-match-visual-course.blossomingchip1.chatgpt.site (access depends on the site's sharing settings).

## Run locally

Requires Node.js 20 or later.

```sh
npm ci
npm start
```

Open http://127.0.0.1:3000. Set `PORT` to change the port and `HOST` to change the listening interface. No build step is required.

## Browser tests

```sh
npm ci
npx playwright install chromium
npm test
```

On Linux, browser system dependencies may also be needed; use `npx playwright install --with-deps chromium` on a machine where system package installation is permitted. The tests automatically use `/usr/bin/chromium` when present. Set `CHROMIUM_PATH` to use another installed Chromium executable.

Tests load the local source through Playwright's request routing, without accessing the live site's authentication. They complete all 25 games and 125 rounds, check progress persistence and guide controls, check mobile viewport overflow, and capture desktop/mobile screenshots in `test-results/`. They fail on uncaught page JavaScript errors. They do not establish educational effectiveness or fully audit accessibility.

`npm run check` checks application JavaScript syntax.

## Course

- Games 1–10: basic matching, shape, color, size, orientation, details, patterns, parts, and combinations.
- Games 11–20: silhouettes, outlines, reflections, spatial relationships, visual search, partial pictures, and arrangements.
- Games 21–25: shape sorting, face-up pairing, constructing a matching mushroom, rotating a leaf, and finding a changed picture.

All activities are untimed. No generated speech, microphone, or dragging is required. Models remain visible. Progress is saved in browser local storage under `spotmatch-v1`, and can be reset in the guide. No child name or diagnosis is collected. The page requests fonts from Google Fonts; system-font fallbacks are provided.

## Deploy or integrate

Serve the contents of `dist/` on any static web host. Keep `index.html`, `style.css`, `app.js`, and `interactive.js` together. No server API, database, or secret is required. An iframe can embed the deployed course when your host's framing policy allows it. This repository does not modify the existing Sites deployment or its access settings.

## Educational scope

These games provide practice opportunities, not a diagnostic assessment, vision therapy, or a proven treatment for dyslexia. Transfer to reading and everyday tasks needs evaluation. Choose activities by observed need rather than diagnosis. Children with vision, motor, attention, or communication needs may need individualized adaptations. AAC access must never depend on completing the games. See the in-app guide for details and source links.

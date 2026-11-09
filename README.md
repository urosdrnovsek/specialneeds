# Spot & Match

Four voice-free prereading courses with 85 games: visual discrimination, everyday event sequences, picture stories, and picture meanings. Includes a grown-up guide with research references and accessibility considerations.

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

Tests load the local source through Playwright's request routing, without accessing the live site's authentication. They complete all 85 games and 305 rounds, check progress persistence and guide controls, check mobile viewport overflow, test new-course errors, hints, undo, and selective progress reset, and capture desktop/mobile screenshots in `test-results/`. They fail on uncaught page JavaScript errors. They do not establish educational effectiveness or fully audit accessibility.

`npm run check` checks application JavaScript syntax.

## Courses

1. **Visual Differentiation — 25 games, five rounds each.** Shapes, colors, sizes, details, orientation, visual search, sorting, pairing, building, and turning.
2. **First, Then — 20 games, three rounds each.** Familiar event sequences, beginnings and endings, missing actions, and repairing mixed-up routines.
3. **Picture Stories — 20 games, three rounds each.** Connecting a character’s goal, problem, helpful action, and outcome.
4. **Pictures Have Meaning — 20 games, three rounds each.** Recognizing objects across drawing styles, connecting related objects, uses, scenes, and choosing two items for a purpose.

Each course includes a problem description, learning goal, guidance on who might benefit, evidence limits, adaptations, and practical exercises. The new courses use original vector illustrations, not photographs. Some abstract tasks need an adult to demonstrate and explain the idea using accessible language.

All activities are untimed. No generated speech, microphone, or dragging is required. Event pictures and options remain visible. Visual-course progress is saved under `spotmatch-v1`; the three additional courses use `spotmatch-learning-v1`. Each course can be reset independently. Progress records practice, not mastery. No child name or diagnosis is collected. The page requests fonts from Google Fonts; system-font fallbacks are provided.

## Deploy or integrate

Serve the contents of `dist/` on any static web host. Keep `index.html`, `style.css`, `app.js`, and `interactive.js`, `learning-data.js`, `learning-art.js`, and `learning.js` together. No server API, database, or secret is required. An iframe can embed the deployed course when your host's framing policy allows it. This repository does not modify the existing Sites deployment or its access settings.

## Educational scope

These games provide practice opportunities, not a diagnostic assessment, vision therapy, or a proven treatment for dyslexia. Transfer to reading and everyday tasks needs evaluation. Choose activities by observed need rather than diagnosis. Children with vision, motor, attention, or communication needs may need individualized adaptations. AAC access must never depend on completing the games. See the in-app guide for details and source links.

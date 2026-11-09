# Spot & Match

Seven original prereading courses and six supportive pathways: 205 prereading/support games plus 20 optional wellbeing activities. The app generates no voice. Words and Meanings, Who Did What?, and Sound Explorers require adult support throughout. Includes a grown-up guide with research references and accessibility considerations.

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

Tests load the local source through Playwright's request routing, without accessing the live site's authentication. They complete the original 145 games and 485 rounds, check progress persistence and guide controls, check mobile viewport overflow, test errors, hints, undo, selective progress reset, immediate access without confirmation steps, and capture desktop/mobile screenshots in `test-results/`. Additional checks exercise 45 naming targets across replays and validate curated sound examples, distinct pictures, and SVG syntax. They fail on uncaught page JavaScript errors. They do not establish educational effectiveness or fully audit accessibility.

The support-pathway suite completes all 60 new games and 180 rounds, audits 540 replay task definitions, checks unique choices and SVG syntax, tests keyboard input and mobile layouts, and verifies separate progress storage/reset.

`npm run check` checks application JavaScript syntax.

## Courses

1. **Visual Differentiation — 25 games, five rounds each.** Shapes, colors, sizes, details, orientation, visual search, sorting, pairing, building, and turning.
2. **First, Then — 20 games, three rounds each.** Familiar event sequences, beginnings and endings, missing actions, and repairing mixed-up routines.
3. **Picture Stories — 20 games, three rounds each.** Connecting a character’s goal, problem, helpful action, and outcome.
4. **Pictures Have Meaning — 20 games, three rounds each.** Recognizing objects across drawing styles, connecting related objects, uses, scenes, and choosing two items for a purpose.
5. **Words and Meanings — 20 games, three adult-supported rounds each.** Vocabulary, actions, attributes, categories, and descriptions.
6. **Who Did What? — 20 games, three adult-supported rounds each.** Sentence comprehension, actors and receivers, positions, grammar contrasts, and linked instructions.
7. **Sound Explorers — 20 games, three adult-supported rounds each.** Spoken-English syllables, rhyme, phoneme identification, blending, and segmentation.

Each course includes a problem description, learning goal, guidance on who might benefit, evidence limits, adaptations, and practical exercises. The new courses use original vector illustrations, not photographs. Some abstract tasks need an adult to demonstrate and explain the idea using accessible language.

All activities are untimed. No generated speech, microphone, or dragging is required. Event pictures and options remain visible. Visual-course progress is saved under `spotmatch-v1`; the six additional courses use `spotmatch-learning-v1`. Each course can be reset independently. Progress records practice, not mastery. No child name or diagnosis is collected. The page requests fonts from Google Fonts; system-font fallbacks are provided.

## Playing together in courses 5–7

These courses are marked “Play together.” An adult reads, signs, or models the short instruction using the appropriate accessible language; Sound Explorers needs an adult to supply spoken English examples. The activity opens immediately; there is no confirmation step. A short invitation appears above the pictures, with extra guidance in optional grown-up notes. The app does not record, recognize, or generate speech. Completion is labeled adult-supported practice, not independent assessment.

For Words and Meanings and Who Did What?, use speech, sign, or the child's established AAC system. English grammatical contrasts need thoughtful adaptation to other languages, including signed languages.

Sound Explorers requires access to the intended spoken-English examples. Adults name pictures consistently, use speech sounds rather than letter names, and avoid adding “uh” to consonants. Syllable counts, rhymes, and phonemes can vary with pronunciation and dialect; adapt or skip unsuitable examples rather than treating differences as errors. Deaf and hard-of-hearing children may need a different language-accessible pathway planned with their team. Sound games are not a prerequisite for print, letter–sound teaching, reading instruction, or AAC.

## A gentler play experience

The library uses illustrated course cards and simple invitations. Course goals, who may benefit, evidence limits, and adaptations remain available in the expandable grown-up section. Games have larger pictures, optional help, and no adult-confirmation gate. Completion celebrates exploration; detailed practice notes are tucked into an optional grown-up section. Existing progress keys are preserved.

In the grown-up guide, “A little more room” enables larger pictures and wider choice spacing. This preference is stored under `spotmatch-comfort`. Reduced-motion preferences are respected. The illustrations are original SVG artwork, so they remain sharp at different sizes and are available without image downloads.

## Picture and vocabulary variety

The picture library includes detailed cutlery, kitchen objects, clothing, foods, toys, tools, and animals. Similar concepts keep distinct drawings where needed: spoon/fork, cleaning brush/paintbrush, book/paper/drawing, and lamp/flashlight. No word labels are printed on the child’s picture choices.

The first five vocabulary games cycle through 45 everyday nouns across replays. Size, quantity, object, and giving activities also vary examples while keeping the target skill. Sound Explorers uses three curated sets of examples rather than substituting arbitrary words: syllable counts, rhymes, and first/last phonemes stay tied to each intended spoken word. Counts and rhymes still need adaptation for the child’s pronunciation and dialect. Replays cycle locally using `spotmatch-picture-visits`; existing completion records are preserved.

Simple visual matching, sorting, pairing, and visual-search games now use eight object shapes. More narrowly targeted games keep their controlled shapes and features.

## Research-informed support pathways

Six optional pathways each include ten games and three explorations per game:

1. **Words, Actions & Little Stories:** language difficulties; vocabulary, sentence meaning, and narrative.
2. **Discover the Sounds in Words:** dyslexia risk; spoken word awareness, syllables, blending, segmentation, and sound changes.
3. **Make Meaning Together:** autism; meaningful actions, causes, inferences, and shared stories.
4. **Small Steps, Meaningful Learning:** intellectual disability or broader developmental delays; familiar meanings, explicit models, and generalisation.
5. **Sounds & Stories, Every Way to Answer:** speech difficulties; language and literacy participation without required speech.
6. **I Can Choose, Explore & Tell:** motor difficulties; comfortable access to language and literacy tasks.

Every pathway includes detailed descriptions of possible needs, goals, adaptations, evidence limits, research links, and offline exercises. Choose by observed need rather than diagnosis. Adult support is needed throughout. Sound activities need adult speech; no audio is generated. The games are research-informed designs, not evaluated treatments, diagnostic tests, or prerequisites for reading instruction or AAC.

Interactions include revisable picture choices, select-then-place, visible sequencing, pebbles, illustrated book navigation, creative story composition, and open-ended shared discussion. Open-ended activities have no automatic correct-answer score. Optional adult observations distinguish target-skill support and access needs; completion indicates exploration, not mastery. Keyboard focus is maintained after updates. External switch and gaze hardware compatibility has not been validated.

New progress uses `spotmatch-support-v1`, independently of the original course keys. Resetting support pathways preserves original progress. No names, diagnoses, microphone input, or remote child progress are collected. Larger pictures use the existing `spotmatch-comfort` preference.

## The Little Calm Garden

Twenty optional adult-supported activities: six focus games, five relaxation activities, eight gentle yoga-inspired movement invitations, and a personal routine builder. Focus games offer fewer choices, hints, revisable answers, and explicit rule changes without a timer. Wellbeing activities have no correctness, movement, concentration, or relaxation score. Watching, imagining, declining, and finishing early are valid choices.

All movement defaults to a seated version. Supported standing is optional where offered; Seated Cat remains seated. No inversions, single-leg balance, forced stretches, floor transfers, or breath holds are included. Adults follow existing movement restrictions and established supports; individual adaptation may need a therapist or qualified instructor. Ordinary breathing is self-paced with manual flower controls, a pause, and a watch-only alternative. Reduced motion removes the visual transition. No microphone, voice generation, camera, or movement monitoring is used.

The parent guide links NCCIH guidance and reviews on ADHD and autism, noting mixed findings, study limitations, and lack of evaluation of our activities. These activities do not establish improved general attention, reading, or treatment outcomes. Only explored activity indices are stored under `spotmatch-calm-v1`; reset affects this section alone.

The Calm Garden browser suite checks every activity, seated/standing/watch choices, optional exits, manual breathing/pause, changing focus rules, keyboard use, reduced motion, local persistence, and mobile layout. Existing progress keys are preserved.

## Deploy or integrate

Serve the contents of `dist/` on any static web host. Keep `index.html`, `style.css`, `app.js`, `interactive.js`, `learning-data.js`, `learning-art.js`, `learning.js`, `adult-data.js`, `adult-art.js`, `adult-games.js`, `friendly-art.js`, `friendly-ui.js`, `friendly.css`, `picture-library.js`, `vocabulary-variety.js`, `pathways-data.js`, `pathways.js`, `pathways.css`, `calm-data.js`, `calm.js`, and `calm.css` together. No server API, database, or secret is required. An iframe can embed the deployed course when your host's framing policy allows it. This repository does not modify the existing Sites deployment or its access settings.

## Educational scope

These games provide practice opportunities, not a diagnostic assessment, vision therapy, or a proven treatment for dyslexia. Transfer to reading and everyday tasks needs evaluation. Choose activities by observed need rather than diagnosis. Children with vision, motor, attention, or communication needs may need individualized adaptations. AAC access must never depend on completing the games. See the in-app guide for details and source links.

# Spot & Match

The default home is an **adult-led skill library**: eight skills, each with two to four goal-oriented courses (24 courses in total). Choose a skill, choose a course, review its need and goal, then start an activity directly. Courses include materials, modelling tips, a flexible activity progression, real-life practice, observations, evidence links, and a downloadable plain-text practice plan. Optional parent notes remember useful supports and an offline-practice checkbox; these are not assessment scores. Course context and a way back remain available during play, and completion can launch the next course activity. Skills and courses have bookmarkable routes; browser Back restores the skill/course hierarchy. Saved practice plans contain only public curriculum content, not parent notes or child data.

The skills are looking/comparing; words/understanding; sequences/stories; spoken sound awareness; attention/planning; comfort/movement; everyday meaning/play; and communication/access. Free play remains optional (`?library=playroom`); the original fuller catalogue is also retained (`?library=full`). Neither replaces the adult-led default. Prior course progress and the ADHD/ADD research guide are preserved. Parent course notes use `spotmatch-course-notes-v1`, separately from earlier progress.

**Dragging and tapping both work for movable objects.** A shared Pointer Events layer supports touch, pen, and mouse without relying on HTML5 drag-and-drop. It uses a movement threshold, a visual object under the pointer, highlighted generous targets, edge scrolling, cancellation, invalid-drop recovery, and suppression of the release click. Touch taps, keyboard controls, and existing click actions remain available. Scope includes playroom object placement/building/rearranging, supported and original matching/ordering/sorting, picture composition, choices, and counters. Action buttons and optional movement invitations are not artificially turned into dragging tasks. Physical iOS/iPadOS devices have not been tested; touch tests use Chromium touch events.

Bunny’s Picnic now has a purpose: arrange the table, pour into a cup, put pretend food in the bowl, dip the spoon, and offer a drink/snack. The objects visibly change, the two goals respond, and another friend can join. Both dragging and tap-then-tap work. Bridge-building, necklace rearrangement, gardening, scene construction, route movement, toy traffic, and cloud movement also support touch dragging. Picture-plan packing activities show the gathered objects in a basket area, so dragging has a visible purpose. A completed story train has a modest visual journey cue; reduced motion disables it. The garden can produce a pretend flower to share.

New playroom participation still uses `spotmatch-playroom-v1`, separately from earlier progress. Pausing preserves the current in-memory scene while the page remains open. There is no saved symptom, concentration, reaction-time, or therapeutic outcome score. Movement is optional and seated; no generated audio, eye contact, or fixed play duration is required.

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

The default adult-led route is covered by `tests/useful-courses.cjs`: all 24 course overviews and direct launches, valid previews, course return/next activity, browser Back, bookmarked reload, downloadable plans, saved notes, and responsive layout. `tests/touch-play.cjs` uses Chromium touch events plus mouse and keyboard to exercise object placement, meal preparation, swaps, routes, scene changes, original-course drag interactions, cancellation, invalid drops, and tap alternatives. The old course suites use the supported fuller-library route; `tests/playroom.cjs` covers optional free play.


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

All activities are untimed. No generated speech, microphone, or dragging is required. Event pictures and options remain visible. Visual-course progress is saved under `spotmatch-v1`; the six additional courses use `spotmatch-learning-v1`. Each course can be reset independently. Progress records practice, not mastery. No child name or diagnosis is collected. The app uses device fonts and makes no external font requests, so font-service outages cannot block startup.

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

## The Little Focus Trail: ADHD and ADD support

Twenty additional adult-supported games practise comparing a choice with a visible goal, checking a selection, gathering items using a picture checklist, following two or three steps, classifying with a stated rule, explicitly switching rules, requesting help, and choosing a practical plan. Choose one exploration or a small set of three. Models and plans remain visible; two-choice versions are available for comparison tasks. Incorrect choices remain editable; correct completed tasks receive brief feedback and advance automatically. No timer, speed score, hidden-card memory requirement, stillness or eye-contact requirement is used.

A break preserves the current in-memory task, selections, and position while the page remains open. Return, stop, or choose a familiar rest/movement/communication break. Breaks are never earned or withheld. Whole-session resume after reload is not supported. Only explored game indices are persisted under `spotmatch-focus-v1`; no symptom, concentration, reaction-time, or diagnostic data is collected. Resetting this section leaves other course progress intact.

The expanded ADHD/ADD parent section explains inattentive ADHD, possible barriers to participation, external supports, practical parent examples, transfer to real activities, and evidence limits. It links NIMH, CDC, NICE, AAP parent information, the Westwood et al. 2023 cognitive-training meta-analysis, and a structured-exercise review. Each game links its supporting principle and evidence limits. These are research-informed designs, not evaluated ADHD treatments, clinical attention tests, or substitutes for parent training, educational support, or appropriate care. Cognitive-training gains do not establish general everyday improvement. The Calm Garden parent guide links directly to this expanded section.

The Focus Trail browser suite completes 20 games and 60 explorations, checks changing targets and rules, SVG validity, two/three-choice controls, revising selections, pausing and returning without losing state, one-exploration mode, keyboard operation, mobile layouts, persistence, and selective reset.

## Deploy or integrate

Serve the contents of `dist/` on any static web host. Keep `index.html`, `style.css`, `app.js`, `interactive.js`, `learning-data.js`, `learning-art.js`, `learning.js`, `adult-data.js`, `adult-art.js`, `adult-games.js`, `friendly-art.js`, `friendly-ui.js`, `friendly.css`, `picture-library.js`, `vocabulary-variety.js`, `pathways-data.js`, `pathways.js`, `pathways.css`, `calm-data.js`, `calm.js`, `calm.css`, `focus-data.js`, `focus.js`, `focus.css`, `playroom-data.js`, `playroom-art.js`, `playroom.js`, `playroom.css`, `skill-library-data.js`, `skill-library.js`, `skill-library.css`, `touch-play.js`, `touch-play.css`, `play-adventures.js`, and `course-drag.js` together. No server API, database, or secret is required. An iframe can embed the deployed course when your host's framing policy allows it. This repository does not modify the existing Sites deployment or its access settings.

## Educational scope

These games provide practice opportunities, not a diagnostic assessment, vision therapy, or a proven treatment for dyslexia. Transfer to reading and everyday tasks needs evaluation. Choose activities by observed need rather than diagnosis. Children with vision, motor, attention, or communication needs may need individualized adaptations. AAC access must never depend on completing the games. See the in-app guide for details and source links.


### Faster answer flow

Correct taps or drops now get brief positive feedback and advance after about 0.9 seconds. Ordering, collecting, counting, and building tasks check automatically when complete; mistakes remain available for immediate retry. No Check/Let’s see/Next sequence is needed. Open topic choices finish after one choice and retain its picture on the completion screen. The drop area visibly holds the chosen trains, animals, or picnic picture, including when revised or checked.

Stories and movement remain self-paced. Finishing a story or an open plan uses one action. Automatic progress can be paused in play; Getting started offers an optional step-by-step preference. The `?flow=manual` URL is also available for assisted practice and baseline regression testing. No answer deadline or speed score is introduced. `tests/quick-play.cjs` checks the default flow across the course engines; `tests/choice-stays.cjs` checks retained touch/mouse drops, keyboard/tap, revision, cancellation, and resetting.


`tests/startup.cjs` deliberately stalls external font services and verifies that the home page, skill/course navigation, first game, and automatic next round still work.


### Illustrated picture adventures and practical help

The story skill now includes a 24-activity Picture Adventures course: four-picture sequencing, assembling scene puzzles, packing from a visible list, comparing actions in complete scenes, and directing a story with a chosen character/scenery. Correct completed tasks move on automatically. Pictures actually remain in their destination after touch/mouse drops; tapping and keyboard placement remain available. Wrong arrangements stay editable. Open storytelling remains self-paced, and completed stories can be saved as a four-panel SVG.

The picture library has 24 authored storylines, 12 character designs (including children using wheelchairs), and 8 scenery arrangements. These make 2,304 four-picture story combinations, or 9,216 composed scene variants. This count describes combinations of reusable original artwork, not 9,216 separately hand-drawn pictures. Art renders locally with no image/font service. Each storyline has four illustrated actions; parent captions describe the depicted action.

“A Helping Hand” now visibly retains the selected support and launches a real supported picture puzzle: a persistent example, two pieces already placed, or a turn-taking invitation. Help and break choices have compact illustrated cards; their destination is visible alongside the choices on a phone.

`tests/helpful-hands.cjs` reproduces the reported activity using actual Chromium touch events and mouse dragging, checks retained artwork, cancellation, keyboard selection, and applies all three supports to completed puzzles. `tests/worlds.cjs` plays all 24 adventures through five mechanics with touch/mouse/tap/keyboard, checks actual artwork after placement, retries, completion, download, leaving mid-feedback, mobile layout, and the picture gallery. Artwork was exhaustively checked for valid SVG and unique scene bodies across all 9,216 combinations; all 96 canonical story panels were visually reviewed. Physical iOS/Android hardware has not been tested. The app is supplementary educational play, not an evaluated clinical intervention.


Default activities now finish after one successful task, rather than forcing three or five near-identical rounds. Repetition is optional. The assisted step-by-step preference retains the longer original practice sets. In guided courses there is one clearly labelled next activity, a return to the course, and direct replay; the old unrelated next-game action no longer competes with course navigation. Picture Adventures alternates five mechanics without adjacent repeats.


### Everyday object vocabulary library

The user-provided 100-category list contains 2,000 category entries. Canonicalising synonyms, plurals and repeated category appearances produces 1,136 named object concepts, each with its own original SVG illustration. This count is independent of the older composed story-scene variations. Homonyms such as a food nut and a fastening nut, a computer keyboard and a musical keyboard, receive different pictures. Repeated category references and spelling variants share one object; true aliases are documented in `art/vocabulary/concept-aliases.json`.

The Word pictures navigation opens a searchable library with all 100 categories, large picture views, optional written names, saved words on this device, and individual SVG/catalogue downloads. All 2,000 source entries remain linked to their object pictures. The 20-activity vocabulary course alternates meeting/naming words, choosing a named picture, collecting a visible picture list, face-up pairing, and supported grouping. Category pages can start practice for any category. Adults provide speech/sign/AAC modelling; the app does not recognise or score spoken names.

Pictures are reusable static assets under `dist/vocabulary/pictures/`. The shared renderer accepts `vocab:<object-id>` and is used by the new activities and the existing default adult-supported noun games. Checked speech-sound sets and exercises needing curated alternate drawings retain their existing assets. Every illustration recipe is included in `art/vocabulary/`; rebuild with `npm run build:vocabulary`. No external image/font service is needed.

All 1,136 images were checked for valid SVG, existing files, canvas bounds, and unique drawing geometry after removing colours and text labels. Contact sheets covering every assigned object were visually reviewed and ambiguous/clipped details were corrected. `tests/vocabulary-assets.cjs` verifies these structural invariants and all 100×20 source links. `tests/vocabulary-library.cjs` covers library browsing/search, saved words, downloads, all 20 course activities through 5 mechanics, retained touch/mouse drops, keyboard choices, cancellation, course return, and reuse in existing noun games. Visual resemblance is not a guarantee that every child will recognise a drawing; model unfamiliar words with real objects or photographs too.


### Continuous guided course play

The default guided course now goes from correct-answer feedback straight into the next activity. It records the completed practice and replaces the current activity route without painting an intermediate completion menu. The final activity has one clear course-end screen. Pause/Resume holds automatic progress; Finish for now returns to the course and cancels pending transitions. Self-paced stories, exploratory naming and movement still wait for a single Next activity action. Optional assisted step-by-step mode retains manual pacing.

Every guided activity has a visible Why we’re playing explanation underneath, based on its specific teaching goal. The home page offers a one-click starter course or resumes the first unexplored activity of the last course, while retaining all eight skill categories and course-goal pages.

`tests/course-flow.cjs` exercises the actual default Shape spotter path, a full six-activity course with matching/sorting/pairs, transitions between picture/vocabulary/support engines, wrong-answer retry, Pause/Resume, stopping during feedback, browser Back, course completion, restored keyboard focus, and mobile layout. Individual-engine regression fixtures deliberately pause at task boundaries using the `spotmatch-course-flow=manual` test preference, so they can inspect completion records; the default course flow is tested separately.


### Supported character poses

Sleeping scenes use a separate closed-eye head resting on a pillow, with the body under a duvet. Sitting animals have bent legs and a supporting seat. Shared action scenes use one pair of arms with hands placed against the held prop; pouring, handwashing, and shoe brushing include the person and supporting furniture. Story scenes place wheelchairs beside the bed during sleep.

`tests/natural-scenes.cjs` checks pillow/head and blanket/mattress contact in all four animal illustrations, seats, valid action SVGs, and all twelve story sleepers. The 96 canonical story panels and sleeping/seated character sheets were visually reviewed; automated contact and syntax checks supplement that review, rather than measuring how recognisable a picture is to a child.

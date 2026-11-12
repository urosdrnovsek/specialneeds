# Twenty short-word reading games

Seven new adult-supported courses contain 20 distinct activities and 80 top-level challenges. The complete reading library now has 19 courses, 56 games and 190 challenges; the complete guided library has 43 courses. The existing support-first home remains compact.

Each game shows its own purpose, a “Why this may help” explanation, an adaptation panel and a link to the IES teaching guide. Course and parent guidance include the existing research sources and an additional link to the FCRR teacher activity library. FCRR worksheets or artwork were not copied.

Read all the spellings and blend a word before checking its picture. Adult modelling is necessary without recorded voice. Correct screen choices may reflect help, copying, memory or elimination. This is supportive practice, not a validated reading intervention, assessment, mastery score or treatment for a disability. The extra counting, categorisation and puzzle tasks are identified separately from decoding.

| Course | Games | Main support |
| --- | --- | --- |
| Short words, real meanings | Picture-fish pond; delivery trolley; mixed-up sticker album | Word-to-meaning links, visible lists, editable checking |
| Word paths & syllable pieces | Domino trail; two-beat word train | Small linked steps; supported syllable assembly |
| Build, change & find words | One-letter change lab; picture crossword; hidden-word garden | Whole-word spelling attention and order |
| Word meanings & careful checking | Word-and-picture quilt; animal hotel/object store; missing-picture detective | Familiar vocabulary, categories, systematic list checking |
| The playful reading studio | Tiny comic director; read-and-paint; quantity maker | Verbs, two-word messages and written instructions with visible consequences |
| Read a small plan | Picture-lock safe; tiny recipe kitchen; space-snipping | Visible multistep plans and word boundaries |
| Little word & picture challenges | Picture bingo; word-window mosaic; syllable drum-bot | Predictable rereading, similar-word comparison and adult-modelled spoken syllables |

Choose by observed need. For decoding difficulties, teach and model the relevant sound–spelling links. For language difficulties, establish picture meanings and the extra concepts first. For developmental disabilities, offer one small modelled step at a time. Predictable still boards and short rounds may suit some autistic children or children with attention difficulties. Speech is never required; keep AAC, signing, pointing, keyboard and adult-entered responses available. Tap/select-place is available alongside dragging; no handwriting, timers, lives or compulsory speed demands are added.

Display settings offer syllable colours, separate b/d/p/g cues, or plain print. These are optional prompts, not an evidence-based colour treatment. A monosyllable such as dog stays one coloured chunk; nap|kin, bas|ket, hel|met and mit|ten use two colours and underlines. The modelled two-syllable activities are a supported next step. Doubled consonants do not automatically mean two speech sounds. Picture-choice settings apply on the next challenge; fixed puzzles retain their explicitly small boards. Display changes retain current work.

Successful rounds automatically praise and advance. Manual pacing remains available. Cargo, placed letters, swapped labels, collected pairs, domino links and comic frames persist during the challenge. Wrong moves can be retried or edited. Pause, stop, reset and stale callbacks are guarded. Shared comic creation is recorded as shared practice.

## Research and resource links

- [IES foundational reading guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/21): evidence for explicit sound–spelling links, decoding and analysing word parts; these principles do not validate a particular digital game.
- [Hall et al. (2023)](https://doi.org/10.1002/rrq.477): reading intervention meta-analysis; effects vary, and our games were not evaluated in that review.
- [Ehri (2020)](https://doi.org/10.1002/rrq.334): connections among spellings, pronunciations, meaning and word learning.
- [FCRR classroom activity library](https://fcrr.org/student-center-activities/kindergarten-and-first-grade): further adult-led phonics, syllable and vocabulary activity ideas; a resource collection, not an app trial.
- [W3C use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): provide information beyond colour.

## Verification

- Real application scripts exercised in LinkeDOM/VM: all 56 reading games and 190 challenges; automatic course progression, retry, saved practice, research routes and pause/stop checks.
- The 20 new games: all 80 challenges across 3 ink settings and 2 picture-choice settings, in default and manual pacing (480 rounds per pacing mode).
- Drag-handler paths for every new game, including editable errors, retained placement, paused input, stale callbacks after rerender and reset.
- Parent-home navigation: all eight support areas, 104 course links, back/reload/resume paths; the home remains 78 words.
- Full illustration inventory: 34,845 uses, 11,801 distinct inline SVGs, all 1,136 vocabulary illustrations, no missing named icons. Existing 219 contact/pose cases also pass.
- Static raster review of the 38 illustrations used by the new activities, including all 26 named object pictures, painted objects, six animal-action scenes and both drum-bot states.
- JavaScript syntax checks pass. Browser layout, actual keyboard focus behaviour and physical touch gestures are unverified: the managed browser tool is unavailable, and static art review/DOM tests do not replace browser tests.

Run `npm run check`, `npm run test:reading`, `node tests/parent-home-dom.cjs` and `npm run test:art` with LinkeDOM installed. The existing browser suite remains available for a supported browser environment. `scripts/export-word-play-art.cjs` exports the illustration cases for raster review.

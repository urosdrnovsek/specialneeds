# Blueprint implementation status — 14 November 2026

This is the first integrated implementation, not full sign-off against every blueprint requirement.

## Implemented

- Four navigation destinations with responsive styling: Find support, Courses, Research, My practice.
- Searchable/filterable access to 46 courses, preserving existing course and activity routes.
- Three versioned pilot courses, four stages each and 16 placements each: 29 interactive placements and 19 explicitly labelled offline/shared activities. No claim of 48 new games.
- Individual purposes, adult models, adaptations, entry knowledge and transfer ideas. Pilot curriculum is labelled as awaiting educator review.
- Local practice viewing and export/import, accepted-field validation and backup before import.
- Research browsing/search, review-depth/study-type filters, source links, correction flags and credential provenance. Fifteen journal candidates, 30 article references; 30 abstract-read draft summaries. Independent review is pending; candidate journals are not labelled verified.
- Existing input, progression and saved progress retained through adapters. Offline activities record shared participation, cancel delayed transitions on navigation and support pause/manual pacing.
- Structured curriculum and research validation, including duplicate identifiers, required teaching fields and source links.

## Verification performed

- Syntax/content checks passed.
- Studio DOM integration tests: all 48 placements open, all four stages display, searches/routes/research/practice operate.
- Fresh deep links: an offline and an interactive pilot activity load directly.
- Offline pause, exit cancellation, saved practice, correction visibility and review-depth filtering passed in automatic and manual modes.
- Existing reading suite passed: 56 reading games/190 challenges, 480 new-word-game rounds per pacing mode, drag-handler and pause/stale-event regressions.
- Parent-home DOM navigation passed.
- Art inventory and contact suite passed: 34,845 uses, 11,801 inline SVG variations, 1,136 object illustrations and 219 contact/pose cases.

## Still outstanding

- Independent educator review of the pilot curriculum and qualified editorial review of research notes.
- Complete journal credential verification and independent editorial review of the 30 abstract-based summaries.
- Actual browser layout, keyboard-focus and physical touch/device sign-off. Managed Sites requires its supported browser workflow; no callable cua_repl/browser tool was available. DOM tests are not browser/device tests.
- Full migration of legacy global scripts into the proposed module architecture and player interface; current work uses compatibility adapters.
- Complete release-wide storage migration/export coverage beyond course notes. Research filters and scheduled source checks are now implemented.
- Adult/child usability sessions, new photographic generalisation assets, fuller content sets and any further new mechanics needed after those reviews.

Do not describe this as all blueprint work finished or all device tests passed. The owner-private app exposes curriculum and research draft statuses explicitly.

## Follow-up implementation — 14 November

- Research now has 30 actual-abstract-based summaries with sources, corrected citations and explicit draft status. Twelve sources have publisher/API-reported open-access metadata; unverified language, age and access remain unknown. Full abstracts are retained only as internal provenance and are not deployed.
- Research filters include topic, year, participant age, teaching language, access, study design and review depth; filter URLs survive article navigation. Journal pages display metric year/source and indexing provenance. Original sources, corrections and legitimate full-text links are available.
- Version 2 practice export uses stable activity IDs and curriculum versions. Import accepts legacy files, merges achievements without erasing current notes, retains structured supports, backs up first and skips incompatible course versions. Pure core logic has an ES module entry point for gradual migration.
- Weekly research maintenance workflow produces a report for editors; it does not change approvals automatically. A first network run checked 53 source links: zero confirmed missing links and 30 unconfirmed responses (including protected publisher pages). Unconfirmed responses are not treated as valid or broken.
- Corrected pilot content that previously fell back to the Living Room vocabulary set: animal/object sorting, a missing-item board and a two-item kitchen errand. The picture recipe explicitly uses adult-read instructions.
- New tests cover stable-ID imports after reordering, version mismatch, merging, legacy input, all research filters, URL restoration, provenance, route cancellation and prereading content. Existing reading, parent navigation and contact tests pass.
- Browser/device testing remains unavailable under the current Sites preview requirements. Independent human curriculum/research review and broader usability sessions remain outstanding.

## Three interactive missions

Three previously offline placements are now new interactive game systems: Tool workshop (object functions), In/on/beside (spatial language) and The parcel road (a visible reading/delivery plan). Each has four challenges, direct tap/drag/keyboard actions, visible consequences, retry, pause, automatic/manual progression and specific adult adaptations. Longer courses are now linked within relevant support sections, and language support offers a direct workshop entry point.

Progress remains scoped: prior offline participation is retained but is not treated as completion of a new game. Updated courses use version3 and new stable activity IDs; versioned import/export recognises the new games explicitly.

Validation: all12 challenges through tap and drag descriptors in both pacing modes (48 rounds), wrong-move retention, connected-road navigation, actual loading/unloading, visible delivered parcels, stale input/timer guards, old-pause reset and progress-version checks. Sixteen new scene states were rasterised and statically reviewed; surface/floor contact and in-box occlusion have regression assertions. Full art inventory adds17 mission illustrations:34,862 uses and11,815 distinct inline SVGs; all1,136 object pictures remain. Existing reading and parent-navigation checks pass. Actual browser/device gestures and layout remain unverified.

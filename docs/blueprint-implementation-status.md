# Blueprint implementation status — 13 November 2026

This is the first integrated implementation, not full sign-off against every blueprint requirement.

## Implemented

- Four navigation destinations with responsive styling: Find support, Courses, Research, My practice.
- Searchable/filterable access to 46 courses, preserving existing course and activity routes.
- Three versioned pilot courses, four stages each and 16 placements each: 26 interactive placements reusing existing engines and 22 explicitly labelled offline/shared activities. No claim of 48 new games.
- Individual purposes, adult models, adaptations, entry knowledge and transfer ideas. Pilot curriculum is labelled as awaiting educator review.
- Local practice viewing and export/import, accepted-field validation and backup before import.
- Research browsing/search, review-depth/study-type filters, source links, correction flags and credential provenance. Fifteen journal candidates, 30 article references; four abstract-read draft summaries. Independent review is pending; candidate journals are not labelled verified.
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
- Complete journal credential verification and expansion from four abstract-read summaries toward the target of 30 reviewed articles.
- Actual browser layout, keyboard-focus and physical touch/device sign-off. Managed Sites requires its supported browser workflow; no callable cua_repl/browser tool was available. DOM tests are not browser/device tests.
- Full migration of legacy global scripts into the proposed module architecture and player interface; current work uses compatibility adapters.
- Broader research filters (age, year, language and access status), scheduling of ongoing source/retraction checks, and complete release-wide storage migration/export coverage beyond course notes.
- Adult/child usability sessions, new photographic generalisation assets, fuller content sets and any further new mechanics needed after those reviews.

Do not describe this as all blueprint work finished or all device tests passed. The owner-private app exposes curriculum and research draft statuses explicitly.

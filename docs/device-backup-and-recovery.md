# Device backup and recovery

Open **My practice → Device data & backup**, or:
https://spot-and-match-visual-course.blossomingchip1.chatgpt.site/#device

**Download practice backup** includes guided-course exploration, supported reading observations, previous game history, saved word pictures, rotation counters, the last course and display/pacing preferences. It uses the `spot-and-match` device-backup schema, version1. It excludes expert-review notes, unrelated site storage, recovery copies and internal undo/migration records. The existing course-only practice export/import remains available in My practice.

To restore, choose a file and inspect the preview. Restore merges exploration and collections, matches course versions and stable activity IDs, and retains existing supported reading observations. Unsupported groups, unknown activities/pictures and mismatched course observations are omitted. Existing resume information takes precedence. Display/pacing preferences change only if the checkbox is selected. A local copy of the affected data is taken first; **Undo the last restore** restores that copy without changing expert-review notes.

If local saving is unavailable, activities and notes remain usable for this visit. A notice explains the limitation. Download a practice backup (and export expert-review notes separately) before closing. **Try saving again** retries the pending writes. A successful retry persists the session's pending changes.

Unreadable or structurally invalid values are not loaded as progress. Their originals are retained in a separate recovery copy where the browser permits, or in session memory if storage is blocked. The app does not erase the original merely to load a default. Download recovery copies separately for troubleshooting, and keep them private. A recovery copy is not an importable practice backup.

## Programmer notes

`app-storage.js` provides a shared legacy-compatible adapter, known-key/schema checks, bounded parsing, dangerous-key rejection, session caching, preservation of corrupt raw values and pending writes. Group commit attempts roll back partial native writes; a failed commit retains the complete desired state in session memory for export or retry.

`studio-device-core.js` owns portable packing, stable-ID/versioned observation handling, historical-field filtering, merging and restore planning. `studio-device.js` owns the adult UI and applies restored state immediately without a reload. The ES module facade is `studio-modules/storage.mjs`; legacy globals continue through adapters.

All former direct app accesses to localStorage now use this adapter. No framework or hosting/audience change was introduced. The old reset buttons retain their existing scopes; expert review remains independent.

## Verification and limits

`npm run check`, `npm run test:device`, `npm run test:studio`, `npm run test:reading`, `npm run test:purposeful` and `npm run test:home` pass with the DOM fixture environment. New checks cover blocked property access/reads/writes, malformed nested data, quarantine preservation, partial native-write rollback, pending-write retry, backup preview/restore/undo, stable IDs after reordering, course-version mismatches, collection merge, settings opt-in, review-note isolation and missing-route recovery.

These tests simulate failures; they do not establish browser quota/private-mode behaviour, keyboard focus, responsive layout or physical touch behaviour. Supported browser/device sign-off and user usability sessions remain outstanding. Curriculum/research review is in progress and draft labels remain.

Rollback target before this increment: source commit `025d46b87b2117e0745e915035d1211edf630e89`, saved private Site version `appgprj_6af17265d76881919012b3cd4e2143a1~appgver_d9c5750d3cdc81918b969088bc0f12e8`. A Site rollback changes application files; it does not erase local data or expert notes. Restore backup compatibility should be checked before rolling back across storage schema changes.

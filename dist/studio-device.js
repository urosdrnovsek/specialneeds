'use strict';
const StudioDevice = (() => {
  const decode = (key, fallback) => {
    try {
      return JSON.parse(AppStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  };
  function refs() {
    const indices = n => Array.from({ length: n }, (_, i) => String(i)),
      flat = n => Object.fromEntries(indices(n).map(i => [i, true]));
    return {
      pictureIds: [...vocabularyObjects.keys()],
      replacedSupport: Object.entries(supportPathways).flatMap(([k, c]) =>
        c.games.flatMap((g, i) => (g.kind === 'mission' ? [k + ':' + i] : []))
      ),
      histories: {
        'spotmatch-v1': flat(courses.length),
        'spotmatch-learning-v1': Object.fromEntries(
          Object.entries(newCourseInfo).map(([k, c]) => [k, indices(c.games.length)])
        ),
        'spotmatch-support-v1': Object.fromEntries(
          Object.entries(supportPathways).map(([k, c]) => [k, indices(c.games.length)])
        ),
        'spotmatch-calm-v1': flat(calmActivities.length),
        'spotmatch-focus-v1': flat(focusGames.length),
        'spotmatch-playroom-v1': Object.fromEntries(playroomGames.map(g => [g.id, true])),
        'spotmatch-world-v1': flat(worldStories.length)
      }
    };
  }
  function apply(settings) {
    saved = decode('spotmatch-v1', {});
    learningProgress = decode('spotmatch-learning-v1', {});
    senProgress = decode('spotmatch-support-v1', {});
    calmProgress = decode('spotmatch-calm-v1', {});
    focusProgress = decode('spotmatch-focus-v1', {});
    prProgress = decode('spotmatch-playroom-v1', {});
    worldProgress = decode('spotmatch-world-v1', {});
    skillNotes = decode('spotmatch-course-notes-v1', {});
    pictureVisits = decode('spotmatch-picture-visits', {});
    vocabularySaved = decode('spotmatch-vocabulary-saved-v1', []).filter(id => vocabularyObjects.has(id));
    if (settings) {
      largerPictures = decode('spotmatch-comfort', false);
      document.body.classList.toggle('larger-pictures', largerPictures);
      wordPlayDisplay = decode('spotmatch-word-play-v1', { ink: 'syllables', choices: 2 });
      readingDisplay = decode('spotmatch-reading-display-v1', { colour: true });
      const flow = AppStorage.getItem('spotmatch-course-flow'),
        pace = AppStorage.getItem('spotmatch-answer-pace'),
        automatic = flow
          ? flow !== 'manual'
          : pace
            ? pace !== 'manual'
            : new URLSearchParams(location.search).get('flow') !== 'manual';
      CourseFlow.setAutomatic(automatic);
      if (flow === null) AppStorage.removeItem('spotmatch-course-flow');
      else AppStorage.setItem('spotmatch-course-flow', flow);
      if (pace === null) AppStorage.removeItem('spotmatch-answer-pace');
      else AppStorage.setItem('spotmatch-answer-pace', pace);
    }
  }
  function download(name, value) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function mountNotice() {
    let notice = document.getElementById('deviceNotice');
    if (!notice) {
      notice = document.createElement('p');
      notice.id = 'deviceNotice';
      notice.setAttribute('role', 'status');
      document.querySelector('footer').before(notice);
    }
    const update = () => {
      const s = AppStorage.status();
      notice.hidden = s.persistent && s.damaged.length === 0;
      notice.innerHTML =
        (!s.persistent
          ? 'Saving is unavailable. Work is kept for this visit; export it before closing.'
          : 'Some saved data could not be read. Your original data has been kept for recovery.') +
        ' <a href="#device">Device data & backup →</a>';
    };
    AppStorage.subscribe(update);
    update();
  }
  function render({ app, esc, heading, bind, registry }) {
    let incoming = null,
      preview = null;
    const catalog = registry();
    app.innerHTML =
      heading(
        'MY PRACTICE',
        'Keep your practice safe',
        'Back up this device or bring practice from another browser.'
      ) +
      '<div class="studio-device-grid"><section class="studio-card"><h2>A portable practice backup</h2><p>Includes course exploration, supported reading observations, earlier game history, picture collections, rotating sets and display preferences. Expert review notes have their own export in the review workspace.</p><button class="primary" id="deviceExport">Download practice backup</button><a href="#review" data-studio-go>Open expert review notes →</a></section><section class="studio-card"><h2>Bring practice here</h2><p>Existing exploration and picture collections are kept. Course versions must match; mismatched course observations are skipped. Preferences change only if you choose that below. For an older course-only export, use <a href="#practice" data-studio-go>Import practice file in My practice</a>.</p><label>Choose a practice backup<input id="deviceImport" type="file" accept="application/json"></label><label><input id="deviceSettings" type="checkbox"> Also restore display and pacing preferences</label><p id="devicePreview" role="status">Choose a file to see what can be restored.</p><button class="primary" id="deviceRestore" disabled>Restore practice</button></section><section class="studio-card"><h2>Saving on this browser</h2><p id="deviceState"></p><button id="deviceRetry" class="secondary">Try saving again</button><p id="deviceRestoreStatus" role="status"></p></section><section class="studio-card"><h2>Recovery copy</h2><p>Unreadable data is kept separately and is never used as game progress. A downloaded recovery copy is for troubleshooting; keep it private.</p><p id="deviceRecoveryCount"></p><button id="deviceRecovery" class="secondary">Download recovery copy</button><button id="deviceUndo" class="secondary">Undo the last restore</button><p>Undo returns practice and preferences to the local copy taken immediately before the last restore. Review notes are kept separately.</p></section></div>';
    const status = () => {
      const s = AppStorage.status();
      app.querySelector('#deviceState').textContent = s.persistent
        ? 'Saving is available on this device.'
        : 'Saving is unavailable. This visit still works, but download a backup before closing.';
      const count = Object.keys(AppStorage.recovery()).length;
      app.querySelector('#deviceRecoveryCount').textContent = count + ' saved data groups held for recovery.';
      app.querySelector('#deviceRecovery').disabled = count === 0;
      app.querySelector('#deviceUndo').disabled = !AppStorage.getItem('spotmatch-device-backup-v1');
    };
    function prepare() {
      if (!incoming) return;
      try {
        preview = StudioDeviceCore.plan(
          incoming,
          AppStorage.snapshot(),
          catalog,
          StudioCore,
          AppStorage,
          refs(),
          { settings: app.querySelector('#deviceSettings').checked }
        );
        app.querySelector('#devicePreview').textContent =
          preview.groups +
          ' data groups ready. ' +
          preview.skippedVersions +
          ' course versions skipped. ' +
          preview.warnings.length +
          ' unsupported or invalid groups omitted.';
        app.querySelector('#deviceRestore').disabled = false;
      } catch (error) {
        preview = null;
        app.querySelector('#devicePreview').textContent = error.message;
        app.querySelector('#deviceRestore').disabled = true;
      }
    }
    app.querySelector('#deviceExport').onclick = () => {
      download(
        'spot-match-device-backup.json',
        StudioDeviceCore.pack(AppStorage.snapshot(), catalog, StudioCore)
      );
      status();
    };
    app.querySelector('#deviceRecovery').onclick = () =>
      download('spot-match-recovery.json', {
        app: 'spot-and-match-recovery',
        savedAt: new Date().toISOString(),
        data: AppStorage.recovery()
      });
    app.querySelector('#deviceRetry').onclick = () => {
      AppStorage.retry();
      status();
    };
    app.querySelector('#deviceSettings').onchange = prepare;
    app.querySelector('#deviceImport').onchange = async e => {
      incoming = null;
      preview = null;
      app.querySelector('#deviceRestore').disabled = true;
      try {
        const file = e.target.files?.[0];
        if (!file || file.size > 4000000) throw Error('Choose a Spot & Match practice backup below 4 MB.');
        incoming = JSON.parse(await file.text());
        prepare();
      } catch (error) {
        app.querySelector('#devicePreview').textContent = error.message;
      }
    };
    app.querySelector('#deviceRestore').onclick = () => {
      if (!preview) return;
      try {
        prepare();
        if (!preview) return;
        const before = AppStorage.snapshot(),
          entries = preview.entries;
        const undo = {
          entries: Object.fromEntries(Object.keys(entries).map(k => [k, before[k] ?? null])),
          settings: app.querySelector('#deviceSettings').checked
        };
        AppStorage.setItem('spotmatch-device-backup-v1', JSON.stringify(undo));
        const state = AppStorage.commit(entries);
        apply(undo.settings);
        app.querySelector('#deviceRestoreStatus').textContent = state.persistent
          ? 'Practice restored. Your previous local data is available through Undo.'
          : 'Practice restored for this visit. Download a backup before closing; saving is unavailable.';
        preview = null;
        incoming = null;
        app.querySelector('#deviceRestore').disabled = true;
        status();
      } catch (error) {
        app.querySelector('#deviceRestoreStatus').textContent = 'Could not restore: ' + error.message;
      }
    };
    app.querySelector('#deviceUndo').onclick = () => {
      try {
        const undo = decode('spotmatch-device-backup-v1', null);
        if (!undo?.entries) throw Error('No restore backup is available.');
        for (const k of Object.keys(undo.entries))
          if (
            !Object.hasOwn(AppStorage.definitions, k) ||
            ['review', 'internal'].includes(AppStorage.definitions[k].group)
          )
            throw Error('The saved restore copy is not valid.');
        const state = AppStorage.commit(undo.entries);
        AppStorage.removeItem('spotmatch-device-backup-v1');
        apply(undo.settings === true);
        app.querySelector('#deviceRestoreStatus').textContent = state.persistent
          ? 'The last restore was undone.'
          : 'The last restore was undone for this visit. Download a backup before closing.';
        status();
      } catch (error) {
        app.querySelector('#deviceRestoreStatus').textContent = error.message;
      }
    };
    status();
    bind();
  }
  return { refs, apply, render, mountNotice };
})();

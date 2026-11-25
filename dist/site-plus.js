'use strict';
// Site layer, loaded after Studio:
//  13 "Where do I start?" setup with recommendations       (#setup, home banner)
//  14 a visual "My practice" map without scores              (#practice decoration)
//  15 calmer course pages: one "For the adult" section       (course decoration, level picker)
//  16 settings page: text size, contrast, theme, motion       (#settings, header button)
//      plus sound, access, child mode, visit goal, language
//  17 a "More" page gathering research, word pictures, picture check, settings and professional pages
//  10 picture check: adults mark pictures a child does not recognise; games then avoid them
//  19 registers the offline service worker
const SitePlus = (() => {
  const app = document.getElementById('app');
  const T = (k, v) => I18n.t(k, v);
  const esc = s => senEscape(String(s ?? ''));
  const PROFILE = 'spotmatch-profile-v1';
  const CHECK = 'spotmatch-picture-check-v1';
  const read = key => {
    try {
      return JSON.parse(AppStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      AppStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };
  const course = id => {
    try {
      return skillCourseGet(id).course;
    } catch {
      return null;
    }
  };
  const go = hash => Studio.go(hash);

  // ---------- shared bits ----------
  function hero(eyebrow, title, lead) {
    return (
      '<section class="studio-hero ds-page-hero"><span class="eyebrow">' +
      esc(eyebrow) +
      '</span><h1>' +
      esc(title) +
      '</h1>' +
      (lead ? '<p>' + esc(lead) + '</p>' : '') +
      '</section>'
    );
  }
  function courseCard(c, extra = '') {
    return (
      '<a class="ds-mini-course" href="#course/' +
      c.id +
      '" data-site-go="#course/' +
      c.id +
      '"><span class="ds-mini-art" aria-hidden="true">' +
      DesignCovers.course(c) +
      '</span><span class="ds-mini-copy"><b>' +
      esc(c.title) +
      '</b><small>' +
      esc(c.goal) +
      '</small>' +
      extra +
      '</span></a>'
    );
  }
  function bindLinks(root = app) {
    root.querySelectorAll('[data-site-go]').forEach(a => {
      a.onclick = e => {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        go(a.dataset.siteGo);
      };
    });
  }
  function radios(name, label, options, value, help = '') {
    return (
      '<fieldset class="ds-field"><legend>' +
      esc(label) +
      '</legend>' +
      (help ? '<p class="ds-help">' + esc(help) + '</p>' : '') +
      '<div class="ds-options">' +
      options
        .map(
          ([v, text]) =>
            '<label class="ds-option"><input type="radio" name="' +
            name +
            '" value="' +
            esc(v) +
            '" ' +
            (String(v) === String(value) ? 'checked' : '') +
            '><span>' +
            esc(text) +
            '</span></label>'
        )
        .join('') +
      '</div></fieldset>'
    );
  }

  // ---------- 16. settings ----------
  function settingsPage() {
    const p = Prefs.all();
    app.innerHTML =
      hero(
        T('settings').toUpperCase(),
        T('settings'),
        'These settings are saved in this browser for everyone who uses it.'
      ) +
      '<form class="ds-settings" id="dsSettings">' +
      '<section class="ds-panel"><h2>Display</h2>' +
      radios(
        'textSize',
        'Text and picture size',
        [
          ['normal', 'Normal'],
          ['large', 'Large'],
          ['larger', 'Larger']
        ],
        p.textSize
      ) +
      radios(
        'contrast',
        'Contrast',
        [
          ['normal', 'Normal'],
          ['high', 'High contrast']
        ],
        p.contrast
      ) +
      radios(
        'theme',
        'Theme',
        [
          ['light', 'Light'],
          ['dark', 'Dark'],
          ['system', 'Same as this device']
        ],
        p.theme,
        'In the dark theme, picture cards stay light so drawings remain clear.'
      ) +
      radios(
        'motion',
        'Movement',
        [
          ['system', 'Same as this device'],
          ['reduce', 'Reduce movement']
        ],
        p.motion
      ) +
      '</section><section class="ds-panel"><h2>Playing</h2>' +
      radios(
        'visitGoal',
        'Activities per visit',
        [
          [0, 'No limit (keep going)'],
          [2, '2'],
          [3, '3'],
          [5, '5']
        ],
        p.visitGoal,
        'After this many activities the app shows “That’s today’s visit” and lets you choose to stop or keep going.'
      ) +
      radios(
        'childMode',
        'Child mode',
        [
          ['false', 'Off'],
          ['true', 'On']
        ],
        String(p.childMode),
        'Hides menus and adult notes. Leave child mode by pressing and holding the lock button for 2 seconds.'
      ) +
      '</section><section class="ds-panel"><h2>Sound</h2>' +
      radios(
        'sound',
        'Sound effects',
        [
          ['false', 'Off'],
          ['true', 'On']
        ],
        String(p.sound),
        'Soft sounds for tapping, right answers, “try again” and finishing. The app never speaks or records.'
      ) +
      '<label class="ds-field ds-range">Volume <input type="range" name="volume" min="0" max="1" step="0.1" value="' +
      p.volume +
      '"></label><button type="button" class="secondary" id="dsTestSound">Play a test sound</button>' +
      '</section><section class="ds-panel"><h2>Access</h2>' +
      radios(
        'access',
        'How the child selects',
        [
          ['touch', 'Touch, mouse or keyboard'],
          ['scan1', 'One switch: automatic scanning'],
          ['scan2', 'Two switches: step and select'],
          ['dwell', 'Dwell: hold the pointer still to select (eye-gaze, head pointer)']
        ],
        p.access,
        'Switches should send Space or Enter. Scanning highlights each button in the game in turn.'
      ) +
      radios(
        'scanSpeed',
        'Scanning speed',
        [
          [1200, 'Fast'],
          [2000, 'Medium'],
          [3200, 'Slow']
        ],
        p.scanSpeed
      ) +
      radios(
        'dwellTime',
        'Dwell time',
        [
          [800, 'Short'],
          [1200, 'Medium'],
          [2000, 'Long']
        ],
        p.dwellTime
      ) +
      '</section><section class="ds-panel"><h2>Language</h2>' +
      radios(
        'language',
        'Interface language',
        Object.entries(I18n.languages),
        p.language,
        'Menus, the course bar, help and visit screens are translated. Game instructions and reading games are still in English.'
      ) +
      '</section></form><p><a href="#setup" data-site-go="#setup">Answer the three start questions again →</a></p>';
    const form = app.querySelector('#dsSettings');
    form.onchange = e => {
      const el = e.target,
        name = el.name;
      if (!name) return;
      let v = el.value;
      if (['visitGoal', 'scanSpeed', 'dwellTime'].includes(name)) v = Number(v);
      else if (['childMode', 'sound'].includes(name)) v = v === 'true';
      else if (name === 'volume') v = Number(v);
      try {
        Prefs.set(name, v);
      } catch {}
      if (name === 'sound' && v) PlayPlus.Sound.good();
      if (name === 'language') rerender();
    };
    app.querySelector('#dsTestSound').onclick = () => {
      const on = Prefs.get('sound');
      if (!on) Prefs.set('sound', true);
      PlayPlus.Sound.good();
      if (!on) setTimeout(() => Prefs.set('sound', false), 600);
    };
    bindLinks();
  }

  // ---------- 13. setup ----------
  const AREAS = [
    ['language', 'Understanding words and messages'],
    ['dyslexia', 'Letters, sounds and starting to read'],
    ['attention', 'Attention and planning'],
    ['autism', 'Shared understanding and routines'],
    ['development', 'Learning in small steps'],
    ['speech', 'Speaking and communicating'],
    ['motor', 'Using hands, touch or controls'],
    ['calm', 'Calm, breaks and movement']
  ];
  function recommendations(profile) {
    const ids = [];
    for (const area of profile.areas || []) {
      const section = parentSupportSections.find(s => s.id === area);
      for (const id of [...(section?.courses || []), ...(section?.readingCourses || [])]) {
        const c = course(id);
        if (c && !c.mergedInto && !ids.includes(id)) ids.push(id);
        if (ids.length >= 2 * (profile.areas || []).length) break;
      }
    }
    return ids.slice(0, 4).map(course).filter(Boolean);
  }
  function applyProfile(profile) {
    Prefs.set('visitGoal', profile.age === 'under5' ? 2 : 3);
    if (profile.answer === 'switch') Prefs.set('access', 'scan1');
    else if (Prefs.get('access') === 'scan1' || Prefs.get('access') === 'scan2') Prefs.set('access', 'touch');
    const levels = { ...Prefs.get('levels') };
    for (const c of recommendations(profile))
      if (!levels[c.id]) levels[c.id] = profile.age === 'under5' ? 'gentle' : 'standard';
    Prefs.set('levels', levels);
  }
  function setupPage() {
    const p = read(PROFILE) || { age: '', areas: [], answer: '' };
    app.innerHTML =
      hero(
        'WHERE DO I START?',
        'Three quick questions',
        'We will suggest a starting point and comfortable settings. Nothing is assessed, and you can change everything later.'
      ) +
      '<form class="ds-setup" id="dsSetup">' +
      '<section class="ds-panel">' +
      radios(
        'age',
        '1. How old is the child?',
        [
          ['under5', 'Under 5'],
          ['5to7', '5 to 7'],
          ['8plus', '8 or older']
        ],
        p.age
      ) +
      '</section><section class="ds-panel"><fieldset class="ds-field"><legend>2. What is hardest right now? Choose one or two.</legend><div class="ds-options">' +
      AREAS.map(
        ([id, label]) =>
          '<label class="ds-option"><input type="checkbox" name="areas" value="' +
          id +
          '" ' +
          ((p.areas || []).includes(id) ? 'checked' : '') +
          '><span>' +
          esc(label) +
          '</span></label>'
      ).join('') +
      '</div></fieldset></section><section class="ds-panel">' +
      radios(
        'answer',
        '3. How does the child usually answer?',
        [
          ['touch', 'Pointing or touching'],
          ['speech', 'Speaking'],
          ['aac', 'Signing or an AAC device'],
          ['switch', 'A switch or eye-gaze']
        ],
        p.answer
      ) +
      '</section><p class="ds-setup-error" role="alert"></p><button class="primary" id="dsSetupDone">Show my starting point →</button></form>';
    const form = app.querySelector('#dsSetup');
    form.onchange = e => {
      if (e.target.name === 'areas') {
        const checked = [...form.querySelectorAll('[name="areas"]:checked')];
        if (checked.length > 2) e.target.checked = false;
      }
    };
    form.onsubmit = e => {
      e.preventDefault();
      const data = new FormData(form);
      const profile = {
        age: data.get('age') || '',
        areas: data.getAll('areas'),
        answer: data.get('answer') || ''
      };
      if (!profile.age || !profile.areas.length || !profile.answer) {
        form.querySelector('.ds-setup-error').textContent = 'Please answer all three questions.';
        return;
      }
      write(PROFILE, profile);
      applyProfile(profile);
      setupResult(profile);
    };
  }
  function setupResult(profile) {
    const recs = recommendations(profile);
    const notes = [
      'Visits: ' + Prefs.get('visitGoal') + ' activities, then a pause screen (change in Settings).',
      profile.answer === 'switch' ? 'Access: one-switch scanning is on (Space or Enter selects).' : '',
      profile.answer === 'aac'
        ? 'Keep the child’s usual AAC system nearby; every game accepts pointing or an adult tapping for them.'
        : '',
      profile.answer === 'speech'
        ? 'The app does not listen; say answers together and let the child tap or point.'
        : '',
      profile.age === 'under5' ? 'Courses start on the Gentler level (fewer pictures to choose from).' : ''
    ].filter(Boolean);
    app.innerHTML =
      hero(
        'YOUR STARTING POINT',
        'Start with one of these',
        'Pick one. Try one or two activities, then see how it went.'
      ) +
      '<section class="ds-mini-grid">' +
      recs.map(c => courseCard(c)).join('') +
      '</section><section class="ds-panel"><h2>We set up</h2><ul>' +
      notes.map(n => '<li>' + esc(n) + '</li>').join('') +
      '</ul><p><a href="#settings" data-site-go="#settings">Change settings →</a> · <a href="#setup" data-site-go="#setup" id="dsSetupAgain">Change answers →</a></p></section>';
    bindLinks();
    app.querySelector('#dsSetupAgain').onclick = e => {
      e.preventDefault();
      setupPage();
    };
  }

  // ---------- 17. More ----------
  function morePage() {
    const items = [
      ['#setup', 'Where do I start?', 'Three questions and a suggested starting point.'],
      [
        '#settings',
        T('settings'),
        'Text size, contrast, dark theme, sound, switch access, child mode and language.'
      ],
      ['#research', 'Research and evidence', 'What the activities are based on, and their limits.'],
      ['#vocabulary', 'Word pictures', 'Browse 1,136 everyday pictures by category.'],
      [
        '#picture-check',
        'Picture check',
        'Check which pictures your child recognises; games then avoid the others.'
      ],
      ['?library=playroom', T('nav.free'), 'Open-ended play without a course.'],
      ['?library=full', 'All original games', 'The full original catalogue.'],
      ['#review', 'For professionals: expert review', 'Review and comment on course drafts.'],
      ['#device', 'Device data and backup', 'Save, restore or clear what this browser keeps.']
    ];
    app.innerHTML =
      hero('MORE', 'Everything else', '') +
      '<div class="ds-more-grid">' +
      items
        .map(
          ([href, title, text]) =>
            '<a class="ds-more-item" href="' +
            href +
            '" ' +
            (href.startsWith('#') ? 'data-site-go="' + href + '"' : '') +
            '><b>' +
            esc(title) +
            '</b><small>' +
            esc(text) +
            '</small></a>'
        )
        .join('') +
      '</div>';
    bindLinks();
  }

  // ---------- 10. picture check ----------
  let checkState = null;
  function flagged() {
    const map = read(CHECK) || {};
    return new Set(Object.keys(map).filter(k => map[k] === true));
  }
  function pictureCheckPage() {
    const cats = [...vocabularyCategories.values()];
    const map = read(CHECK) || {};
    if (!checkState) checkState = { category: cats[0].id, index: 0 };
    const ids = vocabularyCategoryIds(checkState.category, true);
    const id = ids[checkState.index % ids.length];
    const marked = Object.keys(map).filter(k => map[k] === true);
    app.innerHTML =
      hero(
        'PICTURE CHECK',
        'Does your child recognise this?',
        'Show each picture and ask the child to name it, sign it or point to the real thing. Mark it. Games on this device then avoid pictures marked “Not recognised”.'
      ) +
      '<section class="ds-panel ds-check"><label class="ds-field">Category <select id="dsCheckCat">' +
      cats
        .map(
          c =>
            '<option value="' +
            esc(c.id) +
            '" ' +
            (c.id === checkState.category ? 'selected' : '') +
            '>' +
            esc(c.name) +
            '</option>'
        )
        .join('') +
      '</select></label><div class="ds-check-picture">' +
      vocabularyImage(id) +
      '</div><p class="ds-check-name"><span class="ds-check-count">' +
      ((checkState.index % ids.length) + 1) +
      ' / ' +
      ids.length +
      '</span> <b>' +
      esc(vocabularyObjects.get(id).label) +
      '</b>' +
      (map[id] === true ? ' · marked not recognised' : map[id] === false ? ' · marked recognised' : '') +
      '</p><div class="ds-visit-actions"><button class="primary" data-check="yes">✓ Recognised</button><button class="secondary" data-check="no">✕ Not recognised</button><button class="back" data-check="skip">Skip</button></div></section>' +
      '<section class="ds-panel"><h2>Not recognised on this device (' +
      marked.length +
      ')</h2>' +
      (marked.length
        ? '<ul class="ds-check-list">' +
          marked
            .map(
              k =>
                '<li>' +
                esc(vocabularyObjects.get(k)?.label || k) +
                ' <button class="back" data-uncheck="' +
                esc(k) +
                '">Use again</button></li>'
            )
            .join('') +
          '</ul>'
        : '<p>None yet.</p>') +
      '</section>';
    app.querySelector('#dsCheckCat').onchange = e => {
      checkState = { category: e.target.value, index: 0 };
      pictureCheckPage();
    };
    app.querySelectorAll('[data-check]').forEach(
      b =>
        (b.onclick = () => {
          const m = read(CHECK) || {};
          if (b.dataset.check !== 'skip') m[id] = b.dataset.check === 'no';
          write(CHECK, m);
          checkState.index++;
          pictureCheckPage();
          app.querySelector('[data-check="yes"]')?.focus({ preventScroll: true });
        })
    );
    app.querySelectorAll('[data-uncheck]').forEach(
      b =>
        (b.onclick = () => {
          const m = read(CHECK) || {};
          delete m[b.dataset.uncheck];
          write(CHECK, m);
          pictureCheckPage();
        })
    );
  }
  // Games avoid pictures an adult marked "not recognised", as long as at least four pictures remain.
  if (typeof vocabularyCategoryIds === 'function') {
    const baseIds = vocabularyCategoryIds;
    vocabularyCategoryIds = function (category, all) {
      const ids = baseIds(category);
      if (all) return ids;
      const skip = flagged();
      if (!skip.size) return ids;
      const kept = ids.filter(id => !skip.has(id));
      return kept.length >= 4 ? kept : ids;
    };
  }

  // ---------- 14. practice map ----------
  function stagePlan(c) {
    if (c.stages) return c.stages.map(s => ({ label: s.title, size: s.size }));
    if (c.pilot)
      return ['Explore together', 'Practise with support', 'Try new examples', 'Use and revisit'].map(
        label => ({ label, size: 4 })
      );
    return [{ label: c.title, size: c.activities.length }];
  }
  function practiceMap(c) {
    const plan = stagePlan(c);
    let index = 0;
    const done = c.activities.map((a, i) => skillExplored(a, c.id, i));
    const next = done.indexOf(false);
    const stages = plan
      .map(st => {
        const dots = Array.from({ length: st.size }, () => {
          const i = index++;
          return (
            '<i class="' +
            (done[i] ? 'done' : i === next ? 'next' : '') +
            '" title="' +
            esc(skillTitle(c.activities[i])) +
            '"></i>'
          );
        }).join('');
        return (
          '<div class="ds-stage-dots"><small>' + esc(st.label) + '</small><span>' + dots + '</span></div>'
        );
      })
      .join('');
    const count = done.filter(Boolean).length;
    return (
      '<article class="ds-practice-item"><span class="ds-mini-art" aria-hidden="true">' +
      DesignCovers.course(c) +
      '</span><div><h3>' +
      esc(c.title) +
      '</h3><p class="ds-practice-count">' +
      count +
      ' of ' +
      c.activities.length +
      ' activities explored</p>' +
      stages +
      (next >= 0
        ? '<button class="primary" data-practice-next="' +
          c.id +
          ':' +
          next +
          '">Next: ' +
          esc(skillTitle(c.activities[next])) +
          ' →</button>'
        : '<button class="secondary" data-site-go="#course/' + c.id + '">Revisit any activity →</button>') +
      '</div></article>'
    );
  }
  function decoratePractice({ registry }) {
    let recent = null;
    try {
      recent = JSON.parse(AppStorage.getItem('spotmatch-last-course-v1') || 'null');
    } catch {}
    const started = registry().filter(
      c =>
        !c.mergedInto && (c.activities.some((a, i) => skillExplored(a, c.id, i)) || recent?.courseId === c.id)
    );
    const grid = app.querySelector('.studio-grid');
    if (!grid) return;
    const section = document.createElement('section');
    section.className = 'ds-practice';
    section.setAttribute('aria-label', 'Practice map');
    section.innerHTML = started.length
      ? '<h2>Where you are</h2><p class="ds-help">Filled dots are activities you have explored together. This is a map, not a score.</p>' +
        started.map(practiceMap).join('')
      : '<div class="ds-panel"><h2>Nothing explored yet</h2><p>Start with a course, or answer three questions for a suggestion.</p><p><a href="#setup" data-site-go="#setup">Where do I start? →</a></p></div>';
    grid.before(section);
    grid.style.display = 'none';
    section.querySelectorAll('[data-practice-next]').forEach(b => {
      b.onclick = () => {
        const [id, i] = b.dataset.practiceNext.split(':');
        skillLaunch(id, +i);
      };
    });
    bindLinks(section);
  }

  // ---------- 15. calmer course pages + 4. level picker ----------
  function decorateCourse(c) {
    const activities = app.querySelector('.skill-course-activities');
    if (!activities) return;
    const groupItems = [
      app.querySelector('.studio-notice'),
      ...[...app.querySelectorAll('details.skill-notes')].filter(
        d => !/Optional notes/.test(d.querySelector('summary')?.textContent || '')
      )
    ].filter(Boolean);
    let adult = app.querySelector('#dsCourseAdult');
    if (!adult) {
      adult = document.createElement('details');
      adult.id = 'dsCourseAdult';
      adult.className = 'skill-notes ds-course-adult';
      adult.innerHTML =
        '<summary>For the adult: level, how to support, evidence and limits</summary><div class="ds-course-adult-body"></div>';
      const anchor = app.querySelector('.skill-real-life') || activities.nextSibling;
      activities.parentNode.insertBefore(adult, anchor);
    }
    const body = adult.querySelector('.ds-course-adult-body');
    const level = Prefs.level(c.id),
      suggestion = Prefs.suggestion(c.id);
    body.innerHTML =
      '<fieldset class="ds-field ds-level" id="dsLevel"><legend>' +
      esc(T('level.title')) +
      '</legend><p class="ds-help">' +
      esc(T('level.help')) +
      '</p><div class="ds-options">' +
      ['gentle', 'standard', 'stretch']
        .map(
          l =>
            '<label class="ds-option"><input type="radio" name="dsLevel" value="' +
            l +
            '" ' +
            (l === level ? 'checked' : '') +
            '><span>' +
            esc(T('level.' + l)) +
            '</span></label>'
        )
        .join('') +
      '</div>' +
      (suggestion
        ? '<p class="ds-suggest" role="status">' + esc(T('level.suggest.' + suggestion)) + '</p>'
        : '') +
      '</fieldset>';
    for (const item of groupItems) body.append(item);
    body
      .querySelectorAll('[name="dsLevel"]')
      .forEach(r => (r.onchange = () => Prefs.setLevel(c.id, r.value)));
    if (suggestion) adult.open = true;
  }

  // ---------- 13/18. home ----------
  function decorateHome() {
    const welcome = app.querySelector('.studio-welcome');
    if (!welcome || app.querySelector('.ds-start')) return;
    const profile = read(PROFILE);
    const box = document.createElement('section');
    box.className = 'ds-start';
    if (profile?.areas?.length) {
      const recs = recommendations(profile).slice(0, 3);
      box.innerHTML =
        '<div class="ds-start-head"><h2>Suggested for you</h2><a href="#setup" data-site-go="#setup">Change answers</a></div><div class="ds-mini-grid">' +
        recs.map(c => courseCard(c)).join('') +
        '</div>';
    } else
      box.innerHTML =
        '<a class="ds-start-cta" href="#setup" data-site-go="#setup"><span aria-hidden="true">🧭</span><span><b>Not sure where to start?</b><small>Answer three quick questions and get a suggested starting point.</small></span><span aria-hidden="true">→</span></a>';
    welcome.after(box);
    bindLinks(box);
  }

  // ---------- header settings button ----------
  function headerButton() {
    const header = document.querySelector('header');
    if (!header || document.getElementById('dsSettingsButton')) return;
    const a = document.createElement('a');
    a.id = 'dsSettingsButton';
    a.className = 'ds-settings-button';
    a.href = '#settings';
    a.setAttribute('aria-label', T('settings'));
    a.title = T('settings');
    a.textContent = '⚙';
    a.onclick = e => {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      go('#settings');
    };
    header.append(a);
  }
  function rerender() {
    headerButton();
    document.getElementById('dsSettingsButton')?.setAttribute('aria-label', T('settings'));
    if (typeof Studio !== 'undefined') Studio.route();
    document.querySelector('.ds-skip') && (document.querySelector('.ds-skip').textContent = T('skip'));
  }
  Prefs.onChange(key => {
    if (key === 'language') rerender();
  });
  // Some legacy paths redraw the home without Studio's hook; add the start box whenever it is missing.
  new MutationObserver(() => {
    if (app.querySelector('.studio-welcome') && !app.querySelector('.ds-start')) decorateHome();
  }).observe(app, { childList: true });
  headerButton();

  // ---------- 19. offline ----------
  // Automated test browsers skip it unless the page is opened with ?sw=on (used by the offline test).
  if (
    'serviceWorker' in navigator &&
    (!navigator.webdriver || /[?&]sw=on\b/.test(AppRouter.opened)) &&
    /^https?:$/.test(location.protocol)
  )
    navigator.serviceWorker.register('sw.js').catch(() => {});

  function page(name) {
    if (name === 'settings') settingsPage();
    else if (name === 'setup') setupPage();
    else if (name === 'picture-check') pictureCheckPage();
    else morePage();
    window.scrollTo(0, 0);
  }
  return { page, decoratePractice, decorateCourse, decorateHome, recommendations, flagged };
})();
// Every layer has loaded: render the URL the visitor opened (or re-render if something already started it).
if (!AppRouter.started) AppRouter.start();
else Studio.route();

'use strict';
// Adult preferences and interface language. Loaded straight after app-storage.js so the display
// settings (text size, contrast, theme, motion) apply before the first screen is drawn.
// All reads and writes go through AppStorage ('spotmatch-preferences-v1' is allowlisted there).
const Prefs = (() => {
  const KEY = 'spotmatch-preferences-v1';
  const defaults = {
    textSize: 'normal', // normal | large | larger
    contrast: 'normal', // normal | high
    theme: 'light', // light | dark | system
    motion: 'system', // system | reduce
    sound: false, // optional sound effects, off by default
    volume: 0.5,
    access: 'touch', // touch | scan1 (one switch, auto scan) | scan2 (two switches) | dwell
    scanSpeed: 2000, // ms per item for automatic scanning
    dwellTime: 1200, // ms to hover before a dwell selection
    childMode: false,
    language: 'en', // en | sl
    visitGoal: 0, // activities per visit; 0 = no limit (automatic progression continues)
    levels: {}, // courseId -> gentle | standard | stretch
    results: {} // courseId -> recent activity results [{retries}] for level suggestions
  };
  const allowed = {
    textSize: ['normal', 'large', 'larger'],
    contrast: ['normal', 'high'],
    theme: ['light', 'dark', 'system'],
    motion: ['system', 'reduce'],
    access: ['touch', 'scan1', 'scan2', 'dwell'],
    language: ['en', 'sl'],
    visitGoal: [0, 2, 3, 5]
  };
  let state = { ...defaults };
  const listeners = new Set();
  function load() {
    try {
      const raw = AppStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) : {};
      state = { ...defaults };
      for (const [k, v] of Object.entries(saved || {})) {
        if (!(k in defaults)) continue;
        if (allowed[k] && !allowed[k].includes(v)) continue;
        if (typeof v !== typeof defaults[k]) continue;
        state[k] = v;
      }
    } catch {
      state = { ...defaults };
    }
  }
  function save() {
    try {
      AppStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }
  function apply() {
    const root = document.documentElement;
    root.dataset.text = state.textSize;
    root.dataset.contrast = state.contrast;
    const dark =
      state.theme === 'dark' ||
      (state.theme === 'system' && matchMedia?.('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.motion =
      state.motion === 'reduce' || matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'reduce'
        : 'full';
    root.dataset.access = state.access;
    root.lang = state.language === 'sl' ? 'sl' : 'en';
    document.body?.classList.toggle('ds-child-mode', !!state.childMode);
  }
  load();
  apply();
  return {
    defaults,
    allowed,
    get(key) {
      return state[key];
    },
    all() {
      return { ...state };
    },
    set(key, value) {
      if (!(key in defaults)) throw Error('Unknown preference ' + key);
      if (allowed[key] && !allowed[key].includes(value)) throw Error('Invalid value for ' + key);
      state[key] = value;
      save();
      apply();
      for (const f of listeners)
        try {
          f(key, value);
        } catch {}
    },
    level(courseId) {
      return state.levels[courseId] || 'standard';
    },
    setLevel(courseId, level) {
      if (!['gentle', 'standard', 'stretch'].includes(level)) throw Error('Invalid level');
      this.set('levels', { ...state.levels, [courseId]: level });
    },
    record(courseId, result) {
      const list = [...(state.results[courseId] || []), result].slice(-6);
      this.set('results', { ...state.results, [courseId]: list });
    },
    /** Suggests a level from recent results, or null. Advisory only: never scores the child. */
    suggestion(courseId) {
      const list = state.results[courseId] || [];
      if (list.length < 3) return null;
      const last = list.slice(-3);
      const level = this.level(courseId);
      if (level !== 'stretch' && last.every(r => r.retries === 0)) return 'stretch';
      if (level !== 'gentle' && last.filter(r => r.retries >= 2).length >= 2) return 'gentle';
      return null;
    },
    reload() {
      load();
      apply();
    },
    apply,
    onChange(f) {
      listeners.add(f);
      return () => listeners.delete(f);
    }
  };
})();

// Interface language. The app shell (navigation, course bar, settings, setup, visit screens,
// feedback and help) is translated. Game instructions and teaching notes are still English;
// reading games teach English spellings and stay English by design.
const I18n = (() => {
  const strings = {
    en: {
      'nav.support': 'Find support',
      'nav.courses': 'Courses',
      'nav.free': 'Free play',
      'nav.practice': 'My practice',
      'nav.more': 'More',
      'bar.activity': 'Activity {n} of {total}',
      'bar.pause': 'Pause',
      'bar.resume': 'Resume',
      'bar.finish': 'Finish for now',
      'bar.auto': 'Continue automatically',
      showme: 'Show me how',
      'showme.tap': 'Tap a picture to choose it.',
      'showme.drag': 'Move a picture to its place: drag it, or tap it and then tap the place.',
      'showme.here': 'Look here',
      'fb.good': 'Yes!',
      'fb.retry': 'Try again',
      'visit.title': 'That’s today’s visit',
      'visit.lead': 'You played {n} activities together.',
      'visit.did': 'What we did',
      'visit.again': 'Play the last one again',
      'visit.next': 'Keep going: next activity',
      'visit.break': 'Take a break',
      'visit.course': 'Back to the course',
      'end.title': 'We finished the course!',
      'end.try': 'Something to try together',
      'end.home': 'Choose what to do next',
      'child.on': 'Child mode is on. Press and hold to leave.',
      'child.hold': 'Hold to leave child mode',
      settings: 'Settings',
      'level.gentle': 'Gentler',
      'level.standard': 'Standard',
      'level.stretch': 'More challenge',
      'level.title': 'Level for this course',
      'level.help': 'Gentler shows fewer pictures to choose from. More challenge adds extra rounds.',
      'level.suggest.stretch': 'The last few activities looked easy. You could try “More challenge”.',
      'level.suggest.gentle': 'The last few activities needed a few tries. You could try “Gentler”.',
      'scan.hint': 'Switch scanning: Space or Enter selects the highlighted item.',
      'scan.hint2': 'Two switches: Space moves to the next item, Enter selects.',
      skip: 'Skip to content'
    },
    sl: {
      'nav.support': 'Poišči podporo',
      'nav.courses': 'Tečaji',
      'nav.free': 'Prosta igra',
      'nav.practice': 'Moja vadba',
      'nav.more': 'Več',
      'bar.activity': 'Dejavnost {n} od {total}',
      'bar.pause': 'Premor',
      'bar.resume': 'Nadaljuj',
      'bar.finish': 'Za zdaj končaj',
      'bar.auto': 'Samodejno nadaljuj',
      showme: 'Pokaži mi',
      'showme.tap': 'Tapni sliko, da jo izbereš.',
      'showme.drag': 'Premakni sliko na njeno mesto: povleci jo ali jo tapni in nato tapni mesto.',
      'showme.here': 'Poglej sem',
      'fb.good': 'Tako je!',
      'fb.retry': 'Poskusi znova',
      'visit.title': 'To je današnji obisk',
      'visit.lead': 'Skupaj sta odigrala {n} dejavnosti.',
      'visit.did': 'Kaj smo delali',
      'visit.again': 'Še enkrat zadnjo',
      'visit.next': 'Nadaljuj: naslednja dejavnost',
      'visit.break': 'Odmor',
      'visit.course': 'Nazaj na tečaj',
      'end.title': 'Tečaj je končan!',
      'end.try': 'Nekaj za skupaj poskusiti',
      'end.home': 'Izberi, kaj bo naslednje',
      'child.on': 'Otroški način je vklopljen. Pritisni in drži za izhod.',
      'child.hold': 'Drži za izhod iz otroškega načina',
      settings: 'Nastavitve',
      'level.gentle': 'Lažje',
      'level.standard': 'Običajno',
      'level.stretch': 'Več izziva',
      'level.title': 'Raven za ta tečaj',
      'level.help': 'Lažje pokaže manj slik za izbiro. Več izziva doda dodatne kroge.',
      'level.suggest.stretch': 'Zadnje dejavnosti so bile videti lahke. Poskusite »Več izziva«.',
      'level.suggest.gentle': 'Zadnje dejavnosti so zahtevale več poskusov. Poskusite »Lažje«.',
      'scan.hint': 'Pregledovanje s stikalom: preslednica ali Enter izbere označeni element.',
      'scan.hint2': 'Dve stikali: preslednica premakne na naslednji element, Enter izbere.',
      skip: 'Skoči na vsebino'
    }
  };
  function t(key, vars = {}) {
    const lang = typeof Prefs !== 'undefined' ? Prefs.get('language') : 'en';
    const text = strings[lang]?.[key] ?? strings.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : '{' + k + '}'));
  }
  return { t, strings, languages: { en: 'English', sl: 'Slovenščina' } };
})();

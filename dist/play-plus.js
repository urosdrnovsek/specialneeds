'use strict';
// Shared play layer, loaded after every engine. It works on the rendered screen, so every game gets
// the same help without rewriting each engine:
//  2  visible feedback (tried pictures fade and are marked, right answers pop, star burst, big icon)
//  3  "Show me how" on every play screen (uses the engine's model or hint, the canal's next move,
//     or a generic tap/drag demonstration)
//  4  per-course level: Gentler hides one extra picture; More challenge plays extra rounds
//  5  one shared course-end screen; 6 optional visit goal with a "That's today's visit" screen
//  7  snap feedback when a dragged object lands
//  8  switch scanning (one or two switches) and dwell selection
//  9  child mode with a press-and-hold exit
//  11 optional synthesised sounds (off by default, no audio files)
// It never decides whether an answer is right: engines do. It only reads their state to find the
// correct picture for the Gentler level and for "Show me how".
const PlayPlus = (() => {
  const app = document.getElementById('app');
  const T = (k, v) => I18n.t(k, v);
  const CHOICE =
    '[data-choice],[data-learning-choice],[data-adult-choice],[data-sen-choice],[data-focus-choice],[data-calm-choice],[data-vocab-choice]';
  const q = s => app.querySelector(s),
    qa = s => [...app.querySelectorAll(s)];
  const playing = () => document.body.classList.contains('ds-playing');
  const reduced = () => document.documentElement.dataset.motion === 'reduce';

  // ---------- engine answer lookup ----------
  function choiceKey(el) {
    for (const a of el.attributes) if (/^data-.*choice$/.test(a.name)) return a.name + '=' + a.value;
    return null;
  }
  function isCorrect(el) {
    try {
      const d = el.dataset;
      if (d.choice !== undefined && typeof current !== 'undefined' && current?.choices)
        return !!current.choices[+d.choice]?.match;
      if (d.learningChoice !== undefined && typeof learningState !== 'undefined' && learningState?.options) {
        const o = learningState.options[+d.learningChoice];
        return !!o && (learningState.answer || []).includes(o.id);
      }
      if (d.adultChoice !== undefined && typeof adultState !== 'undefined' && adultState?.options) {
        const o = adultState.options[+d.adultChoice];
        return !!o && (adultState.answer || []).includes(o.id);
      }
      if (d.senChoice !== undefined && typeof senState !== 'undefined' && senState?.task?.options) {
        const o = senState.task.options[+d.senChoice];
        return !!o && (senState.task.answer || []).includes(o.id);
      }
      if (d.focusChoice !== undefined && typeof focusState !== 'undefined' && focusState?.task?.options) {
        const t = focusState.task,
          o = t.options.find(x => String(x.id) === d.focusChoice) || t.options[+d.focusChoice];
        return !!o && (t.answer || []).map(String).includes(String(o.id));
      }
      if (d.calmChoice !== undefined && typeof calmState !== 'undefined' && calmState)
        return calmModel(calmState).answer === +d.calmChoice;
      if (d.vocabChoice !== undefined && typeof vocabularyState !== 'undefined' && vocabularyState)
        return vocabularyState.target === d.vocabChoice;
    } catch {}
    return null;
  }
  function singleAnswerChoices() {
    const all = qa(CHOICE).filter(el => el.offsetParent !== null || el.classList.contains('ds-level-hidden'));
    if (all.length < 3) return null;
    const marks = all.map(isCorrect);
    if (marks.some(m => m === null)) return null;
    if (marks.filter(Boolean).length !== 1) return null;
    return { all, marks };
  }

  // ---------- 11. sound ----------
  let audio = null;
  function tone(freqs, { dur = 0.12, gap = 0.09, type = 'sine', gain = 0.18 } = {}) {
    if (!Prefs.get('sound')) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const vol = Prefs.get('volume') * gain;
      freqs.forEach((f, i) => {
        const o = audio.createOscillator(),
          g = audio.createGain(),
          t0 = audio.currentTime + i * gap;
        o.type = type;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g).connect(audio.destination);
        o.start(t0);
        o.stop(t0 + dur + 0.02);
      });
    } catch {}
  }
  const Sound = {
    tap: () => tone([620], { dur: 0.05, gain: 0.08, type: 'triangle' }),
    good: () => tone([523, 659, 784], { dur: 0.18, gap: 0.08 }),
    retry: () => tone([440, 392], { dur: 0.16, gap: 0.12, gain: 0.1, type: 'triangle' }),
    finish: () => tone([523, 659, 784, 1047], { dur: 0.26, gap: 0.1 }),
    snap: () => tone([880], { dur: 0.06, gain: 0.08, type: 'triangle' })
  };

  // ---------- 2. visible feedback ----------
  const GOOD =
    /well done|great|you did it|you found|yes!|that is the .* of|lovely|brilliant|you spied|details found|basket is full|three details|we noticed|all done|you made|it worked|finished/i;
  const RETRY =
    /try another|look again|another look|try again|not quite|let’s compare|let's compare|that is the (?!.* of the)|is part of the|move a picture|let’s look|let's look|keep looking/i;
  let lastTap = null,
    tried = new Set(),
    roundSig = '',
    activity = null,
    retries = 0,
    succeeded = false;
  const feedbackSeen = new WeakMap();
  let lastFeedback = '';
  function roundSignature() {
    return qa(CHOICE)
      .map(el => choiceKey(el) + ':' + (el.querySelector('svg')?.outerHTML.length || 0))
      .join('|');
  }
  function activityKey() {
    if (typeof skillContext !== 'undefined' && skillContext && skillContext.index !== null)
      return skillContext.courseId + ':' + skillContext.index;
    return location.hash + '|' + (q('h1')?.textContent || '');
  }
  function burst(rect) {
    if (reduced() || !rect) return;
    const b = document.createElement('div');
    b.className = 'ds-burst';
    b.style.left = rect.left + rect.width / 2 + 'px';
    b.style.top = rect.top + rect.height / 2 + 'px';
    const colours = ['#f2b84b', '#7fc89f', '#8fb6f2', '#f0a77f'];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2,
        r = 70 + (i % 3) * 18,
        s = document.createElement('i');
      s.style.setProperty('--x', Math.cos(a) * r + 'px');
      s.style.setProperty('--y', Math.sin(a) * r + 'px');
      s.style.setProperty('--c', colours[i % 4]);
      b.append(s);
    }
    document.body.append(b);
    setTimeout(() => b.remove(), 900);
  }
  function findByKey(key) {
    if (!key) return null;
    const [attr, value] = key.split('=');
    return app.querySelector(`[${attr}="${CSS.escape(value)}"]`);
  }
  // Help messages ("Here is a helping hand…", "Here is the matching picture…") are not wrong answers.
  const HELP = /helping hand|here is the|here is a|model the answer|a grown-up can show/i;
  function onFeedback(el, text) {
    const good = el.classList.contains('quick-success') || (GOOD.test(text) && !HELP.test(text));
    const retry = !good && !HELP.test(text) && RETRY.test(text);
    el.classList.toggle('ds-fb-good', good);
    el.classList.toggle('ds-fb-retry', retry);
    if (good) {
      succeeded = true;
      const target = findByKey(lastTap?.key) || el;
      if (target !== el) {
        target.classList.add('ds-win');
        setTimeout(() => target.classList.remove('ds-win'), 700);
      }
      burst((target.isConnected ? target : el).getBoundingClientRect());
      Sound.good();
      tried.clear();
    } else if (retry) {
      retries++;
      if (lastTap?.key) tried.add(lastTap.key);
      Sound.retry();
    }
  }
  function updateFeedback() {
    const key = activityKey();
    if (key !== activity) {
      if (
        activity &&
        succeeded &&
        typeof skillContext !== 'undefined' &&
        skillContext?.courseId &&
        activity.startsWith(skillContext.courseId + ':')
      )
        Prefs.record(skillContext.courseId, { retries });
      activity = key;
      retries = 0;
      succeeded = false;
      tried.clear();
      roundSig = '';
    }
    const sig = roundSignature();
    if (sig !== roundSig) {
      if (roundSig) tried.clear();
      roundSig = sig;
    }
    for (const el of qa(CHOICE)) el.classList.toggle('ds-tried', tried.has(choiceKey(el)));
    for (const el of qa('.feedback, .pr-message')) {
      const text = el.textContent.trim();
      if (feedbackSeen.get(el) === text) continue;
      feedbackSeen.set(el, text);
      if (!text) {
        el.classList.remove('ds-fb-good', 'ds-fb-retry');
        continue;
      }
      // Engines re-render the same message; react once per activity, round and message.
      const id = activity + '|' + roundSig + '|' + text;
      if (id === lastFeedback) {
        el.classList.toggle(
          'ds-fb-good',
          el.classList.contains('quick-success') || (GOOD.test(text) && !HELP.test(text))
        );
        el.classList.toggle('ds-fb-retry', !GOOD.test(text) && !HELP.test(text) && RETRY.test(text));
        continue;
      }
      lastFeedback = id;
      onFeedback(el, text);
    }
  }
  document.addEventListener(
    'click',
    e => {
      const el = e.target.closest?.(
        CHOICE + ',.tp-source,[data-pp-canal],[data-calm-spot],[data-calm-detail]'
      );
      if (!el || !app.contains(el)) return;
      lastTap = {
        key:
          choiceKey(el) ||
          [...el.attributes].find(a => a.name.startsWith('data-'))?.name +
            '=' +
            [...el.attributes].find(a => a.name.startsWith('data-'))?.value
      };
      Sound.tap();
    },
    true
  );

  // ---------- 3. Show me how ----------
  const MODEL_IDS = ['#model', '#learningModel', '#missionModel', '#missionExtraModel', '#wqModel'];
  const HINT_IDS = [
    '#hint',
    '#interactive-hint',
    '#learningHint',
    '#adultHint',
    '#readingHint',
    '#senHelp',
    '#calmHelp',
    '#focusHelp',
    '#worldHelp'
  ];
  function centre(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
  }
  function tip(text) {
    document.querySelectorAll('.ds-tip').forEach(t => t.remove());
    const d = document.createElement('div');
    d.className = 'ds-tip';
    d.setAttribute('role', 'status');
    d.textContent = text;
    document.body.append(d);
    setTimeout(() => d.remove(), 4200);
  }
  function pointAt(targets) {
    targets = targets.filter(Boolean);
    if (!targets.length) return;
    targets[0].scrollIntoView({ block: 'nearest' });
    for (const t of targets) {
      t.classList.add('ds-spot');
      setTimeout(() => t.classList.remove('ds-spot'), 3800);
    }
    if (reduced()) return;
    const hand = document.createElement('div');
    hand.className = 'ds-hand';
    hand.textContent = '👆';
    hand.setAttribute('aria-hidden', 'true');
    hand.style.left = innerWidth / 2 + 'px';
    hand.style.top = innerHeight - 60 + 'px';
    document.body.append(hand);
    let step = 0;
    const next = () => {
      if (step >= targets.length) {
        setTimeout(() => hand.remove(), 600);
        return;
      }
      const c = centre(targets[step++]);
      hand.style.left = c.x - 12 + 'px';
      hand.style.top = c.y - 6 + 'px';
      setTimeout(() => {
        hand.classList.remove('ds-press');
        void hand.offsetWidth;
        hand.classList.add('ds-press');
        setTimeout(next, 1100);
      }, 950);
    };
    requestAnimationFrame(next);
  }
  function showMe() {
    for (const id of MODEL_IDS) {
      const b = q(id);
      if (b && !b.disabled && b.offsetParent !== null) {
        b.click();
        return 'model';
      }
    }
    const next = q('[data-canal-next]');
    if (next) {
      pointAt([next, q('[data-canal-target="true"]')]);
      tip(T('showme.drag'));
      return 'canal';
    }
    const correct = singleAnswerChoices();
    for (const id of HINT_IDS) {
      const b = q(id);
      if (b && !b.disabled && b.offsetParent !== null) {
        b.click();
        setTimeout(() => {
          const hinted = qa('.hinted');
          if (hinted.length) {
            pointAt(hinted.slice(0, 2));
            tip(T('showme.here'));
          } else if (correct) {
            pointAt([correct.all[correct.marks.indexOf(true)]]);
            tip(T('showme.tap'));
          }
        }, 60);
        return 'hint';
      }
    }
    if (correct) {
      pointAt([correct.all[correct.marks.indexOf(true)]]);
      tip(T('showme.tap'));
      return 'answer';
    }
    const source = qa('.tp-source').find(el => !el.disabled && el.offsetParent !== null);
    if (source) {
      const target = qa(
        '[data-slot], .reading-slot, [data-reading-target], [data-world-slot], [data-pr-place], [data-canal-target="true"], [data-pp-trip-place], .story-frame, .calm-see-basket'
      ).find(el => el.offsetParent !== null && !source.contains(el));
      pointAt([source, target]);
      tip(T('showme.drag'));
      return 'drag';
    }
    const choices = qa(CHOICE + ', [data-calm-open], [data-calm-spot]').filter(
      el => el.offsetParent !== null
    );
    if (choices.length) {
      pointAt([choices[0]]);
      tip(T('showme.tap'));
      return 'tap';
    }
    tip(T('showme.tap'));
    return 'tip';
  }
  function ensureShowMe() {
    if (!playing() || q('.course-finished, .ds-visit')) return;
    const wrap = q('.game-wrap, .pr-play, .reading-play');
    if (!wrap) return;
    const own = qa('button').some(
      b => /show me how/i.test(b.textContent) && !b.classList.contains('ds-showme')
    );
    let row = q('.ds-showme-row');
    if (own) {
      row?.remove();
      return;
    }
    if (row && row.isConnected) {
      const label = T('showme');
      if (row.firstChild.textContent !== label) row.firstChild.textContent = label;
      return;
    }
    row = document.createElement('div');
    row.className = 'ds-showme-row';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ds-showme';
    b.textContent = T('showme');
    b.onclick = showMe;
    row.append(b);
    let anchor = null;
    for (const sel of [
      ':scope > .game-stage',
      ':scope > .reading-stage',
      '.pp-game',
      '.game-stage',
      '.reading-stage',
      '.pr-board',
      '.world-game-board',
      '.vocabulary-game-board',
      '.wp-board'
    ])
      if ((anchor = wrap.querySelector(sel))) break;
    if (anchor) anchor.before(row);
    else wrap.append(row);
  }

  // ---------- 4. levels ----------
  function level() {
    return typeof skillContext !== 'undefined' && skillContext?.courseId
      ? Prefs.level(skillContext.courseId)
      : 'standard';
  }
  function applyLevel() {
    const hidden = qa('.ds-level-hidden');
    if (level() !== 'gentle') {
      hidden.forEach(el => el.classList.remove('ds-level-hidden'));
      return;
    }
    const s = singleAnswerChoices();
    if (!s) return;
    if (s.all.filter(el => !el.classList.contains('ds-level-hidden')).length <= 2) return;
    const wrong = s.all.filter((_, i) => !s.marks[i] && !s.all[i].classList.contains('selected'));
    const victim = wrong[wrong.length - 1];
    if (victim) {
      victim.classList.add('ds-level-hidden');
      victim.setAttribute('aria-hidden', 'true');
      victim.tabIndex = -1;
    }
  }
  if (typeof practiceRounds === 'function') {
    const basePractice = practiceRounds;
    practiceRounds = function (legacyTotal) {
      const base = basePractice(legacyTotal);
      return level() === 'stretch' ? Math.max(base, Math.min(legacyTotal || 3, 3)) : base;
    };
  }

  // ---------- 5/6. visits and the course end ----------
  let visit = { courseId: null, done: [] };
  function resetVisit(courseId) {
    visit = { courseId, done: [] };
  }
  function art(a) {
    try {
      return skillArt(a);
    } catch {
      return '';
    }
  }
  function strip(c) {
    const items = visit.courseId === c.courseId ? visit.done : [];
    if (!items.length) return '';
    return (
      '<h2 class="ds-sr">' +
      senEscape(T('visit.did')) +
      '</h2><ul class="ds-visit-strip">' +
      items
        .map(i => {
          const a = c.course.activities[i];
          return '<li><span aria-hidden="true">' + art(a) + '</span>' + senEscape(skillTitle(a)) + '</li>';
        })
        .join('') +
      '</ul>'
    );
  }
  /** Called by course-flow when an activity is completed. */
  function noteDone(c) {
    if (visit.courseId !== c.courseId) resetVisit(c.courseId);
    if (!visit.done.includes(c.index)) visit.done.push(c.index);
  }
  /** Called by course-flow before launching the next activity. Returns true when it showed the visit end. */
  function visitBreak(c) {
    const goal = Prefs.get('visitGoal');
    if (!goal || visit.courseId !== c.courseId || visit.done.length < goal) return false;
    Sound.finish();
    const next = c.index + 1;
    app.innerHTML =
      '<section class="game-wrap ds-visit" aria-labelledby="dsVisitTitle"><div class="ds-visit-badge" aria-hidden="true">★</div><h1 id="dsVisitTitle">' +
      senEscape(T('visit.title')) +
      '</h1><p>' +
      senEscape(T('visit.lead', { n: visit.done.length })) +
      '</p>' +
      strip(c) +
      '<div class="ds-visit-idea"><b>' +
      senEscape(T('end.try')) +
      '</b><p>' +
      senEscape(c.course.home || '') +
      '</p></div><div class="ds-visit-actions"><button class="secondary" id="dsVisitAgain">' +
      senEscape(T('visit.again')) +
      '</button><button class="primary" id="dsVisitNext">' +
      senEscape(T('visit.next')) +
      '</button><button class="secondary" id="dsVisitBreak">' +
      senEscape(T('visit.break')) +
      '</button></div></section>';
    const last = c.index;
    app.querySelector('#dsVisitAgain').onclick = () => {
      resetVisit(c.courseId);
      skillLaunch(c.courseId, last);
    };
    app.querySelector('#dsVisitNext').onclick = () => {
      resetVisit(c.courseId);
      skillLaunch(c.courseId, next);
    };
    app.querySelector('#dsVisitBreak').onclick = () => {
      resetVisit(c.courseId);
      Studio.go('#course/' + c.courseId);
    };
    app.querySelector('h1').tabIndex = -1;
    app.querySelector('h1').focus({ preventScroll: true });
    scrollTo(0, 0);
    return true;
  }
  /** Shared end screen for a finished course (keeps the ids the course-flow tests rely on). */
  function courseEnd(c) {
    Sound.finish();
    app.innerHTML =
      '<section class="game-wrap course-finished ds-visit"><div class="ds-visit-badge" aria-hidden="true">★</div><span class="eyebrow">' +
      senEscape(c.course.title) +
      '</span><h1>' +
      senEscape(T('end.title')) +
      '</h1>' +
      strip(c) +
      '<div class="ds-visit-idea course-end-idea"><b>' +
      senEscape(T('end.try')) +
      '</b><p>' +
      senEscape(c.course.home || '') +
      '</p></div><div class="ds-visit-actions"><button class="secondary" id="dsCourseAgain">' +
      senEscape(T('visit.course')) +
      '</button><button class="primary" id="courseFinishedHome">' +
      senEscape(T('end.home')) +
      ' →</button></div></section>';
    app.querySelector('#dsCourseAgain').onclick = () => Studio.go('#course/' + c.courseId);
    resetVisit(null);
    return true;
  }

  // ---------- 7. snap ----------
  document.addEventListener(
    'pointerup',
    () => {
      const over = document.querySelector('#app .tp-over');
      if (!over) return;
      setTimeout(() => {
        const el = over.isConnected ? over : null;
        if (el) {
          el.classList.add('ds-snapped');
          setTimeout(() => el.classList.remove('ds-snapped'), 400);
        }
        Sound.snap();
      }, 30);
    },
    true
  );

  // ---------- 8. switch scanning and dwell ----------
  let scanIndex = -1,
    scanTimer = null;
  function scanItems() {
    const scope = qa('#courseFlowBar, .game-wrap, .pr-play, .reading-play, .ds-visit');
    const items = [];
    for (const s of scope)
      for (const el of s.querySelectorAll(
        'button, a[href], [role="button"], input[type="checkbox"], summary'
      ))
        if (
          !el.disabled &&
          el.offsetParent !== null &&
          !el.closest('[aria-hidden="true"], .ds-level-hidden') &&
          !items.includes(el)
        )
          items.push(el);
    return items;
  }
  function scanTo(i) {
    const items = scanItems();
    document.querySelectorAll('.ds-scan-focus').forEach(el => el.classList.remove('ds-scan-focus'));
    if (!items.length) return;
    scanIndex = ((i % items.length) + items.length) % items.length;
    const el = items[scanIndex];
    el.classList.add('ds-scan-focus');
    el.scrollIntoView({ block: 'nearest' });
    el.focus?.({ preventScroll: true });
    Sound.tap();
  }
  function scanSelect() {
    const el = scanItems()[scanIndex];
    if (el) el.click();
  }
  function scanLoop() {
    clearInterval(scanTimer);
    scanTimer = null;
    if (Prefs.get('access') === 'scan1' && playing())
      scanTimer = setInterval(() => scanTo(scanIndex + 1), Prefs.get('scanSpeed'));
  }
  document.addEventListener(
    'keydown',
    e => {
      const mode = Prefs.get('access');
      if (!['scan1', 'scan2'].includes(mode) || !playing()) return;
      if (e.target.closest?.('input[type="text"], input[type="search"], textarea, select')) return;
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      if (mode === 'scan2' && e.key === ' ') scanTo(scanIndex + 1);
      else {
        scanSelect();
        if (mode === 'scan1') scanLoop();
      }
    },
    true
  );
  let dwell = null;
  function stopDwell() {
    if (dwell) {
      cancelAnimationFrame(dwell.raf);
      dwell.ring.remove();
      dwell = null;
    }
  }
  document.addEventListener(
    'pointermove',
    e => {
      if (Prefs.get('access') !== 'dwell' || e.pointerType === 'touch') return;
      const el = e.target.closest?.('button, a[href], [role="button"], summary');
      if (!el || (!app.contains(el) && !el.closest('header'))) return stopDwell();
      if (dwell?.el === el) {
        dwell.ring.style.left = e.clientX + 'px';
        dwell.ring.style.top = e.clientY + 'px';
        return;
      }
      stopDwell();
      const ring = document.createElement('div');
      ring.className = 'ds-dwell-ring';
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
      document.body.append(ring);
      const start = performance.now();
      dwell = { el, ring, raf: 0 };
      const tick = now => {
        if (!dwell || dwell.el !== el) return;
        const p = Math.min(1, (now - start) / Prefs.get('dwellTime'));
        ring.style.setProperty('--p', p);
        if (p >= 1) {
          stopDwell();
          el.click();
          return;
        }
        dwell.raf = requestAnimationFrame(tick);
      };
      dwell.raf = requestAnimationFrame(tick);
    },
    true
  );
  document.addEventListener('pointerleave', stopDwell, true);
  function accessHint() {
    const mode = Prefs.get('access');
    let hint = q('.ds-access-hint');
    if (!['scan1', 'scan2'].includes(mode) || !playing()) {
      hint?.remove();
      return;
    }
    const text = T(mode === 'scan2' ? 'scan.hint2' : 'scan.hint');
    if (!hint) {
      hint = document.createElement('p');
      hint.className = 'ds-access-hint';
      q('.ds-showme-row')?.after(hint);
    }
    if (hint.textContent !== text) hint.textContent = text;
    if (mode === 'scan1' && !scanTimer) scanLoop();
  }

  // ---------- 9. child mode ----------
  function childExit() {
    let b = document.getElementById('dsChildExit');
    if (!Prefs.get('childMode')) {
      b?.remove();
      return;
    }
    if (b) return;
    b = document.createElement('button');
    b.id = 'dsChildExit';
    b.className = 'ds-child-exit';
    b.type = 'button';
    b.textContent = '🔒';
    b.setAttribute('aria-label', T('child.hold'));
    b.title = T('child.on');
    let start = 0,
      raf = 0;
    const HOLD = 2000;
    const tick = now => {
      const p = Math.min(1, (now - start) / HOLD);
      b.style.setProperty('--p', p);
      if (p >= 1) {
        Prefs.set('childMode', false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const down = e => {
      e.preventDefault();
      start = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const up = () => {
      cancelAnimationFrame(raf);
      b.style.setProperty('--p', 0);
    };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', up);
    b.addEventListener('pointercancel', up);
    // Keyboard: hold Enter or Space.
    b.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) down(e);
    });
    b.addEventListener('keyup', up);
    document.body.append(b);
  }
  // Child mode keeps the child inside play: adult pages redirect back to the course or home.
  addEventListener('hashchange', () => {
    if (!Prefs.get('childMode')) return;
    if (/^#(research|review|device|more|settings|practice)/.test(location.hash)) history.back();
  });

  // ---------- 1. fit the game on one phone screen ----------
  // After the per-engine phone styles, some boards are still taller than the screen. On narrow
  // screens the game area is scaled down just enough for every interactive object to be visible,
  // never below 72% (a 113px picture stays about 81px, still a comfortable tap target).
  const FIT_TARGETS =
    CHOICE +
    ',[data-calm-open],[data-calm-spot],.reading-tile,.reading-slot,.tp-source,[data-pp-canal],[data-pp-trip],[data-world-piece],[data-world-slot],.pr-tool,[data-calm-home]';
  let fitFrame = 0;
  function fitToScreen() {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
      const wrap = q('.game-wrap, .pr-play, .reading-play');
      for (const el of qa('[data-ds-fit]'))
        if (el !== wrap) {
          el.style.zoom = '';
          delete el.dataset.dsFit;
        }
      if (!wrap || !playing() || innerWidth > 700 || q('.ds-visit, .course-finished')) {
        if (wrap?.dataset.dsFit) {
          wrap.style.zoom = '';
          delete wrap.dataset.dsFit;
        }
        return;
      }
      const prior = parseFloat(wrap.style.zoom) || 1;
      const targets = [...wrap.querySelectorAll(FIT_TARGETS)].filter(
        el => el.offsetParent !== null && !el.classList.contains('ds-level-hidden')
      );
      if (!targets.length) return;
      const top = wrap.getBoundingClientRect().top + scrollY;
      const bottom = Math.max(...targets.map(el => el.getBoundingClientRect().bottom)) + scrollY;
      const needed = (bottom - top) / prior;
      const available = innerHeight - Math.max(0, top - scrollY) - 8;
      const zoom = needed > available ? Math.max(0.72, Math.floor((available / needed) * 100) / 100) : 1;
      if (Math.abs(zoom - prior) < 0.02) return;
      wrap.style.zoom = zoom === 1 ? '' : String(zoom);
      if (zoom === 1) delete wrap.dataset.dsFit;
      else wrap.dataset.dsFit = String(zoom);
    });
  }
  addEventListener('resize', fitToScreen);
  // Late layout changes (images, scene art, inserted help rows) also trigger a re-fit.
  let fitTimer = 0;
  if ('ResizeObserver' in window)
    new ResizeObserver(() => {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitToScreen, 60);
    }).observe(app);

  // ---------- main loop ----------
  let queued = false;
  function update() {
    queued = false;
    try {
      // Some legacy code rewrites <body> classes; keep the preference classes applied.
      document.body.classList.toggle('ds-child-mode', !!Prefs.get('childMode'));
      updateFeedback();
      applyLevel();
      ensureShowMe();
      accessHint();
      childExit();
      fitToScreen();
    } catch (e) {
      console.error(e);
    }
  }
  function refresh() {
    if (!queued) {
      queued = true;
      queueMicrotask(update);
    }
  }
  new MutationObserver(refresh).observe(app, { childList: true, subtree: true, characterData: true });
  Prefs.onChange(key => {
    if (key === 'access') scanLoop();
    refresh();
  });
  refresh();
  return {
    showMe,
    noteDone,
    visitBreak,
    courseEnd,
    resetVisit,
    Sound,
    isCorrect,
    refresh,
    get visit() {
      return { ...visit, done: [...visit.done] };
    }
  };
})();

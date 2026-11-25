'use strict';
let calmProgress = {};
try {
  const p = JSON.parse(AppStorage.getItem('spotmatch-calm-v1') || '{}');
  if (p && typeof p === 'object' && !Array.isArray(p)) calmProgress = p;
} catch {}
let calmState = null;
let calmFilter = 'All';
function calmSave() {
  try {
    AppStorage.setItem('spotmatch-calm-v1', JSON.stringify(calmProgress));
  } catch {}
}
function calmPose(pose = 'mountain', seated = true) {
  const skin = '#d5ac87',
    ink = '#355447';
  // A consistent two-segment arm rig keeps the same proportions in every invitation.
  const arms = {
    mountain: 'M99 84L91 107L97 131M141 84L149 107L143 131',
    reach: 'M99 84L85 63L86 40M141 84L155 63L154 40',
    shoulders: 'M99 84L84 103L94 126M141 84L156 103L146 126',
    wings: 'M99 84L77 97L78 72M141 84L163 97L162 72',
    cat: 'M98 85L95 110L112 128M142 85L145 110L128 128',
    sunshine: 'M99 84L75 100L51 102M141 84L149 108L146 132',
    tree: 'M99 84L80 73L69 49M141 84L160 73L171 49',
    star: 'M99 84L74 90L50 95M141 84L166 90L190 95'
  };
  const head = `<circle cx="120" cy="45" r="20" fill="${skin}"/><path d="M109 44h1m20 0h1M114 54q6 5 12 0" stroke="${ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  let body = seated
    ? '<g data-calm-support="chair"><path d="M77 132H171M84 132V178M164 132V178M83 85V132" stroke="#8c9e83" stroke-width="6" fill="none"/><path d="M106 122L130 134V171L143 176M128 122L154 134V171L167 176" stroke="#78938b" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'
    : '<path data-calm-support="feet" d="M110 122L107 175M132 122L139 175" stroke="#78938b" stroke-width="16" fill="none" stroke-linecap="round"/>';
  body += `<rect x="114" y="60" width="12" height="20" rx="5" fill="${skin}"/><path d="M102 73Q120 65 138 73L146 126H96Z" fill="#8ca9a2"/>${head}<path data-calm-arms="${pose}" d="${arms[pose] || arms.mountain}" stroke="${skin}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (pose === 'shoulders')
    body +=
      '<path d="M70 75q-12 10 0 20m-5-1l5 1l1-6M170 75q12 10 0 20m5-1l-5 1l-1-6" fill="none" stroke="#719081" stroke-width="2"/>';
  return `<svg viewBox="0 0 240 195" aria-hidden="true"><rect width="240" height="195" rx="22" fill="#f5f2e7"/><ellipse cx="120" cy="181" rx="83" ry="6" fill="#dbe5cf"/>${body}</svg>`;
}
function calmArt(d) {
  if (d.mode === 'pose') return calmPose(d.pose);
  if (d.mode === 'breath') return pictureIcon('flower');
  if (d.mode === 'rest') return friendlyCover('stories');
  return pictureIcon(
    {
      find: 'flower',
      match: 'leaf',
      clue: 'ball',
      rule: 'butterfly',
      path: 'bee',
      notice: 'apple',
      comfort: 'chair',
      ground: 'tree',
      hands: 'hands',
      routine: 'basket'
    }[d.mode] || 'flower'
  );
}
const calmLibraryBefore = libraryHome;
libraryHome = function () {
  calmLibraryBefore();
  const section = document.createElement('section');
  section.id = 'calm-garden';
  section.className = 'calm-library';
  const done = Object.values(calmProgress).filter(x => x?.explored).length;
  section.innerHTML = `<div class="section-head"><div><span class="eyebrow">ROOM FOR A LITTLE PAUSE</span><h2>Focus, move & unwind.</h2></div><span class="micro">20 gentle activities</span></div><button class="calm-banner" id="calmOpen"><div><span class="adult-badge">Play together</span><h2>The Little Calm Garden</h2><p>Notice a detail. Move your way. Choose a comfortable pause.</p><span>${done ? `${done} explored · ` : ''}Come and explore →</span></div><div class="calm-banner-art" aria-hidden="true">${calmPose('tree')}</div></button><p class="note">Optional focus games, relaxation choices, and yoga-inspired movements. Seated versions and watching are always welcome.</p>`;
  app.append(section);
  document.querySelector('#calmOpen').onclick = calmHome;
  const a = document.createElement('a');
  a.className = 'sen-shortcut';
  a.href = '#calm-garden';
  a.textContent = 'Visit the Little Calm Garden ↓';
  app.querySelector('.welcome-copy')?.append(a);
};
function calmNav() {
  document.querySelector('#libraryNav').onclick = libraryHome;
  document.querySelector('#brand').onclick = e => {
    e.preventDefault();
    libraryHome();
  };
  document.querySelector('#courseNav').onclick = calmHome;
  document.querySelector('#guideNav').onclick = () => {
    calmHome();
    const d = document.querySelector('#calmGuide');
    d.open = true;
    d.scrollIntoView();
  };
}
function calmHome() {
  activeLearningCourse = null;
  senActive = null;
  app.innerHTML = `<div class="play-top"><button class="back" id="calmLibrary">← Our adventures</button><span class="together-note">♧ An adult joins in</span></div><section class="course-hero friendly-course-hero calm-hero"><div><span class="eyebrow">FOCUS · MOVE · UNWIND</span><h1>The Little Calm Garden</h1><p>Small moments of noticing, comfortable movement, and choice.</p><button class="primary" id="calmStart">Choose something gentle ↓</button><p class="micro">20 activities · Start anywhere · No timer or scores</p></div><div class="course-hero-art" aria-hidden="true">${calmPose('tree')}</div></section><details class="course-about" id="calmGuide"><summary><span>For grown-ups</span><span class="about-subtitle">Our goal, adaptations, movement guidance & research</span><span aria-hidden="true">＋</span></summary><div class="sen-parent-copy"><h3>What can be difficult?</h3><p>Attention changes with interest, fatigue, language demands, sensory input, movement needs, and access. Difficulty staying with an activity does not necessarily mean a child lacks concentration. Some children benefit from a quieter task, a movement break, clearer choices, or an adult’s help feeling comfortable.</p><h3>Our goal</h3><p>Offer enjoyable practice noticing relevant details and communicating a preferred pause. Gentle yoga-inspired invitations offer optional movement, not perfect poses. Looking away, moving, or declining an activity is welcome; stillness and eye contact are not goals.</p><h3>Who may find this useful?</h3><p>Children with attention, sensory, language, or developmental support needs may enjoy selected activities. Choose by the child’s preferences and access, not diagnosis. Focus games practise the tasks shown; broad improvements in attention, reading, ADHD, or autism are not established by this app.</p><h3>Adult support and movement</h3><p>Stay nearby and offer choices. Use the child’s usual stable seating and established movement supports. Follow any existing movement restrictions or therapist advice; seek individual guidance when unsure what is suitable. Never pull a limb, push a stretch, remove support, or ask the child to copy beyond a comfortable range. Stop for pain, dizziness, distress, or fatigue.</p><p>Movement stays gentle: no inversions, one-leg balance, floor transfers, breath holds, deep stretches, or fixed pose durations. Choose the seated version, imagine a movement, or simply watch. These illustrations are invitations, not an assessment of movement or a substitute for adapted instruction.</p><h3>Relaxation should be a choice</h3><p>Breathing is ordinary and self-paced. No deep breaths or eyes-closed requirement. Body or breath focus can feel unpleasant; an external picture, familiar movement, company, or ending the activity may fit better. Calm activities should never be used to suppress communication or deny a needed break.</p><h3>Research and its limits</h3><p>Research on yoga and mindfulness for children is promising but mixed. Studies vary in participants, programmes, outcomes, and quality. Evidence from a taught programme does not validate our individual games or poses, and findings from older children or adults may not apply to younger children with complex needs. These are supportive wellbeing activities, not treatment or reading interventions.</p><ul class="sen-sources"><li><a href="https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety" target="_blank" rel="noopener noreferrer">NCCIH · Yoga: Effectiveness and Safety ↗</a><p>Research overview and the importance of appropriate adaptation.</p></li><li><a href="https://www.nccih.nih.gov/health/tips/things-to-know-about-mind-and-body-practices-for-children-and-teens" target="_blank" rel="noopener noreferrer">NCCIH · Mind and body practices for children and teens ↗</a><p>Parent guidance; child-specific safety research remains limited.</p></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/39717371/" target="_blank" rel="noopener noreferrer">Mind-body exercise and ADHD · Systematic review and meta-analysis (2024) ↗</a><p>Results differ across outcomes; the review did not find improvements in every domain.</p></li><li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11506216/" target="_blank" rel="noopener noreferrer">Mindfulness and autism · Systematic review (2024) ↗</a><p>Promising findings, varied protocols, and limited child studies.</p></li></ul><p>Our activity designs have not been evaluated. Participation and a comfortable choice matter more than finishing a course.</p></div></details><section id="calmActivities"><div class="section-head"><h2>What feels right today?</h2><span class="micro">${Object.values(calmProgress).filter(x => x?.explored).length} explored</span></div><div class="calm-filters" role="group" aria-label="Activity type">${['All', 'Focus', 'Relax', 'Move', 'Together'].map(f => `<button class="secondary" data-calm-filter="${f}" aria-pressed="${f === calmFilter}">${f}</button>`).join('')}</div><div class="grid friendly-game-grid">${calmActivities.map((d, i) => (calmFilter === 'All' || calmFilter === d.group ? `<button class="course-card" data-calm-game="${i}"><div class="thumb" style="--tint:#e6ecdd">${calmArt(d)}${calmProgress[i]?.explored ? '<span class="played-mark" aria-label="Explored">✓</span>' : ''}</div><span class="card-num">${d.group.toUpperCase()}</span><h3>${d.title}</h3><span class="card-bottom">Explore together →</span></button>` : '')).join('')}</div></section><details class="quiet-notes"><summary>Progress on this device</summary><p>Only explored activity numbers are saved locally. No feeling, diagnosis, movement quality, or concentration score is recorded. Other course progress is separate.</p><button class="secondary" id="calmReset">Clear Calm Garden progress</button></details>`;
  document.querySelector('#calmLibrary').onclick = libraryHome;
  document.querySelector('#calmStart').onclick = () =>
    document.querySelector('#calmActivities').scrollIntoView({ behavior: 'smooth' });
  document
    .querySelectorAll('[data-calm-game]')
    .forEach(b => (b.onclick = () => calmOpen(+b.dataset.calmGame)));
  document.querySelectorAll('[data-calm-filter]').forEach(
    b =>
      (b.onclick = () => {
        calmFilter = b.dataset.calmFilter;
        calmHome();
        document.querySelector('#calmActivities').scrollIntoView();
      })
  );
  document.querySelector('#calmReset').onclick = () => {
    calmProgress = {};
    calmSave();
    calmHome();
  };
  calmNav();
  window.scrollTo(0, 0);
}
let calmSeeVisits = 0;
function calmOpen(index) {
  if (calmActivities[index]?.mode === 'ground') calmSeeShuffleRoom(calmSeeVisits++);
  calmState = {
    index,
    step: 0,
    selected: null,
    found: false,
    help: false,
    fewer: false,
    seated: true,
    watch: false,
    path: 0,
    breath: false,
    paused: false,
    routine: [null, null, null],
    message: '',
    spotted: [],
    complete: false
  };
  calmRender();
  window.scrollTo(0, 0);
}
function calmModel(s) {
  const mode = calmActivities[s.index].mode;
  const shape = s.step % 2;
  const leaf = (value, color) => ({ calmLeaf: value, color });
  let target, options, prompt;
  if (mode === 'find') {
    // Each new round uses a different familiar set, so the game is not the same picture every time.
    const sets = [
      ['flower', 'tree', 'apple', 'the flower'],
      ['duck', 'fish', 'star', 'the duck'],
      ['cup', 'spoon', 'book', 'the cup'],
      ['ball', 'hat', 'leaf', 'the ball']
    ];
    const set = sets[s.step % sets.length];
    target = set[0];
    options = set.slice(0, 3);
    prompt = 'Find ' + set[3] + ' that matches our model.';
  }
  if (mode === 'match') {
    target = leaf(shape, '#86a28a');
    options = [leaf(shape, '#d3b46e'), leaf(1 - shape, '#86a28a'), leaf(1 - shape, '#d3b46e')];
    prompt = 'Find the same leaf shape. Its colour can be different.';
  }
  if (mode === 'clue' || mode === 'rule') {
    const color = s.step % 2 === 0;
    target = { calmLeaf: 0, color: '#86a28a' };
    options = color
      ? [leaf(1, '#86a28a'), leaf(0, '#d3b46e'), leaf(1, '#d3b46e')]
      : [leaf(0, '#d3b46e'), leaf(1, '#86a28a'), leaf(1, '#d3b46e')];
    prompt = color
      ? 'Our clue is colour: find a leaf with the same colour.'
      : 'Our clue is shape: find a leaf with the same shape.';
  }
  if (s.fewer) options = options.slice(0, 2);
  const offset = s.step % options.length;
  options = [...options.slice(offset), ...options.slice(0, offset)];
  return { target, options, prompt, answer: (options.length - offset) % options.length };
}
function calmPicture(p) {
  if (p?.calmLeaf !== undefined)
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="${p.calmLeaf === 0 ? 'M60 15Q110 48 60 106Q10 48 60 15Z' : 'M60 12L72 36L100 32L89 57L108 73L77 80L60 107L43 80L12 73L31 57L20 32L48 36Z'}" fill="${p.color}" stroke="#355447" stroke-width="3"/><path d="M60 31V105" stroke="#355447" stroke-width="2"/></svg>`;
  return pictureIcon(p);
}
// "Here Around Me" (I-spy) and "A Slow Little Look" (close-up details) use the child's choice:
// the chosen object must be found in a room picture, or matched from magnified details, until a clear finish.
const calmSeeTopics = { notice: ['apple', 'butterfly', 'spoon'], ground: ['flower', 'book', 'cup'] };
// The room's layout changes on every visit (the same six things, in a new order).
const calmSeeRoomItems = ['lamp', 'flower', 'teddy', 'cup', 'clock', 'book'];
let calmSeeRoom = [...calmSeeRoomItems];
function calmSeeShuffleRoom(seed) {
  const room = [...calmSeeRoomItems];
  if (!seed) {
    calmSeeRoom = room; // the first visit keeps the familiar layout
    return;
  }
  let x = (seed % 2147483647) + 1;
  for (let i = room.length - 1; i > 0; i--) {
    x = (x * 16807) % 2147483647;
    const j = x % (i + 1);
    [room[i], room[j]] = [room[j], room[i]];
  }
  calmSeeRoom = room;
}
const calmSeeDetails = {
  apple: [
    [50, 0, 44, 44, 'stalk and leaf'],
    [6, 34, 44, 44, 'round side'],
    [38, 72, 44, 44, 'bottom']
  ],
  butterfly: [
    [6, 12, 44, 44, 'wing spot'],
    [38, 0, 44, 44, 'body and feelers'],
    [66, 58, 44, 44, 'lower wing']
  ],
  spoon: [
    [52, 0, 44, 44, 'round bowl'],
    [34, 40, 44, 44, 'handle'],
    [12, 74, 44, 44, 'handle end']
  ]
};
const calmSeeNames = { teddy: 'teddy bear' };
const calmSeeName = id => calmSeeNames[id] || id;
function calmSeeCrop(id, r) {
  return pictureIcon(id).replace(/viewBox="[^"]*"/, `viewBox="${r[0]} ${r[1]} ${r[2]} ${r[3]}"`);
}
function calmSeeNextOpen(s) {
  const t = calmSeeTopics.ground;
  const i = t.findIndex(id => !s.spotted.includes(id));
  return i < 0 ? 0 : i;
}
function calmSeeChoose(s, mode, i) {
  if (s.complete) return;
  const id = calmSeeTopics[mode][i];
  if (mode === 'ground') {
    if (s.spotted.includes(id)) return;
    s.selected = i;
    s.message = `Let’s spy the ${calmSeeName(id)}. Where is it in our room?`;
  } else {
    if (s.selected !== i) {
      s.spotted = [];
    }
    s.selected = i;
    s.message = `Let’s look closely at the ${id}.`;
  }
}
function calmSeeSpot(s, i) {
  if (s.selected === null || s.complete) return;
  const want = calmSeeTopics.ground[s.selected],
    got = calmSeeRoom[i];
  if (s.spotted.includes(got)) return;
  if (got !== want) {
    s.message = `That is the ${calmSeeName(got)}. Where is the ${calmSeeName(want)}?`;
    return;
  }
  s.spotted.push(want);
  s.selected = null;
  s.step++;
  s.complete = s.spotted.length === calmSeeTopics.ground.length;
  s.message = s.complete
    ? 'Our noticing basket is full! Now spy a real flower, book or cup near you.'
    : `You spied the ${calmSeeName(want)}! It is in our basket. What shall we spy next?`;
}
function calmSeeOptions(s) {
  const r = s.spotted.length,
    topics = calmSeeTopics.notice,
    chosen = topics[s.selected],
    others = topics.filter(t => t !== chosen),
    list = [chosen, ...others].map(id => ({ id, region: calmSeeDetails[id][r] })),
    shift = (r + s.selected) % 3;
  return [...list.slice(shift), ...list.slice(0, shift)];
}
function calmSeeDetail(s, i) {
  if (s.selected === null || s.complete) return;
  const chosen = calmSeeTopics.notice[s.selected],
    o = calmSeeOptions(s)[i];
  if (!o) return;
  if (o.id !== chosen) {
    s.message = `That close-up is part of the ${o.id}. Look again at our ${chosen}.`;
    return;
  }
  s.message = `Yes! That is the ${o.region[4]} of the ${chosen}.`;
  s.spotted.push(s.spotted.length);
  s.step++;
  s.complete = s.spotted.length === 3;
  if (s.complete)
    s.message = `We noticed three details on the ${chosen}. Can you find one more together on a real ${chosen}?`;
}
function calmSeeGame(s, mode) {
  const topics = calmSeeTopics[mode];
  const chooser = label =>
    `<div class="calm-see-choose" role="group" aria-label="${label}">${topics
      .map((id, i) => {
        const done = mode === 'ground' && s.spotted.includes(id);
        return `<button class="learning-option ${s.selected === i ? 'selected' : ''} ${done ? 'calm-see-done' : ''}" data-calm-open="${i}" aria-pressed="${s.selected === i}" aria-label="${senEscape(calmSeeName(id))}${done ? ' (in the basket)' : ''}" ${done || s.complete ? 'disabled' : ''}>${pictureIcon(id)}${done ? '<span class="calm-see-tick" aria-hidden="true">✓</span>' : ''}</button>`;
      })
      .join('')}</div>`;
  if (mode === 'ground') {
    const want = s.selected === null ? null : topics[s.selected];
    const room = `<div class="calm-see-room" role="group" aria-label="Our room">${calmSeeRoom
      .map((id, i) => {
        const gone = s.spotted.includes(id);
        return gone
          ? `<span class="calm-see-gap" role="img" aria-label="Empty place: the ${calmSeeName(id)} is in the basket"></span>`
          : `<button class="calm-see-thing" data-calm-spot="${i}" aria-label="${senEscape(calmSeeName(id))}" ${want === null || s.complete ? 'disabled' : ''}>${pictureIcon(id)}</button>`;
      })
      .join('')}</div>`;
    const basket = `<div class="calm-see-basket" role="group" aria-label="Noticing basket: ${s.spotted.length} of 3">${pictureIcon('basket')}<div class="calm-see-slots">${[0, 1, 2].map(i => (s.spotted[i] ? `<span class="filled">${pictureIcon(s.spotted[i])}</span>` : '<span></span>')).join('')}</div></div>`;
    const prompt = s.complete
      ? 'Our basket is full!'
      : want
        ? `Find the ${calmSeeName(want)} in our room.`
        : s.spotted.length
          ? 'What shall we spy next? Choose a picture.'
          : 'What shall we spy? Choose a picture, then find it in our room.';
    return {
      prompt,
      html: `<div class="calm-see"><div class="calm-see-side"><p class="calm-see-label">${s.spotted.length ? 'Spy next' : 'I spy…'}</p>${chooser('Things to spy')}${basket}</div>${room}</div>`
    };
  }
  const chosen = s.selected === null ? null : topics[s.selected];
  if (chosen === null)
    return { prompt: 'Choose a picture to look at closely.', html: chooser('Pictures to look at') };
  const marks = s.spotted
    .map(r => {
      const d = calmSeeDetails[chosen][r];
      return `<circle cx="${d[0] + d[2] / 2}" cy="${d[1] + d[3] / 2}" r="${d[2] / 2}" fill="none" stroke="#244f91" stroke-width="3" stroke-dasharray="6 4"/>`;
    })
    .join('');
  const whole = `<div class="calm-see-whole">${pictureIcon(chosen)}<svg class="calm-see-marks" viewBox="0 0 120 120" aria-hidden="true">${marks}</svg><span class="calm-see-count">${s.spotted.length} of 3 details</span></div>`;
  const options = s.complete
    ? ''
    : `<div class="calm-see-details" role="group" aria-label="Close-ups">${calmSeeOptions(s)
        .map(
          (o, i) =>
            `<button class="learning-option calm-see-lens" data-calm-detail="${i}" aria-label="Close-up ${i + 1}">${calmSeeCrop(o.id, o.region)}</button>`
        )
        .join('')}</div>`;
  return {
    prompt: s.complete ? `Three details found on the ${chosen}!` : `Which close-up is part of our ${chosen}?`,
    html: `${chooser('Pictures to look at')}<div class="calm-see-look">${whole}${options}</div>`
  };
}
function calmRender(focus) {
  const s = calmState,
    d = calmActivities[s.index];
  let body = '',
    inv = d.invite;
  if (['find', 'match', 'clue', 'rule'].includes(d.mode)) {
    const t = calmModel(s);
    inv = t.prompt;
    body = `<div class="calm-model" aria-label="Model picture">${calmPicture(t.target)}</div><div class="learning-options calm-options">${t.options.map((p, i) => `<button class="learning-option ${s.selected === i ? 'selected' : ''} ${s.help && i === t.answer ? 'hinted' : ''}" data-calm-choice="${i}" aria-label="Picture ${i + 1}" aria-pressed="${s.selected === i}">${calmPicture(p)}</button>`).join('')}</div><div class="calm-controls"><button class="secondary" id="calmFewer">${s.fewer ? 'Show three pictures' : 'Show two pictures'}</button><button class="secondary" id="calmHelp">A little help</button><button class="primary" id="calmCheck" ${s.selected === null ? 'disabled' : ''}>Let’s see ✓</button>${s.found ? '<button class="secondary" id="calmTry">Another example →</button>' : ''}</div>`;
  }
  if (d.mode === 'path') {
    body = `<div class="calm-path" role="group" aria-label="Three firefly homes">${['flower', 'tree', 'house'].map((id, i) => `<button class="learning-option ${s.path === i ? 'hinted' : ''}" data-calm-home="${i}" aria-label="Home ${i + 1}: ${id}" ${i !== s.path ? 'disabled' : ''}>${pictureIcon(id)}<span>${i + 1}</span></button>`).join('')}</div><p>${s.path === 3 ? 'The firefly visited all three homes.' : 'Choose the highlighted home. There is no hurry.'}</p>${s.path === 3 ? '<button class="secondary" id="calmPathAgain">Visit again</button>' : ''}`;
  }
  if (d.mode === 'notice' || d.mode === 'ground') {
    const g = calmSeeGame(s, d.mode);
    inv = g.prompt;
    body = g.html;
  } else if (d.mode === 'comfort') {
    const ids =
      d.mode === 'notice'
        ? ['apple', 'butterfly', 'spoon']
        : d.mode === 'comfort'
          ? ['chair', 'tree', 'rabbit']
          : ['flower', 'book', 'cup'];
    const labels =
      d.mode === 'comfort'
        ? ['A comfortable rest', 'A little movement or outside view', 'Company or communication']
        : ids.map(nameOf);
    body = `<div class="learning-options calm-options">${ids.map((p, i) => `<button class="learning-option ${s.selected === i ? 'selected' : ''}" data-calm-open="${i}" aria-pressed="${s.selected === i}" aria-label="${senEscape(labels[i])}">${pictureIcon(p)}${d.mode === 'comfort' ? `<small>${labels[i]}</small>` : ''}</button>`).join('')}</div>`;
  }
  if (d.mode === 'breath') {
    body = `<div class="calm-flower ${s.breath ? 'open' : ''}">${pictureIcon('flower')}</div><p>${s.watch ? 'Just enjoy the picture. No breathing task.' : s.paused ? 'Paused. Breathe normally or choose something else.' : 'Breathe normally. Open or close the flower whenever you like; it does not set your pace.'}</p><div class="calm-controls"><button class="secondary" id="calmWatchBreath" aria-pressed="${s.watch}">${s.watch ? 'Try an ordinary breath' : 'Just watch the picture'}</button><button class="secondary" id="calmFlower" ${s.watch || s.paused ? 'disabled' : ''}>${s.breath ? 'Let the flower rest' : 'Open the flower'}</button><button class="secondary" id="calmPause">${s.paused ? 'Continue if you like' : 'Pause'}</button></div>`;
  }
  if (d.mode === 'hands') {
    body = `<div class="calm-pose-art">${pictureIcon('hands')}</div><p>${s.watch ? 'Imagine or watch the movement. No moving needed.' : s.step % 2 ? 'Let your hands return to a comfortable resting place.' : 'Open your hands just a little, only if comfortable.'}</p><div class="calm-controls"><button class="secondary" id="calmHands">${s.step % 2 ? 'Explore opening' : 'Return to rest'}</button><button class="secondary" id="calmWatch" aria-pressed="${s.watch}">${s.watch ? 'Try a small movement' : 'Imagine or watch instead'}</button></div>`;
  }
  if (d.mode === 'pose') {
    body = `<div class="calm-pose-art">${calmPose(d.pose, s.seated || d.pose === 'cat')}</div><div class="calm-controls"><button class="secondary" id="calmSeat" aria-pressed="${s.seated}">${s.seated ? 'Seated version ✓' : 'Choose seated version'}</button><button class="secondary" id="calmStand" aria-pressed="${!s.seated}" ${d.pose === 'cat' ? 'disabled' : ''}>Usual supported standing</button><button class="secondary" id="calmWatch" aria-pressed="${s.watch}">${s.watch ? 'Watching / imagining ✓' : 'Watch or imagine instead'}</button></div><p>${s.watch ? 'Watching or imagining is a complete choice. There is no need to move.' : senEscape(s.seated ? d.seated : d.standing)}</p><p class="micro">Keep your usual supports. No perfect pose or hold is needed. Stop if uncomfortable.</p>`;
  }
  if (d.mode === 'rest') {
    body = `<div class="calm-pose-art">${calmPose('mountain')}</div><p>Nothing to complete. Rest, move a little, look around, or finish.</p>`;
  }
  if (d.mode === 'routine') {
    const sets = [
        ['flower', 'leaf'],
        ['chair', 'star'],
        ['book', 'rabbit']
      ],
      labels = [
        ['A little looking', 'Notice a detail'],
        ['Rest or watch', 'A gentle movement'],
        ['A familiar book', 'Company or a pause']
      ];
    body = `<div class="calm-routine">${sets.map((ids, row) => `<fieldset><legend>${['A focus choice', 'Move, watch, or rest', 'A comfortable ending'][row]}</legend>${ids.map((id, i) => `<button class="secondary ${s.routine[row] === i ? 'selected' : ''}" data-calm-routine="${row}:${i}" aria-pressed="${s.routine[row] === i}">${pictureIcon(id)}<span>${labels[row][i]}</span></button>`).join('')}<button class="back" data-calm-routine="${row}:2" aria-pressed="${s.routine[row] === 2}">Skip this part</button></fieldset>`).join('')}</div><p>You can use your choices away from the screen. Skipping every part is fine too.</p>`;
  }
  app.innerHTML = `<div class="play-top"><button class="back" id="calmBack">← Our calm garden</button><span class="together-note">♧ Play together</span></div><section class="game-wrap friendly-play calm-play"><span class="eyebrow">${d.group.toUpperCase()} · YOUR WAY, YOUR PACE</span><h1>${d.title}</h1><p class="play-invitation">${senEscape(inv)}</p><div class="game-stage">${body}<div class="feedback" role="status" aria-live="polite">${senEscape(s.message)}</div><div class="calm-controls"><button class="secondary" id="calmStop">Stop / choose something else</button><button class="primary" id="calmFinish">Finish whenever you like →</button></div></div><details class="quiet-notes"><summary>A little tip for grown-ups</summary><p>${senEscape(d.skill)}</p><p>${senEscape(d.tip)}</p><p>Adult support is needed. Participation is optional; do not require stillness or a calm appearance. This app does not assess concentration, relaxation, breathing, or movement.</p></details><details class="quiet-notes"><summary>Try it away from the screen</summary><p>${senEscape(d.away)}</p></details></section>`;
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };
  calmNav();
  bind('calmBack', calmHome);
  bind('calmStop', calmHome);
  bind('calmFinish', calmFinish);
  document.querySelectorAll('[data-calm-choice]').forEach(
    b =>
      (b.onclick = () => {
        s.selected = +b.dataset.calmChoice;
        s.found = false;
        s.message = '';
        calmRender('choice:' + s.selected);
      })
  );
  bind('calmCheck', () => {
    s.found = s.selected === calmModel(s).answer;
    s.message = s.found
      ? 'You found our clue. Another try, a pause, or all done?'
      : 'Let’s compare together. You can change your choice or ask for help.';
    calmRender('calmCheck');
  });
  bind('calmHelp', () => {
    s.help = true;
    s.message = 'Here is the matching picture. Explore the clue together.';
    calmRender('calmHelp');
  });
  bind('calmFewer', () => {
    s.fewer = !s.fewer;
    s.selected = null;
    s.found = false;
    s.message = '';
    calmRender('calmFewer');
  });
  bind('calmTry', () => {
    s.step++;
    s.selected = null;
    s.found = false;
    s.help = false;
    s.message = '';
    calmRender('calmTry');
  });
  document.querySelectorAll('[data-calm-home]').forEach(
    b =>
      (b.onclick = () => {
        s.path++;
        calmRender(s.path < 3 ? 'home:' + s.path : 'calmPathAgain');
      })
  );
  bind('calmPathAgain', () => {
    s.path = 0;
    calmRender('home:0');
  });
  document.querySelectorAll('[data-calm-open]').forEach(
    b =>
      (b.onclick = () => {
        if (d.mode === 'notice' || d.mode === 'ground') {
          calmSeeChoose(s, d.mode, +b.dataset.calmOpen);
          calmRender('open:' + b.dataset.calmOpen);
          return;
        }
        s.selected = +b.dataset.calmOpen;
        s.message =
          d.mode === 'comfort'
            ? [
                'Let’s find a comfortable resting place.',
                'Choose a familiar comfortable movement or view.',
                'Invite company or use your usual communication support.'
              ][s.selected]
            : 'Explore your idea together. Point, sign, speak, or use AAC. There is no right answer.';
        calmRender('open:' + s.selected);
      })
  );
  bind('calmWatchBreath', () => {
    s.watch = !s.watch;
    s.breath = false;
    calmRender('calmWatchBreath');
  });
  bind('calmFlower', () => {
    s.breath = !s.breath;
    calmRender('calmFlower');
  });
  bind('calmPause', () => {
    s.paused = !s.paused;
    calmRender('calmPause');
  });
  bind('calmHands', () => {
    s.step++;
    calmRender('calmHands');
  });
  bind('calmWatch', () => {
    s.watch = !s.watch;
    calmRender('calmWatch');
  });
  bind('calmSeat', () => {
    s.seated = true;
    calmRender('calmSeat');
  });
  bind('calmStand', () => {
    s.seated = false;
    calmRender('calmStand');
  });
  document.querySelectorAll('[data-calm-spot]').forEach(
    b =>
      (b.onclick = () => {
        calmSeeSpot(s, +b.dataset.calmSpot);
        calmRender(
          s.complete
            ? 'calmFinish'
            : s.selected === null
              ? 'open:' + calmSeeNextOpen(s)
              : 'spot:' + b.dataset.calmSpot
        );
      })
  );
  document.querySelectorAll('[data-calm-detail]').forEach(
    b =>
      (b.onclick = () => {
        calmSeeDetail(s, +b.dataset.calmDetail);
        calmRender(s.complete ? 'calmFinish' : 'detail:' + b.dataset.calmDetail);
      })
  );
  document.querySelectorAll('[data-calm-routine]').forEach(
    b =>
      (b.onclick = () => {
        const [r, i] = b.dataset.calmRoutine.split(':').map(Number);
        s.routine[r] = i;
        calmRender('routine:' + b.dataset.calmRoutine);
      })
  );
  if (focus) {
    let el = focus.startsWith('choice:')
      ? document.querySelector(`[data-calm-choice="${focus.slice(7)}"]`)
      : focus.startsWith('open:')
        ? document.querySelector(`[data-calm-open="${focus.slice(5)}"]`)
        : focus.startsWith('home:')
          ? document.querySelector(`[data-calm-home="${focus.slice(5)}"]`)
          : focus.startsWith('spot:')
            ? document.querySelector(`[data-calm-spot="${focus.slice(5)}"]`)
            : focus.startsWith('detail:')
              ? document.querySelector(`[data-calm-detail="${focus.slice(7)}"]`)
              : focus.startsWith('routine:')
                ? document.querySelector(`[data-calm-routine="${focus.slice(8)}"]`)
                : document.getElementById(focus);
    if (el && !el.disabled) el.focus({ preventScroll: true });
  }
}
function calmFinish() {
  const s = calmState,
    d = calmActivities[s.index];
  calmProgress[s.index] = { explored: true };
  calmSave();
  app.innerHTML = `<section class="game-wrap friendly-play calm-play"><div class="completion-friend">${friendlyMascot()}</div><h1>A little moment for you.</h1><p>Thank you for exploring your way. You do not have to feel calmer or finish a movement.</p><p>${senEscape(d.away)}</p><div class="calm-controls"><button class="secondary" id="calmAgain">Explore this again</button><button class="primary" id="calmReturn">Choose another activity →</button></div><p class="micro">Explored, not assessed. No concentration or relaxation score is saved.</p></section>`;
  calmNav();
  document.querySelector('#calmAgain').onclick = () => calmOpen(s.index);
  document.querySelector('#calmReturn').onclick = calmHome;
  window.scrollTo(0, 0);
}
libraryHome();

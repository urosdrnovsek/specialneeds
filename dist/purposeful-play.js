'use strict';
// Four shared play systems replace retired picture-only activations and topic choosers.
const Purposeful = (() => {
  let timer = null,
    paused = false,
    serial = 0;
  const q = s => app.querySelector(s),
    svg = (b, label) => readingAdventureSvg(b, label, '0 0 700 400');
  const person = (x, y, kind = 'duck', action = 'wave') =>
    `<svg x="${x}" y="${y}" width="100" height="110" viewBox="0 -20 200 220">${readingAdventureAnimal(
      kind,
      action
    )
      .replace(/^<svg[^>]*>/, '')
      .replace(/<\/svg>$/, '')}</svg>`;
  function active(s) {
    return senState === s && !!q('.purposeful-play') && s.task?.mode === 'mission';
  }
  function can(s) {
    return active(s) && !s.done && !paused;
  }
  function cancel() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }
  function init(s) {
    if (s.play) return;
    cancel();
    paused = false;
    s.play = {
      id: s.task.mission,
      version: ++serial,
      step: 0,
      selected: null,
      wheels: [false, false],
      washed: false,
      paint: '#779cc2',
      horn: false,
      destination: null,
      pipes: [
        { cell: 0, type: 'straight', r: 1 },
        { cell: 1, type: 'elbow', r: 0 },
        { cell: 4, type: 'elbow', r: 2 },
        { cell: 5, type: 'straight', r: 0 }
      ],
      trace: [],
      message: ''
    };
  }
  function change(s, message = '', focus) {
    if (!focus) {
      const el = document.activeElement;
      const attr = [
        'data-pp-canal',
        'data-pp-trip-object',
        'data-pp-trip-place',
        'data-pp-tool',
        'data-pp-part',
        'data-pp-pipe',
        'data-pp-water',
        'data-pp-gate-position'
      ].find(a => el?.hasAttribute?.(a));
      if (attr) focus = `[${attr}="${el.getAttribute(attr)}"]`;
      else if (el?.id?.startsWith('pp')) focus = '#' + el.id;
    }
    s.play.version = ++serial;
    s.response = message;
    render(focus);
  }
  function finish(s, message) {
    if (!can(s)) return;
    s.done = true;
    s.play.finished = true;
    s.response = message;
    s.records = [
      {
        round: 0,
        observation: 'not-recorded',
        helpUsed: s.hint,
        retries: s.retries,
        kind: 'mission',
        mission: s.play.id,
        actions: s.play.version
      }
    ];
    render();
  }
  function continueCourse(s) {
    if (!active(s) || !s.done || paused) return;
    cancel();
    senFinish();
  }
  function schedule(s) {
    cancel();
    if (typeof CourseFlow === 'undefined' || !active(s) || !s.done || paused || !CourseFlow.enabled) return;
    timer = setTimeout(() => {
      timer = null;
      if (active(s) && !paused) continueCourse(s);
    }, 1600);
  }
  function sceneButton(attrs, label, x, y, w, h, art = '', caption = '') {
    return `<button ${attrs} class="pp-scene-object" style="left:${x / 7}%;top:${y / 4}%;width:${w / 7}%;height:${h / 4}%;" aria-label="${senEscape(label)}">${art}${caption ? `<span class="pp-object-caption">${caption}</span>` : ''}</button>`;
  }
  function canalState(p) {
    return (p.canal ??= { duck: 'bank', parcel: 'bank', water: 0, gate: false, boat: 'lock' });
  }
  function parcelArt() {
    return readingAdventureSvg(
      '<rect x="15" y="20" width="70" height="65" rx="6" fill="#e5bd7d" stroke="#a7804b" stroke-width="3"/><path d="M50 20V85M15 47H85" stroke="#b38d57" stroke-width="4"/><rect x="24" y="56" width="23" height="16" rx="2" fill="#fff5d8"/>',
      'A parcel',
      '0 0 100 100'
    );
  }
  function boatArt() {
    return readingAdventureSvg(
      '<ellipse cx="90" cy="84" rx="79" ry="9" fill="#235f77" opacity=".18"/><path d="M7 39H173L148 78H33Z" fill="#bb704c" stroke="#714d38" stroke-width="3"/><path d="M22 54H158M35 68H147" stroke="#d79764" stroke-width="3"/><path d="M12 38Q90 17 168 38L157 47H24Z" fill="#385f6b" stroke="#254956" stroke-width="3"/><path d="M16 38H164" stroke="#ffe3a3" stroke-width="7" stroke-linecap="round"/><circle cx="147" cy="60" r="8" fill="#f5c55c" stroke="#8b663e" stroke-width="2"/>',
      'A wooden boat with space for Duck and the parcel',
      '0 0 180 100'
    );
  }
  function pumpArt() {
    return readingAdventureSvg(
      '<rect x="30" y="45" width="40" height="56" rx="10" fill="#779b9a" stroke="#476b71" stroke-width="4"/><path d="M50 45V18M17 18H84" stroke="#ac8256" stroke-width="11" stroke-linecap="round"/><path d="M69 62H90V83" stroke="#779b9a" stroke-width="12" fill="none"/><path d="M90 91q-13 19 0 19q13 0 0-19" fill="#76b9cf"/>',
      'Water pump handle',
      '0 0 110 120'
    );
  }
  function gateArt(open) {
    return readingAdventureSvg(
      `<path d="M20 92V25M91 92V25M20 48H91M20 75H91" fill="none" stroke="#9c7753" stroke-width="9"/><path d="M55 28V8L${open ? 28 : 83} 8" fill="none" stroke="#587d85" stroke-width="10" stroke-linecap="round"/>`,
      'Canal gate lever',
      '0 0 110 110'
    );
  }
  function canalDuckArt() {
    return readingAdventureSvg(
      '<ellipse cx="48" cy="104" rx="32" ry="4" fill="#38565b" opacity=".13"/><path d="M39 93V102H26M61 93V102H74" fill="none" stroke="#db8c31" stroke-width="5" stroke-linecap="round"/><path d="M18 55Q6 47 11 36Q20 43 26 42" fill="#edb83e"/><ellipse cx="47" cy="67" rx="34" ry="29" fill="#f9cc4f" stroke="#b78629" stroke-width="2"/><path d="M33 61Q64 48 70 70Q52 89 32 74" fill="#edb83e"/><circle cx="61" cy="32" r="23" fill="#ffdb63" stroke="#b78629" stroke-width="2"/><path d="M79 33L98 40L80 46Z" fill="#ee913a" stroke="#b46b2c" stroke-width="2"/><circle cx="67" cy="28" r="3.5" fill="#263f46"/><circle cx="68" cy="27" r="1" fill="white"/><path d="M51 13Q47 4 54 6" fill="none" stroke="#b78629" stroke-width="3" stroke-linecap="round"/>',
      'Duck with a yellow body, orange bill and two short feet',
      '0 0 100 110'
    );
  }
  function canalLayout(c) {
    const water = 333 - c.water * 47,
      bx = c.boat === 'lock' ? 315 : 563;
    return {
      water,
      bx,
      boat: [bx, water - 8],
      duck: c.duck === 'boat' ? [bx - 37, water - 65] : c.duck === 'dock' ? [556, 162] : [146, 233],
      parcel: c.parcel === 'boat' ? [bx + 40, water - 42] : c.parcel === 'delivered' ? [638, 181] : [64, 255]
    };
  }
  function canal(p) {
    const c = canalState(p),
      { water } = canalLayout(c);
    return svg(
      `<defs><linearGradient id="ppCanalSky" x2="0" y2="1"><stop stop-color="#d5eef6"/><stop offset="1" stop-color="#f5fbef"/></linearGradient><pattern id="ppCanalBricks" width="46" height="26" patternUnits="userSpaceOnUse"><rect width="46" height="26" fill="#c6a983"/><path d="M0 25H46M23 0V25" fill="none" stroke="#ae8c69" stroke-width="2"/></pattern></defs><rect width="700" height="400" rx="24" fill="url(#ppCanalSky)"/><circle cx="600" cy="49" r="27" fill="#ffd571"/><g fill="white" opacity=".85"><ellipse cx="66" cy="42" rx="43" ry="13"/><ellipse cx="91" cy="35" rx="22" ry="17"/><ellipse cx="364" cy="51" rx="36" ry="12"/></g><path d="M0 182Q105 99 207 185T450 172T700 155V400H0Z" fill="#bfd6a1"/><path d="M0 242Q82 215 205 248V400H0Z" fill="#8fb277"/><rect x="205" y="238" width="495" height="162" fill="#378da8"/><path d="M481 260H677M497 300H692M490 350H669" stroke="#99d7e2" stroke-width="4" stroke-linecap="round"/><path d="M205 190H470V400H205Z" fill="url(#ppCanalBricks)"/><rect x="219" y="${water}" width="237" height="${400 - water}" fill="#5eb6cc"/><path d="M235 ${water + 18}H438M249 ${water + 44}H425" stroke="#b9e5ec" stroke-width="4" stroke-linecap="round"/><path d="M205 191V400M469 191V400" stroke="#92785f" stroke-width="11"/><path d="M219 237H457" stroke="#faf8e6" stroke-width="3" stroke-dasharray="8 7"/><path d="M2 277H202V291H2Z" fill="#b47c4e"/><path d="M18 291V337M178 291V337M14 282H190" stroke="#825d40" stroke-width="6"/><path d="M516 205H700V219H516Z" fill="#bf8b59"/><path d="M530 219V259M687 219V259M526 210H691" stroke="#825d40" stroke-width="6"/><path d="M601 201V126H680V201Z" fill="#fff0d0" stroke="#967656" stroke-width="3"/><path d="M587 130L641 88L693 130Z" fill="#d67a65" stroke="#a55f50" stroke-width="3"/><path d="M629 201V165Q641 152 653 165V201" fill="#69a6a6"/><rect x="663" y="147" width="12" height="18" rx="3" fill="#a8d7df"/><path d="M590 202V176M580 188H600" stroke="#648b5b" stroke-width="5"/><g fill="#e7b4a8"><circle cx="589" cy="173" r="6"/><circle cx="582" cy="180" r="5"/></g><path d="M142 117H178Q188 117 188 130V${water + 8}H229" stroke="#527c83" stroke-width="10" fill="none" stroke-linecap="round"/>${c.gate ? '<path d="M469 240L493 204" stroke="#92623e" stroke-width="14" stroke-linecap="round"/>' : '<path d="M469 244V382" stroke="#805e46" stroke-width="14"/><path d="M465 265H477M465 293H477M465 321H477M465 349H477" stroke="#ddb887" stroke-width="5"/>'}${c.water === 0 && c.boat === 'lock' ? '<path d="M189 277L249 307" stroke="#dbbd8c" stroke-width="12" stroke-linecap="round"/>' : ''}${c.boat === 'dock' ? '<path d="M587 218L611 205" stroke="#dbbd8c" stroke-width="10"/>' : ''}`,
      `Canal: Duck ${c.duck}, parcel ${c.parcel}, water level ${c.water} of 2, gate ${c.gate ? 'open' : 'closed'}, boat at ${c.boat}`
    );
  }
  function canalStep(p) {
    const c = canalState(p),
      selected = ['duck', 'parcel', 'boat'].includes(p.selected) ? p.selected : null;
    if (p.finished)
      return { stage: 'done', text: 'You brought Duck and the parcel home!', source: null, target: null };
    if (c.boat === 'dock') {
      const object =
        c.duck === 'boat'
          ? selected === 'parcel' && c.parcel === 'boat'
            ? 'parcel'
            : 'duck'
          : c.parcel === 'boat'
            ? 'parcel'
            : null;
      if (object)
        return {
          stage: 'unload',
          text: object === 'duck' ? 'Move Duck onto the landing.' : 'Give the parcel to the little house.',
          source: object,
          target: 'dock'
        };
      return { stage: 'sail', text: 'Move the boat back to the start.', source: 'boat', target: 'bank' };
    }
    if (c.duck !== 'boat' || c.parcel !== 'boat') {
      if (c.water > 0) {
        if (c.gate)
          return {
            stage: 'load',
            text: 'Close the gate so we can lower the boat.',
            source: 'gate',
            target: null
          };
        return {
          stage: 'load',
          text: 'Lower the water so Duck can climb aboard.',
          source: 'down',
          target: null
        };
      }
      const object =
        selected && selected !== 'boat' && c[selected] === 'bank'
          ? selected
          : c.duck === 'bank'
            ? 'duck'
            : c.parcel === 'bank'
              ? 'parcel'
              : null;
      if (object)
        return {
          stage: 'load',
          text: object === 'duck' ? 'Move Duck into the boat.' : 'Put the parcel in the boat.',
          source: object,
          target: 'boat'
        };
    }
    if (c.water < 2)
      return {
        stage: 'lift',
        text: c.water === 0 ? 'Pump the water up to lift the boat.' : 'Pump once more to reach the landing.',
        source: 'pump',
        target: null
      };
    if (!c.gate)
      return { stage: 'gate', text: 'Open the gate to let the boat through.', source: 'gate', target: null };
    return { stage: 'sail', text: 'Move the boat to the landing.', source: 'boat', target: 'dock' };
  }
  function canalHint(p) {
    return canalStep(p).text;
  }
  function canalInstruction(p, step) {
    const art = id =>
      id === 'duck'
        ? canalDuckArt()
        : id === 'parcel'
          ? parcelArt()
          : id === 'boat'
            ? boatArt()
            : id === 'pump' || id === 'down'
              ? pumpArt()
              : id === 'gate'
                ? gateArt(canalState(p).gate)
                : readingPicture('house');
    return `<section class="pp-canal-instruction" aria-label="What to do now"><div class="pp-canal-pictures" aria-hidden="true">${step.source ? art(step.source) : canalDuckArt()}${step.target ? '<span>→</span>' + art(step.target) : ''}</div><div><span class="pp-canal-eyebrow">${p.finished ? 'HOME SAFE' : 'YOUR NEXT MOVE'}</span><h2 id="ppCanalNext" aria-live="polite">${step.text}</h2><p>${step.target ? `Drag ${step.source === 'duck' ? 'Duck' : step.source === 'parcel' ? 'the parcel' : 'the boat'} to the ${step.target === 'boat' ? 'boat' : step.target === 'bank' ? 'start' : 'landing'}. Or tap it, then tap the outlined place.` : step.source === 'pump' ? 'Tap the pump handle. Watch the boat rise with the water.' : step.source === 'gate' ? 'Tap the gate lever beside the water.' : step.source === 'down' ? 'Tap Lower water below the canal.' : 'Lovely teamwork. Duck is home.'}</p></div></section>`;
  }
  function canalView(p) {
    const c = canalState(p),
      pos = canalLayout(c),
      { water, bx } = pos,
      step = canalStep(p),
      selected = p.selected;
    const button = (id, label, x, y, w, h, art, caption) => {
      const source = step.source === id,
        target = step.target === id;
      return sceneButton(
        `data-pp-canal="${id}" ${['duck', 'parcel'].includes(id) && c[id] === 'boat' ? 'data-canal-aboard="true"' : ''} ${source ? 'data-canal-next="true"' : ''} ${target ? 'data-canal-target="true"' : ''} ${['duck', 'parcel', 'boat'].includes(id) ? `aria-pressed="${selected === id}"` : ''}`,
        label,
        x,
        y,
        w,
        h,
        art,
        caption
      ).replace('style="', 'style="--canal-art-w:' + w / 7 + 'cqw;--canal-art-h:' + h / 7 + 'cqw;');
    };
    const source = pos[step.source],
      target =
        step.target === 'boat'
          ? [bx, water - 40]
          : step.target === 'dock'
            ? [605, 185]
            : step.target === 'bank'
              ? [130, 275]
              : null;
    const guide =
      source && target
        ? `<svg class="pp-canal-guide" viewBox="0 0 700 400" aria-hidden="true"><defs><marker id="ppCanalArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#254d73"/></marker></defs><path d="M${source[0] + 35} ${source[1] - 25}Q${(source[0] + target[0]) / 2} ${Math.min(source[1], target[1]) - 65} ${target[0] - 20} ${target[1] - 14}" fill="none" stroke="#fff" stroke-width="9"/><path d="M${source[0] + 35} ${source[1] - 25}Q${(source[0] + target[0]) / 2} ${Math.min(source[1], target[1]) - 65} ${target[0] - 20} ${target[1] - 14}" fill="none" stroke="#254d73" stroke-width="4" stroke-dasharray="8 6" marker-end="url(#ppCanalArrow)"/></svg>`
        : '';
    return `${canalInstruction(p, step)}<div class="pp-canal-plan" aria-label="Our rescue plan">${[
      ['load', 'Load'],
      ['lift', 'Lift'],
      ['gate', 'Open gate'],
      ['sail', 'Sail'],
      ['unload', 'Unload']
    ]
      .map(([id, label]) => `<span ${step.stage === id ? 'aria-current="step"' : ''}>${label}</span>`)
      .join(
        ''
      )}</div><div class="pp-board pp-canal-board" data-canal-water="${c.water}">${canal(p)}${guide}${button('bank', 'Start landing; bring the boat or its passengers back here', 110, 284, 190, 52, '', 'Start')}${button('dock', 'Landing and little house; move the boat here, then unload Duck and the parcel', 606, 184, 180, 94, '', 'Landing')}${button('boat', 'Boat; tap it then its destination, or drag it', pos.boat[0], pos.boat[1], 180, 100, boatArt(), 'Boat')}${button('duck', 'Duck; move into the boat, then onto the landing', pos.duck[0], pos.duck[1], 92, 100, canalDuckArt(), 'Duck')}${button('parcel', 'Parcel; move into the boat, then to the little house', pos.parcel[0], pos.parcel[1], 64, 64, parcelArt(), 'Parcel')}${button('pump', 'Pump handle; tap to raise the boat with the water', 104, 115, 84, 92, pumpArt(), 'Pump')}${button('gate', `Gate lever; tap to ${c.gate ? 'close' : 'open'} the gate`, 459, 143, 78, 78, gateArt(c.gate), c.gate ? 'Gate open' : 'Gate closed')}</div><div class="pp-canal-water"><span>Water height</span><div class="pp-canal-meter" role="meter" aria-label="Water height" aria-valuemin="0" aria-valuemax="2" aria-valuenow="${c.water}"><i ${c.water >= 1 ? 'class="filled"' : ''}></i><i ${c.water >= 2 ? 'class="filled"' : ''}></i></div><span>${c.water === 2 ? 'Level with landing' : c.water === 1 ? 'Halfway up' : 'Low for boarding'}</span>${step.source === 'down' ? '<button data-pp-water="down" class="secondary" data-canal-next="true">Lower water</button>' : ''}</div><details class="pp-canal-explore"><summary>Try the water and gate controls</summary><div class="pp-water-controls"><button data-pp-water="up" class="secondary">Raise water</button>${step.source !== 'down' ? '<button data-pp-water="down" class="secondary">Lower water</button>' : ''}<button data-pp-gate-position="open" class="secondary">Open gate</button><button data-pp-gate-position="closed" class="secondary">Close gate</button></div><p>The boat needs low water to load, then level water and an open gate to sail. You move Duck and the parcel yourself.</p></details>`;
  }
  function canalUse(s, object, destination) {
    if (!can(s)) return;
    const p = s.play,
      c = canalState(p);
    const explain = message => change(s, message);
    if (!['duck', 'parcel', 'boat'].includes(object)) return;
    if (object === 'boat') {
      if (!['dock', 'bank'].includes(destination))
        return explain('Sail the boat to the dock, or back towards the bank.');
      if (c.water !== 2 || !c.gate)
        return explain('The boat needs level water and an open gate. Use the pump and gate lever.');
      if (destination === 'dock') {
        if (!c.crossed && (c.duck !== 'boat' || c.parcel !== 'boat'))
          return explain('Bring Duck and the parcel aboard before the first crossing.');
        c.boat = 'dock';
        c.crossed = true;
      } else c.boat = 'lock';
    } else if (destination === 'boat') {
      if (c.boat === 'lock' && ['dock', 'delivered'].includes(c[object]))
        return explain('Duck or the parcel is on the other bank. Bring the boat to that dock first.');
      if (c.boat === 'lock' && c.water !== 0)
        return explain('Lower the water before boarding from the bank.');
      if (c.boat === 'dock' && c[object] === 'bank')
        return explain('The boat is across the canal. Bring it back before boarding.');
      c[object] = 'boat';
    } else if (destination === 'bank') {
      if (['dock', 'delivered'].includes(c[object]) || c.boat !== 'lock' || c.water !== 0)
        return explain('The left bank is reachable when the boat is here and the water is low.');
      c[object] = 'bank';
    } else if (destination === 'dock') {
      if (c.boat !== 'dock' || c[object] === 'bank')
        return explain('First sail the loaded boat across to the dock.');
      c[object] = object === 'duck' ? 'dock' : 'delivered';
    } else return explain('Choose the boat, bank, or dock as the destination.');
    p.selected = null;
    if (c.duck === 'dock' && c.parcel === 'delivered')
      finish(s, 'You sailed the boat and delivered the parcel. Thank you!');
    else
      change(
        s,
        object === 'boat'
          ? 'Your boat has moved. Now choose what happens next.'
          : `${object === 'duck' ? 'Duck' : 'The parcel'} is ${destination === 'boat' ? 'aboard' : destination === 'dock' ? 'on the dock' : 'back on the bank'}.`
      );
  }
  function canalWater(s, delta) {
    if (!can(s)) return;
    const c = canalState(s.play);
    if (c.gate) return change(s, 'Close the gate before changing the water level.');
    if (c.boat !== 'lock')
      return change(s, 'The boat is at the dock. Bring it back before changing the lock water.');
    const n = Math.max(0, Math.min(2, c.water + delta));
    if (n === c.water)
      return change(
        s,
        delta > 0
          ? 'The water is already at the upper canal level.'
          : 'The water is already low enough for boarding.'
      );
    c.water = n;
    s.play.selected = null;
    change(
      s,
      delta > 0 ? 'The water and boat rose together.' : 'The boat lowered with the water.',
      '[data-pp-canal="pump"]'
    );
  }
  function canalGate(s) {
    if (!can(s)) return;
    const c = canalState(s.play);
    if (!c.gate && c.water !== 2)
      return change(s, 'Raise the water to the upper canal level before opening the gate.');
    c.gate = !c.gate;
    s.play.selected = null;
    change(
      s,
      c.gate ? 'The gate is open. You can move the boat through.' : 'The gate is closed.',
      '[data-pp-canal="gate"]'
    );
  }
  function workshop(p) {
    return svg(
      `<rect width="700" height="400" rx="24" fill="#eee6d8"/><path d="M0 326H700V400H0Z" fill="#cba983"/><rect x="66" y="35" width="570" height="48" rx="12" fill="#d5c49f"/><path d="M100 57H600" stroke="#b09b73" stroke-width="4"/><path d="M135 152Q135 129 157 129H489Q537 129 556 191V288H135Z" fill="${p.paint}" stroke="#436271" stroke-width="4"/><rect x="159" y="150" width="79" height="65" rx="9" fill="#d8edf1"/><rect x="253" y="150" width="79" height="65" rx="9" fill="#d8edf1"/><rect x="347" y="150" width="79" height="65" rx="9" fill="#d8edf1"/><path d="M448 150H484Q508 150 521 190H448Z" fill="#d8edf1"/><path d="M133 242H558" stroke="#f9dc8b" stroke-width="13"/>${p.wheels.map((v, i) => `<circle cx="${218 + i * 244}" cy="289" r="37" fill="${v ? '#354e5b' : '#d2bea0'}" stroke="#546878" stroke-width="4" ${v ? '' : 'stroke-dasharray="8 7"'}/>${v ? `<circle cx="${218 + i * 244}" cy="289" r="15" fill="#bfd3d5"/>` : ''}`).join('')}${p.washed ? '' : '<g fill="#9b8268" opacity=".8"><ellipse cx="189" cy="176" rx="22" ry="12"/><ellipse cx="293" cy="193" rx="22" ry="11"/><ellipse cx="385" cy="168" rx="17" ry="12"/></g>'}${p.horn ? '<path d="M569 125l26-12M581 151h26M576 177l24 14" stroke="#b38140" stroke-width="6" stroke-linecap="round"/>' : ''}<path d="M105 327H593" stroke="#8f7559" stroke-width="5"/>`,
      `${p.wheels.filter(Boolean).length} wheels fitted; windows ${p.washed ? 'clean' : 'muddy'}; ${p.horn ? 'visual horn marks' : ''}`
    );
  }
  const tools = [
    ['wheel', 'Wheel'],
    ['sponge', 'Sponge'],
    ['paint', 'Paint'],
    ['horn', 'Horn']
  ];
  function toolArt(id) {
    return id === 'sponge'
      ? svg(
          '<rect x="205" y="100" width="290" height="190" rx="40" fill="#efca60"/><g fill="#c6983f"><circle cx="255" cy="145" r="12"/><circle cx="375" cy="245" r="10"/><circle cx="425" cy="148" r="14"/></g>',
          'A sponge'
        )
      : id === 'paint'
        ? svg(
            '<path d="M280 185H420L390 330H310Z" fill="#cd9b68"/><path d="M295 185V76H405V185Z" fill="#7b9ec0"/>',
            'Paintbrush'
          )
        : id === 'horn'
          ? svg(
              '<path d="M260 164L440 93V307L260 236Z" fill="#e3b957"/><ellipse cx="253" cy="200" rx="40" ry="57" fill="#566e7b"/>',
              'A toy horn'
            )
          : svg(
              '<circle cx="350" cy="200" r="145" fill="#354e5b"/><circle cx="350" cy="200" r="65" fill="#c1d5d4"/>',
              'A wheel'
            );
  }
  function workshopView(p) {
    return `<div class="pp-workshop pp-board" data-pp-part="body">${workshop(p)}${!p.finished ? `<button data-pp-part="wheel0" class="pp-part pp-wheel0" aria-label="Fit a wheel in the left wheel space"></button><button data-pp-part="wheel1" class="pp-part pp-wheel1" aria-label="Fit a wheel in the right wheel space"></button><button data-pp-part="window" class="pp-part pp-window" aria-label="Clean the bus windows"></button><button data-pp-part="body" class="pp-part pp-paint-body" aria-label="Paint the bus body"></button>` : ''}</div><div class="pp-goals"><span>${p.wheels.filter(Boolean).length}/2 wheels</span><span>${p.washed ? '✓ Windows clean' : '○ Clean the windows'}</span></div>${!p.finished ? `<p class="pp-story-strip">The toy bus has two missing wheels and muddy windows. Fix it for the parade! Paint and a pretend horn are yours to try, too.</p><div class="pp-tools">${tools.map(([id, name]) => `<button data-pp-tool="${id}" aria-pressed="${p.selected === id}" class="${p.selected === id ? 'selected' : ''}">${toolArt(id)}<span>${name}</span></button>`).join('')}</div><p class="pp-small">Drag a wheel, sponge or paintbrush onto the bus. Or tap the tool, then the part. The horn works when tapped.</p>` : ''}`;
  }
  function repair(s, tool, part) {
    if (!can(s)) return;
    const p = s.play;
    if (tool === 'wheel' && part.startsWith('wheel')) {
      const i = +part.at(-1);
      if (p.wheels[i]) return change(s, 'That wheel is already fitted. Try the other space.');
      p.wheels[i] = true;
    } else if (tool === 'sponge' && part === 'window') p.washed = true;
    else if (tool === 'paint' && part === 'body')
      p.paint = p.paint === '#779cc2' ? '#b285a5' : p.paint === '#b285a5' ? '#c99a54' : '#779cc2';
    else
      return change(
        s,
        'That tool has a different job. Wheels fit the round spaces; the sponge cleans the windows.'
      );
    p.selected = null;
    if (p.wheels.every(Boolean) && p.washed) finish(s, 'Parade ready! You repaired the bus.');
    else
      change(
        s,
        tool === 'wheel'
          ? 'A wheel clicks into place!'
          : tool === 'sponge'
            ? 'Sparkling windows!'
            : 'A new colour for your bus.'
      );
  }
  function connections(pipe) {
    const dirs = pipe.type === 'straight' ? [0, 2] : [0, 1];
    return dirs.map(d => (d + pipe.r) % 4);
  }
  function trace(p) {
    let cell = 0,
      entry = 3;
    const visited = new Set(),
      points = [];
    while (!visited.has(cell)) {
      visited.add(cell);
      const piece = p.pipes.find(v => v.cell === cell);
      if (!piece || !connections(piece).includes(entry)) return { ok: false, points, at: cell };
      points.push(cell);
      const exit = connections(piece).find(v => v !== entry),
        row = Math.floor(cell / 3),
        col = cell % 3;
      if (exit === 1 && col === 2) return { ok: row === 1, points, at: cell };
      const nr = row + ([0, 0, 1, 0][exit] || 0) - (exit === 0 ? 1 : 0),
        nc = col + (exit === 1 ? 1 : exit === 3 ? -1 : 0);
      if (nr < 0 || nr > 1 || nc < 0 || nc > 2) return { ok: false, points, at: cell };
      cell = nr * 3 + nc;
      entry = (exit + 2) % 4;
    }
    return { ok: false, points, at: cell };
  }
  const cx = cell => 145 + (cell % 3) * 150,
    cy = cell => 105 + Math.floor(cell / 3) * 150;
  function marble(p) {
    const t = p.trace.length ? p.trace.at(-1) : null;
    return svg(
      `<rect width="700" height="400" rx="24" fill="#e1ebed"/><path d="M0 351H700V400H0Z" fill="#d0bc98"/><path d="M25 105H70" stroke="#bda576" stroke-width="22"/>${p.pipes
        .map(piece => {
          const x = cx(piece.cell),
            y = cy(piece.cell),
            d = piece.type === 'straight' ? 'M0-75V75' : 'M0-75V0H75';
          return `<g transform="translate(${x} ${y})"><rect x="-73" y="-73" width="146" height="146" rx="16" fill="#fff8e5" stroke="#c5b99a" stroke-width="3"/><path d="${d}" transform="rotate(${piece.r * 90})" fill="none" stroke="#83a9a5" stroke-width="26" stroke-linecap="round"/><path d="${d}" transform="rotate(${piece.r * 90})" fill="none" stroke="#d6e8dc" stroke-width="10" stroke-linecap="round"/></g>`;
        })
        .join(
          ''
        )}<path d="M520 255H625" stroke="#bda576" stroke-width="22"/><path d="M620 293V202H658V293" fill="none" stroke="#a5835d" stroke-width="7"/><path d="M621 223q19-47 38 0l8 19h-53Z" fill="#e1b44d" stroke="#a47b34" stroke-width="3"/><circle cx="641" cy="247" r="7" fill="#9b793f"/><circle cx="${p.finished ? 635 : t === null ? 43 : cx(t)}" cy="${p.finished ? 255 : t === null ? 105 : cy(t)}" r="15" fill="#ba6c91" stroke="#79455e" stroke-width="3"/>${p.finished ? '<path d="M601 208l-11-12M679 210l11-12M639 183v-15" stroke="#b58c3d" stroke-width="4"/>' : ''}`,
      'Marble machine. Join the tubes from the entrance on the left to the bell on the lower right.'
    );
  }
  function pipeArt(v) {
    return readingAdventureSvg(
      `<rect x="2" y="2" width="146" height="146" rx="16" fill="#fff8e5" stroke="#c5b99a" stroke-width="3"/><path d="${v.type === 'straight' ? 'M75 0V150' : 'M75 0V75H150'}" transform="rotate(${v.r * 90} 75 75)" fill="none" stroke="#83a9a5" stroke-width="26"/>`,
      'Tube piece',
      '0 0 150 150'
    );
  }
  function marbleView(p) {
    return `<p class="pp-story-strip">The marble wants to ring the bell. Turn the tubes to make a connected path.</p><div class="pp-marble pp-board">${marble(p)}${
      !p.finished
        ? p.pipes
            .map(
              v =>
                `<button class="pp-pipe" data-pp-pipe="${v.cell}" style="left:${(cx(v.cell) - 72) / 7}%;top:${(cy(v.cell) - 72) / 4}%;" aria-label="Turn tube ${v.cell}. Current connections ${connections(
                  v
                )
                  .map(d => ['top', 'right', 'bottom', 'left'][d])
                  .join(' and ')}">${pipeArt(v)}<span>↻ Turn</span></button>`
            )
            .join('')
        : ''
    }</div>${!p.finished ? '<div class="pp-marble-controls"><button class="secondary" id="ppTest">Try the marble</button><button id="ppBall" class="pp-ball" aria-label="Marble; drag to the entrance to test the path">●</button><span id="ppEntrance" class="pp-entrance">Start here</span></div><p class="pp-small">Tap a tube to turn it. Drag tubes onto each other to swap them. The marble tests a connected route automatically. Drag the spare marble to Start here to try an unfinished route.</p>' : ''}`;
  }
  function turn(s, cell) {
    if (!can(s)) return;
    const p = s.play,
      v = p.pipes.find(v => v.cell === cell);
    if (!v) return;
    v.r = (v.r + 1) % 4;
    p.trace = [];
    const t = trace(p);
    if (t.ok) {
      p.trace = t.points;
      finish(s, 'Ding! Your path carried the marble all the way to the bell.');
    } else change(s, 'The tube turned. Follow the openings from the entrance.', `[data-pp-pipe="${cell}"]`);
  }
  function tripScene(p) {
    const d = p.destination,
      step = p.step;
    let background =
      '<rect width="700" height="400" rx="24" fill="#dceef2"/><circle cx="600" cy="52" r="28" fill="#ffe3a0"/>';
    if (d === 'moon')
      background =
        '<rect width="700" height="400" rx="24" fill="#465775"/><g fill="#fff1b7"><circle cx="99" cy="69" r="4"/><circle cx="357" cy="43" r="5"/><circle cx="564" cy="94" r="4"/></g><circle cx="600" cy="55" r="29" fill="#ccdecc"/>';
    let body =
      background +
      `<path d="M0 294Q240 248 700 285V400H0Z" fill="${d === 'beach' ? '#e7c993' : d === 'moon' ? '#bdc2cd' : '#b6cf9c'}"/>`;
    if (!d)
      return svg(
        body +
          `<path d="M0 337H700" stroke="#c5ab83" stroke-width="50"/>${readingAdventureVan().replace(/^<svg[^>]*>/, '<svg x="240" y="145" width="220" height="150" viewBox="0 0 230 145">')}${person(75, 197)}`,
        'The adventure bus is ready for your destination.'
      );
    if (d === 'beach') {
      if (step === 1 && !p.finished)
        body +=
          '<path d="M527 211V279" stroke="#866b50" stroke-width="6"/><ellipse cx="527" cy="281" rx="20" ry="5" fill="#b09264"/>';
      body += '<path d="M0 180Q140 160 270 183V285H0Z" fill="#83c2cf"/>';
      body +=
        step === 0
          ? '<ellipse cx="381" cy="288" rx="72" ry="13" fill="#ddbb82" stroke="#a5804f" stroke-width="3" stroke-dasharray="8 7"/>'
          : '<path d="M334 293V229H425V293M353 229V211H370V229M390 229V211H407V229" fill="#c6a16a" stroke="#a5804f" stroke-width="4"/>';
      if (step >= 2)
        body += '<path d="M381 210V153L430 166L381 183" fill="#96749f" stroke="#866b50" stroke-width="4"/>';
    }
    if (d === 'forest') {
      if (!p.finished)
        body +=
          '<path d="M490 268H539V283H490Z" fill="#b1936b"/><ellipse cx="265" cy="272" rx="31" ry="4" fill="#83986d" opacity=".25"/>';
      body +=
        '<path d="M84 287V120M583 287V108" stroke="#aa845d" stroke-width="20"/><g fill="#79a07a"><circle cx="84" cy="104" r="60"/><circle cx="583" cy="99" r="67"/></g>';
      body +=
        step === 0
          ? '<ellipse cx="359" cy="294" rx="51" ry="14" fill="#aa8963"/>'
          : `<path d="M360 296V${step === 1 ? 261 : 197}" stroke="#73974d" stroke-width="8"/><path d="M360 276q-45-30-43-4q18 23 43 10" fill="#8aa95b"/>${step >= 2 ? '<g fill="#ecc46b"><circle cx="360" cy="182" r="28"/><circle cx="337" cy="202" r="28"/><circle cx="384" cy="203" r="28"/></g><circle cx="360" cy="202" r="20" fill="#a47a46"/>' : ''}`;
    }
    if (d === 'moon') {
      body += '<ellipse cx="359" cy="301" rx="75" ry="12" fill="#d5d0bd" stroke="#8792a0" stroke-width="4"/>';
      body += `<g transform="${step === 1 ? 'translate(150 -105)' : 'translate(0 0)'}"><path d="M332 294V218Q360 168 388 218V294Z" fill="#e5ddc5" stroke="#8497aa" stroke-width="4"/><circle cx="360" cy="232" r="18" fill="#83b4c3"/>${step === 1 ? '<path d="M342 303l17 39 18-39" fill="#e6b25d"/>' : ''}</g>`;
      if (step < 2)
        body += `<svg x="${step === 1 ? 485 : 487}" y="${step === 1 ? 93 : 125}" width="${step === 1 ? 50 : 75}" height="${step === 1 ? 55 : 85}" viewBox="0 -20 200 220">${readingAdventureAnimal(
          'bear'
        )
          .replace(/^<svg[^>]*>/, '')
          .replace(/<\/svg>$/, '')}</svg>`;
      else body += person(437, 200, 'bear');
    }
    body += person(p.friendX ?? 140, 196, 'duck', p.wave || step === 2 ? 'bounce' : 'wave');
    return svg(body, `${d} adventure: step ${step + 1}`);
  }
  const trips = {
    beach: {
      name: 'Beach',
      object: 'bucket',
      prompts: ['Turn the sand bucket over to make a castle.', 'Give your sandcastle a flag.'],
      actions: ['Turn over the sand bucket', 'Add a flag']
    },
    forest: {
      name: 'Forest',
      object: 'tree',
      prompts: [
        'Plant a pretend seed in the soft earth.',
        'Water the seed. Our make-believe flower will grow!'
      ],
      actions: ['Plant the seed', 'Water the seed']
    },
    moon: {
      name: 'Moon',
      object: 'rocket',
      prompts: [
        'Teddy is floating above the moon! Send the rescue rocket.',
        'Bring Teddy gently down to the moon.'
      ],
      actions: ['Launch the rescue rocket', 'Land with Teddy']
    }
  };
  function seedArt() {
    return readingAdventureSvg(
      '<rect x="12" y="14" width="76" height="86" rx="9" fill="#f3dfae" stroke="#b39a68" stroke-width="3"/><path d="M20 17L50 35L80 17" fill="none" stroke="#b39a68" stroke-width="3"/><ellipse cx="36" cy="66" rx="8" ry="13" fill="#a17b4b" transform="rotate(-25 36 66)"/><ellipse cx="65" cy="69" rx="8" ry="13" fill="#8a6943" transform="rotate(25 65 69)"/>',
      'Packet of seeds',
      '0 0 100 115'
    );
  }
  function flagArt() {
    return readingAdventureSvg(
      '<path d="M28 102V15" stroke="#866b50" stroke-width="7"/><path d="M31 17L91 34L31 53Z" fill="#96749f" stroke="#755680" stroke-width="3"/>',
      'A flag',
      '0 0 110 120'
    );
  }
  function rocketArt() {
    return readingAdventureSvg(
      '<path d="M34 104V43Q60 0 86 43V104Z" fill="#e5ddc5" stroke="#8497aa" stroke-width="4"/><circle cx="60" cy="53" r="16" fill="#83b4c3"/>',
      'Rescue rocket',
      '0 0 120 125'
    );
  }
  function tripView(p) {
    let objects = '';
    const d = p.destination;
    if (d === 'beach')
      objects =
        (p.step === 0
          ? sceneButton(
              'data-pp-trip-object="bucket"',
              'Bucket of sand; move to the sand patch',
              260,
              253,
              95,
              95,
              readingPicture('bucket'),
              'Bucket'
            )
          : sceneButton(
              'data-pp-trip-object="flag"',
              'Flag; place on the sandcastle',
              548,
              180,
              82,
              95,
              flagArt(),
              'Flag'
            )) +
        sceneButton(
          `data-pp-trip-place="${p.step === 0 ? 'sand' : 'castle'}"`,
          p.step === 0 ? 'Sand patch; put the bucket here' : 'Sandcastle; add the flag',
          381,
          250,
          145,
          140,
          '',
          p.step === 0 ? 'Sand patch' : 'Castle'
        );
    if (d === 'forest')
      objects =
        (p.step === 0
          ? sceneButton(
              'data-pp-trip-object="seed"',
              'Seeds; plant in the soil',
              265,
              237,
              80,
              86,
              seedArt(),
              'Seeds'
            )
          : '') +
        sceneButton(
          'data-pp-trip-object="water"',
          'Watering can; water the planted seed',
          510,
          230,
          104,
          98,
          readingPicture('wateringcan'),
          'Water'
        ) +
        sceneButton(
          'data-pp-trip-place="soil"',
          'Soil and plant; plant seeds here, then water',
          359,
          270,
          125,
          98,
          '',
          'Soil'
        );
    if (p.finished) objects = '';
    if (d === 'moon') {
      const flying = p.step === 1;
      objects =
        sceneButton(
          'data-pp-trip-object="rocket" data-pp-ghost="true"',
          'Rocket; fly to Teddy, then move to the landing pad',
          flying ? 510 : 360,
          flying ? 137 : 249,
          90,
          130,
          rocketArt(),
          'Rocket'
        ) +
        (p.step === 0
          ? sceneButton(
              'data-pp-trip-object="teddy" data-pp-ghost="true"',
              'Teddy; choose the rescue rocket or drag Teddy to it',
              524,
              163,
              78,
              90,
              readingAdventureAnimal('bear'),
              'Teddy'
            )
          : '') +
        sceneButton(
          'data-pp-trip-place="pad"',
          'Landing pad; bring the rescue rocket here',
          359,
          310,
          135,
          55,
          '',
          'Landing pad'
        );
    }
    if (p.finished) objects = '';
    const duckX = (p.friendX ?? 140) + 50;
    return !d
      ? `${tripScene(p)}<p class="pp-story-strip">Choose a destination. Then move the objects to make your own adventure happen.</p><div class="pp-destinations">${Object.entries(
          trips
        )
          .map(
            ([id, t]) => `<button data-pp-trip="${id}">${readingPicture(t.object)}<b>${t.name}</b></button>`
          )
          .join('')}</div>`
      : `<div class="pp-board pp-trip-board" id="ppTripBoard">${tripScene(p)}<div class="pp-walk-zone" id="ppWalkZone" aria-hidden="true"></div>${objects}${sceneButton('data-pp-trip-object="friend" data-pp-ghost="true"', 'Duck; tap to wave or drag along the ground', duckX, 251, 95, 108, readingAdventureAnimal('duck'), 'Duck')}</div><p class="pp-story-strip">${p.finished ? 'You made the story happen!' : d === 'beach' ? (p.step === 0 ? 'Put the sand bucket on the patch. Then give the castle a flag.' : 'Place the flag on your sandcastle.') : d === 'forest' ? (p.step === 0 ? 'Plant seeds in the soil. Then water them to grow a pretend flower.' : 'Water the seed you planted.') : p.step === 0 ? 'Move the rocket to Teddy—or bring Teddy to the rocket—to begin the rescue.' : 'Bring the rocket and Teddy back to the landing pad.'}</p>${!p.finished ? '<button class="back" id="ppMap">Choose a different destination</button><p class="pp-small">Drag an object to where it belongs. Or select it, then tap its destination. You can move Duck along the ground too.</p>' : ''}`;
  }
  function tripUse(s, object, target) {
    if (!can(s)) return;
    const p = s.play;
    let ok = false;
    if (p.destination === 'beach')
      ok =
        (p.step === 0 && object === 'bucket' && target === 'sand') ||
        (p.step === 1 && object === 'flag' && target === 'castle');
    if (p.destination === 'forest')
      ok =
        (p.step === 0 && object === 'seed' && target === 'soil') ||
        (p.step === 1 && object === 'water' && target === 'soil');
    if (p.destination === 'moon')
      ok =
        (p.step === 0 &&
          ((object === 'rocket' && target === 'teddy') || (object === 'teddy' && target === 'rocket'))) ||
        (p.step === 1 && object === 'rocket' && target === 'pad');
    if (!ok)
      return change(
        s,
        p.destination === 'forest' && p.step === 0
          ? 'Plant the seed before watering.'
          : p.destination === 'moon'
            ? 'The rocket needs to reach Teddy, then return to the landing pad.'
            : 'Try the object with its place in the scene.'
      );
    p.selected = null;
    p.step++;
    if (p.step === 2)
      finish(
        s,
        p.destination === 'beach'
          ? 'Your sandcastle has a flag!'
          : p.destination === 'forest'
            ? 'Your seed grew into a flower!'
            : 'You brought Teddy safely back to the moon!'
      );
    else
      change(
        s,
        p.destination === 'beach'
          ? 'Lift the bucket… a sandcastle! Where shall the flag go?'
          : p.destination === 'forest'
            ? 'The seed is planted. Bring it some water.'
            : 'Teddy is aboard! Bring the rocket back to the landing pad.'
      );
  }
  function cover(id) {
    const p = {
      step: 0,
      wheels: [false, true],
      paint: '#779cc2',
      washed: false,
      pipes: [
        { cell: 0, type: 'straight', r: 1 },
        { cell: 1, type: 'elbow', r: 2 },
        { cell: 4, type: 'elbow', r: 0 },
        { cell: 5, type: 'straight', r: 1 }
      ],
      trace: [],
      destination: null
    };
    if (id === 'canal') {
      const nest = (art, x, y, w, h) => {
        const vb = art.match(/viewBox="([^"]+)"/)[1];
        return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}">${art.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>`;
      };
      const c = canalState(p),
        pos = canalLayout(c);
      return (
        canal(p).replace(/<\/svg>$/, '') +
        nest(canalDuckArt(), pos.duck[0] - 46, pos.duck[1] - 50, 92, 100) +
        nest(parcelArt(), pos.parcel[0] - 32, pos.parcel[1] - 32, 64, 64) +
        nest(boatArt(), pos.boat[0] - 90, pos.boat[1] - 50, 180, 100) +
        nest(pumpArt(), 62, 69, 84, 92) +
        '</svg>'
      );
    }
    return id === 'workshop' ? workshop(p) : id === 'marble' ? marble(p) : tripScene(p);
  }
  function render(focus) {
    const s = senState;
    init(s);
    const p = s.play,
      g = supportPathways[s.key].games[s.index];
    senShell(
      `<div class="purposeful-play" data-mission="${p.id}" ${paused ? 'data-paused="true"' : ''}><h1>${senEscape(g.title)}</h1><p class="pp-intro">${p.id === 'canal' ? 'Help Duck take a parcel to the little house across the canal.' : senEscape(g.invitation)}</p><div class="pp-game" ${paused ? 'inert' : ''}>${p.id === 'canal' ? canalView(p) : p.id === 'workshop' ? workshopView(p) : p.id === 'marble' ? marbleView(p) : tripView(p)}</div><p class="feedback" role="status" aria-live="polite">${senEscape(s.response)}</p>${paused ? '<p role="status">Paused. Resume when you are ready.</p>' : ''}${s.done && (typeof CourseFlow === 'undefined' || !CourseFlow.enabled) ? '<button class="primary" id="ppContinue">Next activity →</button>' : ''}<button class="back" id="ppPause">${paused ? 'Resume' : 'Pause'}</button><details class="quiet-notes"><summary>For grown-ups · what this supports</summary><p>${senEscape(g.skill)}</p><p>${senEscape(g.tip)}</p><p>Play together. An adult can read, model, or enter the child’s choice. Pointing, signs, AAC and speech are welcome. This records participation, not independent reading or treatment benefit.</p></details></div>`
    );
    app.querySelectorAll('[data-pp-canal],[data-pp-trip-object]').forEach(el => {
      const id = el.dataset.ppCanal || el.dataset.ppTripObject;
      if (['duck', 'parcel', 'boat'].includes(id) || el.hasAttribute('data-pp-trip-object'))
        el.setAttribute('aria-pressed', String(p.selected === id));
    });
    const version = p.version;
    const valid = () => can(s) && s.play.version === version;
    const bind = (el, d) => {
      if (el && typeof TouchPlay !== 'undefined')
        TouchPlay.bind(el, {
          ...d,
          drop: (target, point) => {
            if (valid()) d.drop(target, point);
          }
        });
    };
    const click = (selector, fn) =>
      q(selector)?.addEventListener('click', () => {
        if (valid()) fn();
      });
    app.querySelectorAll('[data-pp-canal]').forEach(el => {
      const id = el.dataset.ppCanal;
      el.onclick = () => {
        if (!valid()) return;
        if (id === 'pump') return canalWater(s, 1);
        if (id === 'gate') return canalGate(s);
        if (p.selected && ['boat', 'bank', 'dock'].includes(id)) return canalUse(s, p.selected, id);
        if (['duck', 'parcel', 'boat'].includes(id)) {
          p.selected = p.selected === id ? null : id;
          change(
            s,
            p.selected ? `Selected ${id}. Choose its destination.` : 'Selection cancelled.',
            '[data-pp-canal="' + (id === 'boat' ? 'dock' : 'boat') + '"]'
          );
        } else change(s, 'Choose Duck, the parcel, or the boat, then a destination.');
      };
      if (['duck', 'parcel', 'boat'].includes(id))
        bind(el, {
          targets: () => [
            ...app.querySelectorAll(
              id === 'boat'
                ? '[data-pp-canal="bank"],[data-pp-canal="dock"]'
                : '[data-pp-canal="boat"],[data-pp-canal="bank"],[data-pp-canal="dock"]'
            )
          ],
          drop: target => canalUse(s, id, target.dataset.ppCanal)
        });
      if (id === 'pump')
        bind(el, {
          targets: () => [...app.querySelectorAll('[data-pp-water]')],
          drop: target => canalWater(s, target.dataset.ppWater === 'up' ? 1 : -1)
        });
      if (id === 'gate')
        bind(el, {
          targets: () => [...app.querySelectorAll('[data-pp-gate-position]')],
          drop: target => {
            const c = canalState(p),
              open = target.dataset.ppGatePosition === 'open';
            if (c.gate !== open) canalGate(s);
          }
        });
    });
    app.querySelectorAll('[data-pp-gate-position]').forEach(
      el =>
        (el.onclick = () => {
          if (!valid()) return;
          const open = el.dataset.ppGatePosition === 'open';
          if (canalState(p).gate !== open) canalGate(s);
          else change(s, open ? 'The gate is already open.' : 'The gate is already closed.');
        })
    );
    app.querySelectorAll('[data-pp-water]').forEach(
      el =>
        (el.onclick = () => {
          if (valid()) canalWater(s, el.dataset.ppWater === 'up' ? 1 : -1);
        })
    );
    app.querySelectorAll('[data-pp-trip-object]').forEach(el => {
      const id = el.dataset.ppTripObject;
      el.onclick = () => {
        if (!valid()) return;
        if (id === 'friend') {
          p.wave = !p.wave;
          change(s, 'Duck waves to you!', '[data-pp-trip-object="friend"]');
          return;
        }
        if (p.selected && p.destination === 'moon' && id !== p.selected) return tripUse(s, p.selected, id);
        p.selected = id;
        change(s, `Selected ${id}. Choose where it goes.`);
      };
      if (id === 'friend')
        bind(el, {
          targets: () => [q('#ppWalkZone')],
          drop: (target, point) => {
            const r = q('#ppTripBoard').getBoundingClientRect();
            if (!r.width || !point) return;
            p.friendX = Math.max(0, Math.min(590, ((point.x - r.left) * 700) / r.width - 50));
            change(s, 'Duck moved across the ground.');
          }
        });
      else
        bind(el, {
          targets: () =>
            [
              ...app.querySelectorAll(
                '[data-pp-trip-place],[data-pp-trip-object="rocket"],[data-pp-trip-object="teddy"]'
              )
            ].filter(t => t !== el),
          drop: target => tripUse(s, id, target.dataset.ppTripPlace || target.dataset.ppTripObject)
        });
    });
    app.querySelectorAll('[data-pp-trip-place]').forEach(
      el =>
        (el.onclick = () => {
          if (!valid()) return;
          if (p.selected) tripUse(s, p.selected, el.dataset.ppTripPlace);
          else change(s, 'Choose an object, then tap where it belongs.');
        })
    );
    q('#ppPause').onclick = () => {
      if (!active(s)) return;
      if (skillContext) CourseFlow.setPaused(!paused);
      else pause(!paused);
    };
    q('#ppContinue')?.addEventListener('click', () => continueCourse(s));
    q('#ppMap')?.addEventListener('click', () => {
      if (!valid()) return;
      p.destination = null;
      p.step = 0;
      change(s, 'Choose where the story goes next.', '[data-pp-trip]');
    });
    app.querySelectorAll('[data-pp-trip]').forEach(
      el =>
        (el.onclick = () => {
          if (!valid()) return;
          p.destination = el.dataset.ppTrip;
          p.step = 0;
          p.friendX = 140;
          p.wave = false;
          p.selected = null;
          change(s, `We arrived at the ${p.destination}!`, '[data-pp-trip-object]');
        })
    );
    app.querySelectorAll('[data-pp-tool]').forEach(el => {
      const tool = el.dataset.ppTool;
      el.onclick = () => {
        if (!valid()) return;
        if (tool === 'horn') {
          p.horn = !p.horn;
          change(
            s,
            p.horn ? 'PARP! A pretend horn for the parade.' : 'The horn rests. What needs fixing?',
            '[data-pp-tool="horn"]'
          );
        } else {
          p.selected = tool;
          change(
            s,
            `Choose where the ${tool} should go.`,
            tool === 'paint'
              ? '.pp-paint-body'
              : tool === 'sponge'
                ? 'button[data-pp-part="window"]'
                : 'button[data-pp-part="wheel0"]'
          );
        }
      };
      bind(el, {
        targets: () => [...app.querySelectorAll('[data-pp-part]')],
        drop: target => repair(s, tool, target.dataset.ppPart)
      });
    });
    app.querySelectorAll('[data-pp-part]').forEach(
      el =>
        (el.onclick = () => {
          if (!valid()) return;
          if (p.selected) repair(s, p.selected, el.dataset.ppPart);
          else change(s, 'Pick a tool, then the part you want to repair.', '[data-pp-tool]');
        })
    );
    app.querySelectorAll('[data-pp-pipe]').forEach(el => {
      el.onclick = () => {
        if (valid()) turn(s, +el.dataset.ppPipe);
      };
      bind(el, {
        targets: () => [...app.querySelectorAll('[data-pp-pipe]')].filter(t => t !== el),
        drop: target => {
          const a = p.pipes.find(v => v.cell === +el.dataset.ppPipe),
            b = p.pipes.find(v => v.cell === +target.dataset.ppPipe);
          if (!a || !b) return;
          [a.type, b.type] = [b.type, a.type];
          [a.r, b.r] = [b.r, a.r];
          p.trace = [];
          const t = trace(p);
          if (t.ok) {
            p.trace = t.points;
            finish(s, 'Ding! Your swapped tubes made a connected route.');
          } else change(s, 'The tubes swapped places. You can turn them or test your route.');
        }
      });
    });
    const test = () => {
      const t = trace(p);
      p.trace = t.points;
      if (t.ok) finish(s, 'Ding! Your marble rang the bell.');
      else {
        s.retries++;
        change(s, 'The marble stops at the gap. Turn a tube to connect its openings.', '#ppTest');
      }
    };
    click('#ppTest', test);
    bind(q('#ppBall'), { targets: () => [q('#ppEntrance')], drop: test });
    if (s.done)
      app.querySelectorAll('.pp-game button').forEach(el => {
        el.disabled = true;
      });
    if (focus) q(focus)?.focus({ preventScroll: true });
    if (typeof CourseFlow !== 'undefined') CourseFlow.refresh();
    if (s.done) schedule(s);
  }
  function pause(value) {
    paused = value;
    if (senState?.play) senState.play.version = ++serial;
    cancel();
    if (senState?.task?.mode === 'mission' && active(senState)) render();
  }
  function migrate() {
    try {
      if (AppStorage.getItem('spotmatch-direct-objects-v1')) return;
      for (const [key, path] of Object.entries(supportPathways))
        for (let i = 0; i < path.games.length; i++)
          if (path.games[i].kind === 'mission') {
            if (senProgress[key]) delete senProgress[key][i];
            for (const skill of learningSkills)
              for (const course of skill.courses)
                course.activities.forEach((a, index) => {
                  if (
                    a.engine === 'support' &&
                    a.key === key &&
                    a.index === i &&
                    skillNotes[course.id]?.activities
                  )
                    delete skillNotes[course.id].activities[index];
                });
          }
      senSave();
      skillSave();
      AppStorage.setItem('spotmatch-direct-objects-v1', 'true');
    } catch {}
  }
  return { render, cover, pause, trace, connections, cancel, migrate };
})();

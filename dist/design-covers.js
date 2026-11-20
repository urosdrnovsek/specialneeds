'use strict';
// Covers for courses, reading paths and support areas.
//
// Before: course cards reused the first activity's picture (the same robot, house and classroom
// scenes appeared on many unrelated courses) and support cards used scenes that did not say what
// the area was about. Each cover is now composed from three objects that belong to that course
// and a motif that shows the kind of learning (letter tiles, a sequence, a match, a plan, a choice).
// Objects sit on picture cards (no figures), so no new anatomy or surface-contact claims are made.
const DesignCovers = (() => {
  const palettes = {
    seeing: { bg: '#e7eff7', blob: '#d2e1ef', accent: '#244f91', soft: '#f6f9fc' },
    language: { bg: '#f6eee0', blob: '#ecdcbf', accent: '#a4532d', soft: '#fffaf1' },
    stories: { bg: '#f4ebe7', blob: '#ead6cd', accent: '#9a4a3a', soft: '#fff8f5' },
    sounds: { bg: '#ebf2e6', blob: '#d6e6cb', accent: '#2f6b4f', soft: '#f8fbf5' },
    attention: { bg: '#faf2dc', blob: '#f0e0ae', accent: '#86620f', soft: '#fffcf2' },
    calm: { bg: '#ece9f4', blob: '#dbd5eb', accent: '#5b4f8a', soft: '#faf9fd' },
    everyday: { bg: '#f8ebe5', blob: '#f0d4c6', accent: '#b14f2c', soft: '#fff8f4' },
    access: { bg: '#e5f1ee', blob: '#cbe3dd', accent: '#2b6a62', soft: '#f6fbfa' }
  };
  // objects: three vocabulary picture ids; motif: how the course works; word: letter tiles.
  const covers = {
    matching: { skill: 'seeing', objects: ['apple', 'key', 'apple'], motif: 'match' },
    details: { skill: 'seeing', objects: ['flower', 'leaf', 'flower'], motif: 'lens' },
    build: { skill: 'seeing', objects: ['tower', 'puzzle', 'jigsaw-puzzle'], motif: 'plan-build' },
    'everyday-word-pictures': { skill: 'language', objects: ['cup', 'spoon', 'bowl'], motif: 'name' },
    vocabulary: { skill: 'language', objects: ['banana', 'carrot', 'bread'], motif: 'name' },
    sentences: { skill: 'language', objects: ['teddy-bear', 'bed', 'pillow'], motif: 'bubble' },
    directions: { skill: 'language', objects: ['basket', 'teddy-bear', 'bag'], motif: 'arrow' },
    'everyday-words-v2': { skill: 'language', objects: ['bag', 'cup', 'envelope'], motif: 'bubble' },
    'picture-adventures': { skill: 'stories', objects: ['map', 'boat', 'flag'], motif: 'sequence' },
    routines: { skill: 'stories', objects: ['toothbrush', 'towel', 'bed'], motif: 'sequence' },
    'story-meaning': { skill: 'stories', objects: ['umbrella', 'cloud', 'sun'], motif: 'sequence' },
    retelling: { skill: 'stories', objects: ['puppet', 'book', 'microphone'], motif: 'bubble' },
    syllables: { skill: 'sounds', objects: ['drum', 'banana', 'bell'], motif: 'beats' },
    rhyme: { skill: 'sounds', objects: ['clock', 'sock', 'lock'], motif: 'beats' },
    phonemes: { skill: 'sounds', objects: ['sun', 'cup', 'map'], motif: 'tiles', word: 'sun' },
    'reading-path-letters': {
      skill: 'sounds',
      objects: ['apple', 'bell', 'cup'],
      motif: 'tiles',
      word: 'abc'
    },
    'reading-path-blend': { skill: 'sounds', objects: ['map', 'pot', 'net'], motif: 'tiles', word: 'map' },
    'reading-path-meaning': { skill: 'sounds', objects: ['bag', 'hat', 'pen'], motif: 'tiles', word: 'hat' },
    'reading-path-purpose': {
      skill: 'sounds',
      objects: ['envelope', 'sign', 'ticket'],
      motif: 'tiles',
      word: 'go'
    },
    'short-words-v2': { skill: 'sounds', objects: ['cup', 'pot', 'bus'], motif: 'tiles', word: 'cup' },
    'messages-actions-v2': {
      skill: 'sounds',
      objects: ['postcard', 'mailbox', 'present'],
      motif: 'tiles',
      word: 'get'
    },
    goal: { skill: 'attention', objects: ['flag', 'star', 'calendar'], motif: 'goal' },
    planning: { skill: 'attention', objects: ['backpack', 'lunchbox', 'pencil'], motif: 'plan' },
    return: { skill: 'attention', objects: ['timer', 'chair', 'book'], motif: 'loop' },
    comfort: { skill: 'calm', objects: ['pillow', 'blanket', 'lamp'], motif: 'calm' },
    movement: { skill: 'calm', objects: ['balloon', 'feather', 'kite'], motif: 'calm' },
    representation: { skill: 'everyday', objects: ['camera', 'cup', 'mirror'], motif: 'match' },
    purpose: { skill: 'everyday', objects: ['watering-can', 'plant', 'seed'], motif: 'sequence' },
    communicate: { skill: 'access', objects: ['tablet', 'apple', 'juice'], motif: 'choice' },
    controls: { skill: 'access', objects: ['switch', 'headphones', 'tablet'], motif: 'choice' },
    'small-steps': { skill: 'access', objects: ['sock', 'shoe', 'hat'], motif: 'steps' },
    // Support areas (home cards and support pages)
    'support:language': { skill: 'language', objects: ['cup', 'teddy-bear', 'book'], motif: 'bubble' },
    'support:dyslexia': { skill: 'sounds', objects: ['bus', 'sun', 'cup'], motif: 'tiles', word: 'sun' },
    'support:attention': { skill: 'attention', objects: ['flag', 'book', 'timer'], motif: 'goal' },
    'support:autism': { skill: 'everyday', objects: ['backpack', 'sandwich', 'calendar'], motif: 'sequence' },
    'support:development': { skill: 'seeing', objects: ['spoon', 'cup', 'bowl'], motif: 'steps' },
    'support:speech': { skill: 'access', objects: ['apple', 'juice', 'banana'], motif: 'bubble' },
    'support:motor': { skill: 'access', objects: ['switch', 'crayon', 'paintbrush'], motif: 'tap' },
    'support:calm': { skill: 'calm', objects: ['moon', 'pillow', 'teddy-bear'], motif: 'calm' }
  };
  const skillFallback = {
    seeing: 'matching',
    language: 'vocabulary',
    stories: 'routines',
    sounds: 'reading-path-letters',
    attention: 'planning',
    calm: 'comfort',
    everyday: 'purpose',
    access: 'communicate'
  };
  const blobs = [
    'M30 120C30 50 120 18 210 26C300 34 382 60 378 130C374 200 300 226 200 222C100 218 30 190 30 120Z',
    'M46 92C70 30 170 16 260 30C350 44 384 104 360 160C336 216 236 230 150 214C64 198 22 154 46 92Z',
    'M24 140C20 70 96 26 196 22C296 18 372 66 376 124C380 182 320 220 216 224C112 228 28 210 24 140Z'
  ];
  const known = new Set(
    typeof vocabularyObjects !== 'undefined' && vocabularyObjects instanceof Map
      ? vocabularyObjects.keys()
      : []
  );
  function picture(id, x, y, size) {
    let svg;
    if (known.has(id) && typeof vocabularyPicture === 'function') svg = vocabularyPicture(id);
    else svg = pictureIcon(id);
    return svg
      .replace(/^<svg\b[^>]*?>/, m =>
        m
          .replace(/\s(?:x|y|width|height|role|aria-label|aria-hidden|xmlns)="[^"]*"/g, '')
          .replace('<svg', `<svg x="${x}" y="${y}" width="${size}" height="${size}" aria-hidden="true"`)
      )
      .replace(/<title>[^<]*<\/title>/, '');
  }
  function card(id, cx, cy, rot, size, p, ring) {
    const w = size + 24,
      h = size + 28;
    return `<g transform="rotate(${rot} ${cx} ${cy})"><rect x="${cx - w / 2 + 3}" y="${cy - h / 2 + 6}" width="${w}" height="${h}" rx="16" fill="#1f3a31" opacity=".08"/><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="16" fill="#fff" stroke="${ring ? p.accent : '#dfe5d8'}" stroke-width="${ring ? 4 : 1.5}"/>${picture(id, cx - size / 2, cy - size / 2 - 2, size)}</g>`;
  }
  const badge = (x, y, p, inner) =>
    `<g transform="translate(${x} ${y})"><circle r="17" fill="${p.accent}"/>${inner}</g>`;
  const tick =
    '<path d="M-7 1l5 5l10-11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
  const num = n =>
    `<text y="6" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="17" font-weight="800" fill="#fff">${n}</text>`;
  function tiles(word, p) {
    const letters = [...word],
      w = 40,
      gap = 8,
      start = 200 - (letters.length * w + (letters.length - 1) * gap) / 2;
    return letters
      .map(
        (ch, i) =>
          `<g><rect x="${start + i * (w + gap)}" y="176" width="${w}" height="44" rx="10" fill="${i % 2 ? '#e7eef8' : '#fbefe6'}" stroke="#1f3a31" stroke-opacity=".14" stroke-width="2"/><text x="${start + i * (w + gap) + w / 2}" y="207" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="26" font-weight="700" fill="#1f3a31">${ch}</text></g>`
      )
      .join('');
  }
  function compose(key) {
    const d = covers[key];
    const p = palettes[d.skill];
    const seed = [...key].reduce((n, ch) => n + ch.charCodeAt(0), 0);
    const [a, b, c] = d.objects;
    let back = `<rect width="400" height="240" fill="${p.bg}"/><path d="${blobs[seed % blobs.length]}" fill="${p.blob}"/>`;
    let front = '';
    let cards;
    const row = (y = 104, size = 66, rot = [-7, 0, 7]) => [
      card(a, 110, y + 6, rot[0], size, p),
      card(b, 200, y - 6, rot[1], size, p),
      card(c, 290, y + 6, rot[2], size, p)
    ];
    switch (d.motif) {
      case 'match':
        cards = row();
        front = `<path d="M136 46C170 18 240 18 268 46" fill="none" stroke="${p.accent}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="2 9"/>${badge(330, 52, p, tick)}`;
        break;
      case 'lens':
        cards = row();
        front = `<g transform="translate(312 150)"><circle r="34" fill="${p.soft}" fill-opacity=".55" stroke="${p.accent}" stroke-width="7"/><path d="M24 24l26 26" stroke="${p.accent}" stroke-width="11" stroke-linecap="round"/></g>`;
        break;
      case 'name':
      case 'bubble':
        cards = row(118, 62);
        front = `<g transform="translate(200 40)"><path d="M-62 -24H62Q76 -24 76 -10V10Q76 24 62 24H12L0 38L-10 24H-62Q-76 24 -76 10V-10Q-76 -24 -62 -24Z" fill="#fff" stroke="${p.accent}" stroke-width="3"/>${d.motif === 'name' ? '<circle cx="-30" r="7" fill="#c9d3c4"/><rect x="-16" y="-5" width="54" height="10" rx="5" fill="#c9d3c4"/>' : '<rect x="-48" y="-5" width="38" height="10" rx="5" fill="#c9d3c4"/><rect x="-2" y="-5" width="50" height="10" rx="5" fill="#c9d3c4"/>'}</g>`;
        break;
      case 'arrow':
        cards = row();
        front = `<path d="M140 200H262" stroke="${p.accent}" stroke-width="7" stroke-linecap="round"/><path d="M252 188l16 12l-16 12" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
        break;
      case 'sequence':
        cards = row(112, 62, [0, 0, 0]);
        front =
          `<path d="M150 112h8M240 112h8" stroke="${p.accent}" stroke-width="5" stroke-linecap="round"/>` +
          [110, 200, 290].map((x, i) => badge(x, 186, p, num(i + 1))).join('');
        break;
      case 'beats':
        cards = row(100);
        front = [150, 200, 250]
          .map(
            (x, i) =>
              `<circle cx="${x}" cy="198" r="${i === 1 ? 15 : 12}" fill="${p.accent}" opacity="${i === 1 ? 1 : 0.55}"/>`
          )
          .join('');
        break;
      case 'tiles':
        cards = row(84, 58);
        front = tiles(d.word, p);
        break;
      case 'goal':
        cards = [
          card(a, 300, 108, 6, 76, p, true),
          card(b, 120, 132, -6, 50, p),
          card(c, 196, 150, 0, 50, p)
        ];
        front = `<path d="M70 210Q170 196 250 150" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" stroke-dasharray="3 10"/>`;
        break;
      case 'plan':
      case 'plan-build':
        cards = [card(a, 240, 92, -5, 56, p), card(b, 322, 120, 5, 56, p), card(c, 262, 178, 0, 44, p)];
        front = `<g transform="translate(46 44)"><rect width="118" height="152" rx="14" fill="#fff" stroke="#dfe5d8" stroke-width="1.5"/>${[
          0, 1, 2
        ]
          .map(
            i =>
              `<rect x="16" y="${22 + i * 42}" width="22" height="22" rx="6" fill="${i < 2 ? p.accent : '#fff'}" stroke="${p.accent}" stroke-width="2.5"/>${i < 2 ? `<path d="M21 ${33 + i * 42}l4 4l8-9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` : ''}<rect x="48" y="${28 + i * 42}" width="${50 - i * 6}" height="10" rx="5" fill="#d5dccf"/>`
          )
          .join('')}</g>`;
        break;
      case 'loop':
        cards = row(98, 60);
        front = `<path d="M118 176Q200 236 282 176" fill="none" stroke="${p.accent}" stroke-width="5" stroke-linecap="round"/><path d="M270 168l14 6l-6 14" fill="none" stroke="${p.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
        break;
      case 'calm':
        back += `<circle cx="70" cy="58" r="26" fill="#fff" opacity=".55"/><circle cx="338" cy="186" r="34" fill="#fff" opacity=".45"/><circle cx="318" cy="56" r="12" fill="#fff" opacity=".6"/>`;
        cards = [card(a, 132, 128, -5, 70, p), card(b, 216, 112, 0, 80, p), card(c, 298, 132, 5, 64, p)];
        break;
      case 'choice':
        cards = [card(a, 110, 112, 0, 62, p), card(b, 200, 112, 0, 62, p, true), card(c, 290, 112, 0, 62, p)];
        front = `<g transform="translate(222 176)"><circle r="22" fill="${p.accent}" opacity=".18"/><circle r="11" fill="${p.accent}"/></g>`;
        break;
      case 'tap':
        cards = row(96, 60);
        front = `<g transform="translate(200 196)"><circle r="30" fill="${p.accent}"/><circle r="30" fill="none" stroke="${p.accent}" stroke-opacity=".3" stroke-width="12"/><circle r="9" fill="#fff"/></g>`;
        break;
      case 'steps':
        back += [0, 1, 2]
          .map(
            i =>
              `<rect x="${70 + i * 90}" y="${186 - i * 40}" width="96" height="${40 + i * 40}" rx="8" fill="${p.blob}" stroke="#fff" stroke-width="3"/>`
          )
          .join('');
        // Each card rests on its step: card height is 46 + 28, so its centre is 37 above the step top.
        cards = [card(a, 118, 149, 0, 46, p), card(b, 208, 109, 0, 46, p), card(c, 298, 69, 0, 46, p)];
        front = badge(350, 192, p, tick);
        break;
      default:
        cards = row();
    }
    return `<svg class="ds-cover" data-cover="${key}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${back}${cards.join('')}${front}</svg>`;
  }
  function keyFor(course) {
    if (typeof course === 'string') return covers[course] ? course : null;
    if (covers[course.id]) return course.id;
    if (course.mergedInto && covers[course.mergedInto]) return course.mergedInto;
    const skill = course.skillId || course.skill || learningSkills.find(s => s.courses.includes(course))?.id;
    return skillFallback[skill] || 'matching';
  }
  return {
    covers,
    /** Cover for a course object or id. Unknown courses fall back to their skill's cover. */
    course(course) {
      return compose(keyFor(course) || 'matching');
    },
    /** Cover for a support area id (language, dyslexia, attention, …). */
    support(id) {
      return compose(covers['support:' + id] ? 'support:' + id : 'matching');
    }
  };
})();

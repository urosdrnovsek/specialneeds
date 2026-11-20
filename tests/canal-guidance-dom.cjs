const { parseHTML } = require('linkedom'),
  fs = require('fs'),
  vm = require('vm'),
  path = require('path'),
  assert = require('node:assert/strict');
const root = process.env.APP_DIST || path.resolve(__dirname, '../dist'),
  html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'),
  { window } = parseHTML(html),
  document = window.document;
const values = new Map(),
  location = {
    pathname: '/',
    search: process.argv.includes('--manual') ? '?flow=manual' : '',
    hash: process.argv.includes('--startup') ? '#activity/controls/0' : ''
  };
const storage = {
  getItem: k => values.get(k) || null,
  setItem: (k, v) => values.set(k, String(v)),
  removeItem: k => values.delete(k)
};
const history = {
  replaceState(s, t, u) {
    if (u) {
      const n = new URL(u, 'https://app.test');
      Object.assign(location, { pathname: n.pathname, search: n.search, hash: n.hash });
    }
  },
  pushState(s, t, u) {
    this.replaceState(s, t, u);
  }
};
window.Element.prototype.scrollIntoView = function () {};
window.Element.prototype.focus = function () {};
let timerId = 0;
const timers = new Map(),
  micro = [];
const sandbox = {
  document,
  console,
  localStorage: storage,
  location,
  history,
  URL,
  URLSearchParams,
  Map,
  Set,
  Blob,
  TextEncoder,
  structuredClone,
  performance,
  window: null,
  navigator: {},
  MutationObserver: class {
    observe() {}
    disconnect() {}
  },
  setTimeout: (fn, ms) => {
    const id = ++timerId;
    timers.set(id, { fn, ms });
    return id;
  },
  clearTimeout: id => timers.delete(id),
  requestAnimationFrame: () => ++timerId,
  cancelAnimationFrame() {},
  queueMicrotask: fn => micro.push(fn),
  matchMedia: () => ({ matches: true, addEventListener() {} }),
  addEventListener() {},
  scrollTo() {},
  getComputedStyle: () => ({})
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
const c = vm.createContext(sandbox);
for (const tag of document.querySelectorAll('script[src]')) {
  const file = tag.getAttribute('src').split('?')[0];
  try {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), c, { filename: file });
  } catch (e) {
    console.error(file + ': ' + e.message);
    throw e;
  }
}
const run = s => vm.runInContext(s, c);
if (!process.argv.includes('--startup')) run('skillHome()');

function flush() {
  let n = 0;
  while (micro.length) {
    micro.shift()();
    if (++n > 500) throw Error('Microtask loop');
  }
}
function advance() {
  const id = run('readingTimer');
  if (id === null && document.querySelector('#readingContinue')) {
    click('#readingContinue');
    return;
  }
  assert(id !== null, 'Reading transition should be scheduled');
  const t = timers.get(id);
  assert(t, 'Scheduled transition should exist');
  timers.delete(id);
  t.fn();
  flush();
}
function click(selector) {
  const el = document.querySelector(selector);
  assert(el, 'Missing ' + selector);
  assert(!el.disabled, 'Disabled ' + selector);
  el.onclick ? el.onclick({ preventDefault() {} }) : el.dispatchEvent(new window.Event('click'));
  flush();
}
function launch(course, index) {
  run(`skillLaunch('${course}',${index})`);
  flush();
  assert(document.querySelector('.reading-play'));
  assert(document.querySelector('#coursePurpose'));
}
function state() {
  return run('readingState');
}

flush();
run("skillLaunch('controls',0)");
flush();
const snapshots = [];
function next(source, target, text) {
  assert(document.querySelector('#ppCanalNext').textContent.includes(text));
  assert.equal(
    document.querySelector('[data-pp-canal][data-canal-next]')?.dataset.ppCanal ||
      document.querySelector('[data-pp-water][data-canal-next]')?.dataset.ppWater,
    source
  );
  assert.equal(document.querySelector('[data-canal-target]')?.dataset.ppCanal, target || undefined);
}
function remember(name) {
  snapshots.push({
    name,
    instruction: document.querySelector('#ppCanalNext').textContent,
    board: document.querySelector('.pp-canal-board').outerHTML,
    state: run('JSON.parse(JSON.stringify(senState.play.canal))')
  });
}
function move(from, to) {
  click(`[data-pp-canal="${from}"]`);
  click(`[data-pp-canal="${to}"]`);
}
next('duck', 'boat', 'Move Duck');
remember('Board Duck');
assert(
  document
    .querySelector('.pp-canal-instruction')
    .compareDocumentPosition(document.querySelector('.pp-canal-board')) & 4
);
// Exploration cannot strand the player without a concrete recovery instruction.
click('[data-pp-canal="pump"]');
next('down', null, 'Lower the water');
click('[data-pp-canal="pump"]');
click('[data-pp-canal="gate"]');
next('gate', null, 'Close the gate');
remember('Recover from early pumping');
click('[data-pp-canal="gate"]');
click('[data-pp-water="down"]');
click('[data-pp-water="down"]');
// Either passenger may go first; selecting the parcel updates the picture instruction.
click('[data-pp-canal="parcel"]');
next('parcel', 'boat', 'Put the parcel');
click('[data-pp-canal="boat"]');
next('duck', 'boat', 'Move Duck');
move('duck', 'boat');
next('pump', null, 'Pump the water');
remember('Both aboard');
click('[data-pp-canal="pump"]');
next('pump', null, 'Pump once more');
remember('Water halfway');
click('[data-pp-canal="pump"]');
next('gate', null, 'Open the gate');
remember('Water level');
assert(!run('senState.done'));
click('[data-pp-canal="gate"]');
next('boat', 'dock', 'Move the boat');
remember('Gate open');
move('boat', 'dock');
next('duck', 'dock', 'Move Duck onto');
remember('Arrived, still aboard');
assert.equal(run('senState.play.canal.duck'), 'boat');
assert.equal(run('senState.play.canal.parcel'), 'boat');
move('parcel', 'dock');
next('duck', 'dock', 'Move Duck onto');
remember('Parcel delivered');
move('duck', 'dock');
assert(run('senState.done'));
assert(document.querySelector('#ppCanalNext').textContent.includes('home'));
assert.equal(document.querySelectorAll('[data-canal-next]').length, 0);
remember('Home safe');
// Surface contact is checked against authored coordinates, not arbitrary screenshot pixels.
for (const shot of snapshots) {
  const { document: d } = parseHTML(shot.board);
  const state = shot.state,
    water = 333 - state.water * 47;
  function center(id) {
    const e = d.querySelector(`[data-pp-canal="${id}"]`);
    return { y: parseFloat(e.style.top) * 4, x: parseFloat(e.style.left) * 7 };
  }
  const duck = center('duck'),
    parcel = center('parcel'),
    boat = center('boat');
  const duckFeet = duck.y - 50 + (104 / 110) * 100,
    parcelBase = parcel.y - 32 + (85 / 100) * 64;
  const duckSurface = state.duck === 'boat' ? water - 20 : state.duck === 'dock' ? 205 : 277;
  const parcelSurface = state.parcel === 'boat' ? water - 20 : state.parcel === 'delivered' ? 205 : 277;
  assert(Math.abs(duckFeet - duckSurface) < 3, shot.name + ' duck support');
  assert(Math.abs(parcelBase - parcelSurface) < 3, shot.name + ' parcel support');
  assert.equal(boat.y, water - 8);
}
if (process.env.CANAL_ART_OUT)
  fs.writeFileSync(process.env.CANAL_ART_OUT, JSON.stringify(snapshots, null, 2));
console.log(
  'Canal guidance: explicit next move, source/destination cues, either loading order, recovery, lift/gate/sail/unload sequence and nine supported scene states passed (DOM/static geometry only).'
);

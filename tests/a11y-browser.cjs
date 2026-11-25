// Automated accessibility check (axe-core, WCAG 2.1 A/AA rules) on the main pages and on games from
// each engine family, in the light and dark themes. Fails on any serious or critical violation.
// This is automated coverage only: it does not replace testing with VoiceOver/TalkBack/NVDA.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const types = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};
const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const pages = [
  ['home', ''],
  ['courses', '#courses'],
  ['course', '#course/planning'],
  ['reading path', '#course/reading-path-letters'],
  ['support area', '#support/dyslexia'],
  ['settings', '#settings'],
  ['setup', '#setup'],
  ['more', '#more'],
  ['practice', '#practice'],
  ['picture check', '#picture-check'],
  ['matching game', '#activity/matching/0'],
  ['picture choice', '#activity/communicate/1'],
  ['reading game', '#activity/short-words-v2/3'],
  ['I-spy game', '#activity/comfort/1'],
  ['adventure bus', '#activity/controls/1'],
  ['story choice', '#activity/story-meaning/2']
];
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : fs.existsSync('/usr/bin/chromium')
        ? { executablePath: '/usr/bin/chromium' }
        : {}),
    headless: true
  });
  const failures = [];
  let checked = 0;
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 850 },
      reducedMotion: 'reduce'
    });
    const page = await context.newPage();
    await page.route('https://spot-match.test/**', r => {
      const n = new URL(r.request().url()).pathname.slice(1) || 'index.html';
      return r.fulfill({
        contentType: types[path.extname(n)] || 'text/html',
        body: fs.readFileSync(path.join(root, 'dist', n))
      });
    });
    await page.addInitScript(t => {
      localStorage.setItem('spotmatch-course-flow', 'manual');
      localStorage.setItem('spotmatch-preferences-v1', JSON.stringify({ theme: t }));
    }, theme);
    for (const [name, hash] of pages) {
      await page.goto('https://spot-match.test/' + hash);
      await page.reload();
      await page.waitForTimeout(400);
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(() =>
        axe
          .run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
          .then(r =>
            r.violations
              .filter(v => ['serious', 'critical'].includes(v.impact))
              .map(v => v.id + ' (' + v.nodes.length + '): ' + v.nodes[0].target.join(' '))
          )
      );
      checked++;
      for (const v of violations) failures.push(theme + ' / ' + name + ': ' + v);
    }
    await context.close();
  }
  await browser.close();
  assert.deepEqual(failures, [], 'serious or critical accessibility violations');
  console.log(
    JSON.stringify({
      pagesChecked: checked,
      themes: ['light', 'dark'],
      seriousOrCritical: 0,
      engine: 'axe-core'
    })
  );
})().catch(e => {
  console.error(e.message);
  process.exit(1);
});

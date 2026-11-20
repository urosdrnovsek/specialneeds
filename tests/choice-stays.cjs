const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : fs.existsSync('/usr/bin/chromium')
        ? { executablePath: '/usr/bin/chromium' }
        : {}),
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('spotmatch-course-flow', 'manual'));
  await page.route('https://spot-match.test/**', r => {
    const n = new URL(r.request().url()).pathname.slice(1) || 'index.html';
    return r.fulfill({
      contentType: n.endsWith('.js')
        ? 'application/javascript'
        : n.endsWith('.css')
          ? 'text/css'
          : n.endsWith('.svg')
            ? 'image/svg+xml'
            : n.endsWith('.json')
              ? 'application/json'
              : 'text/html',
      body: fs.readFileSync(path.join(root, 'dist', n))
    });
  });
  await page.goto('https://spot-match.test/?flow=manual');
  const cdp = await context.newCDPSession(page);
  async function launch(course, index) {
    await page.evaluate(([c, i]) => skillLaunch(c, i), [course, index]);
    await page.waitForTimeout(30);
  }
  async function drag(source, target, { mouse = false, cancel = false, point } = {}) {
    const src = page.locator(source),
      dst = page.locator(target);
    await src.waitFor();
    await dst.waitFor({ state: 'attached' });
    await page.evaluate(
      ([a, b]) => {
        const s = document.querySelector(a).getBoundingClientRect(),
          t = document.querySelector(b).getBoundingClientRect(),
          top = Math.min(s.top, t.top) + scrollY,
          bottom = Math.max(s.bottom, t.bottom) + scrollY;
        window.scrollTo(0, Math.max(0, Math.min(top - 65, bottom - innerHeight + 35)));
      },
      [source, target]
    );
    await page.waitForTimeout(35);
    const a = await src.boundingBox(),
      b = await dst.boundingBox(),
      start = { x: a.x + a.width / 2, y: a.y + a.height / 2 },
      end = point
        ? { x: b.x + b.width * point.x, y: b.y + b.height * point.y }
        : { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    if (mouse) {
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(end.x, end.y, { steps: 12 });
      if (cancel) await page.keyboard.press('Escape');
      await page.mouse.up();
    } else {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: start.x, y: start.y, id: 1 }]
      });
      for (let i = 1; i <= 12; i++)
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [
            { x: start.x + ((end.x - start.x) * i) / 12, y: start.y + ((end.y - start.y) * i) / 12, id: 1 }
          ]
        });
      await cdp.send('Input.dispatchTouchEvent', {
        type: cancel ? 'touchCancel' : 'touchEnd',
        touchPoints: []
      });
    }
    await page.waitForTimeout(50);
    assert.equal(await page.locator('.tp-ghost').count(), 0);
    assert.equal(await page.locator('.tp-lifted').count(), 0);
  }
  // The retired topic picker (trains / animals / a picnic) and its separate "Your choice" drop box are gone.
  // A one-tap picture choice now stays visible as the pressed picture itself until the adult checks it.
  const pressed = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('[data-sen-choice]')].map(e => e.getAttribute('aria-pressed'))
    );
  await launch('communicate', 1);
  assert.equal(await page.locator('#senChoiceHome, .sen-choice-caption, .tp-answer-pad').count(), 0);
  assert.doesNotMatch(await page.locator('#app').innerText(), /trains, animals, or a picnic/i);
  const t = await page.evaluate(() => senState.task);
  const wrong = t.options.findIndex(o => !t.answer.includes(o.id)),
    right = t.options.findIndex(o => t.answer.includes(o.id));
  for (const i of [wrong, right]) {
    await page.locator(`[data-sen-choice="${i}"]`).tap();
    assert.equal(await page.evaluate(() => senState.selection), i);
    const expected = t.options.map((_, j) => String(j === i));
    assert.deepEqual(await pressed(), expected);
    await page.waitForTimeout(250);
    assert.deepEqual(await pressed(), expected, 'the choice stays pressed');
  }
  // Keyboard selection works the same way.
  await page.locator(`[data-sen-choice="${wrong}"]`).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => senState.selection), wrong);
  // Dragging a picture somewhere meaningless does not change the choice.
  await drag(`[data-sen-choice="${right}"]`, '.play-invitation');
  assert.equal(await page.evaluate(() => senState.selection), wrong);
  await page.locator(`[data-sen-choice="${right}"]`).tap();
  await page.locator('#senCheck').tap();
  assert.equal(await page.evaluate(() => senState.done), true);
  for (const key of ['autism', 'development', 'motor']) {
    await page.evaluate(k => {
      senActive = k;
      senIntro(k === 'motor' ? 1 : 0);
      document.querySelector('#senBegin').click();
    }, key);
    if (await page.locator('[data-sen-choice]').count()) {
      await page.locator('[data-sen-choice="0"]').tap();
      assert.equal(await page.locator('[data-sen-choice="0"]').getAttribute('aria-pressed'), 'true');
    }
    assert.equal(await page.locator('#senChoiceHome, .tp-answer-pad').count(), 0, key);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
  await page.screenshot({ path: path.join(root, 'test-results', 'choice-stays-mobile.png'), fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        activity: 'Hear It, Find It (one-tap picture choice)',
        retiredTopicPicker: 'absent',
        dropBox: 'absent; the pressed picture shows the choice',
        tapAndKeyboard: 'same pressed state',
        invalidDrag: 'previous choice retained',
        otherPathways: 'no drop box, no overflow',
        pageErrors: errors
      },
      null,
      2
    )
  );
  await browser.close();
})().catch(e => {
  console.error(e);
  process.exit(1);
});

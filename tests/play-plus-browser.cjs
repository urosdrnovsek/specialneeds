// Regression checks for the Nov 2026 play and comfort round: phone fit, visible feedback, "Show me how",
// levels, visit goal, switch scanning, dwell, child mode, sound, variety, setup, practice map, settings,
// navigation, picture check, translation and offline loading.
const { chromium, devices } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const types = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json'
};
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : fs.existsSync('/usr/bin/chromium')
        ? { executablePath: '/usr/bin/chromium' }
        : {}),
    headless: true
  });
  async function open(options = {}, prefs = null) {
    const context = await browser.newContext({
      viewport: { width: 1100, height: 850 },
      reducedMotion: 'reduce',
      ...options
    });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('https://spot-match.test/**', r => {
      const n = new URL(r.request().url()).pathname.slice(1) || 'index.html';
      return r.fulfill({
        contentType: types[path.extname(n)] || 'text/html',
        body: fs.readFileSync(path.join(root, 'dist', n))
      });
    });
    await page.addInitScript(p => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('spotmatch-course-flow', 'manual');
      if (p) localStorage.setItem('spotmatch-preferences-v1', JSON.stringify(p));
    }, prefs);
    await page.goto('https://spot-match.test/');
    return { context, page, errors };
  }
  const launch = (page, c, i) => page.evaluate(([c, i]) => skillLaunch(c, i), [c, i]);

  // Navigation, More, settings, translation.
  {
    const { context, page, errors } = await open();
    assert.deepEqual(await page.locator('#studioNav a').allInnerTexts(), [
      'Find support',
      'Courses',
      'Free play',
      'My practice',
      'More'
    ]);
    assert.equal(await page.locator('#studioNav a[href="?library=playroom"]').count(), 1);
    await page.locator('#studioNav a[href="#more"]').click();
    assert.ok((await page.locator('.ds-more-item').count()) >= 8);
    await page.locator('#dsSettingsButton').click();
    await page.locator('input[name="textSize"][value="large"]').check({ force: true });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.text), 'large');
    await page.locator('input[name="theme"][value="dark"]').check({ force: true });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    await page.locator('input[name="contrast"][value="high"]').check({ force: true });
    await page.locator('input[name="language"][value="sl"]').check({ force: true });
    assert.equal(await page.locator('#studioNav a').first().innerText(), 'Poišči podporo');
    await page.reload();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.contrast), 'high');
    await launch(page, 'matching', 0);
    assert.match(await page.locator('#courseFlowBar').innerText(), /Dejavnost 1 od 6/);
    await page.evaluate(() => {
      Prefs.set('language', 'en');
      Prefs.set('theme', 'light');
      Prefs.set('contrast', 'normal');
      Prefs.set('textSize', 'normal');
    });
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Setup questions apply sensible settings and recommend courses; the home shows them.
  {
    const { context, page, errors } = await open();
    await page.locator('.ds-start-cta').waitFor();
    await page.locator('.ds-start-cta').click();
    await page.locator('input[name="age"][value="under5"]').check({ force: true });
    await page.locator('input[name="areas"][value="language"]').check({ force: true });
    await page.locator('input[name="areas"][value="motor"]').check({ force: true });
    await page.locator('input[name="areas"][value="calm"]').click({ force: true });
    assert.equal(await page.locator('input[name="areas"]:checked').count(), 2, 'at most two areas');
    await page.locator('input[name="answer"][value="switch"]').check({ force: true });
    await page.locator('#dsSetupDone').click();
    assert.ok((await page.locator('.ds-mini-course').count()) >= 2);
    assert.equal(await page.evaluate(() => Prefs.get('visitGoal')), 2);
    assert.equal(await page.evaluate(() => Prefs.get('access')), 'scan1');
    await page.evaluate(() => Prefs.set('access', 'touch'));
    await page.evaluate(() => Studio.go('#support'));
    assert.ok((await page.locator('.ds-start .ds-mini-course').count()) >= 1);
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Feedback, Show me how, Gentler level, visit goal and the visit screen.
  {
    const { context, page, errors } = await open();
    await page.evaluate(() => QuickPlay.pause());
    await launch(page, 'story-meaning', 2);
    const wrong = await page.evaluate(() =>
      learningState.options.findIndex(o => !learningState.answer.includes(o.id))
    );
    const right = await page.evaluate(() =>
      learningState.options.findIndex(o => learningState.answer.includes(o.id))
    );
    await page.locator(`[data-learning-choice="${wrong}"]`).click();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('.ds-tried').count(), 1, 'a wrong picture is marked as tried');
    assert.equal(await page.locator('.feedback.ds-fb-retry').count(), 1);
    await page.locator(`[data-learning-choice="${right}"]`).click();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('.feedback.ds-fb-good').count(), 1);
    await launch(page, 'communicate', 1);
    await page.locator('.ds-showme').click();
    await page.waitForTimeout(200);
    assert.ok((await page.locator('.ds-spot').count()) >= 1, 'Show me how points at something');
    assert.equal(await page.locator('.feedback.ds-fb-retry').count(), 0, 'a hint is not a wrong answer');
    await page.evaluate(() => Prefs.setLevel('story-meaning', 'gentle'));
    await launch(page, 'story-meaning', 2);
    await page.waitForTimeout(100);
    assert.equal(
      await page.locator('[data-learning-choice]:visible').count(),
      2,
      'Gentler shows one picture fewer'
    );
    assert.equal(
      await page.evaluate(() => PlayPlus.isCorrect(document.querySelector('.ds-level-hidden'))),
      false
    );
    await page.evaluate(() => Prefs.setLevel('story-meaning', 'standard'));
    await page.evaluate(() => {
      QuickPlay.resume();
      CourseFlow.setAutomatic(true);
      Prefs.set('visitGoal', 2);
    });
    await launch(page, 'matching', 0);
    for (let k = 0; k < 2; k++) {
      const i = await page.evaluate(() => current.choices.findIndex(c => c.match));
      await page.locator(`[data-choice="${i}"]`).click();
      await page.waitForTimeout(2200);
    }
    assert.match(await page.locator('.ds-visit h1').innerText(), /today’s visit/);
    assert.equal(await page.locator('.ds-visit-strip li').count(), 2);
    assert.equal(await page.locator('#courseFlowBar').isVisible(), false);
    await page.locator('#dsVisitNext').click();
    assert.equal(await page.evaluate(() => skillContext.index), 2);
    await page.evaluate(() => Prefs.set('visitGoal', 0));
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Two-switch scanning and dwell selection.
  {
    const { context, page, errors } = await open({}, { access: 'scan2' });
    await page.evaluate(() => QuickPlay.pause());
    await launch(page, 'communicate', 1);
    assert.match(await page.locator('.ds-access-hint').innerText(), /Two switches/);
    let guard = 0;
    while (
      !(await page.evaluate(() => !!document.querySelector('.ds-scan-focus[data-sen-choice]'))) &&
      guard++ < 20
    )
      await page.keyboard.press(' ');
    assert.ok(guard < 20, 'scanning reaches a picture');
    await page.keyboard.press('Enter');
    assert.notEqual(
      await page.evaluate(() => senState.selection),
      null,
      'Enter selects the highlighted picture'
    );
    await page.evaluate(() => Prefs.set('access', 'dwell'));
    await launch(page, 'communicate', 1);
    const box = await page.locator('[data-sen-choice="2"]').boundingBox();
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.move(box.x + 30, box.y + 30);
    await page.waitForTimeout(1500);
    assert.equal(await page.evaluate(() => senState.selection), 2, 'dwelling selects');
    await page.evaluate(() => Prefs.set('access', 'touch'));
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Child mode hides menus and adult notes; press and hold leaves it.
  {
    const { context, page, errors } = await open({}, { childMode: true });
    await launch(page, 'communicate', 1);
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#studioNav').isVisible(), false);
    assert.equal(await page.locator('#courseStop').isVisible(), false);
    assert.equal(await page.locator('#coursePurpose').isVisible(), false);
    const lock = page.locator('#dsChildExit');
    await lock.click();
    assert.equal(await page.evaluate(() => Prefs.get('childMode')), true, 'a short tap does not leave');
    const b = await lock.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(2300);
    await page.mouse.up();
    assert.equal(
      await page.evaluate(() => Prefs.get('childMode')),
      false,
      'press and hold leaves child mode'
    );
    assert.equal(await page.locator('#studioNav').isVisible(), true);
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Sound, variety, picture check, practice map and calmer course page.
  {
    const { context, page, errors } = await open();
    await page.evaluate(() => {
      Prefs.set('sound', true);
      PlayPlus.Sound.good();
      PlayPlus.Sound.retry();
      Prefs.set('sound', false);
    });
    const rooms = await page.evaluate(() => {
      const i = calmActivities.findIndex(d => d.mode === 'ground');
      const out = [];
      for (let k = 0; k < 3; k++) {
        calmOpen(i);
        out.push(calmSeeRoom.join(','));
      }
      return out;
    });
    assert.ok(new Set(rooms).size >= 2, 'the I-spy room changes between visits');
    const finds = await page.evaluate(() => {
      calmOpen(calmActivities.findIndex(d => d.mode === 'find'));
      return [0, 1, 2, 3].map(step => {
        calmState.step = step;
        const m = calmModel(calmState);
        return m.options[m.answer];
      });
    });
    assert.equal(new Set(finds).size, 4, 'find rounds use different pictures');
    await page.evaluate(() => Studio.go('#picture-check'));
    const first = await page.evaluate(
      () => vocabularyCategoryIds([...vocabularyCategories.values()][0].id, true)[0]
    );
    await page.locator('[data-check="no"]').click();
    assert.equal(
      await page.evaluate(
        id => vocabularyCategoryIds([...vocabularyCategories.values()][0].id).includes(id),
        first
      ),
      false,
      'games avoid a picture marked not recognised'
    );
    await page.locator(`[data-uncheck]`).first().click();
    await launch(page, 'planning', 0);
    await page.evaluate(() => {
      skillNotes.planning = { activities: { 0: true } };
    });
    await page.evaluate(() => Studio.go('#practice'));
    assert.equal(await page.locator('.ds-practice-item').count(), 1);
    assert.equal(await page.locator('.ds-stage-dots i.done').count(), 1);
    assert.match(await page.locator('[data-practice-next]').innerText(), /Next:/);
    await page.evaluate(() => Studio.go('#course/planning'));
    assert.equal(await page.locator('#dsCourseAdult').count(), 1);
    assert.equal(
      (await page.locator('#dsCourseAdult .studio-notice, #dsCourseAdult details.skill-notes').count()) >= 1,
      true
    );
    assert.equal(
      await page.locator('.skill-course-activities > .studio-notice').count(),
      0,
      'notices live in the adult section'
    );
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Phone: games fit on one screen; the home is one column.
  {
    const { context, page, errors } = await open({ ...devices['iPhone 13'] });
    for (const [course, index] of [
      ['matching', 0],
      ['story-meaning', 2],
      ['communicate', 1],
      ['goal', 1],
      ['controls', 1],
      ['comfort', 1],
      ['purpose', 1],
      ['short-words-v2', 3]
    ]) {
      await launch(page, course, index);
      await page.waitForTimeout(500);
      await page.evaluate(() => scrollTo(0, 0));
      const bottom = await page.evaluate(() => {
        const wrap = document.querySelector('.game-wrap, .pr-play, .reading-play');
        const els = [
          ...wrap.querySelectorAll(
            '[data-choice],[data-learning-choice],[data-sen-choice],[data-focus-choice],[data-calm-open],[data-calm-spot],.reading-tile,.pr-tool,[data-pp-trip]'
          )
        ].filter(e => e.offsetParent);
        return Math.max(...els.map(e => e.getBoundingClientRect().bottom));
      });
      assert.ok(
        bottom <= (await page.evaluate(() => innerHeight)),
        `${course}/${index} fits on the phone screen (${Math.round(bottom)})`
      );
    }
    await page.evaluate(() => Studio.go('#support'));
    const columns = await page
      .locator('.studio-needs-grid')
      .evaluate(g => getComputedStyle(g).gridTemplateColumns.split(' ').length);
    assert.equal(columns, 1, 'phone home shows one support card per row');
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Offline: with the service worker, a fresh load works without a network.
  {
    const server = http
      .createServer((req, res) => {
        const n = decodeURIComponent(new URL(req.url, 'http://x').pathname).slice(1) || 'index.html';
        const file = path.join(root, 'dist', n);
        if (
          !file.startsWith(path.join(root, 'dist')) ||
          !fs.existsSync(file) ||
          fs.statSync(file).isDirectory()
        ) {
          res.writeHead(404);
          return res.end();
        }
        res.writeHead(200, { 'Content-Type': types[path.extname(n)] || 'text/html' });
        res.end(fs.readFileSync(file));
      })
      .listen(0, '127.0.0.1');
    await new Promise(r => server.once('listening', r));
    const origin = 'http://127.0.0.1:' + server.address().port;
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(origin + '/?sw=on');
    await page.waitForFunction(
      async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated',
      null,
      {
        timeout: 20000
      }
    );
    // Cache writes commit asynchronously after activation; wait until the whole shell is stored.
    await page.waitForFunction(
      async () => {
        const name = (await caches.keys()).find(k => k.startsWith('spotmatch-shell-'));
        if (!name) return false;
        const cache = await caches.open(name);
        return (await cache.keys()).length >= 90 && !!(await cache.match('./'));
      },
      null,
      { timeout: 20000 }
    );
    // An online visit first lets the worker take control of new pages (clients.claim) before going offline.
    const warm = await context.newPage();
    await warm.goto(origin + '/');
    assert.equal(await warm.evaluate(() => !!navigator.serviceWorker.controller), true);
    await context.setOffline(true);
    const fresh = await context.newPage();
    await fresh.goto(origin + '/#courses');
    assert.equal(await fresh.locator('h1').first().innerText(), 'Choose a useful learning goal');
    await fresh.evaluate(() => skillLaunch('matching', 0));
    assert.equal(await fresh.locator('h1').first().innerText(), 'Find my twin');
    await context.close();
    server.close();
  }

  await browser.close();
  console.log('play-plus browser checks passed');
})().catch(e => {
  console.error(e);
  process.exit(1);
});

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
  const page = await browser.newPage({ viewport: { width: 1200, height: 950 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(30000);
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
  await page.goto('https://spot-match.test/');
  // The home is now support-first; courses are reached through the Courses page and course routes.
  const go = hash => page.evaluate(h => Studio.go(h), hash);
  await go('#courses');
  assert.equal(await page.locator('.ds-course-chips a').count(), 9);
  assert.equal(await page.locator('.ds-course-group').count(), 8);
  assert.equal(await page.locator('[data-pr-game]').count(), 0);
  const courses = await page.evaluate(() =>
    learningSkills.flatMap(s =>
      s.courses.map(c => ({ skill: s.id, id: c.id, n: c.activities.length, merged: !!c.mergedInto }))
    )
  );
  // 46 authored courses + 4 reading paths; the 20 merged short courses keep working routes.
  assert.equal(courses.length, 50);
  assert.equal(await page.locator('#studioResults .studio-course-card').count(), 30);
  await page.locator('#studioResults a[href="#course/routines"]').first().click();
  await page.locator('#skillBegin').click();
  await page.goBack();
  assert.equal(await page.locator('h1').innerText(), 'First, then: familiar routines');
  await page.goBack();
  assert.equal(await page.locator('h1').innerText(), 'Choose a useful learning goal');
  await page.evaluate(() => {
    const parser = new DOMParser();
    for (const s of learningSkills)
      for (const c of s.courses) {
        if (parser.parseFromString(DesignCovers.course(c), 'image/svg+xml').querySelector('parsererror'))
          throw Error('Invalid course cover ' + c.id);
        // Offline pilot activities use a vocabulary <img>, not inline SVG.
        for (const a of c.activities)
          if (
            a.engine !== 'offline' &&
            parser.parseFromString(skillArt(a), 'image/svg+xml').querySelector('parsererror')
          )
            throw Error('Invalid course preview ' + c.id);
      }
  });
  // Every course (including merged short courses reached by old links) opens with a concrete need,
  // goal, real-world exercise, and direct activity launch.
  for (const c of courses) {
    await go('#course/' + c.id);
    assert.equal(await page.locator('[data-course-activity],[data-pilot-activity]').count(), c.n, c.id);
    assert.ok((await page.locator('.skill-lead').innerText()).length > 30, c.id);
    assert.ok((await page.locator('.skill-real-life p').innerText()).length > 70, c.id);
    await page.locator('#skillBegin').click();
    assert.equal(await page.locator('#begin,#learningBegin,#adultBegin,#senBegin,#focusOne').count(), 0);
    assert.equal(await page.locator('.skill-session-context').count(), 1);
    assert.deepEqual(await page.evaluate(() => [skillContext.courseId, skillContext.index]), [c.id, 0]);
  }
  await go('#course/planning');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#skillDownloadPlan').click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'practice-plan-planning.txt');
  const plan = fs.readFileSync(await download.path(), 'utf8');
  assert.match(plan, /TRY IT IN EVERYDAY LIFE/);
  assert.match(plan, /two-picture plan/);
  assert.match(plan, /https:\/\//);
  await page.locator('#skillOffline').check();
  await page.getByText('Optional notes for next time', { exact: true }).click();
  await page.locator('[data-skill-note="1"]').check();
  await page.reload();
  assert.equal(await page.locator('h1').innerText(), 'Make a little picture plan');
  assert.equal(await page.locator('#skillOffline').isChecked(), true);
  await page.getByText('Optional notes for next time', { exact: true }).click();
  assert.equal(await page.locator('[data-skill-note="1"]').isChecked(), true);
  // Completion returns to the exact course, with an optional direct next activity.
  await go('#course/purpose');
  await page.locator('[data-course-activity="0"]').click();
  await page.locator('#prDone').click();
  assert.equal(await page.locator('#skillNextActivity').count(), 1);
  await page.locator('#skillNextActivity').click();
  assert.equal(await page.evaluate(() => prState.id), 'garden');
  await page.locator('#courseStop').click();
  assert.equal(await page.locator('h1').innerText(), 'Help a friend in everyday play');
  assert.match(await page.locator('.skill-course-hero .micro').innerText(), /1 explored/);
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const id of ['language', 'attention', 'access', 'sounds']) {
      await go('#courses?skill=' + id);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('#studioResults a[data-studio-course]').first().click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
  }
  fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
  await page.setViewportSize({ width: 1200, height: 950 });
  await go('#courses');
  await page.screenshot({ path: path.join(root, 'test-results', 'courses-page.png'), fullPage: true });
  await go('#course/planning');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(root, 'test-results', 'course-planning-mobile.png'),
    fullPage: true
  });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        skills: 8,
        courses: 50,
        listed: 30,
        everyCourse: 'purposeful overview; direct launch',
        parentNotes: 'persistent',
        courseReturn: 'preserved',
        mobile: [360, 390, 768],
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

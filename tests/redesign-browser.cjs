// Regression checks for the 2026-11 redesign: shared play-screen shell, course grouping/deep links,
// the two calm-library games that replaced picture-only "choose and nothing happens" screens, the single
// router, reading paths, course/support covers, one adult panel per screen and one-tap picture choices.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
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
  async function open(viewport, extra = {}) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', ...extra });
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
    return { context, page, errors };
  }

  // Desktop: deep links, course grouping, play shell.
  {
    const { context, page, errors } = await open({ width: 1280, height: 850 });
    await page.goto('https://spot-match.test/#courses');
    await page.waitForSelector('.ds-course-group');
    assert.equal(
      new URL(page.url()).hash,
      '#courses',
      '#courses deep link is not rewritten to the home page'
    );
    const groups = await page.locator('.ds-course-group').count();
    assert(groups >= 6, 'courses are grouped by skill');
    // 26 authored courses + 4 reading paths are listed; 20 short reading courses are merged into the paths.
    assert.equal(await page.locator('#studioResults .studio-course-card').count(), 30);
    await page.locator('.ds-course-chips a').nth(1).click();
    await page.waitForFunction(() => location.hash.includes('skill='));
    assert.equal(await page.locator('.ds-course-group').count(), 0, 'a filtered list is flat');
    assert.equal(await page.locator('.ds-skip').count(), 1, 'skip link exists');
    assert.match(await page.locator('.studio-welcome-art, body').first().innerHTML(), /./);

    await page.goto('https://spot-match.test/#activity/matching/0');
    await page.reload();
    await page.waitForSelector('#courseFlowBar');
    assert(
      await page.evaluate(
        () =>
          document.body.classList.contains('ds-playing') && document.body.classList.contains('ds-in-course')
      ),
      'play-mode classes'
    );
    assert.equal(
      await page.locator('#courseFlowBar .course-flow-meter i').count(),
      1,
      'course progress meter'
    );
    assert.equal(await page.locator('#back').isVisible(), false, 'duplicate course exit hidden');
    assert.equal(await page.locator('#courseStop').isVisible(), true, 'single course exit visible');
    const stageBottom = await page
      .locator('.game-stage .choices')
      .evaluate(e => e.getBoundingClientRect().bottom);
    assert(stageBottom <= 850, 'choices are visible without scrolling on a laptop screen: ' + stageBottom);
    await page.goto('https://spot-match.test/#support');
    await page.reload();
    await page.waitForSelector('.studio-welcome');
    assert.equal(
      await page.evaluate(() => document.body.classList.contains('ds-playing')),
      false,
      'home is not play mode'
    );
    assert.equal(await page.locator('.studio-welcome-art .ds-hero-art').count(), 1, 'new hero illustration');
    assert.deepEqual(errors, []);
    await context.close();
  }

  // "Here Around Me": the chosen object must be found in the room; three finds fill the basket.
  {
    const { context, page, errors } = await open(
      { width: 390, height: 844 },
      { isMobile: true, hasTouch: true }
    );
    await page.addInitScript(() => localStorage.setItem('spotmatch-course-flow', 'manual'));
    await page.goto('https://spot-match.test/');
    await page.evaluate(() => {
      QuickPlay.pause();
      skillLaunch('comfort', 1);
    });
    await page.waitForSelector('.calm-see');
    assert.equal(
      await page.locator('[data-calm-spot]:not([disabled])').count(),
      0,
      'room waits for a choice'
    );
    await page.locator('[data-calm-open="1"]').tap();
    assert.equal(await page.locator('[data-calm-open="1"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-calm-spot="0"]').tap();
    assert.match(await page.locator('.calm-play .feedback').innerText(), /That is the lamp/);
    assert.deepEqual(await page.evaluate(() => calmState.spotted), []);
    await page.locator('[data-calm-spot="5"]').tap();
    assert.deepEqual(await page.evaluate(() => calmState.spotted), ['book']);
    assert.equal(await page.locator('.calm-see-gap').count(), 1, 'found object leaves the room');
    assert.equal(await page.locator('.calm-see-slots .filled').count(), 1, 'and goes into the basket');
    assert.equal(
      await page.locator('[data-calm-open="1"]').isDisabled(),
      true,
      'found objects cannot be chosen again'
    );
    await page.locator('[data-calm-open="0"]').tap();
    const src = await page.locator('[data-calm-spot="1"]').boundingBox(),
      dst = await page.locator('.calm-see-basket').boundingBox();
    await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2);
    await page.mouse.down();
    await page.mouse.move(src.x + src.width / 2 + 20, src.y + src.height / 2 + 20, { steps: 4 });
    await page.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, { steps: 8 });
    await page.mouse.up();
    assert.deepEqual(
      await page.evaluate(() => calmState.spotted),
      ['book', 'flower'],
      'drag into the basket works'
    );
    await page.locator('[data-calm-open="2"]').tap();
    await page.keyboard.press('Tab');
    await page.locator('[data-calm-spot="3"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => calmState.complete), true, 'keyboard completes the basket');
    assert.match(await page.locator('.calm-play .play-invitation').innerText(), /basket is full/);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      'no horizontal overflow'
    );
    assert.deepEqual(errors, []);
    await context.close();
  }

  // "A Slow Little Look": close-ups must be matched to the chosen picture, and found details are marked.
  {
    const { context, page, errors } = await open({ width: 1100, height: 850 });
    await page.goto('https://spot-match.test/?library=full');
    await page.evaluate(() => {
      QuickPlay.pause();
      calmOpen(calmActivities.findIndex(d => d.mode === 'notice'));
    });
    await page.locator('[data-calm-open="0"]').click();
    assert.equal(await page.locator('[data-calm-detail]').count(), 3);
    for (let r = 0; r < 3; r++) {
      const right = await page.evaluate(() => calmSeeOptions(calmState).findIndex(o => o.id === 'apple'));
      await page.locator(`[data-calm-detail="${(right + 1) % 3}"]`).click();
      assert.equal(await page.evaluate(() => calmState.spotted.length), r, 'a wrong close-up does not count');
      await page.locator(`[data-calm-detail="${right}"]`).click();
      assert.equal(
        await page.locator('.calm-see-marks circle').count(),
        r + 1,
        'found detail is marked on the picture'
      );
    }
    assert.equal(await page.evaluate(() => calmState.complete), true);
    assert.equal(await page.locator('[data-calm-detail]').count(), 0);
    assert.equal(
      new Set(
        await page.evaluate(() =>
          ['apple', 'butterfly', 'spoon'].flatMap(id => calmSeeDetails[id].map(r => calmSeeCrop(id, r)))
        )
      ).size,
      9,
      'nine distinct close-ups'
    );
    await page.locator('#calmFinish').click();
    assert.match(await page.locator('h1').innerText(), /little moment/);
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Router: optional libraries keep their own navigation; Back/Forward render the right page.
  {
    const { context, page, errors } = await open({ width: 1280, height: 850 });
    await page.goto('https://spot-match.test/?library=full');
    await page.waitForSelector('#dsMainApp');
    assert.equal(new URL(page.url()).search, '?library=full', 'library deep link is kept');
    assert.equal(await page.locator('#libraryNav').isVisible(), true);
    assert.equal(await page.locator('#studioNav').isVisible(), false);
    await page.locator('#dsMainApp').click();
    await page.waitForSelector('.studio-welcome');
    assert.equal(await page.locator('#dsMainApp').count(), 0);
    await page.goto('https://spot-match.test/?library=playroom');
    await page.waitForSelector('[data-pr-game]');
    await page.goto('https://spot-match.test/#courses');
    await page.waitForSelector('.ds-course-group');
    await page.locator('#studioResults a[href="#course/reading-path-letters"]').first().click();
    await page.waitForSelector('.studio-stage');
    await page.goBack();
    await page.waitForSelector('.ds-course-group');
    await page.goForward();
    await page.waitForSelector('.studio-stage');
    assert.equal(await page.locator('h1').first().innerText(), 'First letters and sounds');
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Reading paths: one stage per merged course, old course links still open, progress carries over.
  {
    const { context, page, errors } = await open({ width: 1100, height: 850 });
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        sessionStorage.setItem('seeded', '1');
        localStorage.setItem(
          'spotmatch-course-notes-v1',
          JSON.stringify({ 'letter-forms': { activities: { 0: true } } })
        );
      }
    });
    await page.goto('https://spot-match.test/#course/reading-path-letters');
    await page.waitForSelector('.studio-stage');
    const stages = await page.locator('.studio-stage summary b').allInnerTexts();
    assert.deepEqual(stages, [
      'Play with word endings',
      'Getting to know letters',
      'Letters carry sounds',
      'Letters that look alike',
      'Letter details & neighbour sounds'
    ]);
    assert.match(await page.locator('.studio-stage summary').nth(1).innerText(), /1 of 3 explored/);
    await page.goto('https://spot-match.test/#course/letter-forms');
    await page.reload();
    assert.equal(await page.locator('h1').first().innerText(), 'Getting to know letters');
    await page.goto('https://spot-match.test/#support/dyslexia');
    await page.reload();
    const linked = await page
      .locator('.support-reading-courses [data-home-course]')
      .evaluateAll(a => a.map(x => x.dataset.homeCourse));
    assert.deepEqual(linked, [
      'reading-path-letters',
      'reading-path-blend',
      'reading-path-meaning',
      'reading-path-purpose'
    ]);
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Covers, one adult panel, one-tap choices and the shared choice button.
  {
    const { context, page, errors } = await open({ width: 1100, height: 850 });
    await page.addInitScript(() => localStorage.setItem('spotmatch-course-flow', 'manual'));
    await page.goto('https://spot-match.test/#courses');
    await page.waitForSelector('.ds-course-group');
    const covers = await page
      .locator('#studioResults .studio-card-art svg.ds-cover')
      .evaluateAll(list => list.map(svg => svg.dataset.cover));
    assert.equal(covers.length, 30);
    assert.equal(new Set(covers).size, 30, 'every listed course has its own cover');
    const audit = await page.evaluate(() => {
      const parser = new DOMParser();
      const ids = new Set(vocabularyObjects.keys());
      const svgs = [
        'language',
        'dyslexia',
        'attention',
        'autism',
        'development',
        'speech',
        'motor',
        'calm'
      ].map(id => DesignCovers.support(id));
      return {
        invalid: svgs.filter(
          s =>
            /undefined|NaN/.test(s) || parser.parseFromString(s, 'image/svg+xml').querySelector('parsererror')
        ).length,
        uniqueSupport: new Set(svgs).size,
        unknownObjects: Object.values(DesignCovers.covers)
          .flatMap(c => c.objects)
          .filter(id => !ids.has(id))
      };
    });
    assert.deepEqual(audit, { invalid: 0, uniqueSupport: 8, unknownObjects: [] });
    for (const [course, index] of [
      ['comfort', 1],
      ['short-words-v2', 3],
      ['communicate', 1],
      ['matching', 0]
    ]) {
      await page.evaluate(([c, i]) => skillLaunch(c, i), [course, index]);
      await page.waitForSelector('#coursePurpose.ds-adult-panel');
      const outside = await page.evaluate(() => {
        const panel = document.querySelector('#coursePurpose');
        return [...document.querySelectorAll('#app details')].filter(d => !panel.contains(d)).length;
      });
      assert.equal(outside, 0, course + ': all adult notes are in the one panel');
      assert.equal(await page.locator('#coursePurpose').isVisible(), true);
    }
    for (const [course, index] of [
      ['communicate', 1],
      ['vocabulary', 2]
    ]) {
      await page.evaluate(([c, i]) => skillLaunch(c, i), [course, index]);
      await page.waitForTimeout(200);
      assert.equal(await page.locator('.tp-answer-pad, #senChoiceHome, #vocabChoiceHome').count(), 0, course);
    }
    const radius = [];
    for (const [course, index, selector] of [
      ['matching', 0, '.choice'],
      ['story-meaning', 2, '.learning-option'],
      ['communicate', 1, '[data-sen-choice]']
    ]) {
      await page.evaluate(([c, i]) => skillLaunch(c, i), [course, index]);
      await page.waitForSelector(selector);
      radius.push(
        await page
          .locator(selector)
          .first()
          .evaluate(e => getComputedStyle(e).borderRadius)
      );
    }
    assert.equal(new Set(radius).size, 1, 'one shared picture-choice button: ' + radius.join(', '));
    assert.deepEqual(errors, []);
    await context.close();
  }

  await browser.close();
  console.log('redesign browser checks passed');
})().catch(e => {
  console.error(e);
  process.exit(1);
});

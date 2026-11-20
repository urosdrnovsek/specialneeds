// Regression checks for the 2026-11 redesign: shared play-screen shell, course grouping/deep links,
// and the two calm-library games that replaced picture-only "choose and nothing happens" screens.
const{chromium}=require('playwright');const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');
const types={'.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),headless:true});
 async function open(viewport,extra={}){const context=await browser.newContext({viewport,reducedMotion:'reduce',...extra});const page=await context.newPage();page.setDefaultTimeout(8000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://spot-match.test/**',r=>{const n=new URL(r.request().url()).pathname.slice(1)||'index.html';return r.fulfill({contentType:types[path.extname(n)]||'text/html',body:fs.readFileSync(path.join(root,'dist',n))});});
  return{context,page,errors};}

 // Desktop: deep links, course grouping, play shell.
 {const{context,page,errors}=await open({width:1280,height:850});
  await page.goto('https://spot-match.test/#courses');await page.waitForSelector('.ds-course-group');
  assert.equal(new URL(page.url()).hash,'#courses','#courses deep link is not rewritten to the home page');
  const groups=await page.locator('.ds-course-group').count();assert(groups>=6,'courses are grouped by skill');
  const total=await page.locator('#studioResults .studio-course, #studioResults a[href^="#course/"]').count();assert(total>=40,'all courses remain listed: '+total);
  await page.locator('.ds-course-chips a').nth(1).click();await page.waitForFunction(()=>location.hash.includes('skill='));assert.equal(await page.locator('.ds-course-group').count(),0,'a filtered list is flat');
  assert.equal(await page.locator('.ds-skip').count(),1,'skip link exists');
  assert.match(await page.locator('.studio-welcome-art, body').first().innerHTML(),/./);

  await page.goto('https://spot-match.test/#activity/matching/0');await page.reload();await page.waitForSelector('#courseFlowBar');
  assert(await page.evaluate(()=>document.body.classList.contains('ds-playing')&&document.body.classList.contains('ds-in-course')),'play-mode classes');
  assert.equal(await page.locator('#courseFlowBar .course-flow-meter i').count(),1,'course progress meter');
  assert.equal(await page.locator('#back').isVisible(),false,'duplicate course exit hidden');
  assert.equal(await page.locator('#courseStop').isVisible(),true,'single course exit visible');
  const stageBottom=await page.locator('.game-stage .choices').evaluate(e=>e.getBoundingClientRect().bottom);assert(stageBottom<=850,'choices are visible without scrolling on a laptop screen: '+stageBottom);
  await page.goto('https://spot-match.test/#support');await page.reload();await page.waitForSelector('.studio-welcome');
  assert.equal(await page.evaluate(()=>document.body.classList.contains('ds-playing')),false,'home is not play mode');
  assert.equal(await page.locator('.studio-welcome-art .ds-hero-art').count(),1,'new hero illustration');
  assert.deepEqual(errors,[]);await context.close();}

 // "Here Around Me": the chosen object must be found in the room; three finds fill the basket.
 {const{context,page,errors}=await open({width:390,height:844},{isMobile:true,hasTouch:true});
  await page.addInitScript(()=>localStorage.setItem('spotmatch-course-flow','manual'));
  await page.goto('https://spot-match.test/');await page.evaluate(()=>{QuickPlay.pause();skillLaunch('comfort',1);});await page.waitForSelector('.calm-see');
  assert.equal(await page.locator('[data-calm-spot]:not([disabled])').count(),0,'room waits for a choice');
  await page.locator('[data-calm-open="1"]').tap();assert.equal(await page.locator('[data-calm-open="1"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-calm-spot="0"]').tap();assert.match(await page.locator('.calm-play .feedback').innerText(),/That is the lamp/);assert.deepEqual(await page.evaluate(()=>calmState.spotted),[]);
  await page.locator('[data-calm-spot="5"]').tap();assert.deepEqual(await page.evaluate(()=>calmState.spotted),['book']);
  assert.equal(await page.locator('.calm-see-gap').count(),1,'found object leaves the room');assert.equal(await page.locator('.calm-see-slots .filled').count(),1,'and goes into the basket');
  assert.equal(await page.locator('[data-calm-open="1"]').isDisabled(),true,'found objects cannot be chosen again');
  await page.locator('[data-calm-open="0"]').tap();
  const src=await page.locator('[data-calm-spot="1"]').boundingBox(),dst=await page.locator('.calm-see-basket').boundingBox();
  await page.mouse.move(src.x+src.width/2,src.y+src.height/2);await page.mouse.down();await page.mouse.move(src.x+src.width/2+20,src.y+src.height/2+20,{steps:4});await page.mouse.move(dst.x+dst.width/2,dst.y+dst.height/2,{steps:8});await page.mouse.up();
  assert.deepEqual(await page.evaluate(()=>calmState.spotted),['book','flower'],'drag into the basket works');
  await page.locator('[data-calm-open="2"]').tap();await page.keyboard.press('Tab');
  await page.locator('[data-calm-spot="3"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>calmState.complete),true,'keyboard completes the basket');assert.match(await page.locator('.calm-play .play-invitation').innerText(),/basket is full/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
  assert.deepEqual(errors,[]);await context.close();}

 // "A Slow Little Look": close-ups must be matched to the chosen picture, and found details are marked.
 {const{context,page,errors}=await open({width:1100,height:850});
  await page.goto('https://spot-match.test/?library=full');await page.evaluate(()=>{QuickPlay.pause();calmOpen(calmActivities.findIndex(d=>d.mode==='notice'));});
  await page.locator('[data-calm-open="0"]').click();assert.equal(await page.locator('[data-calm-detail]').count(),3);
  for(let r=0;r<3;r++){const right=await page.evaluate(()=>calmSeeOptions(calmState).findIndex(o=>o.id==='apple'));
   await page.locator(`[data-calm-detail="${(right+1)%3}"]`).click();assert.equal(await page.evaluate(()=>calmState.spotted.length),r,'a wrong close-up does not count');
   await page.locator(`[data-calm-detail="${right}"]`).click();assert.equal(await page.locator('.calm-see-marks circle').count(),r+1,'found detail is marked on the picture');}
  assert.equal(await page.evaluate(()=>calmState.complete),true);assert.equal(await page.locator('[data-calm-detail]').count(),0);
  assert.equal(new Set(await page.evaluate(()=>['apple','butterfly','spoon'].flatMap(id=>calmSeeDetails[id].map(r=>calmSeeCrop(id,r))))).size,9,'nine distinct close-ups');
  await page.locator('#calmFinish').click();assert.match(await page.locator('h1').innerText(),/little moment/);
  assert.deepEqual(errors,[]);await context.close();}

 await browser.close();console.log('redesign browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});

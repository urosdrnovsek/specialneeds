const {chromium}=require('playwright');const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const results=path.join(root,'test-results');fs.mkdirSync(results,{recursive:true});
(async()=>{const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),headless:true});const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://spot-match.test/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';if(!/^[a-z-]+\.(html|css|js)$/.test(name))return route.fulfill({status:404,body:''});const contentType=name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html';return route.fulfill({contentType,body:fs.readFileSync(path.join(root,'dist',name))});});
await page.goto('https://spot-match.test/',{waitUntil:'load'});await page.evaluate(()=>{localStorage.removeItem('spotmatch-learning-v1');learningProgress={};libraryHome()});assert.equal(await page.locator('[data-course]').count(),7);
let rounds=0;
for(const course of ['events','stories','meaning']){
 await page.locator(`[data-course="${course}"]`).click();assert.equal(await page.locator('[data-learning-game]').count(),20);
 for(let game=0;game<20;game++){
  await page.locator(`[data-learning-game="${game}"]`).click();await page.locator('#learningBegin').click();
  for(let round=0;round<3;round++){
   const s=await page.evaluate(()=>({mode:learningState.mode,answer:learningState.answer,selected:learningState.selected}));
   if(['order2','order3','order4'].includes(s.mode)){for(const id of s.answer){const i=await page.evaluate(id=>learningState.options.findIndex(o=>o.id===id),id);await page.locator(`[data-learning-choice="${i}"]`).click();}await page.locator('#learningCheck').click();}
   else if(s.mode==='repair'){if(s.selected[0]===1){await page.locator('[data-slot="0"]').click();await page.locator('[data-slot="1"]').click();}else{await page.locator('[data-slot="0"]').click();await page.locator('[data-slot="2"]').click();}await page.locator('#learningCheck').click();}
   else if(s.mode==='combine'){for(const id of s.answer){const i=await page.evaluate(id=>learningState.options.findIndex(o=>o.id===id),id);await page.locator(`[data-learning-choice="${i}"]`).click();}await page.locator('#learningCheck').click();}
   else{const i=await page.evaluate(()=>learningState.options.findIndex(o=>o.id===learningState.answer[0]));await page.locator(`[data-learning-choice="${i}"]`).click();}
   assert.equal(await page.evaluate(()=>learningState.answered),true,`${course} ${game} ${round}`);await page.locator('#learningNext').click();rounds++;
  }
  assert.match(await page.locator('.completion-stat').innerText(),/3/);await page.locator('#learningBack').click();
 }
 assert.match(await page.locator('.progress-label').innerText(),/20 of 20/);await page.locator('#toLibrary').click();console.log(`${course}: 20 games, 60 rounds passed`);
}
// Wrong answer, hint, retries, example dialog, reset, and separate storage.
await page.locator('[data-course="events"]').click();await page.locator('[data-learning-game="1"]').click();await page.locator('#learningBegin').click();let wrong=await page.evaluate(()=>learningState.options.findIndex(o=>o.id!==learningState.answer[0]));await page.locator(`[data-learning-choice="${wrong}"]`).click();assert.equal(await page.evaluate(()=>learningState.missed),true);await page.locator('#learningHint').click();assert.equal(await page.evaluate(()=>learningState.hints),1);await page.locator('#learningHint').click();assert.equal(await page.evaluate(()=>learningState.hints),1);await page.locator('#learningModel').click();await page.locator('dialog .close').last().click();await page.locator('#learningBack').click();await page.locator('#toLibrary').click();
await page.reload();assert.equal(await page.evaluate(()=>Object.keys(learningProgress.events).length),20);
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(results,'library-mobile.png'),fullPage:true});
for(const key of ['events','stories','meaning']){await page.locator(`[data-course="${key}"]`).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('[data-learning-game="19"]').click();await page.locator('#learningBegin').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(results,`${key}-mobile.png`),fullPage:true});await page.locator('#learningBack').click();await page.locator('#learningGuide').click();assert.equal(await page.locator('dialog.learning-guide').evaluate(e=>e.open),true);await page.locator('dialog.learning-guide .close').click();await page.locator('#toLibrary').click();}
assert.deepEqual(errors,[]);console.log(JSON.stringify({courses:3,games:60,rounds,mobile:390,errors},null,2));await browser.close();})().catch(e=>{console.error(e);process.exit(1)});

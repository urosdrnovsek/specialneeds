const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const results=path.join(root,'test-results');fs.mkdirSync(results,{recursive:true});
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Serve a controlled fixture through Playwright routing; no external server or live-site access.
 await page.route('https://spot-match.test/**',route=>{
  const name=new URL(route.request().url()).pathname.slice(1)||'index.html';
  if(!['index.html','style.css','app.js','interactive.js','learning-data.js','learning-art.js','learning.js','adult-data.js','adult-art.js','adult-games.js','friendly-art.js','friendly-ui.js','friendly.css','picture-library.js','vocabulary-variety.js','pathways.js','pathways-data.js','pathways.css','calm.js','calm-data.js','calm.css','focus.js','focus-data.js','focus.css','playroom.js','playroom-data.js','playroom-art.js','playroom.css','skill-library-data.js','skill-library.js','skill-library.css','touch-play.js','touch-play.css','play-adventures.js','course-drag.js','quick-play.js','quick-play.css'].includes(name))return route.fulfill({status:404,body:''});
  const types={'index.html':'text/html','style.css':'text/css','app.js':'application/javascript','interactive.js':'application/javascript','learning-data.js':'application/javascript','learning-art.js':'application/javascript','learning.js':'application/javascript','adult-data.js':'application/javascript','adult-art.js':'application/javascript','adult-games.js':'application/javascript','friendly-art.js':'application/javascript','friendly-ui.js':'application/javascript','friendly.css':'text/css','picture-library.js':'application/javascript','vocabulary-variety.js':'application/javascript','pathways.js':'application/javascript','pathways-data.js':'application/javascript','pathways.css':'text/css','calm.js':'application/javascript','calm-data.js':'application/javascript','calm.css':'text/css','focus.js':'application/javascript','focus-data.js':'application/javascript','focus.css':'text/css','playroom.js':'application/javascript','playroom-data.js':'application/javascript','playroom-art.js':'application/javascript','playroom.css':'text/css','skill-library-data.js':'application/javascript','skill-library.js':'application/javascript','skill-library.css':'text/css','touch-play.js':'application/javascript','touch-play.css':'text/css','play-adventures.js':'application/javascript','course-drag.js':'application/javascript','quick-play.js':'application/javascript','quick-play.css':'text/css'};
  return route.fulfill({status:200,contentType:types[name],body:fs.readFileSync(path.join(root,'dist',name))});
 });
 await page.goto('https://spot-match.test/?library=full&flow=manual',{waitUntil:'load'});
 await page.evaluate(()=>{localStorage.removeItem('spotmatch-v1');home();openLearningCourse('visual')});
 assert.equal(await page.locator('[data-game]').count(),25);
 for(let g=0;g<25;g++){
  await page.locator(`[data-game="${g}"]`).click();
  await page.locator('#begin').click();
  for(let r=0;r<5;r++){
   if(g<20){const i=await page.evaluate(()=>current.choices.findIndex(c=>c.match));await page.locator(`[data-choice="${i}"]`).click();await page.locator('#next').click();}
   if(g===20){for(let j=0;j<4;j++){const i=await page.evaluate(()=>current.homes.indexOf(current.tokens[current.position].shape));await page.locator(`[data-home="${i}"]`).click();}await page.locator('#interactive-next').click();}
   if(g===21){for(let p=0;p<3;p++){const ids=await page.evaluate(pair=>current.cards.map((c,i)=>c.pair===pair?i:-1).filter(i=>i>=0),p);for(const i of ids)await page.locator(`[data-pair="${i}"]`).click();}await page.locator('#interactive-next').click();}
   if(g===22){const t=await page.evaluate(()=>current.target);await page.locator(`[data-color="${t.color}"]`).click();await page.locator(`[data-dots="${t.dots}"]`).click();await page.locator('#check-work').click();await page.locator('#interactive-next').click();}
   if(g===23){let turns=await page.evaluate(()=>(current.target.dir-current.built.dir+4)%4);for(let t=0;t<turns;t++)await page.locator('[data-turn="1"]').click();await page.locator('#check-work').click();await page.locator('#interactive-next').click();}
   if(g===24){const i=await page.evaluate(()=>current.changed);await page.locator(`[data-changed="${i}"]`).click();await page.locator('#interactive-next').click();}
  }
  assert.match(await page.locator('.completion-stat').textContent(),/5/);
  await page.locator('#back').click();
 }
 assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('spotmatch-v1'))).length),25);
 await page.reload();await page.locator('[data-course="visual"]').click();assert.match(await page.locator('.progress-label').innerText(),/25 of 25/);
 await page.screenshot({path:path.join(results,'course-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'mobile home fits viewport');
 for(const g of [20,21,22,23,24]){await page.locator(`[data-game="${g}"]`).click();await page.locator('#begin').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,`mobile game ${g+1} fits viewport`);await page.locator('#interactive-hint').click();await page.locator('#back').click();}
 await page.screenshot({path:path.join(results,'course-mobile.png'),fullPage:true});
 await page.locator('#guideNav').click();assert.equal(await page.locator('#guide').evaluate(e=>e.open),true);await page.locator('#guide .close').click();
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({browser:await browser.version(),games:25,rounds:125,mobileWidth:390,progressPersistence:'passed',guide:'passed',pageErrors:errors},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

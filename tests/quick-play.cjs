const{chromium}=require('playwright');const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),headless:true});const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(30000);const errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.addInitScript(()=>localStorage.setItem('spotmatch-course-flow','manual'));await page.route('https://spot-match.test/**',r=>{const n=new URL(r.request().url()).pathname.slice(1)||'index.html';return r.fulfill({contentType:n.endsWith('.js')?'application/javascript':n.endsWith('.css')?'text/css':n.endsWith('.svg')?'image/svg+xml':n.endsWith('.json')?'application/json':'text/html',body:fs.readFileSync(path.join(root,'dist',n))});});await page.route(/https:\/\/(fonts\.googleapis|fonts\.gstatic)\.com\/.*/,r=>r.abort());await page.goto('https://spot-match.test/',{waitUntil:'domcontentloaded'});const cdp=await context.newCDPSession(page);
async function launch(course,index){await page.evaluate(([c,i])=>skillLaunch(c,i),[course,index]);await page.waitForTimeout(30);}
async function drag(source,target,{mouse=false,cancel=false,point}={}){const src=page.locator(source),dst=page.locator(target);await src.waitFor();await dst.waitFor({state:'attached'});await page.evaluate(([a,b])=>{const s=document.querySelector(a).getBoundingClientRect(),t=document.querySelector(b).getBoundingClientRect(),top=Math.min(s.top,t.top)+scrollY,bottom=Math.max(s.bottom,t.bottom)+scrollY;window.scrollTo(0,Math.max(0,Math.min(top-65,bottom-innerHeight+35)));},[source,target]);await page.waitForTimeout(35);const a=await src.boundingBox(),b=await dst.boundingBox(),start={x:a.x+a.width/2,y:a.y+a.height/2},end=point?{x:b.x+b.width*point.x,y:b.y+b.height*point.y}:{x:b.x+b.width/2,y:b.y+b.height/2};if(mouse){await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:12});if(cancel)await page.keyboard.press('Escape');await page.mouse.up();}else{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start.x,y:start.y,id:1}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/12,y:start.y+(end.y-start.y)*i/12,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});}await page.waitForTimeout(50);assert.equal(await page.locator('.tp-ghost').count(),0);assert.equal(await page.locator('.tp-lifted').count(),0);}

await page.clock.install();await page.clock.pauseAt(new Date());
let tested=0;
async function settle(){await page.clock.runFor(60);}
async function advance(){await page.clock.runFor(1500);}
for(const key of ['words','sentences','sounds'])for(let i=0;i<20;i++){
 await page.evaluate(([k,i])=>{activeLearningCourse=k;adultIntro(i);document.querySelector('#adultBegin').click();},[key,i]);await settle();
 const s=await page.evaluate(()=>({mode:adultState.mode,answer:adultState.answer,options:adultState.options}));
 if(s.mode==='counter')for(let n=0;n<s.answer[0];n++)await page.locator('#adultAdd').click();
 else for(const id of s.answer){await page.locator(`[data-adult-choice="${s.options.findIndex(o=>o.id===id)}"]`).click();}
 await settle();assert.equal(await page.evaluate(()=>adultState.answered),true,`adult ${key}/${i}`);assert.equal(await page.locator('#adultNext').isVisible(),false);await advance();assert.equal(await page.evaluate(()=>adultState.round),1);assert.equal(await page.locator('#adultAgain').count(),1,'one task must finish, not repeat');tested++;
}
for(const key of ['events','stories','meaning'])for(let i=0;i<20;i++){
 await page.evaluate(([k,i])=>{activeLearningCourse=k;learningIntro(i);document.querySelector('#learningBegin').click();},[key,i]);await settle();
 const s=await page.evaluate(()=>({mode:learningState.mode,answer:learningState.answer,options:learningState.options}));
 if(s.mode==='repair'){await page.locator('[data-slot="0"]').click();await page.locator('[data-slot="1"]').click();}
 else for(const id of s.answer)await page.locator(`[data-learning-choice="${s.options.findIndex(o=>o.id===id)}"]`).click();
 await settle();assert.equal(await page.evaluate(()=>learningState.answered),true,`learning ${key}/${i}`);assert.equal(await page.locator('#learningNext').isVisible(),false);await advance();assert.equal(await page.evaluate(()=>learningState.round),1);assert.equal(await page.locator('#learningAgain').count(),1);tested++;
}
for(const key of ['language','dyslexia','autism','development','speech','motor'])for(let i=0;i<10;i++){
 await page.evaluate(([k,i])=>{senActive=k;senIntro(i);document.querySelector('#senBegin').click();},[key,i]);await settle();const t=await page.evaluate(()=>senState.task);
 if(t.mode==='counter')for(let n=0;n<t.answer[0];n++)await page.locator('#senAdd').click();
 else if(t.mode==='book'){for(let n=1;n<t.pages.length;n++)await page.locator('#senPageNext').click();await page.locator('#senPageNext').click();await settle();assert.equal(await page.evaluate(()=>senState.round),1);assert.equal(await page.locator('#senAgain').count(),1);tested++;continue;}
 else if(t.mode==='activate'){await page.locator('#senActivate').click();await settle();await page.locator('#senCheck').click();}
 else if(t.mode==='compose'){for(let n=0;n<3;n++)await page.locator(`[data-compose="${n}:0"]`).click();await page.locator('#senCheck').click();}
 else{if(t.mode==='place')await page.locator('#senPick').click();const ids=t.mode==='explore'?[t.options[0].id]:t.answer;for(const id of ids)await page.locator(`[data-sen-choice="${t.options.findIndex(o=>o.id===id)}"]`).tap();}
 await settle();if(!['activate','compose','explore'].includes(t.mode))assert.equal(await page.evaluate(()=>senState.done),true,`sen ${key}/${i}`);await advance();if(['activate','compose','explore'].includes(t.mode))assert.match(await page.locator('h1').innerText(),/Lovely exploring/);else{assert.equal(await page.evaluate(()=>senState.round),1,`advance ${key}/${i}`);assert.equal(await page.locator('#senAgain').count(),1);}tested++;
}
for(let i=0;i<20;i++){
 await page.evaluate(i=>{focusIntro(i);document.querySelector('#focusThree').click();},i);await settle();const t=await page.evaluate(()=>focusState.task);
 if(t.mode==='plan'){for(let r=0;r<3;r++)await page.locator(`[data-focus-plan="${r}:0"]`).tap();await page.locator('#focusCheck').tap();}
 else{const ids=t.mode==='open'?[t.options[0].id]:t.answer;for(const id of ids)await page.locator(`[data-focus-choice="${id}"]`).tap();if(t.mode==='open'){await page.locator('#focusCheck').tap();if(await page.locator('.world-play').count()){assert.equal(await page.evaluate(()=>worldState.mode),'puzzle');tested++;continue;}}}
 await settle();if(!['open','plan'].includes(t.mode)){assert.equal(await page.evaluate(()=>focusState.done),true,`focus ${i}`);await advance();}assert.equal(await page.evaluate(()=>focusState.round),1);tested++;
}
// Original visual, sorting, pairs, constructing, turning, and spot-the-change engines.
for(let g=0;g<25;g++){
 await page.evaluate(g=>{intro(g);document.querySelector('#begin').click();},g);await settle();
 if(g<20){const i=await page.evaluate(()=>current.choices.findIndex(c=>c.match));await page.locator(`[data-choice="${i}"]`).tap();}
 else if(g===20){for(let n=0;n<4;n++){const i=await page.evaluate(()=>current.homes.indexOf(current.tokens[current.position].shape));await page.locator(`[data-home="${i}"]`).tap();}}
 else if(g===21){const pairs=await page.evaluate(()=>[0,1,2].map(p=>current.cards.flatMap((c,i)=>c.pair===p?[i]:[])));for(const pair of pairs)for(const i of pair)await page.locator(`[data-pair="${i}"]`).tap();}
 else if(g===22){const t=await page.evaluate(()=>current.target);await page.locator(`[data-color="${t.color}"]`).tap();await page.locator(`[data-dots="${t.dots}"]`).tap();}
 else if(g===23){while(await page.evaluate(()=>current.built.dir!==current.target.dir))await page.locator('[data-turn="1"]').tap();}
 else await page.locator(`[data-changed="${await page.evaluate(()=>current.changed)}"]`).tap();
 await settle();assert.equal(await page.evaluate(()=>answered),true,`visual ${g}`);await advance();assert.equal(await page.evaluate(()=>round),1);assert.equal(await page.locator('#again').count(),1);tested++;
}
// Open preferences keep the chosen picture on their completion screen.
await launch('communicate',0);await settle();await drag('[data-sen-choice="0"]','#senChoiceHome');assert.equal(await page.locator('.sen-choice-caption').innerText(),'Trains');await advance();assert.equal(await page.locator('#quickChosenTopic .sen-choice-caption').innerText(),'Trains');await advance();assert.equal(await page.locator('#quickChosenTopic').count(),1);
// Wrong answers remain retryable. Pausing prevents the transition.
await page.evaluate(()=>{senActive='language';senIntro(0);document.querySelector('#senBegin').click();});await settle();let t=await page.evaluate(()=>senState.task);let wrong=t.options.findIndex(o=>!t.answer.includes(o.id));await page.locator(`[data-sen-choice="${wrong}"]`).tap();await advance();assert.equal(await page.evaluate(()=>senState.round),0);assert.equal(await page.evaluate(()=>senState.retries),1);await page.locator('#quickPause').tap();await page.locator(`[data-sen-choice="${t.options.findIndex(o=>t.answer.includes(o.id))}"]`).tap();await advance();assert.equal(await page.evaluate(()=>senState.round),0);await page.locator('#senNext').tap();assert.equal(await page.evaluate(()=>senState.round),1);
// Calm Garden comparison games advance; breathing and movement stay self-paced.
await page.evaluate(()=>QuickPlay.resume());
for(const i of await page.evaluate(()=>calmActivities.flatMap((d,i)=>['find','match','clue','rule','path'].includes(d.mode)?[i]:[]))){
 await page.evaluate(i=>calmOpen(i),i);await settle();const mode=await page.evaluate(()=>calmActivities[calmState.index].mode);
 if(mode==='path'){for(let n=0;n<3;n++)await page.locator(`[data-calm-home="${n}"]`).tap();await settle();await advance();assert.equal(await page.locator('#calmAgain').count(),1);}
 else for(let r=0;r<1;r++){const n=await page.evaluate(()=>calmModel(calmState).answer);await page.locator(`[data-calm-choice="${n}"]`).tap();await settle();assert.equal(await page.evaluate(()=>calmState.found),true);assert.equal(await page.locator('#calmCheck').isVisible(),false);await advance();assert.equal(await page.locator('#calmAgain').count(),1);}
 tested++;
}
for(const i of await page.evaluate(()=>calmActivities.flatMap((d,i)=>['breath','pose','rest','hands'].includes(d.mode)?[i]:[]))){await page.evaluate(i=>calmOpen(i),i);await advance();assert.equal(await page.locator('#calmFinish').count(),1);}
// Structured play completes without an extra finish click; open play stays open.
await page.evaluate(()=>QuickPlay.resume());
for(const id of ['bridge','train','beads','map','traffic']){
 await page.evaluate(id=>prStart(id),id);await settle();
 if(id==='bridge'){await page.locator('#prTurn').tap();for(let i=0;i<3;i++)await page.locator(`[data-pr-plank="${i}"]`).tap();}
 if(id==='train'){await page.locator('[data-pr-carriage="0"]').tap();await page.locator('[data-pr-carriage="1"]').tap();}
 if(id==='beads')for(const c of [0,1,0,1,0,1])await page.locator(`[data-pr-bead="${c}"]`).tap();
 if(id==='map')for(const n of [4,0,1,2,3])await page.locator(`[data-pr-step="${n}"]`).tap();
 if(id==='traffic'){await page.locator('#prRoadGo').tap();await page.locator('#prRoadGo').tap();await page.locator('#prRoadWait').tap();await page.locator('#prRoadGo').tap();}
 await settle();await advance();assert.equal(await page.locator('#prReplay').count(),1,id);tested++;
}
for(const id of ['studio','puppet','clouds','stretch']){await page.evaluate(id=>prStart(id),id);await advance();assert.equal(await page.locator('.pr-board').count(),1,id);}
// Leaving during feedback must cancel the old activity's pending transition.
await launch('communicate',0);await settle();await page.locator('[data-sen-choice="0"]').tap();await page.evaluate(()=>skillHome());await advance();assert.equal(await page.locator('[data-support]').count(),8);
assert.deepEqual(errors,[]);console.log(JSON.stringify({automaticActivityTypes:tested,openPreference:'one choice, retained on completion',wrongAnswer:'retry without checking',pause:'waits for child',pageErrors:errors}));await browser.close();})().catch(e=>{console.error(e);process.exit(1)});

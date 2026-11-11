const {parseHTML}=require('linkedom'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const root=process.env.APP_DIST||path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),{window}=parseHTML(html),document=window.document;
const values=new Map(),location={pathname:'/',search:process.argv.includes('--manual')?'?flow=manual':'',hash:''};
const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
const history={replaceState(s,t,u){if(u){const n=new URL(u,'https://app.test');Object.assign(location,{pathname:n.pathname,search:n.search,hash:n.hash});}},pushState(s,t,u){this.replaceState(s,t,u)}};
window.Element.prototype.scrollIntoView=function(){};window.Element.prototype.focus=function(){};
let timerId=0;const timers=new Map(),micro=[];const sandbox={document,console,localStorage:storage,location,history,URL,URLSearchParams,Map,Set,Blob,TextEncoder,structuredClone,performance,window:null,navigator:{},MutationObserver:class{observe(){} disconnect(){}},setTimeout:(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:()=>++timerId,cancelAnimationFrame(){},queueMicrotask:fn=>micro.push(fn),matchMedia:()=>({matches:true,addEventListener(){}}),addEventListener(){},scrollTo(){},getComputedStyle:()=>({})};sandbox.window=sandbox;sandbox.globalThis=sandbox;const c=vm.createContext(sandbox);
for(const tag of document.querySelectorAll('script[src]')){const file=tag.getAttribute('src').split('?')[0];try{vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});}catch(e){console.error(file+': '+e.message);throw e;}}
const run=s=>vm.runInContext(s,c);run('skillHome()');

function flush(){let n=0;while(micro.length){micro.shift()();if(++n>500)throw Error('Microtask loop');}}
function advance(){const id=run('readingTimer');if(id===null&&document.querySelector('#readingContinue')){click('#readingContinue');return;}assert(id!==null,'Reading transition should be scheduled');const t=timers.get(id);assert(t,'Scheduled transition should exist');timers.delete(id);t.fn();flush();}
function click(selector){const el=document.querySelector(selector);assert(el,'Missing '+selector);assert(!el.disabled,'Disabled '+selector);el.onclick?el.onclick({preventDefault(){}}):el.dispatchEvent(new window.Event('click'));flush();}
function launch(course,index){run(`skillLaunch('${course}',${index})`);flush();assert(document.querySelector('.reading-play'));assert(document.querySelector('#coursePurpose'));}
function state(){return run('readingState');}
// Exercise actual retained drag descriptors, including after complete re-renders.
run('const adventureBindings=new WeakMap();const adventureBind=TouchPlay.bind;TouchPlay.bind=(el,d)=>{adventureBindings.set(el,d);adventureBind(el,d);};');
function drop(source,target){assert(document.querySelector(source),source);assert(document.querySelector(target),target);run(`adventureBindings.get(app.querySelector(${JSON.stringify(source)})).drop(app.querySelector(${JSON.stringify(target)}))`);flush();}
let deliveries=0,mysteries=0,shows=0;
for(const access of ['tap','drag']){
 launch('letter-lookalikes',0);
 for(let round=0;round<3;round++){
  const cargo=run('readingDeliveryMissions[readingState.round].cargo');assert.equal(state().mission.delivered.length,0);assert.equal(state().word,null);
  // Free exploration changes the world, but never marks the learning task complete.
  click('#raTownDuck');assert.equal(state().mission.gag,true);assert(document.querySelector('.ra-duck-bubble'));assert.equal(state().done,false);
  click('[data-ra-door="b"]');assert.equal(state().mission.loaded,null);
  for(const i of [2,0,1]){
   const address=cargo[i][0],wrong=address==='b'?'d':'b';
   if(access==='drag')drop(`[data-ra-parcel="${i}"]`,'#raVan');else click(`[data-ra-parcel="${i}"]`);
   assert.equal(state().mission.loaded,i);assert.equal(document.querySelector(`[data-ra-parcel="${i}"]`).getAttribute('aria-pressed'),'true');
   if(access==='drag')drop('#raVan',`[data-ra-door="${wrong}"]`);else click(`[data-ra-door="${wrong}"]`);
   assert.equal(state().mission.loaded,i);const count=state().mission.delivered.length;assert.equal(state().done,false);
   // A colour change must preserve cargo, route, all deliveries and current round.
   const toggle=document.querySelector('#readingColourToggle');toggle.checked=!toggle.checked;toggle.onchange();flush();assert.equal(state().mission.loaded,i);assert.equal(state().mission.delivered.length,count);
   if(access==='drag')drop('#raVan',`[data-ra-door="${address}"]`);else click(`[data-ra-door="${address}"]`);
   assert.equal(state().mission.delivered.length,count+1);assert.equal(state().mission.loaded,null);deliveries++;
   // Stale delivery handlers cannot duplicate cargo or move a finished mission.
   run(`readingDeliveryDoor('${address}',${i})`);flush();assert.equal(state().mission.delivered.length,count+1);
  }
  assert(state().done);assert.equal(document.querySelectorAll('.ra-gift').length,3);assert.equal(state().observations.at(-1).response,'delivery-mission');advance();
 }
 if(document.querySelector('#readingNextActivity'))click('#readingNextActivity');
 assert.equal(state().id,'tail-detectives');
 for(let round=0;round<3;round++){
  const clues=run('readingMysteryClues[readingState.round]'),correct=run("readingMysteries[readingState.round].letter==='p'?'left':'right'");
  assert.equal(state().mystery.found.length,0);run(`readingMysteryStem('${correct}')`);assert.equal(state().done,false);
  const nonclue=['tree','tent','pond','rock'].find(p=>!clues[p]);click(`[data-ra-search="${nonclue}"]`);assert.equal(state().mystery.found.length,0);
  for(const place of Object.keys(clues).reverse()){
   if(access==='drag')drop('#raMagnifier',`[data-ra-search="${place}"]`);else click(`[data-ra-search="${place}"]`);
   const n=state().mystery.found.length;click(`[data-ra-search="${place}"]`);assert.equal(state().mystery.found.length,n);
  }
  assert.equal(state().mystery.found.length,2);const wrong=correct==='left'?'right':'left';
  if(access==='drag')drop('[data-ra-clue="stem"]',`[data-ra-stem="${wrong}"]`);else click(`[data-ra-stem="${wrong}"]`);
  assert.equal(state().done,false);assert.equal(state().mystery.stem,wrong);assert(document.querySelector('.ra-fixed-bowl path'));assert.equal(state().mystery.found.length,2);
  if(access==='drag')drop('[data-ra-clue="stem"]',`[data-ra-stem="${correct}"]`);else click(`[data-ra-stem="${correct}"]`);
  assert(state().done);assert.equal(state().observations.at(-1).response,'reconstructed-clue');assert(document.querySelector('.ra-reveal-object'));mysteries++;advance();
 }
 if(document.querySelector('#readingNextActivity'))click('#readingNextActivity');
 assert.equal(state().id,'plain-letter-post');
 for(let round=0;round<3;round++){
  const target=run('readingPuppetScripts[readingState.round]');click('[data-ra-actor="duck"]');assert.equal(state().show.actor,'duck');assert.equal(state().done,false);assert(document.querySelector('#readingColourToggle').disabled);
  // Wrong programs stay editable and animate the action actually selected.
  for(let i=0;i<target.length;i++)click('[data-ra-command="b"]');assert.equal(state().done,false);assert.match(document.querySelector('.ra-stage-action').textContent,/bounce/);
  // Undo and overwrite are both available. Free actor choice keeps the script intact.
  click('[data-ra-show-slot="0"]');assert.equal(state().show.slots[0],null);click('[data-ra-actor="bear"]');assert.equal(state().show.slots[0],null);
  for(let i=0;i<target.length;i++)click(`[data-ra-show-slot="${i}"]`);
  if(access==='drag'&&round===0){
   drop('[data-ra-command="d"]','[data-ra-show-slot="0"]');drop('[data-ra-command="b"]','[data-ra-show-slot="1"]');assert.equal(state().done,false);
   drop('[data-ra-show-slot="1"]','[data-ra-show-slot="0"]');
  }else for(let i=0;i<target.length;i++){if(access==='drag')drop(`[data-ra-command="${target[i]}"]`,`[data-ra-show-slot="${i}"]`);else click(`[data-ra-command="${target[i]}"]`);}
  assert(state().done);assert.equal(state().observations.at(-1).response,'programmed-show');assert.equal(state().observations.at(-1).colourCues,false);assert.equal(document.querySelectorAll('.ra-mini-stage').length,target.length);shows++;advance();
 }
 if(document.querySelector('#readingNextActivity'))click('#readingNextActivity');
 assert(document.querySelector(process.argv.includes('--manual')?'.reading-complete':'.course-finished'));
}
// Pause/stop prevent every kind of game action, including saved drag callbacks.
for(let index=0;index<3;index++){
 launch('letter-lookalikes',index);const mode=run('readingGame(readingState.id).mode');run('CourseFlow.setPaused(true)');flush();const before=JSON.stringify(run('readingState'));
 run("readingDeliveryLoad(0);readingDeliveryDoor('b');readingMysterySearch('tree');readingMysteryStem('left');readingPuppetPlace('b');");flush();assert.equal(JSON.stringify(state()),before,mode+' changed while paused');
 run('CourseFlow.setPaused(false)');flush();assert.equal(state().done,false);run('CourseFlow.stop()');flush();const after=JSON.stringify(state());run("readingDeliveryLoad(0);readingMysterySearch('tree');readingPuppetPlace('b');");assert.equal(JSON.stringify(state()),after);
}
// Detached drag callbacks from an earlier mission cannot act on a later round.
launch('letter-lookalikes',0);run("const staleParcelDrop=adventureBindings.get(app.querySelector('[data-ra-parcel=\"0\"]')).drop");run("readingState.round=1;readingPrepare();readingRender();staleParcelDrop(app.querySelector('[data-ra-door=\"b\"]'));");assert.equal(state().mission.loaded,null);assert.equal(state().mission.delivered.length,0);
// Direct parcel-to-door drops and explicit reset cannot leak progress into the next mission.
launch('letter-lookalikes',0);drop('[data-ra-parcel="0"]','[data-ra-door="b"]');assert.equal(state().mission.delivered.length,1);click('#readingReset');assert.equal(state().mission.delivered.length,0);assert.equal(state().mission.loaded,null);
launch('letter-lookalikes',1);click('[data-ra-search="tree"]');click('#readingReset');assert.equal(state().mystery.found.length,0);
launch('letter-lookalikes',2);click('[data-ra-command="d"]');click('#readingReset');assert(state().show.slots.every(v=>v===null));
// Every vocabulary prop uses the existing, locally available illustration library.
run('for(const m of readingDeliveryMissions)for(const [,id]of m.cargo)if(!vocabularyObjects.has(id))throw Error(id);for(const m of readingMysteries)if(!vocabularyObjects.has(m.object))throw Error(m.object);');
console.log(JSON.stringify({tapAndDragPaths:true,deliveries,mysteries,shows,nonlinearExploration:true,editablePrograms:true,wrongMovesKeepProgress:true,dragStateSurvivesRenders:true,pauseAndStopGuardAllActions:true,resets:true,automaticCourseProgress:true,domOnly:true,physicalTouchAndLayout:'unverified'}));

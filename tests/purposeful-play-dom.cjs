const {parseHTML}=require('linkedom'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const root=process.env.APP_DIST||path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),{window}=parseHTML(html),document=window.document;
const values=new Map(),location={pathname:'/',search:process.argv.includes('--manual')?'?flow=manual':'',hash:process.argv.includes('--startup')?'#activity/controls/0':''};
const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
const history={replaceState(s,t,u){if(u){const n=new URL(u,'https://app.test');Object.assign(location,{pathname:n.pathname,search:n.search,hash:n.hash});}},pushState(s,t,u){this.replaceState(s,t,u)}};
window.Element.prototype.scrollIntoView=function(){};window.Element.prototype.focus=function(){};
let timerId=0;const timers=new Map(),micro=[];const sandbox={document,console,localStorage:storage,location,history,URL,URLSearchParams,Map,Set,Blob,TextEncoder,structuredClone,performance,window:null,navigator:{},MutationObserver:class{observe(){} disconnect(){}},setTimeout:(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:()=>++timerId,cancelAnimationFrame(){},queueMicrotask:fn=>micro.push(fn),matchMedia:()=>({matches:true,addEventListener(){}}),addEventListener(){},scrollTo(){},getComputedStyle:()=>({})};sandbox.window=sandbox;sandbox.globalThis=sandbox;const c=vm.createContext(sandbox);
for(const tag of document.querySelectorAll('script[src]')){const file=tag.getAttribute('src').split('?')[0];try{vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});}catch(e){console.error(file+': '+e.message);throw e;}}
const run=s=>vm.runInContext(s,c);if(!process.argv.includes('--startup'))run('skillHome()');

function flush(){let n=0;while(micro.length){micro.shift()();if(++n>500)throw Error('Microtask loop');}}
function advance(){const id=run('readingTimer');if(id===null&&document.querySelector('#readingContinue')){click('#readingContinue');return;}assert(id!==null,'Reading transition should be scheduled');const t=timers.get(id);assert(t,'Scheduled transition should exist');timers.delete(id);t.fn();flush();}
function click(selector){const el=document.querySelector(selector);assert(el,'Missing '+selector);assert(!el.disabled,'Disabled '+selector);el.onclick?el.onclick({preventDefault(){}}):el.dispatchEvent(new window.Event('click'));flush();}
function launch(course,index){run(`skillLaunch('${course}',${index})`);flush();assert(document.querySelector('.reading-play'));assert(document.querySelector('#coursePurpose'));}
function state(){return run('readingState');}

if(process.argv.includes('--startup')){assert(document.querySelector('.purposeful-play'));assert.equal(run('senState.play.id'),'canal');console.log('Replacement deep-link startup passed.');process.exit(0);}
run('const missionBindings=new WeakMap();const oldMissionBind=TouchPlay.bind;TouchPlay.bind=(el,d)=>{missionBindings.set(el,d);oldMissionBind(el,d);};');
function launchSupport(key,index){const pair=run(`(()=>{for(const skill of learningSkills)for(const c of skill.courses){const i=c.activities.findIndex(a=>a.engine==='support'&&a.key==='${key}'&&a.index===${index});if(i>=0)return[c.id,i];}return null;})()`);if(pair)run(`skillLaunch('${pair[0]}',${pair[1]})`);else run(`skillContext=null;senActive='${key}';senIntro(${index});document.querySelector('#senBegin').click();`);flush();assert(document.querySelector('.purposeful-play'));return pair;}
function drop(a,b){assert(document.querySelector(a));assert(document.querySelector(b));run(`missionBindings.get(app.querySelector(${JSON.stringify(a)})).drop(app.querySelector(${JSON.stringify(b)}))`);flush();}
function end(){const id=run('(()=>null)()');for(const [i,t]of [...timers])if(t.ms===1600){timers.delete(i);t.fn();flush();return;}if(document.querySelector('#ppContinue'))click('#ppContinue');else throw Error('No completion transition');}
// Retired modes and labels are prohibited, including legacy entry points.
const retired=['Make Something Happen','Meet a New Word','My Favourite Adventure','Choose Our Activity','Show Me Your Choice','Describe Without Saying','Choose Your Adventure','Comfortable Controls','Direct the Adventure'];
const audit=run(`Object.values(supportPathways).flatMap(p=>p.games)`);assert.equal(audit.filter(g=>g.kind==='mission').length,9);for(const g of audit){assert(!['activate','theme','access','explore','adventure'].includes(g.kind));assert(!retired.includes(g.title));}assert(!fs.readFileSync(path.join(root,'pathways.js'),'utf8').includes('Discover again'));

function moveCanal(object,target,method='tap'){if(method==='drag')drop(`[data-pp-canal="${object}"]`,`[data-pp-canal="${target}"]`);else{click(`[data-pp-canal="${object}"]`);click(`[data-pp-canal="${target}"]`);}}
function moveTrip(object,target,method='tap'){const destination=document.querySelector(`[data-pp-trip-place="${target}"]`)?`[data-pp-trip-place="${target}"]`:`[data-pp-trip-object="${target}"]`;if(method==='drag')drop(`[data-pp-trip-object="${object}"]`,destination);else{click(`[data-pp-trip-object="${object}"]`);click(destination);}}
function pump(method){if(method==='drag')drop('[data-pp-canal="pump"]','[data-pp-water="up"]');else click('[data-pp-canal="pump"]');}
function solveCanal(method='tap'){
 for(const object of (method==='drag'?['duck','parcel']:['parcel','duck']))moveCanal(object,'boat',method);assert.equal(run('senState.play.canal.duck'),'boat');assert.equal(run('senState.play.canal.parcel'),'boat');
 pump(method);click('[data-pp-canal="gate"]');assert.equal(run('senState.play.canal.gate'),false,'Gate must not open before water is level');pump(method);
 if(method==='drag')drop('[data-pp-canal="gate"]','[data-pp-gate-position="open"]');else click('[data-pp-canal="gate"]');
 moveCanal('boat','dock',method);assert.equal(run('senState.play.canal.boat'),'dock');assert.equal(run('senState.play.canal.duck'),'boat','Sailing must not automatically unload Duck');assert.equal(run('senState.done'),false);
 const order=method==='drag'?['parcel','duck']:['duck','parcel'];moveCanal(order[0],'dock',method);assert.equal(run('senState.done'),false,'Unloading one object must not unload the other');moveCanal(order[1],'dock',method);assert.equal(run('senState.done'),true);
}
for(const method of ['tap','drag']){
 const pair=launchSupport('motor',0);assert(!document.querySelector('#ppAction'));assert(document.querySelector('[data-pp-canal="duck"] svg'));assert.equal(run('senState.play.canal.duck'),'bank');assert.equal(run('senState.play.canal.parcel'),'bank');
 // Pumping and opening the gate alone cannot resolve the rescue.
 pump(method);pump(method);click('[data-pp-canal="gate"]');assert.equal(run('senState.done'),false);assert.equal(run('senState.play.canal.duck'),'bank');moveCanal('boat','dock',method);assert.equal(run('senState.play.canal.boat'),'lock');click('[data-pp-canal="gate"]');click('[data-pp-water="down"]');click('[data-pp-water="down"]');
 moveCanal('duck','dock',method);assert.equal(run('senState.play.canal.duck'),'bank','Duck cannot teleport across the canal');
 const old=document.querySelector('[data-pp-canal="duck"]');click('[data-pp-canal="duck"]');old.onclick();flush();assert.equal(run('senState.play.canal.duck'),'bank');
 run('CourseFlow.setPaused(true)');flush();const paused=run('JSON.stringify(senState.play.canal)');pump(method);moveCanal('duck','boat',method);assert.equal(run('JSON.stringify(senState.play.canal)'),paused);run('CourseFlow.setPaused(false)');flush();
 solveCanal(method);end();assert.equal(run(`skillNotes['${pair[0]}'].activities[${pair[1]}]`),true);if(process.argv.includes('--manual')){run('skillDecorate()');flush();click('#skillNextActivity');}assert.equal(run('skillContext.index'),pair[1]+1);
 launchSupport('speech',2);const initial=run('senState.play.paint');click('[data-pp-tool="paint"]');assert.equal(run('senState.play.paint'),initial,'Choosing paint must not paint the bus automatically');if(method==='drag')drop('[data-pp-tool="paint"]','.pp-paint-body');else click('.pp-paint-body');assert.notEqual(run('senState.play.paint'),initial);
 if(method==='drag')drop('[data-pp-tool="sponge"]','[data-pp-part="wheel0"]');else{click('[data-pp-tool="sponge"]');click('[data-pp-part="wheel0"]');}assert.equal(run('senState.play.wheels[0]'),false);click('[data-pp-tool="horn"]');assert.equal(run('senState.play.horn'),true);
 for(const part of ['wheel0','wheel1','window']){const tool=part==='window'?'sponge':'wheel';if(method==='drag')drop(`[data-pp-tool="${tool}"]`,`[data-pp-part="${part}"]`);else{click(`[data-pp-tool="${tool}"]`);click(`[data-pp-part="${part}"]`);}}
 assert.equal(run('senState.done'),true);end();
 launchSupport('motor',2);if(method==='drag')drop('#ppBall','#ppEntrance');else click('#ppTest');assert.equal(run('senState.done'),false);
 if(method==='drag'){drop('[data-pp-pipe="1"]','[data-pp-pipe="4"]');assert.equal(run('senState.play.pipes.find(v=>v.cell===1).r'),2);assert.equal(run('senState.done'),false);}else for(const cell of [1,1,4,4])click(`[data-pp-pipe="${cell}"]`);
 click('[data-pp-pipe="5"]');assert.equal(run('senState.done'),true);assert(run('Purposeful.trace(senState.play).ok'));end();
 const scenes=[];for(const destination of ['beach','forest','moon']){
  launchSupport('motor',1);click(`[data-pp-trip="${destination}"]`);assert(!document.querySelector('#ppAction'));scenes.push(document.querySelector('.pp-game svg').outerHTML);
  // Duck remains a real interactive scene object during every story.
  click('[data-pp-trip-object="friend"]');assert.equal(run('senState.play.wave'),true);run("app.querySelector('#ppTripBoard').getBoundingClientRect=()=>({left:0,width:700});missionBindings.get(app.querySelector('[data-pp-trip-object=\"friend\"]')).drop(app.querySelector('#ppWalkZone'),{x:600,y:300});");flush();assert.equal(run('senState.play.friendX'),550);
  if(destination==='beach'){moveTrip('bucket','sand',method);assert.equal(run('senState.play.step'),1);moveTrip('flag','castle',method);}
  if(destination==='forest'){moveTrip('water','soil',method);assert.equal(run('senState.play.step'),0);moveTrip('seed','soil',method);assert.equal(run('senState.play.step'),1);moveTrip('water','soil',method);}
  if(destination==='moon'){moveTrip(method==='drag'?'teddy':'rocket',method==='drag'?'rocket':'teddy',method);assert.equal(run('senState.play.step'),1);moveTrip('rocket','pad',method);}
  assert.equal(run('senState.done'),true);end();
 }assert.equal(new Set(scenes).size,3);
}
// Reversing a crossing must not strand a passenger or teleport them between banks.
launchSupport('motor',0);moveCanal('duck','boat');moveCanal('parcel','boat');pump();pump();click('[data-pp-canal="gate"]');moveCanal('boat','dock');moveCanal('duck','dock');moveCanal('boat','bank');click('[data-pp-canal="gate"]');click('[data-pp-water="down"]');click('[data-pp-water="down"]');moveCanal('duck','boat');assert.equal(run('senState.play.canal.duck'),'dock');pump();pump();click('[data-pp-canal="gate"]');moveCanal('boat','dock');moveCanal('parcel','dock');assert.equal(run('senState.done'),true);
// Stop cancels pending progress. The next game cannot accept stale drag callbacks.
launchSupport('motor',0);run("const oldDuckDrop=missionBindings.get(app.querySelector('[data-pp-canal=\"duck\"]')).drop");solveCanal();run('CourseFlow.stop()');flush();for(const [i,t]of [...timers])if(t.ms===1600){timers.delete(i);t.fn();flush();}assert.equal(run('skillContext.index'),null);assert(document.querySelector('#skillBegin'));
launchSupport('motor',0);run("oldDuckDrop(app.querySelector('[data-pp-canal=\"boat\"]'))");assert.equal(run('senState.play.canal.duck'),'bank');
// Every legacy activity link opens its replacement, without retired or scripted controls.
for(const key of ['language','autism','development','speech','motor'])for(let i=0;i<10;i++)if(run(`supportPathways['${key}'].games[${i}].kind==='mission'`)){const pair=launchSupport(key,i);if(pair)assert(document.querySelector('#coursePurpose'));assert(!document.querySelector('#senActivate'));assert(!document.querySelector('#senCheck'));assert(!document.querySelector('#ppAction'));}
// A one-time migration only invalidates the nine retired completions.
run(`localStorage.removeItem('spotmatch-direct-objects-v1');senProgress.motor={0:{complete:true},3:{complete:true}};const c=learningSkills.flatMap(s=>s.courses).find(c=>c.activities.some(a=>a.engine==='support'&&a.key==='motor'&&a.index===0));const i=c.activities.findIndex(a=>a.engine==='support'&&a.key==='motor'&&a.index===0);skillNotes[c.id]={activities:{[i]:true,99:true}};Purposeful.migrate();if(senProgress.motor[0]||!senProgress.motor[3].complete||skillNotes[c.id].activities[i]||!skillNotes[c.id].activities[99])throw Error('Migration scope');`);
console.log(JSON.stringify({retiredActivities:9,distinctGameSystems:4,branchStories:3,tapAndDragActions:true,wrongMovesRetainWork:true,scenesChange:true,staleButtonsGuarded:true,sceneObjectsMove:true,noAutomaticBoardingOrUnloading:true,gateAndWaterDoNotSolveRescue:true,returnTripsRemainSolvable:true,editablePipePlacement:true,pauseAndStop:true,courseProgress:true,legacyLinksReplaced:true,scopedProgressMigration:true,domOnly:true}));

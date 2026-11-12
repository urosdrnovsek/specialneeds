'use strict';
// Course completion is a transition, not a second menu of games and courses.
const CourseFlow=(()=>{
 let paused=false,transitioning=false,keyboard=false,queued=false;let stepPreference=false;try{stepPreference=localStorage.getItem('spotmatch-course-flow')==='manual';}catch{}
 const q=sel=>app.querySelector(sel),key=()=>skillContext&&skillContext.index!==null?skillContext.courseId+':'+skillContext.index:null;
 function enabled(){return !stepPreference&&!QuickPlay.manual;}
 function context(){if(!skillContext||skillContext.index===null)return null;const info=skillCourseGet(skillContext.courseId);return{...info,courseId:skillContext.courseId,index:skillContext.index,activity:info.course.activities[skillContext.index]};}
 function matches(name,c){if(!c)return false;const a=c.activity;
  if(name==='readingFinish')return a.engine==='reading'&&readingState?.id===a.key&&readingState?.courseId===c.courseId;
  if(name==='finish')return a.engine==='original'&&a.key==='visual'&&game===a.index;
  if(name==='adultFinish')return a.engine==='original'&&activeLearningCourse===a.key&&adultState?.index===a.index;
  if(name==='learningFinish')return a.engine==='original'&&activeLearningCourse===a.key&&learningState?.index===a.index;
  if(name==='senFinish')return a.engine==='support'&&senState?.key===a.key&&senState?.index===a.index;
  if(name==='focusFinish')return a.engine==='focus'&&focusState?.index===a.index;
  if(name==='calmFinish')return a.engine==='calm'&&calmState?.index===a.index;
  if(name==='prFinish')return a.engine==='playroom'&&prState?.id===a.key;
  if(name==='worldFinish')return a.engine==='world'&&worldState?.index===a.index||a.engine==='focus'&&focusGames[a.index]?.theme==='help'&&focusState?.index===a.index&&worldState?.help!==null;
  if(name==='vocabularyFinish')return a.engine==='vocabulary'&&vocabularyState?.category===a.category&&vocabularyState?.mode===a.mode;
  return false;
 }
 function explanation(a){if(a.engine==='reading')return readingGame(a.key).why;if(a.engine==='original'){if(a.key==='visual')return courses[a.index][1]+' Keeping the model visible helps the child compare the whole picture, without having to remember it.';const d=newCourseInfo[a.key].games[a.index];return d.skill||d.explanation||skillCourseGet(skillContext.courseId).course.goal;}
  if(a.engine==='support')return supportPathways[a.key].games[a.index].skill;
  if(a.engine==='focus'){const d=focusGames[a.index];return d.skill+(d.theme==='help'&&q('.world-play')?' Now we are trying the chosen support in a real picture puzzle.':'');}
  if(a.engine==='calm')return calmActivities[a.index].skill+' Joining in, watching, or choosing a pause are all welcome.';
  if(a.engine==='playroom')return playroomGames.find(g=>g.id===a.key).skill;
  if(a.engine==='world'){const goals={sequence:'Putting visible events in order helps the child connect what happened first, next, and last.',puzzle:'Building a whole picture from its parts practises looking at position, shape, and meaningful details.',pack:'Using a picture list gives the child an external reminder while choosing useful objects.',compare:'Comparing a whole scene encourages attention to the action as well as one striking detail.',director:'Choosing a character and sharing a story gives the child a meaningful way to communicate ideas.'};return goals[worldModes[a.index%worldModes.length]];}
  const goals={explore:'Naming a clear picture together connects an everyday word with something the child can recognise. Try the real object too.',find:'Choosing a named picture practises connecting the word or sign with its meaning. An adult models the word first.',collect:'Collecting pictures from a visible list practises word meanings and following a small plan without relying on memory.',pairs:'Pairing familiar objects gives repeated opportunities to name and compare them, with all pictures visible.',sort:'Making two collections helps explore how familiar objects are related. Name and model the groups together.'};return goals[a.mode];
 }
 function stop(){const c=context();if(!c)return;setPaused(false);if(q('.reading-play'))readingCancel();skillCourse(c.courseId);}
 function setPaused(value){paused=value;if(q('.purposeful-play'))Purposeful.pause(value);if(q('.reading-play'))readingPause(value);if(paused)QuickPlay.pause();else QuickPlay.resume();if(q('.world-play')&&worldState){worldState.paused=paused;if(worldState.finished&&!paused){worldFinish();return;}worldRender();}if(q('.vocabulary-play')&&vocabularyState){vocabularyState.paused=paused;if(vocabularyState.done&&!paused){vocabularyFinish();return;}vocabularyRender();}refresh();}
 function adoptStandalone(name){if(context()||!enabled()||skillFreePlay)return;for(const skill of learningSkills){const course=skill.courses.find(course=>course.activities.some(a=>matches(name,{activity:a})));if(course){const index=course.activities.findIndex(a=>matches(name,{activity:a}));skillContext={skillId:skill.id,courseId:course.id,index};prLibraryMode=false;prDirectLegacy=true;skillDecorate();skillWriteRoute('activity',course.id,index);return;}}}
 function decorate(){queued=false;if(!context()){if(q('[data-choice],#interactive-next'))adoptStandalone('finish');else if(q('[data-adult-choice],#adultAdd'))adoptStandalone('adultFinish');else if(q('[data-learning-choice]'))adoptStandalone('learningFinish');}const c=context();if(!c||q('.course-finished')){document.body.classList.remove('course-streaming');return;}const active=!!q('.game-wrap,.pr-play');if(!active)return;document.body.classList.toggle('course-streaming',enabled());let bar=q('#courseFlowBar');const signature=c.courseId+':'+c.index+':'+paused;
  if(enabled()&&!bar){bar=document.createElement('div');bar.id='courseFlowBar';bar.className='course-flow-bar';app.prepend(bar);}
  if(bar&&bar.dataset.step!==signature){bar.dataset.step=signature;bar.innerHTML=`<div><span>${senEscape(c.course.title)}</span><b>Activity ${c.index+1} of ${c.course.activities.length}</b></div><div class="course-flow-actions"><button class="secondary" id="coursePause">${paused?'Resume':'Pause'}</button><button class="back" id="courseStop">Finish for now</button></div>`;bar.querySelector('#coursePause').onclick=()=>setPaused(!paused);bar.querySelector('#courseStop').onclick=stop;}
  let purpose=q('#coursePurpose');if(!purpose){purpose=document.createElement('section');purpose.id='coursePurpose';purpose.className='course-purpose';const anchor=q('.game-wrap,.pr-play')||app.lastElementChild;anchor.after(purpose);}
  const why=explanation(c.activity)||c.course.goal,contents=`<span>Why we’re playing</span><p>${senEscape(why)}</p><small>Course goal: ${senEscape(c.course.goal)}</small>`;if(purpose.innerHTML!==contents)purpose.innerHTML=contents;
  if(enabled()){const nextLabel=sel=>{const el=q(sel);if(el&&el.textContent!=='Next activity →')el.textContent='Next activity →';};
   if(q('.world-play')){if(worldState)worldState.paused=paused;nextLabel('#worldFinishStory');const stop=q('#worldStop');if(stop)stop.onclick=()=>CourseFlow.stop();}
   if(q('.vocabulary-play')){if(vocabularyState)vocabularyState.paused=paused;if(vocabularyState?.mode==='explore'||vocabularyState?.done)nextLabel('#vocabGameDone');}
   if(q('.calm-play'))nextLabel('#calmFinish');if(q('.pr-play'))nextLabel('#prDone');
  }
 }
 function end(c){app.innerHTML=`<section class="game-wrap course-finished"><div class="course-finished-art">${worldCover(c.skill.id)}</div><span class="eyebrow">A GOOD PLACE TO PAUSE</span><h1>Well done! We’ve reached the last activity.</h1><p>${senEscape(c.course.title)}</p><p>You can finish here and try one idea together in everyday life.</p><div class="course-end-idea"><b>Something to try together</b><p>${senEscape(c.course.home)}</p></div><button class="primary" id="courseFinishedHome">Choose a skill for next time →</button></section>`;skillNav();document.getElementById('courseFinishedHome').onclick=skillHome;document.body.classList.remove('course-streaming');window.scrollTo(0,0);}
 function afterCompletion(name,original,args){let c=context();
  // A standalone original exercise can join its existing guided course.
  if(!c&&enabled()&&!skillFreePlay&&['finish','adultFinish','learningFinish'].includes(name)){for(const skill of learningSkills){const course=skill.courses.find(course=>course.activities.some((a,index)=>matches(name,{activity:a,index})));if(course){const index=course.activities.findIndex(a=>matches(name,{activity:a}));skillContext={skillId:skill.id,courseId:course.id,index};c=context();prLibraryMode=false;prDirectLegacy=true;break;}}}
  const advance=enabled()&&matches(name,c),before=key();const result=original(...args);if(!advance)return result;skillDecorate();queueMicrotask(()=>{if(key()!==before)return;if(c.index+1>=c.course.activities.length){end(c);return;}transitioning=true;try{skillLaunch(c.courseId,c.index+1);}finally{transitioning=false;}if(keyboard){const heading=q('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}});return result;
 }
 const priorLaunch=skillLaunch;skillLaunch=function(id,index){const from=context();if(!transitioning&&(!from||from.courseId!==id||q('#skillBegin'))&&paused){paused=false;QuickPlay.resume();}const result=priorLaunch(id,index);try{localStorage.setItem('spotmatch-last-course-v1',JSON.stringify({courseId:id,index}));}catch{}refresh();return result;};
 const priorRoute=skillWriteRoute;skillWriteRoute=function(type,id,index){if(transitioning&&type==='activity'&&!skillRestoringRoute){history.replaceState({skillRoute:'#activity/'+id+'/'+index},'',location.pathname+'#activity/'+id+'/'+index);return;}return priorRoute(type,id,index);};
 function wrap(name,fn){return function(...args){return afterCompletion(name,fn,args);};}
 finish=wrap('finish',finish);adultFinish=wrap('adultFinish',adultFinish);learningFinish=wrap('learningFinish',learningFinish);senFinish=wrap('senFinish',senFinish);focusFinish=wrap('focusFinish',focusFinish);calmFinish=wrap('calmFinish',calmFinish);prFinish=wrap('prFinish',prFinish);worldFinish=wrap('worldFinish',worldFinish);vocabularyFinish=wrap('vocabularyFinish',vocabularyFinish);readingFinish=wrap('readingFinish',readingFinish);
 document.addEventListener('keydown',e=>{if(['Tab','Enter',' '].includes(e.key))keyboard=true;},{capture:true});document.addEventListener('pointerdown',()=>keyboard=false,{capture:true});
 function refresh(){if(!queued){queued=true;queueMicrotask(decorate);}}
 new MutationObserver(refresh).observe(app,{childList:true,subtree:true});refresh();return{refresh,stop,setPaused,get paused(){return paused;},get enabled(){return enabled();}};
})();

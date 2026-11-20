'use strict';
// Shared page shell, loaded last. It does not change any engine's state: it only marks the
// current screen type on <body> (for the design-system layout), adds a skip link, and
// labels the duplicate course exit so the course bar's "Finish for now" is the single exit.
const DesignShell=(()=>{
 const app=document.getElementById('app');
 const exitIds=['#back','#readingBack','#vocabPlayBack','#worldBack','#prBack','#learningBack','#senBack','#focusBack','#calmBack'];
 let queued=false;
 function skipLink(){
  if(document.querySelector('.ds-skip'))return;
  const a=document.createElement('a');a.className='ds-skip';a.href='#app';a.textContent='Skip to content';
  a.onclick=e=>{e.preventDefault();app.setAttribute('tabindex','-1');app.focus({preventScroll:false});};
  document.body.prepend(a);
 }
 function update(){
  queued=false;
  const inCourse=!!app.querySelector('#courseFlowBar');
  const playing=inCourse||!!app.querySelector('.game-wrap,.pr-play,.reading-play,.calm-play');
  document.body.classList.toggle('ds-playing',playing);
  document.body.classList.toggle('ds-in-course',inCourse);
  app.querySelectorAll('.ds-dup-exit').forEach(b=>{if(!inCourse)b.classList.remove('ds-dup-exit');});
  if(inCourse){
   for(const id of exitIds)app.querySelectorAll(id).forEach(b=>{if(/Back to the course/.test(b.textContent))b.classList.add('ds-dup-exit');});
   app.querySelectorAll('.play-top>.back').forEach(b=>{if(b.textContent.trim()==='← Back to the course')b.classList.add('ds-dup-exit');});
  }
 }
 function refresh(){if(!queued){queued=true;queueMicrotask(update);}}
 skipLink();
 new MutationObserver(refresh).observe(app,{childList:true,subtree:true,characterData:true});
 addEventListener('hashchange',refresh);
 update();
 return{refresh};
})();

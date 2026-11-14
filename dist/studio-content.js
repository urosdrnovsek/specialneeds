'use strict';
const StudioContent=(()=>{
 const sets={
  words:{title:'Short taught words',items:['cat','cap','cup','pig','dog','bag','bed','hat','map','mop','pen','rug','log','net','pan','mug']},
  pairs:{title:'Short-word picture pairs',items:['cat|cup','dog|bag','pig|pen','hat|mop','bed|map','log|rug','pan|net','cap|mug']},
  lists:{title:'Two-item short-word lists',items:['cup|pan','hat|bag','pen|mop','map|cap','net|log','pig|dog','bed|mug','rug|pan','cap|pen','bag|cup','mop|hat','log|map']}
 };
 const assignments={B01:{set:'words',offset:0},B02:{set:'words',offset:4},B03:{set:'pairs',offset:0},B05:{set:'lists',offset:0},B12:{set:'words',offset:8},B16:{set:'lists',offset:8}};
 function select(items,visit=0,offset=0){const start=((Math.max(0,visit)*4+offset)%items.length+items.length)%items.length;return Array.from({length:Math.min(4,items.length)},(_,i)=>items[(start+i)%items.length]);}
 function spelling(items){return [...new Set(items.flatMap(s=>s.split(/[|>]/)).flatMap(w=>readingWord(w)?.tiles||[]))];}
 const courseNeeds={
 'everyday-words-v2':'understanding familiar words, picture meanings or useful requests needs extra modelling',
 'short-words-v2':'a child knows some letter–sound links but needs support to blend short words and connect print with meaning',
 'messages-actions-v2':'a child can attempt short words but needs support to understand and act on a printed message'
 };
 const sources={
 'everyday-words-v2':['dld-rinaldi-2021','autism-interaction-2013'],
 'short-words-v2':['hall-reading-2023','intellectual-reading-2019'],
 'messages-actions-v2':['autism-comprehension-tarraga-2021','intellectual-reading-2019']
 };
 function enrich(){for(const c of studioPilots){c.need=courseNeeds[c.id];if(c.id==='short-words-v2')c.version=3;for(const a of c.activities){const config=c.id==='short-words-v2'?assignments[a.id]:null,g=a.engine==='reading'?(readingGames.find(g=>g.id===a.key)||readingGames.find(g=>g.mode==='spell'&&a.key==='build-word')):null;if(config)a.practiceSet={...config,version:1};
 a.entryKnowledge=a.engine==='reading'?'Introduce the spellings used by this game and establish the pictured vocabulary first. An adult supplies untaught helper words.':a.engine==='mission'&&a.key==='claims'?'Familiar object and colour names; introduce the short printed descriptions with a model.':a.engine==='mission'&&a.key==='route'?'Familiar picture vocabulary, taught short words and an adult model of the visible delivery plan.':c.entry;
 a.evidenceRelationship='Related teaching principle and access adaptation; this app activity and course order have not been evaluated as interventions.';
 a.observation='Notice which word, concept or step needs a model, which access support helps, and whether a new example is understood. Screen completion is not independent reading or a diagnostic score.';
 a.teachingSpellings=g?(config?spelling(sets[config.set].items):g.units||spelling(g.items)):[];a.gameItems=g?(config?sets[config.set].items:g.items):[];
 a.mayHelpWhen=a.mayHelpWhen||c.need;
 a.researchSources=sources[c.id];
 a.researchPopulations=a.researchSources.map(id=>{const r=studioResearch.articles.find(r=>r.id===id);return {source:id,population:r.population,scope:'Related teaching literature; this activity was not studied.'};});
 a.mechanic=a.engine==='offline'?'The child and adult act with real objects or messages; pointing, AAC and adult-entered responses are welcome.':a.engine==='mission'?'Move or select scene objects to complete a visible plan; matching actions change the scene.':a.engine==='vocabulary'?'Select and place picture cards into the collection or category; placed cards remain visible.':a.engine==='support'?'Move the scene objects and use the controls to carry out the shared rescue, repair or trip.':'Manipulate the word, picture or puzzle pieces; matching relationships complete each challenge.';
 a.completion=a.engine==='offline'?'An adult records “We tried this together”; this records shared participation, not a correct answer.':a.engine==='mission'?'Finish each of four authored scene tasks; a completed task gives feedback and the next task follows automatically by default.':a.engine==='reading'?'Complete the relationships in each authored round; after the final round, continue to the next course activity by default.':a.engine==='support'?'Complete the authored scene goal; the course records exploration and continues automatically by default.':'Place all required cards; the course records exploration and continues automatically by default.';
 a.retry='Incorrect choices do not erase completed work. Retry within the current challenge; use Restart to begin the current activity again.';
 a.contentReviewStatus='Awaiting expert review';
 }}}
 let active=null;const baseGame=readingGame,baseStart=readingStart;
 readingGame=id=>{const g=baseGame(id);if(!g||!active||active.gameId!==id||skillContext?.courseId!==active.courseId||skillContext.index!==active.index)return g;return{...g,items:active.items,units:spelling(active.items)};};
 readingStart=id=>{active=null;const ctx=skillContext,c=ctx&&skillCourseGet(ctx.courseId).course,a=c?.activities[ctx.index],config=a?.practiceSet;if(config&&sets[config.set]){const key='spotmatch-word-visits-v1';let visits={};try{const raw=JSON.parse(localStorage.getItem(key)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))visits=raw;}catch{}const identity=c.id+':'+a.id+':'+config.version,count=Number.isSafeInteger(visits[identity])&&visits[identity]>=0?visits[identity]:0;active={gameId:id,courseId:c.id,index:ctx.index,items:select(sets[config.set].items,count,config.offset)};visits[identity]=count+1;try{localStorage.setItem(key,JSON.stringify(visits));}catch{}}
 baseStart(id);};
 const oldPlan=skillDownloadPlan;
 function plan(id){const c=studioPilots.find(c=>c.id===id);if(!c)return null;return [c.title,'Curriculum draft · Expert review pending','Adult-supported practice; try one to three activities in a visit.','Goal: '+c.goal,'May help when: '+c.need,'Start with: '+c.entry,'',...c.activities.flatMap((a,i)=>[(i+1)+'. '+a.title,'Purpose: '+a.purpose,'Entry knowledge: '+a.entryKnowledge,...(a.teachingSpellings.length?['Spellings: '+a.teachingSpellings.join(', ')]:[]),'Model: '+a.adultModel,'Adapt: '+a.adaptations.join(' '),'Transfer: '+a.transfer,'Notice: '+a.observation,'']), 'EVIDENCE LIMITS','These activities were not evaluated in the linked studies. The sources concern related teaching principles and populations.',...sources[c.id].map(id=>{const r=studioResearch.articles.find(r=>r.id===id);return r.title+' — '+(r.url||r.sourceUrl)+' (abstract-only draft note)';})].join('\n');}
 skillDownloadPlan=id=>{const text=plan(id);if(text===null)return oldPlan(id);const url=URL.createObjectURL(new Blob([text+'\n'],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='practice-plan-'+id+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function teachingNote(a){return '<p><b>Before this activity:</b> '+senEscape(a.entryKnowledge||'')+'</p>'+(a.teachingSpellings?.length?'<p><b>Spellings used across this activity:</b> '+senEscape(a.teachingSpellings.join(', '))+'. Model any that are new.</p>':'')+(a.practiceSet?'<p>This visit uses four items from a rotating practice pool. Revisit only after introducing the vocabulary and spellings.</p>':'');}
 enrich();return{sets,select,spelling,enrich,teachingNote,plan};
})();

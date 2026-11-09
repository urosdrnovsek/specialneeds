'use strict';
// Cycle through curated examples on replay. Keep sound tasks tied to checked spoken words.
let pictureVisits={};try{pictureVisits=JSON.parse(localStorage.getItem('spotmatch-picture-visits')||'{}')||{}}catch{}
function nextPictureVisit(course,index){const key=course+':'+index,visit=pictureVisits[key]||0;pictureVisits[key]=visit+1;try{localStorage.setItem('spotmatch-picture-visits',JSON.stringify(pictureVisits))}catch{}return visit;}
const originalAdultTask=makeAdultTask;
const extraSoundSets={
 0:[[['pencil',2,'pen · cil'],['rabbit',2,'rab · bit'],['elephant',3,'el · e · phant']],[['fish',1,'fish'],['button',2,'but · ton'],['dinosaur',3,'di · no · saur']]],
 1:[[['fish',1,'fish'],['duck',1,'duck'],['star',1,'star']],[['sock',1,'sock'],['leaf',1,'leaf'],['cake',1,'cake']]],
 2:[[['rabbit',2,'rab · bit'],['turtle',2,'tur · tle'],['pencil',2,'pen · cil']],[['button',2,'but · ton'],['cherry',2,'cher · ry'],['rocket',2,'rock · et']]],
 3:[[['elephant',3,'el · e · phant'],['dinosaur',3,'di · no · saur'],['butterfly',3,'but · ter · fly']],[['potato',3,'po · ta · to'],['banana',3,'ba · na · na'],['umbrella',3,'um · brel · la']]],
 4:[[['pencil','pen · cil'],['turtle','tur · tle'],['rabbit','rab · bit']],[['button','but · ton'],['rocket','rock · et'],['cherry','cher · ry']]],
 5:[[['fish','rabbit','dinosaur'],['star','turtle','elephant'],['cake','pencil','butterfly']],[['duck','button','potato'],['sock','cherry','banana'],['leaf','rocket','umbrella']]],
 6:[[['fish','dish','cat','cup'],['mouse','house','dog','ball'],['fox','box','shoe','sun']],[['star','car','cup','dog'],['cat','hat','fish','bed'],['boat','goat','leaf','sock']]],
 7:[[['fish','dish','cup'],['mouse','house','dog'],['fox','box','sun']],[['star','car','duck'],['cat','hat','leaf'],['boat','goat','sock']]],
 8:[[['fish','dish',true],['fox','cup',false],['mouse','house',true]],[['star','car',true],['duck','leaf',false],['fox','box',true]]],
 9:[[['fish','/f/'],['duck','/d/'],['leaf','/l/']],[['sock','/s/'],['pencil','/p/'],['turtle','/t/']]],
 10:[[['cake','/k/'],['bee','/b/'],['goat','/g/']],[['mouse','/m/'],['fox','/f/'],['dish','/d/']]],
 11:[[['fish','fox','car','moon'],['duck','dog','sun','goat'],['cake','coat','mouse','shoe']],[['pencil','potato','leaf','sun'],['turtle','tree','bee','moon'],['leaf','log','cup','hat']]],
 12:[[['fish','fox','cup'],['duck','dog','shoe'],['cake','coat','moon']],[['pencil','potato','leaf'],['turtle','tree','bee'],['leaf','log','cup']]],
 13:[[['bee','/b/ · vowel in key'],['shoe','/sh/ · vowel in shoe'],['key','/k/ · vowel in key']],[['key','/k/ · vowel in key'],['bee','/b/ · vowel in key'],['shoe','/sh/ · vowel in shoe']]],
 14:[[['fish','/f/ · vowel in fish · /sh/'],['duck','/d/ · vowel in sun · /k/'],['cake','/k/ · vowel in cake · /k/']],[['sock','/s/ · vowel in sock · /k/'],['leaf','/l/ · vowel in key · /f/'],['bed','/b/ · vowel in bed · /d/']]],
 15:[[['key',2,'/k/ · vowel in key'],['bee',2,'/b/ · vowel in key'],['shoe',2,'/sh/ · vowel in shoe']],[['bee',2,'/b/ · vowel in key'],['shoe',2,'/sh/ · vowel in shoe'],['key',2,'/k/ · vowel in key']]],
 16:[[['fish',3,'/f/ · vowel in fish · /sh/'],['duck',3,'/d/ · vowel in sun · /k/'],['cake',3,'/k/ · vowel in cake · /k/']],[['sock',3,'/s/ · vowel in sock · /k/'],['leaf',3,'/l/ · vowel in key · /f/'],['bed',3,'/b/ · vowel in bed · /d/']]],
 17:[[['fish','/sh/'],['leaf','/f/'],['bed','/d/']],[['cake','/k/'],['sock','/k/'],['duck','/k/']]],
 18:[[['fish','brush','sun','shoe'],['duck','book','cup','hat'],['leaf','scarf','cup','bed']],[['cake','sock','sun','shoe'],['bed','bird','cup','hat'],['coat','hat','cup','bed']]],
 19:[[['fish','/f/ · vowel in fish · /sh/'],['bee',2,'/b/ · vowel in key'],['leaf','/f/']],[['duck','/d/ · vowel in sun · /k/'],['key',2,'/k/ · vowel in key'],['bed','/d/']]]
};
const nounBanks=['kitchen','clothing','food','toys','helpers'];
makeAdultTask=function(key,index,round,seed=0){
 const d=adultCourseInfo[key].games[index];let task;
 if(key==='sounds'){
  const sets=extraSoundSets[index],cycle=seed%3,original=d.items;
  if(cycle&&sets)d.items=sets[cycle-1];
  try{task=originalAdultTask(key,index,round)}finally{d.items=original}
  task.soundItem=(cycle&&sets?sets[cycle-1]:original)[round%3];
  // Initial/final-sound distractors must not accidentally share the target sound.
  const mode=d.mode==='review'?['phonemeblend','phonemes','final'][round%3]:d.mode;
  if(mode==='initial'||mode==='final'){
   const target=task.soundItem[0],firstSound={sun:'s',moon:'m',ball:'b',cup:'k',tree:'t',hat:'h',fish:'f',duck:'d',leaf:'l',sock:'s',cake:'k',bee:'b',goat:'g',pencil:'p',turtle:'t',mouse:'m',fox:'f',dish:'d'},lastSound={cup:'p',hat:'t',sun:'n',fish:'sh',leaf:'f',bed:'d',cake:'k',sock:'k',duck:'k',moon:'n',ball:'l',shoe:'oo',book:'k'};
   const sounds=mode==='initial'?firstSound:lastSound;const options=shuffle(Object.keys(sounds).filter(id=>id!==target&&sounds[id]!==sounds[target])).slice(0,2);task.options=shuffle([{id:'answer',picture:target},...options.map((picture,i)=>({id:'other'+i,picture}))]);
  }
  return task;
 }
 task=originalAdultTask(key,index,round);
 if(key==='words'&&index<5){const bank=wordPictureBank[nounBanks[index]],target=bank[(seed*3+round)%bank.length],others=shuffle(bank.filter(x=>x!==target)).slice(0,2);task.options=shuffle([{id:'answer',picture:target},...others.map((picture,i)=>({id:'other'+i,picture}))]);task.adult=`Show me the ${nameOf(target)}.`;task.teach=`Name these three pictures together first: ${[target,...others].map(nameOf).join(', ')}. Use the child’s familiar words, or model a new word before asking.`;task.explanation=`You found the ${nameOf(target)}.`;}
 if(key==='words'&&d.mode==='size'){const object=['ball','apple','car'][(seed+round)%3],value=round===1?'big':'small';task.options=shuffle([{id:'answer',picture:{type:'attribute',attr:'size',value,object}},{id:'other0',picture:{type:'attribute',attr:'size',value:value==='big'?'small':'big',object}}]);task.adult=`Show me the ${value} ${object}.`;}
 if(key==='words'&&d.mode==='quantity'){const object=['ball','apple','car'][(seed+round)%3],value=round===1?3:1;task.options=shuffle([{id:'answer',picture:{type:'attribute',attr:'quantity',value,object}},{id:'other0',picture:{type:'attribute',attr:'quantity',value:value===1?3:1,object}}]);task.adult=value===1?`Show me one ${object}.`:`Show me several ${object}s.`;}
 if(key==='words'&&d.mode==='newexample'){const bank=[...wordPictureBank.kitchen,...wordPictureBank.clothing,...wordPictureBank.toys],target=bank[(seed*3+round)%bank.length];task.reference=[target];task.options=shuffle([{id:'answer',picture:{icon:target,variant:3}},...shuffle(bank.filter(x=>x!==target)).slice(0,2).map((picture,i)=>({id:'other'+i,picture}))]);task.adult=`Find another picture of ${['gloves','trousers','blocks'].includes(target)?'the '+nameOf(target):'a '+nameOf(target)}.`;task.explanation=`Two drawings can show the same kind of object: ${nameOf(target)}.`;}
 if(key==='sentences'){
  if(d.mode==='instructions'&&seed%3){const sets=seed%3===1?[['spoon','fork','plate'],['scarf','shoe','tshirt'],['teddy','train','rocket']]:[['bottle','cup','bowl'],['gloves','coat','dress'],['drum','ball','puzzle']],ids=sets[round%3];task.options=shuffle(ids.map(id=>({id,picture:id})));task.answer=ids.slice(0,2);task.adult=`First tap the ${nameOf(ids[0])}, then tap the ${nameOf(ids[1])}.`;}
  if(['object','giveobject','negative','plural','position','treeposition','chairposition'].includes(d.mode)){
   const bank=d.mode==='object'?[['ball','car','box'],['train','basket','rocket'],['teddy','drum','blocks']]:d.mode==='giveobject'?[['book','cup','ball'],['apple','book','spoon'],['teddy','flower','hat']]:d.mode==='negative'?[['cup','cup','cup'],['bottle','bottle','bottle'],['flower','flower','flower']]:d.mode==='plural'?[['ball','ball','ball'],['apple','apple','apple'],['spoon','spoon','spoon']]:[['ball','ball','ball'],['apple','apple','apple'],['teddy','teddy','teddy']];
   const word=bank[seed%3][round%3],old=d.mode==='object'?['ball','car','box'][round%3]:d.mode==='giveobject'?['book','cup','ball'][round%3]:d.mode==='negative'?'cup':'ball';
   if(d.mode==='object'||d.mode==='giveobject'){
    const set=bank[seed%3];for(const o of task.options){const original=['ball','car','box'];if(d.mode==='object')o.picture.object=set[original.indexOf(o.picture.object)]||o.picture.object;else o.picture.object=o.id==='answer'||o.id==='other0'?word:set[(round+1)%3];}
   }else for(const o of task.options)o.picture.object=word;
   task.adult=task.adult.replaceAll(old,word).replace("a apple","an apple");
  }
 }
 return task;
};
// Show the same curated spoken example in the short invitation and the optional adult notes.
const originalSoundInvitation=friendlySoundInstruction;
friendlySoundInstruction=function(s){const d=adultCourseInfo.sounds.games[s.index],original=d.items;if(!s.soundItem)return originalSoundInvitation(s);d.items=[...original];d.items[s.round%3]=s.soundItem;try{return originalSoundInvitation(s)}finally{d.items=original}};
function relatedPictureChoices(a,b){
 const groups=[['spoon','fork'],['cup','bowl','plate','bottle','pan','pot','kettle','tray','basket','bucket','pitcher','wateringcan'],['brush','paintbrush','comb','toothbrush','cloth','pencil','scissors'],['boot','cleanboot','shoe','sock'],['drypot','flower','sprout','seed','tree'],['key','lock','door','house'],['umbrella','coat','hat','blanket'],['lamp','flashlight'],['bridge','ladder']];return groups.some(group=>group.includes(a)&&group.includes(b));
}
const familiarVisualRound=lessonData;
lessonData=function(g,r){const d=familiarVisualRound(g,r);if(![0,1,3,15].includes(g))return d;const target={...d.target,shape:(r+sessionSeed)%8};let opts=[];
 if(g===0)opts=[target,{...target,shape:(target.shape+3)%8,color:(target.color+1)%4}];
 if(g===1)opts=[target,{...target,shape:(target.shape+1)%8},{...target,shape:(target.shape+2)%8}];
 if(g===3)opts=[target,{...target,size:1-target.size}];
 if(g===15)opts=[target,{...target,color:(target.color+1)%4},{...target,shape:(target.shape+1)%8},{...target,shape:(target.shape+2)%8},{...target,color:(target.color+2)%4},{...target,shape:(target.shape+3)%8}];
 return{target,choices:shuffle(opts.map((o,i)=>({o,match:i===0})))};
};
const familiarInteractiveRound=makeInteractiveRound;
makeInteractiveRound=function(g,r,seed){const n=(r+seed)%8;if(g===20)return{homes:shuffle([n,(n+1)%8]),tokens:shuffle([n,n,(n+1)%8,(n+1)%8].map((shape,i)=>({shape,color:(r+i)%4}))),position:0};
 if(g===21){const models=[{shape:n,color:(n+1)%4},{shape:(n+1)%8,color:(n+2)%4},{shape:n,color:(n+2)%4}];return{cards:shuffle(models.flatMap((o,pair)=>[{o,pair},{o,pair}])),matched:[],selected:null,wrong:[]};}
 if(g===24){const before=[0,1,2].map(i=>({shape:(n+i)%8,color:(seed+1)%4})),changed=(r+seed)%3;return{before,after:before.map((o,i)=>i===changed?{...o,shape:(o.shape+1)%8}:{...o}),changed,wrong:null};}
 return familiarInteractiveRound(g,r,seed);
};

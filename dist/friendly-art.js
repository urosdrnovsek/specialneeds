'use strict';
// Shared storybook illustrations. Learning features stay consistent across answer choices.
const friendlyPalette={bear:{fur:'#dcb17c',shade:'#c08c60',shirt:'#7da99d'},rabbit:{fur:'#ede0c7',shade:'#d4bd9e',shirt:'#dc9b7e'},cat:{fur:'#e7b373',shade:'#c48a56',shirt:'#8cacc5'},dog:{fur:'#b79a80',shade:'#8f7058',shirt:'#d6bd72'}};
function friendlyAnimal(id='bear',pose='stand',happy=true){const c=friendlyPalette[id]||friendlyPalette.bear;let ears=id==='rabbit'?`<ellipse cx="40" cy="19" rx="10" ry="30" fill="${c.fur}"/><ellipse cx="75" cy="19" rx="10" ry="30" fill="${c.fur}"/><ellipse cx="40" cy="19" rx="4" ry="21" fill="#e5b9a3"/><ellipse cx="75" cy="19" rx="4" ry="21" fill="#e5b9a3"/>`:id==='cat'?`<path d="M22 48L20 15L48 35M68 35L97 15L93 53" fill="${c.fur}"/><path d="M27 30L29 43L38 36M81 36L90 29L88 44" fill="#e5b9a3"/>`:id==='dog'?`<ellipse cx="20" cy="58" rx="13" ry="26" fill="${c.shade}"/><ellipse cx="94" cy="58" rx="13" ry="26" fill="${c.shade}"/>`:`<circle cx="27" cy="32" r="14" fill="${c.fur}"/><circle cx="88" cy="32" r="14" fill="${c.fur}"/><circle cx="27" cy="32" r="7" fill="${c.shade}"/><circle cx="88" cy="32" r="7" fill="${c.shade}"/>`;
 const sleeping=pose==='sleep';const body=`<ellipse cx="58" cy="158" rx="40" ry="6" fill="#536f4c" opacity=".10"/><path d="M37 119L32 150Q43 160 53 149L57 132L66 149Q80 158 87 148L79 118" fill="${c.fur}"/><path d="M31 91Q58 77 85 93L83 131Q58 145 32 131Z" fill="${c.shirt}"/><path d="M34 98Q19 107 18 124M81 98Q96 110 98 121" fill="none" stroke="${c.fur}" stroke-width="13" stroke-linecap="round"/>${ears}<ellipse cx="58" cy="64" rx="39" ry="36" fill="${c.fur}"/><ellipse cx="58" cy="78" rx="22" ry="16" fill="#f5e5c9"/><ellipse cx="32" cy="75" rx="7" ry="4" fill="#dc8f83" opacity=".35"/><ellipse cx="84" cy="75" rx="7" ry="4" fill="#dc8f83" opacity=".35"/>${sleeping?'<path d="M38 64Q44 70 49 64M68 64Q74 70 79 64" fill="none" stroke="#4c443c" stroke-width="2.6"/>':'<ellipse cx="44" cy="65" rx="3" ry="4" fill="#4c443c"/><ellipse cx="73" cy="65" rx="3" ry="4" fill="#4c443c"/><circle cx="45" cy="64" r=".8" fill="white"/><circle cx="74" cy="64" r=".8" fill="white"/>'}<path d="M53 75Q58 70 64 75L59 81Z" fill="#645041"/><path d="${happy?'M51 84Q59 92 67 84':'M52 89Q59 84 66 89'}" fill="none" stroke="#645041" stroke-width="2" stroke-linecap="round"/><path d="M40 104H75M56 101V131" stroke="#fff8" stroke-width="2" fill="none"/>`;
 return `<g stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}

function friendlyMovingAnimal(id,running=true){const c=friendlyPalette[id]||friendlyPalette.bear;const ears=id==='rabbit'?`<ellipse cx="62" cy="17" rx="8" ry="25" fill="${c.fur}"/><ellipse cx="80" cy="17" rx="8" ry="25" fill="${c.fur}"/>`:id==='cat'?`<path d="M49 43L48 12L70 33L84 11L91 45" fill="${c.fur}"/>`:id==='dog'?`<ellipse cx="53" cy="47" rx="12" ry="24" fill="${c.shade}"/>`:`<circle cx="54" cy="30" r="12" fill="${c.fur}"/>`;
return `<g stroke-linecap="round" stroke-linejoin="round"><ellipse cx="57" cy="158" rx="43" ry="5" fill="#667d4c" opacity=".08"/><path d="M39 111L14 ${running?143:150}L27 151M62 115L84 145L101 147" stroke="${c.fur}" stroke-width="15" fill="none"/><path d="M31 88Q49 72 72 83L78 119L36 128Z" fill="${c.shirt}"/><path d="M35 104Q14 96 10 84M68 95Q91 112 105 102" stroke="${c.fur}" stroke-width="11" fill="none"/>${ears}<ellipse cx="72" cy="57" rx="30" ry="30" fill="${c.fur}"/><ellipse cx="94" cy="66" rx="22" ry="15" fill="#f4e3c8"/><ellipse cx="109" cy="62" rx="5" ry="4" fill="#645041"/><ellipse cx="83" cy="52" rx="3" ry="4" fill="#4d453d"/><path d="M91 75Q101 80 108 72" stroke="#645041" stroke-width="2" fill="none"/><ellipse cx="75" cy="70" rx="6" ry="4" fill="#df9b88" opacity=".35"/><path d="M44 98L67 92" stroke="#fff8" stroke-width="2"/></g>`;
}

const unpolishedIcon=pictureIcon;
pictureIcon=function(id,variant=0){
 if(['bear','rabbit','cat','dog'].includes(id)){return `<svg viewBox="0 -12 116 178" aria-hidden="true">${friendlyAnimal(id)}</svg>`;}
 let svg=unpolishedIcon(id,variant);if(variant===3||variant===4)return svg;
 // Soft grounding and lighter outlines make the existing object vocabulary easier to read.
 svg=svg.replace(/stroke-width="3"/g,'stroke-width="2.5"');
 return svg.replace(/(<svg[^>]*>)/,'$1<ellipse cx="60" cy="109" rx="35" ry="4" fill="#476444" opacity=".08"/>');
};
character=function(x=22,y=87,happy=true){return `<g transform="translate(${x-2} ${y-13}) scale(.56)">${friendlyAnimal('bear','stand',happy)}</g>`;};
const oldSceneFrame=sceneFrame;
sceneFrame=function(body){return `<svg viewBox="0 0 240 180" aria-hidden="true"><rect width="240" height="180" rx="19" fill="#f5f3e7"/><path d="M0 144Q58 132 121 145Q187 135 240 143V180H0Z" fill="#e5ebd6"/><ellipse cx="120" cy="155" rx="81" ry="8" fill="#73906b" opacity=".08"/>${body}</svg>`;};
const oldAdultPicture=adultPicture;
adultPicture=function(p,v=0){
 if(p?.type==='roles'){
  const running=p.action==='chase';let a=`<g transform="translate(10 ${running?37:28}) scale(.66)">${friendlyAnimal(p.actor)}</g>`,b=`<g transform="translate(155 ${running?29:28}) scale(.66)">${friendlyAnimal(p.patient)}</g>`;
  if(['chase','follow'].includes(p.action)){a=`<g transform="translate(7 27) scale(.68)">${friendlyMovingAnimal(p.actor,running)}</g>`;b=`<g transform="translate(144 23) scale(.68)">${friendlyMovingAnimal(p.patient,running)}</g>`;}
  let detail='';
  if(p.action==='give')detail=`<path d="M65 102Q93 95 117 103" fill="none" stroke="${(friendlyPalette[p.actor]||friendlyPalette.bear).fur}" stroke-width="11"/><path d="M174 108Q161 99 150 106" fill="none" stroke="${(friendlyPalette[p.patient]||friendlyPalette.rabbit).fur}" stroke-width="10"/>${adultIcon(p.object||'ball',107,74,48,v)}`;
  if(p.action==='wash')detail=`<path d="M65 99Q105 75 177 78" fill="none" stroke="${(friendlyPalette[p.actor]||friendlyPalette.bear).fur}" stroke-width="10"/>${adultIcon('cloth',146,47,42,v)}<path d="M171 43q-8 12 0 14q8-2 0-14M193 49q-7 12 0 14q7-2 0-14" fill="#8ebbc6"/>`;
  if(p.action==='brush')detail=`<path d="M63 98Q116 86 178 79" fill="none" stroke="${(friendlyPalette[p.actor]||friendlyPalette.bear).fur}" stroke-width="10"/>${adultIcon('brush',153,53,42,v)}`;
  if(['chase','follow'].includes(p.action))detail='<path d="M4 138H17M0 148H12M143 140H155" stroke="#b5c29d" stroke-width="3" stroke-linecap="round"/>';
  let content=a+b+detail;if(p.reverse)content=`<g transform="translate(240 0) scale(-1 1)">${content}</g>`;return sceneFrame(content).replace('<svg ','<svg class="character-scene" ');
 }
 if(p?.type==='actor'){
  const id=p.actor||'bear',action=p.action,fur=(friendlyPalette[id]||friendlyPalette.bear).fur;let b='';
  if(action==='sleep')b=adultIcon('bed',49,65,147,v)+`<g transform="translate(104 51) rotate(76 27 30) scale(.52)">${friendlyAnimal(id,'sleep')}</g>`;
  else if(action==='sit')b=adultIcon('chair',76,61,116,v)+`<g transform="translate(43 13) scale(.70)">${friendlyAnimal(id)}</g>`;
  else if(action==='jump')b=`<g transform="translate(77 3) rotate(-8 38 60) scale(.70)">${friendlyAnimal(id)}</g><path d="M70 151Q113 143 154 152" fill="none" stroke="#c1cdaa" stroke-width="3" stroke-dasharray="3 5"/>`;
  else if(action==='hold'||action==='nothold')b=`<g transform="translate(59 13) scale(.77)">${friendlyAnimal(id)}</g>`+(action==='hold'?`<path d="M77 102Q112 117 148 100" stroke="${fur}" stroke-width="11" fill="none"/>${adultIcon(p.object||'cup',102,80,52,v)}`:'');
  else if(action==='push')b=`<g transform="translate(22 30) rotate(9 40 65) scale(.67)">${friendlyAnimal(id)}</g>${adultIcon(p.object||'ball',137,79,83,v)}<path d="M71 109L147 109" stroke="${fur}" stroke-width="11" stroke-linecap="round"/>`;
  else if(action==='pull')b=`${adultIcon(p.object||'ball',13,82,82,v)}<g transform="translate(147 20) rotate(-7 35 70) scale(.70)">${friendlyAnimal(id)}</g><path d="M76 107L169 107" stroke="#ad8d65" stroke-width="3" stroke-linecap="round"/><circle cx="169" cy="107" r="6" fill="${fur}"/>`;
  else if(action==='carry')b=`<g transform="translate(53 16) scale(.76)">${friendlyAnimal(id)}</g><path d="M70 104Q108 122 151 103" fill="none" stroke="${fur}" stroke-width="11"/>${adultIcon('basket',103,95,64,v)}`;
  else return oldAdultPicture(p,v).replace('<svg ','<svg class="character-scene" ');
  return sceneFrame(b).replace('<svg ','<svg class="character-scene" ');
 }
 return oldAdultPicture(p,v);
};
function friendlyCover(key){
 let b='';
 if(key==='visual')b=`<g transform="translate(32 15) scale(.78)">${friendlyAnimal('rabbit')}</g><g transform="translate(148 23) scale(.72)">${friendlyAnimal('bear')}</g><rect x="80" y="116" width="78" height="37" rx="8" fill="#ead1a3"/>${iconGroup('flower',78,98,39)}${iconGroup('flower',116,98,39)}`;
 if(key==='events')b=`<g transform="translate(14 14) scale(.76)">${friendlyAnimal('rabbit')}</g>${iconGroup('wateringcan',103,63,72)}${iconGroup('sprout',166,91,67)}<path d="M159 107Q175 110 184 121" stroke="#8bb2bc" stroke-width="3" stroke-dasharray="3 4" fill="none"/>`;
 if(key==='stories')b=`<g transform="translate(13 21) scale(.78)">${friendlyAnimal('bear')}</g><g transform="translate(147 19) scale(.76)">${friendlyAnimal('rabbit')}</g>${iconGroup('book',78,99,82)}`;
 if(key==='meaning')b=`<g transform="translate(22 14) scale(.78)">${friendlyAnimal('cat')}</g>${iconGroup('basket',125,84,84)}${iconGroup('apple',131,57,47)}${iconGroup('carrot',166,62,42)}`;
 if(key==='words')b=`<g transform="translate(17 17) scale(.78)">${friendlyAnimal('bear')}</g><rect x="119" y="28" width="83" height="73" rx="17" fill="#fffdf6"/>${iconGroup('apple',132,36,56)}<path d="M128 97L115 113L146 101" fill="#fffdf6"/>${iconGroup('cup',119,111,48)}${iconGroup('ball',172,111,44)}`;
 if(key==='sentences')return adultPicture({type:'roles',actor:'bear',patient:'rabbit',action:'give',object:'ball'});
 if(key==='sounds')b=`<g transform="translate(27 13) scale(.78)">${friendlyAnimal('rabbit')}</g>${iconGroup('bee',135,22,67)}<circle cx="133" cy="137" r="10" fill="#c5d5b1"/><circle cx="163" cy="137" r="10" fill="#e1b18b"/><circle cx="193" cy="137" r="10" fill="#dfcb83"/>`;
 return sceneFrame(b);
}
function friendlyMascot(){return `<svg viewBox="0 -12 116 178" aria-hidden="true">${friendlyAnimal('rabbit')}</svg>`;}

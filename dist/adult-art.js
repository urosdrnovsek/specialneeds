'use strict';
const originalPictureIcon=pictureIcon;
pictureIcon=function(id,variant=0){
 const ink='#355447',g=['#72988a','#86a392','#638f7c'][variant%3],o='#d89565',y='#e2bf63';let b='';
 if(id==='shoe')b=`<path d="M20 50L45 40L66 62L101 74Q112 80 108 98H16V74Z" fill="${g}"/><path d="M17 88H108M48 53L40 61M59 62L51 70M72 69L64 77" fill="none" stroke-width="4"/>`;
 if(id==='banana')b=`<path d="M31 18Q14 81 99 94Q67 119 31 87Q4 58 31 18Z" fill="${y}"/><path d="M31 19L37 9M96 93L108 94" fill="none" stroke-width="6"/>`;
 if(id==='tomato')b=`<ellipse cx="60" cy="67" rx="42" ry="36" fill="${o}"/><path d="M60 44L44 20L59 28L68 10L73 31L94 25L81 45Z" fill="${g}"/>`;
 if(['cat','dog','rabbit','bear'].includes(id)){const color=id==='cat'?y:id==='dog'?g:id==='rabbit'?'#ddd5bb':'#d5ab87';b=id==='rabbit'?`<ellipse cx="39" cy="25" rx="11" ry="24" fill="${color}"/><ellipse cx="79" cy="25" rx="11" ry="24" fill="${color}"/>`:id==='cat'?`<path d="M25 49L21 14L48 34M72 34L100 14L95 51" fill="${color}"/>`:id==='dog'?`<ellipse cx="21" cy="57" rx="15" ry="29" fill="${color}"/><ellipse cx="99" cy="57" rx="15" ry="29" fill="${color}"/>`:`<circle cx="29" cy="28" r="16" fill="${color}"/><circle cx="91" cy="28" r="16" fill="${color}"/>`;b+=`<ellipse cx="60" cy="68" rx="42" ry="38" fill="${color}"/><circle cx="45" cy="62" r="3" fill="${ink}"/><circle cx="76" cy="62" r="3" fill="${ink}"/><path d="M54 77L66 77L60 84Z" fill="${ink}"/><path d="M44 88Q60 101 77 88" fill="none"/>`;}
 if(id==='boat')b=`<path d="M12 78H110L91 105H31Z" fill="${g}"/><path d="M59 15V78M64 20L104 68H64Z" fill="${y}"/><path d="M9 113Q29 104 45 113Q61 122 79 113Q96 104 113 113" fill="none" stroke="#8bb2bf"/>`;
 if(id==='goat')b=`<path d="M37 37L25 8L48 30M76 31L95 8L88 45" fill="${y}"/><path d="M25 42Q61 18 98 42L85 96L60 112L33 96Z" fill="#d7d4be"/><path d="M60 94L57 114L72 102" fill="#d7d4be"/><circle cx="44" cy="61" r="3" fill="${ink}"/><circle cx="78" cy="61" r="3" fill="${ink}"/><path d="M51 84H69"/>`;
 if(id==='log')b=`<path d="M25 39L88 25Q112 39 98 82L37 99Z" fill="#bb9870"/><ellipse cx="29" cy="69" rx="21" ry="31" fill="#e0c5a0"/><ellipse cx="29" cy="69" rx="11" ry="21" fill="none"/><path d="M50 44L87 35M56 83L88 73"/>`;
 if(id==='sock')b=`<path d="M48 14H91V76Q84 104 45 111Q13 116 12 93Q15 80 48 73Z" fill="${g}"/><path d="M48 30H91M29 82L46 106" fill="none" stroke="${y}" stroke-width="9"/>`;
 if(id==='moon')b='<path d="M84 13Q42 51 96 94Q40 124 18 72Q-1 18 84 13Z" fill="#d9c990"/>';
 if(id==='bee')b=`<ellipse cx="43" cy="34" rx="22" ry="25" fill="#dce9e6"/><ellipse cx="77" cy="34" rx="22" ry="25" fill="#dce9e6"/><ellipse cx="60" cy="75" rx="40" ry="28" fill="${y}"/><path d="M46 52V99M65 48V102M84 54V96" stroke-width="9"/><circle cx="30" cy="68" r="3" fill="${ink}"/><path d="M23 60L16 43"/>`;
 if(!b)return originalPictureIcon(id,variant);
 let body=`<g stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${b}</g>`;if(variant===3)body=body.replace(/fill="[^"]*"/g,'fill="#fffdf6"');return `<svg viewBox="0 0 120 120" aria-hidden="true">${body}</svg>`;
};
function adultIcon(id,x,y,w=70,v=0){const svg=pictureIcon(id,v),view=svg.match(/viewBox="([^"]+)"/)?.[1]||'0 0 120 120';return `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="${view}">${svgBody(svg)}</svg>`}
function animalBody(id,x,y,scale=.65){return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="60" cy="128" rx="32" ry="36" fill="${id==='rabbit'?'#ddd5bb':id==='cat'?'#e2bf63':id==='dog'?'#72988a':'#d5ab87'}" stroke="#355447" stroke-width="2"/>${adultIcon(id,0,0,120)}<path d="M43 154L37 170M76 154L84 170" stroke="#355447" stroke-width="5" stroke-linecap="round"/></g>`}
function adultPicture(p,v=0){
 if(typeof p==='string')return pictureIcon(p,v);
 if(p.type==='yesno')return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="42" fill="${p.value?'#e2edda':'#f4e7db'}" stroke="#99aa8e" stroke-width="2"/><path d="${p.value?'M33 60L52 79L88 39':'M38 38L82 82M82 38L38 82'}" fill="none" stroke="#355447" stroke-width="7" stroke-linecap="round"/></svg>`;
 if(p.icon)return pictureIcon(p.icon,p.variant??v);
 if(p.type==='sequence')return `<svg class="sentence-sequence" viewBox="0 0 510 180" aria-hidden="true">${p.items.map((item,i)=>`<svg x="${i*270}" y="0" width="240" height="180" viewBox="0 0 240 180">${svgBody(adultPicture(item,v))}</svg>`).join('')}<path d="M246 90H264m-7-6l7 6l-7 6" stroke="#829b75" stroke-width="3" fill="none"/></svg>`;
 if(p.type==='attribute'){
  let b='';const id=p.object||'ball';if(p.attr==='size'){const sc=p.value==='small'?.52:1;b=`<g transform="translate(${(1-sc)*120} ${(1-sc)*90}) scale(${sc})">${adultIcon(id,65,25,110,v)}</g>`;}
  if(p.attr==='full')b=adultIcon(p.value==='full'?'fullcup':'emptycup',65,30,110,v);
  if(p.attr==='wet'){b=adultIcon('cleanboot',65,28,110,v);if(p.value==='wet')b+=[90,120,150].map((x,i)=>`<path d="M${x} ${31+i%2*12}q-10 17 0 19q10-2 0-19Z" fill="#8ab9c4"/>`).join('');}
  if(p.attr==='open'){b=adultIcon('box',65,35,110,v);if(p.value==='open')b+='<path d="M87 70L65 44L105 32L119 51M119 51L141 30L175 44L157 70" fill="#e4c69d" stroke="#355447" stroke-width="3"/>';else b+='<path d="M87 71H157" stroke="#355447" stroke-width="5"/>';}
  if(p.attr==='quantity'){b=p.value===1?adultIcon(id,67,32,110,v):[22,93,164].map(x=>adultIcon(id,x,65,57,v)).join('');}
  if(p.attr==='shape'){b=p.value==='round'?adultIcon('ball',65,32,110,v):p.value==='square'?'<rect x="77" y="42" width="90" height="90" rx="4" fill="#d89565" stroke="#355447" stroke-width="3"/>':'<path d="M120 32L175 136H65Z" fill="#72988a" stroke="#355447" stroke-width="3"/>';}
  if(p.attr==='two'){b=`<g transform="${p.size==='small'?'translate(52 35) scale(.65)':'translate(0 0)'}">${adultIcon(p.full?'fullcup':'emptycup',65,30,110,v)}</g>`;}
  return sceneFrame(b);
 }
 if(p.type==='position'){
  const object=p.object||'ball',ref=p.reference||'box',pos=p.position;
  // Each reference has its own contact surface and occlusion, rather than sharing icon offsets.
  const coordinates={box:{in:[89,58,62],on:[91,18,58],under:[98,119,44],beside:[176,109,58],behind:[123,57,58],front:[91,108,58]},chair:{in:[92,68,55],on:[92,68,55],under:[100,122,40],beside:[174,109,58],behind:[120,83,58],front:[91,108,58]},tree:{in:[91,75,58],on:[91,10,58],under:[98,119,44],beside:[174,109,58],behind:[121,101,51],front:[91,108,58]}};
  let [x,,w]=(coordinates[ref]||coordinates.box)[pos]||coordinates.box.beside;
  if(pos==='on'&&ref==='box'&&['rabbit','bear','cat','dog'].includes(object)){x+=4;w-=8;}
  const surface=ref==='chair'?113.4:ref==='tree'?49.4:55;
  const bottom=pos==='on'?surface:pos==='in'?117:pos==='behind'?(ref==='tree'?155:118):155;
  const objectBottom={ball:100.25,apple:106,teddy:119.25,train:112.25,basket:102.25,rocket:110.25}[object]||(['rabbit','bear','cat','dog'].includes(object)?112:108);
  if(pos==='under'){
   const objectTop={ball:19.75,apple:14,teddy:12.75,train:21.75,basket:17,rocket:5.75}[object]||0;
   const availableHeight=ref==='chair'?22:29,center=x+w/2;
   w=Math.min(w,availableHeight*120/(objectBottom-objectTop));x=center-w/2;
  }
  const y=bottom-objectBottom*w/120;
  const item=`<g data-scene-part="position-object" data-object="${object}" data-contact-y="${bottom}" data-reference="${ref}" data-position="${pos}">${adultIcon(object,x,y,w,v)}</g>`;let reference='';
  if(ref==='box')reference=`<g data-scene-part="storage-box" stroke="#355447" stroke-width="2.5" stroke-linejoin="round"><g data-scene-part="box-stand" fill="#7d9fa9" stroke="#4d6b77"><path d="M79 123V156M161 123V156" stroke-width="6" stroke-linecap="round"/><rect x="64" y="119" width="112" height="5" rx="2"/></g><rect data-scene-part="reference-body" x="72" y="66" width="96" height="58" rx="2" fill="#d4b58b"/>${pos==='in'?'<path data-scene-part="reference-top" data-contact-y="55" d="M72 66L58 51L93 47L108 66M132 66L149 47L182 51L168 66" fill="#e5cba5"/><path d="M74 68H166V100H74Z" fill="#ad8b65" stroke="none"/>':'<path data-scene-part="reference-top" data-contact-y="55" d="M72 66L84 55H156L168 66Z" fill="#e5cba5"/><path d="M109 66L113 55H126L130 66V85H109Z" fill="#edcf91" stroke="none"/>'}<path d="M76 74L82 79M159 113L164 117" fill="none" stroke="#b28d63"/>${pos==='in'?'':'<rect x="135" y="92" width="22" height="14" rx="1" fill="#f4e8ce" stroke="#b4926a" stroke-width="1.5"/>'}</g>`;
  else reference=`<g data-scene-part="reference-body">${adultIcon(ref,52,43,128,v)}</g>`;
  if(ref==='chair')reference+=`<path data-scene-part="reference-seat" data-contact-y="113.4" d="M81 114H151" fill="none" stroke="#6c9180" stroke-width="2"/>`;
  let body=pos==='behind'?item+reference:reference+item;
  if(pos==='in'&&ref==='box')body+=`<path data-scene-part="box-front" d="M72 99H168V124H72Z" fill="#d4b58b" stroke="#355447" stroke-width="2.5"/><path d="M109 100H130V123H109Z" fill="#edcf91" stroke="none"/><path d="M158 113L164 118" stroke="#b28d63" stroke-width="2"/><rect x="135" y="106" width="22" height="10" rx="1" fill="#f4e8ce" stroke="#b4926a" stroke-width="1.5"/>`;
  return sceneFrame(body);
 }
 if(p.type==='actor'){
  let b='',actor=p.actor||'bear',action=p.action||'sit',object=p.object||'ball';
  if(action==='sleep'){b+=typeof friendlyBedScene==='function'?friendlyBedScene(actor,v):adultIcon('bed',49,65,147,v);}
  else if(action==='sit'){b+=adultIcon('chair',72,68,105,v)+animalBody(actor,49,18,.58);}
  else if(action==='jump'){b+=animalBody(actor,61,1,.62)+'<path d="M69 128L69 107M64 114L69 107L74 114M128 128L128 107M123 114L128 107L133 114" stroke="#92a483" stroke-width="3" fill="none"/>';}
  else if(action==='pour'){b+=adultIcon('cup',128,84,76,v)+`<g transform="rotate(25 91 64)">${adultIcon('pitcher',40,20,83,v)}</g><path d="M116 66Q146 71 154 102" stroke="#7eaab7" stroke-width="5" fill="none" stroke-dasharray="5 5"/>`;}
  else if(action==='wash'){b+=adultIcon('hands',67,55,108,v)+adultIcon('water',102,83,89,v);}
  else if(action==='brush'){b+=adultIcon('boot',102,71,90,v)+adultIcon('brush',60,21,90,v);}
  else if(action==='carry'){b+=animalBody(actor,39,16,.63)+adultIcon('basket',102,87,77,v);}
  else if(action==='hold'||action==='nothold'){b+=animalBody(actor,46,16,.66);if(action==='hold')b+=adultIcon(object,107,81,68,v);}
  else {b+=animalBody(actor,action==='pull'?107:24,27,.6)+adultIcon(object,action==='pull'?29:130,91,76,v);const pulling=action==='pull';b+=`<path d="M${pulling?79:82} 114H${pulling?141:151}" stroke="#355447" stroke-width="${pulling?2:4}"/><path d="M${pulling?117:107} 82H${pulling?163:153}m-10-7l10 7l-10 7" stroke="#7b9872" stroke-width="3" fill="none"/>`;}
  return sceneFrame(b);
 }
 if(p.type==='roles'){
  let b=animalBody(p.actor,15,34,.61)+animalBody(p.patient,151,34,.61);const action=p.action;
  if(action==='give')b+=adultIcon(p.object||'ball',92,77,55,v);
  if(action==='wash')b+=adultIcon('water',95,52,63,v);
  if(action==='brush')b+=adultIcon('brush',94,57,55,v);
  b+='<path d="M89 131H151m-10-8l10 8l-10 8" fill="none" stroke="#76946d" stroke-width="5"/>';
  if(action==='chase'||action==='follow')b+='<path d="M8 140H22M1 150H17M138 141H151" stroke="#a0af91" stroke-width="3"/>';
  if(p.reverse)b=`<g transform="translate(240 0) scale(-1 1)">${b}</g>`;
  return sceneFrame(b);
 }
 return learnPicture(p,v);
}

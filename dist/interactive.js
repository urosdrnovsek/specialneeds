'use strict';
// The five hands-on games share course navigation and local progress with the matching games.
const interactiveDescriptions={
 20:['Group by shape','An object can belong with another even when its color is different.','Tap the object’s matching home. Repeat until all four are sorted.'],
 21:['Compare two pictures','Check the whole picture rather than one striking detail.','Tap a picture, then its identical partner. All pictures stay face up.'],
 22:['Check two features','Compare color and dot arrangement separately, then check the whole.','Tap a color and a dot pattern. Watch your mushroom change, then check it.'],
 23:['Compare orientation','Notice which way an object faces and adjust it to match.','Tap a turn arrow. When both leaves face the same way, tap the check button.'],
 24:['Compare corresponding details','Look across two visible arrangements to find one difference.','Look at both rows. Tap the changed picture in the lower row.']
};
const colorNames=['terracotta','green','gold','purple'];
function makeInteractiveRound(g,r,seed){
 const n=(r+seed)%4;
 if(g===20){const homes=shuffle([n,(n+1)%4]);return {homes,tokens:shuffle([n,n,(n+1)%4,(n+1)%4].map((shape,i)=>({shape,color:(n+i)%4}))),position:0};}
 if(g===21){const models=[{shape:n,color:(n+1)%4},{shape:(n+1)%4,color:(n+2)%4},{shape:n,color:(n+2)%4}];return {cards:shuffle(models.flatMap((o,pair)=>[{o,pair},{o,pair}])),matched:[],selected:null,wrong:[]};}
 if(g===22){const target={shape:2,color:n,dots:1+r%3};return {target,built:{...target,color:(n+1)%4,dots:1+target.dots%3}};}
 if(g===23){return {target:{shape:1,color:1,dir:n},built:{shape:1,color:1,dir:(n+1+r%2)%4}};}
 if(g===24){const before=[0,1,2].map(i=>({shape:(n+i)%4,color:(seed+1)%4}));const changed=(r+seed)%3;const after=before.map((o,i)=>i===changed?{...o,shape:(o.shape+1)%4}:({...o}));return {before,after,changed,wrong:null};}
 throw new Error('Unknown interactive game');
}
function interactiveIntro(g){
 game=g;round=0;correct=0;hints=0;sessionSeed=Math.floor(Math.random()*8);
 const d=interactiveDescriptions[g],a={shape:g===22?2:1,color:1,dots:g===22?2:0};
 let example=`<div class="demo-tile">${art(a)}</div><span class="demo-arrow" aria-hidden="true">→</span><div class="demo-tile">${art(a)}<span>✓</span></div>`;
 if(g===20)example=`<div class="demo-tile">${art({shape:1,color:0})}</div><span class="demo-arrow" aria-hidden="true">→</span><div class="demo-tile demo-home">${art({shape:1,color:1})}<span>✓</span></div>`;
 if(g===23)example=`<div class="demo-tile">${art({shape:1,color:1,dir:1})}</div><span class="demo-arrow" aria-hidden="true">↶</span><div class="demo-tile">${art({shape:1,color:1,dir:0})}<span>✓</span></div>`;
 if(g===24)example=`<div class="demo-tile">${art({shape:1,color:1})}</div><span class="demo-arrow" aria-hidden="true">≠</span><div class="demo-tile changed-demo">${art({shape:3,color:1})}<span>☝</span></div>`;
 shell(`<span class="eyebrow">HANDS-ON DISCOVERY</span><h1>${courses[g][0]}</h1><p>${courses[g][3]}</p><div class="game-stage"><div class="demo-row">${example}</div><p>${d[2]}</p><button class="primary" id="begin">Start playing →</button></div><div class="learning-note"><b>What we practice: ${d[0].toLowerCase()}.</b> ${d[1]}</div>`);
 document.querySelector('#begin').onclick=interactivePlay;
}
function interactivePlay(){
 hadError=false;usedHint=false;answered=false;
 current=makeInteractiveRound(game,round,sessionSeed);
 renderInteractive('Look closely, then try.');window.scrollTo({top:0,behavior:'instant'});
}
function interactiveBody(){
 if(game===20){const token=current.tokens[Math.min(current.position,3)];return `<div class="sorting-trail" aria-label="${current.position} of 4 objects sorted">${current.tokens.map((o,i)=>`<span class="trail-token ${i<current.position?'sorted':''} ${i===current.position?'active-token':''}">${i<current.position?'✓':art(o)}</span>`).join('')}</div><div class="target">${art(token)}</div><div class="micro arrow-cue" aria-hidden="true">↓</div><div class="sort-homes">${current.homes.map((shape,i)=>`<button class="sort-home ${usedHint&&shape===token.shape?'hinted':''}" data-home="${i}" aria-label="Send object to home ${i+1}" ${answered?'disabled':''}><span class="home-roof" aria-hidden="true">⌂</span>${art({shape,color:1})}</button>`).join('')}</div>`;}
 if(game===21)return `<div class="pair-board">${current.cards.map((c,i)=>`<button class="pair-card ${current.selected===i?'selected':''} ${current.matched.includes(i)?'paired':''} ${current.wrong.includes(i)?'wrong':''} ${usedHint&&!current.matched.includes(i)&&current.selected!==null&&current.cards[current.selected].pair===c.pair?'hinted':''}" data-pair="${i}" aria-label="Picture ${i+1}${current.matched.includes(i)?', matched':''}" aria-pressed="${current.selected===i}" ${current.matched.includes(i)||answered?'disabled':''}>${art(c.o)}${current.matched.includes(i)?'<span class="pair-tick" aria-hidden="true">✓</span>':''}</button>`).join('')}</div><div class="micro">${current.matched.length/2} of 3 pairs found · All cards stay visible</div>`;
 if(game===22)return `<div class="compare-workbench"><div><span class="bench-label">MODEL</span><div class="bench-picture">${art(current.target)}</div></div><span class="workbench-link" aria-hidden="true">↔</span><div><span class="bench-label">YOUR MUSHROOM</span><div class="bench-picture built-picture">${art(current.built)}</div></div></div><fieldset class="part-picker"><legend>Choose a color</legend><div class="part-options">${colors.map((c,i)=>`<button class="color-option ${current.built.color===i?'selected':''} ${usedHint&&current.target.color===i?'hinted':''}" data-color="${i}" aria-label="${colorNames[i]}" aria-pressed="${current.built.color===i}" ${answered?'disabled':''}><span style="background:${c}"></span>${current.built.color===i?'<b aria-hidden="true">✓</b>':''}</button>`).join('')}</div></fieldset><fieldset class="part-picker"><legend>Choose the dots</legend><div class="part-options">${[1,2,3].map(i=>`<button class="part-option ${current.built.dots===i?'selected':''} ${usedHint&&current.target.dots===i?'hinted':''}" data-dots="${i}" aria-label="Dot pattern ${i}" aria-pressed="${current.built.dots===i}" ${answered?'disabled':''}>${art({shape:2,color:1,dots:i})}</button>`).join('')}</div></fieldset>`;
 if(game===23)return `<div class="compare-workbench"><div><span class="bench-label">MODEL</span><div class="bench-picture">${art(current.target)}</div></div><span class="workbench-link" aria-hidden="true">↔</span><div><span class="bench-label">YOUR LEAF</span><div class="bench-picture built-picture">${art(current.built)}</div></div></div><div class="turn-buttons"><button class="turn-button" data-turn="-1" aria-label="Turn leaf a quarter turn counterclockwise" ${answered?'disabled':''}><span aria-hidden="true">↶</span> Turn left</button><button class="turn-button" data-turn="1" aria-label="Turn leaf a quarter turn clockwise" ${answered?'disabled':''}><span aria-hidden="true">↷</span> Turn right</button></div>`;
 if(game===24)return `<span class="bench-label">LOOK AT THIS ROW</span><div class="scene-row model-row">${current.before.map(o=>`<div class="scene-tile">${art(o)}</div>`).join('')}</div><div class="micro arrow-cue" aria-hidden="true">↓</div><span class="bench-label">TAP THE ONE THAT CHANGED</span><div class="scene-row">${current.after.map((o,i)=>`<button class="scene-tile ${current.wrong===i?'wrong':''} ${usedHint&&i===current.changed?'hinted':''} ${answered&&i===current.changed?'correct':''}" data-changed="${i}" aria-label="Choose lower picture ${i+1}" ${answered?'disabled':''}>${art(o)}</button>`).join('')}</div>`;
}
function renderInteractive(message){
 const active=document.activeElement;let focusSelector=null;
 if(active){for(const key of ['home','pair','color','dots','turn','changed']){if(active.dataset&&active.dataset[key]!==undefined)focusSelector=`[data-${key}="${active.dataset[key]}"]`;}
 if(['interactive-hint','check-work'].includes(active.id))focusSelector='#'+active.id;}
 shell(`<span class="eyebrow">${courses[game][2].toUpperCase()}</span><h1>${courses[game][0]}</h1><p>${courses[game][3]}</p><div class="game-stage interactive-stage">${interactiveBody()}<div class="feedback" role="status" aria-live="polite">${message}</div><div class="game-controls"><button class="secondary" id="interactive-hint" ${answered?'hidden':''}>Show me a clue</button>${[22,23].includes(game)?`<button class="primary" id="check-work" ${answered?'hidden':''}>Check my ${game===22?'mushroom':'leaf'} ✓</button>`:''}<button class="primary" id="interactive-next" ${answered?'':'hidden'}>Next →</button></div></div><div class="play-top"><span class="micro">Round ${round+1} of 5</span><div class="round-dots" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i class="${i<round?'done':i===round?'current':''}"></i>`).join('')}</div><button class="back" id="interactive-example">See example ↗</button></div><div class="learning-note"><b>${interactiveDescriptions[game][0]}.</b> ${interactiveDescriptions[game][1]}</div>`,true);
 document.querySelectorAll('[data-home]').forEach(b=>b.onclick=()=>sortIntoHome(+b.dataset.home));
 document.querySelectorAll('[data-pair]').forEach(b=>b.onclick=()=>pairPicture(+b.dataset.pair));
 document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>changePart('color',+b.dataset.color));
 document.querySelectorAll('[data-dots]').forEach(b=>b.onclick=()=>changePart('dots',+b.dataset.dots));
 document.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>turnLeaf(+b.dataset.turn));
 document.querySelectorAll('[data-changed]').forEach(b=>b.onclick=()=>pickChanged(+b.dataset.changed));
 const check=document.querySelector('#check-work');if(check)check.onclick=checkWork;
 document.querySelector('#interactive-hint').onclick=interactiveHint;
 document.querySelector('#interactive-next').onclick=()=>{if(!answered)return;round++;round<5?interactivePlay():finish()};
 document.querySelector('#interactive-example').onclick=()=>{if(!answered)markInteractiveHint();const d=document.createElement('dialog');d.innerHTML=`<button class="close" aria-label="Close example">×</button><h2>${courses[game][0]}</h2><p>${interactiveDescriptions[game][2]}</p><div class="demo-row"><div class="demo-tile">${art({shape:game===22?2:1,color:1})}</div><span class="demo-arrow" aria-hidden="true">${game===23?'↶':'☝'}</span></div><p>Keep the model in view. You can take as long as you need.</p>`;document.body.append(d);d.querySelector('button').onclick=()=>{d.close();d.remove()};d.showModal()};
 if(focusSelector){const restored=document.querySelector(focusSelector);if(restored&&!restored.disabled)restored.focus();else if(game===21){const first=document.querySelector('.pair-card:not(:disabled)');if(first)first.focus();}}
}
function markInteractiveHint(){if(!usedHint){usedHint=true;hints++}}
function interactiveHint(){
 if(answered)return;markInteractiveHint();
 if(game===21&&current.selected===null){current.selected=current.cards.findIndex((_,i)=>!current.matched.includes(i));current.wrong=[];}
 if(game===23){current.built.dir=current.target.dir;renderInteractive('The leaves now face the same way. Compare them, then check.');return;}
 renderInteractive(game===22?'The outlined choices match the model. Try those parts.':game===21?'Compare the selected card with the outlined partner.':'Look at the outlined choice.');
}
function completeInteractiveRound(message){if(answered)return;answered=true;if(!hadError&&!usedHint)correct++;renderInteractive('✓ '+message);document.querySelector('#interactive-next').focus()}
function sortIntoHome(i){if(answered)return;if(current.homes[i]!==current.tokens[current.position].shape){hadError=true;renderInteractive('Compare the shape, even if the color is different.');return}current.position++;if(current.position===current.tokens.length){completeInteractiveRound('All four objects found their shape homes!');return}renderInteractive('✓ A shape match! Here comes another object.');}
function pairPicture(i){if(answered||current.matched.includes(i))return;current.wrong=[];if(current.selected===null){current.selected=i;renderInteractive('Now tap the identical partner.');return}if(current.selected===i){current.selected=null;renderInteractive('Choose any picture to start a pair.');return}const first=current.selected;current.selected=null;if(current.cards[first].pair!==current.cards[i].pair){hadError=true;current.wrong=[first,i];renderInteractive('Compare the color and shape. Try another pair.');return}current.matched.push(first,i);if(current.matched.length===current.cards.length){completeInteractiveRound('You found all three pairs!');return}renderInteractive('✓ A pair! Find another.');}
function changePart(key,value){if(answered)return;current.built[key]=value;renderInteractive('Your mushroom changed. Compare it with the model.');const b=document.querySelector(`[data-${key}="${value}"]`);if(b)b.focus()}
function turnLeaf(direction){if(answered)return;current.built.dir=(current.built.dir+direction+4)%4;renderInteractive('Compare the direction of the two leaves.');const b=document.querySelector(`[data-turn="${direction}"]`);if(b)b.focus()}
function checkWork(){if(answered)return;const matches=game===22?current.built.color===current.target.color&&current.built.dots===current.target.dots:current.built.dir===current.target.dir;if(matches){completeInteractiveRound(game===22?'You built a matching mushroom!':'The leaves face the same way!');return}hadError=true;renderInteractive(game===22?'Check the color and dots. Change a part, then try again.':'The leaves face different ways. Try another turn.');}
function pickChanged(i){if(answered)return;if(i===current.changed){completeInteractiveRound('You spotted the changed picture!');return}hadError=true;current.wrong=i;renderInteractive('That picture is the same. Compare each picture with the one above.');}

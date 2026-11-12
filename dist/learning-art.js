'use strict';
const learningInk='#355447';
function pictureIcon(id,variant=0){
 const green=['#72988a','#86a392','#638f7c'][variant%3],orange=['#d89565','#c78a63','#e2a776'][variant%3],gold='#e2bf63';let b='';
 const box=(x,y,w,h,fill,rx=7)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
 const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
 switch(id){
 case 'cup':case 'emptycup':case 'fullcup':b=box(25,32,54,63,'#e9dbc3')+'<path d="M79 43H91Q106 66 79 74" fill="none" stroke-width="7"/>';if(id==='fullcup')b+=box(31,43,42,43,'#8cb9c1',3);break;
 case 'pitcher':b='<path d="M30 22H79L72 95H25Z" fill="'+green+'"/><path d="M78 35H94Q109 59 75 69" fill="none" stroke-width="7"/><path d="M29 22L16 17V36" fill="'+green+'"/>';break;
 case 'ball':b=circle(60,60,39,gold)+'<path d="M23 47Q61 68 93 37M37 91Q59 56 47 23" fill="none"/>';break;
 case 'shoe':case 'boot':case 'cleanboot':b='<path d="M25 22H62V64Q78 70 97 77V94H22Z" fill="'+orange+'"/><path d="M23 83H96"/>';if(id==='boot')b+=circle(43,74,9,'#876a51')+circle(66,83,8,'#876a51');break;
 case 'brush':b=box(22,66,76,18,orange)+box(36,24,47,42,gold,2)+'<path d="M43 28V59M55 28V59M67 28V59M78 28V59"/>';break;
 case 'spoon':b='<ellipse cx="60" cy="34" rx="22" ry="26" fill="#bec6bb"/>'+box(54,52,12,53,'#bec6bb');break;
 case 'book':case 'drawing':case 'paper':case 'tornpaper':b='<path d="M14 28Q37 17 60 30Q82 17 106 28V95Q83 84 60 96Q38 84 14 95Z" fill="#f5e9ca"/><path d="M60 31V96M23 43L48 43M71 43H96M23 56H48M71 56H96"/>';if(id==='drawing')b+=circle(84,71,10,gold);if(id==='tornpaper')b+='<path d="M59 20L50 44L66 57L52 78L60 104" stroke="#b67554" stroke-width="6" fill="none"/>';break;
 case 'umbrella':b='<path d="M12 58Q60-15 108 58Q95 46 84 58Q72 47 60 58Q48 47 36 58Q24 47 12 58Z" fill="'+green+'"/><path d="M60 57V91Q60 111 42 98" fill="none" stroke-width="6"/>';break;
 case 'key':b=circle(41,39,23,gold)+circle(41,39,10,'#fffdf5')+'<path d="M56 55L97 96M81 80L92 69M92 91L103 80" stroke="#b49b55" stroke-width="12"/>';break;
 case 'coat':b='<path d="M42 20L24 28L8 65L27 74L36 52V104H84V52L93 74L112 65L96 28L78 20L60 37Z" fill="'+green+'"/><path d="M60 37V102M46 71H52M68 71H75"/>';break;
 case 'apple':b='<path d="M60 39Q24 12 17 53Q10 89 43 103Q53 107 60 100Q72 109 90 98Q118 78 103 45Q91 21 60 39Z" fill="'+orange+'"/><path d="M59 37L64 15"/><path d="M66 28Q83 7 93 20Q87 35 66 28" fill="'+green+'"/>';break;
 case 'car':case 'brokenwheel':b='<path d="M15 58L31 34H79L97 58H107V87H12V58Z" fill="'+orange+'"/>'+box(38,40,32,18,'#deece9',2)+circle(33,87,13,learningInk);if(id==='car')b+=circle(87,87,13,learningInk);else b+=circle(102,105,10,learningInk);break;
 case 'wheel':b=circle(60,60,40,learningInk)+circle(60,60,23,'#d6ddd0')+circle(60,60,7,gold);break;
 case 'bed':b=box(18,49,86,38,green)+box(23,39,32,23,'#f6eaca')+'<path d="M16 29V103M106 49V103M18 87H106" stroke-width="7"/>';break;
 case 'chair':b=box(33,17,56,45,green)+box(24,66,72,17,green)+'<path d="M32 80V108M87 80V108M38 58V68M84 58V68" stroke-width="7"/>';break;
 case 'hat':b='<path d="M30 75L40 24H78L90 75Z" fill="'+gold+'"/>'+box(12,76,96,17,gold)+'<path d="M33 66H88" stroke="'+orange+'" stroke-width="9"/>';break;
 case 'wateringcan':b=box(31,45,55,49,green)+'<path d="M34 52L13 33L6 43L31 77M84 51Q119 25 108 76L87 81" fill="none" stroke-width="9"/>';break;
 case 'scissors':b=circle(32,84,16,orange)+circle(83,84,16,orange)+'<path d="M43 73L87 14M72 73L29 14" stroke="#8f9d95" stroke-width="8"/>'+circle(58,57,6,gold);break;
 case 'clock':b=circle(60,60,42,'#f5e6bc')+'<path d="M60 28V61L82 75" fill="none" stroke-width="6"/>'+circle(60,60,4,learningInk);break;
 case 'basket':case 'fullbasket':b='<path d="M17 53H103L90 101H31Z" fill="'+orange+'"/><path d="M30 52Q60-6 91 52" fill="none" stroke-width="8"/><path d="M33 68H87M39 83H82M47 59V96M69 59V96" fill="none"/>';if(id==='fullbasket')b+=circle(41,48,15,gold)+circle(73,44,17,green);break;
 case 'flower':case 'sprout':case 'drypot':case 'seed':b='<path d="M35 79H86L78 110H44Z" fill="'+orange+'"/>';if(id==='flower'||id==='sprout')b+='<path d="M60 80V46M60 67Q28 43 31 66Q41 81 60 74M60 59Q84 36 88 56Q78 72 60 67" fill="'+green+'"/>';if(id==='flower')b+=[0,72,144,216,288].map(a=>`<ellipse cx="60" cy="24" rx="10" ry="18" fill="${gold}" transform="rotate(${a} 60 40)"/>`).join('')+circle(60,40,10,orange);if(id==='seed')b+=circle(60,70,6,gold);if(id==='drypot')b+='<path d="M45 70L57 60L70 70M50 45L55 29M77 45L82 29" fill="none"/>';break;
 case 'house':b='<path d="M14 55L60 14L106 55Z" fill="'+orange+'"/>'+box(26,55,69,53,'#eadab8',1)+box(53,75,21,33,green,2)+box(34,65,13,15,'#a1bdc1',1);break;
 case 'bridge':b='<path d="M8 78Q60 33 112 78V99Q60 56 8 99Z" fill="'+orange+'"/><path d="M12 77V38M108 77V38M12 47Q60 5 108 47" fill="none" stroke-width="5"/>';break;
 case 'water':case 'spill':b='<path d="M10 56Q28 38 46 55Q64 72 82 55Q99 38 111 56V98H10Z" fill="#91bac4"/><path d="M16 73Q30 59 44 74Q60 90 80 73Q95 59 106 74" fill="none" stroke="#f8fcfb"/>';break;
 case 'rain':b='<path d="M22 51Q7 27 37 24Q53-1 75 22Q109 17 106 51Z" fill="#a7bdc1"/><path d="M30 68L23 85M59 68L52 85M88 68L81 85M43 92L37 107M76 92L70 107" stroke="#7ba0af" stroke-width="6"/>';break;
 case 'snow':b='<path d="M60 12V108M18 35L102 85M18 85L102 35M45 20L60 35L76 20M45 100L60 85L76 100" stroke="#92b1c1" stroke-width="5"/>';break;
 case 'dark':b=box(10,10,100,100,'#55566b',12)+'<path d="M80 22Q43 59 88 83Q30 100 27 58Q23 20 80 22Z" fill="#e5d9b2"/>';break;
 case 'sun':b=circle(60,60,25,gold)+'<path d="M60 8V22M60 98V112M8 60H22M98 60H112M24 24L34 34M86 86L96 96M24 96L34 86M86 34L96 24" stroke="#cfac50" stroke-width="5"/>';break;
 case 'tree':b=box(53,60,16,49,'#aa8563')+circle(60,37,31,green)+circle(35,57,25,green)+circle(84,57,25,green);break;
 case 'ladder':b='<path d="M32 12V110M88 12V110M32 30H88M32 51H88M32 72H88M32 93H88" stroke="#ac8b61" stroke-width="8"/>';break;
 case 'kite':b='<path d="M60 9L95 48L60 85L25 48Z" fill="'+orange+'"/><path d="M60 10V85M25 48H95M60 85Q30 95 62 110" fill="none"/>';break;
 case 'box':case 'gift':case 'loosebox':b=box(22,39,78,66,'#d4b58b',3)+'<path d="M22 39L43 17L78 17L100 39M60 40V105" fill="none"/>';if(id==='gift')b+='<path d="M22 63H100M59 39Q26 16 43 9Q60 5 60 36Q63 2 82 12Q95 25 60 39" fill="none" stroke="'+orange+'" stroke-width="8"/>';break;
 case 'tape':b=circle(60,50,33,gold)+circle(60,50,16,'#fffdf6')+'<path d="M85 72L105 107H69L58 79" fill="'+gold+'"/>';break;
 case 'cloth':case 'blanket':b='<path d="M19 21L99 17L105 95L26 106Z" fill="'+green+'"/><path d="M36 25L41 100M55 22L60 99M75 21L81 97M23 43L100 37M24 66L102 59M26 87L103 80" stroke="#f7f4df"/>';break;
 case 'lamp':case 'flashlight':b='<path d="M37 18H84L103 61H18Z" fill="'+gold+'"/><path d="M60 62V100M35 103H86" fill="none" stroke-width="7"/>';break;
 case 'blocks':case 'tower':case 'fallenblocks':b=id==='tower'?box(24,82,73,23,orange)+box(35,55,51,24,gold)+box(46,27,29,25,green):box(10,77,32,27,orange)+box(52,80,29,24,gold)+`<rect x="72" y="40" width="29" height="27" rx="3" fill="${green}" transform="rotate(20 85 54)"/>`;break;
 case 'bowl':case 'emptybowl':case 'fullbowl':b='<path d="M14 51H106Q101 103 60 103Q19 103 14 51Z" fill="'+green+'"/>';if(id==='fullbowl')b+=[30,48,67,85].map((x,i)=>circle(x,45+(i%2)*7,9,gold)).join('');break;
 case 'bird':b='<ellipse cx="56" cy="68" rx="32" ry="26" fill="'+green+'"/>'+circle(77,42,20,green)+'<path d="M94 40L112 48L94 54M25 65L8 49V78" fill="'+gold+'"/>'+circle(83,38,3,learningInk)+'<path d="M44 93V110M69 94V110"/>';break;
 case 'grain':b=[25,48,72,95].map((x,i)=>`<ellipse cx="${x}" cy="${48+(i%2)*26}" rx="9" ry="15" fill="${gold}" transform="rotate(${i%2?25:-25} ${x} ${48+(i%2)*26})"/>`).join('');break;
 case 'carrot':b='<path d="M43 34L84 51L34 110Z" fill="'+orange+'"/><path d="M63 44L49 11M63 44L79 12M63 44L99 29" stroke="'+green+'" stroke-width="8"/>';break;
 case 'rock':case 'mud':b='<path d="M15 87L25 42L66 24L103 56L110 95Z" fill="#a39d88"/>';break;
 case 'shovel':b='<path d="M49 12H74V34H49ZM61 34V80" fill="none" stroke-width="7"/><path d="M35 79H88Q91 108 61 114Q33 107 35 79Z" fill="'+green+'"/>';break;
 case 'clip':b='<path d="M82 33L45 86Q24 111 16 89Q11 80 22 65L62 10Q83-7 96 13Q101 24 91 38L52 92" fill="none" stroke="#8a9e97" stroke-width="8"/>';break;
 case 'wind':b='<path d="M10 35H83Q109 35 96 17Q85 8 76 20M10 58H100M10 81H75Q100 81 91 102Q82 113 72 102" fill="none" stroke="#91aeb1" stroke-width="6"/>';break;
 case 'beads':b=[25,60,95].map((x,i)=>circle(x,45+(i%2)*30,14,[orange,gold,green][i])+circle(x,45+(i%2)*30,4,'#fffdf8')).join('');break;
 case 'tray':b=box(10,32,100,65,green,12)+box(20,42,80,43,'#e8eadc',8);break;
 case 'door':b=box(25,10,73,104,'#bd986e',2)+circle(80,67,5,gold);break;
 case 'lock':b=box(25,52,73,56,gold)+'<path d="M39 53V30Q60-7 84 30V53" fill="none" stroke-width="10"/>';break;
 case 'hands':b='<path d="M24 96V55Q20 32 32 36L41 57V18Q47 4 52 20V49V12Q58 1 64 14V49V18Q72 9 75 23V54L84 29Q95 23 93 41L86 81Q83 105 62 108Z" fill="#dfb28e"/>';break;
 default:b=circle(60,60,37,green)+circle(60,60,18,gold);
 }
 let body=`<g stroke="${learningInk}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${b}</g>`;
 if(variant===3)body=body.replace(/fill="(?!none)[^"]*"/g,'fill="#fffdf6"');
 if(variant===4)body=body.replace(/fill="(?!none)[^"]*"/g,`fill="${learningInk}"`);
 return `<svg viewBox="0 0 120 120" aria-hidden="true">${body}</svg>`;
}
function learnPicture(p,variant=0){
 if(typeof p==='string')return pictureIcon(p,variant);
 if(p.scene!==undefined)return routinePicture(p.scene,p.stage,variant);
 if(p.story!==undefined)return storyPicture(p.story,p.stage,variant);
 if(p.location)return locationPicture(p.location,p.object,variant);
 return pictureIcon(p.icon,variant);
}
function iconGroup(id,x,y,w=80,variant=0){const image=pictureIcon(id,variant),view=image.match(/viewBox="([^"]+)"/)?.[1]||'0 0 120 120';return `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="${view}">${svgBody(image)}</svg>`}
function character(x=22,y=87,happy=true){return `<g transform="translate(${x} ${y})"><ellipse cx="30" cy="58" rx="25" ry="28" fill="#d6aa87"/><circle cx="30" cy="22" r="23" fill="#e8c5a4"/><circle cx="12" cy="4" r="9" fill="#e8c5a4"/><circle cx="48" cy="4" r="9" fill="#e8c5a4"/><circle cx="22" cy="20" r="2.5" fill="#355447"/><circle cx="38" cy="20" r="2.5" fill="#355447"/><path d="${happy?'M22 29Q30 38 38 29':'M22 35Q30 27 38 35'}" stroke="#355447" stroke-width="2" fill="none"/></g>`}
function sceneFrame(body){return `<svg viewBox="0 0 240 180" aria-hidden="true"><rect x="0" y="0" width="240" height="180" rx="17" fill="#f2f4e8"/><path d="M0 147H240" stroke="#d7dfc8" stroke-width="2"/>${body}</svg>`}
function routinePicture(index,stage,v=0){
 const d=eventRoutines[index],step=d.steps[stage];let body='';
 if(d.id==='plant'){body=iconGroup(stage===0?'seed':stage===1?'wateringcan':'sprout',72,48,105,v);if(stage===1)body+=iconGroup('drypot',120,88,65,v);}
 else if(d.id==='tower'){body=iconGroup(stage===0?'blocks':stage===1?'tower':'fallenblocks',65,40,115,v);}
 else if(d.id==='cup'){body=iconGroup(stage===0?'emptycup':'fullcup',78,57,95,v);if(stage===1)body+=iconGroup('pitcher',20,10,85,v);if(stage===2)body+=character(5,40);}
 else if(d.id==='shoes'){body=iconGroup(stage===0?'boot':stage===1?'brush':'cleanboot',70,46,110,v);if(stage===1)body+=iconGroup('boot',135,94,60,v);}
 else if(d.id==='gift'){body=iconGroup(stage===0?'loosebox':stage===1?'tape':'gift',65,40,115,v);if(stage===1)body+=iconGroup('loosebox',135,83,70,v);}
 else if(d.id==='bird'){body=iconGroup(stage===0?'emptybowl':'fullbowl',75,64,100,v);if(stage===1)body+=iconGroup('grain',25,15,75,v);if(stage===2)body+=iconGroup('bird',15,38,85,v);}
 else if(d.id==='spill'){body=iconGroup(stage===0?'spill':stage===1?'cloth':'tray',65,45,115,v);if(stage===1)body+=iconGroup('spill',135,95,60,v);}
 else if(d.id==='car'){body=iconGroup(stage===0?'brokenwheel':'car',65,48,115,v);if(stage===1)body+=iconGroup('wheel',15,82,65,v);if(stage===2)body+='<path d="M28 89H55M18 106H45" stroke="#96aa91" stroke-width="4"/>';}
 else {body=iconGroup(step.icon,65,39,115,v);if(step.with)body+=iconGroup(step.with,147,95,65,v);if(step.person)body+=character(8,57,stage===2);}
 // Each action frame shows the tool touching its target, with supported final objects.
 const pot='<path d="M89 109H151L142 151H98Z" fill="#cf946b" stroke="#355447" stroke-width="3"/><ellipse cx="120" cy="109" rx="31" ry="7" fill="#886545"/>';
 const watered=iconGroup('wateringcan',121,20,92,v)+pot+'<path d="M130 52Q119 70 119 103M139 58Q133 80 130 104" fill="none" stroke="#80b9c9" stroke-width="4" stroke-dasharray="6 5"/>';
 if(d.id==='plant')body=stage===0?pot+'<ellipse cx="120" cy="107" rx="6" ry="4" fill="#ddb653"/>':stage===1?watered:iconGroup('sprout',72,48,105,v);
 if(d.id==='flower'&&stage===1)body=watered;
 if(d.id==='cup'&&stage===1)body=iconGroup('fullcup',66,65,95,v)+'<g transform="rotate(-25 170 50)">'+iconGroup('pitcher',139,9,75,v)+'</g><path d="M140 32Q112 48 113 92" stroke="#8cb9c1" stroke-width="5" fill="none"/>';
 if(d.id==='shoes'&&stage===1)body=iconGroup('boot',105,65,95,v)+iconGroup('brush',71,77,83,v);
 if(d.id==='gift'&&stage===1)body=iconGroup('loosebox',65,40,115,v)+iconGroup('tape',132,55,54,v);
 if(d.id==='bird'&&stage===2)body=iconGroup('fullbowl',112,66,94,v)+iconGroup('bird',30,65,85,v);
 if(d.id==='car'&&stage===1)body=iconGroup('car',65,48,115,v)+iconGroup('wheel',135,118,26,v);
 if(d.id==='dress'&&stage>0){body='<g transform="translate(48 40) scale(.66)">'+friendlyAnimal('bear',stage===2?'hold':'stand').replaceAll(friendlyPalette.bear.shirt,'#72988a')+'</g>';body+='<path d="M86 102V128M77 110h5M91 110h5" stroke="#355447" stroke-width="2"/>';if(stage===2)body+=iconGroup('umbrella',49,5,137,v);}
 if(d.id==='wash'){body=iconGroup('hands',65,39,115,v);if(stage===0)body+='<path d="M111 117l13 5M129 101l7 6M111 92l5 6" stroke="#967153" stroke-width="7" stroke-linecap="round"/>';if(stage===1)body+='<path d="M105 14v66M122 20v59M140 12v67" stroke="#89bdca" stroke-width="4" stroke-dasharray="7 6"/>';if(stage===2)body+=iconGroup('cloth',108,91,67,v);}
 if(d.id==='picnic'&&stage===1)body=iconGroup('basket',67,46,116,v)+iconGroup('apple',97,65,53,v)+'<path d="M84 112H166L155 146H95Z" fill="#c78a63" stroke="#355447" stroke-width="2"/><path d="M92 123h64M98 135h52" stroke="#f0d1a0" stroke-width="3"/>';
 if(d.id==='bedtime'&&stage>0){body=friendlyBedScene('bear',v);if(stage===2)body+=iconGroup('clock',174,15,49,v);}
 if(d.id==='draw'&&stage===1)body=iconGroup('paper',65,39,115,v)+'<path d="M100 112q21-12 38 0" stroke="#7e9b73" stroke-width="5" fill="none"/>'+iconGroup('paintbrush',118,48,84,v);
 if(d.id==='door'&&stage===1)body=iconGroup('lock',85,49,102,v)+'<g transform="rotate(-30 119 107)">'+iconGroup('key',58,61,80,v)+'</g>';
 if(d.id==='kite'&&stage===2)body=iconGroup('tree',92,39,123,v)+iconGroup('kite',88,25,80,v);
 if(d.id==='snack'&&stage===1)body=iconGroup('apple',65,45,110,v)+'<path d="M109 10v48M128 14v43M145 9v48" stroke="#89bdca" stroke-width="4" stroke-dasharray="7 5"/>';
 if(d.id==='snack'&&stage===2)body=iconGroup('apple',84,66,76,v)+iconGroup('bowl',65,70,115,v);
 if(d.id==='tidy'&&stage===1)body=iconGroup('basket',65,42,120,v)+iconGroup('blocks',85,61,77,v)+'<path d="M82 111H168L155 147H95Z" fill="#c78a63" stroke="#355447" stroke-width="2"/><path d="M94 123h63M99 136h51" stroke="#f0d1a0" stroke-width="3"/>';
 if(d.id==='repair'&&stage===1)body=iconGroup('tornpaper',65,39,115,v)+'<path d="M106 96L137 96M106 125H136" stroke="#e4c77d" stroke-width="11" opacity=".9"/>';
 if(d.id==='sunny'&&stage===2)body=character(60,59,true)+iconGroup('hat',54,20,74,v)+iconGroup('basket',139,97,57,v);
 return sceneFrame(body);
}
function storyPicture(index,stage,v=0){
 const d=pictureStories[index];let b=character(6,75,stage===3);
 if(stage===0){b+=`<path d="M74 76L87 59" stroke="#b4bfaa" stroke-width="3"/><ellipse cx="141" cy="45" rx="46" ry="39" fill="#fffdf7" stroke="#d5ddcb"/>`+iconGroup(d.goal,107,10,69,v);}
 if(stage===1){b+=iconGroup(d.obstacle,88,57,98,v)+iconGroup(d.goal,177,16,50,v);}
 if(stage===2){b+=iconGroup(d.tool,83,40,105,v)+iconGroup(d.obstacle,178,91,52,v);}
 if(stage===3){b+=iconGroup(d.outcome,93,45,107,v)+'<path d="M190 22L193 33L204 36L193 39L190 50L187 39L176 36L187 33Z" fill="#d9b85b"/>';}
 if(stage===2){
  const routine={0:1,4:2,9:13,10:5,11:4,12:18,13:6,15:7,19:11}[index];
  if(routine!==undefined)return routinePicture(routine,1,v);
  if(index===1)b=character(6,75,false)+'<path d="M78 124H226V159H78Z" fill="#91bac4"/>'+iconGroup('bridge',77,47,143,v)+iconGroup('carrot',201,83,35,v);
  if(index===2)b=character(6,75,false)+iconGroup('basket',107,81,82,v)+iconGroup('umbrella',80,9,137,v)+iconGroup('rain',178,40,51,v);
  if(index===3)b=character(6,75,false)+iconGroup('box',128,71,86,v)+'<path d="M105 88L183 91L162 126Z" fill="#f3df98" opacity=".65"/>'+iconGroup('flashlight',70,58,88,v);
  if(index===5)b=character(6,75,false)+iconGroup('tower',92,39,115,v)+iconGroup('blocks',165,105,55,v);
  if(index===6)b=character(6,75,false)+iconGroup('tree',128,32,119,v)+iconGroup('kite',147,19,62,v)+'<g transform="rotate(20 132 101)">'+iconGroup('ladder',94,51,102,v)+'</g>';
  if(index===7)b='<g transform="translate(88 51) scale(.6)">'+friendlyAnimal('bear').replaceAll(friendlyPalette.bear.shirt,'#72988a')+'</g>'+iconGroup('snow',180,66,45,v);
  if(index===8)b=character(6,75,false)+'<path d="M155 52L94 147H215Z" fill="#f1df9e" opacity=".55"/>'+'<path d="M143 95H220M150 96V151M213 96V151" stroke="#ac8b61" stroke-width="5" fill="none"/>'+iconGroup('book',103,92,77,v)+iconGroup('lamp',136,20,82,v);
  if(index===14)b=character(6,75,false)+iconGroup('hat',0,28,74,v)+iconGroup('sun',143,30,78,v);
  if(index===16)b=character(6,75,false)+iconGroup('rock',142,110,67,v)+iconGroup('shovel',104,54,98,v);
  if(index===17)b=character(6,75,false)+iconGroup('tray',88,62,132,v)+iconGroup('beads',114,86,83,v);
  if(index===18)b=character(6,75,false)+iconGroup('book',97,47,115,v)+iconGroup('clip',164,47,48,v);
 }
 if(stage===3&&index===19)b=friendlyBedScene('bear',v);
 return sceneFrame(b);
}
function locationPicture(location,object,v=0){let b='';
 const scenes={kitchen:['cup','spoon'],garden:['flower','tree'],bedroom:['bed','coat'],outside:['sun','tree'],bathroom:['hands','brush'],playroom:['blocks','ball'],desk:['book','paper'],doorway:['door','shoe']};
 const icons=scenes[location]||['house','basket'];b+=iconGroup(icons[0],12,35,95,v)+iconGroup(icons[1],128,60,90,v);if(object)b+=iconGroup(object,80,106,58,v);return sceneFrame(b);
}

(function(root){
 'use strict';
 const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v),integers=v=>object(v)&&Object.values(v).every(n=>Number.isSafeInteger(n)&&n>=0),map=v=>object(v)&&Object.values(v).every(object),nested=v=>object(v)&&Object.values(v).every(map);
 const safe=v=>{let nodes=0;function walk(x,depth){if(++nodes>50000||depth>14)return false;if(x===null||typeof x==='boolean')return true;if(typeof x==='number')return Number.isFinite(x);if(typeof x==='string')return x.length<=3000000;if(Array.isArray(x))return x.length<=10000&&x.every(y=>walk(y,depth+1));if(object(x))return Object.entries(x).every(([k,y])=>!['__proto__','constructor','prototype'].includes(k)&&walk(y,depth+1));return false;}return walk(v,0);};
 const notes=v=>map(v)&&Object.values(v).every(n=>(!('supports'in n)||Array.isArray(n.supports)&&n.supports.every(i=>Number.isInteger(i)&&i>=0&&i<5))&&(!('activities'in n)||object(n.activities)&&Object.values(n.activities).every(x=>typeof x==='boolean'))&&(!('readingPractice'in n)||map(n.readingPractice))&&(!('activityVersions'in n)||integers(n.activityVersions)));
 const definitions={
  'spotmatch-v1':{group:'practice',check:map},'spotmatch-learning-v1':{group:'practice',check:nested},'spotmatch-support-v1':{group:'practice',check:nested},
  'spotmatch-calm-v1':{group:'practice',check:map},'spotmatch-focus-v1':{group:'practice',check:map},'spotmatch-playroom-v1':{group:'practice',check:map},'spotmatch-world-v1':{group:'practice',check:map},
  'spotmatch-course-notes-v1':{group:'courses',check:notes},'spotmatch-practice-backup-v1':{group:'internal',check:notes},
  'spotmatch-comfort':{group:'settings',check:v=>typeof v==='boolean'},
  'spotmatch-answer-pace':{group:'settings',raw:true,check:v=>['manual','quick','auto','automatic'].includes(v)},'spotmatch-course-flow':{group:'settings',raw:true,check:v=>['manual','auto'].includes(v)},
  'spotmatch-word-play-v1':{group:'settings',check:v=>object(v)&&['plain','letters','syllables'].includes(v.ink)&&[2,3].includes(v.choices)},
  'spotmatch-reading-display-v1':{group:'settings',check:v=>object(v)&&typeof v.colour==='boolean'},
  'spotmatch-vocabulary-saved-v1':{group:'collection',check:v=>Array.isArray(v)&&v.every(id=>typeof id==='string'&&id.length<150)},
  'spotmatch-picture-visits':{group:'rotation',check:integers},'spotmatch-word-visits-v1':{group:'rotation',check:integers},
  'spotmatch-last-course-v1':{group:'resume',check:v=>object(v)&&typeof v.courseId==='string'&&(v.index===null||Number.isInteger(v.index)&&v.index>=0&&v.index<10000)},
  'spotmatch-device-backup-v1':{group:'internal',check:object},
  'spotmatch-direct-objects-v1':{group:'internal',raw:true,check:v=>v==='true'},
  'spotmatch-editor-review-v1':{group:'review',check:map}
 };
 function valid(key,raw){if(raw===null)return true;const d=definitions[key];if(!d)return false;if(typeof raw!=='string'||raw.length>3000000)return false;try{const v=d.raw?raw:JSON.parse(raw);return safe(v)&&d.check(v);}catch{return false;}}
 function create(provider){const cache=new Map(),dirty=new Map(),damaged=new Map(),listeners=new Set();let available=true;
 const recoveryKey='spotmatch-recovery-v1';
 function emit(){for(const f of listeners)try{f(status());}catch{}}
 try{const x=JSON.parse(provider().getItem(recoveryKey)||'{}');if(object(x)&&safe(x))for(const [k,v]of Object.entries(x))if(definitions[k]&&typeof v==='string')damaged.set(k,v);}catch{available=false;}
 function status(){return{persistent:available&&dirty.size===0,pending:dirty.size,damaged:[...damaged.keys()]};}
 function preserve(key,raw){if(damaged.has(key))return;damaged.set(key,raw);try{let old={};const stored=provider().getItem(recoveryKey);if(stored){const x=JSON.parse(stored);if(object(x)&&safe(x))old=x;}old[key]=raw;provider().setItem(recoveryKey,JSON.stringify(old));}catch{}emit();}
 function getItem(key){if(dirty.has(key))return dirty.get(key);let raw;try{raw=provider().getItem(key);available=true;}catch{available=false;emit();return cache.get(key)??null;}if(!valid(key,raw)){preserve(key,raw);return null;}cache.set(key,raw);return raw;}
 function setItem(key,value){const raw=String(value);if(!valid(key,raw))throw Error('Invalid device data: '+key);getItem(key);cache.set(key,raw);try{provider().setItem(key,raw);dirty.delete(key);available=true;}catch{dirty.set(key,raw);available=false;}emit();return status().persistent;}
 function removeItem(key){cache.set(key,null);try{provider().removeItem(key);dirty.delete(key);available=true;}catch{dirty.set(key,null);available=false;}emit();}
 function snapshot(){const out={};for(const k of Object.keys(definitions)){const raw=getItem(k);if(raw!==null)out[k]=raw;}return out;}
 function commit(entries){for(const [k,v]of Object.entries(entries))if(!valid(k,v))throw Error('Invalid device data: '+k);const old={};try{const storage=provider();for(const k of Object.keys(entries))old[k]=storage.getItem(k);for(const [k,v]of Object.entries(entries)){if(v===null)storage.removeItem(k);else storage.setItem(k,v);}for(const [k,v]of Object.entries(entries)){cache.set(k,v);dirty.delete(k);}available=true;}catch{try{const storage=provider();for(const[k,v]of Object.entries(old)){if(v===null)storage.removeItem(k);else storage.setItem(k,v);}}catch{}for(const[k,v]of Object.entries(entries)){cache.set(k,v);dirty.set(k,v);}available=false;}emit();return status();}
 function retry(){if(!dirty.size){getItem('spotmatch-comfort');emit();return status();}return commit(Object.fromEntries(dirty));}
 function recovery(){let old={};try{const x=JSON.parse(provider().getItem(recoveryKey)||'{}');if(object(x)&&safe(x))old=x;}catch{}return{...old,...Object.fromEntries(damaged)};}
 return{getItem,setItem,removeItem,snapshot,commit,retry,recovery,status,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
 }
 const api=create(()=>root.localStorage);api.create=create;api.valid=valid;api.definitions=definitions;api.safe=safe;root.AppStorage=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);

(function(root){
'use strict';
const jobs=[{tool:'spoon',job:'soup',prompt:'Mix the soup. Which tool will help?'},{tool:'paintbrush',job:'paint',prompt:'Paint a picture. Which tool will help?'},{tool:'key',job:'lock',prompt:'Open the lock. Which tool will help?'},{tool:'watering-can',job:'plant',prompt:'Water the plant. Which tool will help?'}];
const spaces=[{object:'ball',place:'in'},{object:'block',place:'on'},{object:'ball',place:'beside'},{object:'block',place:'in'}];
const routes=[[['bag','cat'],['cup','dog']],[['cup','pig'],['bag','cat']],[['bag','dog'],['cup','pig']],[['cup','cat'],['bag','pig']]];
const neighbors=[[1],[0,2,3],[1],[1]],recipients=['depot','cat','dog','pig'];
function create(mode,round=0){return{mode,round,selected:null,message:'',done:false,paused:false,loaded:[],delivered:[],position:0,help:false};}
function task(s){return s.mode==='tools'?jobs[s.round]:s.mode==='space'?spaces[s.round]:routes[s.round];}
function reduce(state,a){const s=structuredClone(state);if(s.paused||s.done)return s;const fail=message=>({...s,message});if(a.type==='hint'){s.message=String(a.value);return s;}if(a.type==='select'){s.selected=a.value;return s;}if(a.type==='model'){s.help=true;return s;}
 if(s.mode==='tools'&&a.type==='use'){if(a.value!==task(s).tool)return fail('That tool stays on the tray. Model what each tool does, then try another.');s.done=true;s.message='That tool did the job!';}
 if(s.mode==='space'&&a.type==='place'){if(a.value!==task(s).place)return fail('Try the position with a real object first. Your object stays ready to move.');s.done=true;s.message='You made the position happen!';}
 if(s.mode==='route'){
  const plan=task(s),next=plan[s.delivered.length];
  if(a.type==='load'){if(s.position!==0)return fail('Return to the depot to pick up a parcel.');if(!plan.some(([p])=>p===a.value)||s.loaded.includes(a.value)||s.delivered.some(x=>x[0]===a.value))return s;s.loaded.push(a.value);s.selected=null;s.message='Loaded! Drive along a connected road.';}
  if(a.type==='drive'){const n=Number(a.value);if(!neighbors[s.position].includes(n))return fail('Use a road connected to the van’s current stop.');s.position=n;s.selected=null;s.message=n===0?'Back at the depot. You can load another parcel.':'Parked! Choose a loaded parcel and give it to this stop.';}
  if(a.type==='deliver'){if(s.position!==Number(a.stop))return fail('Drive the van to that stop before unloading.');if(!s.loaded.includes(a.value))return fail('Load this parcel into the van at the depot first.');if(a.value!==next[0]||recipients[s.position]!==next[1])return fail('Compare the next line of the delivery plan. Earlier deliveries stay in place.');s.loaded=s.loaded.filter(x=>x!==a.value);s.delivered.push(next);s.selected=null;s.message='Delivered! Follow the next line of the plan.';if(s.delivered.length===plan.length){s.done=true;s.message='Both parcels reached their homes!';}}
 }return s;}
const api={create,task,reduce,jobs,spaces,routes,neighbors,recipients};root.StudioMissionCore=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);

import type { Gate, Point, Run } from "./types";
const rad=(x:number)=>x*Math.PI/180;
export function distanceM(a:Point,b:Point){const R=6371000,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
export function crossedGate(previous:Point,current:Point,gate:Gate,radius=22){return distanceM(current,gate)<=radius && distanceM(previous,gate)>radius}
export function insideGate(point:Point,gate:Gate,radius=22){return distanceM(point,gate)<=radius}
export type RaceState={phase:"ready"|"racing"|"complete";nextCheckpoint:number;startArmed?:boolean;checkpointEntered?:boolean;startedAt?:number;elapsedMs?:number;sequence:string[]};
export function progressRace(state:RaceState,current:Point,start:Gate,checkpoints:Gate[],now:number):RaceState{
 const atStart=insideGate(current,start);
 if(state.phase==="ready"){
  if(!state.startArmed&&atStart)return {...state,startArmed:true};
  if(state.startArmed&&!atStart)return {phase:"racing",nextCheckpoint:0,startedAt:now,sequence:[start.id]};
  return state;
 }
 if(state.phase!=="racing")return state;
 const next=checkpoints[state.nextCheckpoint];
 if(next){
  const atCheckpoint=insideGate(current,next);
  if(!state.checkpointEntered&&atCheckpoint)return {...state,checkpointEntered:true};
  if(state.checkpointEntered&&!atCheckpoint)return {...state,nextCheckpoint:state.nextCheckpoint+1,checkpointEntered:false,sequence:[...state.sequence,next.id]};
  return state;
 }
 if(state.startedAt&&atStart)return {phase:"complete",nextCheckpoint:state.nextCheckpoint,startedAt:state.startedAt,elapsedMs:now-state.startedAt,sequence:[...state.sequence,start.id]};
 return state;
}
export const formatTime=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}.${String(Math.floor(ms%1000/10)).padStart(2,"0")}`;
export function isPersonalBest(oldMs:number|undefined,newMs:number){return oldMs===undefined||newMs<oldMs}
export function validateRun(run:Run,gateIds:string[]){if(!run.displayName.trim()||run.displayName.length>32||!Number.isFinite(run.elapsedMs)||run.elapsedMs<10_000||run.elapsedMs>7_200_000)return "Invalid elapsed time or name.";if(!Number.isFinite(run.accuracyM)||run.accuracyM<0)return "Invalid GPS accuracy.";if(!Number.isFinite(run.maxSpeedMps)||run.maxSpeedMps>85||run.maxSpeedMps<0)return "Speed metric is implausible.";if(run.gateSequence.join("|")!==gateIds.join("|"))return "The required gates were not crossed in order.";return null}

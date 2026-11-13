import { randomInt, randomUUID } from "node:crypto";
import { PLAYERS,TEAM_ORDER,TEAM_ICONS,BOARD_END,FIELD_TYPES,MISSIONS,SECRET_MISSIONS,CHAOS_CARDS,SONGS } from "./config.mjs";
import { STATE_KEY,LAST_KEY,mailKey } from "./store.mjs";

export const initialState=()=>({version:2,started:false,gameId:null,teams:null,scores:{Rentiere:0,Glühwein:0,Lametta:0},positions:{Rentiere:1,Glühwein:1,Lametta:1},turnIndex:0,pending:null,lastMove:null,moveCounter:0,used:{mission:[],secret:[],chaos:[],song:[]},drawOrder:{mission:[],secret:[],chaos:[],song:[]},modifiers:{nextMissionMultiplier:1,nextMissionBonus:0,nextSongMultiplier:1,redrawAvailable:false},history:[],final:{triggered:false,starter:null,remaining:[],complete:false,winners:[]}});
export async function getState(r){let s=await r.get(STATE_KEY);if(!s){s=initialState();await r.set(STATE_KEY,s)}return normalize(s)}
export async function saveState(r,s){await r.set(STATE_KEY,s);return s}
function normalize(s){s.positions||={Rentiere:1,Glühwein:1,Lametta:1};s.used||={mission:[],secret:[],chaos:[],song:[]};s.drawOrder||={mission:[],secret:[],chaos:[],song:[]};s.modifiers||={nextMissionMultiplier:1,nextMissionBonus:0,nextSongMultiplier:1,redrawAvailable:false};s.final||={triggered:false,starter:null,remaining:[],complete:false,winners:[]};return s}
export function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
export function teamOf(s,name){return s.teams?TEAM_ORDER.find(t=>(s.teams[t]||[]).includes(name))||null:null}
export function currentTeam(s){return TEAM_ORDER[s.turnIndex%TEAM_ORDER.length]}
export function publicState(s,player=null){return {...s,me:player?{name:player,team:teamOf(s,player)}:null,board:{end:BOARD_END,fields:FIELD_TYPES},teamIcons:TEAM_ICONS}}
export async function startGame(r,s){
  const people=shuffle(PLAYERS),teams={Rentiere:[],Glühwein:[],Lametta:[]};people.forEach((p,i)=>teams[TEAM_ORDER[i%3]].push(p));
  const fresh=initialState();fresh.started=true;fresh.gameId=randomUUID();fresh.teams=teams;
  await r.set(STATE_KEY,fresh);return fresh;
}
function poolFor(type){return type==="mission"?MISSIONS:type==="secret"?SECRET_MISSIONS:type==="chaos"?CHAOS_CARDS:SONGS}
async function drawRandom(r,s,type){
  const full=poolFor(type); let pool=full.filter(x=>!s.used[type].includes(x.id));
  if(!pool.length){const recent=s.drawOrder[type].slice(-Math.min(5,full.length-1));s.used[type]=[];pool=full.filter(x=>!recent.includes(x.id));if(!pool.length)pool=[...full]}
  const previous=await r.get(LAST_KEY)||{};
  if(s.drawOrder[type].length===0 && previous.first?.[type] && pool.length>1){const filtered=pool.filter(x=>x.id!==previous.first[type]);if(filtered.length)pool=filtered}
  const item=pool[randomInt(pool.length)];
  s.used[type].push(item.id);s.drawOrder[type].push(item.id);return item;
}
function addHistory(s,e){s.history.unshift({at:new Date().toISOString(),...e});s.history=s.history.slice(0,120)}
function applyChaos(s,card){let effect=card.text,changes=[];const teams=s.teams;
  if(card.type==="swap_two") {const [a,b]=shuffle(TEAM_ORDER).slice(0,2);const ia=randomInt(teams[a].length),ib=randomInt(teams[b].length);const pa=teams[a][ia],pb=teams[b][ib];teams[a][ia]=pb;teams[b][ib]=pa;changes=[{player:pa,from:a,to:b},{player:pb,from:b,to:a}];effect=`${pa}: ${a} → ${b} · ${pb}: ${b} → ${a}`}
  else if(card.type==="rotate_three"){const picks=TEAM_ORDER.map(t=>({t,i:randomInt(teams[t].length)}));const vals=picks.map(x=>teams[x.t][x.i]);picks.forEach((x,i)=>teams[x.t][x.i]=vals[(i+2)%3]);changes=vals.map((p,i)=>({player:p,from:TEAM_ORDER[i],to:TEAM_ORDER[(i+1)%3]}));effect=changes.map(x=>`${x.player}: ${x.from} → ${x.to}`).join(" · ")}
  else if(card.type==="all_bonus"){TEAM_ORDER.forEach(t=>s.scores[t]+=2);effect="Jedes Team erhält +2 Punkte."}
  else if(card.type==="leader_tax"){const m=Math.max(...TEAM_ORDER.map(t=>s.scores[t]));const a=TEAM_ORDER.filter(t=>s.scores[t]===m);const t=a[randomInt(a.length)];s.scores[t]=Math.max(0,s.scores[t]-2);effect=`${t} verliert 2 Punkte.`}
  else if(card.type==="underdog_bonus"){const m=Math.min(...TEAM_ORDER.map(t=>s.scores[t]));const a=TEAM_ORDER.filter(t=>s.scores[t]===m);const t=a[randomInt(a.length)];s.scores[t]+=3;effect=`${t} erhält +3 Punkte.`}
  else if(card.type==="next_double"){s.modifiers.nextMissionMultiplier=2}
  else if(card.type==="next_bonus"){s.modifiers.nextMissionBonus=2}
  else if(card.type==="song_double"){s.modifiers.nextSongMultiplier=2}
  else if(card.type==="redraw"){s.modifiers.redrawAvailable=true}
  return {effect,changes};
}
function maybeTriggerFinal(s,team){if(!s.final.triggered && s.positions[team]>=BOARD_END){s.final.triggered=true;s.final.starter=team;s.final.remaining=TEAM_ORDER.filter(t=>t!==team)}}
function finishIfDone(s){if(s.final.triggered && s.final.remaining.length===0){s.final.complete=true;const max=Math.max(...TEAM_ORDER.map(t=>s.scores[t]));s.final.winners=TEAM_ORDER.filter(t=>s.scores[t]===max)}}
function endTurn(s,team){if(s.final.triggered && team!==s.final.starter){s.final.remaining=s.final.remaining.filter(t=>t!==team)}finishIfDone(s);if(!s.final.complete)s.turnIndex=(s.turnIndex+1)%3}
export async function rollInto(r,s,player){
  if(!s.started)throw new Error("NOT_STARTED");if(s.final.complete)throw new Error("GAME_OVER");if(s.pending)throw new Error("PENDING");const team=currentTeam(s);if(teamOf(s,player)!==team)throw new Error("NOT_YOUR_TURN");
  const roll=randomInt(1,7),from=s.positions[team],to=Math.min(BOARD_END,from+roll);s.positions[team]=to;s.moveCounter++;s.lastMove={id:s.moveCounter,team,roll,from,to,at:new Date().toISOString()};maybeTriggerFinal(s,team);const kind=FIELD_TYPES[to]||"free";
  if(kind==="mission"){const m=await drawRandom(r,s,"mission");const members=s.teams[team]||[];const performer=m.type==="solo"?members[randomInt(members.length)]:null;s.pending={id:randomUUID(),kind:"mission",team,item:m,performer,field:to}}
  else if(kind==="song"){const song=await drawRandom(r,s,"song");s.pending={id:randomUUID(),kind:"song",team,item:song,field:to}}
  else if(kind==="chaos"){const card=await drawRandom(r,s,"chaos");const applied=applyChaos(s,card);s.pending={id:randomUUID(),kind:"chaos",team,item:card,effect:applied.effect,changes:applied.changes,field:to}}
  else if(kind==="secret"){const secret=await drawRandom(r,s,"secret");const members=s.teams[team]||[];const recipient=members[randomInt(members.length)];const key=mailKey(recipient);const mail=(await r.get(key))||[];mail.unshift({assignmentId:randomUUID(),missionId:secret.id,title:secret.title,desc:secret.desc,done:false,assignedAt:new Date().toISOString()});await r.set(key,mail);s.pending={id:randomUUID(),kind:"secret",team,recipient,field:to}}
  else {addHistory(s,{type:"move",team,roll,field:to});endTurn(s,team)}
  return s;
}
export async function redrawMission(r,s,player){if(!s.pending||s.pending.kind!=="mission"||!s.modifiers.redrawAvailable)throw new Error("NO_REDRAW");if(teamOf(s,player)!==s.pending.team)throw new Error("NOT_YOUR_TURN");const old=s.pending.item.id;let pool=MISSIONS.filter(m=>!s.used.mission.includes(m.id)&&m.id!==old);if(!pool.length)pool=MISSIONS.filter(m=>m.id!==old);const m=pool[randomInt(pool.length)];if(!s.used.mission.includes(m.id))s.used.mission.push(m.id);s.drawOrder.mission.push(m.id);const members=s.teams[s.pending.team]||[];s.pending.item=m;s.pending.performer=m.type==="solo"?members[randomInt(members.length)]:null;s.modifiers.redrawAvailable=false;return s}
export function resolvePending(s,player,success){if(!s.pending)throw new Error("NO_PENDING");const p=s.pending,team=p.team;if((p.kind==="mission"||p.kind==="song")&&teamOf(s,player)!==team)throw new Error("NOT_YOUR_TURN");let awarded=0;
  if(p.kind==="mission"){if(success){awarded=p.item.points*(s.modifiers.nextMissionMultiplier||1)+(s.modifiers.nextMissionBonus||0);s.scores[team]+=awarded}s.modifiers.nextMissionMultiplier=1;s.modifiers.nextMissionBonus=0;s.modifiers.redrawAvailable=false;addHistory(s,{type:"mission",team,title:p.item.title,success:!!success,points:awarded})}
  else if(p.kind==="song"){if(success){awarded=3*(s.modifiers.nextSongMultiplier||1);s.scores[team]+=awarded}s.modifiers.nextSongMultiplier=1;addHistory(s,{type:"song",team,title:p.item.title,success:!!success,points:awarded})}
  else if(p.kind==="chaos")addHistory(s,{type:"chaos",team,title:p.item.title,effect:p.effect});
  else if(p.kind==="secret")addHistory(s,{type:"secret",team,recipient:p.recipient});
  s.pending=null;endTurn(s,team);return {s,awarded}
}
export async function completeSecret(r,s,player,assignmentId){const key=mailKey(player);const mail=(await r.get(key))||[];const a=mail.find(x=>x.assignmentId===assignmentId);if(!a)throw new Error("MAIL_NOT_FOUND");if(!a.done){a.done=true;a.completedAt=new Date().toISOString();const team=teamOf(s,player);if(team){s.scores[team]+=5;a.awardedTeam=team;a.points=5;addHistory(s,{type:"secret_complete",team,player,title:a.title,points:5})}await r.set(key,mail)}return {s,mail}}
export async function archiveAndReset(r,s){const first={};for(const t of ["mission","secret","chaos","song"])first[t]=s.drawOrder?.[t]?.[0]||null;await r.set(LAST_KEY,{gameId:s.gameId,first,drawOrder:s.drawOrder||{}});for(const p of PLAYERS)await r.del(mailKey(p));const fresh=initialState();await r.set(STATE_KEY,fresh);return fresh}

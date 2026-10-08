import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { PLAYERS, TEAM_ORDER, TEAM_ICONS, MISSIONS, SECRET_MISSIONS, CHAOS_CARDS } from "./config.mjs";

const GAME_STORE="mob-xmas-game";
const PRIVATE_STORE="mob-xmas-private";

export function gameStore(){ return getStore({name:GAME_STORE, consistency:"strong"}); }
export function privateStore(){ return getStore({name:PRIVATE_STORE, consistency:"strong"}); }

export function shuffle(list){
  const a=[...list];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
export function initialState(){
  return {
    version:1,
    teams:null,
    scores:{Rentiere:0,Glühwein:0,Lametta:0},
    turnIndex:0,
    mission:{used:[],active:null,history:[]},
    chaos:{
      active:false, used:[], current:null, history:[],
      nextMissionMultiplier:1, nextMissionBonus:0, nextSongMultiplier:1,
      redrawAvailable:false
    }
  };
}
export async function getState(){
  const store=gameStore();
  let s=await store.get("state",{type:"json"});
  if(!s){ s=initialState(); await store.setJSON("state",s); }
  s.scores ||= {Rentiere:0,Glühwein:0,Lametta:0};
  s.mission ||= {used:[],active:null,history:[]};
  s.chaos ||= {active:false,used:[],current:null,history:[],nextMissionMultiplier:1,nextMissionBonus:0,nextSongMultiplier:1,redrawAvailable:false};
  return s;
}
export async function saveState(s){
  await gameStore().setJSON("state",s);
  return s;
}
export function teamOf(state,name){
  if(!state.teams) return null;
  return TEAM_ORDER.find(t => (state.teams[t]||[]).includes(name)) || null;
}
export function sanitizeState(s){
  return {
    teams:s.teams,
    scores:s.scores,
    turnIndex:s.turnIndex,
    mission:s.mission,
    chaos:s.chaos,
    missionTotal:MISSIONS.length
  };
}
export function drawTeamsInto(state){
  const people=shuffle(PLAYERS);
  const teams={Rentiere:[],Glühwein:[],Lametta:[]};
  people.forEach((p,i)=>teams[TEAM_ORDER[i%TEAM_ORDER.length]].push(p));
  state.teams=teams;
  state.scores={Rentiere:0,Glühwein:0,Lametta:0};
  state.turnIndex=0;
  state.mission={used:[],active:null,history:[]};
  state.chaos={active:false,used:[],current:null,history:[],nextMissionMultiplier:1,nextMissionBonus:0,nextSongMultiplier:1,redrawAvailable:false};
  return state;
}
export function drawMissionInto(state){
  if(!state.teams || state.mission.active) return state;
  const pool=MISSIONS.filter(m=>!state.mission.used.includes(m.id));
  if(!pool.length) return state;
  const m=pool[Math.floor(Math.random()*pool.length)];
  const team=TEAM_ORDER[state.turnIndex%TEAM_ORDER.length];
  const members=state.teams[team]||[];
  const performer=m.type==="solo" ? members[Math.floor(Math.random()*members.length)] : null;
  state.mission.active={...m,team,performer,drawnAt:new Date().toISOString()};
  return state;
}
export function redrawMissionInto(state){
  if(!state.mission.active || !state.chaos.redrawAvailable) return state;
  if(!state.mission.used.includes(state.mission.active.id)) state.mission.used.push(state.mission.active.id);
  state.mission.active=null;
  state.chaos.redrawAvailable=false;
  return drawMissionInto(state);
}
export function finishMissionInto(state,success){
  const a=state.mission.active;
  if(!a) return state;
  let awarded=0;
  if(success){
    awarded=(a.points*(state.chaos.nextMissionMultiplier||1))+(state.chaos.nextMissionBonus||0);
    state.scores[a.team]=(state.scores[a.team]||0)+awarded;
  }
  if(!state.mission.used.includes(a.id)) state.mission.used.push(a.id);
  state.mission.history.unshift({...a,success:!!success,awarded,finishedAt:new Date().toISOString()});
  state.mission.active=null;
  state.turnIndex=(state.turnIndex+1)%TEAM_ORDER.length;
  state.chaos.nextMissionMultiplier=1;
  state.chaos.nextMissionBonus=0;
  state.chaos.redrawAvailable=false;
  return state;
}
export function applySongPoints(state,player){
  const team=teamOf(state,player);
  if(!team) return {state,awarded:0,team:null};
  const awarded=3*(state.chaos.nextSongMultiplier||1);
  state.scores[team]=(state.scores[team]||0)+awarded;
  state.chaos.nextSongMultiplier=1;
  return {state,awarded,team};
}
export function applyChaosCard(state,card){
  let effect="";
  let changes=[];
  const teams=state.teams;
  if(!teams) return {state,effect:"Noch keine Teams ausgelost.",changes};
  if(card.type==="swap_two"){
    const pair=shuffle(TEAM_ORDER).slice(0,2);
    const [a,b]=pair;
    const ia=Math.floor(Math.random()*teams[a].length), ib=Math.floor(Math.random()*teams[b].length);
    const pa=teams[a][ia], pb=teams[b][ib];
    teams[a][ia]=pb; teams[b][ib]=pa;
    changes=[{player:pa,from:a,to:b},{player:pb,from:b,to:a}];
    effect=`${pa} wechselt von ${a} zu ${b}; ${pb} wechselt von ${b} zu ${a}.`;
  } else if(card.type==="rotate_three"){
    const picks=TEAM_ORDER.map(t=>({t,i:Math.floor(Math.random()*teams[t].length)}));
    const vals=picks.map(x=>teams[x.t][x.i]);
    picks.forEach((x,i)=>{teams[x.t][x.i]=vals[(i+2)%vals.length]});
    changes=picks.map((x,i)=>({player:vals[i],from:x.t,to:picks[(i+1)%picks.length].t}));
    effect=changes.map(x=>`${x.player}: ${x.from} → ${x.to}`).join(" · ");
  } else if(card.type==="all_bonus"){
    TEAM_ORDER.forEach(t=>state.scores[t]=(state.scores[t]||0)+2);
    changes=TEAM_ORDER.map(t=>({team:t,points:+2}));
    effect="Jedes Team erhält +2 Punkte.";
  } else if(card.type==="leader_tax"){
    const max=Math.max(...TEAM_ORDER.map(t=>state.scores[t]||0));
    const leaders=TEAM_ORDER.filter(t=>(state.scores[t]||0)===max);
    const t=leaders[Math.floor(Math.random()*leaders.length)];
    state.scores[t]=Math.max(0,(state.scores[t]||0)-2);
    changes=[{team:t,points:-2}];
    effect=`Team ${t} verliert 2 Punkte.`;
  } else if(card.type==="underdog_bonus"){
    const min=Math.min(...TEAM_ORDER.map(t=>state.scores[t]||0));
    const lows=TEAM_ORDER.filter(t=>(state.scores[t]||0)===min);
    const t=lows[Math.floor(Math.random()*lows.length)];
    state.scores[t]=(state.scores[t]||0)+3;
    changes=[{team:t,points:+3}];
    effect=`Team ${t} erhält +3 Punkte.`;
  } else if(card.type==="next_double"){
    state.chaos.nextMissionMultiplier=2; effect="Die nächste erfolgreiche Mission zählt doppelt.";
  } else if(card.type==="next_bonus"){
    state.chaos.nextMissionBonus=2; effect="Die nächste erfolgreiche Mission erhält +2 Bonuspunkte.";
  } else if(card.type==="song_double"){
    state.chaos.nextSongMultiplier=2; effect="Der nächste Lied-Erfolg zählt doppelt.";
  } else if(card.type==="redraw"){
    state.chaos.redrawAvailable=true; effect="Das nächste Team darf einmal neu ziehen.";
  } else {
    effect=card.text;
  }
  return {state,effect,changes};
}
export function nextChaosCard(state){
  const pool=CHAOS_CARDS.filter(c=>!state.chaos.used.includes(c.id));
  if(!pool.length) return null;
  return pool[Math.floor(Math.random()*pool.length)];
}
export async function ensureSecretMission(player){
  const store=privateStore();
  let data=await store.get("mail",{type:"json"}) || {used:[],assignments:{}};
  if(!data.assignments[player]){
    let pool=SECRET_MISSIONS.filter(m=>!data.used.includes(m.id));
    if(!pool.length){ data.used=[]; pool=[...SECRET_MISSIONS]; }
    const m=pool[Math.floor(Math.random()*pool.length)];
    data.assignments[player]={...m,done:false,awarded:false,assignedAt:new Date().toISOString()};
    data.used.push(m.id);
    await store.setJSON("mail",data);
  }
  return data.assignments[player];
}
export async function completeSecretMission(player){
  const store=privateStore();
  let data=await store.get("mail",{type:"json"}) || {used:[],assignments:{}};
  if(!data.assignments[player]) await ensureSecretMission(player);
  data=await store.get("mail",{type:"json"}) || data;
  const a=data.assignments[player];
  if(!a.done){
    a.done=true; a.completedAt=new Date().toISOString();
    const state=await getState();
    const team=teamOf(state,player);
    if(team && !a.awarded){
      state.scores[team]=(state.scores[team]||0)+5;
      a.awarded=true;
      await saveState(state);
    }
    await store.setJSON("mail",data);
  }
  return a;
}

export async function resetEverything(){
  const store=gameStore();
  const priv=privateStore();
  const fresh=initialState();
  await store.setJSON("state",fresh);
  await priv.delete("mail");
  return fresh;
}

export function subscriptionKey(endpoint){
  return "push/"+createHash("sha256").update(endpoint).digest("hex");
}

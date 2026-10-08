import { authName, ADMIN_PIN } from "./_lib/config.mjs";
import { getState, saveState, sanitizeState, drawTeamsInto, drawMissionInto, redrawMissionInto, finishMissionInto, applySongPoints, resetEverything } from "./_lib/game.mjs";
export default async (req) => {
  const name=authName(req);
  if(!name) return Response.json({error:"Nicht angemeldet"},{status:401});
  if(req.method!=="POST") return new Response("Method Not Allowed",{status:405});
  let body={}; try{body=await req.json()}catch{}
  const type=body.action;
  let state=await getState();
  let meta={};
  if(type==="drawTeams"){
    state=drawTeamsInto(state);
  }else if(type==="drawMission"){
    state=drawMissionInto(state);
  }else if(type==="redrawMission"){
    state=redrawMissionInto(state);
  }else if(type==="finishMission"){
    state=finishMissionInto(state,!!body.success);
  }else if(type==="awardSong"){
    const r=applySongPoints(state,name); state=r.state; meta={awarded:r.awarded,team:r.team};
  }else if(type==="startChaos"){
    if(!state.teams) return Response.json({error:"Erst Teams auslosen."},{status:400});
    state.chaos.active=true;
  }else if(type==="stopChaos"){
    state.chaos.active=false;
  }else if(type==="resetMissions"){
    state.turnIndex=0;
    state.mission={used:[],active:null,history:[]};
  }else if(type==="adminReset"){
    if(String(body.adminPin||"")!==ADMIN_PIN) return Response.json({error:"Admin-Code falsch."},{status:403});
    state=await resetEverything();
  }else{
    return Response.json({error:"Unbekannte Aktion"},{status:400});
  }
  await saveState(state);
  return Response.json({ok:true,state:sanitizeState(state),...meta});
};
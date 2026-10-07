import { authName } from "./_lib/config.mjs";
import { ensureSecretMission, completeSecretMission, getState, teamOf } from "./_lib/game.mjs";
export default async (req) => {
  const name=authName(req);
  if(!name) return Response.json({error:"Nicht angemeldet"},{status:401});
  if(req.method==="GET"){
    const mail=await ensureSecretMission(name);
    const state=await getState();
    return Response.json({ok:true,mail,team:teamOf(state,name)});
  }
  if(req.method==="POST"){
    const mail=await completeSecretMission(name);
    const state=await getState();
    return Response.json({ok:true,mail,team:teamOf(state,name)});
  }
  return new Response("Method Not Allowed",{status:405});
};
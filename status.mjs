import { authName, VAPID_PUBLIC_KEY } from "./_lib/config.mjs";
import { getState, sanitizeState, teamOf } from "./_lib/game.mjs";
export default async (req) => {
  const name=authName(req);
  if(!name) return Response.json({error:"Nicht angemeldet"},{status:401});
  const state=await getState();
  return Response.json({
    ok:true,
    me:{name,team:teamOf(state,name)},
    state:sanitizeState(state),
    vapidPublicKey:VAPID_PUBLIC_KEY
  });
};
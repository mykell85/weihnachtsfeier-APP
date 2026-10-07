import webpush from "web-push";
import { authName, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from "./_lib/config.mjs";
import { gameStore, subscriptionKey, ensureSecretMission } from "./_lib/game.mjs";
export default async (req) => {
  const name=authName(req);
  if(!name) return Response.json({error:"Nicht angemeldet"},{status:401});
  if(req.method!=="POST") return new Response("Method Not Allowed",{status:405});
  let body={}; try{body=await req.json()}catch{}
  const sub=body.subscription;
  if(!sub?.endpoint) return Response.json({error:"Ungültiges Push-Abo"},{status:400});
  const store=gameStore();
  const key=subscriptionKey(sub.endpoint);
  await store.setJSON(key,{name,subscription:sub,createdAt:new Date().toISOString()});
  try{
    await ensureSecretMission(name);
    webpush.setVapidDetails("mailto:mob-weihnachten@example.com",VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);
    await webpush.sendNotification(sub,JSON.stringify({
      title:"📮 Neue Wichtelpost",
      body:"Deine geheime Mission wartet im Postfach.",
      url:"/?screen=mail"
    }));
  }catch{}
  return Response.json({ok:true});
};
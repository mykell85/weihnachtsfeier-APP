import webpush from "web-push";
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from "./_lib/config.mjs";
import { getState, saveState, nextChaosCard, applyChaosCard, gameStore } from "./_lib/game.mjs";

async function sendPush(payload){
  const store=gameStore();
  const {blobs}=await store.list({prefix:"push/"});
  if(!blobs.length) return;
  webpush.setVapidDetails("mailto:mob-weihnachten@example.com",VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);
  for(const b of blobs){
    const entry=await store.get(b.key,{type:"json"});
    if(!entry?.subscription) continue;
    try{
      await webpush.sendNotification(entry.subscription,JSON.stringify(payload));
    }catch(err){
      if(err?.statusCode===404 || err?.statusCode===410) await store.delete(b.key);
    }
  }
}
export default async () => {
  const state=await getState();
  if(!state.chaos.active || !state.teams) return;
  const card=nextChaosCard(state);
  if(!card){
    state.chaos.active=false;
    await saveState(state);
    return;
  }
  const {effect}=applyChaosCard(state,card);
  state.chaos.used.push(card.id);
  state.chaos.current={...card,effect,drawnAt:new Date().toISOString()};
  state.chaos.history.unshift(state.chaos.current);
  await saveState(state);
  await sendPush({
    title:`🃏 ${card.title}`,
    body:effect || card.text,
    url:"/?screen=missions"
  });
};
export const config={schedule:"@hourly"};
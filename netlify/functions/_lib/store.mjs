import { getStore } from "@netlify/blobs";

export const STATE_KEY="state";
export const LAST_KEY="lastgame";
export const mailKey=name=>`mail/${name}`;

function blob(){ return getStore({name:"mob-xmas-board-v1", consistency:"strong"}); }
export function storage(){
  const s=blob();
  return {
    async get(key){ return await s.get(key,{type:"json"}); },
    async set(key,value){ await s.setJSON(key,value); return "OK"; },
    async del(key){ await s.delete(key); return 1; }
  };
}

// Serializes updates within a warm Netlify function instance. Strong-consistency
// Blob reads/writes provide the shared state across devices.
let queue=Promise.resolve();
export async function withLock(fn){
  const run=async()=>fn(storage());
  const next=queue.then(run,run);
  queue=next.then(()=>undefined,()=>undefined);
  return next;
}

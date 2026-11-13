import { Redis } from "@upstash/redis";
import { randomUUID } from "node:crypto";

let client;
export function redis(){
  if(!client){
    const url=process.env.UPSTASH_REDIS_REST_URL;
    const token=process.env.UPSTASH_REDIS_REST_TOKEN;
    if(!url||!token) throw new Error("REDIS_NOT_CONFIGURED");
    client=new Redis({url,token});
  }
  return client;
}
export const STATE_KEY="mob:xmas:board:v1:state";
export const LAST_KEY="mob:xmas:board:v1:lastgame";
export const LOCK_KEY="mob:xmas:board:v1:lock";
export const mailKey=name=>`mob:xmas:board:v1:mail:${name}`;
export async function withLock(fn){
  const r=redis(); const token=randomUUID();
  for(let i=0;i<14;i++){
    const ok=await r.set(LOCK_KEY,token,{nx:true,px:4000});
    if(ok){
      try{return await fn(r)}finally{try{await r.eval("if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",[LOCK_KEY],[token])}catch{}}
    }
    await new Promise(res=>setTimeout(res,70+Math.floor(Math.random()*60)));
  }
  throw new Error("BUSY");
}

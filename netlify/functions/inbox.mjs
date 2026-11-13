import { authName } from "./_lib/config.mjs";
import { withLock,storage,mailKey } from "./_lib/store.mjs";
import { getState,saveState,completeSecret } from "./_lib/game.mjs";
import { reply,body,errMessage } from "./_lib/http.mjs";
export default async (req)=>{const name=authName(req);if(!name)return reply(401,{error:"Bitte neu anmelden."});try{if(req.method==="GET"){const r=storage();return reply(200,{mail:(await r.get(mailKey(name)))||[]})}if(req.method==="POST"){const b=await body(req);const out=await withLock(async r=>{let s=await getState(r);const x=await completeSecret(r,s,name,String(b.assignmentId||""));await saveState(r,x.s);return x});return reply(200,{mail:out.mail})}return reply(405,{error:"METHOD"})}catch(e){return reply(409,{error:errMessage(e)})}}

import { AUTH_USERS,PINS,makeToken } from "./_lib/config.mjs";
import { reply,body } from "./_lib/http.mjs";
export default async (req)=>{if(req.method!=="POST")return reply(405,{error:"METHOD"});const b=await body(req);const name=String(b.name||"");const pin=String(b.pin||"");if(!AUTH_USERS.includes(name)||PINS[name]!==pin)return reply(401,{error:"Name oder Wichtelcode stimmt nicht."});return reply(200,{token:makeToken(name),name})}

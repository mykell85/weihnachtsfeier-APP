import { authName } from "./_lib/config.mjs";
import { storage,mailKey } from "./_lib/store.mjs";
import { getState,publicState } from "./_lib/game.mjs";
import { reply,errMessage } from "./_lib/http.mjs";
export default async (req)=>{if(req.method!=="GET")return reply(405,{error:"METHOD"});try{const r=storage();const name=authName(req);const s=await getState(r);const mail=name?(await r.get(mailKey(name))||[]):[];return reply(200,{state:publicState(s,name),mail})}catch(e){return reply(500,{error:errMessage(e)})}}

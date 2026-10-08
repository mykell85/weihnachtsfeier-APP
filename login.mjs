import { PLAYERS, PINS, makeToken } from "./_lib/config.mjs";
export default async (req) => {
  if(req.method!=="POST") return new Response("Method Not Allowed",{status:405});
  let body={}; try{body=await req.json()}catch{}
  const name=String(body.name||"");
  const pin=String(body.pin||"");
  if(!PLAYERS.includes(name) || PINS[name]!==pin){
    return Response.json({ok:false,error:"Name oder Wichtelcode stimmt nicht."},{status:401});
  }
  return Response.json({ok:true,token:makeToken(name),name});
};
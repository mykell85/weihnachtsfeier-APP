import { createHmac, timingSafeEqual } from "node:crypto";

export const PLAYERS = ["Christian","Bene","Felix","Sven","Giovanni","Cornelius","Marco","Daniel","Michael"];
export const PINS = {Christian:"2412",Bene:"7314",Felix:"5086",Sven:"1937",Giovanni:"8642",Cornelius:"4269",Marco:"3571",Daniel:"6805",Michael:"9128"};
export const TEAM_ORDER = ["Rentiere","Glühwein","Lametta"];
export const TEAM_ICONS = {Rentiere:"🦌",Glühwein:"🍷",Lametta:"✨"};
export const BOARD_END = 33;
export const FIELD_TYPES = {
  1:"start",2:"free",3:"mission",4:"free",5:"song",6:"free",7:"chaos",8:"free",9:"secret",10:"free",11:"mission",12:"free",13:"chaos",14:"free",15:"song",16:"mission",17:"free",18:"secret",19:"free",20:"mission",21:"chaos",22:"free",23:"secret",24:"free",25:"mission",26:"song",27:"free",28:"chaos",29:"free",30:"secret",31:"mission",32:"free",33:"finish"
};
export const MISSIONS = [
{id:"m01",icon:"☎️",type:"solo",title:"Nordpol-Hotline",desc:"Ruf den Weihnachtsmann unter 0351-4882412 an und hinterlasse einen Weihnachtswunsch.",points:3},
{id:"m02",icon:"💌",type:"solo",title:"Weihnachts-Comeback",desc:"Schicke einen Weihnachtsgruß an jemanden, zu dem du schon sehr lange keinen Kontakt mehr hattest.",points:3},
{id:"m03",icon:"🎅",type:"team",title:"Nikolaus-Karriere",desc:"Lass jemanden aus deinem Team in deine Familiengruppe schreiben, dass du ab nächster Woche ehrenamtlich als Nikolaus verkleidet Weihnachtsbäume verkaufst und dir damit einen großen Traum erfüllst. Danach auflösen.",points:5},
{id:"m04",icon:"🎶",type:"team",title:"Neuer Weihnachtsklassiker",desc:"Stimmt als Gruppe spontan ein neues Weihnachtslied an. Mindestens Refrain plus eine selbst erfundene Zeile.",points:4},
{id:"m05",icon:"✍️",type:"team",title:"Weihnachtsdichter",desc:"Komponiert mit ChatGPT ein lustiges Weihnachtsgedicht im Reimschema ABAB und tragt es vor.",points:4},
{id:"m06",icon:"📸",type:"team",title:"Weihnachtswerbung",desc:"Dreht einen maximal 15-sekündigen Werbespot für einen normalen Gegenstand und verkauft ihn als Weihnachtsprodukt des Jahres.",points:4},
{id:"m07",icon:"🎤",type:"team",title:"Weihnachts-Pressekonferenz",desc:"Eine Person spielt den Weihnachtsmann. Die anderen stellen drei absurde Pressefragen.",points:4},
{id:"m08",icon:"🎶",type:"team",title:"Weihnachts-Remix",desc:"Erfindet zu einem bekannten Weihnachtslied eine neue Strophe über euren Tag.",points:4},
{id:"m09",icon:"📷",type:"team",title:"Weihnachtsbeweis",desc:"Macht ein Foto, auf dem alle Teammitglieder gleichzeitig etwas Rotes, Grünes oder Glitzerndes berühren.",points:3},
{id:"m10",icon:"🎁",type:"solo",title:"Falsche Bescherung",desc:"Überreiche jemandem einen beliebigen Gegenstand als offizielles Weihnachtsgeschenk und halte eine kurze Rede.",points:3},
{id:"m11",icon:"📱",type:"solo",title:"Advents-Sprachnachricht",desc:"Schicke jemandem eine festliche, leicht dramatische Sprachnachricht. Am Ende freundlich auflösen.",points:3},
{id:"m12",icon:"🎄",type:"solo",title:"Neue Familientradition",desc:"Erfinde eine absurde, harmlose Weihnachtsregel und schicke sie als angeblich neue Tradition in einen privaten Chat. Danach auflösen.",points:4},
{id:"m13",icon:"🇸🇪",type:"team",title:"Julbock-Bau",desc:"Baut aus Dingen, die ihr dabeihabt, einen improvisierten Julbock und fotografiert ihn.",points:5},
{id:"m14",icon:"🇩🇰",type:"team",title:"Hygge-Gedicht",desc:"Schreibt ein kurzes Gedicht mit Kerze, Mandel, Schnee, Freundschaft und Chaos und tragt es gemeinsam vor.",points:4},
{id:"m15",icon:"🎅",type:"solo",title:"Nikolaus-Referenz",desc:"Lass dir von jemandem außerhalb eures Teams bestätigen, dass du einen überzeugenden Nikolaus abgeben würdest.",points:3},
{id:"m16",icon:"📸",type:"team",title:"Weihnachtskarten-Cover",desc:"Macht als Team ein Foto, das ernsthaft als maximal kitschige Weihnachtskarte funktionieren könnte.",points:4},
{id:"m17",icon:"☎️",type:"solo",title:"Frohe Weihnachten, falscher Moment",desc:"Ruf jemanden an und wünsche selbstverständlich frohe Weihnachten. Mindestens 20 Sekunden durchhalten, dann auflösen.",points:4},
{id:"m18",icon:"🎁",type:"solo",title:"Geschenkberatung",desc:"Frag jemanden außerhalb des Teams nach einer Geschenkidee für einen Erwachsenen, der angeblich schon alles hat.",points:3},
{id:"m19",icon:"🧑‍🎄",type:"team",title:"Der Weihnachtsmann war hier",desc:"Macht mit mindestens einer weiteren Person ein Foto, auf dem ihr so tut, als hättet ihr gerade den Weihnachtsmann gesehen.",points:4},
{id:"m20",icon:"🍷",type:"team",title:"Glühwein-Kritiker",desc:"Lasst jemanden außerhalb des Teams euer Getränk von 1–10 bewerten und begründen.",points:3},
{id:"m21",icon:"📱",type:"solo",title:"Weihnachtsstatus",desc:"Poste mindestens 30 Minuten einen völlig übertriebenen, aber harmlosen Weihnachtsstatus oder eine Story.",points:4},
{id:"m22",icon:"🎶",type:"team",title:"Straßenchor",desc:"Stimmt ein Weihnachtslied an und bringt mindestens eine weitere Person außerhalb des Teams zum Mitsingen.",points:5},
{id:"m23",icon:"🌍",type:"team",title:"Europäische Bescherung",desc:"Findet in fünf Minuten Menschen, Gegenstände oder Stände mit Bezug zu drei europäischen Ländern und dokumentiert sie per Foto.",points:5},
{id:"m24",icon:"🇪🇸",type:"team",title:"Feliz Navidad",desc:"Bringt mindestens zwei weitere Personen dazu, mit euch Feliz Navidad anzustimmen.",points:5}
];
export const SECRET_MISSIONS = [
{id:"s1",title:"Last-Christmas-Falle",desc:"Bring jemanden dazu, freiwillig „Last Christmas“ anzustimmen."},
{id:"s2",title:"Probierhappen",desc:"Sorge dafür, dass dir jemand ungefragt einen Probierhappen anbietet."},
{id:"s3",title:"Doppel-Prost",desc:"Bring zwei Personen dazu, gleichzeitig „Prost“ zu sagen."},
{id:"s4",title:"Accessoire-Attacke",desc:"Überzeuge jemanden, mindestens fünf Minuten ein Weihnachtsaccessoire zu tragen."},
{id:"s5",title:"Weihnachtsmarkt-Preischeck",desc:"Schaffe es, dass jemand sagt: „Das ist aber teuer.“"},
{id:"s6",title:"Gruppenfoto-Intrige",desc:"Bring jemanden dazu, von sich aus ein Gruppenfoto vorzuschlagen."},
{id:"s7",title:"Die-Hard-Debatte",desc:"Sorge für eine Diskussion darüber, ob Die Hard ein Weihnachtsfilm ist."},
{id:"s8",title:"Doppelter Stand",desc:"Bring jemanden dazu, denselben Weihnachtsmarkt-Stand zweimal zu besuchen."},
{id:"s9",title:"Dreifach-Lametta",desc:"Sorge dafür, dass drei Personen gleichzeitig ein Weihnachtsaccessoire tragen."},
{id:"s10",title:"Rentier-Ruf",desc:"Bring jemanden dazu, im Laufe des Tages laut „Ho ho ho!“ zu sagen."},
{id:"s11",title:"Glühwein-Gutachter",desc:"Sorge dafür, dass jemand ein Getränk völlig übertrieben wie ein Sommelier bewertet."},
{id:"s12",title:"Weihnachtskompliment",desc:"Bring jemanden dazu, einem anderen Wichtel ein ernst gemeintes Weihnachtskompliment zu machen."}
];
export const CHAOS_CARDS = [
{id:"c1",title:"Rentierwechsel",text:"Zwei zufällige Wichtel aus unterschiedlichen Teams tauschen ihre Plätze.",type:"swap_two"},
{id:"c2",title:"Wichtel-Karussell",text:"Aus jedem Team wandert ein zufälliger Wichtel ins nächste Team.",type:"rotate_three"},
{id:"c3",title:"Bescherung für alle",text:"Jedes Team bekommt 2 Bonuspunkte.",type:"all_bonus"},
{id:"c4",title:"Glühweinsteuer",text:"Das führende Team verliert 2 Punkte.",type:"leader_tax"},
{id:"c5",title:"Weihnachtswunder",text:"Das letzte Team bekommt 3 Bonuspunkte.",type:"underdog_bonus"},
{id:"c6",title:"Doppelte Bescherung",text:"Die nächste erfolgreiche Mission zählt doppelt.",type:"next_double"},
{id:"c7",title:"Sternstunde",text:"Die nächste erfolgreiche Mission bekommt 2 Bonuspunkte.",type:"next_bonus"},
{id:"c8",title:"Jingle-Bonus",text:"Der nächste erfolgreiche Liedzug zählt doppelt.",type:"song_double"},
{id:"c9",title:"Wunschzettel-Joker",text:"Die nächste Mission darf einmal neu gezogen werden.",type:"redraw"},
{id:"c10",title:"Fotoalarm",text:"Alle Wichtel müssen innerhalb von 10 Minuten gemeinsam auf ein Weihnachtsfoto.",type:"instruction"},
{id:"c11",title:"Stille Nacht",text:"Eine Minute Sprechverbot für die ganze Gruppe.",type:"instruction"},
{id:"c12",title:"Mützenpflicht",text:"Bis zum nächsten Chaos-Feld trägt jeder ein Weihnachtsaccessoire.",type:"instruction"},
{id:"c13",title:"Glöckchen-Alarm",text:"Die ganze Gruppe stimmt sofort einen Weihnachtsklassiker an.",type:"instruction"}
];
export const SONGS = [
{id:"l01",title:"O Tannenbaum"},{id:"l02",title:"O du fröhliche"},{id:"l03",title:"Stille Nacht, heilige Nacht"},{id:"l04",title:"Kling, Glöckchen, klingelingeling"},{id:"l05",title:"Ihr Kinderlein, kommet"},{id:"l06",title:"Leise rieselt der Schnee"},{id:"l07",title:"Süßer die Glocken nie klingen"},{id:"l08",title:"Alle Jahre wieder"},{id:"l09",title:"Morgen, Kinder, wird’s was geben"},{id:"l10",title:"Es ist ein Ros entsprungen"},{id:"l11",title:"Tochter Zion, freue dich"},{id:"l12",title:"Am Weihnachtsbaum die Lichter brennen"}
];
export const ADMIN_PIN = process.env.ADMIN_PIN || "2026";
export const SESSION_SECRET = process.env.SESSION_SECRET || "mob-weihnachtsfeier-2026-change-me";
const enc=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
export function makeToken(name){const p=enc({sub:name,exp:Date.now()+1000*60*60*48});const s=createHmac("sha256",SESSION_SECRET).update(p).digest("base64url");return `${p}.${s}`}
export function verifyToken(token){if(!token||!token.includes("."))return null;const [p,s]=token.split(".");const e=createHmac("sha256",SESSION_SECRET).update(p).digest("base64url");const a=Buffer.from(s),b=Buffer.from(e);if(a.length!==b.length||!timingSafeEqual(a,b))return null;try{const d=JSON.parse(Buffer.from(p,"base64url").toString("utf8"));return d.sub&&d.exp>Date.now()&&PLAYERS.includes(d.sub)?d.sub:null}catch{return null}}
export function authName(req){const h=req.headers.authorization||req.headers.Authorization||"";return verifyToken(h.startsWith("Bearer ")?h.slice(7):"")}

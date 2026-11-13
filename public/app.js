const PLAYERS=["Christian","Bene","Felix","Sven","Giovanni","Cornelius","Marco","Michael","Simon","Peter"];
const LOGIN_USERS=[...PLAYERS,"Spielleiter"];
const avatarMap=Object.fromEntries(PLAYERS.map(n=>[n,`/avatars/${n.toLowerCase()}.webp`]));
const TEAM_ICONS={Rentiere:"🦌",Glühwein:"🍷",Lametta:"✨"};
const TEAM_KEYS={Rentiere:"R",Glühwein:"G",Lametta:"L"};
const FIELD_ICONS={mission:"🎁",secret:"✉️",chaos:"🃏",song:"🎵",finish:"🏁"};
const FIELD_TYPES={1:"start",2:"free",3:"mission",4:"free",5:"song",6:"free",7:"chaos",8:"free",9:"secret",10:"free",11:"mission",12:"free",13:"chaos",14:"free",15:"song",16:"mission",17:"free",18:"secret",19:"free",20:"mission",21:"chaos",22:"free",23:"secret",24:"free",25:"mission",26:"song",27:"free",28:"chaos",29:"free",30:"secret",31:"mission",32:"free",33:"finish"};
// 33 normalized positions over the illustrated snowy path.
const POS=[null,
[24,88.6],[37,87.3],[50,88.4],[63,86.8],
[68,81.8],[55,80.4],[42,81.7],[29,79.6],
[27,73.4],[40,72.0],[54,73.0],[67,70.8],
[68,65.3],[55,63.8],[41,65.0],[28,62.5],
[27,56.9],[40,55.3],[54,56.3],[68,53.9],
[67,48.1],[54,46.7],[40,47.9],[27,45.4],
[28,39.5],[42,38.1],[55,39.0],[68,36.4],
[67,31.0],[54,29.4],[41,30.5],[30,27.1],[70,20.5]
];
let token=localStorage.getItem('mobToken')||'';
let state=null,mail=[],pollTimer=null,seenMoveId=null,animating=false;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2600)}
function authHeaders(){return token?{Authorization:`Bearer ${token}`}:{}}
async function api(url,opts={}){const res=await fetch(url,{...opts,headers:{'Content-Type':'application/json',...authHeaders(),...(opts.headers||{})}});let data={};try{data=await res.json()}catch{}if(!res.ok)throw new Error(data.error||`Fehler ${res.status}`);return data}
function openModal(id){$('#'+id).classList.remove('hidden')}
function closeModal(id){$('#'+id).classList.add('hidden')}

let currentPage='home',crewIndex=0,crewPointerX=null,crewPointerId=null;
function showPage(name){currentPage=name;$('#homePage').classList.toggle('active',name==='home');$('#boardPage').classList.toggle('active',name==='board');$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===name))}
function crewPages(){const pages=[];for(let i=0;i<PLAYERS.length;i+=2)pages.push(PLAYERS.slice(i,i+2));return pages}
function renderCrew(){const host=$('#assetCrew'),dots=$('#crewDots'),pages=crewPages();if(!host)return;if(crewIndex>=pages.length)crewIndex=0;dots.innerHTML=pages.map((_,i)=>`<button type="button" class="${i===crewIndex?'active':''}" onclick="setCrew(${i})" aria-label="Wichtelgruppe ${i+1}"></button>`).join('');paintCrew(false);if(!host.dataset.carousel){host.dataset.carousel='1';host.addEventListener('pointerdown',e=>{crewPointerId=e.pointerId;crewPointerX=e.clientX;try{host.setPointerCapture(e.pointerId)}catch{}});host.addEventListener('pointerup',e=>{if(crewPointerX===null||crewPointerId!==e.pointerId)return;const dx=e.clientX-crewPointerX;crewPointerX=null;crewPointerId=null;if(Math.abs(dx)>34)moveCrew(dx<0?1:-1)});host.addEventListener('pointercancel',()=>{crewPointerX=null;crewPointerId=null})}}
function paintCrew(animate=true){const pair=crewPages()[crewIndex]||[],li=$('#crewLeftImg'),ri=$('#crewRightImg'),ln=$('#crewLeftName'),rn=$('#crewRightName');const apply=()=>{const l=pair[0]||'',r=pair[1]||'';if(l){li.src=avatarMap[l];li.alt=l;li.style.visibility='visible';ln.textContent=l}else{li.style.visibility='hidden';ln.textContent=''}if(r){ri.src=avatarMap[r];ri.alt=r;ri.style.visibility='visible';rn.textContent=r}else{ri.style.visibility='hidden';rn.textContent=''}$$('#crewDots button').forEach((d,i)=>d.classList.toggle('active',i===crewIndex));li.classList.remove('switching');ri.classList.remove('switching')};if(animate){li.classList.add('switching');ri.classList.add('switching');setTimeout(apply,110)}else apply()}
window.setCrew=function(i){crewIndex=Math.max(0,Math.min(crewPages().length-1,i));paintCrew(true)}
window.moveCrew=function(dir){const c=crewPages().length;crewIndex=(crewIndex+dir+c)%c;paintCrew(true);tone(620+crewIndex*25,.035)}
$$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));

function buildBoard(){
 const fields=$('#fields');let pts=[];
 for(let i=1;i<=33;i++){const [x,y]=POS[i];pts.push(`${x},${y}`);const type=FIELD_TYPES[i];const el=document.createElement('div');el.className=`field ${type} ${['mission','secret','chaos','song','finish'].includes(type)?'action':''}`;el.dataset.field=i;el.style.left=x+'%';el.style.top=y+'%';el.innerHTML=FIELD_ICONS[type]|| (type==='start'?'':i);el.title=`Feld ${i}: ${type}`;fields.appendChild(el)}
 $('#routeLine').setAttribute('points',pts.join(' '));
 const tok=$('#tokens');for(const team of Object.keys(TEAM_ICONS)){const el=document.createElement('div');el.id='token'+TEAM_KEYS[team];el.className='team-token '+team;el.textContent=TEAM_ICONS[team];el.title=team;tok.appendChild(el)}
}
function tokenOffset(team){return team==='Rentiere'?-1.4:team==='Glühwein'?0:1.4}
function placeToken(team,field,instant=false){const el=$('#token'+TEAM_KEYS[team]);const [x,y]=POS[Math.max(1,Math.min(33,field))];if(instant)el.style.transition='none';el.style.left=(x+tokenOffset(team))+'%';el.style.top=y+'%';if(instant)requestAnimationFrame(()=>el.style.transition='')}
function lightField(n){$$('.field').forEach(f=>f.classList.remove('lit'));const f=$(`.field[data-field="${n}"]`);if(f){void f.offsetWidth;f.classList.add('lit')}}
async function animateMove(move){if(!move||animating)return;animating=true;const team=move.team;placeToken(team,move.from,true);await wait(120);for(let f=move.from+1;f<=move.to;f++){const el=$('#token'+TEAM_KEYS[team]);el.classList.remove('step');void el.offsetWidth;el.classList.add('step');placeToken(team,f);tone(320+(f%5)*45,.025);await wait(235)}lightField(move.to);tone(760,.08);animating=false}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function tone(freq=440,dur=.05){try{const ac=window._ac||(window._ac=new (AudioContext||webkitAudioContext)());const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;o.type='triangle';g.gain.value=.025;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);o.stop(ac.currentTime+dur)}catch{}}

function render(){if(!state)return;
 $('#scoreR').textContent=(state.scores?.Rentiere||0)+' P';$('#scoreG').textContent=(state.scores?.Glühwein||0)+' P';$('#scoreL').textContent=(state.scores?.Lametta||0)+' P';
 for(const t of Object.keys(TEAM_ICONS))placeToken(t,state.positions?.[t]||1,true);
 const active=['Rentiere','Glühwein','Lametta'][state.turnIndex%3];$('#turnLabel').textContent=`${TEAM_ICONS[active]} ${active}`;
 const me=state.me;const canRoll=!!(state.started&&!state.pending&&!state.final?.complete&&(me?.team===active||me?.spielleiter));
 $('#rollBtn').disabled=!canRoll;$('#turnHint').textContent=state.final?.complete?'Partie beendet':!me?'Bitte anmelden':me.spielleiter?'Spielleiter · freies Würfeln':canRoll?'Ihr dürft würfeln!':`Du bist ${me.team||'noch ohne Team'}`;
 $('#loginChip').textContent=me?`🎅 ${me.name}${me.spielleiter?' · Testmodus':` · ${me.team||'–'}`}`:'🎅 Anmelden';
 $('#mailBadge').textContent=mail.filter(x=>!x.done).length;$('#mailBadge').classList.toggle('hidden',!mail.some(x=>!x.done));
 if(state.started)closeModal('setupModal');
 if(state.pending)showPending(state.pending);else closeModal('eventModal');
 if(state.final?.complete){const winners=state.final.winners||[];$('#finalText').textContent=winners.length===1?`🎄 Sieger: ${TEAM_ICONS[winners[0]]} ${winners[0]}!`:`🎄 Gleichstand: ${winners.join(' & ')} – Weihnachts-Stechen!`}
}
function showPending(p){
 const c=$('#eventCard');c.className='modal-card event-card '+p.kind;$('#eventKicker').textContent=p.kind==='mission'?'Missions-Lostrommel':p.kind==='secret'?'Geheime Wichtelpost':p.kind==='chaos'?'Weihnachtschaos':'Lieder-Rad';
 $('#eventIcon').textContent=p.kind==='mission'?(p.item.icon||'🎁'):p.kind==='secret'?'✉️':p.kind==='chaos'?'🃏':'🎵';
 $('#eventTitle').textContent=p.kind==='secret'?`Post für ${p.recipient}`:p.item?.title||'Aktion';
 let meta=`${TEAM_ICONS[p.team]} ${p.team}`;if(p.kind==='mission'){meta+=` · ${p.item.points} Punkte`;if(p.performer)meta+=` · ${p.performer} ist dran`}
 if(p.kind==='song')meta+=' · 3 Punkte';$('#eventMeta').textContent=meta;
 $('#eventText').textContent=p.kind==='secret'?`${p.recipient} hat eine geheime Aufgabe ins persönliche Postfach bekommen. Der Inhalt bleibt für alle anderen verborgen.`:(p.item?.desc||p.item?.text||'');
 const eff=$('#eventEffect');if(p.effect){eff.textContent=p.effect;eff.classList.remove('hidden')}else eff.classList.add('hidden');
 const a=$('#eventActions');a.innerHTML='';const me=state.me;
 if(p.kind==='mission'||p.kind==='song'){
  const own=me?.team===p.team||me?.spielleiter;
  if(p.kind==='mission'&&state.modifiers?.redrawAvailable&&own)a.append(btn('🎟️ Neu ziehen','redraw',()=>doAction('redraw')));
  a.append(btn('✅ Geschafft','success',()=>doResolve(true),!own));a.append(btn('❌ Nicht geschafft','fail',()=>doResolve(false),!own));
 }else a.append(btn('Weiter','',()=>doResolve(true),!me));
 openModal('eventModal')
}
function btn(label,cls,fn,disabled=false){const b=document.createElement('button');b.textContent=label;b.className=cls;b.disabled=disabled;b.onclick=fn;return b}
async function doResolve(success){try{const d=await api('/api/action',{method:'POST',body:JSON.stringify({action:'resolve',success})});state=d.state;render();await refresh()}catch(e){toast(e.message)}}
async function doAction(action,extra={}){try{const d=await api('/api/action',{method:'POST',body:JSON.stringify({action,...extra})});state=d.state;render();return d}catch(e){toast(e.message);throw e}}
async function roll(){if($('#rollBtn').disabled)return;const die=$('#dice'),face=$('#diceFace');die.classList.add('rolling');$('#rollBtn').disabled=true;const glyphs=['⭐','🔔🔔','🍬🍬🍬','❄️','🎁','🕯️'];let t=setInterval(()=>face.textContent=glyphs[Math.floor(Math.random()*glyphs.length)],90);try{const [d]=await Promise.all([api('/api/action',{method:'POST',body:JSON.stringify({action:'roll'})}),wait(850)]);clearInterval(t);die.classList.remove('rolling');state=d.state;face.textContent=['','⭐','🔔🔔','🍬³','❄️⁴','🎁⁵','🕯️⁶'][state.lastMove.roll];const move=state.lastMove;if(move&&move.id!==seenMoveId){seenMoveId=move.id;await animateMove(move)}render();await refresh()}catch(e){clearInterval(t);die.classList.remove('rolling');toast(e.message);render()}}

async function refresh(){try{const d=await api('/api/status');const newState=d.state,newMail=d.mail||[],move=newState.lastMove;if(state&&move&&move.id!==seenMoveId&&seenMoveId!==null){state=newState;mail=newMail;seenMoveId=move.id;await animateMove(move)}else{state=newState;mail=newMail;if(seenMoveId===null)seenMoveId=move?.id||0}if(!state?.me){token='';localStorage.removeItem('mobToken');openModal('loginModal')}else closeModal('loginModal');render();if(!$('#mailModal').classList.contains('hidden'))renderMail()}catch(e){toast(e.message)}}
function renderMail(){const box=$('#mailList');if(!state?.me){box.innerHTML='<p>Bitte zuerst anmelden.</p>';return}if(!mail.length){box.innerHTML='<p>Noch keine geheime Wichtelpost. Landet dein Team auf einem roten Postfeld, kann sich das ändern.</p>';return}box.innerHTML='';for(const m of mail){const d=document.createElement('article');d.className='mail-item '+(m.done?'done':'');d.innerHTML=`<h3>${m.done?'✅':'✉️'} ${escapeHtml(m.title)}</h3><p>${escapeHtml(m.desc)}</p><small>${m.done?'Erledigt · +5 Punkte':'Geheimauftrag'}</small>`;if(!m.done){const b=document.createElement('button');b.textContent='Als erledigt markieren · +5';b.onclick=()=>completeMail(m.assignmentId);d.appendChild(b)}box.appendChild(d)}}
async function completeMail(id){try{const d=await api('/api/inbox',{method:'POST',body:JSON.stringify({assignmentId:id})});mail=d.mail||[];renderMail();await refresh();toast('+5 Punkte für dein aktuelles Team!')}catch(e){toast(e.message)}}
function renderRank(){const max=Math.max(1,...Object.values(state?.scores||{}));const teams=['Rentiere','Glühwein','Lametta'];$('#rankBars').innerHTML=teams.map(t=>`<div class="rank-col"><div class="rank-score">${state.scores[t]} P</div><div class="rank-bar" style="height:${Math.max(8,230*state.scores[t]/max)}px"></div><div class="rank-name">${TEAM_ICONS[t]} ${t}</div></div>`).join('')}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

$('#rollBtn').onclick=roll;$('#loginChip').onclick=()=>openModal('loginModal');
$('#loginName').innerHTML=LOGIN_USERS.map(n=>`<option>${n}</option>`).join('');
$('#loginBtn').onclick=async()=>{try{const d=await api('/api/login',{method:'POST',body:JSON.stringify({name:$('#loginName').value,pin:$('#loginPin').value})});token=d.token;localStorage.setItem('mobToken',token);closeModal('loginModal');toast(`Willkommen, ${d.name}!`);await refresh()}catch(e){toast(e.message)}};
$('#logoutBtn').onclick=()=>{token='';localStorage.removeItem('mobToken');state=null;mail=[];showPage('home');openModal('loginModal')};
$('#startBtn').onclick=async()=>{try{await doAction('start_game');closeModal('setupModal');toast('Teams ausgelost – los geht’s!')}catch{}};
$('#resetBtn').onclick=async()=>{if(!confirm('Wirklich die komplette Partie zurücksetzen?'))return;try{await doAction('reset_game',{adminPin:$('#adminPin').value});closeModal('settingsModal');toast('Partie zurückgesetzt.');await refresh()}catch{}};
$$('.nav-btn').forEach(b=>b.onclick=()=>{const n=b.dataset.nav;if(n==='home'){showPage('home');return}if(n==='board'){showPage('board');if(state?.me&&!state.started)openModal('setupModal');return}if(n==='mail'){renderMail();openModal('mailModal')}if(n==='rank'){renderRank();openModal('rankModal')}if(n==='settings')openModal('settingsModal')});

buildBoard();renderCrew();showPage('home');if(!token)openModal('loginModal');refresh();pollTimer=setInterval(refresh,2200);if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});

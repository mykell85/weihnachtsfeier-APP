const PLAYERS=["Christian","Bene","Felix","Sven","Giovanni","Cornelius","Marco","Michael","Simon","Peter"];
const LOGIN_USERS=[...PLAYERS,"Spielleiter"];
const avatarMap=Object.fromEntries(PLAYERS.map(n=>[n,`/avatars/${n.toLowerCase()}.webp`]));
const TEAM_ASSETS={Rentiere:"/assets/team-rentiere.svg",Glühwein:"/assets/team-gluehwein.svg",Lametta:"/assets/team-lametta.svg"};
const TEAM_KEYS={Rentiere:"R",Glühwein:"G",Lametta:"L"};
const FIELD_ASSETS={mission:"/assets/icon-mission.svg",secret:"/assets/icon-secret.svg",chaos:"/assets/icon-chaos.svg",song:"/assets/icon-song.svg",finish:"/assets/icon-finish.svg"};
const FIELD_TYPES={1:"start",2:"free",3:"mission",4:"free",5:"song",6:"free",7:"free",8:"free",9:"secret",10:"free",11:"mission",12:"free",13:"chaos",14:"free",15:"song",16:"free",17:"free",18:"mission",19:"free",20:"secret",21:"free",22:"free",23:"mission",24:"free",25:"chaos",26:"free",27:"song",28:"free",29:"secret",30:"free",31:"mission",32:"free",33:"finish"};
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
let state=null,mail=[],pollTimer=null,seenMoveId=null,animating=false,authValidated=false;
let currentPage='home',crewIndex=0,crewPointerX=null,crewPointerId=null;
const imageCache=new Map();

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const wait=ms=>new Promise(r=>setTimeout(r,ms));

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2800)}
function authHeaders(){return token?{Authorization:`Bearer ${token}`}:{} }
async function api(url,opts={}){const res=await fetch(url,{...opts,headers:{'Content-Type':'application/json',...authHeaders(),...(opts.headers||{})}});let data={};try{data=await res.json()}catch{}if(!res.ok)throw new Error(data.error||`Fehler ${res.status}`);return data}
function openModal(id){$('#'+id)?.classList.remove('hidden')}
function closeModal(id){$('#'+id)?.classList.add('hidden')}
function lockAuth(){authValidated=false;document.body.classList.add('auth-locked');openModal('loginModal')}
function unlockAuth(){authValidated=true;document.body.classList.remove('auth-locked');closeModal('loginModal')}

function preloadImage(src){return new Promise(resolve=>{if(imageCache.has(src))return resolve(imageCache.get(src));const img=new Image();img.onload=()=>{imageCache.set(src,src);resolve(src)};img.onerror=()=>resolve(src);img.src=src})}
function preloadAvatars(){return Promise.all([...Object.values(avatarMap),...Object.values(TEAM_ASSETS),...Object.values(FIELD_ASSETS),"/assets/nav-home.svg","/assets/nav-board.svg","/assets/nav-mail.svg","/assets/nav-admin.svg"].map(preloadImage))}

function ensureAudio(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;window._ac ||= new Ctx();if(window._ac.state==='suspended')window._ac.resume();return window._ac}catch{return null}}
function blip(freq=440,start=0,dur=.08,type='triangle',gain=.025){const ac=ensureAudio();if(!ac)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=freq;g.gain.value=gain;o.connect(g);g.connect(ac.destination);o.start(ac.currentTime+start);g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+start+dur);o.stop(ac.currentTime+start+dur)}
function playClick(){blip(880,0,.03,'triangle',.018);blip(1174,.04,.045,'sine',.014)}
function playError(){blip(230,0,.08,'square',.025);blip(180,.06,.12,'square',.018)}
function playSuccess(){blip(784,0,.06,'triangle',.02);blip(988,.07,.08,'triangle',.018);blip(1174,.14,.12,'sine',.016)}
function playMove(step){blip(370+(step%6)*55,0,.05,'triangle',.017)}
function playRoll(){blip(430,0,.05,'square',.018);blip(540,.06,.05,'triangle',.014);blip(660,.12,.05,'triangle',.014)}
function playOpen(){blip(523,0,.05,'sine',.015);blip(659,.05,.05,'sine',.015);blip(784,.1,.08,'sine',.013)}

function teamIconHtml(team,cls="inline-team-icon"){return `<img class="${cls}" src="${TEAM_ASSETS[team]}" alt="${team}">`}
function fieldIconHtml(kind,cls="inline-field-icon"){const src=FIELD_ASSETS[kind];return src?`<img class="${cls}" src="${src}" alt="${kind}">`:''}

function showPage(name){currentPage=name;$('#homePage').classList.toggle('active',name==='home');$('#boardPage').classList.toggle('active',name==='board');$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===name))}
function crewPages(){const pages=[];for(let i=0;i<PLAYERS.length;i+=2)pages.push(PLAYERS.slice(i,i+2));return pages}
function setupCrewDots(){const dots=$('#crewDots'),pages=crewPages();if(!dots)return;dots.innerHTML='';pages.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.className=i===crewIndex?'active':'';b.setAttribute('aria-label',`Wichtelgruppe ${i+1}`);b.addEventListener('click',e=>{e.stopPropagation();setCrew(i)});dots.appendChild(b)})}
function setCrewPair(li,ri){const pair=crewPages()[crewIndex]||[];const leftName=pair[0],rightName=pair[1];
 if(leftName){li.src=avatarMap[leftName];li.alt=leftName;li.style.visibility='visible';$('#crewLeftName').textContent=leftName}else{li.style.visibility='hidden';li.removeAttribute('src');$('#crewLeftName').textContent=''}
 if(rightName){ri.src=avatarMap[rightName];ri.alt=rightName;ri.style.visibility='visible';$('#crewRightName').textContent=rightName}else{ri.style.visibility='hidden';ri.removeAttribute('src');$('#crewRightName').textContent=''}
 $$('#crewDots button').forEach((d,i)=>d.classList.toggle('active',i===crewIndex));
}
async function paintCrew(animate=true){const li=$('#crewLeftImg'),ri=$('#crewRightImg');if(!li||!ri)return;const pair=crewPages()[crewIndex]||[];await Promise.all(pair.map(name=>preloadImage(avatarMap[name])));if(!animate){setCrewPair(li,ri);return}li.classList.add('switching');ri.classList.add('switching');await wait(140);setCrewPair(li,ri);requestAnimationFrame(()=>{li.classList.remove('switching');ri.classList.remove('switching')})}
function setCrew(i){crewIndex=Math.max(0,Math.min(crewPages().length-1,i));playClick();paintCrew(true)}
function moveCrew(dir){const count=crewPages().length;crewIndex=(crewIndex+dir+count)%count;playClick();paintCrew(true)}
function renderCrew(){const host=$('#assetCrew'),prev=$('#crewPrev'),next=$('#crewNext');if(!host)return;setupCrewDots();paintCrew(false);if(!host.dataset.carousel){host.dataset.carousel='1';prev?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();moveCrew(-1)});next?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();moveCrew(1)});host.addEventListener('pointerdown',e=>{if(e.target.closest('.crew-hit')||e.target.closest('.crew-dots-live'))return;crewPointerId=e.pointerId;crewPointerX=e.clientX;try{host.setPointerCapture(e.pointerId)}catch{}});host.addEventListener('pointerup',e=>{if(crewPointerX===null||crewPointerId!==e.pointerId)return;const dx=e.clientX-crewPointerX;crewPointerX=null;crewPointerId=null;if(Math.abs(dx)>34)moveCrew(dx<0?1:-1)});host.addEventListener('pointercancel',()=>{crewPointerX=null;crewPointerId=null})}}
window.setCrew=setCrew; window.moveCrew=moveCrew;
$$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));

function buildBoard(){
 const fields=$('#fields');let pts=[];fields.innerHTML='';$('#tokens').innerHTML='';
 for(let i=1;i<=33;i++){
   const [x,y]=POS[i];pts.push(`${x},${y}`);const type=FIELD_TYPES[i];const el=document.createElement('div');
   el.className=`field ${type} ${['mission','secret','chaos','song','finish'].includes(type)?'action':''}`;el.dataset.field=i;el.style.left=x+'%';el.style.top=y+'%';el.title=`Feld ${i}: ${type}`;
   if(['mission','secret','chaos','song','finish'].includes(type)) el.innerHTML=`<span class="field-icon">${fieldIconHtml(type,'field-icon-img')}</span>`;
   else if(type==='start') el.innerHTML='<span class="field-label start-label">START</span>';
   else el.innerHTML=`<span class="field-number">${i}</span>`;
   fields.appendChild(el);
 }
 $('#routeLine').setAttribute('points',pts.join(' '));
 const tok=$('#tokens');
 for(const team of Object.keys(TEAM_ASSETS)){
   const el=document.createElement('div');el.id='token'+TEAM_KEYS[team];el.className='team-token '+team;el.title=team;
   el.innerHTML=`<div class="pawn"><img class="token-art" src="${TEAM_ASSETS[team]}" alt="${team}"></div>`;
   tok.appendChild(el);
 }
}
function tokenOffset(team){return team==='Rentiere'?-1.8:team==='Glühwein'?0:1.8}
function placeToken(team,field,instant=false){const el=$('#token'+TEAM_KEYS[team]);const [x,y]=POS[Math.max(1,Math.min(33,field))];if(!el)return;if(instant)el.style.transition='none';el.style.left=(x+tokenOffset(team))+'%';el.style.top=y+'%';if(instant)requestAnimationFrame(()=>el.style.transition='')}
function lightField(n){$$('.field').forEach(f=>f.classList.remove('lit'));const f=$(`.field[data-field="${n}"]`);if(f){void f.offsetWidth;f.classList.add('lit')}}
async function animateMove(move){if(!move||animating)return;animating=true;const team=move.team;placeToken(team,move.from,true);await wait(380);for(let f=move.from+1;f<=move.to;f++){const el=$('#token'+TEAM_KEYS[team]);el.classList.remove('step');void el.offsetWidth;el.classList.add('step');placeToken(team,f);playMove(f);await wait(560)}lightField(move.to);playSuccess();await wait(520);animating=false}

function showDiceValue(value,animate=true){
 const die=$('#dice'),result=$('#diceResult');if(!die)return;const v=Number(value)||1;
 const rotations={1:[0,0],2:[-90,0],3:[0,-90],4:[0,90],5:[90,0],6:[0,180]};
 const [rx,ry]=rotations[v];die.dataset.value=String(v);die.classList.remove('rolling','landed');
 if(!animate){die.style.transition='none';die.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`;requestAnimationFrame(()=>die.style.transition='')}
 else{die.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`;void die.offsetWidth;die.classList.add('landed')}
 if(result)result.textContent=`Gewürfelt: ${v}`;
}

function render(){if(!state)return;
 $('#scoreR').textContent=(state.scores?.Rentiere||0)+' P';$('#scoreG').textContent=(state.scores?.Glühwein||0)+' P';$('#scoreL').textContent=(state.scores?.Lametta||0)+' P';
 for(const t of Object.keys(TEAM_ASSETS)) placeToken(t,state.positions?.[t]||1,true);
 const active=['Rentiere','Glühwein','Lametta'][state.turnIndex%3];$('#turnLabel').innerHTML=`${teamIconHtml(active)} ${active}`;
 const me=state.me;const canRoll=!!(state.started&&!state.pending&&!state.final?.complete&&(me?.team===active||me?.spielleiter));
 $('#rollBtn').disabled=!canRoll;
 $('#turnHint').textContent=state.final?.complete?'Partie beendet':!me?'Bitte anmelden':me.spielleiter?'Spielleiter · freies Würfeln':canRoll?'Ihr seid dran – würfeln!':`Aktiv ist ${active}`;
 $('#loginChip').textContent=me?`🎅 ${me.name}${me.spielleiter?' · Testmodus':` · ${me.team||'–'}`}`:'🎅 Anmelden';
 $('#logoutBtn').classList.toggle('hidden',!me);
 $('#mailBadge').textContent=mail.filter(x=>!x.done).length;$('#mailBadge').classList.toggle('hidden',!mail.some(x=>!x.done));
 if(state.started) closeModal('setupModal');
 if(state.pending) showPending(state.pending); else closeModal('eventModal');
 if(state.final?.complete){const winners=state.final.winners||[];$('#finalText').textContent=winners.length===1?`🎄 Sieger: ${winners[0]}!`:`🎄 Gleichstand: ${winners.join(' & ')} – Weihnachts-Stechen!`}
}
function showPending(p){
 const c=$('#eventCard');c.className='modal-card event-card '+p.kind;$('#eventKicker').textContent=p.kind==='mission'?'Missions-Lostrommel':p.kind==='secret'?'Geheime Wichtelpost':p.kind==='chaos'?'Weihnachtschaos':'Lieder-Rad';
 $('#eventIcon').innerHTML=p.kind==='mission'?fieldIconHtml('mission','modal-kind-icon'):p.kind==='secret'?fieldIconHtml('secret','modal-kind-icon'):p.kind==='chaos'?fieldIconHtml('chaos','modal-kind-icon'):fieldIconHtml('song','modal-kind-icon');
 $('#eventTitle').textContent=p.kind==='secret'?`Post für ${p.recipient}`:p.item?.title||'Aktion';
 let meta=`${p.team}`;if(p.kind==='mission'){meta+=` · ${p.item.points} Punkte`;if(p.performer)meta+=` · ${p.performer} ist dran`}if(p.kind==='song')meta+=' · 3 Punkte';$('#eventMeta').innerHTML=`${teamIconHtml(p.team,'inline-team-icon small')} ${meta}`;
 $('#eventText').textContent=p.kind==='secret'?`${p.recipient} hat eine geheime Aufgabe ins persönliche Postfach bekommen. Der Inhalt bleibt für alle anderen verborgen.`:(p.item?.desc||p.item?.text||'');
 const eff=$('#eventEffect');if(p.effect){eff.textContent=p.effect;eff.classList.remove('hidden')} else eff.classList.add('hidden');
 const a=$('#eventActions');a.innerHTML='';const me=state.me;
 if(p.kind==='mission'||p.kind==='song'){
   const own=me?.team===p.team||me?.spielleiter;
   if(p.kind==='mission'&&state.modifiers?.redrawAvailable&&own) a.append(btn('🎟️ Neu ziehen','redraw',()=>doAction('redraw')));
   a.append(btn('✅ Geschafft','success',()=>doResolve(true),!own));
   a.append(btn('❌ Nicht geschafft','fail',()=>doResolve(false),!own));
 } else a.append(btn('Weiter','',()=>doResolve(true),!me));
 openModal('eventModal');playOpen();
}
function btn(label,cls,fn,disabled=false){const b=document.createElement('button');b.textContent=label;b.className=cls;b.disabled=disabled;b.onclick=async()=>{playClick();b.classList.add('pressed');try{await fn()}finally{setTimeout(()=>b.classList.remove('pressed'),150)}};return b}
async function doResolve(success){try{const d=await api('/api/action',{method:'POST',body:JSON.stringify({action:'resolve',success})});state=d.state;if(success)playSuccess();render();await refresh()}catch(e){playError();toast(e.message)}}
async function doAction(action,extra={}){try{const d=await api('/api/action',{method:'POST',body:JSON.stringify({action,...extra})});state=d.state;render();return d}catch(e){playError();toast(e.message);throw e}}
async function roll(){
 if($('#rollBtn').disabled) return;
 playRoll();const die=$('#dice'),result=$('#diceResult'),btn=$('#rollBtn');btn.disabled=true;
 if(result)result.textContent='Der Würfel rollt …';die.classList.remove('landed');die.style.transition='none';die.style.transform='';die.classList.add('rolling');
 try{
   const [d]=await Promise.all([api('/api/action',{method:'POST',body:JSON.stringify({action:'roll'})}),wait(1650)]);
   state=d.state;const value=state.lastMove.roll;die.classList.remove('rolling');
   requestAnimationFrame(()=>{die.style.transition='transform .9s cubic-bezier(.18,.8,.22,1.08)';showDiceValue(value,true)});
   await wait(950);
   const move=state.lastMove;if(move&&move.id!==seenMoveId){seenMoveId=move.id;await animateMove(move)}
   await wait(state.pending?850:320);render();await refresh();
 }catch(e){die.classList.remove('rolling');playError();if(result)result.textContent='Bitte noch einmal versuchen';toast(e.message);render()}
}

async function refresh(){if(!token){lockAuth();return}
 try{const d=await api('/api/status');const newState=d.state,newMail=d.mail||[],move=newState.lastMove;
   if(!newState?.me){token='';localStorage.removeItem('mobToken');state=null;mail=[];lockAuth();return}
   unlockAuth();
   if(state&&move&&move.id!==seenMoveId&&seenMoveId!==null){state=newState;mail=newMail;seenMoveId=move.id;await animateMove(move)}
   else {state=newState;mail=newMail;if(seenMoveId===null) seenMoveId=move?.id||0}
   render();if(!$('#mailModal').classList.contains('hidden')) renderMail();
 }catch(e){if(e.message==='UNAUTHORIZED'||e.message.includes('401')){token='';localStorage.removeItem('mobToken');state=null;mail=[];lockAuth();return}toast(e.message)}}
function renderMail(){const box=$('#mailList');if(!state?.me){box.innerHTML='<p>Bitte zuerst anmelden.</p>';return}if(!mail.length){box.innerHTML='<p>Noch keine geheime Wichtelpost. Landet dein Team auf einem roten Postfeld, kann sich das ändern.</p>';return}box.innerHTML='';for(const m of mail){const d=document.createElement('article');d.className='mail-item '+(m.done?'done':'');d.innerHTML=`<h3>${m.done?'✅':'✉️'} ${escapeHtml(m.title)}</h3><p>${escapeHtml(m.desc)}</p><small>${m.done?'Erledigt · +5 Punkte':'Geheimauftrag'}</small>`;if(!m.done){const b=document.createElement('button');b.textContent='Als erledigt markieren · +5';b.onclick=()=>{playClick();completeMail(m.assignmentId)};d.appendChild(b)}box.appendChild(d)}}
async function completeMail(id){try{const d=await api('/api/inbox',{method:'POST',body:JSON.stringify({assignmentId:id})});mail=d.mail||[];renderMail();await refresh();playSuccess();toast('+5 Punkte für dein aktuelles Team!')}catch(e){playError();toast(e.message)}}
function renderRank(){const scores=state?.scores||{Rentiere:0,Glühwein:0,Lametta:0};const max=Math.max(1,...Object.values(scores));const teams=['Rentiere','Glühwein','Lametta'];$('#rankBars').innerHTML=teams.map(t=>`<div class="rank-col"><div class="rank-score">${scores[t]} P</div><div class="rank-bar" style="height:${Math.max(12,230*scores[t]/max)}px"></div><div class="rank-name">${teamIconHtml(t,'inline-team-icon rank')} <span>${t}</span></div></div>`).join('')}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

$('#rollBtn').onclick=()=>{playClick();roll()};
$('#openRankBtn')?.addEventListener('click',()=>{playClick();renderRank();openModal('rankModal')});
$('#loginChip').onclick=()=>{playClick();if(authValidated){if(confirm('Abmelden und Benutzer wechseln?')) $('#logoutBtn').click()}else lockAuth()};
$('#loginName').innerHTML=LOGIN_USERS.map(n=>`<option>${n}</option>`).join('');
$('#loginBtn').onclick=async()=>{playClick();try{const d=await api('/api/login',{method:'POST',body:JSON.stringify({name:$('#loginName').value,pin:$('#loginPin').value})});token=d.token;localStorage.setItem('mobToken',token);await refresh();if(authValidated){$('#loginPin').value='';playSuccess();toast(`Willkommen, ${d.name}!`)}}catch(e){playError();lockAuth();toast(e.message)}};
$('#logoutBtn').onclick=()=>{playClick();token='';localStorage.removeItem('mobToken');state=null;mail=[];showPage('home');lockAuth()};
$('#startBtn').onclick=async()=>{playClick();try{await doAction('start_game');closeModal('setupModal');toast('Teams ausgelost – los geht’s!')}catch{}};
$('#resetBtn').onclick=async()=>{playClick();if(!confirm('Wirklich die komplette Partie zurücksetzen?'))return;try{await doAction('reset_game',{adminPin:$('#adminPin').value});closeModal('settingsModal');toast('Partie zurückgesetzt.');await refresh()}catch{}};
$$('.nav-btn').forEach(b=>b.onclick=()=>{playClick();const n=b.dataset.nav;if(n==='home'){showPage('home');return}if(n==='board'){showPage('board');if(state?.me&&!state.started) openModal('setupModal');return}if(n==='mail'){renderMail();openModal('mailModal');return}if(n==='settings'){openModal('settingsModal');return}});

document.addEventListener('keydown',e=>{if(e.key==='Escape') ['mailModal','rankModal','settingsModal','eventModal'].forEach(id=>closeModal(id))});

buildBoard();showDiceValue(1,false);preloadAvatars();renderCrew();showPage('home');lockAuth();if(token) refresh();pollTimer=setInterval(()=>{if(token&&!animating) refresh()},2600);if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js?v=board16').catch(()=>{});

'use strict';
function drawP(c,p,cx,cy,sc,alpha){
  const sq=p.sq>0?Math.sin(p.sq*Math.PI)*.22:0, bo=p.born>0?1+Math.sin(p.born*Math.PI)*.35:1;
  const w=S*sc*(1+sq)*bo, h=S*sc*(1-sq)*bo;
  c.globalAlpha=alpha;
  if(p.sp==='r'){for(let i=0;i<6;i++){c.strokeStyle=COLORS[i]; c.lineWidth=S*.08; c.beginPath(); const a=time*2.4+i*Math.PI/3; c.arc(cx,cy,S*.46*sc,a,a+Math.PI/3); c.stroke();}}
  c.drawImage(spr[p.sp==='r'?6:p.t===-2?7:p.t],cx-w/2,cy+S*sc/2-h-(bo-1)*S*sc/2,w,h);
  if(p.sp==='h'||p.sp==='v'){
    c.save(); c.translate(cx,cy); c.scale(sc,sc); if(p.sp==='v') c.rotate(Math.PI/2);
    c.fillStyle='rgba(255,255,255,.95)'; c.shadowColor='rgba(255,220,120,1)'; c.shadowBlur=S*.15;
    for(const yy of [-.17,.17]){rr(c,-S*.34,yy*S-S*.035,S*.68,S*.07,S*.035); c.fill();}
    for(const s of [-1,1]){c.beginPath(); c.moveTo(s*S*.48,0); c.lineTo(s*S*.35,-S*.11); c.lineTo(s*S*.35,S*.11); c.closePath(); c.fill();}
    c.restore();
  } else if(p.sp==='b'){
    c.save(); c.strokeStyle='#ffe08a'; c.lineWidth=S*.07; c.shadowColor='#ffcc4d'; c.shadowBlur=S*.3;
    c.beginPath(); c.arc(cx,cy,S*.46*sc*(1+.05*Math.sin(time*7)),0,7); c.stroke(); c.restore();
  }
  c.globalAlpha=1;
}
function draw(){
  const c=ctx; c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,B,B);
  if(shake>0) c.translate((Math.random()-.5)*shake*S*.3,(Math.random()-.5)*shake*S*.3);
  if(bg) c.drawImage(bg,0,0,B,B);
  for(let r=0;r<N;r++) for(let k=0;k<N;k++) if(sand[r]&&sand[r][k]>0) c.drawImage(sandSpr[sand[r][k]],F+k*S,F+r*S,S,S);
  c.save(); c.beginPath(); c.rect(F,F,S*N,S*N); c.clip();
  for(let r=0;r<N;r++) for(let k=0;k<N;k++){
    const p=board[r]&&board[r][k]; if(!p) continue;
    let ox=0, oy=0, sc=1; const key=K(r,k);
    if(hint&&(key===hint[0]||key===hint[1])){const o=key===hint[0]?hint[1]:hint[0], m=Math.max(0,Math.sin(time*9))*S*.09; ox=Math.sign(C_(o)-k)*m; oy=Math.sign(R_(o)-r)*m;}
    if(key===sel) sc=1.12+Math.sin(time*8)*.03;
    drawP(c,p,px(p.x)+ox,px(p.y)+oy,sc,1);
  }
  for(const d of dying){const t=d.t, sc=t<.35?1+t/.35*.25:1.25*(1-(t-.35)/.65); drawP(c,d.p,px(d.p.x),px(d.p.y),Math.max(.01,sc),1-t*t);}
  c.restore();
  if(sel>=0){c.strokeStyle='#fff'; c.lineWidth=3; rr(c,F+C_(sel)*S+2,F+R_(sel)*S+2,S-4,S-4,S*.18); c.stroke();}
  if(kbd&&!over){c.strokeStyle='rgba(255,224,138,.9)'; c.lineWidth=2; c.setLineDash([5,4]); rr(c,F+C_(cur)*S+4,F+R_(cur)*S+4,S-8,S-8,S*.16); c.stroke(); c.setLineDash([]);}
  c.save(); c.globalCompositeOperation='lighter';
  for(const b of beams){const a=1-b.t, w=S*(.95-.6*b.t);
    if(b.o==='h'){const y=px(b.r), g=c.createLinearGradient(0,y-w/2,0,y+w/2); g.addColorStop(0,'rgba(255,190,70,0)'); g.addColorStop(.5,`rgba(255,246,215,${a})`); g.addColorStop(1,'rgba(255,190,70,0)'); c.fillStyle=g; c.fillRect(F,y-w/2,S*N,w);}
    else {const x=px(b.c), g=c.createLinearGradient(x-w/2,0,x+w/2,0); g.addColorStop(0,'rgba(255,190,70,0)'); g.addColorStop(.5,`rgba(255,246,215,${a})`); g.addColorStop(1,'rgba(255,190,70,0)'); c.fillStyle=g; c.fillRect(x-w/2,F,w,S*N);}}
  for(const g of rings){c.strokeStyle=`rgba(255,220,120,${1-g.t})`; c.lineWidth=S*.3*(1-g.t); c.beginPath(); c.arc(px(g.c),px(g.r),S*(.4+g.t*g.max),0,7); c.stroke();}
  for(const z of zaps){const x0=px(z.c0), y0=px(z.r0), x1=px(z.c1), y1=px(z.r1); c.strokeStyle=`rgba(255,255,255,${1-z.t})`; c.lineWidth=S*.07;
    c.beginPath(); c.moveTo(x0,y0); c.lineTo((x0+x1)/2+(Math.random()-.5)*S*.5,(y0+y1)/2+(Math.random()-.5)*S*.5); c.lineTo(x1,y1); c.stroke();}
  c.restore();
  for(const q of parts){c.globalAlpha=Math.max(0,q.life/q.max); c.fillStyle=q.col; c.save(); c.translate(q.x,q.y); c.rotate(q.rot); c.fillRect(-q.sz/2,-q.sz*.3,q.sz,q.sz*.6); c.restore();}
  c.globalAlpha=1;
  for(const x of texts){
    const t=x.t, k=Math.min(1,t/.12)*(1+.18*Math.max(0,1-t*4)), a=t>.8?Math.max(0,(1.1-t)/.3):1, size=x.size*k;
    c.globalAlpha=a; c.font=`${size}px Lalezar, "Baloo Bhaijaan 2", sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    const y=x.y-S*.7*t; c.save(); if(x.big){c.translate(x.x,y); c.rotate(Math.sin(t*14)*.09*Math.max(0,1-t)); c.translate(-x.x,-y);} c.lineJoin='round'; c.lineWidth=size*.16; c.strokeStyle='#2a1406'; c.strokeText(x.s,x.x,y);
    if(x.small) c.fillStyle='#fff'; else {const g=c.createLinearGradient(0,y-size/2,0,y+size/2); g.addColorStop(0,'#fff3b0'); g.addColorStop(1,'#f0a020'); c.fillStyle=g;}
    c.fillText(x.s,x.x,y); c.restore();
  }
  c.globalAlpha=1;
}
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000); last=now; time+=dt; update(dt,now); draw(); requestAnimationFrame(frame);}

/* ---------- HUD, keeper, overlays ---------- */
function hud(){
  $('#lvl').textContent=ar(lvl+1); $('#score').textContent=ar(score); $('#moves').textContent=ar(Math.max(0,moves));
  $('#movesBox').classList.toggle('low',moves<=3&&!over);
  document.querySelectorAll('.goal').forEach(el=>{
    const v=el.dataset.t==='s'?sandLeft():el.dataset.t==='c'?crateLeft():goals[el.dataset.t];
    el.querySelector('b').textContent=v>0?ar(v):'✓'; el.classList.toggle('done',v<=0);
  });
  $('#coins').textContent=ar(bag.coins); $('#chestN').textContent=`${ar(Math.min(bag.chest,CHEST))}/${ar(CHEST)}`;
  for(const id of ['hammer','shuf']){const b=$('#'+id); b.querySelector('i').textContent=ar(bag[id]); b.disabled=over||!bag[id];}
  $('#hammer').setAttribute('aria-pressed',String(aim)); cv.classList.toggle('aim',aim);
}
function iconCanvas(draw){const o=document.createElement('canvas'); o.width=o.height=36*dpr; const g=o.getContext('2d'); g.scale(dpr,dpr); draw(g); return o;}
function buildGoals(){
  const box=$('#goals'); box.innerHTML='';
  const add=(key,cvs,label)=>{const d=document.createElement('div'); d.className='goal'; d.dataset.t=key; d.setAttribute('aria-label',label); d.append(cvs,document.createElement('b')); box.append(d);};
  for(const t in goals) add(t,iconCanvas(g=>{g.translate(18,18); drawPiece(g,+t,14);}),NAMES[t]);
  if(sandGoal) add('s',iconCanvas(g=>drawSandTile(g,1,36)),SAND);
  if(crateGoal) add('c',iconCanvas(g=>{g.translate(18,18); drawKind(g,'crate',14);}),CRATE);
}
function bump(t){const el=document.querySelector(`.goal[data-t="${t}"]`); if(!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');}
function crateTip(L){
  if(!L.crate) return '';
  try{if(localStorage.getItem('soukKhan.crateTip')) return ''; localStorage.setItem('soukKhan.crateTip','1');}catch(e){} // shortcut: no storage = tip every crate level
  return EN?'Crates break when you match right next to them!':'الصناديق بتتكسر لما توفّق جنبها على طول!';
}
function say(x){const arr=KEEPER[x], el=$('#sayText'); el.textContent=arr?arr[rnd(arr.length)]:x; const b=$('#bubble'); b.classList.remove('talk'); void b.offsetWidth; b.classList.add('talk');}
const ov=$('#ov'), card=$('#card');
function show(html,btns){
  card.innerHTML=html; ov.hidden=false; over=true; aim=false; hud();
  for(const [id,fn] of Object.entries(btns)){const el=card.querySelector('#'+id); if(el) el.onclick=()=>{ensureAudio(); fn();};}
  const b=card.querySelector('button'); if(b) b.focus({preventScroll:true});
}
const hide=()=>{ov.hidden=true;};
function goalText(L){
  const parts=Object.entries(L.goals||{}).map(([t,n])=>`${ar(n)} ${NAMES[t]}`);
  if(L.sand) parts.push(EN?'clean all the sand':'نضّف كل الرملة');
  if(L.crate) parts.push(EN?'break all the crates':'اكسر كل الصناديق');
  return parts.join(AND);
}
function loadLevel(){try{return Math.min(LEVELS.length-1,Math.max(0,+localStorage.getItem('soukKhan.level')||0));}catch(e){return 0;}}
function saveLevel(i){try{localStorage.setItem('soukKhan.level',String(Math.min(i,LEVELS.length-1)));}catch(e){}}
/* ---------- rewards: one saved bag ---------- */
const CHEST=6, PLUS5=100, DAY=()=>new Date().toDateString();
const ICON={hammer:'🔨',shuf:'🔀',plus5:'➕'}, BNAME=EN?{hammer:'a hammer',shuf:'a shuffle',plus5:'+5 moves'}:{hammer:'شاكوش',shuf:'لخبطة',plus5:'+٥ حركات'};
let bag=(()=>{let b={}; try{b=JSON.parse(localStorage.getItem('soukKhan.bag'))||{};}catch(e){} return {coins:0,hammer:1,shuf:1,plus5:0,stars:{},chest:0,day:'',...b};})();
function saveBag(){try{localStorage.setItem('soukKhan.bag',JSON.stringify(bag));}catch(e){}}
function addStars(i,s){const old=bag.stars[i]||0, gain=Math.max(0,s-old); bag.stars[i]=old+gain; bag.chest+=gain; return gain;} // only stars above the old best fill the chest, so replays can't farm it
const totalStars=()=>Object.values(bag.stars).reduce((a,b)=>a+b,0);
function grant(coins){const k=['hammer','shuf','plus5'][rnd(3)]; bag.coins+=coins; bag[k]++; saveBag(); return {coins,k};}
const openChest=()=>{bag.chest-=CHEST; return grant(50+rnd(4)*25);};
const dailyGift=()=>{bag.day=DAY(); return grant(50);};
function prizeCard(title,give,then){
  show(`<h2>${title}</h2><button class="prize shake" id="open" aria-label="${EN?'Open':'افتح'}">🎁</button><p>${EN?'Tap to open':'دوس عشان تفتح'}</p>`,{open:()=>{
    const {coins,k}=give(); sfx('win'); buzz([30,40,60]);
    for(let i=0;i<40;i++) burst({x:Math.random()*N-.5,y:Math.random()*N-.5,t:rnd(T)},1);
    show(`<h2>${EN?'You got':'كسبت'}</h2><div class="prize pop">${ICON[k]}</div><p>🪙 ${ar(coins)} + ${BNAME[k]}</p><button class="btn" id="go">${EN?'Nice!':'حلو!'}</button>`,{go:then});
  }});
}

function startScreen(){
  if(bag.day!==DAY()) return prizeCard(EN?'Daily gift!':'هدية النهارده!',dailyGift,startScreen);
  const saved=loadLevel();
  if(EN) show(`<h2>Souk el-Khan</h2>
    <p>The family shop needs your hands, boss. Drag any item onto its neighbour to line up 3 or more of the same.</p>
    <ul class="how">
      <li><b>4 in a row</b> → a beam that clears the whole line</li>
      <li><b>L or T shape</b> → a bundle that blasts everything around it</li>
      <li><b>5 in a row</b> → Grandma's slipper: wipes out a whole colour</li>
      <li><b>Swap two specials</b> → an even bigger blast</li>
    </ul>
    ${vibRow()}
    <button class="btn" id="go">Play${saved?' · Level '+ar(saved+1):''}</button>
    ${saved?'<button class="link" id="map">Map</button>':''}`,
    {go:()=>intro(saved),map:mapScreen});
  else show(`<h2>سوق الخان</h2>
    <p>دكان العيلة محتاج إيدك يا معلم. اسحب أي حاجة لجنبها عشان توفّق ٣ زي بعض أو أكتر.</p>
    <ul class="how">
      <li><b>٤ في صف</b> ← خط بيمسح الصف كله</li>
      <li><b>شكل L أو T</b> ← صُرّة بتفرقع اللي حواليها</li>
      <li><b>٥ في صف</b> ← شبشب تيتة: بيمسح لون بحاله</li>
      <li><b>بدّل حاجتين مميزين</b> ← تفرقع أكبر</li>
    </ul>
    ${vibRow()}
    <button class="btn" id="go">العب${saved?' · المرحلة '+ar(saved+1):''}</button>
    ${saved?'<button class="link" id="map">الخريطة</button>':''}`,
    {go:()=>intro(saved),map:mapScreen});
}
function intro(i){
  setChapter(i); const L=LEVELS[i];
  show(EN?`<p class="eyebrow">${CH.name} · Level ${i+1} of ${LEVELS.length}</p><h2>${L.name}</h2><p>${goalText(L)}<br>in ${L.moves} moves</p><button class="btn" id="go">Let's go!</button><button class="link" id="map">Map</button>`
    :`<p class="eyebrow">${CH.name} · المرحلة ${ar(i+1)} من ${ar(LEVELS.length)}</p><h2>${L.name}</h2><p>${goalText(L)}<br>في ${ar(L.moves)} حركة</p><button class="btn" id="go">يلا بينا</button><button class="link" id="map">الخريطة</button>`,
    {go:()=>{hide(); startLevel(i);},map:mapScreen});
}
// Metwally's trip: one stop per chapter, levels unlock in order
function mapScreen(){
  const at=loadLevel();
  const stops=CHAPTERS.map((C,c)=>{const last=(CHAPTERS[c+1]||{first:LEVELS.length}).first;
    let nodes=''; for(let i=C.first;i<last;i++){const st=bag.stars[i]||0;
      nodes+=i>at?`<button class="node" disabled aria-label="${EN?'Locked':'مقفولة'}">🔒</button>`
        :`<button class="node${i===at?' now':''}" data-i="${i}">${ar(i+1)}<small>${'★'.repeat(st)||'·'}</small></button>`;}
    return `<div class="stop"><p class="eyebrow"><i data-k="${C.tiles[0]}"></i>${C.name}</p><p>${C.trip}</p><div class="nodes">${nodes}</div></div>`;}).join('');
  show(`<h2>${EN?"Metwally's trip":'رحلة عم متولي'}</h2><div class="map">${stops}</div>`,{});
  document.querySelectorAll('.stop i[data-k]').forEach(el=>{const k=el.dataset.k; el.replaceWith(iconCanvas(g=>{g.translate(18,18); drawKind(g,k,14);}));});
  document.querySelectorAll('.node[data-i]').forEach(b=>b.onclick=()=>{ensureAudio(); intro(+b.dataset.i);});
  const now=document.querySelector('.node.now'); if(now){now.focus({preventScroll:true}); now.scrollIntoView({block:'center'});}
}
async function startLevel(i){
  lvl=i; setChapter(i); const L=LEVELS[i];
  moves=L.moves; score=0; goals={...(L.goals||{})}; sandGoal=!!L.sand; crateGoal=!!L.crate;
  sand=L.sand?L.sand.map(s=>[...s].map(Number)):Array.from({length:N},()=>new Array(N).fill(0));
  dying.length=parts.length=beams.length=rings.length=zaps.length=texts.length=0;
  sel=-1; hint=null; busy=true; over=false;
  fillBoard(); buildGoals(); hud(); say(crateTip(L)||L.say); cv.focus({preventScroll:true});
  await settle(); busy=false; lastAct=performance.now();
}
async function win(){
  over=true; busy=true; const L=LEVELS[lvl];
  const stars=moves>=Math.ceil(L.moves*.3)?3:moves>=Math.ceil(L.moves*.12)?2:1;
  say('win'); sfx('win'); buzz([40,50,40,50,60]);
  texts.push({s:EN?'Bravo!':'برافو!',x:B/2,y:B*.45,t:0,size:S*1.4});
  confetti(); rings.push({r:(N-1)/2,c:(N-1)/2,t:0,max:5}); shake=.6;
  eachCell(k=>{const p=at(k); if(p) setTimeout(()=>{p.born=1;},(R_(k)+C_(k))*45);});
  await sleep(1100);
  const bonus=moves*300; score+=bonus; hud();
  const next=lvl+1, lastOne=next>=LEVELS.length, newCh=!lastOne&&chapterOf(next)!==chapterOf(lvl); saveLevel(Math.max(loadLevel(),next));
  const gain=addStars(lvl,stars); saveBag();
  const then=()=>lastOne||newCh?mapScreen():intro(next), go=()=>bag.chest>=CHEST?prizeCard(EN?'Star chest!':'صندوق النجوم!',openChest,then):then();
  const chest=`<p>⭐ ${ar(totalStars())}${gain?` <small>(+${ar(gain)})</small>`:''} · 🎁 ${ar(Math.min(bag.chest,CHEST))}/${ar(CHEST)}</p><div class="meter" aria-hidden="true"><i style="width:${Math.min(1,bag.chest/CHEST)*100}%"></i></div>`;
  if(EN) show(`<p class="eyebrow">${L.name}</p><h2>${lastOne?"Metwally's trip is complete!":'Bravo!'}</h2>
    <div class="stars" aria-label="${stars} of 3 stars">${[0,1,2].map(i=>`<span class="${i<stars?'on':''}">★</span>`).join('')}</div>
    <p>Score: ${ar(score)}${bonus?`<br><small>${ar(bonus)} of it for the moves you had left</small>`:''}</p>${chest}
    <button class="btn" id="go">${lastOne?'Map':newCh?'Next stop':'Next level'}</button>`,{go});
  else show(`<p class="eyebrow">${L.name}</p><h2>${lastOne?'رحلة عم متولي خلصت!':'برافو!'}</h2>
    <div class="stars" aria-label="${ar(stars)} من ٣ نجوم">${[0,1,2].map(i=>`<span class="${i<stars?'on':''}">★</span>`).join('')}</div>
    <p>النقط: ${ar(score)}${bonus?`<br><small>منهم ${ar(bonus)} على الحركات اللي فضلت</small>`:''}</p>${chest}
    <button class="btn" id="go">${lastOne?'الخريطة':newCh?'المحطة اللي بعدها':'المرحلة اللي بعدها'}</button>`,{go});
}
async function lose(){
  over=true; busy=true; say('lose'); sfx('lose'); await sleep(700);
  const left=Object.entries(goals).filter(([,v])=>v>0).map(([t,v])=>`${ar(v)} ${NAMES[t]}`);
  if(sandGoal&&sandLeft()>0) left.push(`${ar(sandLeft())} ${SAND}`);
  if(crateGoal&&crateLeft()>0) left.push(`${ar(crateLeft())} ${CRATE}`);
  const can=bag.plus5>0||bag.coins>=PLUS5, cost=bag.plus5?`${ICON.plus5} ×${ar(bag.plus5)}`:`🪙 ${ar(PLUS5)}`;
  const more=can?`<button class="btn" id="more">${EN?'+5 moves':'+٥ حركات'} · ${cost}</button>`:'';
  const btns={go:()=>{hide(); startLevel(lvl);}};
  if(can) btns.more=()=>{if(bag.plus5) bag.plus5--; else bag.coins-=PLUS5; saveBag(); moves+=5; over=false; busy=false; hide(); hud(); lastAct=performance.now();};
  show(EN?`<h2>Out of moves!</h2><p>Still left: ${left.join(AND)}</p>${more}<button class="${can?'link':'btn'}" id="go">Try again</button>`
    :`<h2>خلصت الحركات!</h2><p>كان فاضل: ${left.join(AND)}</p>${more}<button class="${can?'link':'btn'}" id="go">حاول تاني</button>`,btns);
}

/* ---------- input ---------- */

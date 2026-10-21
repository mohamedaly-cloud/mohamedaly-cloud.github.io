'use strict';
function runs(){
  const out=[];
  for(let d=0;d<2;d++) for(let i=0;i<N;i++){
    let j=0;
    while(j<N){
      const p=d?board[j][i]:board[i][j]; let e=j+1;
      if(p&&p.t>=0) while(e<N){const q=d?board[e][i]:board[i][e]; if(q&&q.t===p.t) e++; else break;}
      if(e-j>=3){const cells=[]; for(let m=j;m<e;m++) cells.push(d?K(m,i):K(i,m)); out.push({d:d?'v':'h',cells});}
      j=e;
    }
  }
  return out;
}
// What a set of runs clears and which special pieces it leaves behind.
function plan(R,prefer){
  const clear=new Set(), make=[], used=new Set(), memb=new Map();
  R.forEach((run,i)=>run.cells.forEach(k=>{clear.add(k); if(!memb.has(k)) memb.set(k,[]); memb.get(k).push(i);}));
  const pick=cells=>prefer.find(k=>cells.includes(k)) ?? cells[cells.length>>1];
  R.forEach((run,i)=>{if(run.cells.length>=5){used.add(i); make.push({k:pick(run.cells),t:-1,sp:'r'});}});
  memb.forEach((l,k)=>{if(l.length>1&&l.every(i=>!used.has(i))){l.forEach(i=>used.add(i)); make.push({k,t:at(k).t,sp:'b'});}});
  R.forEach((run,i)=>{if(!used.has(i)&&run.cells.length===4){used.add(i); const k=pick(run.cells); make.push({k,t:at(k).t,sp:run.d});}});
  return {clear,make};
}
function box(r,c,n,o){for(let i=r-n;i<=r+n;i++) for(let j=c-n;j<=c+n;j++) if(i>=0&&j>=0&&i<N&&j<N) o.push(K(i,j)); return o;}
function lane(o,r,c,dir){for(let i=0;i<N;i++) o.push(dir==='h'?K(r,i):K(i,c)); return o;}
function commonColor(){const n=new Array(T).fill(0); eachCell(k=>{const p=at(k); if(p&&p.t>=0&&!p.spent) n[p.t]++;}); return n.indexOf(Math.max(...n));}
function area(sp,r,c){
  if(sp==='h'||sp==='v') return lane([],r,c,sp);
  if(sp==='b') return box(r,c,1,[]);
  const t=commonColor(), o=[]; eachCell(k=>{const p=at(k); if(p&&p.t===t) o.push(k);}); return o;
}
function expand(set){
  const q=[...set], done=new Set();
  while(q.length){
    const k=q.pop(); if(done.has(k)) continue; done.add(k);
    const p=at(k); if(!p||!p.sp||p.spent) continue;
    p.spent=true; const r=R_(k), c=C_(k), o=area(p.sp,r,c);
    fx(p.sp,r,c,o); o.forEach(x=>q.push(x));
  }
  return done;
}
function swapCells(a,b){const ra=R_(a),ca=C_(a),rb=R_(b),cb=C_(b),t=board[ra][ca]; board[ra][ca]=board[rb][cb]; board[rb][cb]=t;}
function findMove(){
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){
    const a=K(r,c);
    if(at(a).t===-2) continue;
    if(at(a).sp==='r'){const b=[c<N-1?K(r,c+1):-1,c>0?K(r,c-1):-1,r<N-1?K(r+1,c):-1,r>0?K(r-1,c):-1].find(b=>b>=0&&at(b).t!==-2); if(b!==undefined) return [a,b];}
    for(const b of [c<N-1?K(r,c+1):-1, r<N-1?K(r+1,c):-1]){
      if(b<0||at(b).t===-2) continue;
      if(at(a).sp&&at(b).sp) return [a,b];
      swapCells(a,b); const ok=runs().length>0; swapCells(a,b); if(ok) return [a,b];
    }
  }
  return null;
}
function fillBoard(){
  do{
    board=[];
    for(let r=0;r<N;r++){const row=[]; board.push(row);
      for(let c=0;c<N;c++){let t; do t=rnd(T); while((c>=2&&row[c-1].t===t&&row[c-2].t===t)||(r>=2&&board[r-1][c].t===t&&board[r-2][c].t===t));
        row.push(newPiece(t,c,r-N-1-c*.35));}}
    // shortcut: crates fall with gravity, make them fixed blockers if levels need it
    const cr=LEVELS[lvl].crate; if(cr) eachCell(k=>{if(cr[R_(k)][C_(k)]==='1') at(k).t=-2;});
  } while(!findMove());
}
function gravity(){
  for(let c=0;c<N;c++){
    let w=N-1;
    for(let r=N-1;r>=0;r--){const p=board[r][c]; if(p){if(r!==w){board[w][c]=p; board[r][c]=null;} w--;}}
    for(let r=w;r>=0;r--) board[r][c]=newPiece(rnd(T),c,r-(w+1)-.2);
  }
}
const px=c=>F+(c+.5)*S;

function fx(sp,r,c,list){
  if(sp==='h'||sp==='v'){beams.push({o:sp,r,c,t:0}); shake+=.25; sfx('line');}
  else if(sp==='b'){rings.push({r,c,t:0,max:1.4}); shake+=.45; sfx('boom');}
  else if(sp==='b2'){rings.push({r,c,t:0,max:2.6}); shake+=.7; sfx('boom');}
  else if(sp==='r'){list.forEach(k=>zaps.push({r0:r,c0:c,r1:R_(k),c1:C_(k),t:0})); shake+=.5; sfx('shoe'); say('shoe');}
  shake=Math.min(1,shake); buzz(30);
}
function confetti(n=120){
  for(let i=0;i<n&&parts.length<450;i++){const L=i%2, a=-Math.PI/2+(L?-1:1)*(.15+Math.random()*.45), v=S*(14+Math.random()*8);
    parts.push({x:L?F+B:F,y:F+B,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1.4+Math.random()*.6,max:2,col:COLORS[rnd(6)],rot:a,vr:(Math.random()-.5)*14,sz:S*(.12+Math.random()*.08)});}
}
function burst(p,n=8){
  const x=px(p.x), y=px(p.y), col=p.t===-2?KIND.crate[0]:p.t>=0?COLORS[p.t]:'#ffe08a';
  for(let i=0;i<n&&parts.length<450;i++){const a=Math.random()*7, v=S*(2+Math.random()*4.5);
    parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-S*3,life:.55+Math.random()*.3,max:.85,col,rot:a,vr:(Math.random()-.5)*12,sz:S*(.08+Math.random()*.08)});}
}
async function explode(set,make,chain){
  const done=expand(set); let n=0, sx=0, sy=0, sandHit=false, crateHit=false;
  [...done].forEach(k=>{const r=R_(k), c=C_(k); if(at(k)&&at(k).t===-2) return;
    for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){const r2=r+dr, c2=c+dc;
      if(r2>=0&&r2<N&&c2>=0&&c2<N&&board[r2][c2]&&board[r2][c2].t===-2) done.add(K(r2,c2));}});
  done.forEach(k=>{
    const r=R_(k), c=C_(k), p=board[r][c];
    if(sand[r][c]>0){sand[r][c]--; sandHit=true; parts.push({x:px(c),y:px(r),vx:0,vy:-S,life:.4,max:.4,col:'#ecd096',rot:0,vr:3,sz:S*.3});}
    if(!p) return;
    if(p.t===-2) crateHit=true;
    board[r][c]=null; n++; sx+=c; sy+=r;
    dying.push({p,t:0}); burst(p);
    if(goals[p.t]>0){goals[p.t]--; bump(p.t);}
  });
  if(sandHit) bump('s');
  if(crateHit) bump('c');
  const pts=n*60*chain; score+=pts;
  if(n) texts.push({s:'+'+ar(pts),x:px(sx/n),y:px(sy/n),t:0,size:S*.45,small:true});
  make.forEach(m=>{const p=newPiece(m.t,C_(m.k),R_(m.k)); p.sp=m.sp; p.born=1; board[R_(m.k)][C_(m.k)]=p;});
  sfx('pop',chain-1); if(make.length) sfx('make',chain);
  if(chain>=2) texts.push({s:PRAISE[Math.min(chain-2,PRAISE.length-1)],x:B/2,y:B*.42,t:0,size:S*(.95+Math.min(chain,6)*.08),big:true}); if(chain>=2) shake=Math.min(1,shake+.12*chain);
  buzz(chain>=2?24:15);
  hud();
  await sleep(make.length?230:170);
}
async function cascade(set,prefer){
  let chain=0, make=[];
  for(;;){
    if(!set){const R=runs(); if(!R.length) break; ({clear:set,make}=plan(R,prefer));}
    chain++;
    await explode(set,make,chain);
    set=null; make=[]; prefer=[];
    gravity(); await settle();
  }
  if(chain>=3) say('combo');
}
function rainbowCombo(x,y,kx,ky){
  if(x.sp!=='r'){[x,y]=[y,x]; [kx,ky]=[ky,kx];}
  x.spent=true; const set=new Set([kx,ky]);
  if(y.sp==='r'){y.spent=true; eachCell(k=>set.add(k)); shake=1; sfx('shoe'); say('shoe'); return set;}
  const t=y.t;
  eachCell(k=>{const p=at(k); if(p&&p.t===t){ if(y.sp&&!p.sp) p.sp=y.sp==='b'?'b':(Math.random()<.5?'h':'v'); set.add(k);} });
  fx('r',R_(kx),C_(kx),[...set]);
  return set;
}
function specialCombo(x,y,k,k2){
  x.spent=y.spent=true; const r=R_(k), c=C_(k), o=[k,k2], s=[x.sp,y.sp].sort().join('');
  if(s==='bb'){box(r,c,2,o); fx('b2',r,c);}
  else if(s[0]==='b'){for(let d=-1;d<=1;d++){if(r+d>=0&&r+d<N){lane(o,r+d,c,'h'); fx('h',r+d,c);} if(c+d>=0&&c+d<N){lane(o,r,c+d,'v'); fx('v',r,c+d);}}}
  else {lane(o,r,c,'h'); lane(o,r,c,'v'); fx('h',r,c); fx('v',r,c);}
  return new Set(o);
}
async function trySwap(a,b){
  if(at(a).t===-2||at(b).t===-2){sfx('bad'); buzz(40); return;}
  busy=true; sel=-1; hint=null; lastAct=performance.now();
  swapCells(a,b); sfx('swap'); await settle();
  const pa=at(b), pb=at(a); let set=null;
  if(pa.sp==='r'||pb.sp==='r') set=rainbowCombo(pa,pb,b,a);
  else if(pa.sp&&pb.sp) set=specialCombo(pa,pb,b,a);
  else if(!runs().length){swapCells(a,b); sfx('bad'); say('bad'); buzz(40); await settle(); busy=false; return;}
  moves--; hud();
  await cascade(set,[b,a]);
  busy=false; lastAct=performance.now(); after();
}
function settle(){return new Promise(res=>{const chk=()=>{if(isSettled()) res(); else requestAnimationFrame(chk);}; requestAnimationFrame(chk);});}
function isSettled(){for(let r=0;r<N;r++) for(let c=0;c<N;c++){const p=board[r][c]; if(p&&(p.x!==c||p.y!==r)) return false;} return true;}
const sandLeft=()=>sand.flat().reduce((a,b)=>a+b,0);
const crateLeft=()=>board.flat().filter(p=>p&&p.t===-2).length;
const won=()=>Object.values(goals).every(v=>v<=0)&&(!sandGoal||sandLeft()===0)&&(!crateGoal||crateLeft()===0);
function after(){
  if(won()) return win();
  if(moves<=0) return lose();
  if(moves===3) say('low');
  if(!findMove()) shuffle();
}
async function shuffle(){
  busy=true; say('shuffle'); await sleep(500);
  let tries=0;
  do{eachCell(k=>{const p=at(k); if(!p.sp&&p.t!==-2) p.t=rnd(T);}); tries++;} while((runs().length||!findMove())&&tries<300);
  eachCell(k=>{at(k).born=1;}); busy=false;
}

/* ---------- frame ---------- */
function update(dt,now){
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){
    const p=board[r][c]; if(!p) continue;
    p.x+=(c-p.x)*Math.min(1,dt*16); if(Math.abs(c-p.x)<.01) p.x=c;
    const dy=r-p.y;
    if(dy>.005){p.vy=Math.min(p.vy+75*dt,24); p.y=Math.min(r,p.y+p.vy*dt); if(p.y===r){if(p.vy>3) p.sq=1; p.vy=0;}}
    else if(dy<-.01) p.y+=dy*Math.min(1,dt*16); else p.y=r;
    if(p.sq>0) p.sq=Math.max(0,p.sq-dt*5);
    if(p.born>0) p.born=Math.max(0,p.born-dt*3.5);
  }
  for(let i=dying.length;i--;){dying[i].t+=dt/.24; if(dying[i].t>=1) dying.splice(i,1);}
  for(let i=parts.length;i--;){const q=parts[i]; q.vy+=S*28*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.rot+=q.vr*dt; q.life-=dt; if(q.life<=0) parts.splice(i,1);}
  for(const [arr,life] of [[beams,.38],[rings,.42],[zaps,.32]]) for(let i=arr.length;i--;){arr[i].t+=dt/life; if(arr[i].t>=1) arr.splice(i,1);}
  for(let i=texts.length;i--;){texts[i].t+=dt; if(texts[i].t>1.1) texts.splice(i,1);}
  shake=reduce?0:Math.max(0,shake-dt*3);
  if(!busy&&!over&&!hint&&now-lastAct>6000) hint=findMove();
}

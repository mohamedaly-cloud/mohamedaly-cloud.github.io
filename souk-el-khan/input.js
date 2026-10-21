'use strict';
let down=null;
const adj=(a,b)=>Math.abs(R_(a)-R_(b))+Math.abs(C_(a)-C_(b))===1;
function cellAt(e){const rc=cv.getBoundingClientRect(), c=Math.floor((e.clientX-rc.left-F)/S), r=Math.floor((e.clientY-rc.top-F)/S); return r<0||c<0||r>=N||c>=N?-1:K(r,c);}
/* iPhone haptics: iOS 26.5+ only ticks when her own touch toggles a switch, so a see-through switch lies over the board.
   A tap toggles it (one tick). A slow swipe (past HOLD) jumps a wide strip under her finger so the drag crosses its middle (one tick).
   A fast swipe is over before WebKit tracks drags (200 ms), so it ticks through WebKit's click on release instead: we leave the switch alone then. */
// shortcut: a fast swipe ticks at finger lift, not at the swap; explosions and cascades never can on iPhone web, only a native app would.
const STRIP=4000, HOLD=250, stripLeft=(x,side)=>x-STRIP*(side?3:1)/4;
const REST='-webkit-appearance:none;appearance:none;position:absolute;left:0;top:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;pointer-events:auto';
const ANDROID=/Android/.test(navigator.userAgent);
let pad=null, sw=null, drag=null;
const rest=()=>{if(!drag) sw.style.cssText=REST;};
function place(){const b=pad.getBoundingClientRect(); sw.style.cssText=REST+`;pointer-events:none;width:${STRIP}px;height:8px;left:${stripLeft(drag.x-b.left,drag.side)}px;top:${drag.y-b.top-4}px`; void sw.offsetWidth;}
function hapSwipe(){if(!drag) return; if(performance.now()-drag.at<HOLD){drag.pending=true; return;} drag.moved=drag.flipped=true; drag.side^=1; place();} // the switch reads the jump on her next touchmove
if(!ANDROID&&navigator.maxTouchPoints){ // not gated on navigator.vibrate: an iPhone browser can have the function and still never buzz
  pad=document.createElement('souk-pad'); pad.setAttribute('aria-hidden','true');
  pad.style.cssText='all:initial;position:absolute;inset:0;display:block;z-index:2;contain:strict;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none';
  sw=document.createElement('input'); sw.type='checkbox'; sw.setAttribute('switch',''); sw.tabIndex=-1; sw.style.cssText=REST;
  for(const ev of ['click','input','change']) sw.addEventListener(ev,e=>e.stopPropagation());
  pad.attachShadow({mode:'closed'}).appendChild(sw); stage.appendChild(pad);
  const mine=e=>drag&&[...e.changedTouches].find(t=>t.identifier===drag.id);
  pad.addEventListener('touchstart',e=>{const t=e.changedTouches[0]; drag=e.touches.length===1?{id:t.identifier,at:performance.now(),x:t.clientX,y:t.clientY,x0:t.clientX,y0:t.clientY,side:0,pending:false,moved:false,flipped:false}:null;},{passive:true});
  pad.addEventListener('touchmove',e=>{const t=mine(e); if(!t) return; drag.x=t.clientX; drag.y=t.clientY;
    if(!drag.moved&&Math.hypot(drag.x-drag.x0,drag.y-drag.y0)<8) return; // a wobbly tap stays a tap, so its release still ticks
    drag.moved=true; if(drag.pending&&performance.now()-drag.at>=HOLD){drag.pending=false; drag.flipped=true; drag.side^=1;} place();},{passive:true});
  const end=e=>{const t=mine(e); if(!t) return; const d=drag; drag=null;
    if(d.flipped){sw.style.display='none'; void sw.offsetWidth;} // a drag that already ticked must not tick again; without a renderer WebKit skips the release click
    setTimeout(rest,Math.max(0,d.at+HOLD+50-performance.now()));};
  pad.addEventListener('touchend',end); pad.addEventListener('touchcancel',end);
}
const vibRow=()=>ANDROID&&!navigator.vibrate?`<p class="vtest">${EN?'This browser can’t vibrate. Open the game in Chrome.':'المتصفح ده مش بيهز. افتح اللعبة في كروم.'}</p>`:'';
console.assert(stripLeft(100,0)===-900&&stripLeft(100,1)===-2900,'the finger sits at 1/4 of the strip, then at 3/4');
stage.addEventListener('pointerdown',e=>{
  ensureAudio(); kbd=false; if(busy||over) return;
  const k=cellAt(e); if(k<0) return; if(aim) return smash(k); down={k,x:e.clientX,y:e.clientY};
  if(!pad) try{stage.setPointerCapture(e.pointerId);}catch(_){} // on iPhone a capture sends the tap's click to the stage, so the switch never flips
});
stage.addEventListener('pointermove',e=>{
  if(!down) return; const dx=e.clientX-down.x, dy=e.clientY-down.y;
  if(Math.hypot(dx,dy)<S*.35) return;
  let r=R_(down.k), c=C_(down.k); if(Math.abs(dx)>Math.abs(dy)) c+=Math.sign(dx); else r+=Math.sign(dy);
  const a=down.k; down=null; if(r<0||c<0||r>=N||c>=N) return; if(!noVib) hapSwipe(); trySwap(a,K(r,c));
});
stage.addEventListener('pointerup',()=>{
  if(!down) return; const k=down.k; down=null;
  if(sel>=0&&adj(sel,k)){const a=sel; trySwap(a,k);} else {sel=sel===k?-1:k; if(sel>=0) sfx('swap');}
});
stage.addEventListener('pointercancel',()=>{down=null;});
cv.addEventListener('keydown',e=>{
  if(over||busy) return;
  const d={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[e.key];
  if(d){e.preventDefault(); kbd=true; const r=R_(cur)+d[0], c=C_(cur)+d[1]; if(r<0||c<0||r>=N||c>=N) return; const k=K(r,c);
    if(sel>=0){const a=sel; cur=k; trySwap(a,k);} else cur=k;}
  else if(e.key===' '||e.key==='Enter'){e.preventDefault(); ensureAudio(); kbd=true; if(aim) smash(cur); else sel=sel===cur?-1:cur;}
});
/* ---------- boosters: they never cost a move ---------- */
async function smash(k){aim=false; bag.hammer--; saveBag(); busy=true; sel=-1; hint=null; hud(); buzz(30); await cascade(new Set([k]),[]); busy=false; lastAct=performance.now(); after();}
$('#hammer').addEventListener('click',()=>{if(busy||over||!bag.hammer) return; aim=!aim; hud();});
$('#shuf').addEventListener('click',async()=>{if(busy||over||!bag.shuf) return; aim=false; bag.shuf--; saveBag(); sel=-1; hint=null; hud(); await shuffle(); lastAct=performance.now();});
$('#mute').addEventListener('click',e=>{muted=!muted; if(ac) muted?ac.suspend():ac.resume(); e.currentTarget.setAttribute('aria-pressed',String(muted)); try{localStorage.setItem('soukKhan.muted',muted?'1':'');}catch(_){} });
try{muted=!!localStorage.getItem('soukKhan.muted'); $('#mute').setAttribute('aria-pressed',String(muted));}catch(_){}
const padShow=()=>{if(pad) pad.style.display=noVib?'none':'block';};
$('#vib').addEventListener('click',e=>{noVib=!noVib; e.currentTarget.setAttribute('aria-pressed',String(noVib)); padShow(); buzz(40); try{localStorage.setItem('soukKhan.noVib',noVib?'1':'');}catch(_){} });
try{noVib=!!localStorage.getItem('soukKhan.noVib'); $('#vib').setAttribute('aria-pressed',String(noVib));}catch(_){} padShow();
if(!navigator.vibrate&&!navigator.maxTouchPoints) $('#vib').hidden=true;
$('#lang').addEventListener('click',()=>{try{localStorage.setItem('soukKhan.lang',EN?'ar':'en');}catch(_){} location.reload();});
if(EN){
  const app=$('.app'), lbl=document.querySelectorAll('.lbl'); app.lang='en'; app.dir='ltr';
  $('h1').firstChild.textContent='Souk el-Khan'; $('h1 small').textContent='سوق الخان';
  lbl[0].textContent='Level'; lbl[1].textContent='Score'; $('#movesBox span').textContent='moves';
  $('#goals').setAttribute('aria-label','Goal'); cv.setAttribute('aria-label','Game board: drag any item onto its neighbour');
  $('.who').textContent='Uncle Metwally'; $('#sayText').textContent='Welcome to the souk, ya basha!';
  $('#mute').setAttribute('aria-label','Sound'); $('#vib').setAttribute('aria-label','Vibration off');
  $('#lang').textContent='ع'; $('#lang').setAttribute('aria-label','العربي');
  $('#hammer').setAttribute('aria-label','Hammer: tap a tile to break it'); $('#shuf').setAttribute('aria-label','Shuffle the board'); $('#coinPill').setAttribute('aria-label','Coins'); $('#chestPill').setAttribute('aria-label','Stars toward the next chest');
} else {$('#lang').setAttribute('aria-label','English'); $('#hammer').setAttribute('aria-label','شاكوش: دوس على حاجة تكسرها'); $('#shuf').setAttribute('aria-label','لخبط اللوحة'); $('#coinPill').setAttribute('aria-label','فلوس'); $('#chestPill').setAttribute('aria-label','نجوم للصندوق الجاي');}

/* ---------- self-check: match rules ---------- */
(function selfTest(){
  const mk=marks=>{board=[]; for(let r=0;r<N;r++){const row=[]; for(let c=0;c<N;c++) row.push(newPiece((2*r+c)%5+1,c,r)); board.push(row);} marks.forEach(([r,c])=>board[r][c].t=0);};
  mk([[0,0],[0,1],[0,2],[0,3],[0,4]]); let P=plan(runs(),[]); console.assert(P.make.length===1&&P.make[0].sp==='r','5 in a row makes a shebsheb');
  mk([[0,0],[0,1],[0,2],[1,0],[2,0]]); P=plan(runs(),[]); console.assert(P.make.length===1&&P.make[0].sp==='b'&&P.make[0].k===0&&P.clear.size===5,'L makes a bomb at the corner');
  mk([[3,2],[3,3],[3,4],[3,5]]); P=plan(runs(),[K(3,4)]); console.assert(P.make.length===1&&P.make[0].sp==='h'&&P.make[0].k===K(3,4),'4 in a row makes a line where you swapped');
  mk([]); console.assert(runs().length===0,'filler board has no matches');
  fillBoard(); console.assert(runs().length===0&&findMove(),'new board has no matches and has a move');
  {const keep=bag; bag={...keep,stars:{},chest:0}; console.assert(addStars(0,2)===2&&addStars(0,1)===0&&addStars(0,3)===1&&bag.chest===3&&totalStars()===3,'stars: only gains over the best fill the chest'); bag=keep;}
  console.assert(LEVELS.length===25&&LEVELS.every((L,i)=>chapterOf(i)&&Object.keys(L.goals||{}).every(k=>k>=0&&k<6)),'25 levels, each in a chapter, goals are tile 0-5');
  console.assert(CHAPTERS.every((C,c)=>C.tiles.length===6&&C.tiles.every(k=>KIND[k])&&C.names.length===6&&(!c||C.first>CHAPTERS[c-1].first)),'chapters: 6 known tiles, 6 names, in order');
  console.assert(LEVELS.every(L=>!L.crate||(L.crate.length===8&&L.crate.every(s=>/^[01]{8}$/.test(s)))),'crate maps are 8x8 of 0/1');
  board=[...Array(N)].map((_,r)=>[...Array(N)].map((_,c)=>newPiece(r?(r+c)%3:0,c,r))); board[0].forEach(p=>p.t=-2);
  console.assert(!runs().some(run=>[...run].some(k=>R_(k)===0)),'a row of crates never matches');
  console.assert(crateTip({})==='','no crate tip on levels without crates');
  parts.length=440; parts.fill({}); confetti(); console.assert(parts.length===450,'confetti respects the particle cap'); parts.length=0;
  board=[];
})();

/* ---------- boot ---------- */
sand=Array.from({length:N},()=>new Array(N).fill(0));
setChapter(loadLevel());
resize(); drawKeeper();
new ResizeObserver(()=>resize()).observe(stage);
fillBoard();
requestAnimationFrame(frame);
startScreen();
// offline play from the home screen; the claude.ai artifact has no sw.js
if('serviceWorker' in navigator&&!/claude/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(()=>{});

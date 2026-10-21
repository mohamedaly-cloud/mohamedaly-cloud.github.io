'use strict';
let ac=null, muted=false, noVib=false; const lastSfx={};
function ensureAudio(){ if(muted) return; if(!ac){ // shortcut: muted keeps the engine off; on iPhone a running AudioContext may silence the switch ticks, retest with sound on
  try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}} if(ac&&ac.state==='suspended') ac.resume(); }
const HIJAZ=[0,1,4,5,7,8,10,12,13,16,17,19,20,22,24];
function tone(f,dur,type,vol,when=0,f2){
  if(!ac||muted) return; const t0=ac.currentTime+when;
  const o=ac.createOscillator(), g=ac.createGain(), lp=ac.createBiquadFilter();
  lp.type='lowpass'; lp.frequency.value=2600; o.type=type; o.frequency.setValueAtTime(f,t0); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(vol,t0+.008); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(lp).connect(g).connect(ac.destination); o.start(t0); o.stop(t0+dur+.03);
}
function noise(dur,vol,when=0){
  if(!ac||muted) return; const t0=ac.currentTime+when, len=Math.ceil(ac.sampleRate*dur);
  const buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
  const s=ac.createBufferSource(), hp=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=buf; hp.type='highpass'; hp.frequency.value=1800; g.gain.value=vol;
  s.connect(hp).connect(g).connect(ac.destination); s.start(t0);
}
function pluck(i,when=0){const f=293.66*Math.pow(2,HIJAZ[Math.min(i,HIJAZ.length-1)]/12); tone(f,.38,'triangle',.22,when); tone(f*2,.12,'sawtooth',.035,when);}
function sfx(name,n=0){
  const now=performance.now(); if(lastSfx[name]&&now-lastSfx[name]<60) return; lastSfx[name]=now;
  if(name==='swap') tone(760,.06,'sine',.08);
  else if(name==='bad'){tone(230,.14,'square',.04); tone(205,.2,'square',.04,.11);}
  else if(name==='pop'){pluck(n*2); pluck(n*2+2,.07);}
  else if(name==='make'){noise(.06,.25); pluck(n*2+4,.05);}
  else if(name==='line'){noise(.12,.3); tone(900,.25,'sawtooth',.05,0,300);}
  else if(name==='boom'){tone(150,.32,'sine',.5,0,48); noise(.07,.35,.02);}
  else if(name==='shoe'){tone(140,.3,'sine',.5,0,50); noise(.06,.3,.12); noise(.06,.3,.22);}
  else if(name==='win'){for(let i=0;i<8;i++) pluck(i,i*.09); tone(146.8,.8,'sine',.3,.75);}
  else if(name==='lose'){pluck(4); pluck(2,.18); pluck(0,.36);}
}
// iPhone Safari has no navigator.vibrate; clicking a hidden <input switch> gives a Taptic tick (iOS 17.4+).
// iOS 26.5+ ticks only on the user's own tap (the board sits in a <label>), so script ticks below help older iOS only.
// shortcut: one fixed-strength tick per pulse, no long buzz; upgrade if Apple ships web haptics.
let tick=null;
function tap(){if(!tick){tick=document.createElement('label'); tick.setAttribute('aria-hidden','true'); tick.className='hap'; tick.innerHTML='<input type="checkbox" switch>'; document.body.appendChild(tick);} tick.click();}
function buzz(p){if(noVib)return; try{
  if(navigator.vibrate) return void navigator.vibrate(p);
  const a=[].concat(p); for(let i=0,t=0;i<a.length;t+=a[i]+(a[i+1]||0),i+=2) t?setTimeout(tap,t):tap();
}catch(e){}}

/* ---------- board logic ---------- */

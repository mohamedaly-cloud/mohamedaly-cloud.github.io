'use strict';
let B=320, F=10, S=37.5, dpr=1, bg=null; const spr=[], sandSpr=[];
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function off(w,h){const o=document.createElement('canvas');o.width=Math.ceil(w*dpr);o.height=Math.ceil(h*dpr);const g=o.getContext('2d');g.scale(dpr,dpr);return [o,g];}
function lin(g,x0,y0,x1,y1,stops){const gr=g.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>gr.addColorStop(i/(stops.length-1),s));return gr;}
// Cartoon tiles: one thick ink outline, two flat cel bands, one white shine. Unit space, shapes about -0.9..0.85.
const INK='#3b1d0e';
const TONE={y:['#ffd34d','#e8a21f'],o:['#f7a03e','#cc6a1e'],br:['#c0743f','#86431f'],r:['#f2553b','#b52c1d'],p:['#f36cb0','#bd3880'],b:['#4199f0','#2160bf'],g:['#62c65c','#2f8c3c'],w:['#fffaf0','#dcccb0'],k:['#5a3a2a','#3b2416'],v:['#a77bea','#7148bd'],tc:['#d48a4e','#9c5428'],sole:['#f0c08a','#c48850']};
const P=f=>{const p=new Path2D(); f(p); return p;};
const poly=a=>P(p=>{for(let i=0;i<a.length;i+=2) p.lineTo(a[i],a[i+1]); p.closePath();});
const ell=(x,y,rx,ry=rx,r=0)=>P(p=>p.ellipse(x,y,rx,ry,r,0,7));
const rot=(p,a,x=0,y=0,s=1)=>P(q=>q.addPath(p,new DOMMatrix().translate(x,y).rotate(a*180/Math.PI).scale(s)));
const mir=p=>P(q=>q.addPath(p,new DOMMatrix([-1,0,0,1,0,0])));
// weighted line: a second stroke nudged down-right makes the shadow side of every outline heavier
function edge(g,p,w=.13){g.strokeStyle=INK; g.lineWidth=w; g.stroke(p); g.save(); g.translate(.025,.03); g.lineWidth=w*.9; g.stroke(p); g.restore();}
const mix=(h,t,k)=>'#'+[1,3,5].map(i=>Math.round(parseInt(h.substr(i,2),16)*(1-k)+parseInt(t.substr(i,2),16)*k).toString(16).padStart(2,'0')).join('');
const BIG=P(p=>p.rect(-3,-3,6,6));
// three cel bands: light crescent top-left, mid body, dark crescent bottom-right (each one the shape shifted inside itself)
function ink(g,p,c,w=.13){const [a,b]=TONE[c]||c; g.save(); g.clip(p);
  g.fillStyle=mix(a,'#fffbe8',.5); g.fill(p);
  g.save(); g.translate(.07,.08); g.fillStyle=a; g.fill(p); g.restore();
  g.save(); g.translate(-.13,-.15); const q=new Path2D(BIG); q.addPath(p); g.fillStyle=b; g.fill(q,'evenodd'); g.restore();
  g.restore(); edge(g,p,w);}
function flat(g,p,col,w=.08){g.fillStyle=col; g.fill(p); edge(g,p,w);}
function shine(g,x,y,rx,ry,r=0){g.fillStyle='rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(x,y,rx,ry,r,0,7); g.fill();}
function line(g,col,w,f){g.strokeStyle=col; g.lineWidth=w; g.beginPath(); f(g); g.stroke();}
function tube(g,col,w,f){g.beginPath(); f(g); g.strokeStyle=INK; g.lineWidth=w+.13; g.stroke(); g.strokeStyle=col; g.lineWidth=w; g.stroke();}
function within(g,p,f){g.save(); g.clip(p); f(); g.restore();}
const KIND={
  fanous:['#ffcf2e',g=>{
    // Egyptian Ramadan tin lantern: ring, onion dome, flared skirt, tapering glass body, pointed foot
    tube(g,'#e8a21f',.06,g=>g.arc(0,-.88,.08,0,7));
    ink(g,P(p=>{p.moveTo(0,-.8); p.bezierCurveTo(.1,-.7,.34,-.66,.28,-.5); p.lineTo(-.28,-.5); p.bezierCurveTo(-.34,-.66,-.1,-.7,0,-.8);}),'y',.09);
    ink(g,poly([-.3,-.54,.3,-.54,.56,-.34,-.56,-.34]),['#e8a21f','#b07a12'],.07);
    ink(g,poly([-.5,-.36,.5,-.36,.3,.32,-.3,.32]),'y',.1);
    for(const s of [-1,1]) flat(g,poly([.22*s,-.28,.42*s,-.28,.26*s,.24,.15*s,.24]),'#ffb52e',.035);
    const mid=P(p=>{p.moveTo(-.15,-.2); p.quadraticCurveTo(0,-.34,.15,-.2); p.lineTo(.09,.24); p.lineTo(-.09,.24); p.closePath();});
    flat(g,mid,'#fff3b0',.035);
    flat(g,P(p=>{p.moveTo(0,-.08); p.quadraticCurveTo(.07,.06,0,.16); p.quadraticCurveTo(-.07,.06,0,-.08);}),'#f7a03e',.035);
    ink(g,poly([-.3,.3,.3,.3,0,.68]),'y',.09);
    flat(g,ell(0,.74,.08),'#e8a21f',.06);
    shine(g,-.12,-.66,.08,.03,-.6);
  }],
  dates:['#e0362c',g=>{
    const D=[[-.36,.18,-.45],[.36,.18,.45],[0,-.04,0]];
    tube(g,'#a8622e',.045,g=>{g.moveTo(.06,-.9); g.quadraticCurveTo(0,-.72,0,-.62); for(const [x,y,a] of D){g.moveTo(0,-.66); g.quadraticCurveTo(x*.5,-.62,x+.44*Math.sin(a),y-.44*Math.cos(a));}});
    for(const [x,y,a] of D){ink(g,ell(x,y,.26,.46,a),['#ec4a3c','#a8211a']);
      g.save(); g.translate(x,y); g.rotate(a);
      line(g,'#8a1c16',.035,g=>{g.moveTo(-.17,-.08); g.quadraticCurveTo(-.02,-.02,.12,-.12); g.moveTo(-.12,.18); g.quadraticCurveTo(.02,.24,.16,.12); g.moveTo(.04,-.3); g.quadraticCurveTo(.12,-.24,.18,-.3);});
      flat(g,ell(0,-.44,.11,.06),'#7a3a1c',.05); g.restore();
      shine(g,x-.1*Math.cos(a)+.2*Math.sin(a)*-1,y-.2*Math.cos(a)-.1*Math.sin(a),.035,.11,a);}
  }],
  spice:['#f07a22',g=>{
    // a Khan spice-shop cone: pointed heap of paprika powder in a woven basket, a dried chilli on the rim
    const heap=P(p=>{p.moveTo(-.72,.42); p.quadraticCurveTo(-.36,.3,-.12,-.6); p.quadraticCurveTo(0,-.86,.12,-.6); p.quadraticCurveTo(.36,.3,.72,.42); p.closePath();});
    const bowl=P(p=>{p.moveTo(-.84,.4); p.bezierCurveTo(-.8,.78,-.4,.86,0,.86); p.bezierCurveTo(.4,.86,.8,.78,.84,.4); p.closePath();});
    g.fillStyle=lin(g,0,.4,0,.86,['#d9a560','#a8702e','#6e4218']); g.fill(bowl);
    within(g,bowl,()=>{line(g,'rgba(70,35,10,.55)',.02,g=>{for(let x=-.9;x<.9;x+=.12){g.moveTo(x,.4); g.lineTo(x+.08,.9);} g.moveTo(-.9,.62); g.quadraticCurveTo(0,.74,.9,.62);});});
    edge(g,bowl,.06);
    g.fillStyle=lin(g,-.6,0,.6,0,['#ffc06a','#f07a22','#c4461a','#8e2a0e']); g.fill(heap);
    within(g,heap,()=>{let r=7; const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
      for(let i=0;i<120;i++){const y=-.7+rnd()*1.12, w=.12+(y+.7)*.55, x=(rnd()*2-1)*w;
        g.fillStyle=rnd()<.6?'rgba(120,30,5,.55)':'rgba(255,225,160,.7)'; g.beginPath(); g.arc(x,y,.012+rnd()*.014,0,7); g.fill();}
      line(g,'rgba(255,215,150,.6)',.03,g=>{g.moveTo(-.04,-.66); g.quadraticCurveTo(-.2,0,-.42,.36);});});
    edge(g,heap,.06);
    const rim=ell(0,.41,.85,.09); g.fillStyle='#c48a46'; g.fill(rim); edge(g,rim,.05);
    // dried red chilli lying across the rim
    const chil=P(p=>{p.moveTo(.18,.5); p.quadraticCurveTo(.5,.36,.86,.6); p.quadraticCurveTo(.5,.52,.2,.6); p.closePath();});
    g.fillStyle=lin(g,0,.4,0,.62,['#ff5a3a','#c01e10','#7a0c06']); g.fill(chil); edge(g,chil,.04);
    tube(g,'#4f8a2a',.04,g=>{g.moveTo(.2,.55); g.quadraticCurveTo(.1,.52,.06,.44);});
    shine(g,-.1,-.5,.025,.09,.25);
  }],
  karkade:['#e0287a',g=>{
    // a hibiscus flower: five ruffled petals, dark red eye, long stamen column with yellow pollen
    const petal=P(p=>{p.moveTo(0,0); p.bezierCurveTo(-.3,-.08,-.56,-.42,-.42,-.68); p.quadraticCurveTo(-.3,-.86,-.13,-.8); p.quadraticCurveTo(0,-.9,.13,-.8); p.quadraticCurveTo(.3,-.86,.42,-.68); p.bezierCurveTo(.56,-.42,.3,-.08,0,0);});
    const fill=g.createRadialGradient(0,0,0,0,0,.9);
    [[0,'#5e0620'],[.22,'#a80c3e'],[.4,'#d81f5e'],[.75,'#f04a86'],[1,'#ff8fb5']].forEach(([k,c])=>fill.addColorStop(k,c));
    g.save(); g.translate(-.02,.08);
    for(let i=0;i<5;i++){g.save(); g.rotate(i*Math.PI*2/5-.25);
      g.fillStyle=fill; g.fill(petal);
      within(g,petal,()=>{line(g,'rgba(110,0,40,.35)',.015,g=>{for(const a of [-.5,-.25,0,.25,.5]){g.moveTo(0,0); g.quadraticCurveTo(a*.4,-.4,a*.7,-.78);}});
        g.fillStyle='rgba(90,0,30,.28)'; g.fill(rot(petal,.5,.05,.02));});
      edge(g,petal,.05); g.restore();}
    // stamen column curving up-right; pollen on the end, five red stigma pads at the tip
    tube(g,'#ffd0dc',.05,g=>{g.moveTo(0,0); g.quadraticCurveTo(.2,-.12,.4,-.5);});
    for(let t=.45;t<.95;t+=.09){const x=.4*t*t+.4*t*(1-t)*.5*2, y=-.5*t*t-.24*t*(1-t);
      for(const s of [-1,1]){g.fillStyle='#ffd23a'; g.beginPath(); g.arc(x+s*.05,y+.02*s,.032,0,7); g.fill(); g.strokeStyle=INK; g.lineWidth=.015; g.stroke();}}
    for(let i=0;i<5;i++){const a=-1.1+i*.55; flat(g,ell(.42+Math.cos(a-1)*.08,-.54+Math.sin(a-1)*.08,.04),'#c4103e',.02);}
    g.restore();
    shine(g,-.42,-.34,.025,.09,-.7);
  }],
  bead:['#2f7bd6',g=>{
    tube(g,'#c0743f',.05,g=>{g.moveTo(-.12,-.74); g.quadraticCurveTo(0,-.98,.12,-.74);});
    ink(g,ell(0,0,.78),['#3a7fe0','#1a4aa6']);
    line(g,'#7fb4ff',.05,g=>g.arc(0,0,.64,3.5,4.9));
    g.fillStyle='rgba(255,255,255,.55)'; for(const [x,y,r] of [[.5,.32,.03],[.42,.46,.02],[-.2,.62,.025],[.62,-.1,.02]]){g.beginPath(); g.arc(x,y,r,0,7); g.fill();} // glass bubbles
    ink(g,ell(0,0,.48),'w'); ink(g,ell(0,0,.32),['#9ad8ff','#4fa6e6']); flat(g,ell(0,0,.15),INK,.01);
    flat(g,ell(0,-.76,.11,.06),'#1a4aa6',.05);
    shine(g,-.38,-.42,.14,.07,-.75); shine(g,-.05,-.06,.035,.025);
  }],
  mint:['#45a84e',g=>{
    const pts=[], N=16; for(let i=0;i<=N;i++){const t=i/N; pts.push(.44*Math.sin(Math.PI*t**1.4)*(i%2?1.06:.97),-.86+1.52*t);}
    for(let i=N;i>=0;i--) pts.push(-pts[i*2],pts[i*2+1]);
    const leaf=poly(pts); // serrated edge: every other point sticks out
    const vein=(a,x,y,s)=>{g.save(); g.translate(x,y); g.rotate(a); g.scale(s,s); line(g,'#2a6e2f',.055/s,g=>{g.moveTo(0,-.7); g.lineTo(0,.62); for(const v of [-.38,-.08,.22]){g.moveTo(0,v+.14); g.quadraticCurveTo(.12,v,.27,v-.1); g.moveTo(0,v+.14); g.quadraticCurveTo(-.12,v,-.27,v-.1);}}); g.restore();};
    tube(g,'#2f8c3c',.06,g=>{g.moveTo(-.11,.56); g.quadraticCurveTo(-.16,.74,-.24,.88);});
    for(const [a,x,y,s] of [[1.1,.17,.45,.5],[-1,-.43,.4,.55],[.3,.08,-.02,.95]]){ink(g,rot(leaf,a,x,y,s),'g'); vein(a,x,y,s);}
    shine(g,-.14,-.46,.045,.12,.35);
  }],
  shoe:['#ff4f9a',g=>{
    // grandma's flying plastic shibshib seen from above: foot-shaped sole, thick edge, wide strap, speed lines
    g.save(); g.rotate(-.6); g.scale(.88,.88);
    line(g,'rgba(59,29,14,.55)',.05,g=>{for(const x of [-.2,0,.2]){g.moveTo(x,.98); g.lineTo(x*1.3,1.14);}});
    const sole=P(p=>{p.moveTo(.05,-.92); p.bezierCurveTo(.52,-.92,.58,-.4,.44,-.1); p.quadraticCurveTo(.3,.18,.34,.46);
      p.bezierCurveTo(.36,.92,-.36,.92,-.34,.46); p.quadraticCurveTo(-.36,.18,-.42,-.1); p.bezierCurveTo(-.54,-.5,-.4,-.92,.05,-.92); p.closePath();});
    g.save(); g.translate(.06,.07); g.fillStyle='#a81c58'; g.fill(sole); edge(g,sole,.06); g.restore();
    g.fillStyle=lin(g,-.45,0,.45,0,['#ffd2e6','#ff9cc8','#f27ab2']); g.fill(sole);
    within(g,sole,()=>{g.fillStyle='rgba(168,28,88,.2)'; g.fill(ell(0,.52,.22,.24)); // worn heel and toe marks
      for(const [x,y,r] of [[-.2,-.72,.08],[-.02,-.78,.07],[.14,-.74,.065],[.27,-.66,.06]]) g.fill(ell(x,y,r,r*1.2));});
    edge(g,sole,.06);
    const strap=P(p=>{p.moveTo(-.62,-.38); p.quadraticCurveTo(0,-.66,.62,-.38); p.lineTo(.56,.04); p.quadraticCurveTo(0,-.22,-.56,.04); p.closePath();});
    g.fillStyle=lin(g,0,-.6,0,.04,['#ff5aa4','#e0287a','#a81c58']); g.fill(strap);
    line(g,'rgba(255,220,235,.6)',.025,g=>{g.moveTo(-.5,-.28); g.quadraticCurveTo(0,-.52,.5,-.28);});
    edge(g,strap,.06);
    shine(g,-.2,-.42,.12,.03,-.3);
    g.restore();
  }],
  pyramid:['#ffd34d',g=>{
    const t=poly([0,-.84,.86,.62,-.86,.62]);
    within(g,t,()=>{g.fillStyle=TONE.y[0]; g.fill(t); g.fillStyle=TONE.y[1]; g.fill(poly([0,-.84,.86,.62,.18,.62]));
      line(g,'rgba(110,60,10,.45)',.05,g=>{for(const y of [-.36,.02,.34]){g.moveTo(-1,y); g.lineTo(1,y);}});});
    line(g,INK,.08,g=>{g.moveTo(0,-.84); g.lineTo(.18,.62);});
    edge(g,t); shine(g,-.2,-.24,.04,.2,.52);
  }],
  tea:['#f7a03e',g=>{
    ink(g,ell(0,.62,.68,.17),'w');
    ink(g,poly([-.42,-.5,.42,-.5,.3,.58,-.3,.58]),['#f08a32','#b24f17']);
    flat(g,poly([-.42,-.5,.42,-.5,.4,-.3,-.4,-.3]),'#fff1d6',.07);
    tube(g,'#fffaf0',.05,g=>{g.moveTo(-.12,-.62); g.bezierCurveTo(-.26,-.74,0,-.8,-.12,-.94); g.moveTo(.14,-.62); g.bezierCurveTo(0,-.74,.26,-.8,.14,-.94);});
    shine(g,-.22,.04,.05,.24,.1);
  }],
  fez:['#f2553b',g=>{
    ink(g,P(p=>{p.moveTo(-.54,.5); p.lineTo(-.38,-.52); p.quadraticCurveTo(0,-.62,.38,-.52); p.lineTo(.54,.5); p.quadraticCurveTo(0,.64,-.54,.5);}),'r');
    flat(g,ell(0,-.53,.38,.1),'#b52c1d');
    tube(g,'#2a1408',.05,g=>{g.moveTo(0,-.55); g.quadraticCurveTo(.4,-.6,.52,-.2); g.lineTo(.54,.1);});
    flat(g,poly([.54,.04,.66,.36,.42,.36]),'#2a1408',.06);
    shine(g,-.26,-.16,.06,.22,.12);
  }],
  cartouche:['#a77bea',g=>{
    ink(g,P(p=>p.roundRect(-.44,-.84,.88,1.4,.44)),'v');
    ink(g,P(p=>p.roundRect(-.56,.5,1.12,.24,.08)),'v');
    line(g,INK,.08,g=>{g.moveTo(.13,-.5); g.arc(0,-.5,.13,0,7);
      g.moveTo(-.26,-.12); g.lineTo(-.13,-.2); g.lineTo(0,-.12); g.lineTo(.13,-.2); g.lineTo(.26,-.12);
      g.moveTo(0,.06); g.lineTo(0,.36); g.moveTo(0,.06); g.quadraticCurveTo(.18,.02,.13,.2);});
    shine(g,-.25,-.5,.05,.15,.15);
  }],
  scarab:['#4199f0',g=>{
    line(g,INK,.09,g=>{for(const s of [-1,1]){g.moveTo(s*.3,-.1); g.lineTo(s*.66,-.34); g.moveTo(s*.36,.14); g.lineTo(s*.74,.14); g.moveTo(s*.3,.4); g.lineTo(s*.62,.7);}});
    ink(g,ell(0,-.58,.28,.2),'k');
    ink(g,ell(0,.12,.48,.6),'b');
    line(g,INK,.07,g=>{g.moveTo(0,-.44); g.lineTo(0,.7);});
    shine(g,-.22,-.1,.07,.2,.2);
  }],
  papyrus:['#62c65c',g=>{
    const tops=[[-.42,-.26,-.5],[.42,-.26,.5],[0,-.4,0]];
    tube(g,'#7cd06a',.07,g=>{for(const [x,y] of tops){g.moveTo(0,.84); g.quadraticCurveTo(x*.2,.3,x,y);}});
    for(const [x,y,a] of tops) ink(g,P(p=>{p.moveTo(x,y+.04); p.arc(x,y+.04,.4,a-Math.PI/2-.62,a-Math.PI/2+.62); p.closePath();}),'g');
    ink(g,ell(0,.6,.16,.08),'br');
    shine(g,-.08,-.64,.1,.04);
  }],
  corn:['#ffd34d',g=>{
    const a=.35, cob=ell(0,-.12,.3,.66);
    ink(g,rot(cob,a),'y');
    g.save(); g.rotate(a); g.clip(cob);
    line(g,'#c98612',.05,g=>{for(let y=-.7;y<.6;y+=.17){g.moveTo(-.4,y); g.lineTo(.4,y);} g.moveTo(-.12,-.8); g.lineTo(-.12,.6); g.moveTo(.12,-.8); g.lineTo(.12,.6);});
    g.restore(); edge(g,rot(cob,a)); shine(g,-.13,-.44,.05,.15,a);
    const husk=P(p=>{p.moveTo(0,.74); p.quadraticCurveTo(-.62,.4,-.42,-.26); p.quadraticCurveTo(-.18,.22,.06,.36); p.closePath();});
    ink(g,rot(husk,a),'g'); ink(g,rot(mir(husk),a),'g');
  }],
  fish:['#f7a03e',g=>{
    ink(g,poly([.3,0,.86,-.44,.74,0,.86,.44]),'o');
    ink(g,P(p=>{p.moveTo(-.36,-.36); p.quadraticCurveTo(-.06,-.7,.16,-.26); p.closePath();}),'o');
    ink(g,P(p=>{p.moveTo(-.84,.02); p.quadraticCurveTo(-.32,-.8,.4,-.04); p.lineTo(.4,.08); p.quadraticCurveTo(-.32,.8,-.84,.02);}),'o');
    line(g,INK,.06,g=>{g.moveTo(-.36,-.22); g.quadraticCurveTo(-.28,.02,-.36,.24);});
    flat(g,ell(-.56,-.06,.11),'#fffaf0',.06); flat(g,ell(-.58,-.06,.05),INK,.01);
    shine(g,-.12,-.2,.12,.045,-.15);
  }],
  buoy:['#f2553b',g=>{
    const d=P(p=>{p.arc(0,0,.78,0,Math.PI*2); p.moveTo(.36,0); p.arc(0,0,.36,0,Math.PI*2,true);});
    ink(g,d,'r');
    within(g,d,()=>{for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2, w=P(p=>{p.moveTo(0,0); p.arc(0,0,1,a-.26,a+.26); p.closePath();}); flat(g,w,i?'#fffaf0':'#dcccb0',.07);}});
    edge(g,d); shine(g,-.06,-.58,.12,.045,-.1);
  }],
  shell:['#f36cb0',g=>{
    const R=1.1, pt=(k,r)=>{const a=Math.PI*(1.2+k*.1); return [Math.cos(a)*r,.66+Math.sin(a)*r];};
    ink(g,poly([-.3,.66,.3,.66,.24,.84,-.24,.84]),'p');
    const s=P(p=>{p.moveTo(0,.66); p.lineTo(...pt(0,R)); for(let k=0;k<6;k++) p.quadraticCurveTo(...pt(k+.5,R*1.12),...pt(k+1,R)); p.closePath();});
    ink(g,s,'p');
    within(g,s,()=>line(g,'#9e2a68',.05,g=>{for(let k=1;k<6;k++){g.moveTo(0,.66); g.lineTo(...pt(k,R*1.2));}}));
    edge(g,s); shine(g,-.32,-.16,.05,.13,-.5);
  }],
  tram:['#4199f0',g=>{
    line(g,INK,.07,g=>{g.moveTo(0,-.58); g.lineTo(-.24,-.76); g.lineTo(0,-.92); g.lineTo(.24,-.76); g.closePath(); g.moveTo(-.32,-.92); g.lineTo(.32,-.92);});
    ink(g,P(p=>p.roundRect(-.62,-.6,1.24,1.26,.24)),'b');
    flat(g,P(p=>p.roundRect(-.48,-.44,.96,.44,.1)),'#bfe8ff');
    line(g,INK,.06,g=>{g.moveTo(0,-.44); g.lineTo(0,0);});
    g.fillStyle='#fffaf0'; g.fillRect(-.555,.1,1.11,.14);
    flat(g,ell(-.34,.42,.09),'#ffd34d',.06); flat(g,ell(.34,.42,.09),'#ffd34d',.06);
    ink(g,P(p=>p.roundRect(-.5,.62,1,.16,.06)),'k');
    shine(g,-.3,-.32,.1,.045,-.3);
  }],
  kite:['#62c65c',g=>{
    tube(g,'#fffaf0',.04,g=>{g.moveTo(0,.6); g.bezierCurveTo(-.3,.78,.3,.84,.1,.98);});
    flat(g,poly([-.12,.72,.12,.86,.12,.72,-.12,.86]),'#f2553b',.05);
    const k=poly([0,-.88,.62,-.16,0,.62,-.62,-.16]);
    ink(g,k,'g'); within(g,k,()=>ink(g,poly([0,-.88,.62,-.16,0,-.16]),'y',.08));
    line(g,INK,.06,g=>{g.moveTo(0,-.88); g.lineTo(0,.62); g.moveTo(-.62,-.16); g.lineTo(.62,-.16);});
    edge(g,k); shine(g,-.22,-.4,.04,.12,.75);
  }],
  sun:['#ffd34d',g=>{
    ink(g,P(p=>{for(let i=0;i<32;i++){const a=i*Math.PI/16, r=i%2?.6:.86; p.lineTo(Math.sin(a)*r,-Math.cos(a)*r);} p.closePath();}),'y');
    ink(g,ell(0,0,.46),'o');
    shine(g,-.18,-.22,.1,.05,-.6);
  }],
  ankh:['#c0743f',g=>{
    const f=g=>{g.ellipse(0,-.44,.25,.32,0,0,Math.PI*2); g.moveTo(-.52,0); g.lineTo(.52,0); g.moveTo(0,-.12); g.lineTo(0,.84);};
    tube(g,'#b8652c',.2,f); g.save(); g.translate(-.025,-.03); line(g,'#ec9f52',.12,f); g.restore();
    shine(g,-.2,-.5,.03,.1,.2);
  }],
  balloon:['#f2553b',g=>{
    line(g,INK,.05,g=>{g.moveTo(-.22,.3); g.lineTo(-.15,.58); g.moveTo(.22,.3); g.lineTo(.15,.58);});
    ink(g,P(p=>p.roundRect(-.2,.54,.4,.3,.06)),'br');
    const b=P(p=>{p.moveTo(0,.38); p.bezierCurveTo(-.92,-.1,-.72,-.94,0,-.94); p.bezierCurveTo(.72,-.94,.92,-.1,0,.38);});
    ink(g,b,'r'); within(g,b,()=>ink(g,ell(0,-.3,.22,.8),'y',.08));
    edge(g,b); shine(g,-.4,-.5,.06,.15,.4);
  }],
  lotus:['#f36cb0',g=>{
    ink(g,ell(0,.62,.72,.17),'g');
    const pet=P(p=>{p.moveTo(0,0); p.quadraticCurveTo(-.36,-.6,0,-1.22); p.quadraticCurveTo(.36,-.6,0,0);});
    for(const [a,s] of [[-1.05,.72],[1.05,.72],[-.52,.88],[.52,.88],[0,1]]) ink(g,rot(pet,a,0,.52,s),'p');
    shine(g,-.08,-.36,.04,.14);
  }],
  horus:['#4199f0',g=>{
    ink(g,ell(0,0,.8),'b');
    line(g,INK,.11,g=>{g.moveTo(-.52,-.36); g.quadraticCurveTo(0,-.6,.54,-.4);});
    flat(g,P(p=>{p.moveTo(-.52,-.04); p.quadraticCurveTo(0,-.44,.52,-.04); p.quadraticCurveTo(0,.26,-.52,-.04);}),'#fffaf0');
    flat(g,ell(.02,-.08,.15),INK,.01);
    line(g,INK,.09,g=>{g.moveTo(-.06,.14); g.lineTo(-.1,.56); g.moveTo(.14,.12); g.bezierCurveTo(.26,.5,.58,.5,.5,.28);});
    shine(g,-.4,-.5,.12,.055,-.7);
  }],
  palm:['#62c65c',g=>{
    tube(g,'#a8622f',.18,g=>{g.moveTo(-.06,.84); g.quadraticCurveTo(-.1,.2,.06,-.32);});
    line(g,'#6e3a18',.05,g=>{for(const y of [.6,.36,.12]){g.moveTo(-.14,y); g.lineTo(.02,y-.05);}});
    const leaf=P(p=>{p.moveTo(0,0); p.quadraticCurveTo(.36,-.36,.8,-.02); p.quadraticCurveTo(.4,.12,0,0);});
    for(const [l,a] of [[leaf,.45],[mir(leaf),-.45],[leaf,-.4],[mir(leaf),.4],[leaf,-1.45]]) ink(g,rot(l,a,.06,-.34),'g');
    for(const [x,y] of [[-.04,-.2],[.14,-.18],[.05,-.08]]) flat(g,ell(x,y,.08),'#c0743f',.05);
  }],
  pot:['#d48a4e',g=>{
    ink(g,P(p=>p.roundRect(-.2,-.84,.4,.38,.06)),'tc');
    const b=P(p=>{p.moveTo(-.18,-.5); p.bezierCurveTo(-.86,-.3,-.86,.64,0,.68); p.bezierCurveTo(.86,.64,.86,-.3,.18,-.5); p.closePath();});
    ink(g,b,'tc');
    within(g,b,()=>line(g,'#fffaf0',.08,g=>{g.moveTo(-.8,.08); for(let i=1;i<=8;i++) g.lineTo(-.8+i*.2,i%2?-.08:.08);}));
    edge(g,b); flat(g,ell(0,-.84,.2,.06),'#6e3418',.06);
    shine(g,-.36,-.2,.06,.16,.3);
  }],
  felucca:['#4199f0',g=>{
    tube(g,'#a8622f',.06,g=>{g.moveTo(.06,.34); g.lineTo(.06,-.36);});
    ink(g,P(p=>{p.moveTo(.4,-.9); p.lineTo(-.72,.2); p.quadraticCurveTo(-.3,.32,.06,.28); p.quadraticCurveTo(.36,-.26,.4,-.9);}),'w');
    tube(g,'#a8622f',.05,g=>{g.moveTo(.44,-.96); g.lineTo(-.78,.26);});
    const h=P(p=>{p.moveTo(-.84,.32); p.quadraticCurveTo(0,.42,.86,.26); p.quadraticCurveTo(.64,.8,-.48,.76); p.closePath();});
    ink(g,h,'b'); within(g,h,()=>line(g,'#fffaf0',.06,g=>{g.moveTo(-.8,.5); g.quadraticCurveTo(0,.56,.8,.44);}));
    edge(g,h); shine(g,-.18,-.22,.035,.16,.6);
  }],
  croc:['#62c65c',g=>{
    ink(g,P(p=>{p.moveTo(-.86,.42); p.lineTo(-.86,-.08); p.quadraticCurveTo(-.62,-.36,-.26,-.32); p.quadraticCurveTo(-.12,-.72,.1,-.32); p.lineTo(.7,-.2); p.quadraticCurveTo(.92,-.14,.88,.06); p.quadraticCurveTo(.86,.22,.62,.2); p.lineTo(-.3,.28); p.quadraticCurveTo(-.58,.52,-.86,.42); p.closePath();}),'g');
    line(g,INK,.07,g=>{g.moveTo(-.42,.12); g.lineTo(.8,.04);});
    for(let x=-.2;x<.7;x+=.2){const y=.12-(x+.42)*.066; flat(g,poly([x,y,x+.1,y-.007,x+.05,y+.12]),'#fffaf0',.04);}
    flat(g,ell(-.06,-.42,.13),'#fffaf0',.07); flat(g,ell(-.03,-.42,.04,.09),INK,.01);
    g.fillStyle=INK; g.beginPath(); g.arc(.74,-.08,.04,0,7); g.fill();
    shine(g,.3,-.17,.12,.04,.15);
  }],
  crate:['#c98a4a',g=>{const b=poly([-.74,-.68,.74,-.68,.74,.7,-.74,.7]); ink(g,b,['#e0a862','#a8692f']);
    within(g,b,()=>{line(g,INK,.06,g=>{g.moveTo(-.74,-.22);g.lineTo(.74,-.22);g.moveTo(-.74,.24);g.lineTo(.74,.24);}); line(g,INK,.07,g=>{g.moveTo(-.5,.62);g.lineTo(.5,-.6);});});
    g.fillStyle=INK; for(const [x,y] of [[-.6,-.54],[.6,-.54],[-.6,.56],[.6,.56]]){g.beginPath();g.arc(x,y,.05,0,7);g.fill();}
    edge(g,b); shine(g,-.42,-.46,.16,.05);
  }],
};
function drawKind(g,k,u){
  g.save(); g.scale(u,u); g.lineJoin=g.lineCap='round';
  g.fillStyle='rgba(40,20,6,.3)'; g.beginPath(); g.ellipse(0,.86,.6,.12,0,0,7); g.fill();
  KIND[k][1](g); g.restore();
}
function drawPiece(g,t,u){drawKind(g,t<6?CH.tiles[t]:'shoe',u);}
function drawSandTile(g,l,s){
  const col=l>1?['#cc9d5e','#a37236']:['#ecd096','#cfa564'];
  rr(g,s*.05,s*.05,s*.9,s*.9,s*.16); g.fillStyle=lin(g,0,0,0,s,col); g.fill();
  let q=l*99; const sr=()=>(q=(q*16807)%2147483647)/2147483647;
  g.fillStyle='rgba(120,80,30,.35)'; for(let i=0;i<14;i++){g.beginPath(); g.arc(s*(.14+sr()*.72),s*(.14+sr()*.72),s*.025,0,7); g.fill();}
  g.strokeStyle='rgba(255,242,205,.5)'; g.lineWidth=s*.04;
  for(let i=0;i<(l>1?3:2);i++){const y=s*(.32+i*.2); g.beginPath(); g.moveTo(s*.16,y); g.quadraticCurveTo(s*.33,y-s*.06,s*.5,y); g.quadraticCurveTo(s*.67,y+s*.06,s*.84,y); g.stroke();}
}
function drawBg(g){
  rr(g,0,0,B,B,F*1.6); g.fillStyle=lin(g,0,0,0,B,CH.frame); g.fill();
  g.strokeStyle='rgba(0,0,0,.13)'; g.lineWidth=1;
  for(let i=0;i<14;i++){const y=i*B/14+3; g.beginPath(); g.moveTo(0,y); g.bezierCurveTo(B*.3,y+4,B*.6,y-4,B,y+2); g.stroke();}
  rr(g,F*.42,F*.42,B-F*.84,B-F*.84,F*1.2); g.strokeStyle=CH.border; g.lineWidth=Math.max(1.5,F*.16); g.stroke();
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){
    const x=F+c*S, y=F+r*S; g.fillStyle=CH.cells[(r+c)%2]; g.fillRect(x,y,S,S);
    g.save(); g.translate(x+S/2,y+S/2); g.fillStyle=CH.tint;
    g.rotate(Math.PI/4); g.fillRect(-S*.22,-S*.22,S*.44,S*.44); g.rotate(-Math.PI/4); g.fillRect(-S*.22,-S*.22,S*.44,S*.44); g.restore();
  }
  g.strokeStyle='rgba(0,0,0,.28)'; g.lineWidth=1; g.beginPath();
  for(let i=1;i<N;i++){g.moveTo(F+i*S,F); g.lineTo(F+i*S,F+N*S); g.moveTo(F,F+i*S); g.lineTo(F+N*S,F+i*S);} g.stroke();
  g.strokeStyle='rgba(0,0,0,.5)'; g.lineWidth=2; g.strokeRect(F,F,S*N,S*N);
}
function buildArt(){
  for(let t=0;t<7;t++){const [o,g]=off(S,S); g.translate(S/2,S/2); drawPiece(g,t,S*.4); spr[t]=o;}
  {const [o,g]=off(S,S); g.translate(S/2,S/2); drawKind(g,'crate',S*.4); spr[7]=o;}
  for(let l=1;l<3;l++){const [o,g]=off(S,S); drawSandTile(g,l,S); sandSpr[l]=o;}
  const [o,g]=off(B,B); drawBg(g); bg=o;
}
function resize(){
  dpr=Math.min(window.devicePixelRatio||1,3);
  B=Math.max(220,Math.floor(Math.min(stage.clientWidth,stage.clientHeight)));
  F=Math.round(B*.035); S=(B-2*F)/N;
  cv.style.width=cv.style.height=B+'px'; cv.width=cv.height=Math.round(B*dpr);
  buildArt();
}
function drawKeeper(){
  const k=$('#keeperCv'), s=52; k.width=k.height=s*dpr; const g=k.getContext('2d'); g.scale(dpr,dpr);
  g.fillStyle='#3a2a5e'; g.beginPath(); g.arc(26,26,25,0,7); g.fill(); g.strokeStyle='#e7b24a'; g.lineWidth=2; g.stroke();
  g.fillStyle='#c98d5f'; g.beginPath(); g.arc(26,32,13,0,7); g.fill();
  g.fillStyle='#b3202a'; g.beginPath(); g.moveTo(14.5,24); g.lineTo(18,9); g.lineTo(34,9); g.lineTo(37.5,24); g.closePath(); g.fill();
  g.fillStyle='#86141d'; g.beginPath(); g.ellipse(26,9,8,2,0,0,7); g.fill();
  g.strokeStyle='#111'; g.lineWidth=1.6; g.beginPath(); g.moveTo(26,9); g.quadraticCurveTo(34,9,36,17); g.stroke(); g.fillStyle='#111'; g.fillRect(34.5,16,3,5);
  g.fillStyle='#1a0e08'; g.beginPath(); g.arc(21.5,30,1.6,0,7); g.arc(30.5,30,1.6,0,7); g.fill();
  g.strokeStyle='#2a1a10'; g.lineWidth=2.6; g.lineCap='round'; g.beginPath(); g.moveTo(26,35.5); g.quadraticCurveTo(21,34,18.5,37); g.moveTo(26,35.5); g.quadraticCurveTo(31,34,33.5,37); g.stroke();
  g.lineWidth=1.4; g.beginPath(); g.arc(26,37.5,4,.3,Math.PI-.3); g.stroke();
}

/* ---------- audio: plucks on the Hijaz scale, darbuka doum/tak ---------- */

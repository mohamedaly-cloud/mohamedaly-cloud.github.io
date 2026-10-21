'use strict';
const N=8, T=6;
let COLORS=['#f5b83a','#a55a32','#e2482c','#d23a86','#2f7bd6','#45a84e'];
let lang=''; try{lang=localStorage.getItem('soukKhan.lang')||'';}catch(_){}
const EN=(lang||(/^ar/i.test(navigator.language)?'ar':'en'))==='en';
let NAMES=EN?['lanterns','dates','spices','hibiscus','blue beads','mint']:['فانوس','بلحة','بهارات','كركديه','خرزة زرقا','نعناع'];
const PRAISE=EN?['Nice!','Wow!','Bravo, boss!','Brilliant!','So sweet!','Unreal!']:['حلو!','يا سلام!','عاش يا معلم!','الله ينور!','إيه الحلاوة دي!','ولا في الأحلام!'];
const KEEPER=EN?{
  combo:['Hands of silk!','Now that is a master move!','Look at you, usta!'],
  low:['Only a few moves left, focus!','Easy... think before you move'],
  win:['May your shop keep growing!','The shop shines thanks to you!','Well earned, boss!'],
  lose:['Never mind, next time is sweeter','Market life: some days up, some days down'],
  bad:['Nope, that one won\'t work','No three here, habibi'],
  shoe:['Grandma\'s slipper! Nothing stands in its way','Duck! The slipper is flying!'],
  shuffle:['The goods got mixed up, let me sort them again'],
}:{
  combo:['إيدك تتلف في حرير!','دي حركة معلمين!','الله عليك يا أسطى!'],
  low:['فاضل حركات قليلة، ركّز يا بطل','على مهلك... فكّر قبل ما تحرّك'],
  win:['ربنا يزيد ويبارك!','الدكان نوّر بيك!','حلال عليك يا معلم!'],
  lose:['ولا يهمك، المرة الجاية أحلى','معلش، السوق كده: يوم لك ويوم عليك'],
  bad:['لأ لأ، دي مش هتنفع','مفيش تلاتة هنا يا حبيبي'],
  shoe:['شبشب تيتة! محدش يقف قدامه','حاسب! الشبشب طاير!'],
  shuffle:['البضاعة اتلخبطت، أرتبها لك تاني'],
};
const S2=s=>s.split(' ');
const LEVELS=[
  {name:'خان الخليلي',moves:20,goals:{0:15},say:'الفوانيس اتلخبطت! لِم لي ١٥ فانوس',en:['Khan el-Khalili','The lanterns are a mess! Get me 15 lanterns']},
  {name:'سوق العطارين',moves:22,goals:{1:14,5:14},say:'الزباين عايزة بلح ونعناع',en:['Attarine Market','The customers want dates and mint']},
  {name:'الصاغة',moves:24,sand:S2('00000000 00000000 00111100 00111100 00111100 00111100 00000000 00000000'),say:'الرملة غطّت البلاط، وفّق فوقها تنضف',en:['Goldsmiths\' Row','Sand covered the tiles: match on top to clean it']},
  {name:'زنقة الستات',moves:25,goals:{4:12},sand:S2('22000022 21000012 00000000 00000000 00000000 00000000 21000012 22000022'),say:'الخرز الأزرق بيحمي الدكان من العين',en:['Zanqet el-Settat','Blue beads guard the shop from the evil eye']},
  {name:'المنشية',moves:30,sand:S2('11111111 11111111 11222211 11222211 11222211 11222211 11111111 11111111'),say:'آخر مرحلة في الخان: السوق كله رملة!',en:['Manshiya','Last level in the Khan: the whole souk is sand!']},
  {name:'الهرم الأكبر',moves:22,goals:{0:16},say:'أول مرة نطلع من الخان! هات لي ١٦ هرم صغير للسياح',en:['The Great Pyramid','First trip out of the Khan! Bring me 16 little pyramids for the tourists']},
  {name:'أبو الهول',moves:24,goals:{4:14,3:12},crate:S2('00000000 00000000 00000000 00011000 00011000 00000000 00000000 00000000'),say:'الجعران والخرطوش بيتباعوا زي العيش السخن',en:['The Sphinx','Scarabs and cartouches sell like hot bread']},
  {name:'نزلة السمان',moves:25,goals:{1:15},sand:S2('00000000 01111110 01000010 01000010 01000010 01000010 01111110 00000000'),say:'شاي للسياح، والرملة في كل حتة',en:['Nazlet el-Semman','Tea for the tourists, and sand everywhere']},
  {name:'الصوت والضوء',moves:26,goals:{2:12,5:12},sand:S2('00000000 00000000 11000011 11100111 11100111 11000011 00000000 00000000'),say:'طرابيش وبردي، والعرض بيبدأ الساعة سبعة',en:['Sound and Light','Fezzes and papyrus: the show starts at seven']},
  {name:'هضبة الأهرام',moves:30,sand:S2('00011000 00111100 00111100 01111110 01111110 11111111 11222211 11222211'),say:'الهضبة كلها رملة! نضّفها قبل الأتوبيس ما ييجي',en:['Giza Plateau','The whole plateau is sand! Clean it before the tour bus comes']},
  {name:'محطة الرمل',moves:22,goals:{4:15},say:'وصلنا إسكندرية! الترام الأزرق في كل حتة',en:['Raml Station','We made it to Alex! Blue trams everywhere']},
  {name:'ستانلي',moves:24,goals:{0:14,5:14},say:'درة مشوية وطيارات ورق على الكورنيش',en:['Stanley','Grilled corn and kites along the Corniche']},
  {name:'الأنفوشي',moves:25,goals:{1:16},crate:S2('00000000 00000000 00000000 00000000 00000000 00000000 10011001 11000011'),say:'السمك طازة من المينا، لِم لي ١٦ سمكة',en:['Anfushi','Fresh fish from the harbour: get me 16']},
  {name:'بحري',moves:26,goals:{3:12,2:10},sand:S2('11000011 10000001 00000000 00000000 00000000 00000000 10000001 11000011'),say:'الموج رمى صدف وعوامات على الشط',en:['Bahary','The waves threw shells and buoys up on the beach']},
  {name:'قلعة قايتباي',moves:30,sand:S2('22222222 21111112 21000012 21000012 21000012 21000012 21111112 22222222'),say:'رملة البحر غطّت القلعة! يلا ننضف',en:['Qaitbay Citadel','Beach sand covered the citadel! Let\'s clean up']},
  {name:'معبد الأقصر',moves:24,goals:{1:16},say:'مفاتيح الحياة! السياح بيحبوها',en:['Luxor Temple','Ankhs, the keys of life: tourists love them']},
  {name:'البالونات',moves:25,goals:{2:14,0:12},crate:S2('00000000 00000000 00100100 00000000 00000000 00100100 00000000 00000000'),say:'البالونات طالعة مع الشمس، اصحى بدري',en:['The Balloons','The balloons rise with the sun: wake up early']},
  {name:'الكرنك',moves:26,goals:{3:14},sand:S2('01010101 01010101 01010101 00000000 00000000 10101010 10101010 10101010'),say:'الرملة داخلة بين العواميد، وعايز لوتس',en:['Karnak','Sand blows between the columns, and I need lotus flowers']},
  {name:'وادي الملوك',moves:27,goals:{4:14,5:12},crate:S2('00000000 00000000 00000000 00000000 00000000 01100110 01100110 00000000'),say:'عين حورس بتحمي الرحلة',en:['Valley of the Kings','The Eye of Horus keeps the trip safe']},
  {name:'طريق الكباش',moves:30,sand:S2('11111111 11111111 22222222 11111111 11111111 22222222 11111111 11111111'),say:'طريق الكباش كله تراب! ده آخر يوم في الأقصر',en:['Avenue of Sphinxes','The whole Avenue of Sphinxes is dusty! Last day in Luxor']},
  {name:'كورنيش أسوان',moves:24,goals:{4:16},say:'فلوكة على النيل، الهوا هنا حلو',en:['Aswan Corniche','Feluccas on the Nile: the breeze here is lovely']},
  {name:'سوق أسوان',moves:25,goals:{2:14,3:14},say:'كركديه أسوان أحلى كركديه في مصر',en:['Aswan Souk','Aswan hibiscus is the best in Egypt']},
  {name:'غرب سهيل',moves:26,goals:{1:14},sand:S2('00000000 00111100 01111110 01100110 01100110 01111110 00111100 00000000'),say:'بيوت النوبة الملونة... هات القلل',en:['Gharb Soheil','Colourful Nubian houses: bring the clay pots']},
  {name:'معبد فيلة',moves:27,goals:{5:12,0:12},crate:S2('00000000 00000000 00000000 10000001 10000001 00000000 00011000 00111100'),say:'تمساح نوبي صغير وشمس حامية',en:['Philae Temple','A little Nubian croc and a blazing sun']},
  {name:'أبو سمبل',moves:32,sand:S2('22222222 22222222 21111112 21111112 11111111 11111111 11111111 11111111'),say:'آخر محطة! الشمس بتدخل المعبد، والدكان هيبقى أحلى دكان في الخان',en:['Abu Simbel','Last stop! The sun lights up the temple, and the shop will be the finest in the Khan']}
];
if(EN) LEVELS.forEach(L=>{[L.name,L.say]=L.en;});
// each chapter is one of Uncle Metwally's restocking trips: its own board colours and tiles
const W6='rgba(255,255,255,.06)';
const CHAPTERS=[
  {name:['Cairo · Khan el-Khalili','القاهرة · خان الخليلي'],trip:["Uncle Metwally's shop",'دكان عم متولي'],first:0,frame:['#7d4a27','#4a2914'],border:'#e7b24a',cells:['#106068','#0d5057'],tint:'rgba(130,230,215,.07)',
   tiles:['fanous','dates','spice','karkade','bead','mint'],names:[['lanterns','dates','spices','hibiscus','blue beads','mint'],['فانوس','بلحة','بهارات','كركديه','خرزة زرقا','نعناع']]},
  {name:['Giza · The Pyramids','الجيزة · الأهرامات'],trip:['A souvenir run to the pyramids','مشوار للهرم يجيب تذكارات'],first:5,frame:['#b07a3c','#6e4520'],border:'#ffd36a',cells:['#2b5c8a','#244f78'],tint:W6,
   tiles:['pyramid','tea','fez','cartouche','scarab','papyrus'],names:[['pyramids','tea glasses','fezzes','cartouches','scarabs','papyrus'],['هرم','كوباية شاي','طربوش','خرطوش','جعران','بردي']]},
  {name:['Alexandria · The Corniche','إسكندرية · الكورنيش'],trip:['The train to Alex','القطر لإسكندرية'],first:10,frame:['#2b6f9e','#173f63'],border:'#f4efe2',cells:['#1b7f8e','#166f7d'],tint:W6,
   tiles:['corn','fish','buoy','shell','tram','kite'],names:[['grilled corn','fish','life rings','shells','trams','kites'],['درة','سمكة','عوامة','صدفة','ترام','طيارة ورق']]},
  {name:['Luxor · Karnak','الأقصر · الكرنك'],trip:['Sleeper train south','قطر النوم للصعيد'],first:15,frame:['#c46a3a','#7a3a1e'],border:'#ffcf5a',cells:['#3d2e6b','#33265c'],tint:W6,
   tiles:['sun','ankh','balloon','lotus','horus','palm'],names:[['suns','ankhs','balloons','lotus flowers','Horus eyes','palms'],['شمس','مفتاح حياة','بالونة','لوتس','عين حورس','نخلة']]},
  {name:['Aswan · Abu Simbel','أسوان · أبو سمبل'],trip:['A Nile cruise to Aswan','رحلة نيلية لأسوان'],first:20,frame:['#d79a52','#8e5a2a'],border:'#4fc2d6',cells:['#155f78','#11506a'],tint:W6,
   tiles:['sun','pot','spice','karkade','felucca','croc'],names:[['suns','clay pots','spices','hibiscus','feluccas','crocodiles'],['شمس','قلة','بهارات','كركديه','فلوكة','تمساح']]},
];
CHAPTERS.forEach(C=>{const k=EN?0:1; C.name=C.name[k]; C.trip=C.trip[k]; C.names=C.names[k];});
let CH=null;
const chapterOf=i=>CHAPTERS.filter(C=>C.first<=i).pop();
// shortcut: page background not per chapter, upgrade if it looks off
function setChapter(i){const C=chapterOf(i); if(C===CH) return; CH=C;
  COLORS=C.tiles.map(k=>KIND[k][0]); NAMES=C.names; if(typeof bg!=='undefined'&&bg) buildArt();}

const $=s=>document.querySelector(s);
const ar=n=>Number(n).toLocaleString(EN?'en-US':'ar-EG');
const AND=EN?' and ':' و ', SAND=EN?'sand':'رملة', CRATE=EN?'crates':'صناديق';
const rnd=n=>Math.random()*n|0;
const K=(r,c)=>r*N+c, R_=k=>(k/N)|0, C_=k=>k%N;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

let board=[], sand=[], lvl=0, moves=0, score=0, goals={}, sandGoal=false, crateGoal=false;
let aim=false, busy=true, over=true, sel=-1, cur=27, kbd=false, uid=0, lastAct=0, hint=null, shake=0, time=0;
const dying=[], parts=[], beams=[], rings=[], zaps=[], texts=[];

const at=k=>board[R_(k)][C_(k)];
const eachCell=f=>{for(let k=0;k<N*N;k++) f(k);};
const newPiece=(t,c,r)=>({t,sp:null,x:c,y:r,vy:0,sq:0,born:0,spent:false,id:++uid});

/* ---------- art ---------- */
const cv=$('#board'), ctx=cv.getContext('2d'), stage=$('.stage');

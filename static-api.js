// Static mobile prototype; no real advertisements, authentication or server rewards.
const KEY='qq-sports-pages-v1';
const pool=fetch(new URL('./config/lucky-fortunes.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('签文加载失败');return r.json()});
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function random(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n;}
async function run(path,body){
 const fortunes=await pool,today=day();let db;try{db=JSON.parse(localStorage.getItem(KEY)||'null')}catch{throw Error('浏览器记录无法读取')}
 db??={records:{},sports:{},ads:{}};
 const sports=db.sports[today]||{steps:7111,goal:5000};
 function draw(date,makeup=false){if(!db.records[date]){const roll=random(100);db.records[date]={date,fortune:{...fortunes[random(fortunes.length)],rarity:roll<2?'gold':roll<20?'purple':'teal'},makeup,sports:date===today?{...sports}:{steps:null,goal:null}};}}
 let ad,completedDate;
 if(path==='/api/fortune/draw')draw(today);
 else if(path==='/api/demo/sports'){for(const [key,min] of [['steps',0],['goal',1]])if(body[key]!==null&&(!Number.isInteger(body[key])||body[key]<min||body[key]>200000))throw Error('步数或目标无效');db.sports[today]=body;}
 else if(path==='/api/demo/ad/start'){
  const date=body.date;if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date>=today)throw Error('只能补签过去未收签的日期');
  ad=null;if(!db.records[date]){const token=crypto.randomUUID();db.ads[token]={date,start:Date.now()};ad={token,date,durationSeconds:10,demo:true};}
 }else if(path==='/api/demo/ad/cancel'){if(db.ads[body.token]&&!db.ads[body.token].done)db.ads[body.token].cancelled=true;}
 else if(path==='/api/demo/ad/complete'){
  const ticket=db.ads[body.token];if(!ticket)throw Error('补签凭证无效');
  if(!ticket.done){if(ticket.cancelled||Date.now()-ticket.start>600000)throw Error('本次观看已结束，请重试');if(Date.now()-ticket.start<10000)throw Error('请完整观看后领取');draw(ticket.date,true);ticket.done=true;}completedDate=ticket.date;
 }else if(!['/api/fortune','/api/fortune/history'].includes(path))throw Error('未知请求');
 if(body!==undefined)localStorage.setItem(KEY,JSON.stringify(db));
 const tomorrow=new Date(Date.parse(today+'T00:00:00+08:00')+86400000).toISOString();
 const state={date:today,serverNow:new Date().toISOString(),nextReset:tomorrow,fortune:db.records[today]?.fortune||null,sports:db.sports[today]||sports,mode:'static-preview',records:Object.values(db.records).sort((a,b)=>b.date.localeCompare(a.date)).map(r=>r.date===today?{...r,sports:db.sports[today]||sports}:r)};
 if(ad!==undefined)state.ad=ad;if(completedDate)state.completedDate=completedDate;return state;
}
let queue=Promise.resolve();
export function staticAPI(path,body){const request=()=>run(path,body);const job=()=>navigator.locks?navigator.locks.request(KEY,request):request();const result=queue.then(job,job);queue=result.catch(()=>{});return result;}

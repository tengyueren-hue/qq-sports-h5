const dialog=document.querySelector('#home-dialog');
const fields=document.querySelector('#dialog-fields');
const toast=document.querySelector('#toast');
let toastTimer;
function notify(text){toast.textContent=text;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2300)}
function show(title,copy){document.querySelector('#dialog-title').textContent=title;document.querySelector('#dialog-copy').textContent=copy;fields.replaceChildren();dialog.showModal()}
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-home-action]');if(!button)return;
 const action=button.dataset.homeAction;
 if(action==='calendar'){location.assign('./sports-calendar.html');return}
 if(action==='rank'){document.querySelector('#friend-ranking').scrollIntoView({behavior:'smooth'});return}
 if(action==='like'){
  const liked=button.getAttribute('aria-pressed')==='true';button.setAttribute('aria-pressed',String(!liked));
  button.querySelector('span').textContent=Number(button.querySelector('span').textContent)+(liked?-1:1);
  button.querySelector('img').src=`./assets/home/1902-158081-imgLike${liked?'':'Filled'}.svg`;return;
 }
 if(action==='goal'){
  show('设置步数目标','这是个人运动目标，与走运签的幸运步数无关。');
  const input=document.createElement('input');input.type='number';input.min='1000';input.max='100000';input.step='100';input.value=document.querySelector('#goal-number').textContent==='—'?'5000':document.querySelector('#goal-number').textContent;input.setAttribute('aria-label','目标步数');
  const save=document.createElement('button');save.type='button';save.textContent='保存';save.onclick=async()=>{if(!input.reportValidity()||!input.value)return;save.disabled=true;try{const {fetchState}=await import('./fortune-data.js');const current=await fetchState();const next=await fetchState('/api/demo/sports',{steps:current.sports.steps,goal:Number(input.value)});dispatchEvent(new CustomEvent('sports:updated',{detail:next}));dialog.close();notify('个人目标已更新')}catch{notify('更新失败，请重试')}finally{save.disabled=false}};fields.append(input,save);return;
 }
 if(action==='share'){try{await navigator.clipboard.writeText(location.href);notify('首页链接已复制')}catch{show('分享QQ运动',location.href)}return}
 const info={profile:['高能泡泡','今日 7111 步\n好友排行第 6 名'],calendar:['运动日历','当前运动数据为设计演示数据。\n真实运动日历尚未接入。'],date:['运动日历','运动数据为设计演示数据，其他日期暂无记录。'],analysis:[button.dataset.title||'运动分析','运动分析详情尚未接入。'],donate:['捐步做公益','当前为页面预览，真实捐步服务尚未接入。'],run:['开始跑步','跑步记录需要 QQ 客户端的定位和运动服务，当前预览未接入。']};
 if(info[action])show(...info[action]);
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});

(() => {
const root=document.querySelector('.screen'),page=root.dataset.page;
const $=id=>document.querySelector(`[data-figma-id="${id}"]`);
let deviceBound=new URLSearchParams(location.search).get('device')!=='off';
if(!location.search.includes('device='))deviceBound=window.QQ_SPORTS_CONFIG.deviceBound;
function setDevice(bound){deviceBound=bound;root.classList.toggle('device-off',!bound)}
function go(name){location.href=`${name}.html?device=${deviceBound?'on':'off'}`}
function action(el,label,fn){if(!el)return;el.classList.add('interactive');el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label',label);el.addEventListener('click',fn);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn(e)}})}
function toast(text){document.querySelector('.toast')?.remove();const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=text;document.body.append(t);setTimeout(()=>t.remove(),2500)}
function device(id){const el=$(id);if(el)el.dataset.deviceOnly='true'}
if(page==='plugin'){
 // Remove exactly the fourth reminder; keep analysis and the first three rows.
 $('1172:23482')?.remove();
 ['1172:23713','1172:23268'].forEach(id=>action($(id),'进入QQ运动首页',()=>go('home')));
 ['1172:23620','1172:23623','1172:23625'].forEach((id,i)=>action($(id),['今日步数','跑步','习惯打卡'][i],()=>i===0?go('home'):toast(i===1?'跑步入口演示':'习惯打卡入口演示')));
 action($('1172:23585'),'进入运动首页',()=>go('home'));
}
if(page==='home'){
 ['2602:9278','2602:9279','2602:9307'].forEach(device);
 action($('2602:9810'),'我的运动主页',()=>go('profile'));
 ['2602:9661','2602:9735'].forEach(id=>action($(id),'查看我的运动主页',()=>go('profile')));
 action($('2602:9921'),'运动日历',()=>go('calendar'));
 action($('2602:9830'),'返回插件页',()=>go('plugin'));
 action($('2602:9834'),'查看排行榜',()=>$("2602:9646").scrollIntoView({behavior:'smooth'}));
 for(const el of root.querySelectorAll('[data-name="like"]'))action(el,'点赞',()=>{const p=el.parentElement.querySelector('p');if(p){const active=el.getAttribute('aria-pressed')==='true';p.textContent=Number(p.textContent)+(active?-1:1);el.setAttribute('aria-pressed',String(!active))}});
}
if(page==='calendar'){
 action(root.querySelector('[data-name="back"]'),'返回首页',()=>go('home'));
 for(const e of root.querySelectorAll('.calendar-days>div'))action(e,'查看当天运动',()=>{const numbers=[...e.querySelectorAll('p')].map(p=>p.textContent.trim());toast(numbers.length?`${numbers[0]}日 · ${numbers[1]||'暂无'}步`:'该日暂无记录')});
}
if(page==='profile'){
 action($('1902:161787'),'返回首页',()=>go('home'));
 action($('1902:161784'),'运动首页',()=>go('home'));
}
setDevice(deviceBound);
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data.type==='qq-device')setDevice(e.data.bound)});
parent.postMessage({type:'qq-page',page},location.origin);
})();

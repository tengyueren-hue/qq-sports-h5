import {rarityBadge, rarityRules, rarityArt} from './fortune-rarity.js';
import {makePoster} from './fortune-poster.js';
import {fetchState, stepMessage} from './fortune-data.js';
const content=document.querySelector('#history-content');
const modal=document.querySelector('#makeup-dialog');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data, month, selected, ad, ticker, sequence=0, working=false, returnFocus;
const monthOf=d=>d.slice(0,7);
const dateName=d=>`${Number(d.slice(5,7))}月${Number(d.slice(8))}日`;
const recordFor=d=>data.records.find(r=>r.date===d);
function render(){
 const [year,m]=month.split('-').map(Number);
 const days=new Date(Date.UTC(year,m,0)).getUTCDate();
 const offset=(new Date(Date.UTC(year,m-1,1)).getUTCDay()+6)%7;
 const cells=Array.from({length:offset},()=>'<span aria-hidden="true"></span>');
 for(let n=1;n<=days;n++){
  const day=`${month}-${String(n).padStart(2,'0')}`,r=recordFor(day),future=day>data.date,today=day===data.date;
  const label=r?(r.makeup?'已补签':'已收签'):future?'未到':today?'可抽签':'可补签';
  cells.push(`<button class="calendar-cell ${r?'received':''} ${r?.makeup?'made-up':''} ${today?'is-today':''} ${day===selected?'is-selected':''}" data-rarity="${r?.fortune.rarity||''}" data-day="${day}" ${future?'disabled':''} aria-label="${dateName(day)}，${label}${r?'，'+esc(r.fortune.name):''}" aria-pressed="${day===selected}" ${today?'aria-current="date"':''}><strong>${n}</strong>${r?`<small class="calendar-sign-tag">${esc(r.fortune.name)}</small>`:`<small>${today?'今天':label}</small>`}</button>`);
 }
 const todaySign=recordFor(data.date)?.fortune;
 content.innerHTML=`<section class="fortune-home history-hero" data-rarity="${todaySign?.rarity||'teal'}" aria-label="今日好运与累计收签信息">
 <div class="fortune-home-copy"><span class="fortune-home-eyebrow">QQ运动 · 每日走运签</span>${todaySign?rarityBadge(todaySign):'<span class="hero-await">今日好运待开启</span>'}<h2>${todaySign?esc(todaySign.name):'今天走什么运？'}</h2><p>${todaySign?esc(todaySign.message):'每天一签，收下一份小欢喜。'}</p><button class="fortune-home-draw" data-hero-today>${todaySign?'打开今日签':'抽取今日走运签'} <span aria-hidden="true">↗</span></button></div>
 <div class="lucky-mascot" aria-hidden="true"><img src="./design/fortune-artwork-05-18-light/fortune-05-light.png" alt=""></div>
 <div class="history-stats"><div><strong>${data.records.length}</strong><span>累计收签天数</span></div><div><strong>${data.records.filter(r=>monthOf(r.date)===monthOf(data.date)).length}</strong><span>本月收签天数</span></div><div><strong>${data.records.filter(r=>r.makeup).length}</strong><span>累计补签天数</span></div></div></section>
 <section class="collection-summary"><strong>我的好运收藏 <span>${new Set(data.records.map(r=>r.fortune.id+':'+(r.fortune.rarity||'teal'))).size}/60</span></strong><div>${[['teal','好事签'],['purple','如意签'],['gold','上上签']].map(([tier,label])=>`<span data-rarity="${tier}">✦ ${label} ${new Set(data.records.filter(r=>(r.fortune.rarity||'teal')===tier).map(r=>r.fortune.id)).size}/20</span>`).join('')}</div>${rarityRules}</section><section class="fortune-calendar" aria-label="走运签日历"><div class="calendar-month-nav"><button data-month="-1" aria-label="上个月">‹</button><h2>${year}年${m}月</h2><button data-month="1" aria-label="下个月" ${month>=monthOf(data.date)?'disabled':''}>›</button></div><div class="calendar-weekdays" aria-hidden="true">${['一','二','三','四','五','六','日'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-days">${cells.join('')}</div><div class="calendar-legend"><span><i class="legend-received"></i>已收签</span><span><i class="legend-makeup"></i>已补签</span><span><i></i>漏签可补</span><button data-current-month>回到本月</button></div></section>`;
}

const format=n=>n==null?'—':n.toLocaleString('zh-CN');
let current, posterURL;
function showModal(){if(!modal.open)modal.showModal();modal.scrollTop=0;}
function showFortune(record){
 current=record;const f=record.fortune;
 modal.innerHTML='<header class="makeup-header"><h2 id="makeup-heading">'+(record.date===data.date?'今日走运签':'往日走运签')+'</h2></header>'+`<section data-rarity="${f.rarity||'teal'}" class="lucky-sheet">
 <div class="lucky-meta">${record.date.replaceAll('-','.')} · 每天一份好运</div><div class="fortune-slip-heading">${rarityArt(f)}<div class="fortune-slip-copy">${rarityBadge(f)}<h3>${esc(f.name)}</h3></div></div>
 <div class="lucky-guidance"><span><b>宜</b>${esc(f.suitable)}</span><span><b>忌</b>${esc(f.avoid)}</span></div>
 <p class="lucky-verse">${esc(f.message).replace('，','，<br>')}</p><div class="lucky-divider" aria-hidden="true"><span>✦</span></div>
 <dl class="lucky-numbers"><div><dt>幸运步数</dt><dd>${format(f.luckySteps)}<small>步</small></dd></div><div><dt>${record.date===data.date?'今日已走':'当天已走'}</dt><dd>${format(record.sports.steps)}<small>步</small></dd></div></dl>
 <p class="lucky-step-copy">${stepMessage(record.sports.steps,record.sports.goal)}</p><div class="lucky-actions"><button data-ad-close>收下好运</button><button data-share>分享给好友</button></div><p class="lucky-next">这一天的好运，已经为你留住</p><p data-share-status role="status"></p>
 ${rarityRules}<div class="lucky-ambient" aria-hidden="true"><img src="./design/fortune-artwork-05-18-light/fortune-05-light.png" alt=""></div></section>`;
 showModal();
}
function openDate(){
 returnFocus=content.querySelector(`[data-day="${selected}"]`);
 const record=recordFor(selected);if(record){showFortune(record);return;}
 const today=selected===data.date;
 modal.innerHTML=`<header class="makeup-header"><h2 id="makeup-heading">${dateName(selected)} · ${today?'今日走运签':'补一份好运'}</h2><button data-ad-close aria-label="关闭">×</button></header><div class="ad-body"><h3>${today?'今天的好运，等你来收':'把这一天的好运补回来'}</h3><p>${today?'每天免费一签，看看今天走什么运。':'完整观看一段广告，即可补收这一天的走运签。'}</p><button class="calendar-primary" ${today?'data-free-draw':'data-start-ad'}>${today?'免费抽今日签':'看广告补签'}</button><button class="ad-secondary" data-ad-close>下次再说</button>${today?'':'<small class="calendar-ad-note">广告体验演示 · 10秒 · 中途退出不补签</small>'}<p data-prompt-status role="status"></p></div>`;
 showModal();
}
async function freeDraw(){
 if(working)return;working=true;const attempt=++sequence,button=modal.querySelector('[data-free-draw]');button.disabled=true;button.textContent='好运正在向你走来…';
 try{await api('/api/fortune/draw',{});const latest=await fetchState('/api/fortune/history');if(attempt!==sequence||!modal.open)return;data=latest;selected=data.date;month=monthOf(selected);render();showFortune(recordFor(selected));}
 catch{if(attempt===sequence&&modal.open){button.disabled=false;button.textContent='免费抽今日签';modal.querySelector('[data-prompt-status]').textContent='暂时没有连接成功，请重试';}}
 finally{if(attempt===sequence)working=false;}
}
async function shareFortune(){
 const button=modal.querySelector('[data-share]');if(!button||button.disabled)return;button.disabled=true;const attempt=sequence,record=current;
 try{const blob=await makePoster(record,data.date);if(!modal.open||attempt!==sequence)return;if(posterURL)URL.revokeObjectURL(posterURL);posterURL=URL.createObjectURL(blob);
 modal.innerHTML=`<header class="makeup-header"><h2 id="makeup-heading">把好运分享给好友</h2><button data-result-back aria-label="返回签面">‹</button></header><div class="fortune-poster"><img src="${posterURL}" alt="${esc(record.fortune.name)}走运签"><a href="${posterURL}" download="QQ走运签-${record.date}.png">保存分享卡片</a><button data-native-share>打开系统分享</button><p data-share-status role="status">也可以长按保存图片，发送给QQ好友。</p></div>`;
 modal.querySelector('[data-native-share]').onclick=async()=>{const file=new File([blob],`QQ走运签-${record.date}.png`,{type:'image/png'});const status=modal.querySelector('[data-share-status]');if(!navigator.canShare?.({files:[file]})){status.textContent='请保存图片后发送给好友';return;}try{await navigator.share({files:[file],title:record.fortune.name});}catch(e){if(e.name!=='AbortError')status.textContent='请保存图片后发送给好友';}};
 modal.scrollTop=0;
 }catch{if(modal.open&&attempt===sequence){modal.querySelector('[data-share-status]').textContent='图片生成失败，请重试';button.disabled=false;}}
}

async function load(){
 try{data=await fetchState('/api/fortune/history');month??=monthOf(data.date);selected??=data.date;render();}
 catch{content.innerHTML='<section class="history-empty"><h2>日历暂时没有打开</h2><p>请稍后再试，收到的走运签仍会保留。</p><button id="retry-history">重新加载</button></section>';document.querySelector('#retry-history').onclick=load;}
}
async function api(path,body){
 return fetchState(path,body);
}
function header(){return '<header class="makeup-header"><h2 id="makeup-heading">广告体验演示</h2><button data-ad-close aria-label="退出广告">×</button></header>';}
function cancel(){
 ++sequence;clearInterval(ticker);working=false;
 if(ad&&!ad.completed){api('/api/demo/ad/cancel',{token:ad.token}).catch(()=>{});}
 ad=null;
}
async function startAd(){
 if(working||ad)return;working=true;const attempt=++sequence,target=selected;
 modal.innerHTML=header()+'<div class="ad-body"><h3>正在准备补签</h3><p>请稍等片刻…</p></div>';showModal();
 try{
  const result=await api('/api/demo/ad/start',{date:target});
  if(attempt!==sequence||!modal.open){if(result.ad)api('/api/demo/ad/cancel',{token:result.ad.token}).catch(()=>{});return;}
  data=result;
  if(!result.ad){working=false;render();showFortune(recordFor(target));return;}
  ad={...result.ad,watched:0,completed:false};working=false;
  modal.innerHTML=header()+`<div class="ad-body"><span class="ad-demo-badge">演示内容 · 非真实商业广告</span><div class="ad-scene" aria-hidden="true"><span>✦</span><strong>好 运<br>在 路 上</strong><small>QQ运动</small></div><h3>为${dateName(target)}补一份好运</h3><p id="ad-countdown" aria-live="polite">观看完成后即可补签</p><progress id="ad-progress" value="0" max="${ad.durationSeconds}" aria-label="广告观看进度"></progress><button class="calendar-primary" id="claim-makeup" disabled>观看中 · ${ad.durationSeconds}秒</button><p class="ad-exit-note">中途退出不会补签，切到后台会暂停。</p><p id="ad-feedback" role="status"></p></div>`;
  let last=performance.now();let shown=-1;
  ticker=setInterval(()=>{
   const now=performance.now(),delta=Math.min(now-last,500);last=now;
   if(!ad||document.hidden)return;
   ad.watched+=delta/1000;const remaining=Math.max(0,Math.ceil(ad.durationSeconds-ad.watched));
   document.querySelector('#ad-progress').value=Math.min(ad.watched,ad.durationSeconds);
   if(remaining!==shown){shown=remaining;document.querySelector('#claim-makeup').textContent=remaining?`观看中 · ${remaining}秒`:'领取补签';document.querySelector('#ad-countdown').textContent=remaining?`还需观看${remaining}秒`:'已完整观看，可以领取这一天的好运';}
   if(!remaining){clearInterval(ticker);document.querySelector('#claim-makeup').disabled=false;}
  },100);
 }catch(e){if(attempt===sequence&&modal.open){working=false;modal.innerHTML=header()+`<div class="ad-body"><h3>暂时没有准备好</h3><p>${esc(e.message)}</p><button class="calendar-primary" data-ad-retry>重新加载</button></div>`;}}
}
async function claim(){
 if(working||!ad)return;working=true;const session=ad,attempt=sequence;const button=document.querySelector('#claim-makeup');button.disabled=true;button.textContent='正在领取…';
 try{
  const result=await api('/api/demo/ad/complete',{token:session.token});
  if(attempt!==sequence){load();return;}
  session.completed=true;data=result;selected=result.completedDate;render();const r=recordFor(selected);
  showFortune(r);
 }catch(e){if(attempt===sequence&&modal.open){button.disabled=false;button.textContent='重新领取';document.querySelector('#ad-feedback').textContent=e.message;}}
 finally{working=false;}
}
content.addEventListener('click',e=>{
 if(e.target.closest('[data-hero-today]')){selected=data.date;month=monthOf(data.date);render();openDate();returnFocus=content.querySelector('[data-hero-today]');return;}
 const day=e.target.closest('[data-day]');if(day){selected=day.dataset.day;render();content.querySelector(`[data-day="${selected}"]`)?.focus({preventScroll:true});openDate();return;}
 const move=e.target.closest('[data-month]');if(move&&!move.disabled){const [y,m]=month.split('-').map(Number),d=new Date(Date.UTC(y,m-1+Number(move.dataset.month),1));month=`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;selected=month===monthOf(data.date)?data.date:month+'-01';render();return;}
 if(e.target.closest('[data-current-month]')){month=monthOf(data.date);selected=data.date;render();return;}
 if(e.target.closest('[data-makeup]'))startAd();
});
modal.addEventListener('click',e=>{if(e.target.closest('[data-ad-close]'))modal.close();if(e.target.closest('[data-start-ad]'))startAd();if(e.target.closest('[data-free-draw]'))freeDraw();if(e.target.closest('[data-share]'))shareFortune();if(e.target.closest('[data-result-back]'))showFortune(current);if(e.target.closest('[data-ad-retry]')){working=false;startAd();}if(e.target.closest('#claim-makeup'))claim();});
modal.addEventListener('close',()=>{cancel();if(posterURL){URL.revokeObjectURL(posterURL);posterURL=null;}const focus=returnFocus?.isConnected?returnFocus:content.querySelector(`[data-day="${selected}"]`);focus?.focus({preventScroll:true});});
addEventListener('pagehide',cancel);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!modal.open)load();});
load();

import {rarityBadge, rarityArt, tierOf} from './fortune-rarity.js';
import {makePoster} from './fortune-poster.js';
import {fetchState, stepMessage} from './fortune-data.js';

const showYuanbaoPromotion = new URLSearchParams(location.search).get('source') === 'ad-preview';
if (showYuanbaoPromotion) document.querySelector('.back-link').href = './ad-preview.html';
const modal = document.querySelector('#fortune-dialog');
const status = document.querySelector('#fortune-status');
const art = './design/fortune-artwork-05-18-light/fortune-05-light.png';
let state, current, view = 'closed', requestId = 0, noticeTimer, resetTimer;
let opener, posterURL, posterBlob, busy = false, drawing = false, refreshing;
const format = n => n == null ? '—' : n.toLocaleString('zh-CN');
const dateLabel = d => `${Number(d.slice(5, 7))}月${Number(d.slice(8))}日`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function notify(text) {
  (modal.open ? modal : document.body).append(status);
  status.textContent = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => status.textContent = '', 3000);
}
function open() {
  if (!modal.open) { opener = document.activeElement; modal.showModal(); }
  else modal.querySelector('.fortune-top button')?.focus({preventScroll: true});
}
function top(title, back = false) {
  return `<header class="fortune-top">${back ? '<button class="fortune-back" data-fortune="back" aria-label="返回签面">‹</button>' : ''}<h2 id="fortune-heading">${title}</h2><button class="fortune-history-button" data-fortune="history" aria-label="查看走运签历史统计"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="4"/><path d="M8 3v4m8-4v4M4 10h16M8 14h2m4 0h2m-8 3h2"/></svg></button></header>`;
}
function syncHome() {
  if (!state) return;
  const summary=document.querySelector('.summary');
  let signButton=summary.querySelector('.summary-fortune');
  if(!signButton){signButton=document.createElement('button');signButton.className='summary-fortune';signButton.dataset.fortune='draw';signButton.setAttribute('aria-label','查看今日走运签');summary.querySelector('.step-ring').append(signButton);}
  if(signButton.parentElement!==summary.querySelector('.step-ring'))summary.querySelector('.step-ring').append(signButton);
  const sign=state.fortune;
  if(sign){
    summary.dataset.rarity=sign.rarity||'teal';
    const key=sign.id+':'+(sign.rarity||'teal');
    if(signButton.dataset.sign!==key){signButton.innerHTML=rarityArt(sign)+`<span><strong>${escapeHTML(sign.name)}</strong><small>今日${tierOf(sign).name}</small></span>`;signButton.dataset.sign=key;}
    signButton.hidden=false;signButton.title=`${tierOf(sign).name} · ${sign.name}，点击查看`;signButton.setAttribute('aria-label',`查看今日走运签：${tierOf(sign).name}，${sign.name}`);
  }else{delete summary.dataset.rarity;signButton.hidden=true;delete signButton.dataset.sign;}

  document.querySelector('#fortune-home-title').textContent = state.fortune ? `今日已抽到「${state.fortune.name}」` : '每天一签，看看今日好运';
  document.querySelector('.fortune-home-draw').innerHTML = `${state.fortune ? '查看今日走运签' : '抽取今日走运签'} <span aria-hidden="true">↗</span>`;
  document.querySelector('.step-copy > strong').textContent = format(state.sports.steps);
  document.querySelector('#goal-number').textContent = state.sports.goal ?? '—';
  const score = document.querySelector('.rank-row.me .score');
  if (score) score.textContent = format(state.sports.steps);
  document.querySelector('.home-header h1').textContent = dateLabel(state.date);
  document.querySelectorAll('.calendar .day').forEach((button, i) => {
    const d = new Date(`${state.date}T12:00:00+08:00`);
    d.setUTCDate(d.getUTCDate() - 6 + i);
    const parts = new Intl.DateTimeFormat('zh-CN', {timeZone:'Asia/Shanghai',month:'numeric',day:'numeric'}).formatToParts(d);
    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    button.querySelector('.day-number').textContent = day;
    button.setAttribute('aria-label', `${month}月${day}日`);
  });
  const form = document.querySelector('#demo-sports-form');
  if (!form.contains(document.activeElement)) {
    form.elements.steps.value = state.sports.steps ?? '';
    form.elements.goal.value = state.sports.goal ?? '';
  }
}
function applyState(next) {
  state = next;
  syncHome();
  clearTimeout(resetTimer);
  // Use server clock offset; the user's device timezone does not determine reset.
  resetTimer = setTimeout(() => refresh(), Math.max(100, Date.parse(state.nextReset) - Date.parse(state.serverNow) + 100));
  if (current && current.date === state.date) current.sports = {...state.sports};
  if (modal.open && view === 'result') updateSteps();
}
async function refresh() {
  if (refreshing) return refreshing;
  refreshing = fetchState().then(applyState).catch(() => {
    if (modal.open && view === 'result') {
      // Keep the last received step value while a background refresh is unavailable.
    }
  }).finally(() => refreshing = null);
  return refreshing;
}
function updateSteps() {
  if (!current) return;
  const steps = modal.querySelector('[data-live-steps]');
  if (steps) steps.textContent = format(current.sports.steps);
  const copy = modal.querySelector('.lucky-step-copy');
  if (copy) copy.textContent = stepMessage(current.sports.steps, current.sports.goal);
  const reset = modal.querySelector('.lucky-reset');
  if (reset) reset.hidden = current.fromHistory || state.date === current.date;
}
function result(record, animate = false) {
  current = record;
  view = 'result';
  const f = record.fortune;
  modal.innerHTML = top(record.date === state?.date ? '今日走运签' : '往日走运签') + `<section data-rarity="${f.rarity||'teal'}" class="lucky-sheet ${animate ? 'fortune-reveal' : ''}">
    <div class="lucky-meta">${record.date.replaceAll('-', '.')} · 每天一份好运</div>
    <div class="fortune-slip-heading">${rarityArt(f)}<div class="fortune-slip-copy">${rarityBadge(f)}
    <h3>${escapeHTML(f.name)}</h3></div></div>
    <div class="lucky-guidance"><span><b>宜</b>${escapeHTML(f.suitable)}</span><span><b>忌</b>${escapeHTML(f.avoid)}</span></div>
    <p class="lucky-verse">${escapeHTML(f.message).replace('，', '，<br>')}</p>
    <div class="lucky-divider" aria-hidden="true"><span>✦</span></div>
    
    
    <div class="lucky-actions"><button data-fortune="accept">收下好运</button><button data-fortune="share">分享给好友</button></div>
    ${showYuanbaoPromotion ? '<a class="yuanbao-fortune-entry" href="https://yuanbao.tencent.com/" target="_blank" rel="noopener noreferrer"><span class="yuanbao-entry-symbol" aria-hidden="true">✦</span><span>去元宝测测我的今日运势</span><span aria-hidden="true">›</span></a>' : ''}
    
    <div class="lucky-reset" hidden>北京时间零点已过，可以抽今天的走运签。<br><button data-fortune="draw">抽取今日走运签</button></div>
    <div class="lucky-ambient" aria-hidden="true"><img src="${art}" alt=""></div>
  </section>`;
  {
    modal.querySelector('.lucky-sheet').classList.add('lucky-sheet-compact');
    modal.querySelectorAll('.lucky-numbers, .lucky-step-copy, .lucky-divider, .yuanbao-promotion-label, .lucky-next, .rarity-rules').forEach(element => element.remove());
  }
  open(); modal.scrollTop = 0; updateSteps();
}
function errorView() {
  view = 'error';
  modal.innerHTML = top('今天走什么运？') + `<section class="lucky-error"><h3>好运稍等一下</h3><p>暂时没能连接上服务。重试会先查询今日结果，不会重复抽取。</p><button data-fortune="draw">重新连接</button></section>`;
  open();
}
async function draw() {
  if (drawing) return;
  drawing = true;
  const id = ++requestId;
  view = 'drawing';
  modal.innerHTML = top('今天走什么运？') + (state?.fortune ? '<section class="lucky-error"><h3>正在打开今日好运</h3><p>今天的签，已经为你留好了</p></section>' : `<section class="fortune-drawing" aria-live="polite"><div class="drawing-card"><span>✦</span><strong>运</strong><small>今天走什么运</small></div><h3>今日好运，正在向你走来</h3><p>每天免费一签，无需运动达标</p></section>`);
  open();
  try {
    // Establish/read the anonymous identity before issuing the first mutation.
    const latest = await fetchState();
    applyState(latest);
    let answer = latest;
    if (!latest.fortune) {
      const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1350;
      [answer] = await Promise.all([fetchState('/api/fortune/draw', {}), new Promise(r => setTimeout(r, delay))]);
      applyState(answer);
    }
    if (id !== requestId || !modal.open) return;
    result({date: answer.date, fortune: answer.fortune, sports:{...answer.sports}}, !latest.fortune);
  } catch {
    if (id === requestId && modal.open) errorView();
  } finally { if (id === requestId) drawing = false; }
}
function posterPreview(blob) {
  posterBlob=blob;
  if(posterURL)URL.revokeObjectURL(posterURL);
  posterURL=URL.createObjectURL(blob);view='poster';
  modal.innerHTML=top('把这份好运，送给你',true)+`<div class="fortune-poster"><img src="${posterURL}" alt="${escapeHTML(current.fortune.name)}走运签分享卡片"><a href="${posterURL}" download="QQ走运签-${current.date}.png">保存签卡</a><button data-fortune="system-share">分享好友</button><p>长按签卡也可以保存，把好运送给惦记的人。</p></div>`;
  open();modal.scrollTop=0;
}
async function share() {
  if(busy||!current)return;
  busy=true;const record={...current,sports:{...current.sports}};const id=requestId;
  const button=modal.querySelector('[data-fortune=share]');button.disabled=true;button.textContent='正在生成…';
  try {
    const blob=await makePoster(record, state?.date);
    if(!modal.open||id!==requestId||view!=='result')return;
    posterPreview(blob);
    // Preparation is separate so the share sheet is opened by a fresh user gesture.
  } catch {notify('分享图片生成失败，请重试');}
  finally{busy=false;button.disabled=false;button.textContent='分享给好友';}
}
async function systemShare() {
  if(!posterBlob)return;
  const file=new File([posterBlob],`QQ走运签-${current.date}.png`,{type:'image/png'});
  if(!navigator.share||!navigator.canShare?.({files:[file]})){notify('此浏览器不支持系统分享，请保存图片后发给好友');return;}
  try{await navigator.share({files:[file],title:current.fortune.name});}
  catch(e){if(e.name!=='AbortError')notify('暂时无法打开分享，请保存图片后发给好友');}
}
async function setSports(steps,goal) {
  const feedback=document.querySelector('#demo-feedback');
  try{applyState(await fetchState('/api/demo/sports',{steps,goal}));feedback.textContent='演示步数已更新，签面会同步显示';}
  catch{feedback.textContent='更新失败，请重试';}
}
document.addEventListener('click',e=>{
  const button=e.target.closest('[data-fortune]');
  if(button){switch(button.dataset.fortune){
    case'draw':draw();break;
    case'history':++requestId;drawing=false;location.assign('./fortune-history.html'+(showYuanbaoPromotion?'?source=ad-preview':''));break;
    case'close':case'accept':modal.close();break;
    case'back':if(current)result(current);break;
    case'share':share();break;
    case'system-share':systemShare();break;
  }}
  const demo=e.target.closest('[data-demo]');
  if(demo){const presets={zero:[0,5000],below:[2800,5000],met:[5000,5000],over:[7111,5000],'no-goal':[7111,null],unavailable:[null,5000]};setSports(...presets[demo.dataset.demo]);}
});
document.querySelector('#demo-sports-form').addEventListener('submit',e=>{
  e.preventDefault();const f=e.currentTarget;
  if(!f.reportValidity())return;
  setSports(f.elements.steps.value===''?null:Number(f.elements.steps.value),f.elements.goal.value===''?null:Number(f.elements.goal.value));
});
modal.addEventListener('close',()=>{++requestId;drawing=false;view='closed';syncHome();if(opener?.isConnected&&opener!==document.body)opener.focus();else document.querySelector('.back-link').focus();});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
addEventListener('sports:updated',e=>applyState(e.detail));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
setInterval(()=>{if(!document.hidden&&!drawing)refresh();},10000);
await refresh();
const params=new URLSearchParams(location.search);
const historyDate=params.get('fortuneDate');
if(historyDate){
  params.delete('fortuneDate');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);
  try{const data=await fetchState('/api/fortune/history');applyState(data);const record=data.records.find(r=>r.date===historyDate);if(record)result({...record,fromHistory:true});else notify('这一天还没有走运签记录');}catch{errorView();}
}else if(params.get('fortune')==='draw'||(params.get('fortune')==='view'&&state?.fortune)){
  params.delete('fortune');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);draw();
}

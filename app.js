import {fetchState} from './fortune-data.js';
const dialog=document.querySelector('#detail-dialog');
const entry = document.querySelector('.draw-entry');
let syncing, refreshTimer;
function sync() {
  if (syncing) return syncing;
  syncing = fetchState().then(state => {
    const drawn = Boolean(state.fortune);
    entry.textContent = drawn ? `今日运势：${state.fortune.name}` : '抽取今日走运签 ↗';
    entry.classList.toggle('has-fortune', drawn);
    entry.setAttribute('aria-label', drawn ? `今日运势：${state.fortune.name}，打开签面` : '抽取今日走运签');
    document.querySelector('.today-statistics .number').textContent = state.sports.steps ?? '—';
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(sync, Math.max(100, Date.parse(state.nextReset) - Date.parse(state.serverNow) + 100));
  }).catch(() => {
    // Keep the last known result if a background refresh temporarily fails.
  }).finally(() => syncing = null);
  return syncing;
}
sync();
addEventListener('pageshow', sync);
addEventListener('focus', sync);
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
if(['today','history','draw','rank'].includes(a)){location.assign('./home.html'+(a==='draw'?'?fortune=draw':a==='rank'?'#friend-ranking':'?from='+a));return}
if(a==='back'&&history.length>1){history.back();return}
const info={analysis:['今日运动','今天记录了跑步30分钟。运动数据为设计演示数据，AI分析服务尚未接入。'],donate:['捐步做公益','今日7111步，已达到6000步门槛。真实捐步需接入QQ公益服务。'],menu:['QQ运动','进入运动首页，查看今日步数与运动签。'],back:['QQ运动','当前已在运动插件页。']};const t=info[a]||['QQ运动','该服务暂未接入。'];document.querySelector('#detail-title').textContent=t[0];document.querySelector('#detail-copy').textContent=t[1];document.querySelector('#detail-menu').hidden=a!=='menu';dialog.showModal()});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});

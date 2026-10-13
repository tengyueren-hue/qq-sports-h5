import {fetchState} from './fortune-data.js';
const dialog=document.querySelector('#detail-dialog');
const entry = document.querySelector('.draw-entry');
let syncing, refreshTimer, previewDate;
// This preview starts pending without modifying saved fortunes.
const previewKey = 'qq-ad-preview-claim-v1';
let previewClaimed = null;
try { previewClaimed = sessionStorage.getItem(previewKey); } catch {}
function sync() {
  if (syncing) return syncing;
  syncing = fetchState().then(state => {
    previewDate = state.date;
    const drawn = Boolean(state.fortune) && previewClaimed === state.date;
    entry.textContent = drawn ? ` ${state.fortune.name} ›` : '查看我的走运签';
    entry.classList.toggle('has-fortune', drawn);
    entry.setAttribute('aria-label', drawn ? `今日运势：${state.fortune.name}，打开签面` : '查看我的走运签');
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
if(['today','history','draw','rank'].includes(a)){const target=new URL('./home.html',location.href);target.searchParams.set('source','ad-preview');if(a==='draw'){previewClaimed=previewDate;try{sessionStorage.setItem(previewKey,previewDate||'');}catch{}target.searchParams.set('fortune','draw');}else if(a==='rank')target.hash='friend-ranking';else target.searchParams.set('from',a);location.assign(target.href);return}
if(a==='back'&&history.length>1){history.back();return}
const info={'game-landlord':['腾讯斗地主','这是小游戏广告位的交互演示，尚未接入真实游戏。正式接入后，点击此处进入腾讯斗地主。'],'game-egg':['大掼蛋','这是小游戏广告位的交互演示，尚未接入真实游戏。正式接入后，点击此处进入大掼蛋。'],analysis:['今日运动','今天记录了跑步30分钟。运动数据为设计演示数据，AI分析服务尚未接入。'],donate:['捐步做公益','今日7111步，已达到6000步门槛。真实捐步需接入QQ公益服务。'],menu:['QQ运动','进入运动首页，查看今日步数与运动签。'],back:['QQ运动','当前已在运动插件页。']};const t=info[a]||['QQ运动','该服务暂未接入。'];document.querySelector('#detail-title').textContent=t[0];document.querySelector('#detail-copy').textContent=t[1];document.querySelector('#detail-menu').hidden=a!=='menu';dialog.showModal()});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});

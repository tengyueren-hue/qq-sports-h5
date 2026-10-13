(() => {
const root=document.querySelector('.screen');
const params=new URLSearchParams(location.search);
const find=(scope,id)=>scope.querySelector(`[data-figma-id="${id}"]`);
let state={redDay:true,device:true,allGoals:false};
try{Object.assign(state,JSON.parse(sessionStorage.getItem('weekly-demo-state')||'{}'))}catch{}
const saveState=()=>sessionStorage.setItem('weekly-demo-state',JSON.stringify(state));
function reportState(scope){
 const report=scope.querySelector('.weekly-report');if(!report)return;
 const persistence=find(report,'2606:58457'),sports=find(report,'2606:58459'),closing=find(report,'2606:58866')?.parentElement;
 const lower=find(report,'2606:58945'),line=find(report,'2606:58944');
 [lower,line].forEach(e=>{if(e)e.style.display=state.allGoals?'none':''});
 if(persistence){persistence.style.height=state.allGoals?'266px':'346px';const stats=find(report,'2606:58933')?.parentElement;if(stats)stats.style.height=state.allGoals?'72px':'152px'}
 if(sports){sports.style.display=state.device?'':'none';sports.style.top=(1692-(state.allGoals?80:0))+'px'}
 if(closing)closing.style.top=(2656-(state.device?0:964)-(state.allGoals?80:0))+'px';
 report.style.height=(3057-(state.device?0:964)-(state.allGoals?80:0))+'px';
 for(const id of ['2606:58399','2606:58942']){const e=find(report,id);if(e){if(!e.dataset.originalText)e.dataset.originalText=e.textContent;e.textContent=state.allGoals?'7':e.dataset.originalText}}
 const missed=report.querySelectorAll('.weekly-day')[3];if(missed){let tick=missed.querySelector('.state-goal-tick');if(state.allGoals&&!tick){tick=document.createElement('img');tick.className='state-goal-tick';tick.src='assets/weekly-tick.png';tick.alt='达标';tick.style.cssText='position:absolute;left:22.84px;top:1.76px;width:10.54px;height:10.54px';missed.append(tick)}if(tick)tick.hidden=!state.allGoals}
}
function pluginState(){
 if(root?.dataset.page!=='plugin')return;
 root.querySelector('.weekly-message')?.remove();root.querySelector('.weekly-state-row')?.remove();
 const timeline=root.querySelector('.timeline'),reminders=find(root,'1172:23319');
 if(!state.redDay){const wrap=document.createElement('div');wrap.className='weekly-message';wrap.append(fragment('plugin-fragment'));timeline.insertBefore(wrap,timeline.lastElementChild);action(find(wrap,'2606:56385'),'查看上周运动周报',()=>location.href='home.html?report=open')}
 const row=fragment('plugin-inline-fragment').firstElementChild;row.classList.add('weekly-state-row');
 if(state.redDay)action(row,'查看上周运动周报',()=>location.href='home.html?report=open');
 else{find(row,'2606:57329').textContent='快给好友点赞个赞吧';find(row,'2606:57395').textContent='去点赞';const icon=find(row,'2606:57809').querySelector('img');icon.src='assets/friend-like-sun.png';icon.alt='笑脸太阳';action(row,'给好友点赞',()=>location.href='home.html?friends=1')}
 if(state.redDay)reminders.prepend(row);else reminders.append(row);find(root,'1172:23469')?.remove();
 document.fonts.ready.then(()=>requestAnimationFrame(()=>{timeline.scrollTop=timeline.scrollHeight}));
}
function applyState(){saveState();root?.classList.toggle('device-off',!state.device);pluginState();reportState(document);}
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data.type!=='weekly-state')return;for(const k of ['redDay','device','allGoals'])if(typeof e.data.state?.[k]==='boolean')state[k]=e.data.state[k];applyState()});
function toast(text){document.querySelector('.toast')?.remove();let el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),3000)}
function action(el,label,fn){if(!el)return;el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',label);el.onclick=fn;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn(e)}}}
function fragment(id){return document.querySelector('#'+id)?.content.cloneNode(true)}
let activeSheet=null,shareLayer=null,previousFocus=null;
function closeShare(){shareLayer?.remove();shareLayer=null;document.querySelector('[aria-label="分享本周运动报告"]')?.focus({preventScroll:true})}
function wireShare(scope){action(find(scope,'45:8330'),'关闭分享',()=>shareLayer?closeShare():history.back());scope.querySelectorAll('[data-name="items"]').forEach(el=>action(el,el.textContent.trim(),()=>{const channel=el.textContent.trim();if(channel==='复制链接'){navigator.clipboard?.writeText(location.href.split('?')[0].replace(/(home|plugin|share)\.html$/,'report.html')+'?recipient=1').then(()=>toast('已复制本地演示链接')).catch(()=>toast('当前浏览器不支持复制'));}else toast(`${channel}：演示原生分享入口，正式版调用QQ分享能力`)}))}
function showShare(){if(shareLayer)return;const content=fragment('share-fragment');if(!content){location.href='share.html';return}shareLayer=document.createElement('div');shareLayer.className='share-overlay';shareLayer.setAttribute('role','dialog');shareLayer.setAttribute('aria-modal','true');shareLayer.setAttribute('aria-label','分享运动周报');shareLayer.append(content);document.body.append(shareLayer);wireShare(shareLayer);shareLayer.querySelector('[role=button]')?.focus()}
function wireReport(scope){reportState(scope);action(find(scope,'2606:58351'),'关闭周报',()=>activeSheet?closeReport():location.href='home.html');action(find(scope,'2606:58994'),'分享本周运动报告',showShare);action(find(scope,'2606:58875'),'分享本周运动报告',showShare);action(find(scope,'2606:58954'),'去充能',()=>toast('前往现有充能流程；演示不扣除能量'));}
function closeReport(){if(!activeSheet)return;activeSheet.remove();activeSheet=null;document.body.style.overflow='';previousFocus?.focus()}
function openReport(){if(activeSheet)return;previousFocus=document.activeElement;const content=fragment('report-fragment');if(!content)return;activeSheet=document.createElement('div');activeSheet.className='weekly-overlay';activeSheet.innerHTML='<section class="weekly-sheet" role="dialog" aria-modal="true" aria-label="运动周报"><button class="sheet-handle" aria-label="展开周报"></button><div class="sheet-scroll"></div></section>';const layer=activeSheet,sheet=layer.firstElementChild,scroll=sheet.querySelector('.sheet-scroll'),handle=sheet.querySelector('.sheet-handle');scroll.append(content);document.body.append(layer);document.body.style.overflow='hidden';wireReport(layer);let height=.74,start=null;function setHeight(v){height=Math.max(.35,Math.min(1,v));sheet.style.height=`${height*100}dvh`;sheet.classList.toggle('expanded',height>=.999);handle.setAttribute('aria-label',height>=.999?'收起周报':'展开周报')};handle.onclick=()=>setHeight(height>=.999?.74:1);layer.onclick=e=>{if(e.target===layer)closeReport()};sheet.addEventListener('pointerdown',e=>{if(e.target.closest('[role=button]')||e.target.closest('button')!==handle&&e.target.closest('button'))return;if(height>=.999&&!handle.contains(e.target))return;start={y:e.clientY,h:height,id:e.pointerId,dragged:false};sheet.classList.add('dragging')});sheet.addEventListener('pointermove',e=>{if(!start)return;const dy=start.y-e.clientY;if(Math.abs(dy)>5){start.dragged=true;sheet.setPointerCapture(e.pointerId);setHeight(start.h+dy/innerHeight)}});function finish(e){if(!start)return;const was=start;start=null;sheet.classList.remove('dragging');if(sheet.hasPointerCapture(e.pointerId))sheet.releasePointerCapture(e.pointerId);if(was.dragged){if(height<.55)closeReport();else setHeight(height>=.84?1:.74)}}sheet.addEventListener('pointerup',finish);sheet.addEventListener('pointercancel',finish);scroll.addEventListener('wheel',e=>{if(height<1&&e.deltaY>0){e.preventDefault();setHeight(height+e.deltaY/innerHeight)}},{passive:false});handle.focus();sessionStorage.setItem('weekly-read','1');document.querySelector('.weekly-mini-entry')?.classList.remove('unread');}
pluginState();root?.classList.toggle('device-off',!state.device);
if(root?.dataset.page==='home'){
 // No top-of-feed report promotion. Keep the right-side report access and plugin deep-link.
 if(params.get('report')==='open')openReport();
 if(params.get('friends')==='1')document.fonts.ready.then(()=>find(root,'2602:9646')?.scrollIntoView({block:'start'}));
}
wireReport(document.querySelector('.standalone-report')||document.createElement('div'));if(!root&&document.querySelector('.share-design'))wireShare(document);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(shareLayer)closeShare();else closeReport()}if(e.key==='Tab'&&(shareLayer||activeSheet)){const scope=shareLayer||activeSheet,els=[...scope.querySelectorAll('button,[tabindex="0"]')].filter(el=>el.getClientRects().length);if(!els.length)return;if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0].focus()}}});
})();

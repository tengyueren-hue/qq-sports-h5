import {tierOf} from './fortune-rarity.js';
import {stepMessage} from './fortune-data.js';
const format=n=>n==null?'—':n.toLocaleString('zh-CN');
function wrap(ctx, text, x, y, max, line) {
  let row = '';
  for (const char of text) {
    if (char === '\n') {ctx.fillText(row,x,y);row='';y+=line;continue;}
    if (ctx.measureText(row + char).width > max && row) { ctx.fillText(row, x, y); row = char; y += line; }
    else row += char;
  }
  if (row) ctx.fillText(row, x, y);
}
function round(ctx,x,y,w,h,r,color) { ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill(); }
export async function makePoster(record, today) {
  await document.fonts.ready;
  const f = record.fortune; const tier=tierOf(f);
  const canvas = document.createElement('canvas');canvas.width=1080;canvas.height=1400;
  const c=canvas.getContext('2d');if(!c)throw new Error('canvas');
  c.fillStyle=tier.paper;c.fillRect(0,0,1080,1400);
  const glow=c.createRadialGradient(1000,100,0,1000,100,750);glow.addColorStop(0,'#e5f3f9');glow.addColorStop(1,'#fffdf700');c.fillStyle=glow;c.fillRect(0,0,1080,1400);
  c.fillStyle='rgba(0,0,0,.9)';c.font='500 30px "PingFang SC",sans-serif';c.fillText('QQ运动 · 今日走运签',64,80);
  c.fillStyle='rgba(60,60,67,.56)';c.textAlign='right';c.font='26px "PingFang SC",sans-serif';c.fillText(record.date,1016,80);
  c.textAlign='center';c.fillStyle=tier.ink;c.font='26px sans-serif';c.fillText('✦ '+tier.name+' · '+tier.label,540,132);
  round(c,380,160,320,64,32,tier.tint);c.textAlign='center';c.fillStyle='rgba(0,0,0,.9)';c.font='30px "PingFang SC",sans-serif';c.fillText('✦  '+f.tag+'  ✦',540,203);
  c.font='600 130px "Kaiti SC","STKaiti","PingFang SC",serif';c.fillText(f.name,540,407);
  c.font='34px "PingFang SC",sans-serif';c.fillText('宜  '+f.suitable+'     ·     忌  '+f.avoid,540,506);
  c.font='40px "PingFang SC",sans-serif';wrap(c,f.message.replace('，','，\n'),540,625,840,72);
  c.strokeStyle='#dcd9c6';c.beginPath();c.moveTo(450,823);c.lineTo(630,823);c.stroke();
  round(c,64,868,952,190,30,'#ffffff');c.fillStyle='rgba(60,60,67,.56)';c.font='27px "PingFang SC",sans-serif';c.fillText('幸运步数',300,922);c.fillText(record.date === today ? '今日已走' : '当天已走',780,922);
  c.fillStyle='rgba(0,0,0,.9)';c.font='500 58px "PingFang SC",sans-serif';c.fillText(format(f.luckySteps)+' 步',300,1004);c.fillText(format(record.sports.steps)+' 步',780,1004);
  c.fillStyle='rgba(60,60,67,.56)';c.font='29px "PingFang SC",sans-serif';wrap(c,stepMessage(record.sports.steps,record.sports.goal),540,1120,880,45);
  c.font='22px "PingFang SC",sans-serif';c.fillText('今天走什么运？每天一签，看看今日好运',540,1340);
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('export')),'image/png'));
}

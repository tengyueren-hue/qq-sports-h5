import {tierOf, tiers} from './fortune-rarity.js';
function wrap(c,text,x,y,max,line){let row='';for(const char of text){if(char==='\n'){c.fillText(row,x,y);row='';y+=line;continue;}if(c.measureText(row+char).width>max&&row){c.fillText(row,x,y);row=char;y+=line;}else row+=char;}if(row)c.fillText(row,x,y);}
export async function makePoster(record){
 await document.fonts.ready;
 const f=record.fortune,t=tierOf(f),key=tiers[f.rarity]?f.rarity:'teal';
 const art=new Image();art.src=new URL(`./assets/fortune-slips/${key}-v2.png`,import.meta.url).href;await art.decode();
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1500;const c=canvas.getContext('2d');if(!c)throw Error('canvas');
 c.fillStyle='#fffdf7';c.fillRect(0,0,1080,1500);
 const glow=c.createRadialGradient(540,460,20,540,460,800);glow.addColorStop(0,t.tint);glow.addColorStop(1,'#fffdf7');c.fillStyle=glow;c.fillRect(0,0,1080,1500);
 c.strokeStyle=t.ink;c.globalAlpha=.22;c.lineWidth=2;c.beginPath();c.roundRect(32,32,1016,1436,28);c.stroke();c.globalAlpha=1;
 c.textAlign='left';c.fillStyle=t.ink;c.font='500 28px "PingFang SC",sans-serif';c.fillText('QQ运动  /  每日走运签',76,104);
 c.textAlign='right';c.fillStyle='#777970';c.font='24px "PingFang SC",sans-serif';c.fillText(record.date.replaceAll('-','.'),1004,104);
 // Existing collectible artwork is laid out as an intact image on the share card.
 c.save();c.globalCompositeOperation='multiply';c.drawImage(art,360,158,360,540);c.restore();
 c.textAlign='center';c.fillStyle=t.ink;c.font='26px "PingFang SC",sans-serif';c.fillText(`✦  ${t.name} · ${t.label}  ✦`,540,750);
 c.fillStyle='#272c28';c.font='600 104px "Kaiti SC","STKaiti",serif';c.fillText(f.name,540,900,880);
 c.fillStyle='#555c54';c.font='34px "PingFang SC",sans-serif';wrap(c,f.message.replace('，','，\n'),540,1004,820,60);
 c.strokeStyle=t.ink;c.globalAlpha=.25;c.beginPath();c.moveTo(420,1180);c.lineTo(660,1180);c.stroke();c.globalAlpha=1;
 c.fillStyle=t.ink;c.font='28px "PingFang SC",sans-serif';c.fillText('把这份好运，也送给你',540,1260);
 c.fillStyle='#90928a';c.font='22px "PingFang SC",sans-serif';c.fillText('每天走一走，好运慢慢有',540,1388);
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('export')),'image/png'));
}

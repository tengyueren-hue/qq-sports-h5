export const tiers={teal:{name:'好事签',label:'日常好运',paper:'#f1faf7',ink:'#39796e',tint:'#dcefe9'},purple:{name:'如意签',label:'珍藏好运',paper:'#f7f2fc',ink:'#80609c',tint:'#eee0fa'},gold:{name:'上上签',label:'稀有好运',paper:'#fffae9',ink:'#977020',tint:'#ffe8a1'}};
export const tierOf=f=>tiers[f?.rarity]||tiers.teal;
export function rarityBadge(f){const t=tierOf(f);return `<div class="rarity-badge"><span aria-hidden="true">✦</span> ${t.name} · ${t.label}</div>`;}

export function rarityArt(f){const key=tiers[f?.rarity]?f.rarity:"teal";return `<img class="fortune-slip-art" src="./assets/fortune-slips/${key}-v2.png" alt="${tierOf(f).name}实体签牌" width="1024" height="1536">`;}

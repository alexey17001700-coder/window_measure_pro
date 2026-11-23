/* ============================================================
   БАЛКОННЫЙ БЛОК — визуализация (модуль для «Замер PRO»)
   Дверь + глухое окно, прилегающее к ней сбоку сверху.
   Все размеры — в МИЛЛИМЕТРАХ.
   Открывается кнопкой 🚪 (слева внизу) или openBalcony().
   ============================================================ */
(function(){
'use strict';

/* ---------- СТИЛИ ---------- */
const CSS = `
.blc-ovl{position:fixed;inset:0;z-index:95;background:rgba(4,7,13,.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto}
.blc-ovl.on{display:flex;animation:blcFade .2s}
@keyframes blcFade{from{opacity:0}to{opacity:1}}
.blc{width:100%;max-width:440px;background:linear-gradient(180deg,#141c2c,#0d1320);border:1px solid rgba(232,195,122,.3);border-radius:24px;padding:18px;box-shadow:0 26px 70px rgba(0,0,0,.7);animation:blcPop .3s cubic-bezier(.2,.9,.3,1.2);margin:auto}
@keyframes blcPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
.blc-h{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.blc-h .i{font-size:26px}
.blc-h h3{margin:0;font-size:18px;font-weight:800;flex:1;color:#eef3fb}
.blc-x{background:none;border:none;color:#8b98ad;font-size:22px;cursor:pointer;padding:0 4px}
.blc-box{background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:8px;margin-bottom:12px}
.blc-box svg{display:block;width:100%;height:auto;max-height:320px}
.blc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.blc-f{display:flex;flex-direction:column;gap:4px;background:rgba(255,255,255,.075);border:1.5px solid rgba(255,255,255,.10);border-radius:14px;padding:10px 12px;transition:.2s}
.blc-f span{font-size:11.5px;color:#8b98ad;font-weight:700}
.blc-f input{background:transparent;border:none;outline:none;color:#bff0ff;font-family:inherit;font-size:22px;font-weight:800;width:100%;padding:0;min-width:0}
.blc-f input::-webkit-outer-spin-button,.blc-f input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.blc-f input[type=number]{-moz-appearance:textfield;appearance:textfield}
.blc-f i{font-size:11px;color:#8b98ad;font-style:normal;font-weight:700}
.blc-f:focus-within{border-color:#e8c37a;box-shadow:0 0 18px rgba(232,195,122,.18)}
.blc-side{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.blc-side button{padding:12px;border-radius:14px;border:1.5px solid rgba(255,255,255,.10);background:rgba(255,255,255,.075);color:#eef3fb;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}
.blc-side button.sel{border-color:#e8c37a;background:linear-gradient(135deg,rgba(232,195,122,.16),rgba(127,216,255,.07));box-shadow:0 0 22px rgba(232,195,122,.18)}
.blc-info{margin-top:12px;font-size:12px;color:#8b98ad;background:rgba(127,216,255,.07);border:1px solid rgba(127,216,255,.22);padding:10px 12px;border-radius:12px;line-height:1.65}
.blc-info b{color:#bff0ff}
.blc-btns{display:grid;gap:10px;margin-top:14px}
.blc-btn{width:100%;padding:15px;border-radius:16px;border:none;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;transition:.2s}
.blc-btn:active{transform:scale(.975)}
.blc-gold{background:linear-gradient(135deg,#e8c37a,#f6e3b4);color:#1a1206;box-shadow:0 10px 28px rgba(232,195,122,.3)}
.blc-ghost{background:rgba(255,255,255,.075);border:1.5px solid rgba(255,255,255,.10);color:#eef3fb}
.blc-row{display:flex;gap:10px}
.blc-row .blc-btn{flex:1}
@media(max-width:380px){.blc-grid{grid-template-columns:1fr}}
`;

function injectCSS(){
  if(document.getElementById('blc-css')) return;
  const s = document.createElement('style');
  s.id = 'blc-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ---------- СОСТОЯНИЕ ---------- */
const S = { doorW:'600', doorH:'2100', topW:'600', topH:'500', side:'Справа' };

function load(){
  try{
    const raw = localStorage.getItem('wm_balc');
    if(raw) Object.assign(S, JSON.parse(raw));
  }catch(e){}
  // Если в основном замере уже есть размеры блока — берём их
  const D = window.D;
  if(D){
    if(D.balcDoorW) S.doorW = String(D.balcDoorW);
    if(D.balcDoorH) S.doorH = String(D.balcDoorH);
    if(D.balcTopW)  S.topW  = String(D.balcTopW);
    if(D.balcTopH)  S.topH  = String(D.balcTopH);
    if(D.balcSide)  S.side  = D.balcSide;
  }
}
function save(){ try{ localStorage.setItem('wm_balc', JSON.stringify(S)); }catch(e){} }

const num = (v,d)=>{ const n=parseFloat(v); return (isNaN(n)||n<=0) ? d : n; };
const mm  = v => Math.round(num(v,0));

/* ---------- СХЕМА (SVG) ---------- */
function svg(){
  const dW=num(S.doorW,600), dH=num(S.doorH,2100), tW=num(S.topW,600), tH=num(S.topH,500);
  const left = S.side==='Слева';
  const totalW=dW+tW, totalH=dH;
  const base=Math.max(totalW,totalH);
  const pad=base*0.17, fs=base*0.036, sw=base*0.0045, tick=fs*0.55;
  const vw=totalW+pad*2, vh=totalH+pad*2;
  const x0=pad, y0=pad;
  const dx=left?x0+tW:x0, tx=left?x0:x0+dW;
  const G='#e8c37a', I='#7fd8ff', LN='rgba(232,195,122,.6)';
  const ins=Math.min(dW,dH)*0.055, ins2=Math.min(tW,tH)*0.09;
  const hDim=(x1,x2,y,t)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${LN}" stroke-width="${sw}"/><line x1="${x1}" y1="${y-tick}" x2="${x1}" y2="${y+tick}" stroke="${LN}" stroke-width="${sw}"/><line x1="${x2}" y1="${y-tick}" x2="${x2}" y2="${y+tick}" stroke="${LN}" stroke-width="${sw}"/><text x="${(x1+x2)/2}" y="${y+fs*1.3}" fill="${I}" font-size="${fs}" font-weight="700" text-anchor="middle" font-family="Manrope,sans-serif">${t}</text>`;
  const vDim=(y1,y2,x,t)=>`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${LN}" stroke-width="${sw}"/><line x1="${x-tick}" y1="${y1}" x2="${x+tick}" y2="${y1}" stroke="${LN}" stroke-width="${sw}"/><line x1="${x-tick}" y1="${y2}" x2="${x+tick}" y2="${y2}" stroke="${LN}" stroke-width="${sw}"/><text x="${x-fs*0.5}" y="${(y1+y2)/2}" fill="${I}" font-size="${fs}" font-weight="700" text-anchor="middle" font-family="Manrope,sans-serif" transform="rotate(-90 ${x-fs*0.5} ${(y1+y2)/2})">${t}</text>`;
  const hx = left ? dx+dW-dW*0.16 : dx+dW*0.16;
  return `<svg viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    <rect x="${dx}" y="${y0}" width="${dW}" height="${dH}" rx="${sw*2}" fill="rgba(127,216,255,.05)" stroke="${G}" stroke-width="${sw*1.7}"/>
    <rect x="${dx+ins}" y="${y0+ins}" width="${dW-ins*2}" height="${dH-ins*2}" rx="${sw*2}" fill="rgba(127,216,255,.06)" stroke="rgba(232,195,122,.45)" stroke-width="${sw}"/>
    <rect x="${dx+ins}" y="${y0+ins}" width="${dW-ins*2}" height="${(dH-ins*2)*0.42}" fill="rgba(127,216,255,.18)" stroke="rgba(127,216,255,.4)" stroke-width="${sw}"/>
    <rect x="${hx}" y="${y0+dH*0.42}" width="${dW*0.055}" height="${dH*0.09}" rx="${sw*2}" fill="${G}"/>
    <text x="${dx+dW/2}" y="${y0+dH*0.86}" fill="rgba(238,243,251,.8)" font-size="${fs*0.85}" font-weight="700" text-anchor="middle" font-family="Manrope,sans-serif">ДВЕРЬ</text>
    <rect x="${tx}" y="${y0}" width="${tW}" height="${tH}" rx="${sw*2}" fill="rgba(127,216,255,.05)" stroke="${G}" stroke-width="${sw*1.7}"/>
    <rect x="${tx+ins2}" y="${y0+ins2}" width="${tW-ins2*2}" height="${tH-ins2*2}" fill="rgba(127,216,255,.22)" stroke="rgba(127,216,255,.45)" stroke-width="${sw}"/>
    <text x="${tx+tW/2}" y="${y0+tH/2+fs*0.35}" fill="rgba(238,243,251,.85)" font-size="${fs*0.8}" font-weight="700" text-anchor="middle" font-family="Manrope,sans-serif">ГЛУХОЕ</text>
    ${hDim(x0, x0+totalW, y0-pad*0.5, 'Блок '+Math.round(totalW)+' мм')}
    ${hDim(dx, dx+dW, y0+dH+pad*0.42, Math.round(dW)+' мм')}
    ${hDim(tx, tx+tW, y0+tH+pad*0.42, Math.round(tW)+' мм')}
    ${vDim(y0, y0+dH, x0-pad*0.45, Math.round(dH)+' мм')}
    ${vDim(y0, y0+tH, x0+totalW+pad*0.45, Math.round(tH)+' мм')}
  </svg>`;
}

/* ---------- РАСЧЁТЫ ---------- */
function calc(){
  const dW=num(S.doorW,600), dH=num(S.doorH,2100), tW=num(S.topW,600), tH=num(S.topH,500);
  const area = (dW+tW)*dH/1e6;                       // м² блока
  const glass = ((dW-120)*(dH*0.42) + (tW-120)*(tH-120))/1e6; // м² остекления (примерно)
  const seam  = (2*(dH+dW) + 2*(tH+tW))/1000;        // м уплотнителя по контурам
  return { area, glass, seam, totalW:dW+tW, totalH:dH };
}

/* ---------- ОКНО ---------- */
function field(key,label,def){
  return `<label class="blc-f"><span>${label}</span>
    <input type="number" inputmode="numeric" value="${S[key]||''}" placeholder="${def}" oninput="__blc.set('${key}',this.value)">
    <i>мм</i></label>`;
}
function body(){
  const c = calc();
  return `
    <div class="blc-box" id="blcBox">${svg()}</div>
    <div class="blc-grid">
      ${field('doorW','Ширина двери',600)}
      ${field('doorH','Высота двери',2100)}
      ${field('topW','Ширина глухого окна',600)}
      ${field('topH','Высота глухого окна',500)}
    </div>
    <div class="blc-side">
      <button class="${S.side==='Справа'?'sel':''}" onclick="__blc.side('Справа')">➡️ Глухое справа</button>
      <button class="${S.side==='Слева'?'sel':''}" onclick="__blc.side('Слева')">⬅️ Глухое слева</button>
    </div>
    <div class="blc-info" id="blcInfo">
      Общий габарит: <b>${Math.round(c.totalW)} × ${Math.round(c.totalH)} мм</b><br>
      Площадь блока: <b>${c.area.toFixed(2)} м²</b> · остекление ≈ <b>${c.glass.toFixed(2)} м²</b><br>
      Уплотнитель по контурам: <b>${c.seam.toFixed(2)} м</b>
    </div>
    <div class="blc-btns">
      <button class="blc-btn blc-gold" onclick="__blc.apply()">✓ Записать в замер</button>
      <div class="blc-row">
        <button class="blc-btn blc-ghost" onclick="__blc.preset()">⚡ Стандарт</button>
        <button class="blc-btn blc-ghost" onclick="__blc.share()">📤 Отправить</button>
      </div>
      <button class="blc-btn blc-ghost" onclick="__blc.close()">Закрыть</button>
    </div>`;
}

function open(){
  injectCSS();
  load();
  let ovl = document.getElementById('blcOvl');
  if(!ovl){
    ovl = document.createElement('div');
    ovl.id = 'blcOvl';
    ovl.className = 'blc-ovl';
    ovl.innerHTML = `<div class="blc">
      <div class="blc-h"><span class="i">🚪</span><h3>Балконный блок</h3><button class="blc-x" onclick="__blc.close()">✕</button></div>
      <div id="blcBody"></div>
    </div>`;
    ovl.addEventListener('click', e=>{ if(e.target===ovl) close(); });
    document.body.appendChild(ovl);
  }
  document.getElementById('blcBody').innerHTML = body();
  ovl.classList.add('on');
  document.documentElement.style.overflow = 'hidden';
}
function close(){
  const ovl = document.getElementById('blcOvl');
  if(ovl) ovl.classList.remove('on');
  document.documentElement.style.overflow = '';
}
function redraw(){
  const b = document.getElementById('blcBox');
  if(b) b.innerHTML = svg();
  const c = calc();
  const i = document.getElementById('blcInfo');
  if(i) i.innerHTML = `Общий габарит: <b>${Math.round(c.totalW)} × ${Math.round(c.totalH)} мм</b><br>
      Площадь блока: <b>${c.area.toFixed(2)} м²</b> · остекление ≈ <b>${c.glass.toFixed(2)} м²</b><br>
      Уплотнитель по контурам: <b>${c.seam.toFixed(2)} м</b>`;
}
function set(key,val){ S[key]=val; save(); redraw(); }
function side(v){
  S.side=v; save();
  document.querySelectorAll('.blc-side button').forEach((b,idx)=>{
    b.classList.toggle('sel', (idx===0 && v==='Справа') || (idx===1 && v==='Слева'));
  });
  redraw();
}
function preset(){
  S.doorW='600'; S.doorH='2100'; S.topW='600'; S.topH='500';
  if(!S.side) S.side='Справа';
  save();
  document.getElementById('blcBody').innerHTML = body();
  toast('⚡ Стандарт: дверь 2100×600 + глухарь 500×600');
}
function apply(){
  const D = window.D;
  if(D){
    D.balcDoorW = String(mm(S.doorW)||600);
    D.balcDoorH = String(mm(S.doorH)||2100);
    D.balcTopW  = String(mm(S.topW)||600);
    D.balcTopH  = String(mm(S.topH)||500);
    D.balcSide  = S.side;
    if(typeof window.buildSteps === 'function') window.buildSteps();
    if(typeof window.render === 'function') window.render();
  }
  save();
  toast('✅ Размеры блока записаны в замер');
  close();
}
function text(){
  const c = calc();
  return [
    '🚪 БАЛКОННЫЙ БЛОК (размеры в мм)',
    '━━━━━━━━━━━━━━━━━━',
    '• Дверь: '+Math.round(num(S.doorW,600))+' × '+Math.round(num(S.doorH,2100))+' мм',
    '• Глухое окно: '+Math.round(num(S.topW,600))+' × '+Math.round(num(S.topH,500))+' мм',
    '• Глухарь: '+S.side+' от двери, выровнен по верху',
    '',
    'Общий габарит: '+Math.round(c.totalW)+' × '+Math.round(c.totalH)+' мм',
    'Площадь блока: '+c.area.toFixed(2)+' м²',
    'Остекление ≈ '+c.glass.toFixed(2)+' м²',
    'Уплотнитель по контурам: '+c.seam.toFixed(2)+' м'
  ].join('\n');
}
function share(){
  const t = text();
  if(navigator.share){ navigator.share({title:'Балконный блок', text:t}).catch(()=>{}); }
  else if(navigator.clipboard){ navigator.clipboard.writeText(t).then(()=>toast('📋 Скопировано')).catch(()=>toast('Не удалось скопировать')); }
  else toast('Отправка недоступна');
}
function toast(m){
  if(typeof window.toast === 'function'){ window.toast(m); return; }
  let t = document.getElementById('blcToast');
  if(!t){
    t = document.createElement('div');
    t.id = 'blcToast';
    t.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translate(-50%,120px);z-index:99;background:linear-gradient(135deg,#1b2436,#0d1320);border:1px solid rgba(232,195,122,.4);color:#eef3fb;padding:13px 20px;border-radius:16px;font:600 13.5px Manrope,system-ui,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.6);transition:transform .35s cubic-bezier(.2,.9,.3,1.2);max-width:88vw;text-align:center';
    document.body.appendChild(t);
  }
  t.textContent = m;
  t.style.transform = 'translate(-50%,0)';
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.style.transform = 'translate(-50%,120px)'; }, 2400);
}

/* ---------- ЭКСПОРТ ---------- */
window.__blc = { set, side, preset, apply, share, close, open };
window.openBalcony = open;

document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });
})();

/* ============================================================
   ЗАМЕР PRO · Балконный блок — визуализация
   Дверь + глухая часть. Глухая прилегает к двери СБОКУ,
   по ВЕРХНЕМУ краю (по умолчанию). Все размеры в сантиметрах.
   Открыть: кнопка 🚪 в приложении или адрес с #balcony
   ============================================================ */
(function(){
'use strict';

var KEY='wm_balcony';
var DEF={doorW:60,doorH:210,panW:60,panH:50,side:'right',place:'top'};
var BK=Object.assign({},DEF);
try{ var sv=JSON.parse(localStorage.getItem(KEY)||'null'); if(sv&&typeof sv==='object') BK=Object.assign(BK,sv); }catch(e){}

var LIM={doorW:[40,200],doorH:[120,300],panW:[20,400],panH:[20,200]};

function toNum(v,d){ var n=parseFloat(String(v).replace(',','.')); return isNaN(n)?d:n; }
function clamp(v,a,b){ return Math.min(b,Math.max(a,v)); }
function R(n){ return Math.round(n*10)/10; }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(BK)); }catch(e){} }
function say(m){ if(typeof window.toast==='function'){ window.toast(m); } }

/* ---------------- ГЕОМЕТРИЯ ---------------- */
function layout(){
  var isAbove = BK.place==='above';
  var totalW = isAbove ? Math.max(BK.doorW,BK.panW) : BK.doorW+BK.panW;
  var totalH = isAbove ? BK.doorH+BK.panH : Math.max(BK.doorH,BK.panH);
  var PADL=46, PADR=30, PADT=34, PADB=54;
  var k = Math.min(300/totalW, 270/totalH);
  var x0=PADL, y0=PADT;
  var W = PADL + totalW*k + PADR;
  var H = PADT + totalH*k + PADB;
  var dX,dY,pX,pY;
  if(isAbove){
    dX = x0; dY = y0 + BK.panH*k;
    pX = x0; pY = y0;
  } else if(BK.side==='right'){
    dX = x0; pX = x0 + BK.doorW*k;
    dY = y0; pY = (BK.place==='top') ? y0 : y0 + (totalH-BK.panH)*k;
  } else {
    pX = x0; dX = x0 + BK.panW*k;
    dY = y0; pY = (BK.place==='top') ? y0 : y0 + (totalH-BK.panH)*k;
  }
  return {isAbove:isAbove,totalW:totalW,totalH:totalH,k:k,x0:x0,y0:y0,W:W,H:H,
          dX:dX,dY:dY,dW:BK.doorW*k,dH:BK.doorH*k,
          pX:pX,pY:pY,pW:BK.panW*k,pH:BK.panH*k};
}

/* ---------------- ПРИМИТИВЫ ---------------- */
function glass(x,y,w,h){
  return '<rect x="'+R(x)+'" y="'+R(y)+'" width="'+R(w)+'" height="'+R(h)+'" rx="2" fill="rgba(127,216,255,.14)" stroke="rgba(191,240,255,.42)" stroke-width="1"/>';
}
function hDim(x1,x2,y,val,sub){
  var cx=(x1+x2)/2, label=(sub?sub+' ':'')+val+' см';
  return '<line x1="'+R(x1)+'" y1="'+R(y)+'" x2="'+R(x2)+'" y2="'+R(y)+'" stroke="#e8c37a" stroke-width="1.1" opacity=".75"/>'+
    '<line x1="'+R(x1)+'" y1="'+R(y-5)+'" x2="'+R(x1)+'" y2="'+R(y+5)+'" stroke="#e8c37a" stroke-width="1.1"/>'+
    '<line x1="'+R(x2)+'" y1="'+R(y-5)+'" x2="'+R(x2)+'" y2="'+R(y+5)+'" stroke="#e8c37a" stroke-width="1.1"/>'+
    '<text x="'+R(cx)+'" y="'+R(y-6)+'" fill="#f6e3b4" font-size="10.5" font-weight="700" text-anchor="middle" font-family="Manrope,sans-serif">'+label+'</text>';
}
function vDim(x,y1,y2,label,left){
  var ty=(y1+y2)/2+4, tx=left?x-6:x+6, anchor=left?'end':'start';
  return '<line x1="'+R(x)+'" y1="'+R(y1)+'" x2="'+R(x)+'" y2="'+R(y2)+'" stroke="#e8c37a" stroke-width="1.1" opacity=".75"/>'+
    '<line x1="'+R(x-4)+'" y1="'+R(y1)+'" x2="'+R(x+4)+'" y2="'+R(y1)+'" stroke="#e8c37a" stroke-width="1.1"/>'+
    '<line x1="'+R(x-4)+'" y1="'+R(y2)+'" x2="'+R(x+4)+'" y2="'+R(y2)+'" stroke="#e8c37a" stroke-width="1.1"/>'+
    '<text x="'+R(tx)+'" y="'+R(ty)+'" fill="#f6e3b4" font-size="10.5" font-weight="700" text-anchor="'+anchor+'" font-family="Manrope,sans-serif">'+label+'</text>';
}

/* ---------------- РИСУНОК ---------------- */
function svg(){
  var L=layout(), p='';

  /* стена — пустое место под глухой частью, если она короче двери */
  if(!L.isAbove && BK.panH < L.totalH){
    var emptyH=(L.totalH-BK.panH)*L.k;
    var ey = BK.place==='top' ? L.y0+BK.panH*L.k : L.y0;
    p += '<rect x="'+R(L.pX)+'" y="'+R(ey)+'" width="'+R(L.pW)+'" height="'+R(emptyH)+'" fill="url(#bkWall)" stroke="rgba(255,255,255,.14)" stroke-dasharray="4 3"/>';
    p += '<text x="'+R(L.pX+L.pW/2)+'" y="'+R(ey+emptyH/2+4)+'" fill="#8b98ad" font-size="9.5" font-weight="700" text-anchor="middle" font-family="Manrope,sans-serif">стена</text>';
  }

  /* дверь */
  p += '<rect x="'+R(L.dX)+'" y="'+R(L.dY)+'" width="'+R(L.dW)+'" height="'+R(L.dH)+'" rx="3" fill="rgba(255,255,255,.05)" stroke="#e8c37a" stroke-width="1.8"/>';
  p += glass(L.dX+L.dW*0.13, L.dY+L.dH*0.05, L.dW*0.74, L.dH*0.47);
  p += glass(L.dX+L.dW*0.13, L.dY+L.dH*0.60, L.dW*0.74, L.dH*0.34);
  p += '<circle cx="'+R(L.dX+L.dW*0.5)+'" cy="'+R(L.dY+L.dH*0.565)+'" r="'+R(Math.max(2,L.dW*0.07))+'" fill="none" stroke="#e8c37a" stroke-width="1.4"/>';
  if(L.dH>60 && L.dW>30){
    p += '<text x="'+R(L.dX+L.dW/2)+'" y="'+R(L.dY+L.dH*0.30)+'" fill="#f6e3b4" font-size="10" font-weight="800" text-anchor="middle" font-family="Manrope,sans-serif">дверь</text>';
  }

  /* глухая часть */
  p += '<rect x="'+R(L.pX)+'" y="'+R(L.pY)+'" width="'+R(L.pW)+'" height="'+R(L.pH)+'" rx="3" fill="rgba(255,255,255,.05)" stroke="#7fd8ff" stroke-width="1.6"/>';
  p += glass(L.pX+L.pW*0.11, L.pY+L.pH*0.13, L.pW*0.78, L.pH*0.74);
  if(L.pH>34 && L.pW>44){
    p += '<text x="'+R(L.pX+L.pW/2)+'" y="'+R(L.pY+L.pH*0.52)+'" fill="#bff0ff" font-size="10" font-weight="800" text-anchor="middle" font-family="Manrope,sans-serif">глухое</text>';
  }

  /* размеры: ширина */
  var yb = L.y0 + L.totalH*L.k + 20;
  if(L.isAbove){
    p += hDim(L.dX, L.dX+L.dW, yb, BK.doorW, 'дверь');
    p += hDim(L.pX, L.pX+L.pW, yb+20, BK.panW, 'глухая');
  } else {
    p += hDim(L.dX, L.dX+L.dW, yb, BK.doorW);
    p += hDim(L.pX, L.pX+L.pW, yb, BK.panW);
  }

  /* размеры: высота */
  var doorLeft = L.isAbove || L.dX < L.pX;
  p += vDim(doorLeft ? L.dX-10 : L.dX+L.dW+10, L.dY, L.dY+L.dH, BK.doorH+' см', doorLeft);
  var panLeft = L.isAbove || L.pX < L.dX;
  p += vDim(panLeft ? L.pX-10 : L.pX+L.pW+10, L.pY, L.pY+L.pH, BK.panH+' см', panLeft);

  return '<svg viewBox="0 0 '+R(L.W)+' '+R(L.H)+'" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">'+
    '<defs><pattern id="bkWall" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">'+
    '<line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,.10)" stroke-width="2"/></pattern></defs>'+
    p+'</svg>';
}

function chips(){
  var L=layout();
  var area=(BK.doorW*BK.doorH + BK.panW*BK.panH)/10000;
  var per=(2*(BK.doorW+BK.doorH) + 2*(BK.panW+BK.panH))/100;
  var sideTxt = L.isAbove ? 'над дверью' : (BK.side==='right' ? 'дверь слева' : 'дверь справа');
  var placeTxt = L.isAbove ? 'сверху' : (BK.place==='top' ? 'сбоку сверху' : 'сбоку снизу');
  return '<div class="bk-chip"><b>'+BK.doorW+'×'+BK.doorH+'</b><span>дверь, см</span></div>'+
    '<div class="bk-chip"><b>'+BK.panW+'×'+BK.panH+'</b><span>глухая, см</span></div>'+
    '<div class="bk-chip"><b>'+L.totalW+'×'+L.totalH+'</b><span>габарит блока</span></div>'+
    '<div class="bk-chip"><b>'+area.toFixed(2)+' м²</b><span>площадь</span></div>'+
    '<div class="bk-chip"><b>'+per.toFixed(1)+' м</b><span>уплотнитель</span></div>'+
    '<div class="bk-chip"><b>'+sideTxt+'</b><span>'+placeTxt+'</span></div>';
}

/* ---------------- РЕНДЕР ---------------- */
function draw(){
  var s=document.getElementById('bkSvg'); if(!s) return;
  s.innerHTML=svg();
  var c=document.getElementById('bkChips'); if(c) c.innerHTML=chips();
}
function syncInputs(){
  var m={bkDoorW:'doorW',bkDoorH:'doorH',bkPanW:'panW',bkPanH:'panH'};
  Object.keys(m).forEach(function(id){ var el=document.getElementById(id); if(el) el.value=BK[m[id]]; });
}
function syncCtl(){
  document.querySelectorAll('#bkPlace button').forEach(function(b){ b.classList.toggle('on', b.dataset.v===BK.place); });
  document.querySelectorAll('#bkSide button').forEach(function(b){ b.classList.toggle('on', b.dataset.v===BK.side); });
  var w=document.getElementById('bkSideWrap'); if(w) w.style.display = BK.place==='above' ? 'none' : 'block';
}

/* ---------------- СБОРКА ОКНА ---------------- */
var CSS=''+
'#bkOvl{position:fixed;inset:0;z-index:95;background:rgba(4,7,13,.93);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 12px 34px}'+
'#bkOvl.on{display:block}'+
'.bk-card{max-width:520px;margin:0 auto;background:linear-gradient(180deg,#141c2c,#0d1320);border:1px solid rgba(232,195,122,.3);border-radius:24px;padding:16px;box-shadow:0 26px 70px rgba(0,0,0,.7)}'+
'.bk-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}'+
'.bk-h1{font-size:17px;font-weight:800;color:#f6e3b4}'+
'.bk-x{margin-left:auto;width:36px;height:36px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#eef3fb;font-size:15px;cursor:pointer}'+
'.bk-sub{font-size:11.5px;line-height:1.5;color:#8b98ad;margin-bottom:12px}'+
'.bk-svg{background:radial-gradient(120% 120% at 50% 0%,rgba(127,216,255,.07),transparent 70%);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:8px;margin-bottom:12px}'+
'.bk-chips{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:14px}'+
'.bk-chip{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 5px;text-align:center}'+
'.bk-chip b{display:block;font-size:12.5px;color:#bff0ff;font-weight:800}'+
'.bk-chip span{display:block;font-size:9.5px;color:#8b98ad;margin-top:2px}'+
'.bk-label{font-size:10.5px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:#e8c37a;margin:12px 0 7px;opacity:.9}'+
'.bk-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
'.bk-f{display:flex;flex-direction:column;gap:5px}'+
'.bk-f label{font-size:10.5px;color:#8b98ad;font-weight:700}'+
'.bk-f input{width:100%;background:rgba(0,0,0,.35);border:1.5px solid rgba(255,255,255,.1);border-radius:13px;padding:12px 8px;font-size:18px;font-weight:800;color:#bff0ff;text-align:center;font-family:inherit;outline:none;-webkit-appearance:none}'+
'.bk-f input:focus{border-color:#e8c37a;box-shadow:0 0 18px rgba(232,195,122,.2)}'+
'.bk-seg{display:flex;gap:7px;flex-wrap:wrap}'+
'.bk-seg button{flex:1;min-width:96px;padding:11px 6px;border-radius:12px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.055);color:#eef3fb;font-family:inherit;font-size:11.5px;font-weight:700;cursor:pointer;transition:.15s}'+
'.bk-seg button:active{transform:scale(.97)}'+
'.bk-seg button.on{border-color:#e8c37a;background:linear-gradient(135deg,rgba(232,195,122,.18),rgba(127,216,255,.08));color:#f6e3b4}'+
'.bk-row{display:flex;gap:8px;margin-top:14px}'+
'.bk-btn{flex:1;padding:15px;border-radius:15px;border:none;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer}'+
'.bk-btn:active{transform:scale(.97)}'+
'.bk-gold{background:linear-gradient(135deg,#e8c37a,#f6e3b4);color:#1a1206;box-shadow:0 10px 26px rgba(232,195,122,.25)}'+
'.bk-ghost{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.1);color:#eef3fb}'+
'@media(max-width:360px){.bk-chips{grid-template-columns:1fr 1fr}}';

function build(){
  if(document.getElementById('bkOvl')) return;
  var st=document.createElement('style'); st.id='bkCss'; st.textContent=CSS; document.head.appendChild(st);
  var ov=document.createElement('div'); ov.id='bkOvl';
  ov.innerHTML=''+
  '<div class="bk-card">'+
    '<div class="bk-top"><div class="bk-h1">🚪 Балконный блок</div><button class="bk-x" onclick="closeBalcony()">✕</button></div>'+
    '<div class="bk-sub">Дверь + глухая часть. Глухая прилегает к двери сбоку, по верхнему краю. Меняй размеры — блок перерисуется сразу.</div>'+
    '<div class="bk-svg" id="bkSvg"></div>'+
    '<div class="bk-chips" id="bkChips"></div>'+
    '<div class="bk-label">Размеры, см</div>'+
    '<div class="bk-grid">'+
      '<div class="bk-f"><label>Ширина двери</label><input id="bkDoorW" type="number" inputmode="decimal" oninput="bkSet(\'doorW\',this.value)" onchange="bkFix(\'doorW\',this)"></div>'+
      '<div class="bk-f"><label>Высота двери</label><input id="bkDoorH" type="number" inputmode="decimal" oninput="bkSet(\'doorH\',this.value)" onchange="bkFix(\'doorH\',this)"></div>'+
      '<div class="bk-f"><label>Ширина глухой</label><input id="bkPanW" type="number" inputmode="decimal" oninput="bkSet(\'panW\',this.value)" onchange="bkFix(\'panW\',this)"></div>'+
      '<div class="bk-f"><label>Высота глухой</label><input id="bkPanH" type="number" inputmode="decimal" oninput="bkSet(\'panH\',this.value)" onchange="bkFix(\'panH\',this)"></div>'+
    '</div>'+
    '<div class="bk-label">Положение глухой части</div>'+
    '<div class="bk-seg" id="bkPlace">'+
      '<button data-v="top" onclick="bkPlace(\'top\')">Сбоку сверху</button>'+
      '<button data-v="bottom" onclick="bkPlace(\'bottom\')">Сбоку снизу</button>'+
      '<button data-v="above" onclick="bkPlace(\'above\')">Сверху над дверью</button>'+
    '</div>'+
    '<div id="bkSideWrap">'+
      '<div class="bk-label">С какой стороны дверь</div>'+
      '<div class="bk-seg" id="bkSide">'+
        '<button data-v="left" onclick="bkSide(\'left\')">Глухая слева</button>'+
        '<button data-v="right" onclick="bkSide(\'right\')">Глухая справа</button>'+
      '</div>'+
    '</div>'+
    '<div class="bk-row"><button class="bk-btn bk-gold" onclick="bkSend()">📤 Отправить</button><button class="bk-btn bk-ghost" onclick="bkReset()">↺ Сброс</button></div>'+
    '<div class="bk-row"><button class="bk-btn bk-ghost" onclick="closeBalcony()">Готово</button></div>'+
  '</div>';
  document.body.appendChild(ov);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') window.closeBalcony(); });
}

/* ---------------- ПУБЛИЧНЫЕ ДЕЙСТВИЯ ---------------- */
window.openBalcony=function(){
  build();
  document.getElementById('bkOvl').classList.add('on');
  document.body.style.overflow='hidden';
  syncInputs(); syncCtl(); draw();
};
window.closeBalcony=function(){
  var ov=document.getElementById('bkOvl'); if(ov) ov.classList.remove('on');
  document.body.style.overflow='';
};
window.bkSet=function(key,val){
  var n=toNum(val,BK[key]);
  BK[key]=clamp(n,1,600);
  save(); draw();
};
window.bkFix=function(key,el){
  var n=clamp(toNum(el.value,BK[key]),LIM[key][0],LIM[key][1]);
  BK[key]=Math.round(n); el.value=BK[key]; save(); draw();
};
window.bkPlace=function(v){ BK.place=v; save(); syncCtl(); draw(); };
window.bkSide=function(v){ BK.side=v; save(); syncCtl(); draw(); };
window.bkReset=function(){ BK=Object.assign({},DEF); save(); syncInputs(); syncCtl(); draw(); say('↺ Размеры сброшены'); };
window.bkSend=function(){
  var L=layout();
  var area=(BK.doorW*BK.doorH + BK.panW*BK.panH)/10000;
  var per=(2*(BK.doorW+BK.doorH) + 2*(BK.panW+BK.panH))/100;
  var placeTxt = L.isAbove ? 'сверху над дверью' : ('сбоку ' + (BK.place==='top'?'по верхнему краю':'по нижнему краю') + (BK.side==='right'?', справа от двери':', слева от двери'));
  var txt='🚪 БАЛКОННЫЙ БЛОК\n'+
    '• Дверь: '+BK.doorW+' × '+BK.doorH+' см\n'+
    '• Глухая часть: '+BK.panW+' × '+BK.panH+' см ('+placeTxt+')\n'+
    '• Габарит блока: '+L.totalW+' × '+L.totalH+' см\n'+
    '• Площадь остекления: '+area.toFixed(2)+' м²\n'+
    '• Уплотнитель по контуру: '+per.toFixed(1)+' м';
  if(navigator.share){ navigator.share({title:'Балконный блок', text:txt}).catch(function(){}); }
  else if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(function(){ say('📋 Скопировано'); }).catch(function(){ say('Не удалось скопировать'); }); }
  else { say('Буфер недоступен'); }
};

/* ---------------- СТАРТ ---------------- */
if(location.hash==='#balcony'){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', window.openBalcony); } else { window.openBalcony(); } }
window.openBalconyFromHash=window.openBalcony;

})();
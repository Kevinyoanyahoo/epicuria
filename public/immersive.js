/* EpicurIA · mode immersif plein écran, interface façon Habbo */
(function(){const s=document.createElement('style');s.textContent=`
body.imm{overflow:hidden;height:100dvh}
body.imm #app{max-width:none;padding:0;min-height:0}
body.imm #sGame>.hintc{display:none}
body.imm #stage{position:fixed;inset:0;border:0;border-radius:0;box-shadow:none;z-index:1}
body.imm #game{width:100vw;height:100dvh;aspect-ratio:auto;display:block}
body.imm #plazaBar{position:static;margin:0}
.hx{position:fixed;z-index:20;font-family:'Inter',system-ui,sans-serif;color:#fff}
.hxGlass{background:rgba(18,21,44,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:2px solid #2f3566;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.45)}
#hxTL{top:12px;left:12px;display:flex;gap:8px;align-items:center}
.hxY{width:46px;height:46px;border-radius:12px;border:3px solid #1a1206;background:linear-gradient(#ffd84a,#f5a800);box-shadow:0 4px 0 #a86a00;font-size:22px;cursor:pointer;display:grid;place-items:center}
.hxY:active{transform:translateY(2px);box-shadow:0 2px 0 #a86a00}
#hxRoom{padding:8px 14px;font-weight:700;font-size:14px}
#hxRoom small{display:block;font-weight:500;color:#9aa2d6;font-size:11px}
#hxTR{top:12px;right:12px;min-width:230px;padding:10px 12px;display:flex;gap:10px;align-items:center}
#hxTR canvas{width:46px;height:46px;border-radius:12px;background:#2a2f63}
#hxTR .nm{font-weight:800;font-size:15px}#hxTR .rk{font-size:11px;color:#9aa2d6}
#hxTR .xp{height:6px;background:#2a3166;border-radius:4px;margin-top:5px;overflow:hidden}#hxTR .xp i{display:block;height:100%;background:linear-gradient(90deg,#7fd48a,#5be3c9)}
#hxTR .vals{margin-left:auto;text-align:right;font-weight:800;font-size:13px;line-height:1.5}
#hxTR .vals .lv{background:#6a4ad5;border-radius:8px;padding:1px 8px}
#hxBL{left:12px;bottom:12px;display:flex;gap:4px;padding:6px}
.hxB{position:relative;width:52px;height:52px;border-radius:12px;border:0;background:transparent;color:#fff;cursor:pointer;display:grid;place-items:center;font-size:24px;transition:background .15s,transform .15s}
.hxB:hover{background:rgba(255,255,255,.1);transform:translateY(-2px)}
.hxB span{position:absolute;bottom:58px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#0d0f24;border:1px solid #353b6a;border-radius:8px;padding:3px 8px;font-size:12px;font-weight:600;opacity:0;pointer-events:none;transition:opacity .15s}
.hxB:hover span{opacity:1}
.hxB b{position:absolute;top:4px;right:4px;min-width:18px;height:18px;border-radius:9px;background:#e33;font-size:11px;display:grid;place-items:center;padding:0 4px}
#hxBR{right:12px;bottom:12px;display:flex;gap:4px;padding:6px}
body.imm #panel{position:fixed;z-index:20;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom));width:min(560px,calc(100vw - 520px));min-width:300px;margin:0;min-height:0}
body.imm #chatbar{background:rgba(18,21,44,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:2px solid #2f3566;border-radius:14px;padding:6px 8px;box-shadow:0 8px 24px rgba(0,0,0,.45)}
body.imm #dialog{max-width:820px;margin:0 auto 70px}
body.imm #zoomCtl{top:50%!important;transform:translateY(-50%);right:12px!important}
body.imm #emoPop{bottom:84px!important}
body.imm #toasts{z-index:25}
@media (max-width:900px){
 #hxTR{min-width:0;left:68px;right:12px;padding:8px 10px}#hxRoom{display:none}
 #hxBL{left:6px;right:6px;bottom:72px;justify-content:space-between;padding:4px}
 .hxB{width:auto;flex:1;height:46px;font-size:21px}.hxB span{display:none}
 #hxBR{display:none}
 body.imm #panel{width:calc(100vw - 12px);min-width:0;bottom:calc(8px + env(safe-area-inset-bottom))}
 body.imm #zoomCtl{top:96px!important;transform:none}
}`;document.head.appendChild(s);})();

let IMM=false;
function immWanted(){return !!(G&&G.mode==='plaza'&&$('#sGame').classList.contains('on'));}
function relayout(R){if(!R||!R.tw)return;const n=R.w+R.h;R.ox=VW/2-(R.w-R.h)*R.tw/4;R.oy=Math.round((VH-(n*R.th/2)-R.wh)/2+R.wh);R._c={};}
function applyView(force){const want=immWanted();let w=960,h=540,pw=1280,ph=720;
 if(want){const vw=innerWidth,vh=innerHeight,a=Math.max(.42,Math.min(2.6,vw/vh));
  if(a>=16/9){h=540;w=Math.round(540*a);}else{w=960;h=Math.round(960/a);}
  const d=Math.min(2,devicePixelRatio||1),sc=Math.min(1,2600/(vw*d));pw=Math.round(vw*d*sc);ph=Math.round(vh*d*sc);}
 if(!force&&want===IMM&&w===VW&&h===VH&&cv.width===pw&&cv.height===ph)return;
 IMM=want;document.body.classList.toggle('imm',want);document.querySelectorAll('.hx').forEach(e=>e.style.display=want?'flex':'none');
 VW=w;VH=h;cv.width=pw;cv.height=ph;K=cv.width/VW;if(G&&G.R){relayout(G.R);G.cam=null;G.camSnap=true;}
 if(want)renderPlazaBar();if(typeof zoomUI==='function')zoomUI();}
camAuto=function(){const w=cv.getBoundingClientRect().width||400;if(IMM)return VH>VW*1.25?2.2:1;return clamp(620/w,1,1.9);};
function toggleFS(){const d=document;try{if(!d.fullscreenElement&&!d.webkitFullscreenElement){const e=d.documentElement;(e.requestFullscreen||e.webkitRequestFullscreen).call(e);}else (d.exitFullscreen||d.webkitExitFullscreen).call(d);}catch(e){toast2('Plein écran indisponible sur cet appareil');}}

function hxBuild(){if($('#hxTL'))return;const root=document.body;
 root.insertAdjacentHTML('beforeend',`<div id="hxTL" class="hx" style="display:none"><button class="hxY" id="hxFS" title="Plein écran">⛶</button><div id="hxRoom" class="hxGlass"></div></div>
 <div id="hxTR" class="hx hxGlass" style="display:none"><canvas id="hxAv" width="92" height="92"></canvas><div><div class="nm"></div><div class="rk"></div><div class="xp"><i></i></div></div><div class="vals"><div><span class="lv"></span></div><div class="cr"></div></div></div>
 <div id="hxBL" class="hx hxGlass" style="display:none"></div><div id="hxBR" class="hx hxGlass" style="display:none"></div>`);
 $('#hxFS').onclick=e=>{e.stopPropagation();toggleFS();};$('#hxTR').onclick=()=>panelProfile();}
const _rpb0=renderPlazaBar;
renderPlazaBar=function(){_rpb0();if(!IMM){return;}hxBuild();document.querySelectorAll('.hx').forEach(e=>e.style.display='flex');$('#plazaBar').style.display='none';
 const lv=myLv(),a=XPN(lv),b=XPN(lv+1),pc=lv>=50?100:Math.round((S.pts-a)/(b-a)*100),bc=badgeCount(),un=typeof unreadN==='function'?unreadN():0;
 $('#hxRoom').innerHTML=`${esc(G&&G.R?G.R.name:'')}<small>${NET.peersN?NET.peersN+' joueur(s) en ligne':'EpicurIA'}</small>`;
 $('#hxTR .nm').textContent=S.name;$('#hxTR .rk').textContent=rankOf(lv);$('#hxTR .xp i').style.width=pc+'%';$('#hxTR .lv').textContent='NIV '+lv;$('#hxTR .cr').textContent='🪙 '+fmt(S.cr);
 drawPortrait($('#hxAv'),S.look,'smile',['#cbb8ff','#4a2a9a']);
 const B=(id,ic,lab,n)=>`<button class="hxB" id="${id}">${ic}<span>${lab}</span>${n?`<b>${n}</b>`:''}</button>`;
 $('#hxBL').innerHTML=B('hxA','🌍','Carte de l’Afrique')+B('hxM','📋','Missions')+B('hxN','🗺️','Plan')+B('hxV','📚','Savoirs')+B('hxS','🛒','Boutique')+B('hxO','📨','Offres',bc)+(innerWidth<=900?B('hxU','👥','Communauté',un)+B('hxP','👤','Profil'):'');
 $('#hxBR').innerHTML=innerWidth>900?B('hxU2','👥','Communauté',un)+B('hxP2','👤','Profil'):'';
 const on=(id,f)=>{const e=$('#'+id);if(e)e.onclick=ev=>{ev.stopPropagation();f();};};
 on('hxA',panelAfrique);on('hxM',panelMissions);on('hxN',panelNav);on('hxV',()=>panelSavoirs());on('hxS',panelShop);on('hxO',()=>panelOffers('in'));
 on('hxU',()=>panelOnline());on('hxP',panelProfile);on('hxU2',()=>panelOnline());on('hxP2',panelProfile);};
(function watch(){try{applyView(false);}catch(e){}requestAnimationFrame(watch);})();
addEventListener('resize',()=>applyView(true));
document.addEventListener('keydown',e=>{if(IMM&&e.key==='f'&&!['INPUT','TEXTAREA'].includes(e.target.tagName))toggleFS();});

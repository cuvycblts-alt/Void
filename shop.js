(() => {
  'use strict';
  const KEY='voidwing-shop-v1';
  const upgrades=[
    {id:'collector',icon:'◇',name:'ЭХО-СБОРЩИК',desc:'Больше осколков за каждое очко',effect:l=>`+${l} к добыче`,cost:[25,70,160]},
    {id:'core',icon:'◉',name:'ЯДРО РАЗЛОМА',desc:'Стартовый запас в начале полёта',effect:l=>`+${l*5} за старт`,cost:[35,90,190]},
    {id:'phoenix',icon:'△',name:'КОНТРАКТ ФЕНИКСА',desc:'Компенсация после потери сигнала',effect:l=>`+${l*10} после смерти`,cost:[45,110,220]}
  ];
  const safe=()=>({coins:0,levels:{collector:0,core:0,phoenix:0}});
  function load(){try{const v=JSON.parse(localStorage.getItem(KEY));return {...safe(),...v,levels:{...safe().levels,...(v.levels||{})}}}catch(e){return safe()}}
  let data=load(),lastScore=0,runActive=false,deathPaid=false;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
  function sync(){$$('[data-void-balance]').forEach(el=>el.textContent=data.coins);render()}
  function render(){const root=$('#shop-items');if(!root)return;root.innerHTML=upgrades.map(u=>{const l=data.levels[u.id],max=l>=3,price=max?'MAX':u.cost[l];return `<article class="shop-item ${max?'maxed':''}"><div class="upgrade-icon">${u.icon}</div><div class="upgrade-copy"><small>УРОВЕНЬ ${l}/3</small><h3>${u.name}</h3><p>${u.desc}</p><em>${l?u.effect(l):'Не установлено'}</em></div><button data-buy="${u.id}" ${max||data.coins<price?'disabled':''}><span>${max?'ГОТОВО':'КУПИТЬ'}</span><b>${max?'III':`✦ ${price}`}</b></button></article>`}).join('')}
  function openShop(){const shop=$('#void-shop');shop.classList.remove('hidden');shop.classList.add('open');render()}
  function closeShop(){const shop=$('#void-shop');shop.classList.remove('open');setTimeout(()=>shop.classList.add('hidden'),220)}
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-shop-open]')){e.stopPropagation();openShop();return}
    if(e.target.closest('#shop-close')){e.stopPropagation();closeShop();return}
    const buy=e.target.closest('[data-buy]');if(!buy)return;e.stopPropagation();const u=upgrades.find(x=>x.id===buy.dataset.buy),l=data.levels[u.id];if(l>=3)return;const price=u.cost[l];if(data.coins<price)return;data.coins-=price;data.levels[u.id]++;save();sync();buy.closest('.shop-item').animate([{transform:'scale(.985)'},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'})
  });
  function beginRun(){if(runActive)return;runActive=true;deathPaid=false;lastScore=0;const bonus=data.levels.core*5;if(bonus){data.coins+=bonus;save();sync()}}
  $('#start-button')?.addEventListener('click',beginRun);
  $('#restart-button')?.addEventListener('click',beginRun);
  const score=$('#score');if(score)new MutationObserver(()=>{const n=Number(score.textContent)||0;if(n>lastScore){data.coins+=(n-lastScore)*(1+data.levels.collector);lastScore=n;save();sync()}}).observe(score,{childList:true,characterData:true,subtree:true});
  const over=$('#game-over');if(over)new MutationObserver(()=>{if(!over.classList.contains('hidden')&&!deathPaid){deathPaid=true;runActive=false;data.coins+=data.levels.phoenix*10;save();sync()}}).observe(over,{attributes:true,attributeFilter:['class']});
  addEventListener('keydown',e=>{if(e.code==='Escape'&&!$('#void-shop')?.classList.contains('hidden'))closeShop()});
  sync();
})();

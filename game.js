(() => {
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const shell=$('game-shell');
const ui={hud:$('hud'),start:$('start-screen'),over:$('game-over'),death:$('death-cinematic'),score:$('score'),final:$('final-score'),best:$('best-score'),worldNum:$('world-number'),worldName:$('world-name'),fill:$('rift-fill'),rift:$('rift-label'),reveal:$('world-card'),revealName:$('reveal-name'),revealTag:$('reveal-tagline'),sound:$('sound')};
const worlds=[
 {name:'АЭТЕРИЯ',tag:'Небо, где рождаются звёзды',top:'#111937',bottom:'#284967',glow:'#82f1ff',pipe:'#203f54',edge:'#9df9ff',orb:'#88dfff'},
 {name:'НЕОНОВЫЙ ПРИЛИВ',tag:'Город пульсирует в такт крыльям',top:'#180c35',bottom:'#572557',glow:'#ff78d3',pipe:'#421c5c',edge:'#ff95e5',orb:'#ee75ff'},
 {name:'ЗОЛОТАЯ ПУСТЫНЯ',tag:'Солнца здесь никогда не садятся',top:'#351325',bottom:'#a14f37',glow:'#ffd184',pipe:'#6e332d',edge:'#ffe09c',orb:'#ffb75c'},
 {name:'ИЗУМРУДНАЯ БЕЗДНА',tag:'Древний лес смотрит из темноты',top:'#071f24',bottom:'#145e54',glow:'#7dffc8',pipe:'#164d48',edge:'#a2ffce',orb:'#48e89a'},
 {name:'ЛЕДЯНОЙ СОН',tag:'Время застыло. Ты — нет.',top:'#101a3c',bottom:'#376c91',glow:'#d4f5ff',pipe:'#284b78',edge:'#e9fbff',orb:'#9ddcff'}
];
let W=0,H=0,dpr=1,last=0,state='menu',score=0,best=0,world=0,portalT=0,shake=0,flash=0,soundOn=true,audio;
let bird,pipes=[],particles=[],stars=[],clouds=[],spawn=0;
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);makeSky();if(bird&&!bird.dead)bird.x=Math.min(bird.x,W*.3)}
function makeSky(){stars=Array.from({length:Math.floor(W*H/9500)},()=>({x:Math.random()*W,y:Math.random()*H,s:rand(.4,2),a:rand(.18,.85),p:rand(0,6.28)}));clouds=Array.from({length:7},()=>({x:rand(-W,W),y:rand(H*.05,H*.8),r:rand(90,240),v:rand(.06,.2),a:rand(.025,.08)}))}
function reset(){score=0;world=0;pipes=[];particles=[];spawn=85;bird={x:W*.27,y:H*.47,vy:0,r:15,rot:0,wing:0,dead:false,trail:[]};updateHud();}
function start(){reset();state='playing';ui.start.classList.add('hidden');ui.over.classList.add('hidden');ui.hud.classList.remove('hidden');flap();tone(520,.06,'sine',.035)}
function flap(){if(state==='menu'){start();return}if(state==='over'){start();return}if(state!=='playing')return;bird.vy=-Math.min(8.2,Math.max(6.4,H*.009));bird.wing=1;burst(bird.x-8,bird.y,6,worlds[world].glow,1.5);tone(430,.045,'sine',.025)}
function updateHud(){ui.score.textContent=score;ui.worldNum.textContent=String(world+1).padStart(2,'0');ui.worldName.textContent=worlds[world].name;const rem=50-score%50;ui.fill.style.width=(score%50)*2+'%';ui.rift.textContent=rem+' ДО РАЗЛОМА'}
function tone(freq,dur,type='sine',vol=.02){if(!soundOn)return;try{audio=audio||new (AudioContext||webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.72,audio.currentTime+dur);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+dur)}catch(e){}}
function burst(x,y,n,color,speed=2){for(let i=0;i<n;i++){let a=rand(0,Math.PI*2),v=rand(.3,speed);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,size:rand(1,4),color})}}
function addPipe(){const gap=clamp(H*.235,150,205),margin=Math.max(90,H*.12),cy=rand(margin+gap/2,H-margin-gap/2);pipes.push({x:W+60,w:clamp(W*.105,58,88),cy,gap,passed:false,seed:Math.random()*99})}
function die(){if(state!=='playing')return;state='dying';bird.dead=true;shake=18;flash=.45;shell.classList.add('death-mode');ui.death.classList.remove('hidden');burst(bird.x,bird.y,28,'#ef4150',5);tone(105,.85,'sawtooth',.05);setTimeout(()=>{state='over';best=Math.max(best,score);ui.final.textContent=score;ui.best.textContent=best;ui.death.classList.add('hidden');ui.over.classList.remove('hidden')},1750)}
function enterPortal(){state='portal';portalT=0;shake=5;tone(90,1.1,'sine',.055);}
function update(dt){const f=Math.min(dt/16.67,2);clouds.forEach(c=>{c.x-=c.v*f;if(c.x<-c.r)c.x=W+c.r});stars.forEach(s=>s.p+=.015*f);
 particles.forEach(p=>{p.x+=p.vx*f;p.y+=p.vy*f;p.vy+=.025*f;p.life-=.018*f;p.size*=.994});particles=particles.filter(p=>p.life>0);
 if(state==='menu'){if(!bird)reset();bird.y=H*.47+Math.sin(performance.now()/520)*9;bird.rot=Math.sin(performance.now()/700)*.08;bird.wing=(Math.sin(performance.now()/105)+1)/2;return}
 if(state==='playing'){
  bird.vy+=.38*f;bird.y+=bird.vy*f;bird.rot=clamp(bird.vy*.075,-.5,1.15);bird.wing*=.86;bird.trail.unshift({x:bird.x-15,y:bird.y+5,a:.5});if(bird.trail.length>12)bird.trail.pop();
  spawn-=f;if(spawn<=0){addPipe();spawn=clamp(100-W*.015,72,92)}const speed=clamp(W*.0052,3.15,5.4);
  for(const p of pipes){p.x-=speed*f;if(!p.passed&&p.x+p.w<bird.x){p.passed=true;score++;updateHud();tone(660,.055,'triangle',.018);burst(bird.x+5,bird.y,4,worlds[world].edge,1.3);if(score%50===0){enterPortal();break}}
   if(bird.x+bird.r*.7>p.x&&bird.x-bird.r*.65<p.x+p.w&&(bird.y-bird.r*.65<p.cy-p.gap/2||bird.y+bird.r*.65>p.cy+p.gap/2))die()}
  pipes=pipes.filter(p=>p.x+p.w>-20);if(bird.y+bird.r>H-5||bird.y-bird.r<0)die();
 } else if(state==='dying'){bird.vy+=.55*f;bird.y+=bird.vy*f;bird.rot+=.13*f}
 else if(state==='portal'){portalT+=dt;const t=portalT/2400;const hx=W*.5,hy=H*.5;bird.x+=(hx-bird.x)*.035*f;bird.y+=(hy-bird.y)*.035*f;bird.rot+=.19*f;bird.r=Math.max(1,15*(1-clamp((t-.35)*1.5,0,.95)));for(let i=0;i<3;i++){let a=rand(0,6.28),r=rand(80,Math.max(W,H)*.6);particles.push({x:hx+Math.cos(a)*r,y:hy+Math.sin(a)*r,vx:-Math.cos(a)*rand(2,7),vy:-Math.sin(a)*rand(2,7),life:rand(.4,1),size:rand(1,3),color:worlds[world].glow})}if(portalT>2350){world=(world+1)%worlds.length;pipes=[];bird={x:W*.27,y:H*.46,vy:0,r:15,rot:0,wing:1,dead:false,trail:[]};spawn=70;state='playing';flash=1;ui.revealName.textContent=worlds[world].name;ui.revealTag.textContent=worlds[world].tag;ui.reveal.classList.remove('hidden');void ui.reveal.offsetWidth;setTimeout(()=>ui.reveal.classList.add('hidden'),2400);updateHud();tone(720,.5,'sine',.035)}}
 shake*=.86;flash*=.9;
}
function roundedRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function drawSky(){const w=worlds[world],g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,w.top);g.addColorStop(1,w.bottom);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const rg=ctx.createRadialGradient(W*.72,H*.27,5,W*.72,H*.27,Math.max(W,H)*.48);rg.addColorStop(0,w.orb+'44');rg.addColorStop(.28,w.orb+'12');rg.addColorStop(1,'transparent');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
 clouds.forEach(c=>{ctx.fillStyle=w.glow+Math.round(c.a*255).toString(16).padStart(2,'0');ctx.beginPath();ctx.ellipse(c.x,c.y,c.r,c.r*.28,0,0,6.28);ctx.fill()});
 stars.forEach(s=>{let a=s.a*(.7+.3*Math.sin(s.p));ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,6.28);ctx.fill()});ctx.globalAlpha=1;
 // distant silhouettes per world
 ctx.fillStyle=w.pipe+'55';ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+60;x+=60){let y=H*.87-Math.sin(x*.018+world)*35-Math.sin(x*.047)*13;ctx.lineTo(x,y)}ctx.lineTo(W,H);ctx.fill();
}
function drawPipe(p){const w=worlds[world],topH=p.cy-p.gap/2,botY=p.cy+p.gap/2;ctx.save();ctx.shadowColor=w.glow;ctx.shadowBlur=18;ctx.fillStyle=w.pipe;
 roundedRect(p.x,-20,p.w,topH+20,18);ctx.fill();roundedRect(p.x,botY,p.w,H-botY+25,18);ctx.fill();ctx.shadowBlur=0;
 const grad=ctx.createLinearGradient(p.x,0,p.x+p.w,0);grad.addColorStop(0,w.edge+'22');grad.addColorStop(.48,w.edge+'08');grad.addColorStop(1,w.edge+'55');ctx.fillStyle=grad;roundedRect(p.x,-20,p.w,topH+20,18);ctx.fill();roundedRect(p.x,botY,p.w,H-botY+25,18);ctx.fill();
 ctx.strokeStyle=w.edge+'aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x+5,topH);ctx.lineTo(p.x+p.w-5,topH);ctx.moveTo(p.x+5,botY);ctx.lineTo(p.x+p.w-5,botY);ctx.stroke();
 // tech bands
 ctx.fillStyle=w.edge+'28';for(let y=36+p.seed%30;y<topH-20;y+=65)ctx.fillRect(p.x,y,p.w,3);for(let y=botY+30+p.seed%25;y<H;y+=65)ctx.fillRect(p.x,y,p.w,3);ctx.restore()}
function drawBird(){if(!bird)return;const w=worlds[world];ctx.save();bird.trail&&bird.trail.forEach((t,i)=>{ctx.globalAlpha=t.a*(1-i/bird.trail.length);ctx.fillStyle=w.glow;ctx.beginPath();ctx.arc(t.x,t.y,Math.max(1,5-i*.35),0,6.28);ctx.fill()});ctx.globalAlpha=1;ctx.translate(bird.x,bird.y);ctx.rotate(bird.rot);const s=bird.r/15;ctx.scale(s,s);ctx.shadowColor=w.glow;ctx.shadowBlur=22;
 const body=ctx.createLinearGradient(-15,-12,16,12);body.addColorStop(0,'#f4fbff');body.addColorStop(.55,w.glow);body.addColorStop(1,w.orb);ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,0,18,13,0,0,6.28);ctx.fill();
 ctx.shadowBlur=8;ctx.fillStyle='#0a1230';ctx.beginPath();ctx.ellipse(4,4,13,6,-.25,0,6.28);ctx.fill();ctx.save();ctx.rotate(-.55-bird.wing*.65);ctx.fillStyle=w.edge;ctx.beginPath();ctx.moveTo(-3,2);ctx.quadraticCurveTo(-17,4,-21,16);ctx.quadraticCurveTo(-7,13,7,5);ctx.fill();ctx.restore();
 ctx.fillStyle='#071022';ctx.beginPath();ctx.arc(8,-4,3.2,0,6.28);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(9,-5,1,0,6.28);ctx.fill();ctx.fillStyle=w.edge;ctx.beginPath();ctx.moveTo(16,-1);ctx.lineTo(25,2);ctx.lineTo(16,5);ctx.closePath();ctx.fill();ctx.restore()}
function drawPortal(){const t=portalT/2400,hx=W/2,hy=H/2,max=Math.max(W,H),w=worlds[world];ctx.save();ctx.translate(hx,hy);ctx.rotate(portalT*.0012);for(let i=0;i<14;i++){const r=(18+i*13)*(1+Math.sin(portalT*.003+i)*.04);ctx.strokeStyle=(i%2?w.glow:w.orb)+(Math.floor(130-i*5).toString(16));ctx.lineWidth=Math.max(1,9-i*.5);ctx.beginPath();ctx.arc(0,0,r,-1.2+i*.21,1.35+i*.23);ctx.stroke()}ctx.rotate(-portalT*.0026);for(let i=0;i<20;i++){let a=i*.314,r=55+(i%5)*24;ctx.strokeStyle=w.edge+'66';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.quadraticCurveTo(Math.cos(a+.7)*r*.45,Math.sin(a+.7)*r*.45,0,0);ctx.stroke()}ctx.shadowColor=w.glow;ctx.shadowBlur=55;ctx.fillStyle='#010107';ctx.beginPath();ctx.arc(0,0,clamp(18+t*42,18,64),0,6.28);ctx.fill();ctx.restore();ctx.fillStyle=`rgba(255,255,255,${Math.max(0,(t-.88)*5)})`;ctx.fillRect(0,0,W,H)}
function drawParticles(){particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fill()});ctx.globalAlpha=1}
function draw(){ctx.save();if(shake){ctx.translate(rand(-shake,shake),rand(-shake,shake))}drawSky();pipes.forEach(drawPipe);drawParticles();drawBird();if(state==='portal')drawPortal();ctx.restore();if(flash>0){ctx.fillStyle=`rgba(255,255,255,${flash*.45})`;ctx.fillRect(0,0,W,H)}}
function loop(now){const dt=last?now-last:16;last=now;update(dt);draw();requestAnimationFrame(loop)}
$('start-button').addEventListener('click',e=>{e.stopPropagation();start()});$('restart-button').addEventListener('click',e=>{e.stopPropagation();start()});
ui.sound.addEventListener('click',e=>{e.stopPropagation();soundOn=!soundOn;ui.sound.classList.toggle('muted',!soundOn);ui.sound.textContent=soundOn?'♪':'×'});
addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;flap()});addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();flap()}});addEventListener('resize',resize);resize();reset();requestAnimationFrame(loop);
})();

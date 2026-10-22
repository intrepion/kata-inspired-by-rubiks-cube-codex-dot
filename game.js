/* Original software-rendered 3D presentation. No remote assets or runtime dependencies. */
'use strict';
(()=>{
 const C=window.Cube, session=new window.CubeSession();
 const $=id=>document.getElementById(id), canvas=$('cube'), ctx=canvas.getContext('2d');
 const defaultView={yaw:-.57,pitch:.48};let view={...defaultView},mod='',letters=true,drag=null,polygons=[],lastUI='';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');session.duration=reduced.matches?1:180;
 reduced.addEventListener('change',()=>session.duration=reduced.matches?1:180);
 for(const [face,f] of Object.entries(C.FACES)){
  const button=document.createElement('button');button.dataset.face=face;button.style.setProperty('--face',f.color);button.setAttribute('aria-label',f.name+' clockwise turn');
  button.innerHTML=`<i></i><span>${face}</span><small>${{U:'Up',R:'Right',F:'Front',D:'Down',L:'Left',B:'Back'}[face]}</small>`;
  button.addEventListener('click',()=>request(face+mod));$('face-controls').append(button);
 }
 const layout={U:[2,1],L:[1,2],F:[2,2],R:[3,2],B:[4,2],D:[2,3]};
 for(const [face,at] of Object.entries(layout)){
  const el=document.createElement('div');el.className='net-face';el.id='net-'+face;el.style.gridColumn=at[0];el.style.gridRow=at[1];el.setAttribute('aria-label',C.FACES[face].name);
  for(let i=0;i<9;i++){const s=document.createElement('span');if(i===4)s.className='center';el.append(s);}$('net').append(el);
 }
 function request(move){if(!session.enqueue(move)){$('status').textContent='Turn queue full — let it catch up.';}updateUI(performance.now());}
 document.querySelectorAll('[data-mod]').forEach(b=>b.addEventListener('click',()=>{
  mod=b.dataset.mod;document.querySelectorAll('[data-mod]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  document.querySelectorAll('[data-face]').forEach(x=>{x.querySelector('span').textContent=x.dataset.face+mod.replace("'",'′');x.setAttribute('aria-label',C.FACES[x.dataset.face].name+' '+(mod==='2'?'double':mod? 'inverse':'clockwise')+' turn');});
 }));
 $('scramble').onclick=()=>{session.newScramble();lastUI='';updateUI(performance.now());};
 $('restart').onclick=()=>{session.restart();lastUI='';updateUI(performance.now());};
 $('reset').onclick=()=>{session.reset();lastUI='';updateUI(performance.now());};
 $('undo').onclick=()=>{session.undo();updateUI(performance.now());};
 $('home-view').onclick=()=>{view={...defaultView};};
 $('letters').onchange=e=>{letters=e.target.checked;lastUI='';};
 $('help').onclick=()=>$('help-dialog').showModal();
 const closeHelp=()=>$('help-dialog').close();$('close-help').onclick=closeHelp;$('play').onclick=closeHelp;
 $('help-dialog').addEventListener('click',e=>{if(e.target===$('help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeHelp();}});
 document.addEventListener('keydown',e=>{
  if($('help-dialog').open||e.ctrlKey||e.metaKey||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;
  const f=e.key.toUpperCase();
  if(Object.hasOwn(C.FACES,f)){e.preventDefault();if(!e.repeat)request(f+(e.altKey?'2':e.shiftKey?"'":mod));return;}
  if(f==='Z'){e.preventDefault();if(!e.repeat)session.undo();return;}
  if(e.key==='Home'){e.preventDefault();view={...defaultView};}
  const arrows={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,.12],ArrowDown:[0,-.12]};
  if(arrows[e.key]){e.preventDefault();view.yaw+=arrows[e.key][0];view.pitch=Math.max(-1.4,Math.min(1.4,view.pitch+arrows[e.key][1]));}
 });
 function spin(v,axis,a){const c=Math.cos(a),s=Math.sin(a),[x,y,z]=v;return axis===0?[x,y*c-z*s,y*s+z*c]:axis===1?[x*c+z*s,y,-x*s+z*c]:[x*c-y*s,x*s+y*c,z];}
 const camera=v=>spin(spin(v,1,view.yaw),0,view.pitch);
 const add=(a,b)=>a.map((x,i)=>x+b[i]);const mul=(v,n)=>v.map(x=>x*n);
 function draw(now){
  const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const scale=Math.min(w*.205,h*.205), center=[w/2,h*.43];
  const project=v=>{const p=camera(v);return [center[0]+p[0]*scale,center[1]-p[1]*scale,p[2]];};
  const gradient=ctx.createRadialGradient(w*.5,h*.85,1,w*.5,h*.85,scale*1.7);gradient.addColorStop(0,'#284a3930');gradient.addColorStop(1,'#284a3900');ctx.fillStyle=gradient;ctx.beginPath();ctx.ellipse(w*.5,h*.85,scale*1.7,scale*.32,0,0,Math.PI*2);ctx.fill();
  polygons=[];const faces=[];
  const active=session.active,m=active?C.parse(active.move):null;
  const progress=active?Math.max(0,Math.min(1,(now-active.start)/session.duration)):0;
  const angle=m?m.angle*(progress*progress*(3-2*progress)):0;
  for(const cubie of session.state){
   const moving=m&&cubie.p[m.axis]===m.sign;const transform=v=>moving?spin(v,m.axis,angle):v;
   for(const [face,f] of Object.entries(C.FACES)){
    const n=f.normal,normal=camera(transform(n));if(normal[2]<.001)continue;
    const u=f.axis===0?[0,1,0]:[1,0,0],v=f.axis===2?[0,1,0]:f.axis===1?[0,0,1]:[0,0,1];
    const base=add(mul(cubie.p,1.02),mul(n,.485));
    const points=size=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>project(transform(add(base,add(mul(u,a*size),mul(v,b*size))))));
    const sticker=cubie.stickers.find(s=>s.n.every((x,i)=>x===n[i]));
    faces.push({points:points(.48),inset:points(.408),depth:project(transform(base))[2],color:sticker?C.FACES[sticker.face].color:null,label:sticker?.face,face,center:project(transform(base)),light:normal[2],isCenter:cubie.stickers.length===1});
   }
  }
  faces.sort((a,b)=>a.depth-b.depth);
  const path=points=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();};
  for(const f of faces){
   path(f.points);ctx.fillStyle='#20312e';ctx.fill();ctx.strokeStyle='#142923';ctx.lineWidth=1;ctx.lineJoin='round';ctx.stroke();
   if(!f.color)continue;
   path(f.inset);ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='#ffffff40';ctx.lineWidth=1.3;ctx.stroke();
   ctx.fillStyle=`rgba(18,41,33,${(1-f.light)*.13})`;ctx.fill();
   if((letters||f.isCenter)&&f.light>.18){ctx.fillStyle=f.isCenter?'#203b38':'#203b3877';ctx.font=`${f.isCenter?'600':'400'} ${Math.max(9,scale*(f.isCenter?.24:.13))}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(f.label,f.center[0],f.center[1]);}
   polygons.push(f);
  }
 }
 function inside(x,y,points){let yes=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 $('stage').addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};$('stage').setPointerCapture(e.pointerId);$('stage').focus({preventScroll:true});});
 $('stage').addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)drag.moved=true;if(drag.moved){view.yaw+=dx*.008;view.pitch=Math.max(-1.4,Math.min(1.4,view.pitch+dy*.008));}drag.x=e.clientX;drag.y=e.clientY;});
 $('stage').addEventListener('pointerup',e=>{
  if(!drag||drag.id!==e.pointerId)return;const tap=!drag.moved;drag=null;
  if(tap&&!session.active&&!session.queue.length){const r=canvas.getBoundingClientRect();const hit=[...polygons].reverse().find(p=>inside(e.clientX-r.left,e.clientY-r.top,p.inset));if(hit)request(hit.face+(e.altKey?'2':e.shiftKey?"'":mod));}
 });
 $('stage').addEventListener('pointercancel',()=>drag=null);$('stage').addEventListener('lostpointercapture',()=>drag=null);
 function updateUI(now){
  const elapsed=session.elapsed(now),tenths=Math.floor(elapsed/100);$('timer').textContent=`${String(Math.floor(tenths/600)).padStart(2,'0')}:${String(Math.floor(tenths/10)%60).padStart(2,'0')}.${tenths%10}`;
  const key=[session.moves,session.history.join(','),session.active?.move,session.queue.length,session.scramble.join(','),session.complete,letters,session.assisted].join('|');if(key===lastUI)return;lastUI=key;
  $('moves').textContent=session.moves;
  $('status').textContent=session.complete?'Harmony restored. Beautifully done.':session.active?`Turning ${session.active.move.replace("'",'′')}…`:session.started!==null?'Find your next turn.':session.scramble.length?'Scrambled. Your first turn starts the clock.':'Ready to explore';
  $('queue').textContent=session.queue.length?`${session.queue.length} TURN${session.queue.length===1?'':'S'} QUEUED`:'DRAG TO ORBIT · TAP A FACE TO TURN';
  $('mode-label').textContent=session.assisted?'ASSISTED':session.scramble.length?'CHALLENGE':'FREE PLAY';
  $('undo').disabled=!session.history.length&&!session.active&&!session.queue.length;
  $('restart').disabled=!session.scramble.length;
  $('history').replaceChildren();if(!session.history.length){const s=document.createElement('span');s.className='empty';s.textContent='Every turn is a new possibility.';$('history').append(s);}else{session.history.forEach((m,i)=>{const s=document.createElement('span');s.className='move';s.textContent=m.replace("'",'′');s.title=`Turn ${i+1}: ${m}`;$('history').append(s);});$('history').scrollTop=$('history').scrollHeight;}
  $('scramble-text').textContent=session.scramble.length?session.scramble.join(' '):'Start a scramble to begin a timed challenge.';
  const net=C.facelets(session.state);for(const [f,colors] of Object.entries(net)){[...$('net-'+f).children].forEach((s,i)=>{s.style.setProperty('--sticker',C.FACES[colors[i]].color);s.textContent=letters||i===4?colors[i]:'';s.title=`${f} face, row ${Math.floor(i/3)+1}, column ${i%3+1}: ${C.FACES[colors[i]].name.split(' · ')[0]}`;});}
 }
 function frame(now){session.tick(now);draw(now);updateUI(now);requestAnimationFrame(frame);}requestAnimationFrame(frame);
 // Read-only diagnostic snapshot, used by acceptance tests; no game-state mutation API.
 window.chromatic=Object.freeze({snapshot:()=>({faces:C.facelets(session.state),legal:C.legality(session.state),solved:C.isSolved(session.state),active:session.active?.move??null,queued:session.queue.length,history:[...session.history],moves:session.moves,complete:session.complete,elapsed:session.elapsed(performance.now()),scramble:[...session.scramble],view:{...view}})});
})();

/* The catalogue uses its existing Track/edges and existing recipe render functions.
   Pausing freezes its clock; system reduced motion renders settled snapshots after input.
   Individual legacy recipes can still own timers, so this isn't an accessibility certificate. */
(() => {
  const c=window.CieoCatalogue,media=matchMedia('(prefers-reduced-motion:reduce)');
  let frame=null,dirty=true;
  function render(ms){
    frame=null;if(document.hidden)return;
    const dt=Math.min(.05,Math.max(0,(ms-clock.last)/1000));clock.last=ms;
    if(!c.paused&&!c.reduced)clock.t+=dt*clock.scale;
    else if(dirty)clock.t+=2;
    const t=clock.t;dirty=false;
    for(const fn of c.frames)fn(t);
    for(const a of A){
      if(!a.render||(a.el.hidden||!a.visible)&&c.active!==a)continue;
      try{a.render(t)}catch(error){a.el.dataset.error='true';console.error('Atom render:',a.id,error);a.render=null}
    }
    if(!c.paused&&!c.reduced||c.frames.size)frame=requestAnimationFrame(render);
  }
  c.invalidate=()=>{dirty=true;if(frame===null&&!document.hidden)frame=requestAnimationFrame(render)};
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null}else{clock.last=performance.now();c.invalidate()}});
  for(const event of ['click','input','keydown','pointerup','pointermove'])document.addEventListener(event,c.invalidate,{passive:true});
  media.addEventListener('change',()=>{c.reduced=media.matches;c.invalidate();updatePause()});
  const pause=document.getElementById('pause-motion');
  function updatePause(){pause.innerHTML=c.icon(c.paused||c.reduced?'play':'pause');pause.setAttribute('aria-pressed',String(c.paused||c.reduced));pause.setAttribute('aria-label',c.reduced?'Reduced motion is enabled':c.paused?'Resume previews':'Pause previews');document.getElementById('motion-speed').disabled=c.reduced}
  pause.onclick=()=>{if(c.reduced){c.announce('The catalogue follows the system Reduce Motion setting.');return}c.paused=!c.paused;updatePause();c.invalidate()};
  document.getElementById('motion-speed').onchange=e=>{const v=Number(e.target.value);clock.scale=[1,.25,.1].includes(v)?v:1};
  c.startRoute();updatePause();c.invalidate();
  window.CIEO_REVIEW={count:A.length,ids:A.map(a=>a.id),initAll:()=>{A.forEach(c.initAtom);c.invalidate()},errors:()=>A.filter(a=>a.el.dataset.error).map(a=>a.id)};
})();

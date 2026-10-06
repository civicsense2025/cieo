(() => {
  const L = window.CieoLibrary;
  L.visible = new Set(); L.errors = []; L.frame = 0; L.uiJobs = new Set();
  L.reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  L.isReduced = () => L.reducedQuery.matches;
  L.mount = a => {
    if (a.inited) return;
    a.inited = true;
    try { a.render = a.init(a.el.querySelector('.stage')); }
    catch (error) {
      L.errors.push({id:a.id,message:String(error)});
      const notice=document.createElement('p'); notice.className='lib-load-error'; notice.textContent='This recipe could not initialize. Its source is still available in Inspect.';
      a.el.querySelector('.stage').append(notice); a.render=null;
      console.error('Cieo recipe '+a.id,error);
    }
  };
  L.buildPreviews = () => {
    const board = document.getElementById('lib-grid');
    const order = [...A].sort((a,b) => {
      const ai=L.featured.indexOf(a.id), bi=L.featured.indexOf(b.id);
      return (ai<0?1000+A.indexOf(a):ai)-(bi<0?1000+A.indexOf(b):bi);
    });
    for (const a of order) {
      const el=document.createElement('article'); el.className='tile'+(a.wide?' wide':'')+(a.tall?' tall':'')+(a.big?' big':''); el.id=a.id;
      el.setAttribute('aria-label',a.name); a.el=el; a.inited=false; a.render=null;
      el.innerHTML=`<div class="lib-preview"><div class="lib-tile-toolbar"><button type="button" data-save="${L.escape(a.id)}" aria-label="Save ${L.escape(a.name)}" aria-pressed="false">${L.icon('star')}</button><button type="button" data-inspect="${L.escape(a.id)}" aria-label="Inspect ${L.escape(a.name)}">${L.icon('expand')}</button></div><div class="stage">${a.html}</div></div><footer class="lib-tile-footer"><button type="button" class="lib-tile-title" data-inspect="${L.escape(a.id)}"><strong>${L.escape(a.name)}</strong><small>${L.escape(a.cat)}</small></button><div class="lib-family-marks" aria-label="${L.escape(a.fam.map(f=>L.families[f]).join(', '))}">${a.fam.map(f=>`<span aria-hidden="true">${f}</span>`).join('')}</div></footer>`;
      board.append(el);
    }
    L.observer = new IntersectionObserver(entries=>{
      for(const entry of entries){const a=L.byId.get(entry.target.id); if(!a)continue;
        if(entry.isIntersecting&&!a.el.hidden){L.mount(a);L.visible.add(a);} else L.visible.delete(a);
      }
      L.wake();
    },{rootMargin:'160px'});
    A.forEach(a=>L.observer.observe(a.el));
  };
  const draw = (a,t) => {
    if (!a.render || a.el.hidden) return;
    try { a.render(t); }
    catch(error){ L.errors.push({id:a.id,message:String(error)});a.render=null;console.error('Cieo render '+a.id,error); }
  };
  let settleFrames = 0;
  const tick = ms => {
    L.frame=0;
    if(document.hidden)return;
    const staticMode=L.state.paused||L.isReduced();
    const dt=staticMode ? (settleFrames ? 2 : 0) : Math.min(.05,Math.max(0,(ms-clock.last)/1000))*clock.scale;
    clock.last=ms;clock.t+=dt;
    for(const a of L.visible)draw(a,clock.t);
    if(L.inspected&&!L.visible.has(L.inspected))draw(L.inspected,clock.t);
    for(const job of [...L.uiJobs]) if(job(clock.t,staticMode)!==true)L.uiJobs.delete(job);
    if(settleFrames)settleFrames--;
    if((!staticMode&&(L.visible.size||L.inspected))||settleFrames||L.uiJobs.size)L.frame=requestAnimationFrame(tick);
  };
  L.wake = () => {
    if(document.hidden)return;
    if(L.isReduced()||L.state.paused)settleFrames=2;
    if(!L.frame){clock.last=performance.now();L.frame=requestAnimationFrame(tick);}
  };
  L.animatePanel = element => {
    if(L.isReduced()){element.style.opacity='';element.style.transform='';return;}
    const value=new Track(0,S.soft);value.set(1);
    L.uiJobs.add((t,staticMode)=>{
      if(!element.open){element.style.opacity='';element.style.transform='';return false;}
      if(staticMode)value.jump(1);
      const p=clamp(value.at(t));element.style.opacity=String(.55+.45*p);element.style.transform=`translateY(${px((1-p)*16)})`;
      if(!value.prune(t)){element.style.opacity='';element.style.transform='';return false;}return true;
    });L.wake();
  };
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&L.frame){cancelAnimationFrame(L.frame);L.frame=0;}
    else L.wake();
  });
  L.reducedQuery.addEventListener('change',()=>L.wake());
  for(const event of ['click','input','change','keydown','pointerup'])document.addEventListener(event,L.wake,{passive:true});
})();

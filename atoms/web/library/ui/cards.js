(() => {
  const L = window.CieoLibrary;
  L.markError = (a,error) => {
    if (a.el.querySelector('.preview-error')) return;
    const message = document.createElement('p'); message.className='preview-error';
    message.textContent='This recipe could not render. Its source is still available in Details.';
    message.title=String(error); a.el.querySelector('.stage').append(message);
    a.el.dataset.previewError='true';
  };
  L.createCards = (atoms,saved,errors,playback,actions) => {
    const map = new WeakMap();
    const grid = document.getElementById('library-grid');
    const tones = ['lilac','mint','peach','blue','yellow','pink'];
    const ensure = a => {
      if (a.inited) return;
      a.inited=true;
      try { a.render=a.init(a.el.querySelector('.stage')); }
      catch (error) { a.render=null; errors.push({id:a.id,phase:'init',message:String(error)}); L.markError(a,error); }
      playback.request();
    };
    const observer = typeof IntersectionObserver==='function' ? new IntersectionObserver(entries => {
      for (const entry of entries) {
        const a=map.get(entry.target); if (!a) continue;
        a.visible=entry.isIntersecting;
        if (entry.isIntersecting && !a.el.hidden) ensure(a);
      }
      playback.request();
    },{rootMargin:'160px'}) : null;
    for (const [index,a] of atoms.entries()) {
      const el=document.createElement('article');
      el.className=`tile${a.wide?' wide':''}${a.tall?' tall':''}${a.big?' big':''}`;
      el.id=a.id; el.dataset.tone=tones[index%tones.length]; el.dataset.category=a.cat;
      el.setAttribute('aria-label',a.name);
      el.innerHTML='<div class="stage" role="group"></div><header><div><h3><button class="lib-card-title" type="button"></button></h3><div class="lib-card-meta"></div></div><div class="lib-card-actions"></div></header>';
      const stage=el.querySelector('.stage'); stage.setAttribute('aria-label',`${a.name} live preview`);
      // HTML comes only from the checked-in recipe registry, never search or URL input.
      stage.innerHTML=a.html;
      const title=el.querySelector('.lib-card-title'); title.textContent=a.name; title.onclick=() => actions.inspect(a,title);
      el.querySelector('.lib-card-meta').textContent=a.cat;
      const controls=el.querySelector('.lib-card-actions');
      const save=document.createElement('button'); save.type='button'; save.className='lib-icon-button lib-save'; save.innerHTML=L.icon('bookmark');
      save.setAttribute('aria-label',`Save ${a.name}`); save.setAttribute('aria-pressed',String(saved.has(a.id))); save.onclick=() => actions.save(a); controls.append(save);
      const inspect=document.createElement('button'); inspect.type='button'; inspect.className='lib-icon-button'; inspect.innerHTML=L.icon('expand'); inspect.setAttribute('aria-label',`Open ${a.name} details`); inspect.onclick=() => actions.inspect(a,inspect); controls.append(inspect);
      a.el=el; a.inited=false; a.render=null; a.visible=false;
      map.set(el,a); grid.append(el); observer?.observe(el);
    }
    if (!observer) atoms.forEach(a => { a.visible=true; ensure(a); });
    return {ensure,observe:a=>observer?.observe(a.el),unobserve:a=>observer?.unobserve(a.el),destroy:()=>observer?.disconnect()};
  };
})();

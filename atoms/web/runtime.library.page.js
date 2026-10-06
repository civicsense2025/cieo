/* Catalogue orchestration. Recipes and the original spring runtime remain the source of truth. */
(() => {
  const L=window.CieoLibrary;
  L.syncSaved=()=>{
    document.querySelectorAll('[data-save]').forEach(b=>{
      const saved=L.saved.has(b.dataset.save),a=L.byId.get(b.dataset.save);
      b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',`${saved?'Unsave':'Save'} ${a?.name||'atom'}`);
      if(b.id==='lib-inspector-save')b.innerHTML=L.icon('star')+(saved?'Saved':'Save atom');
    });
    document.querySelectorAll('[data-saved-count]').forEach(el=>el.textContent=L.saved.size);
  };
  L.render=()=>{
    let count=0;
    for(const a of A){const show=L.matches(a);a.el.hidden=!show;
      a.el.toggleAttribute('data-featured',L.state.collection==='explore');
      if(show)count++;else L.visible.delete(a);
    }
    const c=L.state.collection;
    document.getElementById('lib-title').textContent=c==='explore'?'Good things, in motion.':c==='all'?'Every little detail.':c==='saved'?'A few favorites.':c;
    document.getElementById('lib-description').textContent=c==='explore'?'A collection of small interactions that make a big difference.':c==='saved'?'The atoms saved in this browser. Ready when inspiration strikes.':`Live ${c==='all'?'components':c.toLowerCase()+' components'}. Click, type, drag, and make them your own.`;
    document.getElementById('lib-collections').hidden=c!=='explore';
    document.getElementById('lib-result-count').textContent=`${count} ${count===1?'atom':'atoms'}`;
    document.getElementById('lib-empty').hidden=count>0;
    document.getElementById('lib-empty-title').textContent=c==='saved'&&!L.saved.size?'Keep the good ones close.':'No atoms found.';
    document.getElementById('lib-empty-description').textContent=c==='saved'&&!L.saved.size?'Use the star on any atom to add it here.':'Try another search or clear the motion filter.';
    L.syncNavigation();L.syncSaved();L.wake();
    // Refresh intersection membership when existing nodes are unhidden, without remounting recipes.
    for(const a of A)if(!a.el.hidden)L.observer.observe(a.el);
  };
  L.readHash();L.buildNavigation();L.buildPreviews();L.wirePanels();L.wirePreferences();
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=L.icon(el.dataset.icon));
  const search=document.getElementById('lib-search');search.value=L.state.query;
  let searchTimer;
  search.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{
    L.state.query=search.value.slice(0,160);
    if(L.state.query&&L.state.collection==='explore')L.state.collection='all';
    L.writeHash();L.render();
  },100);});
  document.getElementById('lib-filters').addEventListener('click',e=>{
    const b=e.target.closest('[data-family]');if(!b)return;L.state.family=b.dataset.family;L.writeHash();L.render();
  });
  const pause=document.getElementById('lib-pause');
  pause.onclick=()=>{
    L.state.paused=!L.state.paused;pause.innerHTML=L.icon(L.state.paused?'play':'pause');pause.setAttribute('aria-pressed',String(L.state.paused));
    pause.setAttribute('aria-label',L.state.paused?'Resume animated previews':'Pause animated previews');
    pause.title=L.state.paused?'Resume previews':'Pause previews';L.wake();
  };
  document.getElementById('lib-speed').onchange=e=>{clock.scale=Number(e.target.value);L.wake();};
  document.getElementById('lib-clear').onclick=()=>L.navigate('all');
  document.addEventListener('keydown',e=>{
    if(document.querySelector('dialog[open]'))return;
    const editing=e.target.closest('input,textarea,select,[contenteditable="true"]');
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'||e.key==='/'&&!editing){e.preventDefault();search.focus();search.select();}
    if(e.key==='?'&&!editing){e.preventDefault();L.openDialog(document.getElementById('lib-shortcuts'),document.activeElement);}
    if(e.key==='Escape'&&document.activeElement===search){search.value='';L.state.query='';L.writeHash();L.render();search.blur();}
  });
  const restore=()=>{L.readHash();search.value=L.state.query;L.render();};
  addEventListener('popstate',restore);addEventListener('hashchange',restore);
  L.render();
  const linked=new URLSearchParams(location.hash.slice(1)).get('atom');
  if(linked&&L.byId.has(linked))requestAnimationFrame(()=>L.inspect(linked,document.getElementById('lib-title')));
  document.documentElement.dataset.libraryReady='true';
})();

(() => {
  const L=window.CieoLibrary;
  L.mount=atoms => {
    if (window.CieoCatalogue) throw new Error('The catalogue can only mount once.');
    const state={...L.validSettings(L.safeRead('cieo:catalogue:view:v2')),...L.route(location.hash,atoms)};
    state.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ids=new Set(atoms.map(a=>a.id)),stored=L.safeRead('cieo:catalogue:saved:v2');
    const saved=new Set(Array.isArray(stored)?stored.filter(id=>ids.has(id)):[]);
    if(ids.size!==atoms.length) throw new Error('Duplicate atom IDs in the source registry.');
    const errors=[],search=document.getElementById('library-search'),grid=document.getElementById('library-grid');
    let toastTimer=null,searchTimer=null,dialogs,nav,cards;
    const playback=L.createPlayback(atoms,state,errors);
    const announce=message => {
      const node=document.getElementById('library-announcement');node.textContent=message;node.dataset.visible='true';
      clearTimeout(toastTimer);toastTimer=setTimeout(()=>{node.dataset.visible='false';},3000);
    };
    const copy=async(text,message) => {
      try { await navigator.clipboard.writeText(text); announce(message); }
      catch {
        // The fallback stays inside an open modal's focus boundary and remains selectable.
        const host=document.querySelector('dialog[open]') || document.getElementById('library-main');
        host.querySelector('.lib-copy-fallback')?.remove();
        const field=document.createElement('textarea');field.className='lib-copy-fallback';field.value=text;field.readOnly=true;
        field.setAttribute('aria-label','Copy this text');host.append(field);field.focus();field.select();
        announce('Clipboard access is blocked. The text is selected for copying.');
      }
    };
    const persist=() => {
      const data={};for(const key of ['theme','accent','density','columns','backdrops','speed','sort'])data[key]=state[key];
      L.safeWrite('cieo:catalogue:view:v2',data);playback.request();
    };
    const route=() => {
      const p=new URLSearchParams();
      if(state.view==='category')p.set('category',state.category);
      else if(state.view==='collection')p.set('collection',state.category);
      else p.set('view',state.view);
      if(state.query.trim())p.set('q',state.query.trim());if(state.family!=='*')p.set('family',state.family);
      try {history.replaceState(null,'',`#${p}`);} catch { /* Restricted file viewers still work. */ }
    };
    const titleFor=() => {
      if(state.query.trim())return ['Search results',`Matching “${state.query.trim()}” across the library.`];
      if(state.view==='saved')return ['Your collection','The details worth coming back to.'];
      if(state.view==='all')return ['Everything, in motion.','The complete library. Pick something and try it.'];
      if(state.view==='category')return [state.category,'Every detail, live and ready to explore.'];
      if(state.view==='collection'){const c=L.collections.find(c=>c.key===state.category);return[c?.name||'Collection','A collection of small, considered interactions.'];}
      return ['The motion collection','Small details. A different feeling.'];
    };
    const rank=id => {const i=L.featured.indexOf(id);return i<0?1000:i;};
    const ordered=[...atoms].sort((a,b)=>rank(a.id)-rank(b.id));
    const render=() => {
      let count=0;
      let position=grid.firstElementChild;
      const list=state.sort==='name'?[...atoms].sort((a,b)=>a.name.localeCompare(b.name)):ordered;
      for(const a of list){const show=L.matches(a,state,saved);if(show)count++;
        if(a.el.closest('#component-preview'))continue;
        a.el.hidden=!show;
        while(position?.classList.contains('lib-stage-placeholder')) position=position.nextElementSibling;
        if(position!==a.el) grid.insertBefore(a.el,position);
        position=a.el.nextElementSibling;
      }
      const [title,description]=titleFor();document.getElementById('library-title').textContent=title;
      document.getElementById('library-description').textContent=description;
      document.getElementById('breadcrumb-current').textContent=state.view==='featured'?'Discover':state.view==='all'?'Everything':state.view==='saved'?'Saved':state.category;
      document.getElementById('library-spotlights').hidden=state.view!=='featured'||!!state.query.trim();
      document.getElementById('result-count').textContent=`${count} components`;
      document.getElementById('library-empty').hidden=count!==0;
      document.getElementById('empty-description').textContent=state.view==='saved'&&!state.query?'Save a component using its bookmark button. It will stay here on this device.':'Try a different phrase or clear the motion filter.';
      document.querySelectorAll('.lib-family').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===state.family)));
      nav?.update();playback.request();
    };
    const pick=(view,category='') => {state.view=view;state.category=category;state.query='';state.family='*';search.value='';dialogs?.closeNavigation();render();route();window.scrollTo({top:0,behavior:'instant'});};
    const save=a => {
      if(saved.has(a.id))saved.delete(a.id);else saved.add(a.id);
      const b=a.el.querySelector('.lib-save');b.setAttribute('aria-pressed',String(saved.has(a.id)));b.setAttribute('aria-label',`${saved.has(a.id)?'Unsave':'Save'} ${a.name}`);
      const ok=L.safeWrite('cieo:catalogue:saved:v2',[...saved]);
      announce(`${saved.has(a.id)?'Saved':'Removed'}${ok?'':' for this session only'}`);
      dialogs.updateSaved();render();
    };
    cards=L.createCards(atoms,saved,errors,playback,{save,inspect:(a,trigger)=>dialogs.inspect(a,trigger)});
    dialogs=L.createDialogs(state,playback,cards,{copy,save,isSaved:id=>saved.has(id),refresh:render});
    nav=L.createNavigation(atoms,state,saved,pick);
    const settings=L.createSettings(state,persist);
    for(const [key,label] of Object.entries(L.families)){
      const b=document.createElement('button');b.type='button';b.className='lib-family';b.dataset.family=key;b.textContent=label;
      b.onclick=()=>{state.family=key;render();route();};document.getElementById('family-filter').append(b);
    }
    L.playbackChanged=()=>{
      const b=document.getElementById('playback-button');b.innerHTML=L.icon(state.paused?'play':'pause');b.setAttribute('aria-pressed',String(state.paused));
      b.setAttribute('aria-label',`${state.paused?'Play':'Pause'} live previews`);b.title=b.getAttribute('aria-label');document.getElementById('playback-note').hidden=!state.paused;
    };
    document.addEventListener('click',event=>{
      const b=event.target.closest('[data-lib-action]');if(!b)return;
      const action=b.dataset.libAction;
      if(action==='all'||action==='reset-filters')pick('all');
      if(action==='navigation'||action==='categories')dialogs.navigation(b,action==='categories');
      if(action==='settings')dialogs.settings(b);
      if(action==='help')dialogs.help(b);
      if(action==='reset-view')settings.reset();
      if(action==='playback'){playback.pause(!state.paused);L.playbackChanged();announce(state.paused?'Previews paused':'Live previews playing');}
    });
    search.value=state.query;
    search.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.query=search.value.slice(0,240);state.view='all';state.category='';render();route();},100);});
    document.getElementById('library-sort').value=state.sort;
    document.getElementById('library-sort').onchange=e=>{state.sort=e.target.value;render();persist();};
    document.addEventListener('keydown',e=>{
      const editable=e.target.closest('input,textarea,select,[contenteditable="true"]');
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){if(!document.querySelector('dialog[open]')){e.preventDefault();search.focus();search.select();}return;}
      if(!editable&&!document.querySelector('dialog[open]')&&e.key==='/'){e.preventDefault();search.focus();}
      if(!editable&&e.key==='?'&&!document.querySelector('dialog[open]')){e.preventDefault();dialogs.help(document.activeElement);}
    });
    window.addEventListener('hashchange',()=>{
      document.querySelectorAll('dialog[open]').forEach(d=>d.close());
      const next={view:'featured',category:'',query:'',family:'*',...L.route(location.hash,atoms)};
      Object.assign(state,next);search.value=state.query;settings.apply();
      requestAnimationFrame(()=>{render();if(next.atom){const a=atoms.find(a=>a.id===next.atom);dialogs.inspect(a,a.el.querySelector('button'));}});
    });
    L.paintIcons(document);L.playbackChanged();render();
    document.getElementById('library-total').textContent=`${atoms.length} live motion atoms`;
    document.getElementById('library-loading').hidden=true;
    document.title='Cieo — Motion library';
    window.CieoCatalogue={atoms,errors,get state(){return {...state,saved:[...saved]};},ensure:cards.ensure,select:pick};
    window.addEventListener('pagehide',e=>{if(!e.persisted){cards.destroy();playback.destroy();clearTimeout(toastTimer);clearTimeout(searchTimer);}},{once:true});
    if(state.atom){const a=atoms.find(a=>a.id===state.atom);requestAnimationFrame(()=>dialogs.inspect(a,a.el.querySelector('button')));}
  };
})();

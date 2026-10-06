(() => {
  const L=window.CieoLibrary;
  L.createDialogs=(state,playback,cards,actions) => {
    const detail=document.getElementById('component-dialog');
    const navigation=document.getElementById('navigation-dialog');
    const home=document.querySelector('.lib-shell');
    const sidebar=document.getElementById('library-sidebar');
    let selected=null,placeholder=null,returnFocus=null,navNext=null,wasHidden=false;
    const open=(dialog,trigger) => {
      if (dialog.open) return;
      returnFocus=trigger || document.activeElement;
      dialog.showModal(); playback.animate(dialog);
    };
    const close=dialog => { if (dialog.open) dialog.close(); };
    const restoreDetail=() => {
      if (!selected) return;
      placeholder.replaceWith(selected.el); selected.el.hidden=wasHidden; cards.observe(selected); selected.visible=true;
      selected=null; placeholder=null; playback.focus(null); actions.refresh();
      requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
    };
    for (const dialog of document.querySelectorAll('.lib-dialog')) {
      dialog.querySelectorAll('[data-lib-close]').forEach(b=>b.onclick=()=>close(dialog));
      dialog.addEventListener('click',e=>{
        if (e.target!==dialog) return;
        const r=dialog.getBoundingClientRect();
        if (e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) close(dialog);
      });
      dialog.addEventListener('close',()=>{
        dialog.style.removeProperty('transform'); dialog.style.removeProperty('opacity');
        if (dialog===detail) restoreDetail();
        if (dialog===navigation) { home.insertBefore(sidebar,navNext); navNext=null; }
        if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus({preventScroll:true});
      });
    }
    document.getElementById('copy-recipe').onclick=()=>selected && actions.copy(selected.api,'Recipe copied');
    document.getElementById('copy-component-link').onclick=()=>{
      if (!selected) return;
      const url=new URL(location.href); url.hash=`atom=${encodeURIComponent(selected.id)}`;
      actions.copy(url.href,'Component link copied');
    };
    document.getElementById('detail-save').onclick=()=>selected && actions.save(selected);
    const updateSaved=()=>{
      if (!selected) return;
      const button=document.getElementById('detail-save');
      const value=actions.isSaved(selected.id); button.setAttribute('aria-pressed',String(value));
      button.setAttribute('aria-label',`${value?'Unsave':'Save'} ${selected.name}`);
      button.classList.toggle('lib-save',value);
    };
    const inspect=(a,trigger) => {
      if (selected) return;
      selected=a; wasHidden=a.el.hidden; a.el.hidden=false; placeholder=document.createElement('div'); placeholder.className='lib-stage-placeholder';
      const r=a.el.getBoundingClientRect(); placeholder.style.height=`${r.height}px`; placeholder.style.gridColumn=a.wide?'span 2':'';
      placeholder.textContent='Open in detail view'; placeholder.dataset.tone=a.el.dataset.tone;
      cards.unobserve(a); a.el.replaceWith(placeholder);
      const preview=document.getElementById('component-preview'); preview.dataset.tone=a.el.dataset.tone; preview.append(a.el);
      document.getElementById('component-title').textContent=a.name;
      document.getElementById('component-category').textContent=a.cat;
      document.getElementById('component-description').textContent=a.desc;
      document.getElementById('component-code').textContent=a.api;
      const families=document.getElementById('component-families'); families.replaceChildren();
      a.fam.forEach(f=>{const tag=document.createElement('span');tag.textContent=L.families[f];families.append(tag);});
      const source=document.getElementById('component-source');
      const valid=typeof a.sourceFile==='string' && /^blocks\/[\w.-]+\.js$/.test(a.sourceFile);
      source.hidden=!valid;
      if (valid) source.href=`https://github.com/civicsense2025/cieo/blob/work/catalogue-visual-refinement/atoms/web/${a.sourceFile}`;
      open(detail,trigger); cards.ensure(a); playback.focus(a); updateSaved();
      requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
    };
    const showNavigation=(trigger,expand=false) => {
      navNext=sidebar.nextSibling; document.getElementById('mobile-navigation').append(sidebar);
      if (expand) sidebar.querySelectorAll('details').forEach(d=>d.open=true);
      open(navigation,trigger);
    };
    const mq=matchMedia('(min-width:880px)');
    mq.addEventListener('change',()=>{ if(mq.matches) close(navigation); });
    return {inspect,updateSaved,closeNavigation:()=>close(navigation),navigation:showNavigation,settings:trigger=>open(document.getElementById('settings-dialog'),trigger),help:trigger=>open(document.getElementById('help-dialog'),trigger)};
  };
})();

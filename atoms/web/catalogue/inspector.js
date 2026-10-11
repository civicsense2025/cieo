(() => {
  const c=window.CieoCatalogue,dialog=document.getElementById('inspect-dialog');
  const preview=document.getElementById('inspect-preview');let held=null,placeholder=null,opener=null;
  // Move, never clone, the existing stage. IDs, focus handlers and spring state survive.
  c.inspect=(id,trigger)=>{
    const a=c.byId.get(id);if(!a)return;
    if(held)restore();opener=trigger||a.el.querySelector('[data-inspect]');held=a;c.active=a;
    const shell=a.el.querySelector('.stage-shell');placeholder=document.createElement('div');placeholder.className='ui-preview-placeholder';placeholder.setAttribute('aria-hidden','true');placeholder.style.height=`${shell.offsetHeight}px`;shell.before(placeholder);
    const wrapper=document.createElement('div');wrapper.className=a.el.className;wrapper.dataset.tone=a.el.dataset.tone;wrapper.append(shell);preview.append(wrapper);
    document.getElementById('inspect-title').textContent=a.name;
    document.getElementById('inspect-description').textContent=a.desc;
    document.getElementById('inspect-code').textContent=a.api;
    document.getElementById('inspect-families').replaceChildren(...a.fam.map(f=>{const span=document.createElement('span');span.textContent=c.familyNames[f];return span}));
    const source=document.getElementById('inspect-source'),file=a.file;
    source.hidden=!file;if(file)source.href='https://github.com/civicsense2025/cieo/blob/design/catalogue-ui-refinement/atoms/web/'+file;
    if(!dialog.open)c.openDialog(dialog,trigger);
    c.initAtom(a);c.updateInspectorSave();c.invalidate?.();
    // Components which measure once on setup also need their normal resize pathway.
    requestAnimationFrame(()=>dispatchEvent(new Event('resize')));
  };
  function restore(){
    if(!held)return;const shell=preview.querySelector('.stage-shell');if(shell&&placeholder)placeholder.replaceWith(shell);
    preview.replaceChildren();held=null;placeholder=null;c.active=null;dispatchEvent(new Event('resize'));
  }
  dialog.addEventListener('close',()=>{restore();if(opener?.isConnected&&!opener.closest('[hidden]'))opener.focus({preventScroll:true})});
  c.updateInspectorSave=()=>{if(!held)return;const b=document.getElementById('inspect-save'),saved=c.favorites.has(held.id);b.textContent=saved?'Saved':'Save';b.setAttribute('aria-pressed',String(saved))};
  document.getElementById('inspect-save').onclick=()=>{if(held)c.toggleSave(held.id)};
  document.getElementById('copy-recipe').onclick=async()=>{
    if(!held)return;const text=held.api;
    try{await navigator.clipboard.writeText(text);c.announce('Recipe copied.')}catch{
      const selection=getSelection(),range=document.createRange();range.selectNodeContents(document.getElementById('inspect-code'));selection.removeAllRanges();selection.addRange(range);c.announce('Select and copy the highlighted recipe.');
    }
  };
})();

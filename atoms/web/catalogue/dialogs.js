(() => {
  const c=window.CieoCatalogue,openers=new WeakMap();
  c.openDialog=(dialog,trigger)=>{
    if(dialog.open)return;document.querySelectorAll('.ui-dialog[open]').forEach(d=>d.close());
    openers.set(dialog,trigger||document.activeElement);dialog.showModal();document.body.style.overflow='hidden';
    const y=new Track(c.reduced?0:16,S.base);y.set(0);
    const render=t=>{dialog.style.transform=`translateY(${px(y.at(t))})`;if(!y.prune(t)){dialog.style.transform='';c.frames.delete(render)}};
    c.frames.add(render);c.invalidate?.();
  };
  document.addEventListener('click',e=>{
    const open=e.target.closest('[data-open]'),close=e.target.closest('[data-close]');
    if(open)c.openDialog(document.getElementById(open.dataset.open),open);
    if(close)close.closest('dialog').close();
  });
  document.querySelectorAll('.ui-dialog').forEach(dialog=>{
    let backdropDown=false;
    dialog.addEventListener('keydown',e=>{
      if(e.key!=='Tab'||e.defaultPrevented)return;
      const focusable=[...dialog.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('[inert]'));
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
    });
    dialog.addEventListener('pointerdown',e=>{backdropDown=e.target===dialog&&outside(e,dialog)});
    dialog.addEventListener('pointerup',e=>{if(backdropDown&&e.target===dialog&&outside(e,dialog))dialog.close();backdropDown=false});
    dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';const trigger=openers.get(dialog);if(trigger?.isConnected)trigger.focus({preventScroll:true})});
  });
  function outside(e,el){const r=el.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom}
  addEventListener('keydown',e=>{
    const typing=e.target.closest('input,textarea,select,[contenteditable=true]');
    if((e.key==='/'&&!typing||e.key.toLowerCase()==='k'&&(e.metaKey||e.ctrlKey))&&!document.querySelector('dialog[open]')){e.preventDefault();document.getElementById('atom-search').focus()}
  });
})();

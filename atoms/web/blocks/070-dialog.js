

atom({ id:'dialog', cat:'Overlays', name:'Confirm dialog', block:'Dialog / Alert dialog primitive', fam:['X','M'], tall:true,
  html:`<div class="card col" style="width:min(320px,calc(100% - 48px));padding:16px"><div class="rw"></div></div><div class="scr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none"></div><div class="dl card" role="alertdialog" aria-modal="false" aria-labelledby="dl-t" style="position:absolute;left:50%;top:50%;width:min(320px,calc(100% - 32px));padding:24px;visibility:hidden"><b id="dl-t" style="display:block;font-size:16px">Delete “About”?</b><p class="small muted" style="margin:16px 0 24px;line-height:1.7">The page and its 3 drafts will be removed. Links to it will show a not-found page.</p><div class="row" style="justify-content:flex-end"><button class="btn cn">Cancel</button><button class="btn dd" style="background:var(--danger);border-color:var(--danger);color:#fff">Delete page</button></div></div><button class="btn rs" style="position:absolute;top:16px;right:16px">Reset</button>`,
  desc:'The scrim fades while the dialog rises 8px from 96% scale. Confirming closes the dialog first, then the deleted row collapses, so the change happens where you are looking.',
  api:'dlg.o.set(1); on confirm: dlg.o.set(0, S.snap); row.h.set(0, S.base, t + 0.15)',
  init(st){
    const rw = $(st,'.rw'), scr = $(st,'.scr'), dl = $(st,'.dl'), N = ['Home','About','Journal'];
    const rows = N.map(n => { const r = document.createElement('div'); r.style.overflow = 'hidden'; r.innerHTML = `<div class="row" style="justify-content:space-between;padding:8px 16px;min-height:48px"><span class="small" style="font-weight:500">${n}</span>${n === 'About' ? '<button class="btn del" style="color:var(--danger);padding:8px 16px">Delete</button>' : '<span class="small muted">Published</span>'}</div>`; rw.appendChild(r); return { r, in:r.firstChild, h:new Track(1), o:new Track(1) }; });
    const o = new Track(0), ab = rows[1];
    const set=v=>{openSet(o,v);if(v)setTimeout(()=>$(dl,'.cn').focus(),0);else $(st,'.del').focus()};dl.addEventListener('keydown',ev=>{if(ev.key==='Tab'){ev.preventDefault();const next=document.activeElement===$(dl,'.cn')?$(dl,'.dd'):$(dl,'.cn');next.focus()}});
    $(st,'.del').onclick = () => set(true); $(dl,'.cn').onclick = () => set(false); scr.onclick = () => set(false);
    $(dl,'.dd').onclick = () => { set(false); const t0 = now(); ab.o.set(0, S.snap, t0 + .12); ab.h.set(0, S.base, t0 + .12 + EXIT); };
    $(st,'.rs').onclick = () => { ab.h.set(1); ab.o.set(1, S.base, now() + .12); };
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape') set(false); });
    return t => { const p = clamp(o.at(t)); scr.style.opacity = (p*.35).toFixed(3); scr.style.pointerEvents = p > .5 ? 'auto' : 'none';
      dl.style.opacity = p.toFixed(3); dl.style.visibility = p < .01 ? 'hidden' : 'visible'; dl.style.transform = `translate(-50%, calc(-50% + ${px((1-p)*8)})) scale(${(.96+.04*p).toFixed(4)})`; dl.style.pointerEvents = p > .5 ? 'auto' : 'none';
      rows.forEach(r => { r.r.style.height = px(clamp(r.h.at(t))*r.in.offsetHeight); fade(r.in, r.o.at(t), null); }); };
  }});
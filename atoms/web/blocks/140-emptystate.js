

atom({ id:'emptystate', cat:'Guidance', name:'Empty state', block:'entry-list, collection, postlist', fam:['X','S'], tall:true,
  html:`<div class="card" style="position:relative;width:min(320px,90%);height:260px;overflow:hidden"><div class="ls col" style="gap:0"></div><div class="es col" style="position:absolute;inset:0;align-items:center;justify-content:center;gap:8px;text-align:center;padding:20px;visibility:hidden"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18v13H3zM3 7l2-4h14l2 4M9 12h6"/></svg><b>Inbox zero</b><span class="small muted">New messages from readers will show up here.</span><button class="btn ink sm" style="margin-top:4px">Load sample messages</button></div></div><button class="btn ca" style="position:absolute;top:10px;right:12px">Archive all</button>`,
  desc:'Archiving clears rows top to bottom, 40ms apart. Only after the last one leaves does the empty state rise in, so the two never share the screen. Loading samples reverses it.',
  api:'rows[i].o.set(0, S.snap, t + i·0.04)   empty.o.set(1, S.base, t + n·0.04 + 0.1)',
  init(st){
    const ls = $(st,'.ls'), es = $(st,'.es'), M = ['Maya · Draft is ready','Theo · Pricing table','Billing · INV-0042 paid','Ada · New subscriber','Jonas · Thursday works'];
    const rows = M.map(m => { const r = document.createElement('div'); r.style.cssText = 'padding:12px 14px;border-bottom:1px solid var(--line-soft)'; r.innerHTML = `<span class="small">${m}</span>`; ls.appendChild(r); return { r, o:new Track(1) }; });
    const eo = new Track(0);
    $(st,'.ca').onclick = () => { const t0 = now(); rows.forEach((x,i) => x.o.set(0, S.snap, t0 + i*.04)); eo.set(1, S.base, t0 + rows.length*.04 + .1); };
    $(st,'.sm').onclick = () => { const t0 = now(); eo.set(0, S.snap); rows.forEach((x,i) => x.o.set(1, S.base, t0 + .12 + i*.04)); };
    const cust = document.createElement('div'); cust.className = 'row small muted'; cust.style.cssText += 'gap:6px;align-items:center;margin-top:8px'; cust.innerHTML = `<span>Rows:</span>`; st.appendChild(cust);
    rows.forEach((x,i) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'padding:2px 8px'; b.textContent = i + 1; b.onclick = () => { const t0 = now(); const vis = clamp(x.o.at(t0)) > .5; x.o.set(vis ? 0 : 1, vis ? S.snap : S.base, t0); const any = rows.some((y,j) => j === i ? !vis : clamp(y.o.at(t0)) > .5); eo.set(any ? 0 : 1, any ? S.snap : S.base, t0 + (vis ? 0 : .12)); }; cust.appendChild(b); });
    const load = document.createElement('button'); load.className = 'btn'; load.style.cssText += 'padding:2px 8px'; load.textContent = 'Replay end-state'; load.onclick = () => $(st,'.ca').onclick(); cust.appendChild(load);
    return t => { let last = -1; rows.forEach((x,i) => { if (clamp(x.o.at(t)) > .5) last = i; });
      rows.forEach((x,i) => { fade(x.r, x.o.at(t), (1 - clamp(x.o.at(t)))*-6); x.r.style.borderBottom = i === last ? '0' : '1px solid var(--line-soft)'; });
      const e = clamp(eo.at(t)); fade(es, e, (1 - e)*10); es.style.visibility = e < .01 ? 'hidden' : 'visible'; es.style.pointerEvents = e > .5 ? 'auto' : 'none'; };
  }});
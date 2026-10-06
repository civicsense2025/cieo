

atom({ id:'acceptrail', cat:'Writing', name:'Tracked-changes rail', block:'tracked changes, rail', fam:['M','S','X'], tall:true,
  html:`<div class="col" style="width:min(340px,90%);gap:10px"><div class="row" style="justify-content:space-between;align-items:center"><div class="row small" style="gap:8px;align-items:center"><b>Accepted</b><span class="d" style="font-weight:700"></span></div><button class="btn all">Accept all</button></div><div class="rows col" style="gap:6px"></div></div><div class="hint">Accept clears each row</div>`,
  desc:'Accepting fades a row out over 100ms, then its height springs shut. The accepted count rolls up. Accept all clears every row in order.',
  api:'row.o→0; row.h→0 at t+0.1,S.base   count.set(n)   REDUCE: jump',
  init(st){
    const host = $(st,'.rows'), d = new Digits($(st,'.d'), 1); let done = 0, rows = []; d.set(0, true);
    const TX = ['early → first-day', 'shop → store', 'soon → Thursday'];
    TX.forEach((s,i) => { const w = document.createElement('div'); w.style.cssText = 'overflow:hidden'; w.innerHTML = '<div class="card small row" style="justify-content:space-between;align-items:center"><span>' + s + '</span><button class="btn ok">Accept</button></div>'; host.appendChild(w);
      const H = 46, o = new Track(1), h = new Track(H); const r = { w, o, h, live:true }; rows.push(r);
      w.querySelector('.ok').onclick = () => accept(r); });
    const accept = r => { if (!r.live) return; r.live = false; done++; d.set(done, REDUCE);
      if (REDUCE){ r.o.jump(0); r.h.jump(0); } else { r.o.set(0, S.snap); setTimeout(() => r.h.set(0, S.base), 100); } };
    $(st,'.all').onclick = () => rows.forEach((r,i) => setTimeout(() => accept(r), REDUCE ? 0 : i*60));
    return t => { rows.forEach(r => { r.w.style.height = px(Math.max(0, r.h.at(t))); r.w.style.opacity = clamp(r.o.at(t)).toFixed(3); }); d.render(t); };
  }});

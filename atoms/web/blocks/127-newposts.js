

atom({ id:'newposts', cat:'Social', name:'New posts pill', block:'postlist, entry-list', fam:['X','M','T'], tall:true,
  html:`<div class="fd card" style="position:relative;width:min(320px,90%);height:290px;overflow:hidden"><div class="ls col" style="gap:0"></div><button class="pl btn ink" style="position:absolute;left:50%;top:10px;border-radius:999px;display:flex;gap:6px;align-items:center;visibility:hidden">${ic(I.up,13,2.5)}<span class="c num"></span><span>new posts</span></button></div>`,
  desc:'New posts gather quietly every few seconds and a pill drops in from the top with a rolling count. Clicking it inserts them at the top, each opening on a height spring, and the pill leaves.',
  api:'pending += 1 every 3.5s; pill.o.set(pending > 0)   on click: row.h.set(1, t + i·0.05)',
  init(st){
    const ls = $(st,'.ls'), pl = $(st,'.pl'), d = new Digits($(st,'.c'), 2), o = new Track(0); let pending = [], next = 3.5, k = 0, items = [];
    const P = ['Fog notes from the mill','The yearly toggle, explained','Three CSS habits we kept','A smaller homepage','Why we sunset comments','Harbor at 6am'];
    const row = (txt, open) => { const r = document.createElement('div'); r.style.overflow = 'hidden'; r.innerHTML = `<div style="padding:12px 14px;border-bottom:1px solid var(--line-soft)"><b class="small" style="display:block">${txt}</b><span class="small muted">just now</span></div>`; ls.prepend(r); const it = { r, h:new Track(open ? 1 : 0) }; items.unshift(it); if (items.length > 8) items.pop().r.remove(); return it; };
    ['A smaller homepage','On member pricing','Notes from the river path','Three CSS habits'].reverse().forEach(s => row(s, true));
    d.set('1', true);
    pl.onclick = () => { const t0 = now(); pending.forEach((s,i) => row(s, false).h.set(1, S.base, t0 + .1 + i*.05)); pending = []; o.set(0, S.snap); ls.parentNode.scrollTop = 0; };
    return t => { if (t >= next){ next = t + 3.5; pending.push(P[k++ % P.length]); d.set(String(Math.min(99, pending.length))); o.set(1); }
      const p = clamp(o.at(t)); pl.style.opacity = p.toFixed(3); pl.style.visibility = p < .01 ? 'hidden' : 'visible'; pl.style.transform = `translate(-50%, ${px((1 - p)*-16)})`; pl.style.pointerEvents = p > .5 ? 'auto' : 'none'; d.render(t);
      items.forEach(it => { const h = clamp(it.h.at(t)); it.r.style.height = px(h*size(it.r.firstChild).h); it.r.firstChild.style.opacity = h.toFixed(3); }); };
  }});
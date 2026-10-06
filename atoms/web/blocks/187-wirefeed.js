

atom({ id:'wirefeed', cat:'Writing', name:'Wire-feed ticker', block:'wire feed, entry-list', fam:['M','S','X'],
  html:`<div class="col" style="width:min(340px,90%);gap:10px"><div class="row" style="justify-content:space-between;align-items:center"><div class="row small" style="gap:8px;align-items:center"><b>Wires</b><span class="bd" style="height:20px;min-width:20px;padding:0 6px;border-radius:10px;background:var(--ink);color:var(--card);font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center"><span class="d"></span></span></div><div class="row" style="gap:6px"><button class="btn nw">New wire</button><button class="btn ps">Pause</button></div></div><div class="feed col" style="gap:6px;min-height:158px"></div></div><div class="hint">New wires push the stack</div>`,
  desc:'New wires slide in at the top and push older wires down, each one following 60ms after the last. The badge count rolls to the new total. Pause stops the feed.',
  api:'wire.y.set(0,S.base,t+i*0.06); count.set(n)   pause: timer.stop   REDUCE: jump',
  init(st){
    const feed = $(st,'.feed'), d = new Digits($(st,'.d'), 2); let n = 0, rows = [], paused = false;
    d.set(0, true);
    const add = () => { n++; d.set(n, REDUCE); const el = document.createElement('div'); el.className = 'card small'; el.style.cssText += ';padding:8px 10px;overflow:hidden'; el.innerHTML = '<b>Wire ' + n + '</b> <span class="muted">filed just now</span>'; feed.prepend(el);
      const r = { d:el, y:new Track(-46), o:new Track(0) }; r.y.jump(-46); r.o.jump(0); rows.unshift(r); if (rows.length > 4) rows.pop().d.remove();
      const t0 = now(); rows.forEach((x,i) => { if (REDUCE){ x.y.jump(0); x.o.jump(1); } else { x.y.set(0, S.base, t0 + i*.06); x.o.set(1, S.base, t0 + i*.06); } }); };
    $(st,'.nw').onclick = add; const ps = $(st,'.ps'); ps.onclick = () => { paused = !paused; ps.textContent = paused ? 'Resume' : 'Pause'; };
    const timer = setInterval(() => { if (!paused && document.body.contains(st)) add(); }, 2600); add(); add();
    return t => { rows.forEach(r => { r.d.style.transform = `translateY(${r.y.at(t).toFixed(2)}px)`; r.d.style.opacity = clamp(r.o.at(t)).toFixed(3); }); d.render(t); };
  }});

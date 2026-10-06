atom({ id:'crawlprog', cat:'SEO', name:'Crawl progress', block:'seo crawl, progress', fam:['T','S','X'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Crawling 1,248 pages</b><div class="row" style="gap:8px;align-items:baseline"><span class="dg num" style="font-size:30px;font-weight:600;letter-spacing:-.02em;line-height:1.2"></span><span class="small muted" style="font-size:12.5px">pages crawled</span><span style="flex:1"></span><span class="st small" style="position:relative;display:inline-flex;min-width:110px;height:20px;justify-content:flex-end;font-size:13px"></span></div><div style="height:8px;border-radius:4px;background:var(--raised);overflow:hidden"><div class="fl" style="height:100%;width:0;border-radius:4px;background:var(--accent)"></div></div><div class="lg card" style="padding:12px 14px;display:flex;flex-direction:column;gap:0;min-height:96px"></div><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="vb" checked> verbose log</label></div></div><button class="btn go" style="position:absolute;top:10px;right:12px;min-height:32px">Start crawl</button>`,
  desc:'The counter rides the lazy spring toward 90%, creeps there, then snaps to 100% with a success tint. Each log line swaps in as its batch lands, and the status holds on the terminal complete state.',
  api:'n.set(1123, lazy) then n.set(1248, snap) bar same · log.swap.to(i) per batch',
  init(st){
    const fl = $(st,'.fl'), lg = $(st,'.lg'), vb = $(st,'.vb'), stb = $(st,'.st');
    const S0 = ['Found 312 pages', 'Found 804 pages', 'Hit 90% — rendering JS', 'Complete ✓'];
    const L = S0.map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-end'; e.style.fontSize = '13px'; e.textContent = s; if (i === 3) e.style.color = 'var(--success)'; stb.appendChild(e); return e; });
    const dg = new Digits($(st,'.dg'), 4); dg.set('0', true);
    const n = new Track(0, S.lazy), bar = new Track(0, S.lazy), sw = new Swap(0), lo = [], done = new Track(0);
    const LINES = ['/ — 200 in 320 ms', '/pricing — 200 in 610 ms', '/journal/* — 14 pages, 1 slow', '/changelog — orphan, flagged'];
    LINES.forEach(s => { const d = document.createElement('div'); d.className = 'small'; d.style.cssText = 'font-size:13px;line-height:1.55;overflow:hidden;white-space:nowrap;text-overflow:ellipsis';
      d.innerHTML = '<span style="color:var(--success)">✓</span> ' + s; lg.appendChild(d); lo.push({ d, o:new Track(0) }); });
    const paint = () => { const show = vb.checked ? lo : lo.slice(0, 2);
      lo.forEach(r => r.d.style.display = show.includes(r) ? '' : 'none'); };
    vb.onchange = paint; paint();
    let timers = [];
    const go = () => { timers.forEach(clearTimeout); timers = [];
      lo.forEach(r => REDUCE ? r.o.jump(0) : r.o.set(0, S.snap)); done.jump(0); sw.to(0); n.jump(0); bar.jump(0); dg.set('0', true);
      const step = (i, to, cfg, dly, label) => timers.push(setTimeout(() => {
        if (REDUCE){ n.jump(to); bar.jump(to/1248); dg.set(String(to), true); } else { n.set(to, cfg); bar.set(to/1248, cfg); dg.set(String(to)); }
        if (i >= 0 && lo[i]){ if (REDUCE) lo[i].o.jump(1); else lo[i].o.set(1, S.base); sw.to(label); }
      }, REDUCE ? 0 : dly));
      step(0, 312, S.lazy, 200, 0); step(1, 804, S.lazy, 700, 1); step(2, 1123, S.lazy, 1200, 2); step(3, 1248, S.snap, 1900, 3);
      timers.push(setTimeout(() => done.set(1), REDUCE ? 0 : 2000)); };
    $(st,'.go').onclick = go; go();
    return t => { const v = n.at(t); dg.render(t);
      fl.style.width = (clamp(bar.at(t))*100).toFixed(2) + '%';
      fl.style.background = mix(clamp(done.at(t)), 'var(--success)', 'var(--accent)');
      L.forEach((el,k) => sw.apply(el,k,t));
      lo.forEach(r => { const k = clamp(r.o.at(t)); r.d.style.opacity = (0.45 + 0.55*k).toFixed(3); r.d.style.transform = 'translateY(' + ((1-k)*6).toFixed(2) + 'px)'; }); };
  }});

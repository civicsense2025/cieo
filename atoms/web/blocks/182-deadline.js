

atom({ id:'deadline', cat:'Writing', name:'Deadline ticker', block:'richtext editor, status bar', fam:['M','S'],
  html:`<div class="col" style="gap:10px;align-items:center"><div class="card dd" style="position:relative;padding:10px 18px 14px;text-align:center;min-width:238px"><div class="small muted">Submission closes in</div><div class="row" style="justify-content:center;align-items:baseline;gap:3px;font:600 30px var(--mono);font-variant-numeric:tabular-nums"><span class="dm"></span><span>:</span><span class="ds"></span></div><div class="db" style="position:relative;height:3px;margin-top:8px;background:var(--line-soft);border-radius:2px"><i style="position:absolute;top:0;bottom:0;left:0;right:0;background:var(--ink);border-radius:2px"></i></div><div style="margin-top:10px"><button class="btn pp" type="button" style="position:relative;height:32px;min-width:86px"></button></div></div></div><div class="hint">Pauses in place; danger under 10:00</div>`,
  desc:'The minutes and seconds roll on lazy springs while the plate edges trail 60ms behind. Under ten minutes the tile turns danger. Pause freezes the count in place.',
  api:'tick: rem-=dt; dm/ds.set(mm:ss, REDUCE)   rem<600: dg.set(1); eg.go(i,i)   pp toggles paused',
  init(st){
    const TOTAL = 612, dm = new Digits($(st,'.dm'), 2), ds = new Digits($(st,'.ds'), 2);
    dm.dir = ds.dir = -1; [...dm.slots, ...ds.slots].forEach(sl => sl.w.cfg = S.lazy);
    const bar = $(st,'.db i'), tile = $(st,'.dd'), pp = $(st,'.pp'), LE = {};
    for (const [k, label] of [['run','Pause'],['pause','Resume']]){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = label; pp.appendChild(e); LE[k] = e; }
    const psw = new Swap('run'), dg = new Track(0), eg = edges(0, 0);
    let rem = TOTAL, last = -1, paused = false, shown = '';
    pp.onclick = () => { paused = !paused;
      if (REDUCE){ psw.cur = paused ? 'pause' : 'run'; psw.prev = null; } else psw.to(paused ? 'pause' : 'run', now()); };
    dm.set('10', true); ds.set('12', true);
    return t => {
      if (last < 0) last = t;
      const dt = Math.min(.25, t - last); last = t;
      if (!paused && rem > 0) rem = Math.max(0, rem - dt);
      const s = Math.ceil(rem), key = String(Math.floor(s/60)).padStart(2,'0') + String(s%60).padStart(2,'0');
      if (key !== shown){ shown = key; dm.set(key.slice(0,2), REDUCE); ds.set(key.slice(2), REDUCE); }
      dm.render(t); ds.render(t);
      if (REDUCE) dg.jump(rem < 600 ? 1 : 0); else dg.set(rem < 600 ? 1 : 0);
      const g = clamp(dg.at(t)), W = bar.parentNode.offsetWidth, i = (1 - rem/TOTAL)*W/2;
      if (REDUCE) eg.jump(i, i); else eg.go(i, i);
      bar.style.left = px(eg.A.at(t)); bar.style.right = px(eg.B.at(t));
      bar.style.background = mix(g, 'var(--danger)', 'var(--ink)');
      tile.style.borderColor = mix(g, 'var(--danger)', 'var(--line)');
      tile.style.background = mix(g, 'var(--danger-tint)', 'var(--card)');
      for (const k in LE) psw.apply(LE[k], k, t, 3);
    };
  }});

atom({ id:'breakout', cat:'Video calls', name:'Breakout shuffle', block:'video call (breakout rooms, shuffle)', fam:['M','S'], tall:true,
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Breakout shuffle</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">Tiles fly to rooms; the clock counts down.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="stg" style="position:relative;height:172px;border-radius:12px;background:#0C1016;overflow:hidden"></div><div class="row" style="gap:8px;align-items:center;justify-content:space-between"><span class="small muted" style="font-size:12px">Doors open in</span><span class="row" style="gap:2px;align-items:center;font-variant-numeric:tabular-nums;font-size:13px"><span class="mm"></span><span>:</span><span class="ss"></span></span><button class="btn sh" style="min-height:32px;border-radius:8px">Shuffle</button></div><div class="fin" style="position:relative;height:30px"></div><div class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px;align-items:center"><span>Timer</span><button class="btn d5" style="min-height:32px;border-radius:8px;padding:2px 10px;font-size:12px" aria-pressed="false">5s</button><button class="btn d10" style="min-height:32px;border-radius:8px;padding:2px 10px;font-size:12px" aria-pressed="true">10s</button></div></div></div><div class="hint">Shuffle deals the rooms and starts the clock</div>`,
  desc:'Tiles fly from the lobby to room slots staggered on base, room tags swap to seated counts, and a digit clock counts down. At zero a success terminal holds the rooms open.',
  api:'tile.{x,y}.set(slot, S.base, t0 + i*0.05)   tag.to(1)   clock.set(mm:ss)   end: fin.to(1)',
  init(st){
    const N = ['Maya','Theo','Ada','Jonas'], CC = ['#3a4a3a','#4a4030','#30404a','#4a3036'];
    const stage = $(st,'.stg'), sh = $(st,'.sh');
    const tiles = N.map((n,i) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;top:0;width:70px;height:34px;border-radius:8px;background:${CC[i]};color:#fff;font-size:12px;font-weight:600;display:grid;place-items:center;padding:0`;
      d.innerHTML = `<span style="transform:translateY(-.5px)">${n}</span>`; stage.appendChild(d);
      return { d, x:new Track(0), y:new Track(0) }; });
    const tags = [0,1].map(r => { const box = document.createElement('div');
      box.style.cssText = `position:absolute;top:${r ? 108 : 62}px;left:8px;font-size:11.5px;line-height:1.45;color:#fff;opacity:.8`;
      const nm = document.createElement('b'); nm.textContent = r ? 'Room B · ' : 'Room A · ';
      const tg = document.createElement('span'); tg.style.cssText = 'position:relative;display:inline-block;min-width:64px;height:16px;vertical-align:top';
      const sw = new Swap(0);
      ['waiting','2 seated ✓'].forEach((s,k) => { const e = document.createElement('span'); e.className = 'layer';
        e.style.cssText = 'font-size:11.5px;line-height:16px;white-space:nowrap' + (k ? ';color:var(--success)' : ''); e.textContent = s; tg.appendChild(e); });
      box.append(nm, tg); stage.appendChild(box); return { tg, sw }; });
    const mm = new Digits($(st,'.mm'), 2), ss = new Digits($(st,'.ss'), 2);
    const F = ['', 'Rooms are open — have fun'].map((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.innerHTML = k ? `<span class="small" style="background:color-mix(in oklab, var(--success) 12%, transparent);color:var(--success);font-weight:600;padding:4px 10px;border-radius:999px;font-size:12.5px">✓ ${s}</span>` : s;
      $(st,'.fin').appendChild(e); return e; });
    const fsw = new Swap(0), ok = new Track(0);
    let DUR = 10, started = false, done = false, tStart = 0, last = '';
    const paint = v => { const m = String(Math.floor(v/60)).padStart(2,' '), s = String(v%60).padStart(2,'0');
      if (m + s !== last){ last = m + s; mm.set(m); ss.set(s); } };
    paint(DUR);
    const slot = i => { const W = stage.clientWidth || 300, room = i % 2, k = Math.floor(i/2);
      return room ? { x: W/2 + 4 + k*76, y: 124 } : { x: 12 + k*76, y: 78 }; };
    const lobby = i => ({ x: 12 + i*76, y: 14 });
    const lay = inst => tiles.forEach((tl,i) => { const p = lobby(i);
      if (inst){ tl.x.jump(p.x); tl.y.jump(p.y); } else { tl.x.set(p.x); tl.y.set(p.y); } });
    lay(true);
    const shuffle = () => { const t0 = now(); started = true; done = false; tStart = t0; last = '';
      tiles.forEach((tl,i) => { const p = slot(i); tl.x.set(p.x, S.base, t0 + i*.05); tl.y.set(p.y, S.base, t0 + i*.05); });
      tags.forEach(g => g.sw.to(1, t0)); fsw.to(0, t0); ok.set(0, S.snap, t0);
      sh.textContent = 'Shuffle again'; };
    sh.onclick = shuffle;
    const d5 = $(st,'.d5'), d10 = $(st,'.d10');
    const dur = v => { DUR = v; d5.setAttribute('aria-pressed', v === 5); d10.setAttribute('aria-pressed', v === 10); if (!started) paint(v); };
    d5.onclick = () => dur(5); d10.onclick = () => dur(10);
    return t => { if (started && !done){ const rem = Math.max(0, Math.ceil(DUR - (t - tStart))); paint(rem);
        if (rem <= 0){ done = true; fsw.to(1); ok.set(1, S.snap); } }
      tiles.forEach(tl => Object.assign(tl.d.style, { left:px(tl.x.at(t)), top:px(tl.y.at(t)) }));
      tags.forEach(g => [0,1].forEach(k => g.sw.apply(g.tg.children[k], k, t)));
      F.forEach((e,k) => fsw.apply(e,k,t)); mm.render(t); ss.render(t);
      const d = clamp(ok.at(t)), fin = $(st,'.fin');
      fin.style.opacity = d.toFixed(3); fin.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});

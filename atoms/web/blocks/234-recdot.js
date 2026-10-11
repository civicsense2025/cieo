atom({ id:'recdot', cat:'Video calls', name:'Recording dot', block:'video call (record, timer)', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Recording dot</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">One tap to roll.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="row" style="gap:12px;align-items:center"><button class="rec" aria-label="Record" style="width:40px;height:40px;flex:none;border-radius:50%;border:1.5px solid var(--muted);background:var(--card);display:grid;place-items:center;padding:0;cursor:pointer"><i class="dt" style="width:13px;height:13px;border-radius:50%;background:var(--danger);transform:translateY(-.5px)"></i></button><span class="lb" style="position:relative;display:inline-block;min-width:110px;height:20px;font-size:13.5px;line-height:20px"></span><span class="row num" style="gap:1px;align-items:baseline;margin-left:auto;font-variant-numeric:tabular-nums;font-size:13px"><span class="mm"></span><span>:</span><span class="ss"></span><span class="tt" style="display:none"><span>.</span><span class="t"></span></span></span></div><div class="fin" style="position:relative;height:30px"></div><label class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px"><input type="checkbox" class="th"> tenths</label></div></div><div class="hint">Start the take, then stop to save it</div>`,
  desc:'The dot pulses on the clock while tape rolls. Starting swaps in Rec plus a digit timer; stopping swaps back and lands on a saved terminal.',
  api:'dot.pulse(clock)   start: label.to(1) + timer.set(mm:ss)   stop: label.to(0) + fin.to(1)',
  init(st){
    const lb = $(st,'.lb'), dot = $(st,'.dt'), th = $(st,'.th');
    const L = ['Record a take','Recording…'].map(s => { const e = document.createElement('span'); e.className = 'layer';
      e.style.cssText = 'font-size:13.5px;line-height:20px;white-space:nowrap'; e.textContent = s; lb.appendChild(e); return e; });
    const lsw = new Swap(0);
    const mm = new Digits($(st,'.mm'), 2), ss = new Digits($(st,'.ss'), 2), tt = new Digits($(st,'.t'), 1);
    mm.set(' 0', true); ss.set('00', true);
    const F = ['', 'Saved to library'].map((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.innerHTML = k ? `<span class="small" style="background:color-mix(in oklab, var(--success) 12%, transparent);color:var(--success);font-weight:600;padding:4px 10px;border-radius:999px;font-size:12.5px">✓ ${s}</span>` : s;
      $(st,'.fin').appendChild(e); return e; });
    const fsw = new Swap(0), ok = new Track(0), glow = new Track(0);
    let rec = false, t0 = 0, last = '';
    th.onchange = () => { $(st,'.tt').style.display = th.checked ? '' : 'none'; };
    $(st,'.rec').onclick = () => { const t = now();
      if (!rec){ rec = true; t0 = t; last = ''; lsw.to(1, t); fsw.to(0, t); ok.set(0, S.snap, t); glow.set(1, S.base, t); }
      else { rec = false; lsw.to(0, t); fsw.to(1, t); ok.set(1, S.snap, t); glow.set(0, S.base, t); } };
    return t => { if (rec){ const el = t - t0, m = String(Math.floor(el/60)).padStart(2,' '), s = String(Math.floor(el%60)).padStart(2,'0');
        if (m + s !== last){ last = m + s; mm.set(m); ss.set(s); }
        if (th.checked) tt.set(String(Math.floor(el*10) % 10)); }
      L.forEach((e,k) => lsw.apply(e,k,t)); F.forEach((e,k) => fsw.apply(e,k,t));
      mm.render(t); ss.render(t); tt.render(t);
      const pulse = REDUCE || !rec ? 1 : .45 + .55*(.5 + .5*Math.sin(t*2*Math.PI));
      dot.style.opacity = (pulse*clamp(glow.at(t) || (rec ? 1 : 0)) || (rec ? pulse : 1)).toFixed(3);
      dot.style.transform = `scale(${(rec && !REDUCE ? 1 + .12*Math.sin(t*2*Math.PI) : 1).toFixed(3)}) translateY(-.5px)`;
      const d = clamp(ok.at(t)), fin = $(st,'.fin');
      fin.style.opacity = d.toFixed(3); fin.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});

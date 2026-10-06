
atom({ id:'liveticker', cat:'Dynamic', name:'Live value ticker', block:'metric, ticker', fam:['S','M'],
  html:`<div class="card col" style="width:min(420px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Portfolio value</b><span class="row" style="gap:6px;align-items:center;font-size:12px;line-height:1.5"><i class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--success)"></i><span class="pl">Live</span></span></div><div class="row" style="align-items:baseline;gap:6px"><span style="font-size:20px;font-weight:600;line-height:1.45">$</span><span class="v num" style="font-size:20px;font-weight:600;line-height:1.45;font-variant-numeric:tabular-nums"></span><span class="dg num" style="font-size:13px;font-weight:600;line-height:1.5;font-variant-numeric:tabular-nums"></span></div><div class="cap small muted" style="font-size:12px;line-height:1.5">Ticks on the clock · slots keep width so the row never shifts</div><div class="row" style="gap:8px;align-items:center"><button class="btn ps" style="min-height:32px;position:relative"></button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="au" checked> auto-tick</label></div></div><div class="hint">Pause to hold a terminal state</div>`,
  desc:'Only changed digits roll toward the new value while an up or down tint cross-fades in and drains away. Every slot keeps its width, so the row never shifts.',
  api:'d.dir = sign; d.set(next)   tint.set(±1); tint.set(0, S.lazy, t + .7)',
  init(st){
    const v = $(st,'.v'), dg = $(st,'.dg'), ps = $(st,'.ps'), au = $(st,'.au'), pl = $(st,'.pl'), dot = $(st,'.dot');
    const d = new Digits(v, 4), s = new Track(0), sw = new Swap(0);
    const L = ['Pause','Resume'].map(x => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = x; ps.appendChild(e); return e; });
    let n = 4281, paused = false, next = 1.2;
    d.set(String(n), true); dg.textContent = '+$0';
    const tick = t => { const k = Math.random() < .55 ? 1 : -1, step = 1 + Math.floor(Math.random()*24), was = n;
      n = clamp(n + k*step, 1000, 9999); d.dir = k; d.set(String(n), REDUCE);
      if (REDUCE) s.jump(0); else { s.jump(k); s.set(0, S.lazy, t + .7); }
      dg.textContent = (n >= was ? '+' : '\u2212') + '$' + Math.abs(n - was); };
    ps.onclick = () => { paused = !paused; sw.to(paused ? 1 : 0); };
    return t => { if (au.checked && !paused && t >= next){ tick(t); next = t + 1.1; }
      d.render(t); const x = s.at(t), col = x >= 0 ? mix(x,'var(--success)','var(--ink)') : mix(-x,'var(--danger)','var(--ink)');
      v.style.color = col; dg.style.color = col;
      pl.textContent = paused ? 'Paused' : 'Live';
      dot.style.background = paused ? 'var(--line)' : 'var(--success)';
      L.forEach((e,k) => sw.apply(e,k,t)); };
  }});

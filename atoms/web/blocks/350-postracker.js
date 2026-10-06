atom({ id:'postracker', cat:'SEO', name:'Position tracker', block:'seo ranks, sparkline', fam:['M','S','T'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">“member pricing” · position <span class="dg num" style="font-variant-numeric:tabular-nums"></span></b><div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:8px"><svg class="sp" viewBox="0 0 300 64" width="100%" height="64" aria-hidden="true" style="display:block"><path class="tk" d="M4 8 H296" fill="none" stroke="var(--line-soft)" stroke-width="1" stroke-dasharray="3 4"/><path class="ln" d="M4 52 C40 50 60 44 90 40 C120 36 140 42 170 30 C200 18 240 22 296 10" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" pathLength="100" stroke-dasharray="100"/></svg><div class="row" style="gap:8px"><span class="ch" style="position:relative;display:inline-flex;min-width:76px;height:22px;font-size:13px;font-weight:600"></span><span class="small muted" style="font-size:12.5px;line-height:1.5">vs last week · top-3 threshold dotted</span></div></div><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="sl" checked> sparkline</label></div></div><button class="btn rf" style="position:absolute;top:10px;right:12px;min-height:32px">Refresh</button>`,
  desc:'The sparkline draws on the lazy spring while the rank digits roll up or down. The delta chip swaps to success or danger, and the badge holds the new rank as the terminal state.',
  api:'line.set(0→len, lazy) rank.digits.set(n) delta.to(±k) success/danger',
  init(st){
    const ln = $(st,'.ln'), sp = $(st,'.sp'), sl = $(st,'.sl'), ch = $(st,'.ch');
    const dg = new Digits($(st,'.dg'), 2); dg.set('7', true);
    const draw = new Track(0, S.lazy), sw = new Swap('0');
    const L = {};
    const chip = v => { const k = String(v);
      if (!L[k]){ const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; const up = +v > 0;
        e.innerHTML = +v === 0 ? '<span class="muted">– no change</span>' : '<span style="color:' + (up ? 'var(--success)' : 'var(--danger)') + '">' + (up ? '▲ ' : '▼ ') + Math.abs(v) + '</span>'; ch.appendChild(e); L[k] = e; }
      sw.to(k); };
    let rank = 7; chip('0'); sw.cur = '0'; sw.prev = null; sw.t = -9;
    const go = () => { const nx = clamp(rank + Math.round((Math.random() - .55)*6), 1, 20); const d = rank - nx;
      dg.dir = nx < rank ? -1 : 1; dg.set(String(nx), REDUCE ? true : false); chip(String(d > 0 ? '+' + d : d));
      if (REDUCE){ draw.jump(100); } else { draw.jump(0); draw.set(100, S.lazy); } rank = nx; };
    $(st,'.rf').onclick = go;
    sl.onchange = () => sp.style.display = sl.checked ? '' : 'none';
    if (REDUCE) draw.jump(100); else draw.set(100, S.lazy);
    return t => { ln.style.strokeDashoffset = (100 - draw.at(t)).toFixed(2); dg.render(t);
      for (const k in L) sw.apply(L[k], k, t); };
  }});

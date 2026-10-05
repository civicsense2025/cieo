

atom({ id:'gauge', cat:'SEO', name:'Score gauge', block:'metric, progress', fam:['T','S'],
  html:`<div class="col" style="align-items:center;gap:4px"><div style="position:relative;width:180px;height:100px"><svg viewBox="0 0 180 100" width="180" height="100" aria-hidden="true"><path d="M14 92 A76 76 0 0 1 166 92" fill="none" stroke="var(--raised)" stroke-width="12" stroke-linecap="round"/><path class="ar" d="M14 92 A76 76 0 0 1 166 92" fill="none" stroke-width="12" stroke-linecap="round" pathLength="100" stroke-dasharray="100"/></svg><b class="n num" style="position:absolute;left:0;right:0;bottom:4px;text-align:center;font-size:34px;letter-spacing:-.03em"></b></div><span class="lb small" style="position:relative;width:140px;height:20px;font-weight:600"></span><span class="small muted">SEO score for /journal/spring-launch</span></div><button class="btn rr" style="position:absolute;top:10px;right:12px">Run audit</button>`,
  desc:'The arc and the number ride the same lazy spring, so they always agree. The color shifts through danger, warning and success as the value crosses 50 and 80, and the verdict swaps when the run settles.',
  api:'arc = v/100   n = round(v)   color = band(v)   verdict.to(band) on settle',
  init(st){
    const ar = $(st,'.ar'), n = $(st,'.n'), lb = $(st,'.lb'), V = ['Poor','Needs work','Good'];
    const L = V.map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; e.style.color = ['var(--danger)','var(--warning)','var(--success)'][i]; lb.appendChild(e); return e; });
    const v = new Track(0, S.lazy), sw = new Swap(-1); let pending = true;
    const run = () => { v.jump(0).set(Math.round(38 + Math.random()*60)); pending = true; sw.to(-1); }; $(st,'.rr').onclick = run; run();
    return t => { const x = Math.max(0, v.at(t)), b = x >= 80 ? 2 : x >= 50 ? 1 : 0; ar.style.strokeDashoffset = (100 - x).toFixed(2); n.textContent = Math.round(x);
      const k1 = clamp((x - 40)/20), k2 = clamp((x - 70)/20); ar.style.stroke = bandColor(k1, k2); n.style.color = bandColor(k1, k2);
      if (pending && Math.abs(x - v.target) < .5){ pending = false; sw.to(b); } L.forEach((e,i) => sw.apply(e,i,t)); };
  }});
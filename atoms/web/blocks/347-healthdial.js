atom({ id:'healthdial', cat:'SEO', name:'Audit health dial', block:'seo audit, health score', fam:['M','S','T'],
  html:`<div class="col" style="width:min(340px,92%);align-items:center;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Site health</b><div style="position:relative;width:148px;height:148px"><svg viewBox="0 0 148 148" width="148" height="148" aria-hidden="true"><circle cx="74" cy="74" r="62" fill="none" stroke="var(--raised)" stroke-width="11"/><circle class="r1" cx="74" cy="74" r="62" fill="none" stroke-width="11" stroke-linecap="round" pathLength="100" stroke-dasharray="100" transform="rotate(-90 74 74)"/><circle cx="74" cy="74" r="46" fill="none" stroke="var(--raised)" stroke-width="11"/><circle class="r2" cx="74" cy="74" r="46" fill="none" stroke-width="11" stroke-linecap="round" pathLength="100" stroke-dasharray="100" transform="rotate(-90 74 74)"/></svg><div class="col" style="position:absolute;inset:0;align-items:center;justify-content:center;gap:0"><span class="dg num" style="font-size:30px;font-weight:600;letter-spacing:-.02em;line-height:1.2"></span><span class="small muted" style="font-size:12px;line-height:1.5">of 100 · 24 checks</span></div></div><span class="vd" style="position:relative;width:160px;height:22px;font-size:13px;font-weight:600;line-height:1.5"></span><span class="small muted" style="font-size:12.5px;line-height:1.5">Outer ring: performance · inner: technical</span><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="brk" checked> show rings separately</label></div></div><button class="btn rr" style="position:absolute;top:10px;right:12px;min-height:32px">Run audit</button>`,
  desc:'Two concentric rings fill on the same soft spring while the composite score rolls its digits. The verdict swaps in only once the run settles, and holds as the terminal state.',
  api:'r1.set(perf, soft) r2.set(tech, soft) dg.set(score) verdict.to(band) on settle',
  init(st){
    const r1 = $(st,'.r1'), r2 = $(st,'.r2'), vd = $(st,'.vd'), brk = $(st,'.brk');
    const V = ['Poor','Needs work','Healthy'];
    const L = V.map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '13px'; e.textContent = s; e.style.color = ['var(--danger)','var(--warning)','var(--success)'][i]; vd.appendChild(e); return e; });
    const dg = new Digits($(st,'.dg'), 2); dg.set('0', true);
    const a = new Track(0, S.soft), b = new Track(0, S.soft), sw = new Swap(-1); let pending = false, p = 0, q = 0, done = true;
    const run = () => { p = Math.round(38 + Math.random()*59); q = Math.round(38 + Math.random()*59); const s = Math.round((p+q)/2);
      if (REDUCE){ a.jump(p); b.jump(q); dg.set(String(s), true); sw.cur = s >= 80 ? 2 : s >= 50 ? 1 : 0; sw.prev = null; sw.t = -9; }
      else { a.jump(0); b.jump(0); dg.set('0'); a.set(p); b.set(q); dg.set(String(s)); sw.to(-1); pending = true; } done = false; };
    $(st,'.rr').onclick = run; run();
    return t => { const x = a.at(t), y = b.at(t);
      r1.style.strokeDashoffset = (100 - x).toFixed(2); r2.style.strokeDashoffset = (100 - y).toFixed(2);
      const m = (x + y)/2, k1 = clamp((m - 40)/20), k2 = clamp((m - 70)/20);
      r1.style.stroke = bandColor(k1, k2); r2.style.stroke = brk.checked ? 'var(--accent)' : bandColor(k1, k2);
      dg.render(t);
      if (pending && Math.abs(x - p) < .6 && Math.abs(y - q) < .6){ pending = false; done = true; sw.to(m >= 80 ? 2 : m >= 50 ? 1 : 0); }
      L.forEach((e,i) => sw.apply(e,i,t)); };
  }});

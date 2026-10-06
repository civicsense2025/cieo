atom({ id:'vitals', cat:'SEO', name:'Core vitals bars', block:'seo vitals, metrics', fam:['M','S','T'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Core Web Vitals</b><div class="vs col" style="gap:10px"></div><div class="vd card" role="status" style="position:relative;height:26px;padding:0 14px;font-size:13px;font-weight:600;line-height:26px"></div><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="th" checked> threshold bands</label></div></div><button class="btn ms" style="position:absolute;top:10px;right:12px;min-height:32px">Re-measure</button>`,
  desc:'Bars stagger in on base while each value rolls its millisecond digits. Threshold bands sit behind the bars in danger, warning and success; the verdict swaps once every bar has settled and holds.',
  api:'bar[i].set(v, base, t+i*.04) val.digits.set(ms) verdict.to(allpass) on settle',
  init(st){
    const M = [
      { n:'LCP', u:'s', lim:[2.5, 4], fmt:v => v.toFixed(1) + ' s', lo:1.2, hi:5.2 },
      { n:'INP', u:'ms', lim:[200, 500], fmt:v => Math.round(v) + ' ms', lo:60, hi:640 },
      { n:'CLS', u:'', lim:[.1, .25], fmt:v => v.toFixed(2), lo:0, hi:.34 }
    ];
    const box = $(st,'.vs'), th = $(st,'.th'), vd = $(st,'.vd');
    const L = ['Measuring…', 'All green ✓'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; if (i) e.style.color = 'var(--success)'; vd.appendChild(e); return e; });
    const sw = new Swap(0);
    const rows = M.map((m,i) => { const r = document.createElement('div'); r.className = 'col'; r.style.gap = '6px';
      r.innerHTML = '<div class="row small" style="justify-content:space-between;font-size:13px"><span style="font-weight:600">' + m.n + '</span><span class="dg num" style="font-variant-numeric:tabular-nums;color:var(--muted)"></span></div><div class="tr" style="position:relative;height:10px;border-radius:5px;background:var(--raised);overflow:hidden"><i class="b1" style="position:absolute;left:0;top:0;bottom:0;background:color-mix(in oklab, var(--success) 30%, transparent)"></i><i class="b2" style="position:absolute;top:0;bottom:0;background:color-mix(in oklab, var(--warning) 32%, transparent)"></i><i class="b3" style="position:absolute;top:0;bottom:0;background:color-mix(in oklab, var(--danger) 30%, transparent)"></i><div class="fl" style="position:absolute;left:0;top:0;bottom:0;width:0;border-radius:5px;background:var(--ink)"></div></div>';
      box.appendChild(r);
      const dg = new Digits($(r,'.dg'), 4); dg.set('0', true);
      return { r, dg, fl:$(r,'.fl'), v:new Track(0), m, b1:$(r,'.b1'), b2:$(r,'.b2'), b3:$(r,'.b3'), val:0 }; });
    const go = () => { const t0 = now(); sw.to(0);
      rows.forEach((r,i) => { const good = Math.random() < .7;
        r.val = good ? r.m.lo + Math.random()*(r.m.lim[0]-r.m.lo) : r.m.lim[0] + Math.random()*(r.m.hi-r.m.lim[0]);
        const p = clamp((r.val - r.m.lo)/(r.m.hi - r.m.lo));
        if (REDUCE){ r.v.jump(p); r.dg.set(r.m.fmt(r.val), true); } else { r.v.set(p, S.base, t0 + i*.04); r.dg.set(r.m.fmt(r.val)); } });
      const pass = rows.every(r => r.val <= r.m.lim[0]);
      setTimeout(() => sw.to(pass ? 1 : 0), REDUCE ? 0 : 700); };
    $(st,'.ms').onclick = go; go();
    return t => rows.forEach(r => { const p = clamp(r.v.at(t)), cut1 = (r.m.lim[0]-r.m.lo)/(r.m.hi-r.m.lo), cut2 = (r.m.lim[1]-r.m.lo)/(r.m.hi-r.m.lo);
      r.fl.style.width = (p*100).toFixed(2) + '%';
      r.fl.style.background = p <= cut1 ? 'var(--success)' : p <= cut2 ? 'var(--warning)' : 'var(--danger)';
      r.b1.style.left = '0'; r.b1.style.width = (cut1*100).toFixed(1) + '%';
      r.b2.style.left = (cut1*100).toFixed(1) + '%'; r.b2.style.width = ((cut2-cut1)*100).toFixed(1) + '%';
      r.b3.style.left = (cut2*100).toFixed(1) + '%'; r.b3.style.right = '0';
      const show = th.checked ? 1 : 0; [r.b1,r.b2,r.b3].forEach(b => b.style.opacity = show);
      r.dg.render(t); L.forEach((el,k) => sw.apply(el,k,t)); });
  }});

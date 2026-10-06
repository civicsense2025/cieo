
atom({ id:'updateflash', cat:'Dynamic', name:'Update flash', block:'metric, feed', fam:['S','M'],
  html:`<div class="card col" style="width:min(400px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Metrics</b><div class="rows col" style="gap:0"></div><div class="cap small muted" style="font-size:12px;line-height:1.5">Press push · the row never moves</div><div class="row" style="gap:8px;align-items:center"><button class="btn ps" style="min-height:32px;position:relative"></button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="tw" checked> tint wash</label></div></div><div class="hint">Fresh cells wash, then settle</div>`,
  desc:'A fresh cell gets a soft tint wash that fades on the lazy spring while its value swaps underneath. Rows keep fixed height, so nothing ever moves.',
  api:'wash.set(.5); wash.set(0, S.lazy, t + .15)   val.o dip + text swap at midpoint',
  init(st){
    const rows = $(st,'.rows'), cap = $(st,'.cap'), tw = $(st,'.tw'), ps = $(st,'.ps');
    const D = [['MRR',['$48.2k','$48.9k','$49.4k']],['Active',['1,204','1,318','1,402']],['Churn',['2.1%','1.9%','1.7%']]];
    const sw = new Swap(0), L = ['Push update','Replay'].map(x => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = x; ps.appendChild(e); return e; });
    const R = D.map(([k, vs], i) => { const r = document.createElement('div');
      r.style.cssText = 'position:relative;display:flex;justify-content:space-between;align-items:center;min-height:40px;padding:8px 0' + (i ? ';border-top:1px solid var(--line)' : '');
      r.innerHTML = `<span style="font-size:13px;line-height:1.5">${k}</span><span style="position:relative;font-size:14px;font-weight:600;line-height:1.5;font-variant-numeric:tabular-nums"><i class="w" style="position:absolute;inset:-3px -8px;border-radius:8px;background:var(--accent);opacity:0;pointer-events:none"></i><span class="vv"></span></span>`;
      rows.appendChild(r);
      return { r, vs, k:0, w:new Track(0), o:new Track(1), pend:null, done:false, v:$(r,'.vv'), wash:$(r,'.w') }; });
    R.forEach(x => x.v.textContent = x.vs[0]);
    let step = 0;
    ps.onclick = () => { const t = now();
      if (step >= R.length){ R.forEach(x => { x.k = 0; x.v.textContent = x.vs[0]; x.done = false; }); step = 0; sw.to(0); cap.textContent = 'Press push · the row never moves'; return; }
      const x = R[step++], nv = x.vs[Math.min(x.k + 1, 2)]; x.k++;
      if (REDUCE){ x.v.textContent = nv; x.w.jump(0); x.o.jump(1); }
      else { x.w.jump(0); x.w.set(.45, S.snap, t); x.w.set(0, S.lazy, t + .15); x.o.set(0, S.snap, t); x.pend = { at:t + .09, nv }; }
      x.done = true;
      if (step >= R.length){ sw.to(1); cap.textContent = 'All caught up ✓ · settled'; } };
    return t => { R.forEach(x => { if (x.pend && t >= x.pend.at){ x.v.textContent = x.pend.nv; x.pend = null; x.o.set(1, S.base, t); }
      x.wash.style.opacity = tw.checked ? (x.w.at(t)*.5).toFixed(3) : 0;
      fade(x.v, x.o.at(t), 0); }); L.forEach((e,k) => sw.apply(e,k,t)); };
  }});

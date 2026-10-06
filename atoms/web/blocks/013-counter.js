

/* ---------- Data ---------- */
atom({ id:'counter', cat:'Data', name:'Counter', block:'counter, metric', fam:['T','S'],
  html:`<div class="col" style="align-items:center;gap:4px"><b class="n num" style="font-size:52px;letter-spacing:-.04em;font-weight:600">0</b><span class="muted small">Members this year</span><span class="small num delta" style="color:var(--accent);font-weight:500">+0% vs last year</span><div class="row small muted" style="gap:6px;justify-content:center"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="dl-on" checked> compare line</label></div></div><button class="btn rp" style="position:absolute;top:10px;right:12px">Replay</button>`,
  desc:'The number itself rides the lazy spring, so it decelerates into the final value instead of ticking linearly. Reduced motion jumps straight to the final value.',
  api:'label = format(round(v.at(t)))   REDUCE: v.jump(final)',
  init(st){
    const n = $(st,'.n'), dl = $(st,'.delta'), on = $(st,'.dl-on'), v = new Track(0, S.lazy), d = new Track(0, S.lazy);
    const go = () => { const t0 = now();
      if (REDUCE){ v.jump(12480); d.jump(34); }
      else { v.jump(0).set(12480); d.jump(0).set(34, S.lazy, t0 + .15); } };
    $(st,'.rp').onclick = go; go();
    return t => { n.textContent = Math.round(v.at(t)).toLocaleString('en-US'); dl.textContent = `+${Math.round(d.at(t))}% vs last year`; dl.style.display = on.checked ? '' : 'none'; };
  }});
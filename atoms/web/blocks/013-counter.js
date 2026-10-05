

/* ---------- Data ---------- */
atom({ id:'counter', cat:'Data', name:'Counter', block:'counter, metric', fam:['T','S'],
  html:`<div class="col" style="align-items:center;gap:4px"><b class="n num" style="font-size:52px;letter-spacing:-.04em;font-weight:600">0</b><span class="muted small">Members this year</span><span class="small num delta" style="color:var(--accent);font-weight:500">+0% vs last year</span></div><button class="btn" style="position:absolute;top:10px;right:12px">Replay</button>`,
  desc:'The number itself rides the lazy spring, so it decelerates into the final value instead of ticking linearly.',
  api:'label = format(round(v.at(t)))',
  init(st){
    const n = $(st,'.n'), dl = $(st,'.delta'), v = new Track(0, S.lazy), d = new Track(0, S.lazy);
    const go = () => { v.jump(0).set(12480); d.jump(0).set(34, S.lazy, now() + .15); }; $(st,'button').onclick = go; go();
    return t => { n.textContent = Math.round(v.at(t)).toLocaleString('en-US'); dl.textContent = `+${Math.round(d.at(t))}% vs last year`; };
  }});
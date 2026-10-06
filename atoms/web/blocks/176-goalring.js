atom({ id:'goalring', cat:'Writing', name:'Goal ring', block:'writing, goals', fam:['M','S','T'],
  html:`<div class="card col" style="padding:24px;gap:24px;width:min(280px,calc(100% - 48px))"><div style="font-size:12px;color:var(--muted)">A little every day.</div><div class="row" style="gap:24px;align-items:center"><svg width="76" height="76" viewBox="0 0 76 76"><circle cx="38" cy="38" r="30" fill="none" stroke="var(--line)" stroke-width="8"/><circle class="fg" cx="38" cy="38" r="30" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" transform="rotate(-90 38 38)"/></svg><div class="swap" style="position:relative;width:96px;height:30px"><div class="L0" style="position:absolute;inset:0"></div><div class="L1" style="position:absolute;inset:0;font-weight:600;line-height:30px">Done ✓</div></div></div><div class="row" style="gap:8px;margin-top:8px"><button class="btn ink add">Write +125</button><button class="btn rs">Reset</button></div><div style="font-size:11px;color:var(--muted)">500 words · your daily writing goal</div></div>`,
  desc:'A ring and its word count climb toward the daily target on a slow lazy spring, digits rolling as they go. At one hundred percent the ring gives a quick snap pulse and swaps to a Done state, and Reset returns it to zero.',
  api:'write(n): p.set(min(1,v)); done?{pulse.snap; swap.to(Done)}',
  init(st){
    const C = 188.5, goal = 500, R = REDUCE, fg = $(st,'.fg'), svg = $(st,'svg');
    fg.style.strokeDasharray = C.toFixed(1); fg.style.strokeDashoffset = C.toFixed(1);
    const dg = new Digits($(st,'.L0'), 3); dg.set(0, true);
    const sw = new Swap(0), p = new Track(0), pu = new Track(1);
    const L0 = $(st,'.L0'), L1 = $(st,'.L1'); let v = 0, done = false;
    const go = k => { sw.to(k); if (R) sw.t = -9; };
    $(st,'.add').onclick = () => { if (done) return; const t = now(); v = Math.min(goal, v+125);
      R ? p.jump(v/goal) : p.set(v/goal, S.lazy, t); dg.set(v, R);
      if (v >= goal){ done = true; if (R) pu.jump(1); else { pu.set(1.18, S.snap, t); pu.set(1, S.snap, t+.12); } go(1); } };
    $(st,'.rs').onclick = () => { v = 0; done = false; p.jump(0); pu.jump(1); dg.set(0, true); go(0); };
    return t => { fg.style.strokeDashoffset = (C*(1-p.at(t))).toFixed(2);
      svg.style.transform = `scale(${pu.at(t).toFixed(3)})`;
      sw.apply(L0, 0, t); sw.apply(L1, 1, t); dg.render(t); };
  }});

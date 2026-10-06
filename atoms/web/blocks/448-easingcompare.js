atom({ id:'easingcompare', cat:'Foundations', name:'Easing compare', block:'spring presets, retarget, emphasized easing', fam:['T'],
  html:`<div class="card col" style="width:min(360px,92%);padding:18px;gap:16px"><div class="col" style="gap:8px"><div class="ln" style="position:relative;height:28px;border-bottom:1px dashed var(--line)"><b style="position:absolute;left:0;top:7px;width:14px;height:14px;border-radius:50%;background:var(--ink)"></b><i class="small muted" style="position:absolute;right:0;top:0;font-style:normal;font-size:12px">base · ω22</i></div><div class="ln" style="position:relative;height:28px;border-bottom:1px dashed var(--line)"><b style="position:absolute;left:0;top:7px;width:14px;height:14px;border-radius:50%;background:var(--accent)"></b><i class="small muted" style="position:absolute;right:0;top:0;font-style:normal;font-size:12px">emphasized · w18 z0.7</i></div><div class="ln" style="position:relative;height:28px;border-bottom:1px dashed var(--line)"><b style="position:absolute;left:0;top:7px;width:14px;height:14px;border-radius:50%;background:var(--muted)"></b><i class="small muted" style="position:absolute;right:0;top:0;font-style:normal;font-size:12px">smooth · ω12</i></div></div><div class="ro" style="font:13px var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)">same move · three feels</div><div class="row" style="gap:8px"><button class="btn run" style="flex:1;min-height:36px">Run</button></div><div class="row small muted" style="gap:8px;align-items:center"><button class="btn rt" style="min-height:32px">Retarget mid-flight</button><span style="font-size:12px">interrupts the move</span></div></div><div class="hint">Retarget proves every spring is a resumable sum</div>`,
  desc:'The same move on three springs: base arrives clean, emphasized leans in with a breath of overshoot, smooth takes its time.',
  api:'x.set(to, cfg) · mid-flight x.set(0.15) retargets as a sum',
  init(st){
    const dots = $$(st,'.ln b'), ro = $(st,'.ro');
    const T = [new Track(0, S.base), new Track(0, { w:18, z:.7 }), new Track(0, { w:12 })];
    const names = ['base', 'emphasized', 'smooth'];
    let to = 1;
    const go = v => { const t0 = now();
      if (REDUCE) T.forEach(x => x.jump(v)); else T.forEach(x => x.set(v, undefined, t0)); };
    $(st,'.run').onclick = () => { to = to ? 0 : 1; go(to); };
    $(st,'.rt').onclick = () => go(.15);
    return t => { dots.forEach((d, i) => { const w = Math.max(1, d.parentNode.clientWidth - 14);
        d.style.transform = `translateX(${px(clamp(T[i].at(t), -.15, 1.15) * w)})`; });
      ro.textContent = names.map((n, i) => n + ' ' + clamp(T[i].at(t)).toFixed(2)).join(' · ') + (REDUCE ? ' · instant' : ''); };
  }});

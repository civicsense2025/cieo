atom({ id:'tokeninspector', cat:'Foundations', name:'Token inspector', block:'tokens, durations, spring presets', fam:['T'],
  html:`<div class="card col" style="width:min(360px,92%);padding:18px;gap:8px"><div class="row" style="justify-content:space-between;gap:8px;font:13px var(--mono);font-variant-numeric:tabular-nums"><span>snap · ω34</span><span class="muted">200ms</span></div><div class="row" style="justify-content:space-between;gap:8px;font:13px var(--mono);font-variant-numeric:tabular-nums"><span>base · ω22</span><span class="muted">300ms</span></div><div class="row" style="justify-content:space-between;gap:8px;font:13px var(--mono);font-variant-numeric:tabular-nums"><span>soft · ω15</span><span class="muted">440ms</span></div><div class="row" style="justify-content:space-between;gap:8px;font:13px var(--mono);font-variant-numeric:tabular-nums"><span>lazy · ω9</span><span class="muted">740ms</span></div><div class="row" style="justify-content:space-between;gap:8px;font:13px var(--mono);font-variant-numeric:tabular-nums"><span>swap exit</span><span class="muted">100ms</span></div><div class="row" style="justify-content:space-between;gap:8px;font:13px var(--mono);font-variant-numeric:tabular-nums"><span>edge lag</span><span class="muted">60ms</span></div><div class="lane" style="position:relative;height:32px;border-radius:8px;background:var(--raised);margin-top:8px"><div class="dt" style="position:absolute;left:8px;top:9px;width:14px;height:14px;border-radius:50%;background:var(--accent)"></div></div><div class="ro" style="font:13px var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)">probe 0.000 · base</div><div class="row" style="gap:8px;margin-top:8px"><button class="btn run" style="flex:1;min-height:36px">Probe</button></div><div class="row small muted pk" style="gap:8px;align-items:center"><span style="font-size:12px">Spring</span><button class="btn" style="min-height:32px">snap</button><button class="btn" style="min-height:32px">base</button><button class="btn" style="min-height:32px">soft</button><button class="btn" style="min-height:32px">lazy</button></div></div><div class="hint">Every token in one panel · probe runs live underneath</div>`,
  desc:'Spring, swap, lag and digits tokens in one panel. The probe below runs the picked spring so the numbers stay honest.',
  api:'S.snap|base|soft|lazy · EXIT .1 · LAG .06 · probe.at(t)',
  init(st){
    const lane = $(st,'.lane'), dot = $(st,'.dt'), ro = $(st,'.ro'), btns = $$(st,'.pk .btn');
    const CF = [['snap', S.snap], ['base', S.base], ['soft', S.soft], ['lazy', S.lazy]];
    let pi = 1;
    const probe = new Track(0, S.base);
    const show = i => { pi = i; probe.cfg = CF[i][1];
      btns.forEach((b, j) => b.setAttribute('aria-pressed', i === j)); };
    btns.forEach((b, i) => b.onclick = () => show(i));
    show(1);
    $(st,'.run').onclick = () => { const v = probe.target ? 0 : 1;
      if (REDUCE) probe.jump(v); else probe.set(v, CF[pi][1]); };
    return t => { const W = Math.max(1, size(lane).cw - 30), v = clamp(probe.at(t));
      dot.style.transform = `translateX(${px(v * W)})`;
      ro.textContent = 'probe ' + v.toFixed(3) + ' · ' + CF[pi][0] + (REDUCE ? ' · instant' : ''); };
  }});

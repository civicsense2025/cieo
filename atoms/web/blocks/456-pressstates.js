atom({ id:'pressstates', cat:'Foundations', name:'Press states', block:'press feedback, haptics, snap spring', fam:['T'],
  html:`<div class="card col" style="width:min(360px,92%);padding:18px;gap:16px"><button class="pad" style="min-height:56px;border-radius:14px;border:0;background:var(--ink);color:var(--card);font-size:15px;font-weight:600;cursor:pointer;touch-action:none">Hold me</button><div class="ro" style="font:13px var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)">scale 1.000 · medium</div><div class="row small muted pk" style="gap:8px;align-items:center"><span style="font-size:12px">Force</span><button class="btn" style="min-height:32px">light</button><button class="btn" style="min-height:32px">medium</button><button class="btn" style="min-height:32px">firm</button></div></div><div class="hint">Press in on snap, release on base — one feel everywhere</div>`,
  desc:'The universal press: snap in under the finger, spring back on release. Force only changes how deep it dips.',
  api:'down → sc.set(dip, S.snap) · up → sc.set(1, S.base)',
  init(st){
    const pad = $(st,'.pad'), ro = $(st,'.ro'), btns = $$(st,'.pk .btn');
    const F = [['light', .97], ['medium', .94], ['firm', .90]];
    let fi = 1;
    const sc = new Track(1, S.snap);
    const show = i => { fi = i; btns.forEach((b, j) => b.setAttribute('aria-pressed', i === j)); };
    btns.forEach((b, i) => b.onclick = ev => { ev.stopPropagation(); show(i); });
    show(1);
    const dn = e => { if (e.cancelable) e.preventDefault();
      if (REDUCE) sc.jump(F[fi][1]); else sc.set(F[fi][1], S.snap); };
    const up = () => { if (REDUCE) sc.jump(1); else sc.set(1, S.base); };
    pad.addEventListener('pointerdown', dn);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => pad.addEventListener(ev, up));
    return t => { const s = clamp(sc.at(t), .8, 1.05);
      pad.style.transform = `scale(${s.toFixed(4)})`;
      ro.textContent = 'scale ' + s.toFixed(3) + ' · ' + F[fi][0] + (REDUCE ? ' · instant' : ''); };
  }});

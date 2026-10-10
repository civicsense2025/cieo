atom({ id:'focusring', cat:'Foundations', name:'Focus ring', block:'focus ring, accessibility, snap spring', fam:['T'],
  html:`<div class="card col fz" style="position:relative;width:min(360px,92%);padding:18px;gap:16px"><div class="rg" style="position:absolute;border-radius:10px;pointer-events:none;opacity:0;border:2px solid var(--accent)"></div><input class="fi" type="text" value="Spring essay" aria-label="Title" style="height:40px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);padding:0 12px;font-size:14px;outline:none"><div class="row" style="gap:8px"><button class="btn fb" style="flex:1;min-height:40px">Save draft</button><button class="btn fb2" style="flex:1;min-height:40px">Share</button></div><div class="ro" style="font:13px var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)">accent · 2px · snap</div><div class="row small muted" style="gap:8px;align-items:center"><select class="th" aria-label="Ring theme" style="min-height:32px;font-size:13px;border:1.5px solid var(--muted);border-radius:9px;background:var(--card);color:var(--ink)"><option value="accent">accent</option><option value="ink">ink</option><option value="success">success</option><option value="danger">danger</option></select><input type="range" class="wd" min="1" max="4" step="1" value="2" aria-label="Ring width pixels" style="flex:1;min-height:32px"></div></div><div class="hint">One snap ring serves every input — tab through them</div>`,
  desc:'A single snap ring frames whichever input has focus. Theme and width stay consistent everywhere by construction.',
  api:'focusin → ring.set(1, S.snap) · focusout → ring.set(0)',
  init(st){
    const card = $(st,'.fz'), ring = $(st,'.rg'), ro = $(st,'.ro'), th = $(st,'.th'), wd = $(st,'.wd');
    const C = { accent:'var(--accent)', ink:'var(--ink)', success:'var(--success)', danger:'var(--danger)' };
    const o = new Track(0, S.snap);
    const paint = () => { ring.style.borderColor = C[th.value]; ring.style.borderWidth = wd.value + 'px';
      ro.textContent = th.value + ' · ' + wd.value + 'px · snap' + (REDUCE ? ' · instant' : ''); };
    th.onchange = paint; wd.oninput = paint; paint();
    const place = el => { const c = card.getBoundingClientRect(), r = el.getBoundingClientRect(), p = 5;
      ring.style.left = px(r.left - c.left - p); ring.style.top = px(r.top - c.top - p);
      ring.style.width = px(r.width + p * 2); ring.style.height = px(r.height + p * 2); };
    card.addEventListener('focusin', e => { if (!e.target.closest || !e.target.closest('.fi,.fb,.fb2,.th')) return;
      place(e.target); if (REDUCE) o.jump(1); else o.set(1, S.snap); });
    card.addEventListener('focusout', () => { if (REDUCE) o.jump(0); else o.set(0, S.snap); });
    return t => { const v = clamp(o.at(t));
      ring.style.opacity = v.toFixed(3);
      ring.style.transform = `scale(${(0.96 + 0.04 * v).toFixed(4)})`; };
  }});

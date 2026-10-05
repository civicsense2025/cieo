

atom({ id:'slider', cat:'Interactive', name:'Rubber-band slider', block:'form (range), video volume', fam:['D'],
  html:`<div class="row" style="width:min(320px,84%);gap:12px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M11 5 6 9H3v6h3l5 4z"/></svg><div class="vr" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" style="position:relative;flex:1;height:36px;cursor:grab;touch-action:none"><div class="vp" style="position:absolute;left:0;top:50%;border-radius:999px;background:var(--raised);overflow:hidden"><div class="vf" style="position:absolute;left:0;top:0;bottom:0;background:var(--ink)"></div></div></div><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg></div><div class="ro num">60%</div><div class="hint">Drag past either end</div>`,
  desc:'While held, the value is the pointer. Past the ends the pill stretches with rising resistance, then springs back from release velocity.',
  api:'rb(x, d) = d·(1 − 1/(0.55x/d + 1))   o.release(o, v, 0)',
  init(st){
    const vr = $(st,'.vr'), vp = $(st,'.vp'), vf = $(st,'.vf'), ro = $(st,'.ro'), v = new Track(.6), o = new Track(0); let held = false, hv = .6, ho = 0;
    const at = p => { if (p.x > p.w){ hv = 1; ho = rb(p.x - p.w, 60); } else if (p.x < 0){ hv = 0; ho = rb(p.x, 60); } else { hv = p.x/p.w; ho = 0; } };
    drag(vr, { down:p => { held = true; at(p); }, move:at, up:(p, vel) => { held = false; v.jump(hv); o.release(ho, ho ? vel.vx*.3 : 0, 0); } });
    vr.onkeydown = e => { if (e.key === 'ArrowRight') v.set(clamp(v.target + .1)); if (e.key === 'ArrowLeft') v.set(clamp(v.target - .1)); };
    return t => { const W = vr.clientWidth, val = held ? hv : v.at(t), ov = held ? ho : o.at(t);
      vp.style.width = px(W + Math.abs(ov)); vp.style.height = px(10 - Math.min(3.5, Math.abs(ov)*.07)); vp.style.transform = `translate(${px(Math.min(0, ov))}, -50%)`;
      vf.style.width = px(clamp(val)*(W + Math.abs(ov))); const pc = Math.round(clamp(val)*100); ro.textContent = pc + '%'; vr.setAttribute('aria-valuenow', pc); };
  }});
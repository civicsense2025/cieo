

atom({ id:'marquee', cat:'Media', name:'Marquee', block:'marquee, logo', fam:['T'],
  html:`<div class="mq" style="width:100%;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)"><div class="mr" style="display:flex;width:max-content"></div></div><div class="hint">Hover to slow it down</div>`,
  desc:'Offset is the closed-form integral of a speed spring, so slowing on hover is smooth and the position is still a pure function of time.',
  api:'x(t) = v₀t + Σ dᵢ·[(t − tᵢ) − R(t − tᵢ)],  R(T) = 2/ω(1 − e^{−ωT}) − Te^{−ωT}',
  init(st){
    const mq = $(st,'.mq'), mr = $(st,'.mr'), words = ['Field Notes','North Studio','The Ledger','Loop Press','Common Room','Paper Trail'];
    const one = words.map(w => `<span style="font-size:24px;font-weight:600;letter-spacing:-.02em;padding:0 22px;color:var(--muted)">${w}</span><span style="color:var(--line);font-size:24px">·</span>`).join('');
    mr.innerHTML = one + one;
    const w = S.soft.w, R = T => (2/w)*(1 - Math.exp(-w*T)) - T*Math.exp(-w*T);
    let v0 = REDUCE ? 0 : 1, c = 0, ev = [];
    const setV = v => { if (REDUCE) return; const cur = v0 + ev.reduce((s,e) => s + e.d, 0); if (v !== cur) ev.push({ t:now(), d:v - cur }); };
    mq.onpointerenter = () => setV(.15); mq.onpointerleave = () => setV(1);
    const pos = t => { let x = v0*t + c; for (const e of ev) if (t > e.t) x += e.d*((t - e.t) - R(t - e.t)); return x; };
    return t => { ev = ev.filter(e => { if (Math.exp(-w*(t - e.t)) < 1e-6){ v0 += e.d; c += e.d*(-e.t - 2/w); return false; } return true; });
      const half = mr.scrollWidth/2; mr.style.transform = `translateX(${px(-((pos(t)*60) % half))})`; };
  }});


atom({ id:'factcheck', cat:'Writing', name:'Source fact-check chips', block:'richtext editor, source list', fam:['S','M'],
  html:`<div class="col" style="gap:12px;align-items:center"><div class="fc row" style="gap:8px;flex-wrap:wrap;justify-content:center;max-width:360px"></div><button class="btn va" type="button">Verify all</button></div><div class="hint">Click a chip to toggle it</div>`,
  desc:'Each source swaps from unverified to verified in 100ms exit-then-enter while the chip width springs to fit. Verify all runs the same change down the row.',
  api:'chip: sw.to(v); w.set(fit(v)); tint.set(v)   all: each at t+i·.09',
  init(st){
    const host = $(st,'.fc');
    const chips = ['Harbor minutes', 'City budget PDF', 'Founder interview'].map(name => {
      const b = document.createElement('button'); b.className = 'btn'; b.type = 'button';
      b.style.cssText = 'position:relative;height:32px;overflow:hidden;white-space:nowrap';
      b.setAttribute('aria-pressed', 'false');
      const txt = { u:'\u25CF ' + name, v:'\u2713 ' + name }, L = {};
      for (const k of ['u','v']){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = txt[k]; b.appendChild(e); L[k] = e; }
      host.appendChild(b);
      const c = { b, L, txt, on:false, sw:new Swap('u'), w:new Track(0), tint:new Track(0) };
      c.w.jump(measureW(b, txt.u));
      b.onclick = () => go(c, !c.on, now());
      return c;
    });
    const go = (c, v, t) => { c.on = v; c.b.setAttribute('aria-pressed', String(v));
      const fw = measureW(c.b, c.txt[v ? 'v' : 'u']);
      if (REDUCE){ c.sw.cur = v ? 'v' : 'u'; c.sw.prev = null; c.w.jump(fw); c.tint.jump(v ? 1 : 0); }
      else { c.sw.to(v ? 'v' : 'u', t); c.w.set(fw, S.base, t); c.tint.set(v ? 1 : 0, S.base, t); } };
    $(st,'.va').onclick = () => { const t0 = now(); chips.forEach((c,i) => go(c, true, t0 + (REDUCE ? 0 : i*.09))); };
    return t => { for (const c of chips){ const g = clamp(c.tint.at(t));
      c.b.style.width = px(c.w.at(t));
      c.b.style.background = mix(g, 'var(--success-tint)', 'var(--card)');
      c.b.style.borderColor = mix(g, 'var(--success)', 'var(--line)');
      c.b.style.color = mix(g, 'var(--success)', 'var(--ink)');
      for (const k in c.L) c.sw.apply(c.L[k], k, t, 4); } };
  }});

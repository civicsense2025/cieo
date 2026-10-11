

atom({ id:'newsletter', cat:'Newsletter', name:'Subscribe', block:'newsletter', fam:['M','S'],
  html:`<div class="col" style="align-items:center;gap:8px"><form class="nf" novalidate style="position:relative;display:flex;gap:6px;height:48px;padding:4px;border:1.5px solid var(--muted);border-radius:24px;background:var(--card);overflow:hidden"><input id="nl-email" type="email" placeholder="you@example.com" aria-label="Email" style="flex:1;min-width:0;border:0;background:none;color:var(--ink);font:15px var(--sans);outline:none;padding:0 14px"><button class="sb" aria-label="Subscribe" style="position:relative;flex:none;height:40px;border-radius:20px;border:0;color:#fff;font-weight:500;cursor:pointer;overflow:hidden"></button><div class="done layer" style="font-weight:500;color:var(--success)"></div></form><div class="ne small" role="alert" style="color:var(--danger);height:20px"></div></div><button class="btn rs" style="position:absolute;top:10px;right:12px">Reset</button><div class="hint">Try an invalid address first, then a real one</div>`,
  desc:'An invalid address rings the field in the danger color and opens a message. A valid one shrinks the button into a spinner, turns it success-colored with a check, then morphs the whole field into a tinted confirmation pill.',
  api:'err.set(1) → ring(danger)   plan(loading, check → success, done → success-tint)',
  init(st){
    const nf = $(st,'.nf'), inp = $(st,'input'), sb = $(st,'.sb'), done = $(st,'.done'), ne = $(st,'.ne');
    const L = ['Subscribe', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9"/></svg>', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>'].map(h => { const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = h; sb.appendChild(e); return e; });
    const spin = $(L[1],'svg'); done.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg><span>You’re on the list</span>';
    const msgs = ['', 'Enter an address like name@example.com'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; ne.style.position = 'relative'; ne.style.width = '100%'; ne.appendChild(e); return e; });
    const sw = new Swap(0), msw = new Swap(0), bw = new Track(108), fw = new Track(320), dn = new Track(0), inO = new Track(1), ok = new Track(0), err = new Track(0); let q = [];
    const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
    nf.onsubmit = ev => { ev.preventDefault(); if (q.length || sw.cur) return;
      if (!valid()){ err.set(1); msw.to(1); inp.setAttribute('aria-invalid', true); inp.focus(); return; }
      err.set(0); msw.to(0); inp.removeAttribute('aria-invalid'); const t0 = now();
      q = [[t0, () => { sw.to(1); bw.set(40); }], [t0 + .9, () => { sw.to(2); ok.set(1); }], [t0 + 1.5, () => { inO.set(0, S.snap); fw.set(210); bw.set(210); dn.set(1, S.base, now() + .15); }]]; };
    inp.oninput = () => { if (err.target && valid()){ err.set(0); msw.to(0); inp.removeAttribute('aria-invalid'); } };
    $(st,'.rs').onclick = () => { q = []; sw.to(0); msw.to(0); ok.set(0); err.set(0); bw.set(108); fw.set(Math.min(320, st.clientWidth - 40)); dn.set(0, S.snap); inO.set(1, S.base, now() + .1); inp.value = ''; };
    fw.jump(Math.min(320, st.clientWidth - 40));
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      nf.style.width = px(fw.at(t)); sb.style.width = px(bw.at(t)); fade(inp, inO.at(t), null); inp.style.visibility = inO.target ? 'visible' : (inO.at(t) < .01 ? 'hidden' : 'visible');
      const g = clamp(ok.at(t)), k = clamp(err.at(t)), d = clamp(dn.at(t));
      sb.style.background = mix(g, 'var(--success)', 'var(--ink)'); sb.style.color = mix(g, '#fff', 'var(--card)');
      nf.style.background = mix(d, 'var(--success-tint)', 'var(--card)');
      nf.style.boxShadow = `0 0 0 1.5px color-mix(in oklab, var(--danger) ${(k*100).toFixed(1)}%, transparent), var(--shadow)`;
      L.forEach((e,i) => sw.apply(e,i,t)); msgs.forEach((e,i) => msw.apply(e,i,t)); spin.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
      fade(done, d, (1-d)*4); sb.style.opacity = (1 - d).toFixed(3); done.style.pointerEvents = 'none'; };
  }});
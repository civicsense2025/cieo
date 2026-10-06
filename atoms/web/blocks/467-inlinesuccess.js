

atom({ id:'inlinesuccess', cat:'Newsletter', name:'Inline success', block:'newsletter, subscribe', fam:['M','S'],
  html:`<div class="card col" style="width:min(360px,92%);padding:16px;gap:8px;line-height:1.55"><b style="font-size:15px;font-weight:600;line-height:1.5">Get the Sunday letter</b><span style="font-size:13.5px;line-height:1.55">One email a week. Unsubscribe any time.</span><form class="nf row" novalidate style="gap:8px;margin-top:8px"><input type="email" placeholder="you@example.com" aria-label="Email" style="flex:1;min-width:0;height:44px;border:1px solid var(--line);border-radius:10px;padding:0 12px;background:var(--bg);color:var(--ink);font-size:14px;line-height:1.5;outline:none"><button class="sb" style="position:relative;flex:none;height:44px;min-height:36px;border-radius:10px;border:0;background:var(--ink);color:var(--card);font-weight:600;font-size:14px;cursor:pointer;overflow:hidden"></button></form><div class="meta row" style="gap:8px;align-items:center"><span class="cnt num" style="font-variant-numeric:tabular-nums;font-size:13.5px"></span><span class="muted" style="font-size:12.5px;line-height:1.5">readers already in</span></div><div class="ref" style="position:relative;height:22px;font-size:12.5px;color:var(--muted);line-height:1.5"></div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="lp"> replayable demo</label></div><button class="btn rs" style="position:absolute;top:10px;right:12px;min-height:36px;border-radius:9px">Reset</button><div class="hint">Try a real address</div>`,
  desc:'A valid address shrinks the button into a spinner, then morphs it into a success pill. The count rides digits to the subscriber total and a referral line swaps in. The success state holds.',
  api:'sw.to(loading → done) · bw.set(44 → pill, S.base) · digits.set(total) · ref.to(1)',
  init(st){
    const inp = $(st,'input'), sb = $(st,'.sb'), cnt = $(st,'.cnt'), ref = $(st,'.ref'), nf = $(st,'.nf');
    const L = ['Subscribe','<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9"/></svg>','<span style="display:grid;place-items:center;padding:0;transform:translateY(.5px)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg></span>'].map(h => { const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = h; sb.appendChild(e); return e; });
    const spin = $(L[1],'svg');
    const R = ['','Refer a friend, skip the waitlist →'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; ref.appendChild(e); return e; });
    const sw = new Swap(0), rsw = new Swap(0), bw = new Track(120), ok = new Track(0), dn = new Track(0);
    const dg = new Digits(cnt, 5); dg.set('     ', true);
    const wOf = t => { const m = document.createElement('span'); m.textContent = t; Object.assign(m.style,{position:'absolute',visibility:'hidden',whiteSpace:'nowrap',font:'600 14px var(--sans)',padding:'0 18px'}); st.appendChild(m); const x = m.offsetWidth; m.remove(); return x; };
    let q = [], busy = false;
    const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
    nf.onsubmit = ev => { ev.preventDefault(); if (busy || sw.cur === 2) return;
      if (!valid()){ inp.focus(); inp.setAttribute('aria-invalid','true'); return; }
      inp.removeAttribute('aria-invalid'); busy = true; const t0 = now();
      if (REDUCE){ sw.cur = 2; sw.prev = null; sw.t = -9; bw.jump(wOf("You're in")); ok.jump(1); dn.jump(1); rsw.cur = 1; rsw.prev = 0; dg.set('12480', true); busy = false; return; }
      q = [[t0, () => { sw.to(1); bw.set(44); }],[t0 + .8, () => { sw.to(2); bw.set(wOf("You're in")); ok.set(1); }],[t0 + 1.1, () => { dn.set(1); dg.set('12480'); rsw.to(1); busy = false; }]]; };
    $(st,'.rs').onclick = () => { q = []; busy = false; sw.to(0); rsw.to(0); ok.set(0); dn.set(0, S.snap); bw.set(120); dg.set('     ', true); inp.value = ''; };
    bw.jump(120);
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      sb.style.width = px(bw.at(t)); sb.style.background = mix(clamp(ok.at(t)), 'var(--success)', 'var(--ink)');
      L.forEach((e,i) => sw.apply(e,i,t)); R.forEach((e,i) => rsw.apply(e,i,t)); dg.render(t);
      if (spin) spin.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
      cnt.style.opacity = dn.at(t).toFixed(3); ref.style.opacity = dn.at(t).toFixed(3); };
  }});

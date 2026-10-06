atom({ id:'viewchrome', cat:'Documents', name:'Viewer chrome', block:'document viewer, toolbar, auto-hide', fam:['M'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:center"><div class="card vc" style="width:100%;padding:14px 16px"><div class="bar row" style="gap:8px;align-items:center"><button class="btn pv" style="min-height:32px;border-radius:8px">‹</button><b class="pg" style="font-size:15px;font-variant-numeric:tabular-nums"></b><span class="small muted" style="font-size:12px">/ 12 · Contract.pdf</span><span style="flex:1"></span><button class="btn nx" style="min-height:32px;border-radius:8px">›</button></div><div class="body" style="position:relative;font-size:13.5px;line-height:1.6;min-height:72px;padding:12px 2px 0"></div><div class="ok small" style="position:relative;height:22px;font-size:12.5px"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="idl" checked> hide chrome after 2s idle</label></div><div class="hint">Tap › a few times, then stop moving</div>`,
  desc:'The toolbar and counter fade out after two idle seconds. Any pointer movement brings them back on a calm base spring. The page counter rolls its digits; the final page holds a success terminal instead of wrapping.',
  api:'idle.o.set(0) after 2s   act: o.set(1, base)   pg.set(n)   end: ok.to(1), hold',
  init(st){
    const bar = $(st,'.bar'), body = $(st,'.body'), ok = $(st,'.ok'), idl = $(st,'.idl');
    const P = ['§1 Parties agree to the spring delivery schedule.','§2 The market bell marks the opening of trade.','§3 Attention is paid in full on receipt.','§4 Care survives termination of this agreement.'];
    const L = P.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; body.appendChild(e); return e; });
    const O = ['', 'Caught up — nothing left to read ✓'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; ok.appendChild(e); return e; });
    const sw = new Swap(0), done = new Swap(0), o = new Track(1), dg = new Digits($(st,'.pg'), 2);
    let p = 0, timer = 0; dg.set('1', true);
    const arm = () => { clearTimeout(timer); if (idl.checked) timer = setTimeout(() => o.set(0, S.base), 2000); };
    st.addEventListener('pointermove', () => { o.set(1, S.base); arm(); });
    const go = d => { p = Math.min(P.length - 1, Math.max(0, p + d)); sw.to(p); dg.set(String(p + 1)); done.to(p === P.length - 1 ? 1 : 0); o.set(1, S.base); arm(); };
    $(st,'.pv').onclick = () => go(-1); $(st,'.nx').onclick = () => go(1); arm();
    return t => { const v = clamp(o.at(t)); fade(bar, v, (1 - v) * -8); body.style.opacity = (0.35 + 0.65 * v).toFixed(3);
      L.forEach((e,k) => sw.apply(e,k,t)); O.forEach((e,k) => done.apply(e,k,t)); dg.render(t);
      O[1].style.color = 'var(--success)'; };
  }});

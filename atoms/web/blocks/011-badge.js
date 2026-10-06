

atom({ id:'badge', cat:'Content', name:'Count badge', block:'badge, nav-menu', fam:['S','X'],
  html:`<div class="col" style="align-items:center;gap:24px;padding:32px;background:var(--card);border-radius:24px;box-shadow:var(--shadow)"><div style="position:relative"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><span class="bd" aria-live="polite" style="position:absolute;left:18px;top:-8px;height:24px;min-width:24px;padding:0 6px;border-radius:10px;background:var(--danger);color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;line-height:1"><span class="d"></span></span></div><div class="row"><button class="btn add">+1</button><button class="btn add9">+9</button><button class="btn clr">Clear</button></div></div>`,
  desc:'Digits roll up one slot at a time and slot widths spring, so 9 to 10 widens smoothly. The badge scales in from 60%.',
  api:'digits.set(n)   badge.o.set(n > 0 ? 1 : 0)',
  init(st){
    const bd = $(st,'.bd'), d = new Digits($(st,'.d'), 3), o = new Track(1); let n = 3; d.set(n, true);
    const upd = () => { o.set(n ? 1 : 0); if (n) d.set(Math.min(n, 999)); };
    $(st,'.add').onclick = () => { n++; upd(); }; $(st,'.add9').onclick = () => { n += 9; upd(); }; $(st,'.clr').onclick = () => { n = 0; upd(); };
    return t => { const p = clamp(o.at(t)); bd.style.opacity = p.toFixed(3); bd.style.transform = `scale(${(.6+.4*p).toFixed(4)})`; d.render(t); };
  }});
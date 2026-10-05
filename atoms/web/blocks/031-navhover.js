

/* ---------- Chrome ---------- */
atom({ id:'navhover', cat:'Chrome', name:'Nav hover', block:'nav-menu, site-header', fam:['E'],
  html:`<nav class="nv" style="position:relative;display:flex;gap:4px;padding:6px;border-radius:12px;background:var(--card);box-shadow:var(--shadow)"><i class="hl" style="position:absolute;top:6px;bottom:6px;left:0;border-radius:8px;background:var(--raised)"></i><i class="ul" style="position:absolute;bottom:3px;height:2px;left:0;border-radius:1px;background:var(--ink)"></i></nav>`,
  desc:'A hover plate follows the pointer with lagging edges and fades out on leave. The underline marks the current page with the same edge rule.',
  api:'plate.go(l, r); plate.o.set(hovering ? 1 : 0)',
  init(st){
    const nv = $(st,'.nv'), hl = $(st,'.hl'), ul = $(st,'.ul');
    const links = ['Work','Writing','About','Contact'].map(n => { const a = document.createElement('a'); a.href = '#'; a.textContent = n; a.style.cssText = 'position:relative;padding:7px 12px;font-size:14px;font-weight:500;color:var(--ink);text-decoration:none'; nv.appendChild(a); return a; });
    const h = edges(0,0), u = edges(0,0), o = new Track(0, S.snap); let cur = 0, shown = false;
    const g = a => [a.offsetLeft, a.offsetLeft + a.offsetWidth];
    links.forEach((a,i) => { a.onpointerenter = () => { const [l,r] = g(a); shown ? h.go(l,r) : h.jump(l,r); shown = true; o.set(1, S.base); };
      a.onclick = e => { e.preventDefault(); cur = i; const [l,r] = g(a); u.go(l + 12, r - 12); }; });
    nv.onpointerleave = () => { shown = false; o.set(0, S.snap); };
    const init = () => { const [l,r] = g(links[cur]); u.jump(l + 12, r - 12); }; document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => { const a = h.A.at(t), b = h.B.at(t); hl.style.transform = `translateX(${px(a)})`; hl.style.width = px(b - a); hl.style.opacity = clamp(o.at(t)).toFixed(3);
      const c = u.A.at(t), d = u.B.at(t); ul.style.transform = `translateX(${px(c)})`; ul.style.width = px(d - c); };
  }});
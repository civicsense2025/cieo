

atom({ id:'breadcrumbs', cat:'Content', name:'Breadcrumbs', block:'breadcrumbs', fam:['M','S'],
  html:`<nav class="bc row small" aria-label="Breadcrumb" style="gap:0;white-space:nowrap;max-width:92%"></nav><button class="btn cl" style="position:absolute;top:10px;right:12px">Collapse</button>`,
  desc:'Middle crumbs fold into one ellipsis button. Each crumb’s width springs to zero while its text fades, so the trail closes from the inside out.',
  api:'crumb.w.set(collapsed ? 0 : measured, S.base, t + i·0.03)',
  init(st){
    const bc = $(st,'.bc'), N = ['Home','Docs','Guides','Blocks','Tabs'];
    const sep = '<span style="color:var(--muted);padding:0 6px">/</span>';
    const parts = N.map((n,i) => { const w = document.createElement('span'); w.style.cssText = 'display:inline-flex;overflow:hidden'; w.innerHTML = (i ? sep : '') + `<a href="#" style="color:${i === N.length-1 ? 'var(--ink)' : 'var(--muted)'};text-decoration:none;font-weight:${i === N.length-1 ? 600 : 400}">${n}</a>`; bc.appendChild(w); $(w,'a').onclick = e => e.preventDefault(); return { w, full:0, tr:new Track(1) }; });
    const el = document.createElement('span'); el.style.cssText = 'display:inline-flex;overflow:hidden'; el.innerHTML = sep + '<button aria-label="Show full path" style="border:0;background:var(--raised);border-radius:6px;padding:0 6px;cursor:pointer;color:var(--muted)">…</button>'; bc.insertBefore(el, parts[1].w);
    const eo = new Track(0); let ew = 0, col = false;
    const measure = () => { parts.forEach(p => { p.w.style.width = 'auto'; p.full = p.w.offsetWidth; }); el.style.width = 'auto'; ew = el.offsetWidth; };
    const set = c => { col = c; const t0 = now(); [1,2,3].forEach((i,k) => parts[i].tr.set(c ? 0 : 1, S.base, t0 + k*.03)); eo.set(c ? 1 : 0, S.base, c ? t0 + .1 : t0); $(st,'.cl').textContent = c ? 'Expand' : 'Collapse'; };
    $(st,'.cl').onclick = () => set(!col); $(el,'button').onclick = () => set(false);
    document.fonts.ready.then(measure); measure();
    return t => { parts.forEach(p => { const k = clamp(p.tr.at(t)); p.w.style.width = px(p.full*k); p.w.style.opacity = k.toFixed(3); });
      const o = clamp(eo.at(t)); el.style.width = px(ew*o); el.style.opacity = o.toFixed(3); };
  }});
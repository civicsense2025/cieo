

atom({ id:'sidebar', cat:'Layout', name:'Collapsible sidebar', block:'section, Sidebar primitive', fam:['M','S'], wide:true,
  html:`<div class="card" style="width:min(560px,94%);height:210px;display:flex;overflow:hidden"><nav class="sb2" style="flex:none;border-right:1px solid var(--line-soft);padding:8px;overflow:hidden"><button class="tg2" aria-label="Collapse sidebar" aria-expanded="true" style="display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;cursor:pointer;padding:8px 10px;border-radius:8px;color:var(--muted)">${ic(I.side,18)}</button></nav><div class="small muted" style="flex:1;padding:14px">Collapse to icons and expand again. Labels leave before the width shrinks and return after it grows.</div></div>`,
  desc:'Collapsing fades every label first, then narrows the rail to its icons. Expanding widens the rail first, then brings labels back 30ms apart, so text never squeezes.',
  api:'collapse: labels.o→0, w.set(56, t + 0.1)   expand: w.set(200), labels at t + 0.12 + i·0.03',
  init(st){
    const sb = $(st,'.sb2'), tg = $(st,'.tg2'), N = [['Home',I.home],['Search',I.search],['Library',I.lib],['Account',I.user]];
    const it = N.map(([n,d],i) => { const a = document.createElement('a'); a.href = '#'; a.onclick = e => e.preventDefault(); a.style.cssText = `display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:8px;text-decoration:none;color:var(--ink);white-space:nowrap;${i === 0 ? 'background:var(--raised)' : ''}`;
      a.innerHTML = `<span style="flex:none;display:grid">${ic(d,18)}</span><span class="small lb" style="font-weight:500"></span>`; $(a,'.lb').textContent = n; sb.appendChild(a); return { lb:$(a,'.lb'), o:new Track(1) }; });
    const w = new Track(200); let open = true;
    tg.onclick = () => { open = !open; const t0 = now(); tg.setAttribute('aria-expanded', open); tg.setAttribute('aria-label', open ? 'Collapse sidebar' : 'Expand sidebar');
      if (open){ w.set(200); it.forEach((x,i) => x.o.set(1, S.base, t0 + .12 + i*.03)); } else { it.forEach(x => x.o.set(0, S.snap)); w.set(56, S.base, t0 + EXIT); } };
    return t => { sb.style.width = px(w.at(t)); it.forEach(x => fade(x.lb, x.o.at(t), null)); };
  }});
atom({ id:'sitemap', cat:'SEO', name:'Sitemap tree', block:'seo sitemap, tree', fam:['M','E','S'], tall:true,
  html:`<div class="col" style="width:min(340px,92%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Sitemap · 8 pages</b><div class="card tree" style="position:relative;padding:8px;overflow:hidden"></div><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="orp" checked> flag orphans</label></div></div>`,
  desc:'Folders open with height and chevron riding the same base spring, so they never disagree. Orphaned pages carry a warning tint, and the selection pill trails the tapped row on lagging edges.',
  api:'folder.h.set(kids) chev.set(open) same spring · sel.go(top, bot) trails .06',
  init(st){
    const tree = $(st,'.tree'), orp = $(st,'.orp');
    const D = [
      { n:'/', kids:['/pricing','/journal'], open:true },
      { n:'/journal', kids:['/journal/spring-launch','/journal/yearly-guide'], open:false },
      { n:'/changelog', orphan:true }
    ];
    const hi = document.createElement('i'); hi.style.cssText = 'position:absolute;left:8px;right:8px;top:0;border-radius:8px;background:var(--raised)'; tree.appendChild(hi);
    const sel = edges(0,0); sel.jump(8, 44);
    const folders = [];
    const rows = [];
    D.forEach((f,fi) => {
      const b = document.createElement('button'); b.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;border:0;background:none;cursor:pointer;padding:0 10px;min-height:36px;font-size:13.5px;font-weight:600;text-align:left;border-radius:8px';
      b.innerHTML = '<span class="cv" style="width:16px;height:16px;padding:0;display:grid;place-items:center;color:var(--muted);flex:none">▾</span><span style="flex:1">' + f.n + '</span>' + (f.orphan ? '<span class="og small" style="font-size:12px;color:var(--warning);font-weight:600">orphan</span>' : '');
      tree.appendChild(b);
      const wrap = document.createElement('div'); wrap.style.cssText = 'overflow:hidden;height:0'; tree.appendChild(wrap);
      const h = new Track(0), cv = new Track(f.open ? 1 : 0);
      const kids = (f.kids || []).map(k => { const r = document.createElement('button');
        r.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;border:0;background:none;cursor:pointer;padding:0 10px 0 34px;min-height:32px;font-size:13px;text-align:left;border-radius:8px';
        r.textContent = k; wrap.appendChild(r); rows.push(r); return r; });
      if (f.orphan){ const r = b; rows.push(r); }
      const F = { b, wrap, h, cv, kids, open:f.open, cvEl:$(b,'.cv') };
      folders.push(F);
      b.onclick = () => { if (f.orphan){ pick(b); return; }
        F.open = !F.open; b.setAttribute('aria-expanded', F.open);
        const to = F.open ? F.kids.length*32 : 0;
        if (REDUCE){ F.h.jump(to); F.cv.jump(F.open ? 1 : 0); } else { F.h.set(to); F.cv.set(F.open ? 1 : 0); }
        pick(b); };
      kids.forEach(k => k.onclick = () => pick(k));
    });
    const pick = el => { const top = el.offsetTop, bot = top + el.offsetHeight;
      if (REDUCE) sel.jump(top, bot); else sel.go(top, bot);
      rows.concat(folders.map(f => f.b)).forEach(r => r.setAttribute('aria-selected', r === el)); };
    const paintOrph = () => $$(st,'.og').forEach(e => e.style.display = orp.checked ? '' : 'none');
    orp.onchange = paintOrph;
    requestAnimationFrame(() => folders.forEach(F => { const to = F.open ? F.kids.length*32 : 0; F.h.jump(to); F.b.setAttribute('aria-expanded', F.open); }));
    return t => { folders.forEach(F => { F.wrap.style.height = px(Math.max(0, F.h.at(t)));
        F.cvEl.style.transform = 'rotate(' + ((1-clamp(F.cv.at(t)))*-90).toFixed(1) + 'deg) translateY(1px)'; });
      $$(st,'.og').forEach(e => e.closest('button').style.background = orp.checked ? 'color-mix(in oklab, var(--warning) 10%, transparent)' : 'none');
      plate(hi, sel.A.at(t), sel.B.at(t)); };
  }});

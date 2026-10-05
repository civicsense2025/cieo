

atom({ id:'layers', cat:'Design tools', name:'Layer tree', block:'page structure panel', fam:['M','E'], tall:true,
  html:`<div class="card lt" role="tree" aria-label="Layers" style="position:relative;width:min(280px,86%);padding:6px"><i class="hl" style="position:absolute;left:6px;right:6px;top:0;border-radius:7px;background:var(--raised)"></i></div>`,
  desc:'Groups open and close on a height spring with their chevrons turning. The selection plate slides between rows with lagging edges, and hiding a layer fades its name while the eye closes.',
  api:'group.h.set(open)   sel.go(top, bottom)   row.vis.set(shown)',
  init(st){
    const lt = $(st,'.lt'), hl = $(st,'.hl');
    const T = { n:'Hero', kids:[{ n:'Heading' },{ n:'Button', kids:[{ n:'Label' },{ n:'Icon' }] },{ n:'Image' }] };
    const rows = [], e = edges(0,0);
    const build = (node, depth, parent) => { const wrap = document.createElement('div'); const r = document.createElement('div'); r.setAttribute('role','treeitem'); r.style.cssText = `position:relative;display:flex;align-items:center;gap:6px;height:30px;padding-left:${8 + depth*16}px;padding-right:6px;font-size:13.5px;cursor:pointer;border-radius:7px`;
      r.innerHTML = `<span class="cv" style="width:14px;display:grid;place-items:center;color:var(--muted)">${node.kids ? ic(I.chev,12) : ''}</span><span class="nm" style="flex:1">${node.n}</span><button class="ey" aria-label="Hide ${node.n}" style="border:0;background:none;cursor:pointer;color:var(--muted);display:grid;padding:2px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="sl" d="M4 4l16 16" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></button>`;
      wrap.appendChild(r); parent.appendChild(wrap); const row = { r, nm:$(r,'.nm'), cv:$(r,'.cv svg'), sl:$(r,'.sl'), vis:new Track(1), open:new Track(1), box:null };
      if (node.kids){ const box = document.createElement('div'); box.style.overflow = 'hidden'; wrap.appendChild(box); row.box = box; node.kids.forEach(k => build(k, depth + 1, box)); r.setAttribute('aria-expanded','true');
        $(r,'.cv').onclick = ev => { ev.stopPropagation(); const o = row.open.target ? 0 : 1; row.open.set(o); r.setAttribute('aria-expanded', !!o); }; }
      $(r,'.ey').onclick = ev => { ev.stopPropagation(); row.vis.set(row.vis.target ? 0 : 1); };
      r.onclick = () => { const a = r.getBoundingClientRect(), b = lt.getBoundingClientRect(); e.go(a.top - b.top, a.bottom - b.top); }; rows.push(row); };
    build(T, 0, lt); requestAnimationFrame(() => { const a = rows[0].r.getBoundingClientRect(), b = lt.getBoundingClientRect(); e.jump(a.top - b.top, a.bottom - b.top); });
    return t => { rows.forEach(x => { const v = clamp(x.vis.at(t)); x.nm.style.opacity = (.35 + .65*v).toFixed(3); x.sl.style.strokeDashoffset = v.toFixed(3);
      if (x.box){ const o = clamp(x.open.at(t)); x.box.style.height = px(o*x.box.scrollHeight); x.box.style.opacity = o.toFixed(3); x.cv.style.transform = `rotate(${(-90*(1 - o)).toFixed(1)}deg)`; } }); plate(hl, e.A.at(t), e.B.at(t)); };
  }});
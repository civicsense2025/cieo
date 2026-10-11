

atom({ id:'layers', cat:'Design tools', name:'Layer tree', block:'page structure panel', fam:['M','E'], tall:true,
  html:`<div class="col" style="gap:16px;align-items:center;width:min(336px,calc(100% - 48px))"><div class="card lt" role="tree" aria-label="Layers" style="position:relative;width:100%;padding:8px"><i class="hl" style="position:absolute;left:8px;right:8px;top:0;border-radius:7px;background:var(--raised)"></i></div><div class="row small muted" style="gap:8px;flex-wrap:wrap;justify-content:center">Density<div class="seg ds" role="group" aria-label="Density" style="display:inline-flex"><div class="ind"></div><button type="button">Comfortable</button><button type="button">Dense</button></div><button type="button" class="th" aria-pressed="false" style="border:0;background:var(--raised);border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer">Thumbs</button></div></div>`,
  desc:'Groups open and close on a height spring with their chevrons turning. The selection plate slides between rows with lagging edges, and hiding a layer fades its name while the eye closes. Density switches row height; thumbs adds a color chip slot.',
  api:'group.h.set(open)   sel.go(top, bottom)   row.vis.set(shown)   density: rh.set(30|24)   thumbs.th.set(0|1)',
  init(st){
    const lt = $(st,'.lt'), hl = $(st,'.hl'), seg = $(st,'.ds'), ind = $(seg,'.ind'), dbtns = $$(seg,'button'), thb = $(st,'.th');
    const T = { n:'Hero', kids:[{ n:'Heading' },{ n:'Button', kids:[{ n:'Label' },{ n:'Icon' }] },{ n:'Image' }] };
    const TC = { Hero:'#595D17', Heading:'#B45309', Button:'#2F5DB0', Label:'#2F5DB0', Icon:'#85888C', Image:'#B0342F' };
    const rows = [], e = edges(0,0), rh = new Track(40), tho = new Track(0); let dense = 0, thumbs = 0, sel = 0;
    const de = edges(0,0);
    const build = (node, depth, parent) => { const wrap = document.createElement('div'); const r = document.createElement('div'); r.setAttribute('role','treeitem'); r.style.cssText = `position:relative;display:flex;align-items:center;gap:8px;height:40px;padding-left:${8 + depth*16}px;padding-right:8px;font-size:12px;cursor:pointer;border-radius:7px`;
      r.innerHTML = `<span class="tb" style="width:16px;height:16px;border-radius:5px;flex:none;background:${TC[node.n] || 'var(--raised)'};overflow:hidden"></span><span class="cv" style="width:14px;display:grid;place-items:center;color:var(--muted)">${node.kids ? ic(I.chev,12) : ''}</span><span class="nm" style="flex:1">${node.n}</span><button class="ey" aria-label="Hide ${node.n}" style="border:0;background:none;cursor:pointer;color:var(--muted);display:grid;padding:2px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="sl" d="M4 4l16 16" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></button>`;
      wrap.appendChild(r); parent.appendChild(wrap); const row = { r, nm:$(r,'.nm'), cv:$(r,'.cv svg'), sl:$(r,'.sl'), tb:$(r,'.tb'), vis:new Track(1), open:new Track(1), box:null };
      if (node.kids){ const box = document.createElement('div'); box.style.overflow = 'hidden'; wrap.appendChild(box); row.box = box; node.kids.forEach(k => build(k, depth + 1, box)); r.setAttribute('aria-expanded','true');
        $(r,'.cv').onclick = ev => { ev.stopPropagation(); const o = row.open.target ? 0 : 1; row.open.set(o); r.setAttribute('aria-expanded', !!o); }; }
      $(r,'.ey').onclick=ev=>{ev.stopPropagation();const visible=!row.vis.target;row.vis.set(visible?1:0);ev.currentTarget.setAttribute('aria-label',`${visible?'Hide':'Show'} ${node.n}`);ev.currentTarget.setAttribute('aria-pressed',String(!visible))};
      r.tabIndex=0;r.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();r.click()}if((ev.key==='ArrowLeft'||ev.key==='ArrowRight')&&row.box){ev.preventDefault();const open=ev.key==='ArrowRight';row.open.set(open?1:0);r.setAttribute('aria-expanded',String(open))}};r.onclick = () => { sel = rows.indexOf(row);rows.forEach(x=>x.r.setAttribute('aria-selected',String(x===row))); const a = r.getBoundingClientRect(), b = lt.getBoundingClientRect(); e.go(a.top - b.top, a.bottom - b.top); }; rows.push(row); };
    build(T, 0, lt); requestAnimationFrame(() => { const a = rows[0].r.getBoundingClientRect(), b = lt.getBoundingClientRect(); e.jump(a.top - b.top, a.bottom - b.top); });
    const pickDense = (i, inst) => { dense = i; const b = dbtns[i]; inst ? de.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : de.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); rh.set(i ? 32 : 40);
      requestAnimationFrame(() => { const r = rows[sel] && rows[sel].r; if (!r) return; const a = r.getBoundingClientRect(), bb = lt.getBoundingClientRect(); e.go(a.top - bb.top, a.bottom - bb.top); }); };
    dbtns.forEach((b,i) => b.onclick = () => pickDense(i)); requestAnimationFrame(() => pickDense(0, true)); document.fonts && document.fonts.ready.then(() => pickDense(dense, true));
    thb.onclick = () => { thumbs = thumbs ? 0 : 1; tho.set(thumbs); thb.setAttribute('aria-pressed', !!thumbs); thb.style.background = thumbs ? 'var(--ink)' : 'var(--raised)'; thb.style.color = thumbs ? 'var(--card)' : 'inherit'; };
    return t => { const H = rh.at(t), th = clamp(tho.at(t));
      rows.forEach(x => { const v = clamp(x.vis.at(t)); x.r.style.height = px(H); x.nm.style.opacity = (.35 + .65*v).toFixed(3); x.sl.style.strokeDashoffset = v.toFixed(3);
        x.tb.style.opacity = th.toFixed(3); x.tb.style.width = px(16*th); x.tb.style.marginRight = px(-6*(1 - th)); x.tb.style.visibility = th < .05 ? 'hidden' : 'visible';
        if (x.box){ const o = clamp(x.open.at(t)); x.box.style.height = px(o*x.box.scrollHeight); x.box.style.opacity = o.toFixed(3); if (x.cv) x.cv.style.transform = `rotate(${(-90*(1 - o)).toFixed(1)}deg)`; } });
      plate(hl, e.A.at(t), e.B.at(t));
      const a = de.A.at(t), b = de.B.at(t); Object.assign(ind.style, { transform:`translate(${px(a)},3px)`, width:px(Math.max(0, b - a)), height:'calc(100% - 6px)' }); };
  }});

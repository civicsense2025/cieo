atom({ id:'backflow', cat:'SEO', name:'Backlink flow', block:'seo backlinks, flow', fam:['M','S','E'], wide:true,
  html:`<div class="col" style="width:min(560px,94%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Backlinks → /spring-launch</b><div class="row" style="gap:12px;align-items:stretch"><svg class="ed" viewBox="0 0 200 148" width="200" height="148" style="flex:none" aria-hidden="true"><path class="e0" d="M6 22 C70 22 70 74 194 74" fill="none" stroke="var(--accent)" stroke-width="2" pathLength="100" stroke-dasharray="100"/><path class="e1" d="M6 74 C70 74 70 74 194 74" fill="none" stroke="var(--accent)" stroke-width="2" pathLength="100" stroke-dasharray="100"/><path class="e2" d="M6 126 C70 126 70 74 194 74" fill="none" stroke="var(--accent)" stroke-width="2" pathLength="100" stroke-dasharray="100" opacity=".45"/></svg><div class="col src" style="flex:1;gap:0;justify-content:space-around"></div><div class="card dt" style="flex:1;padding:14px 16px;position:relative;min-height:120px"></div></div><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="lst" checked> show lost link</label></div></div>`,
  desc:'Edges draw source-first on the lazy spring, one after another. Hovering a source thickens its edge on snap and swaps the detail card; the last inspected link holds as the terminal state.',
  api:'edge[i].set(100, lazy, t+i*.12) hover: w.set(4, snap) detail.swap.to(i)',
  init(st){
    const S3 = [
      { n:'newsletter.report', d:'DR 72 · dofollow', c:'2.1k visits/mo · anchor “member pricing”' },
      { n:'presskit.example', d:'DR 58 · dofollow', c:'940 visits/mo · anchor “spring launch”' },
      { n:'oldblog.example', d:'lost · 404', c:'Link broke Mar 12 — reclaim it with a 301 to /spring-launch.' }
    ];
    const src = $(st,'.src'), dt = $(st,'.dt'), lst = $(st,'.lst');
    const paths = [$$(st,'.e0')[0], $$(st,'.e1')[0], $$(st,'.e2')[0]];
    const dr = paths.map(() => new Track(0, S.lazy)), wd = paths.map(() => new Track(2, S.snap));
    const sw = new Swap(0);
    const L = S3.map((s,i) => { const e = document.createElement('div'); e.className = 'layer';
      Object.assign(e.style,{alignItems:'flex-start',justifyContent:'flex-start',flexDirection:'column',gap:'4px',padding:'0',whiteSpace:'normal',textAlign:'left'});
      e.innerHTML = '<b style="font-size:14px">' + s.n + '</b><span class="small muted" style="font-size:12.5px;line-height:1.5">' + s.d + '</span><span style="font-size:13px;line-height:1.55">' + s.c + '</span>';
      dt.appendChild(e); return e; });
    const btns = S3.map((s,i) => { const b = document.createElement('button');
      b.style.cssText = 'display:flex;align-items:center;gap:8px;background:var(--raised);border-radius:10px;padding:8px 10px;cursor:pointer;font-size:13px;font-weight:500;text-align:left;min-height:36px;width:100%';
      b.innerHTML = '<i style="flex:none;width:10px;height:10px;border-radius:50%;background:' + (i === 2 ? 'var(--warning)' : 'var(--success)') + '"></i><span>' + s.n + '</span>';
      const w = document.createElement('div'); w.style.padding = '4px 0'; w.appendChild(b); src.appendChild(w);
      const hov = () => { const t0 = now(); paths.forEach((p,j) => wd[j].set(j === i ? 4.5 : 2, S.snap, t0)); sw.to(i); };
      b.onpointerenter = hov; b.onfocus = hov; b.onclick = hov;
      if (i === 2) b.classList.add('lost');
      return b; });
    lst.onchange = () => { btns[2].parentNode.style.display = lst.checked ? '' : 'none'; paths[2].style.display = lst.checked ? '' : 'none'; };
    const t0 = now();
    if (REDUCE){ dr.forEach(d => d.jump(100)); } else { dr.forEach((d,i) => { d.jump(0); d.set(100, S.lazy, t0 + .15 + i*.12); }); }
    sw.to(0);
    return t => { paths.forEach((p,i) => { p.style.strokeDashoffset = (100 - dr[i].at(t)).toFixed(2); p.style.strokeWidth = wd[i].at(t).toFixed(2); });
      L.forEach((el,k) => sw.apply(el,k,t)); };
  }});

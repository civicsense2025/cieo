

atom({ id:'tablesort', cat:'Data', name:'Sortable table', block:'table', fam:['M','T'], tall:true,
  html:`<div class="card" style="width:min(380px,92%);overflow:hidden"><div class="th row small" style="height:36px;padding:0 14px;border-bottom:1px solid var(--line);gap:0"></div><div class="tb" style="position:relative;height:180px"></div></div>`,
  desc:'Sorting never re-renders the rows. Each row springs to its new slot with a 20ms stagger, and the header arrow turns on the same spring.',
  api:'row.y.set(rank·36, S.base, t + rank·0.02)   arrow.set(asc ? 0 : 180)',
  init(st){
    const th = $(st,'.th'), tb = $(st,'.tb'), D = [['Pricing',4210,'2d'],['About',1380,'5h'],['Journal',2960,'1d'],['Contact',640,'3w'],['Home',8820,'1h']];
    const cols = [['Page','name',1.4],['Views','views',1],['Updated','age',1]];
    const hs = cols.map(([l,k,f]) => { const b = document.createElement('button'); b.style.cssText = `flex:${f};display:flex;align-items:center;gap:4px;border:0;background:none;padding:0;font:600 12.5px var(--sans);color:var(--muted);cursor:pointer;justify-content:${k === 'name' ? 'flex-start' : 'flex-end'}`;
      b.innerHTML = `${l}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>`; th.appendChild(b); return { b, k, ar:$(b,'svg'), rot:new Track(0), o:new Track(0) }; });
    const age = s => ({ h:1, d:24, w:168 })[s.slice(-1)]*parseInt(s);
    const rows = D.map(([n,v,a],i) => { const r = document.createElement('div'); r.className = 'row small'; r.style.cssText += 'position:absolute;left:0;right:0;top:0;height:36px;padding:0 14px;gap:0;border-bottom:1px solid var(--line-soft)';
      r.innerHTML = `<span style="flex:1.4;font-weight:500">${n}</span><span class="num" style="flex:1;text-align:right">${v.toLocaleString('en-US')}</span><span class="num muted" style="flex:1;text-align:right">${a} ago</span>`;
      tb.appendChild(r); return { r, name:n, views:v, age:age(a), y:new Track(i*36) }; });
    let key = null, asc = true;
    hs.forEach(h => h.b.onclick = () => { asc = key === h.k ? !asc : h.k === 'name'; key = h.k; const t0 = now();
      hs.forEach(x => { x.o.set(x === h ? 1 : 0); }); h.rot.set(asc ? 0 : 180);
      const s = rows.slice().sort((a,b) => (typeof a[key] === 'string' ? a[key].localeCompare(b[key]) : a[key] - b[key])*(asc ? 1 : -1));
      s.forEach((r,i) => r.y.set(i*36, S.base, t0 + i*.02)); });
    return t => { rows.forEach(r => r.r.style.transform = `translateY(${px(r.y.at(t))})`);
      hs.forEach(h => { const o = clamp(h.o.at(t)); h.ar.style.opacity = o.toFixed(3); h.ar.style.transform = `rotate(${h.rot.at(t).toFixed(1)}deg)`; h.b.style.color = mix(o,'var(--ink)','var(--muted)'); }); };
  }});
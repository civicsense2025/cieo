

atom({ id:'avatars', cat:'Content', name:'Avatar group', block:'profile-header, testimonial, Avatar', fam:['M','X'],
  html:`<div class="ag" style="position:relative;height:40px;width:220px"></div><div class="hint">Hover the group, then a face</div>`,
  desc:'Hovering the stack fans the avatars apart with a 30ms stagger. Hovering one face shows its name above it with the popover rule.',
  api:'avatar[i].x.set(open ? i·44 : i·24, S.base, t + i·0.03)',
  init(st){
    const ag = $(st,'.ag'), P = [['MC','Maya Chen','var(--accent)'],['TP','Theo Park','var(--ink)'],['AK','Ada Kim','var(--muted)'],['JW','Jonas Weber','var(--faint)'],['+3','3 more','var(--raised)']];
    const av = P.map(([s,n,c],i) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;top:0;width:40px;height:40px;border-radius:50%;background:${c};color:${i === 4 ? 'var(--ink)' : 'var(--card)'};border:2px solid var(--tile);display:grid;place-items:center;font:600 12px var(--sans);z-index:${10 - i}`;
      d.innerHTML = `${s}<span class="tp" style="position:absolute;z-index:30;bottom:calc(100% + 8px);left:50%;transform-origin:50% 100%;white-space:nowrap;background:var(--ink);color:var(--card);font:500 12px var(--sans);padding:4px 8px;border-radius:6px;visibility:hidden"></span>`; $(d,'.tp').textContent = n;
      ag.appendChild(d); const a = { d, tp:$(d,'.tp'), x:new Track(i*24), o:new Track(0) }; d.onpointerenter = () => a.o.set(1); d.onpointerleave = () => a.o.set(0, S.snap); return a; });
    const set = open => { const t0 = now(); av.forEach((a,i) => a.x.set(i*(open ? 44 : 24), S.base, t0 + i*.03)); };
    ag.onpointerenter = () => set(true); ag.onpointerleave = () => set(false);
    return t => av.forEach(a => { a.d.style.transform = `translateX(${px(a.x.at(t))})`; const p = clamp(a.o.at(t)); a.tp.style.opacity = p.toFixed(3); a.tp.style.visibility = p < .01 ? 'hidden' : 'visible'; a.tp.style.transform = `translate(-50%, ${px((1-p)*4)}) scale(${(.97+.03*p).toFixed(4)})`; });
  }});
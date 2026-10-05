

atom({ id:'navbar', cat:'Navigation', name:'Bottom navigation bar', block:'site-header (mobile), Material navigation bar', fam:['M'],
  html:`<div class="card nb" role="tablist" style="display:flex;width:min(320px,90%);padding:10px 6px"></div>`,
  desc:'The active indicator pill grows outward from the icon’s center while the previous one shrinks back into it. Icon and label ink in on the same spring.',
  api:'pill[i].w.set(active ? 56 : 0)   label.weight = active',
  init(st){
    const nb = $(st,'.nb'), N = [['Home',I.home],['Search',I.search],['Library',I.lib],['Profile',I.user]];
    const it = N.map(([n,d],i) => { const b = document.createElement('button'); b.setAttribute('role','tab'); b.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:none;cursor:pointer;padding:0';
      b.innerHTML = `<span style="position:relative;width:56px;height:30px;display:grid;place-items:center"><i style="position:absolute;top:0;bottom:0;left:50%;border-radius:15px;background:var(--accent-tint)"></i><span style="position:relative">${ic(d,20,1.9)}</span></span><span class="small">${n}</span>`;
      nb.appendChild(b); return { b, pill:$(b,'i'), icon:$(b,'span span'), lb:$$(b,'span')[2], w:new Track(i === 0 ? 1 : 0) }; });
    it.forEach((x,i) => x.b.onclick = () => it.forEach((y,j) => { y.w.set(j === i ? 1 : 0); y.b.setAttribute('aria-selected', j === i); }));
    return t => it.forEach(x => { const p = clamp(x.w.at(t)); x.pill.style.width = px(56*p); x.pill.style.marginLeft = px(-28*p); x.pill.style.opacity = Math.min(1, p*3).toFixed(3);
      x.icon.style.color = mix(p,'var(--ink)','var(--muted)'); x.lb.style.color = mix(p,'var(--ink)','var(--muted)'); x.lb.style.fontWeight = p > .5 ? 600 : 400; });
  }});
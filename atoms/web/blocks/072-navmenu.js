

atom({ id:'navmenu', cat:'Navigation', name:'Navigation menu', block:'nav-menu, site-header', fam:['M','S','X'], wide:true, tall:true,
  html:`<div class="nm" style="position:absolute;top:24px;left:50%;transform:translateX(-50%);width:min(560px,94%)"><nav class="row card tb" style="padding:6px;gap:2px;justify-content:center"></nav><div class="pn card" style="position:absolute;top:56px;left:0;overflow:hidden;visibility:hidden;transform-origin:50% 0"></div></div>`,
  desc:'Moving between triggers keeps one panel open and morphs its position, width and height to the new content. The content slides in from the side you moved toward.',
  api:'pn.{x,w,h}.set(target)   content.to(i, dir)',
  init(st){
    const nm = $(st,'.nm'), tb = $(st,'.tb'), pn = $(st,'.pn');
    const D = [['Product',[['Editor','Write and lay out pages'],['Members','Paid and free tiers'],['Commerce','Sell from any page'],['Analytics','Private, cookie-free']], 2],
      ['Resources',[['Docs','Guides and reference'],['Templates','Starting points'],['Changelog','What shipped']], 1],
      ['Company',[['About','Who builds Lamina'],['Careers','Two open roles']], 1]];
    const trig = D.map(([n]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'border-color:transparent;background:none;display:flex;gap:4px;align-items:center'; b.innerHTML = n + ic(I.chev,12); tb.appendChild(b); return b; });
    const panes = D.map(([,items,cols]) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;top:0;padding:12px;display:grid;grid-template-columns:repeat(${cols},190px);gap:4px`;
      d.innerHTML = items.map(([a,b]) => `<a href="#" style="display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:var(--ink)"><b class="small" style="display:block">${a}</b><span class="small muted">${b}</span></a>`).join(''); pn.appendChild(d);
      $$(d,'a').forEach(a => { a.onclick = e => e.preventDefault(); a.onpointerenter = () => a.style.background = 'var(--raised)'; a.onpointerleave = () => a.style.background = 'none'; }); return d; });
    const o = new Track(0), X = new Track(0), Wt = new Track(0), Ht = new Track(0), sw = new Swap(-1); let cur = -1, dir = 1, closeAt = 0;
    const show = i => { closeAt = 0; const p = panes[i], w = p.offsetWidth, h = p.offsetHeight, b = trig[i], NW = nm.clientWidth, x = clamp(b.offsetLeft + b.offsetWidth/2 - w/2, 0, Math.max(0, NW - w));
      const k = cur < 0 || !o.target ? 'jump' : 'set'; X[k](x); Wt[k](w); Ht[k](h); dir = i > cur ? 1 : -1; if (k === 'jump') { sw.cur = i; sw.prev = null; sw.t = -9; } else sw.to(i); cur = i; o.set(1);
      trig.forEach((t2,j) => t2.style.background = j === i ? 'var(--raised)' : 'none'); };
    trig.forEach((b,i) => { b.onpointerenter = () => show(i); b.onclick = () => show(i); b.onfocus = () => show(i); });
    nm.onpointerleave = () => closeAt = now() + .15; nm.onpointerenter = () => closeAt = 0;
    outside(st, [nm], () => { o.set(0, S.snap); trig.forEach(t2 => t2.style.background = 'none'); });
    return t => { if (closeAt && t >= closeAt){ closeAt = 0; o.set(0, S.snap); trig.forEach(t2 => t2.style.background = 'none'); }
      pop(pn, o.at(t)); pn.style.left = px(X.at(t)); pn.style.width = px(Wt.at(t)); pn.style.height = px(Ht.at(t));
      panes.forEach((p,k) => { sw.apply(p, k, t, 0); const q = parseFloat(p.style.opacity) || 0; p.style.transform = `translateX(${px((1-q)*20*(k === sw.cur ? dir : -dir))})`; p.style.pointerEvents = k === sw.cur ? 'auto' : 'none'; }); };
  }});
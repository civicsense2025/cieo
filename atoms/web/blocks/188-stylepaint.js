

atom({ id:'stylepaint', cat:'Writing', name:'Style gallery painter', block:'style gallery, doc preview', fam:['M','E','S'], tall:true,
  html:`<div class="col" style="width:min(340px,90%);gap:16px"><div class="pk row card" style="position:relative;gap:2px;padding:4px"></div><div class="row small" style="gap:8px;align-items:center"><span class="muted">Style</span><span class="nm" style="position:relative;display:inline-block;min-width:90px;height:24px;overflow:hidden;font-weight:600"></span></div><div class="doc card" style="padding:24px"><div class="tt" style="font-weight:650;margin-bottom:8px">The spring collection opens Thursday</div><div class="pp small muted" style="line-height:1.6">Members get first-day access to every drop, in stores and online.</div></div></div><div class="hint">Choose a style to preview it</div>`,
  desc:'Hovering a style plate slides its highlight over, the style name swaps, and the doc preview retargets size and tint. Leaving keeps the last style.',
  api:'hl.go(l,r,S.base); name.to(i)   doc.size.set(s,S.soft)   REDUCE: jump',
  init(st){
    const pk = $(st,'.pk'), nm = $(st,'.nm'), tt = $(st,'.tt'), e = edges(0, 0);
    const ST = [{ n:'Memo', s:15, c:0 }, { n:'Brief', s:18, c:.5 }, { n:'Manuscript', s:21, c:1 }];
    const sw = new Swap(0), size = new Track(15, S.soft), tint = new Track(0, S.soft);
    const layers = ST.map(s => { const l = document.createElement('span'); l.className = 'layer'; l.textContent = s.n; nm.appendChild(l); return l; });
    const hl = document.createElement('i'); hl.style.cssText = 'position:absolute;top:4px;bottom:4px;border-radius:8px;background:var(--raised);pointer-events:none'; pk.appendChild(hl);
    const btns = ST.map((s,i) => { const b = document.createElement('button'); b.type='button';b.className='btn';b.setAttribute('aria-pressed',String(i===0)); b.textContent = s.n; b.style.cssText += ';position:relative;z-index:1;background:none;border:0;box-shadow:none'; b.onmouseenter=()=>pick(i);b.onfocus=()=>pick(i); b.onclick = () => pick(i); b.style.flex='1';b.style.minWidth='0';b.style.padding='8px';pk.appendChild(b);return b; });
    const pick=i=>{btns.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j))); const t = now(), b = btns[i], l = b.offsetLeft, r = l + b.offsetWidth;
      if (REDUCE){ sw.cur = i; sw.prev = null; sw.t = -9; e.jump(l, r); size.jump(ST[i].s); tint.jump(ST[i].c); }
      else { sw.to(i); e.go(l, r, t); size.set(ST[i].s, S.soft, t); tint.set(ST[i].c, S.soft, t); } };
    requestAnimationFrame(() => e.jump(btns[0].offsetLeft, btns[0].offsetLeft + btns[0].offsetWidth));
    return t => { layers.forEach((l,k) => sw.apply(l, k, t)); hl.style.left = px(e.A.at(t)); hl.style.width = px(Math.max(0, e.B.at(t) - e.A.at(t)));
      tt.style.fontSize = px(size.at(t)); tt.style.color = mix(clamp(tint.at(t)), 'var(--ink)', 'var(--ink)'); tt.style.opacity = (.72 + .28*clamp(tint.at(t))).toFixed(3); };
  }});



atom({ id:'lightbox', cat:'Media', name:'Gallery lightbox', block:'gallery, image', fam:['M','X'], tall:true,
  html:`<div class="gg" style="display:grid;grid-template-columns:repeat(3,76px);gap:8px"></div><div class="scrim" style="position:absolute;inset:0;background:var(--bg);pointer-events:none;opacity:0"></div><div class="big" style="position:absolute;overflow:hidden;cursor:zoom-out;display:none"></div><div class="cap small" style="position:absolute;left:0;right:0;bottom:12px;text-align:center"></div>`,
  desc:'The thumbnail itself grows to fill the frame: position, size and radius each spring from its measured rect. Closing reverses into the same slot.',
  api:'box.{x,y,w,h,r}.set(open ? frame : thumbRect)',
  init(st){
    const gg = $(st,'.gg'), big = $(st,'.big'), scrim = $(st,'.scrim'), cap = $(st,'.cap');
    const C = [['var(--ink)','Harbor, 6am'],['var(--accent)','Moss study'],['var(--muted)','Concrete stair'],['var(--raised)','Fog bank'],['var(--faint)','Window light'],['var(--accent-tint)','Linen']];
    const art = c => `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><rect width="100" height="100" fill="${c}"/><circle cx="72" cy="30" r="12" fill="var(--card)" opacity=".5"/><path d="M0 80 L35 52 L60 72 L100 45 L100 100 L0 100Z" fill="var(--card)" opacity=".25"/></svg>`;
    const th = C.map(([c]) => { const b = document.createElement('button'); b.style.cssText = 'width:76px;height:76px;border:0;padding:0;border-radius:10px;overflow:hidden;cursor:zoom-in'; b.innerHTML = art(c); gg.appendChild(b); return b; });
    const T = { x:new Track(0), y:new Track(0), w:new Track(0), h:new Track(0), r:new Track(10), o:new Track(0) }; let cur = -1, open = false;
    const rectOf = el => { const a = el.getBoundingClientRect(), s = st.getBoundingClientRect(); return [a.left - s.left, a.top - s.top, a.width, a.height]; };
    const setBox = ([x,y,w,h], r, inst) => { const k = inst ? 'jump' : 'set'; T.x[k](x); T.y[k](y); T.w[k](w); T.h[k](h); T.r[k](r); };
    th.forEach((b,i) => b.onclick = () => { cur = i; open = true; big.innerHTML = art(C[i][0]); big.style.display = 'block'; setBox(rectOf(b), 10, true); const W = st.clientWidth, H = st.clientHeight, s = Math.min(W - 40, H - 60); setBox([(W - s)/2, 16, s, s - 16], 14); T.o.set(1); cap.textContent = C[i][1]; });
    big.onclick = () => { open = false; setBox(rectOf(th[cur]), 10); T.o.set(0, S.snap); };
    return t => { if (cur < 0) return; const settled = !open && T.x.prune(t) + T.w.prune(t) + T.y.prune(t) === 0;
      Object.assign(big.style, { left:px(T.x.at(t)), top:px(T.y.at(t)), width:px(T.w.at(t)), height:px(T.h.at(t)), borderRadius:px(T.r.at(t)) });
      const o = clamp(T.o.at(t)); scrim.style.opacity = (o*.92).toFixed(3); fade(cap, o, (1-o)*6);
      th.forEach((b,i) => b.style.visibility = i === cur && !settled ? 'hidden' : 'visible');
      if (settled){ big.style.display = 'none'; th[cur].style.visibility = 'visible'; cur = -1; } };
  }});
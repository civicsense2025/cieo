

atom({ id:'canvaszoom', cat:'Design tools', name:'Canvas pan and zoom', block:'diagram, gallery (zoom)', fam:['D','T'], wide:true, tall:true,
  html:`<div class="vp card" style="position:relative;width:min(600px,94%);height:280px;overflow:hidden;cursor:grab;touch-action:none;background:var(--bg)"><div class="wd" style="position:absolute;left:0;top:0;width:900px;height:600px;transform-origin:0 0;background-image:radial-gradient(var(--line) 1px, transparent 1px);background-size:24px 24px"><div class="card" style="position:absolute;left:160px;top:120px;width:220px;height:150px;padding:14px"><b>Hero</b><p class="small muted" style="margin:6px 0 0">Headline, one line of support, one button.</p></div><div style="position:absolute;left:440px;top:180px;width:140px;height:140px;border-radius:50%;background:var(--accent)"></div><div class="card" style="position:absolute;left:300px;top:340px;width:260px;height:90px;padding:14px"><b class="small">Pricing</b></div></div><div class="row" style="position:absolute;right:10px;bottom:10px;gap:4px"><button class="btn zo" aria-label="Zoom out">−</button><span class="zl btn num" style="min-width:56px;text-align:center"></span><button class="btn zi" aria-label="Zoom in">+</button><button class="btn ft">Fit</button></div></div><div class="hint" style="bottom:2px">Drag to pan · scroll or pinch to zoom toward the pointer</div>`,
  desc:'Zoom keeps the point under the pointer fixed, so you zoom into what you are looking at. Pan follows the drag exactly and coasts briefly after release.',
  api:'s′ = s·e^(−Δ·0.002);  t′ = c − (c − t)·s′/s   pan: release(x, v, x + v·0.25)',
  init(st){
    const vp = $(st,'.vp'), wd = $(st,'.wd'), zl = $(st,'.zl'), s = new Track(1, S.snap), X = new Track(-60, S.soft), Y = new Track(-60, S.soft); let held = false, hx = 0, hy = 0, sx = 0, sy = 0;
    const zoomAt = (ns, cx, cy) => { ns = clamp(ns, .3, 3); const k = ns/s.target; X.set(cx - (cx - X.target)*k, S.snap); Y.set(cy - (cy - Y.target)*k, S.snap); s.set(ns); };
    vp.addEventListener('wheel', e => { e.preventDefault(); const r = vp.getBoundingClientRect(); zoomAt(s.target*Math.exp(-e.deltaY*.002*(e.ctrlKey ? 4 : 1)), e.clientX - r.left, e.clientY - r.top); }, { passive:false });
    drag(vp, { down:p => { held = true; sx = X.at() - p.cx; sy = Y.at() - p.cy; hx = X.at(); hy = Y.at(); vp.style.cursor = 'grabbing'; },
      move:p => { if (!held) return; hx = sx + p.cx; hy = sy + p.cy; }, up:(p, v) => { if (!held) return; held = false; vp.style.cursor = 'grab'; X.release(hx, v.vx, hx + v.vx*.25, S.soft); Y.release(hy, v.vy, hy + v.vy*.25, S.soft); } });
    $$(vp,'button').forEach(b => b.addEventListener('pointerdown', e => e.stopPropagation()));
    const c = () => [vp.clientWidth/2, vp.clientHeight/2];
    $(st,'.zi').onclick = () => zoomAt(s.target*1.25, ...c()); $(st,'.zo').onclick = () => zoomAt(s.target/1.25, ...c());
    $(st,'.ft').onclick = () => { const ns = Math.min(vp.clientWidth/900, vp.clientHeight/600)*1.6; s.set(ns); X.set((vp.clientWidth - 900*ns)/2 + 40*ns, S.snap); Y.set((vp.clientHeight - 600*ns)/2 - 20*ns, S.snap); };
    return t => { const k = s.at(t); wd.style.transform = `translate(${px(held ? hx : X.at(t))},${px(held ? hy : Y.at(t))}) scale(${k.toFixed(4)})`; zl.textContent = Math.round(s.target*100) + '%'; };
  }});


atom({ id:'reorder', cat:'Dynamic', name:'Drag to reorder', block:'collection, nav-menu editor, list', fam:['D','M'], tall:true,
  html:`<div class="ro2" style="position:relative;width:min(300px,88%);height:246px"></div>`,
  desc:'The held row lifts and follows the pointer exactly. The others spring aside the moment it crosses their midpoint. On release it settles into its slot from your release velocity.',
  api:'held.y = pointer   others.y.set(slot)   held.y.release(y, vy, slot·50)',
  init(st){
    const box = $(st,'.ro2'), N = ['Home','About','Journal','Shop','Contact'], R = 50;
    const rows = N.map((n,i) => { const r = document.createElement('div'); r.className = 'card row'; r.style.cssText += 'position:absolute;left:0;right:0;top:0;height:44px;padding:0 12px;gap:10px;touch-action:none;cursor:grab';
      r.innerHTML = `<span style="color:var(--faint)">${ic(I.grip,16)}</span><span class="small" style="font-weight:500;flex:1">${n}</span><span class="small muted num"></span>`; box.appendChild(r); return { r, n, num:$$(r,'span')[2], y:new Track(i*R), lift:new Track(0, S.snap) }; });
    let order = rows.slice(), held = null, hy = 0, sy = 0;
    const lay = () => order.forEach((r,i) => { if (r !== held) r.y.set(i*R); r.num.textContent = i + 1; });
    rows.forEach(r => drag(r.r, { down:p => { held = r; sy = r.y.at() - p.cy; hy = r.y.at(); r.lift.set(1); r.r.style.zIndex = 5; },
      move:p => { let v = sy + p.cy; const max = (N.length-1)*R; if (v < 0) v = rb(v, 24); if (v > max) v = max + rb(v - max, 24); hy = v;
        const k = clamp(Math.round(v/R), 0, N.length-1), cur = order.indexOf(r); if (k !== cur){ order.splice(cur, 1); order.splice(k, 0, r); lay(); } },
      up:(p, v) => { const k = order.indexOf(r); r.y.release(hy, v.vy, k*R); r.lift.set(0); held = null; setTimeout(() => r.r.style.zIndex = '', 300); } }));
    lay();
    return t => rows.forEach(r => { const l = clamp(r.lift.at(t)); r.r.style.transform = `translateY(${px(r === held ? hy : r.y.at(t))}) scale(${(1 + .03*l).toFixed(4)})`; r.r.style.boxShadow = l > .02 ? `0 ${px(2 + 10*l)} ${px(4 + 20*l)} rgba(0,0,0,${(.08 + .12*l).toFixed(3)})` : 'var(--shadow)'; });
  }});
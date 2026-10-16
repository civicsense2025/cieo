

atom({ id:'selectresize', cat:'Design tools', name:'Select, move and snap', block:'section/columns editor', fam:['D','M'], wide:true, tall:true,
  html:`<div class="cv card" style="position:relative;width:min(600px,94%);height:280px;overflow:hidden;background:var(--bg)"><div class="ref" style="position:absolute;left:60px;top:60px;width:160px;height:110px;border-radius:10px;background:var(--raised)"></div><i class="gx" style="position:absolute;top:0;bottom:0;width:1px;background:var(--danger)"></i><i class="gy" style="position:absolute;left:0;right:0;height:1px;background:var(--danger)"></i><div class="sh" style="position:absolute;left:0;top:0;border-radius:10px;background:var(--accent);cursor:move;touch-action:none"><i class="hd" style="position:absolute;right:-6px;bottom:-6px;width:12px;height:12px;border-radius:3px;background:var(--card);border:2px solid var(--ink);cursor:nwse-resize"></i></div><span class="dim small num" style="position:absolute;left:0;top:0;background:var(--ink);color:var(--card);padding:1px 6px;border-radius:5px;white-space:nowrap"></span></div><div class="hint" style="bottom:2px">Drag the green box near the grey one · drag the corner to resize</div>`,
  desc:'Moving and resizing follow the pointer, but within 8px of the other shape’s edges or center the box is pulled into alignment on a stiff spring, and a red guide marks the match.',
  api:'x = near(raw, guides, 8) ?? raw; box.x.set(x, S.snap)   guide.o.set(snapped)',
  init(st){
    const cv = $(st,'.cv'), ref = $(st,'.ref'), sh = $(st,'.sh'), hd = $(st,'.hd'), gx = $(st,'.gx'), gy = $(st,'.gy'), dim = $(st,'.dim');
    const B = { x:new Track(330, S.snap), y:new Track(130, S.snap), w:new Track(140, S.snap), h:new Track(100, S.snap) }, ox = new Track(0, S.snap), oy = new Track(0, S.snap); let gX = 0, gY = 0, mode = null, s0;
    const R = { x:60, y:60, w:160, h:110 };
    const near = (v, cands) => { for (const c of cands) if (Math.abs(v - c) < 8) return c; return null; };
    const xs = [R.x, R.x + R.w, R.x + R.w/2], ys = [R.y, R.y + R.h, R.y + R.h/2];
    const move = (nx, ny, w, h) => { let sx2 = null, sy2 = null, fx = nx, fy = ny;
      for (const [off] of [[0],[w],[w/2]]){ const c = near(nx + off, xs); if (c !== null){ fx = c - off; sx2 = c; break; } }
      for (const [off] of [[0],[h],[h/2]]){ const c = near(ny + off, ys); if (c !== null){ fy = c - off; sy2 = c; break; } }
      B.x.set(fx); B.y.set(fy); ox.set(sx2 !== null ? 1 : 0); oy.set(sy2 !== null ? 1 : 0); if (sx2 !== null) gX = sx2; if (sy2 !== null) gY = sy2; };
    drag(sh, { down:(p, e) => { mode = e.target === hd ? 'size' : 'move'; s0 = { cx:p.cx, cy:p.cy, x:B.x.target, y:B.y.target, w:B.w.target, h:B.h.target }; },
      move:p => { const dx = p.cx - s0.cx, dy = p.cy - s0.cy; if (mode === 'move') move(s0.x + dx, s0.y + dy, s0.w, s0.h);
        else { let w = Math.max(40, s0.w + dx), h = Math.max(40, s0.h + dy); const cx2 = near(B.x.target + w, xs), cy2 = near(B.y.target + h, ys); if (cx2 !== null) w = cx2 - B.x.target; if (cy2 !== null) h = cy2 - B.y.target;
          B.w.set(w); B.h.set(h); ox.set(cx2 !== null ? 1 : 0); oy.set(cy2 !== null ? 1 : 0); if (cx2 !== null) gX = cx2; if (cy2 !== null) gY = cy2; } },
      up:() => { mode = null; ox.set(0); oy.set(0); } });
    let dimTxt = '', dimW = 0;
    return t => { const x = B.x.at(t), y = B.y.at(t), w = B.w.at(t), h = B.h.at(t); Object.assign(sh.style, { left:px(x), top:px(y), width:px(w), height:px(h) });
      gx.style.left = px(gX); gx.style.opacity = clamp(ox.at(t)).toFixed(3); gy.style.top = px(gY); gy.style.opacity = clamp(oy.at(t)).toFixed(3);
      const lbl = `${Math.round(B.w.target)} × ${Math.round(B.h.target)}`; if (lbl !== dimTxt){ dimTxt = lbl; dim.textContent = lbl; dimW = dim.offsetWidth; } dim.style.left = px(x + w/2 - dimW/2); dim.style.top = px(y + h + 8); };
  }});
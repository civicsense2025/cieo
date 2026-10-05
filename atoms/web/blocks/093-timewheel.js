

atom({ id:'timewheel', cat:'Forms', name:'Time wheel', block:'form (time), booking', fam:['D'], tall:true,
  html:`<div class="card tw" style="position:relative;display:flex;gap:4px;padding:8px 12px;height:200px;overflow:hidden"><i style="position:absolute;left:8px;right:8px;top:50%;height:36px;margin-top:-18px;border-radius:9px;background:var(--raised)"></i></div><div class="ro num tv"></div><div class="hint">Drag or scroll each column</div>`,
  desc:'Each column follows a drag exactly, then projects your release velocity forward and settles on the nearest value. Rows fade and shrink with distance from the center band.',
  api:'i = round((y − v·0.15)/36); y.release(y, v, i·36)',
  init(st){
    const tw = $(st,'.tw'), tv = $(st,'.tv'), R = 36;
    const mk = (vals, start, w) => { const col = document.createElement('div'); col.setAttribute('role','listbox'); col.tabIndex = 0; col.style.cssText = `position:relative;width:${w}px;height:100%;cursor:grab;touch-action:none`;
      const items = vals.map(v => { const s = document.createElement('div'); s.textContent = v; s.style.cssText = 'position:absolute;left:0;right:0;top:50%;height:36px;margin-top:-18px;display:grid;place-items:center;font:600 18px var(--sans);font-variant-numeric:tabular-nums'; col.appendChild(s); return s; });
      tw.appendChild(col); const c = { col, vals, items, y:new Track(start*R), held:false, hy:0, sy:0 }; const max = (vals.length-1)*R;
      const snap = (from, v) => { const i = clamp(Math.round((from + v*.15)/R), 0, vals.length-1); c.y.release(from, v, i*R); };
      drag(col, { down:p => { c.held = true; c.sy = c.y.at() + p.cy; c.hy = c.y.at(); }, move:p => { let v = c.sy - p.cy; if (v < 0) v = rb(v, 30); if (v > max) v = max + rb(v - max, 30); c.hy = v; }, up:(p, v) => { c.held = false; snap(c.hy, -v.vy); } });
      col.addEventListener('wheel', e => { e.preventDefault(); c.y.set(clamp(Math.round(c.y.target/R) + Math.sign(e.deltaY), 0, vals.length-1)*R); }, { passive:false });
      col.onkeydown = e => { const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0; if (d){ e.preventDefault(); c.y.set(clamp(Math.round(c.y.target/R) + d, 0, vals.length-1)*R); } };
      return c; };
    const cols = [mk([...Array(12)].map((_,i) => String(i+1)), 8, 44), mk(['00','05','10','15','20','25','30','35','40','45','50','55'], 6, 44), mk(['AM','PM'], 0, 44)];
    return t => { const out = []; cols.forEach(c => { const y = c.held ? c.hy : c.y.at(t); c.items.forEach((s,i) => { const d = (i*R - y)/R, a = clamp(1 - Math.abs(d)*.32); s.style.transform = `translateY(${px(i*R - y)}) scale(${(.82 + .18*a).toFixed(3)})`; s.style.opacity = (a*a).toFixed(3); });
      out.push(c.vals[clamp(Math.round(c.y.target/R), 0, c.vals.length-1)]); }); tv.textContent = `${out[0]}:${out[1]} ${out[2]}`; };
  }});
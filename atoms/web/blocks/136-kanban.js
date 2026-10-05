

atom({ id:'kanban', cat:'Scheduling', name:'Task board', block:'collection (board view)', fam:['D','M'], wide:true, tall:true,
  html:`<div class="bd" style="position:relative;width:min(620px,96%);height:290px"></div>`,
  desc:'The card lifts and follows the pointer exactly. Hovering over a column opens a gap at the matching position while other cards spring aside. Dropping settles the card into the gap from its release velocity.',
  api:'gap = (col, index) under pointer   others.y.set(slot)   card.release({x,y}, v, slot)',
  init(st){
    const bd = $(st,'.bd'), COLS = ['To do','Doing','Done'], CH = 54, G = 8, TOP = 34;
    const cols = COLS.map(n => { const c = document.createElement('div'); c.style.cssText = 'position:absolute;top:0;bottom:0;border-radius:12px;background:var(--raised)'; c.innerHTML = `<b class="small" style="position:absolute;left:12px;top:8px">${n}</b>`; bd.appendChild(c); return { c, cards:[] }; });
    const T = [['Write launch post',0],['Pricing page QA',0],['Yearly toggle copy',1],['Member emails',1],['Fix font flash',2]];
    const cards = T.map(([n,ci]) => { const d = document.createElement('div'); d.className = 'card small'; d.style.cssText += 'position:absolute;left:0;top:0;height:54px;padding:10px 12px;cursor:grab;touch-action:none;font-weight:500'; d.textContent = n; bd.appendChild(d);
      const k = { d, x:new Track(0), y:new Track(0), lift:new Track(0, S.snap) }; cols[ci].cards.push(k); return k; });
    let held = null, hx = 0, hy = 0, sx = 0, sy = 0, gap = null;
    const geo = () => { const W = bd.clientWidth, cw = (W - 2*12)/3; return { cw, cx:i => i*(cw + 12) }; };
    const lay = inst => { const { cw, cx } = geo(); cols.forEach((c,i) => { c.c.style.left = px(cx(i)); c.c.style.width = px(cw); let k = 0;
      c.cards.forEach(cd => { if (cd === held) return; if (gap && gap.col === i && gap.idx === k) k++; const x = cx(i) + 8, y = TOP + k*(CH + G); inst ? (cd.x.jump(x), cd.y.jump(y)) : (cd.x.set(x), cd.y.set(y)); cd.d.style.width = px(cw - 16); k++; }); }); };
    cards.forEach(cd => drag(cd.d, { down:p => { held = cd; const r = relRect(bd, cd.d.getBoundingClientRect()); sx = r.x - p.cx; sy = r.y - p.cy; hx = r.x; hy = r.y; cd.lift.set(1); cd.d.style.zIndex = 5; const c = cols.find(c2 => c2.cards.includes(cd)); gap = { col:cols.indexOf(c), idx:c.cards.filter(x => x !== cd).length }; gap.idx = c.cards.indexOf(cd); lay(); },
      move:p => { hx = sx + p.cx; hy = sy + p.cy; const { cw } = geo(), col = clamp(Math.floor((hx + cw/2)/(cw + 12)), 0, 2), others = cols[col].cards.filter(x => x !== cd), idx = clamp(Math.round((hy - TOP)/(CH + G)), 0, others.length); if (!gap || gap.col !== col || gap.idx !== idx){ gap = { col, idx }; lay(); } },
      up:(p, v) => { cols.forEach(c => c.cards = c.cards.filter(x => x !== cd)); cols[gap.col].cards.splice(gap.idx, 0, cd); const { cx } = geo(), tx = cx(gap.col) + 8, ty = TOP + gap.idx*(CH + G);
        cd.x.release(hx, v.vx, tx); cd.y.release(hy, v.vy, ty); cd.lift.set(0); held = null; gap = null; lay(); setTimeout(() => cd.d.style.zIndex = '', 400); } }));
    requestAnimationFrame(() => lay(true)); addEventListener('resize', () => lay(true));
    return t => cards.forEach(cd => { const l = clamp(cd.lift.at(t)); cd.d.style.transform = `translate(${px(cd === held ? hx : cd.x.at(t))},${px(cd === held ? hy : cd.y.at(t))}) rotate(${(l*1.5).toFixed(2)}deg) scale(${(1 + .03*l).toFixed(4)})`; cd.d.style.boxShadow = l > .02 ? `0 ${px(4 + 10*l)} ${px(8 + 20*l)} rgba(0,0,0,${(.1 + .12*l).toFixed(3)})` : 'var(--shadow)'; });
  }});
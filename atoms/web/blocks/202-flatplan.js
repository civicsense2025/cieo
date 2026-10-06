atom({ id:'flatplan', cat:'Writing', name:'Flatplan paginator', block:'page-editor, flatplan', fam:['D','T','E','S'], wide:true, tall:true,
  html:`<div class="col" style="gap:14px;align-items:center"><div class="row small muted" style="width:min(560px,94%);justify-content:space-between"><span>Issue 12 · folio</span><span>p. <span class="dg" style="display:inline-flex;min-width:12px;justify-content:flex-end"></span> / 5</span></div><div class="fp" style="position:relative;width:min(560px,94%);height:150px"><i class="ind" style="position:absolute;left:0;bottom:-14px;height:4px;border-radius:2px;background:var(--ink)"></i></div><button class="btn sh">Shuffle</button></div><div class="hint">Drag a page into its folio slot</div>`,
  desc:'A held page follows the pointer exactly and bends with rubber-band past the ends. On release it springs into the nearest folio slot, the folio number rolls, and the plate marker trails behind by 60ms. Shuffle re-deals the folio.',
  api:'held.x = pointer; rb past ends   drop: x.release(x, vx, slot)   dg.set(n)   plates.go(l, r)',
  init(st){
    const box = $(st,'.fp'), ind = $(st,'.ind'), dg = new Digits($(st,'.dg'), 1), W = 112, CW = 104;
    const N = ['Cover','Feature','Essay','Ads','Back'], e = edges(0, CW);
    const rows = N.map((t,i) => { const r = document.createElement('div'); r.className = 'card small';
      r.style.cssText += ';position:absolute;top:0;left:0;width:104px;height:150px;padding:10px;touch-action:none;cursor:grab;display:flex;flex-direction:column;gap:6px';
      r.innerHTML = '<b class="num">' + (i+1) + '</b><span>' + t + '</span><span class="muted" style="margin-top:auto;font-size:11px">' + (t === 'Ads' ? 'ad plate' : 'edit plate') + '</span>';
      box.appendChild(r);
      return { r, t, num:$(r,'.num'), x:new Track(i*W), lift:new Track(0, S.snap) }; });
    let order = rows.slice(), held = null, hx = 0, sx = 0, last = rows[0];
    const lay = inst => order.forEach((o,i) => { if (o !== held) inst ? o.x.jump(i*W) : o.x.set(i*W); o.num.textContent = i+1; });
    const mark = o => { const s = order.indexOf(o)*W, n = String(order.indexOf(o)+1);
      if (REDUCE){ e.jump(s, s+CW); dg.set(n, true); } else { e.go(s, s+CW); dg.set(n); } };
    rows.forEach(o => drag(o.r, {
      down:p => { held = o; last = o; sx = o.x.at() - p.cx; hx = o.x.at(); o.lift.set(1); o.r.style.zIndex = 5; },
      move:p => { let v = sx + p.cx; const max = (N.length-1)*W;
        if (v < 0) v = rb(v, 28); if (v > max) v = max + rb(v-max, 28); hx = v;
        const k = clamp(Math.round(v/W), 0, N.length-1), cur = order.indexOf(o);
        if (k !== cur){ order.splice(cur, 1); order.splice(k, 0, o); lay(); } },
      up:(p,v) => { const slot = order.indexOf(o)*W;
        if (REDUCE) o.x.jump(slot); else o.x.release(hx, v.vx, slot);
        o.lift.set(0); held = null; setTimeout(() => o.r.style.zIndex = '', 300); mark(o); } }));
    $(st,'.sh').onclick = () => { const t0 = now();
      order = order.map(o => [Math.random(), o]).sort((a,b) => a[0]-b[0]).map(x => x[1]);
      order.forEach((o,i) => { if (REDUCE) o.x.jump(i*W); else o.x.set(i*W, S.base, t0 + i*.03); o.num.textContent = i+1; });
      mark(last); };
    dg.set('1', true);
    return t => { rows.forEach(o => { const l = clamp(o.lift.at(t));
        o.r.style.transform = 'translateX(' + px(o === held ? hx : o.x.at(t)) + ') scale(' + (1+.04*l).toFixed(4) + ')';
        o.r.style.boxShadow = l > .02 ? '0 ' + px(2+10*l) + ' ' + px(4+20*l) + ' rgba(0,0,0,' + (.08+.12*l).toFixed(3) + ')' : 'var(--shadow)'; });
      dg.render(t);
      const a = e.A.at(t), b = e.B.at(t); ind.style.transform = 'translateX(' + px(a) + ')'; ind.style.width = px(b-a); };
  }});

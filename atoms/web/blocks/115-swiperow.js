

atom({ id:'swiperow', cat:'Email', name:'Swipe actions', block:'entry-list, inbox', fam:['D','M'], tall:true,
  html:`<div class="col sr" style="width:min(340px,90%);gap:0"></div><button class="btn rs" style="position:absolute;top:10px;right:12px">Restore</button><label class="row small muted" style="gap:6px;justify-content:center;cursor:pointer"><input type="checkbox" class="dv" checked> Dividers</label><div class="hint">Swipe right to archive, left to snooze</div>`,
  desc:'The row follows your finger. The action behind it fills with its color and its icon grows once you pass the 80px threshold. Release past it and the row leaves and its space closes; otherwise it springs home.',
  api:'x = pointer   armed = |x| > 80   out: x.release(x, v, ±W); h.set(0, t + 0.15)',
  init(st){
    const sr = $(st,'.sr'), M = [['Maya Chen','Draft is ready for review'],['Billing','Invoice INV-0042 paid'],['Theo Park','Comment on pricing table']];
    const dv = $(st,'.dv');
    const rows = M.map(([a,b],idx) => { const last = idx === M.length - 1; const w = document.createElement('div'); w.style.cssText = 'position:relative;overflow:hidden' + (last ? '' : ';border-bottom:1px solid var(--line-soft)');
      w.innerHTML = `<div class="bk" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 18px;color:#fff"><span class="ia">${ic('<path d="M3 7h18v13H3zM3 7l2-4h14l2 4M9 12h6"/>',18)}</span><span class="is">${ic('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',18)}</span></div><div class="fg" style="position:relative;background:var(--card);padding:12px 14px;touch-action:pan-y;cursor:grab"><b class="small" style="display:block">${a}</b><span class="small muted">${b}</span></div>`;
      sr.appendChild(w); const r = { w, bk:$(w,'.bk'), fg:$(w,'.fg'), ia:$(w,'.ia'), is:$(w,'.is'), x:new Track(0), h:new Track(1), held:false, hx:0, sx:0, H:0, last };
      drag(r.fg, { down:p => { r.held = true; r.sx = r.x.at() - p.cx; r.hx = r.x.at(); }, move:p => r.hx = r.sx + p.cx,
        up:(p, v) => { r.held = false; const W = r.w.clientWidth, out = Math.abs(r.hx) > 80 || Math.abs(v.vx) > 700; r.x.release(r.hx, v.vx, out ? Math.sign(r.hx || v.vx)*W : 0); if (out){ r.H = r.w.offsetHeight; r.h.set(0, S.base, now() + .15); } } });
      return r; });
    const paint = () => rows.forEach(r => { r.w.style.borderBottom = (!dv.checked || r.last) ? 'none' : '1px solid var(--line-soft)'; });
    dv.onchange = paint;
    const rs = $(st,'.rs'); let flashT = 0;
    rs.onclick = () => { const had = rows.some(r => r.x.target !== 0 || r.h.target !== 1);
      rows.forEach(r => { r.x.set(0); r.h.set(1); });
      rs.textContent = had ? 'Restored' : 'All rows are here'; clearTimeout(flashT); flashT = setTimeout(() => { rs.textContent = 'Restore'; }, 1400); };
    return t => rows.forEach(r => { const x = r.held ? r.hx : r.x.at(t), a = clamp(Math.abs(x)/80), right = x > 0;
      r.fg.style.transform = `translateX(${px(x)})`; r.bk.style.background = a >= 1 ? (right ? 'var(--success)' : 'var(--warning)') : mix(a,'var(--muted)','var(--raised)');
      r.ia.style.opacity = right ? a : 0; r.is.style.opacity = right ? 0 : a; const sc = (.7 + .3*clamp(Math.abs(x)/80 - .2)).toFixed(3); r.ia.style.transform = r.is.style.transform = `scale(${sc})`;
      const h = clamp(r.h.at(t)); r.w.style.height = h < 1 ? px(h*(r.H || r.w.scrollHeight)) : ''; });
  }});
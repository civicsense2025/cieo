atom({ id:'reschedrag', cat:'Scheduling', name:'Reschedule drag', block:'reschedule, drag', fam:['M','S'], tall:true,
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">Move design review</b><div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:0"><div class="tl" style="position:relative"></div><div class="row small muted" style="gap:6px;align-items:center;border-top:1px solid var(--line);padding-top:10px;margin-top:10px"><input type="checkbox" class="sn" checked style="width:16px;height:16px"><span style="font-size:12px">Snap to 15 min</span></div></div></div><div class="hint">Drag the event · it snaps to the grid</div>`,
  desc:'The chip follows your finger one to one. A gap opens softly at the landing slot while the others spring aside, and the chip label swaps to the snapped time on drop.',
  api:'drag 1:1 hy   rows[i].y springs around gap   chip sw.to(snapped) on drop',
  init(st){
    const times = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM'], names = ['Standup','Design review','Lunch','1:1'];
    const RH = 48, GAP = 6, box = $(st,'.tl'), H = times.length*(RH+GAP);
    box.style.height = px(H);
    const ys = [], rows = times.map((tm,i) => {
      const r = document.createElement('div');
      r.style.cssText = 'position:absolute;left:0;right:0;height:' + RH + 'px;border:1px solid var(--line);border-radius:10px;background:var(--card);display:flex;align-items:center;gap:10px;padding:0 12px;font-size:13px';
      const a = document.createElement('span'); a.textContent = tm;
      a.style.cssText = 'font-size:12px;color:var(--ink);opacity:.55;width:64px;font-variant-numeric:tabular-nums';
      const b = document.createElement('span'); b.textContent = names[i];
      r.appendChild(a); r.appendChild(b); box.appendChild(r);
      const y = new Track(i*(RH+GAP)); ys.push(y); return r; });
    const chip = document.createElement('div');
    chip.style.cssText = 'position:absolute;left:0;right:0;height:' + RH + 'px;border-radius:10px;background:var(--accent);color:#fff;font-size:13px;cursor:grab;touch-action:none;overflow:hidden';
    const L = times.map(tm => { const s = document.createElement('span'); s.className = 'layer';
      s.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;padding:0 12px;font-variant-numeric:tabular-nums';
      s.textContent = 'Design review · ' + tm; chip.appendChild(s); return s; });
    const custom = document.createElement('span'); custom.className = 'layer'; custom.textContent = 'Design review · custom';
    custom.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;padding:0 12px'; chip.appendChild(custom);
    box.appendChild(chip);
    const sw = new Swap(1), cy = new Track(1*(RH+GAP));
    let home = 1, held = false, hy = 0, gapIdx = 1, snap = true;
    const lay = () => rows.forEach((r,i) => ys[i].set(i*(RH+GAP) + (i > gapIdx ? 14 : 0), S.soft));
    lay();
    drag(chip, {
      down:() => { held = true; hy = cy.at(); chip.style.cursor = 'grabbing'; },
      move:p => { const r = box.getBoundingClientRect();
        hy = clamp(p.cy - r.top - RH/2, -10, H - RH + 10);
        const idx = clamp(Math.round(hy/(RH+GAP)), 0, times.length - 1);
        if (idx !== gapIdx){ gapIdx = idx; lay(); } },
      up:(p, v) => { held = false; chip.style.cursor = 'grab';
        if (snap){ home = gapIdx; cy.release(hy, v.vy, home*(RH+GAP), S.base); sw.to(home); }
        else { home = -1; cy.release(hy, v.vy*.3, hy, S.soft); sw.to(4); } } });
    $(st,'.sn').onchange = e => { snap = e.target.checked;
      if (snap){ home = gapIdx; cy.set(home*(RH+GAP)); sw.to(home); } };
    return t => { chip.style.top = px(held ? hy : cy.at(t));
      rows.forEach((r,i) => { r.style.top = px(ys[i].at(t));
        const ghost = held && i === home;
        r.style.visibility = (!held && i === home) ? 'hidden' : 'visible';
        r.style.borderStyle = ghost ? 'dashed' : 'solid';
        r.style.opacity = ghost ? '.6' : '1'; });
      L.forEach((l,k) => sw.apply(l,k,t)); sw.apply(custom, 4, t); };
  }});

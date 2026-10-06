atom({ id:'pagescrub', cat:'Documents', name:'Page scrubber', block:'scrubber, thumbnails, pager', fam:['M'],
  html:`<div class="col" style="width:min(360px,92%);gap:12px;align-items:center"><div class="card col" style="width:100%;padding:14px 16px;gap:10px"><div class="row" style="gap:8px;align-items:baseline"><b class="pgn" style="font-size:15px;font-variant-numeric:tabular-nums"></b><span class="small muted" style="font-size:12px">/ 5 · drag the knob or tap a thumb</span></div><div class="rail" style="position:relative;height:32px;border-radius:8px;background:var(--wash);cursor:grab;touch-action:none"><div class="ghost" style="position:absolute;top:4px;bottom:4px;border-radius:6px;background:var(--accent);opacity:.25"></div><div class="plate" style="position:absolute;top:4px;bottom:4px;border-radius:6px;border:2px solid var(--accent)"></div><div class="knob" style="position:absolute;top:-4px;width:16px;height:40px;border-radius:8px;background:var(--ink)"></div></div><div class="thumbs row" style="gap:8px"></div><div class="cap small" style="position:relative;height:22px;font-size:12.5px;line-height:1.5"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="snap" checked> snap to page</label></div><div class="hint">Drag the knob — release with a flick</div>`,
  desc:'The knob follows the pointer one-to-one with rubber at the ends and settles on a base spring. The active thumb plate leads while a ghost trails sixty milliseconds behind. The last page tints the caption success.',
  api:'drag: pos.jump(x) 1:1   up: pos.release(x, v, round, base)   plate.go(x) trails .06   cap digits roll',
  init(st){
    const rail = $(st,'.rail'), knob = $(st,'.knob'), plate = $(st,'.plate'), ghost = $(st,'.ghost'), th = $(st,'.thumbs'), cap = $(st,'.cap'), snap = $(st,'.snap');
    const T = ['Cover', 'Parties', 'Schedule', 'Signatures', 'Exhibits'];
    const pos = new Track(0), e = edges(0, 0.2), dg = new Digits($(st,'.pgn'), 1), sw = new Swap(0);
    const CL = T.map(s => { const el = document.createElement('span'); el.className = 'layer'; el.textContent = s; cap.appendChild(el); return el; });
    dg.set('1', true); e.jump(0, 0.2);
    const TB = T.map((s,i) => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = `${i + 1}`; b.style.cssText = 'min-height:32px;min-width:32px;border-radius:8px'; b.onclick = () => land(i); th.appendChild(b); return b; });
    const cur = () => Math.round(clamp(pos.at(now()), 0, 4));
    function land(i){ pos.set(i, S.base); e.go(i / 4, (i + 1) / 4); sw.to(i); dg.set(String(i + 1)); }
    drag(rail, { move: p => { pos.jump(clamp(p.x / p.w * 4, -0.6, 4.6)); const c = Math.min(4, Math.max(0, Math.round(clamp(pos.target, 0, 4)))); sw.to(c); dg.set(String(c + 1)); e.go(c / 4, (c + 1) / 4); },
      up: (p, v) => { const raw = clamp(p.x / p.w * 4, 0, 4); const to = snap.checked ? Math.min(4, Math.max(0, Math.round(raw + v.vx / 4000))) : raw; pos.release(raw, v.vx / p.w * 4, to, S.base); sw.to(to); dg.set(String(to + 1)); e.go(to / 4, (to + 1) / 4); } });
    return t => { const x = clamp(pos.at(t), -0.6, 4.6), f = clamp(x / 4, 0, 1);
      knob.style.left = `calc(${(f * 100).toFixed(2)}% - 8px)`;
      const A = clamp(e.A.at(t), 0, 1), B = clamp(e.B.at(t), 0, 1);
      plate.style.left = (A * 100).toFixed(2) + '%'; plate.style.width = 'calc(20% - 0px)';
      ghost.style.left = (B * 100).toFixed(2) + '%'; ghost.style.width = '20%';
      TB.forEach((b,i) => { const on = i === Math.min(4, Math.max(0, Math.round(x))); b.style.borderColor = on ? 'var(--accent)' : ''; b.style.color = on ? 'var(--accent)' : ''; });
      CL.forEach((el,k) => sw.apply(el,k,t)); dg.render(t);
      CL[4].style.color = 'var(--success)'; };
  }});

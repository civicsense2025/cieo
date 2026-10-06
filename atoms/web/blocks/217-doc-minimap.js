atom({ id:'docminimap', cat:'Documents', name:'TOC minimap', block:'table of contents, minimap, outline', fam:['M'],
  html:`<div class="col" style="width:min(380px,94%);gap:8px"><div class="card row" style="padding:14px 16px;gap:12px"><div class="toc col" style="flex:1;gap:0;font-size:13.5px;line-height:1.5"></div><div class="map" style="position:relative;width:44px;border-radius:8px;background:var(--wash);cursor:pointer;touch-action:none"><div class="box" style="position:absolute;left:4px;right:4px;border-radius:6px;border:2px solid var(--accent);background:color-mix(in oklab, var(--accent) 14%, transparent)"></div></div></div><div class="pg small" style="position:relative;height:22px;font-size:12.5px;text-align:center"></div></div><div class="hint">Click the rail or drag the box</div>`,
  desc:'The viewport box tracks the drag one-to-one; a click on the rail springs to that page on a base spring. The caption swaps to the section title and the final section lands an end-of-document terminal.',
  api:'drag: box.jump(y) 1:1   click: box.set(y, base)   cap.to(i)   end holds success',
  init(st){
    const toc = $(st,'.toc'), map = $(st,'.map'), box = $(st,'.box'), pg = $(st,'.pg');
    const S_ = ['Cover', 'Parties', 'Schedule', 'Signatures', 'End'];
    const y = new Track(6); let cur = 0;
    const H = 148, BH = 30;
    map.style.height = px(H);
    const C = S_.map(s => { const el = document.createElement('span'); el.className = 'layer'; el.style.textAlign = 'center'; el.textContent = s; pg.appendChild(el); return el; });
    const sw = new Swap(0);
    const B = S_.map((s,i) => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = `${i + 1} · ${s}`; b.style.cssText = 'min-height:32px;border-radius:8px;text-align:left;border:0;background:none;cursor:pointer;font-size:13.5px;padding:4px 8px'; if (i < 4) toc.appendChild(b); else { b.style.color = 'var(--success)'; toc.appendChild(b); } b.onclick = () => land(i); return b; });
    function land(i){ cur = i; y.set(6 + i * ((H - 12 - BH) / 4), S.base); sw.to(i); paint(); }
    function paint(){ B.forEach((b,i) => { b.style.background = i === cur ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'none'; b.style.fontWeight = i === cur ? 600 : 400; }); }
    drag(box, { move: p => { const r = map.getBoundingClientRect(); y.jump(clamp(p.cy - r.top - BH / 2, 0, H - 12 - BH) + 0); const i = Math.min(4, Math.max(0, Math.round((y.target - 6) / ((H - 12 - BH) / 4)))); if (i !== cur){ cur = i; sw.to(i); paint(); } } });
    map.addEventListener('pointerdown', e => { if (e.target === box) return; const r = map.getBoundingClientRect(); const i = Math.min(4, Math.max(0, Math.round((e.clientY - r.top - BH / 2) / ((H - 12 - BH) / 4)))); land(i); });
    land(0);
    return t => { box.style.top = px(clamp(y.at(t), 0, H - 12 - BH)); box.style.height = px(BH); C.forEach((el,k) => sw.apply(el,k,t)); C[4].style.color = 'var(--success)'; };
  }});

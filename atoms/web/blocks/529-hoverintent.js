atom({ id:'hoverintent', cat:'Overlays', name:'Hover intent card', block:'Hover card intent + safe triangle', fam:['X'], tall:false,
  html:`<p style="margin:26px 0 0;max-width:300px;text-align:center;line-height:1.6;font-size:13.5px">Written by <a href="#" class="hv" aria-haspopup="true" style="position:relative;color:var(--ink);font-weight:600">Maya Chen<span class="hc card" role="dialog" style="position:absolute;left:50%;top:calc(100% + 10px);width:230px;margin-left:-115px;padding:14px;text-align:left;font-weight:400;transform-origin:50% 0;visibility:hidden"><b style="display:block;font-size:15px;font-weight:600;line-height:1.5">Maya Chen</b><span class="small muted" style="display:block;font-size:12.5px;line-height:1.5">@mayachen</span><span class="small" style="display:block;margin-top:8px;font-size:13px;line-height:1.5">Editor at Field Notes. Slow approaches open.</span></span></a> on Sep 28.</p><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px;font-size:12px"><input type="checkbox" class="pin" checked> focus pins open</label><div class="hint">Slow rest opens \u00b7 fast pass never opens</div>`,
  desc:'A slow approach that rests opens after a beat; a fast pass never opens. A safe triangle between link and card keeps it open, and keyboard focus pins it.',
  api:'rest 0.35s opens (slow only); triangle keeps open; focus pins',
  init(st){
    const a = $(st,'.hv'), hc = $(st,'.hc'), pin = $(st,'.pin'), o = new Track(0); let openAt = 0, closeAt = 0, enterT = 0, enterX = 0, pinned = false;
    a.onclick = e => e.preventDefault();
    a.onpointerenter = e => { enterT = now(); enterX = e.clientX; closeAt = 0; if (!o.target && !pinned) openAt = now()+.35; };
    a.onpointermove = e => { if (openAt && Math.abs(e.clientX-enterX) > 90 && now()-enterT < .18){ openAt = 0; } };
    const leave = e => { openAt = 0; if (pinned) return; const r1 = a.getBoundingClientRect(), r2 = hc.getBoundingClientRect(), sr = st.getBoundingClientRect();
      const mx = e.clientX-sr.left, my = e.clientY-sr.top, ax = r1.left-sr.left, cx = r2.left-sr.left+r2.width/2;
      const inTri = my > r1.bottom-sr.top && my < r2.bottom-sr.top && Math.abs(mx-cx) < 90; if (o.target && !inTri) closeAt = now()+.18; };
    a.onpointerleave = leave; hc.onpointerenter = () => { closeAt = 0; }; hc.onpointerleave = () => { if (!pinned) closeAt = now()+.12; };
    a.onfocus = () => { if (pin.checked){ pinned = true; openAt = 0; o.set(1); } }; a.onblur = () => { pinned = false; o.set(0, S.snap); };
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape'){ openAt = 0; pinned = false; o.set(0, S.snap); a.blur(); } });
    return t => { if (openAt && t >= openAt){ openAt = 0; o.set(1); } if (closeAt && t >= closeAt){ closeAt = 0; o.set(0, S.snap); } pop(hc, o.at(t), -6); };
  }});

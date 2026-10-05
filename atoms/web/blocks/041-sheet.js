

atom({ id:'sheet', cat:'Admin', name:'Bottom sheet (mobile only)', block:'Sheet primitive on phones. Lamina admin uses the side sheet; see Admin kit', fam:['X','D'], tall:true,
  html:`<div class="ph card" style="position:relative;width:min(250px,80%);height:300px;overflow:hidden"><div class="col" style="padding:16px;gap:8px"><b>Pages</b><span class="small muted">Home · About · Journal · Contact</span><button class="btn ink op" style="align-self:flex-start;margin-top:8px">Page settings</button></div><div class="sr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none"></div><div class="sh" style="position:absolute;left:0;right:0;bottom:0;height:200px;background:var(--card);border-radius:16px 16px 0 0;box-shadow:var(--shadow);touch-action:none"><div class="gr" style="height:26px;display:grid;place-items:center;cursor:grab"><i style="width:36px;height:4px;border-radius:2px;background:var(--line)"></i></div><div class="col small" style="padding:0 16px;gap:10px"><b style="font-size:15px">Page settings</b><div class="row" style="justify-content:space-between"><span>Show in navigation</span><span class="muted">On</span></div><div class="row" style="justify-content:space-between"><span>Search indexing</span><span class="muted">Allowed</span></div><div class="row" style="justify-content:space-between"><span>Slug</span><span class="muted">/about</span></div></div></div></div><div class="hint">Drag the sheet down to close</div>`,
  desc:'For phone layouts only: on wider screens Lamina’s admin slides sheets in from the side (see Side detail sheet). Opens on the base spring. Dragging the grabber follows the finger; pulling up rubber-bands. Release past 30% or with a fast flick closes it from that velocity.',
  api:'y.release(y, vy, y > 0.3H || vy > 500 ? H : 0)',
  init(st){
    const ph = $(st,'.ph'), sh = $(st,'.sh'), sr = $(st,'.sr'), H = 200, y = new Track(H + 10); let held = false, hy = 0, sy = 0;
    $(st,'.op').onclick = () => y.set(0);
    sr.onclick = () => y.set(H + 10);
    drag(sh, { down:p => { held = true; sy = y.at() - p.cy; hy = y.at(); }, move:p => { const v = sy + p.cy; hy = v < 0 ? rb(v, 30) : v; },
      up:(p, v) => { held = false; y.release(hy, v.vy, hy > H*.3 || v.vy > 500 ? H + 10 : 0); } });
    return t => { const v = held ? hy : y.at(t); sh.style.transform = `translateY(${px(v)})`; const o = clamp(1 - v/H); sr.style.opacity = (o*.35).toFixed(3); sr.style.pointerEvents = o > .5 ? 'auto' : 'none'; };
  }});
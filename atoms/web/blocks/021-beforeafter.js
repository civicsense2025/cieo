
atom({ id:'beforeafter', cat:'Media', name:'Before / after', block:'before-after', fam:['D'],
  html:`<div class="ba" style="position:relative;width:min(360px,90%);aspect-ratio:12/7;max-width:100%;border-radius:12px;overflow:hidden;cursor:ew-resize;touch-action:none" role="slider" tabindex="0" aria-label="Comparison position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><div style="position:absolute;inset:0">${scene(true)}</div><div class="top" style="position:absolute;inset:0">${scene(false)}</div><div class="hd" style="position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--ink)"><span style="position:absolute;top:50%;left:50%;width:28px;height:28px;margin:-14px;border-radius:50%;background:var(--ink);box-shadow:var(--shadow)"></span></div><span class="small" style="position:absolute;left:10px;top:8px;color:var(--muted)">Sketch</span><span class="small" style="position:absolute;right:10px;top:8px;color:var(--card)">Final</span></div>`,
  desc:'The divider sits exactly under the pointer while dragging. Clicking elsewhere springs it there instead.',
  api:'x = held ? pointer : x.at(t)',
  init(st){
    const ba = $(st,'.ba'), top = $(st,'.top'), hd = $(st,'.hd'), x = new Track(.5); let held = false, hx = .5, moved = false;
    drag(ba, { down:p => { held = true; moved = false; hx = p.x/p.w; x.set(clamp(hx)); }, move:p => { moved = true; hx = clamp(p.x/p.w); }, up:() => { held = false; if (moved) x.jump(hx); } });
    ba.onkeydown = e => { if (e.key === 'ArrowRight') x.set(clamp(x.target + .1)); if (e.key === 'ArrowLeft') x.set(clamp(x.target - .1)); };
    return t => { const v = held && moved ? hx : x.at(t); top.style.clipPath = `inset(0 ${((1-v)*100).toFixed(2)}% 0 0)`; hd.style.left = (v*100).toFixed(2) + '%'; ba.setAttribute('aria-valuenow', Math.round(v*100)); };
  }});
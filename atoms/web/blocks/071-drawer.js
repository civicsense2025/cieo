

atom({ id:'drawer', cat:'Navigation', name:'Navigation drawer', block:'nav-menu, Drawer / Sheet primitive', fam:['X','D'], tall:true,
  html:`<div class="ph card" style="position:relative;width:min(260px,82%);height:300px;overflow:hidden"><header class="row" style="height:50px;padding:0 10px;gap:8px;border-bottom:1px solid var(--line-soft)"><button class="hb" aria-label="Open navigation" style="width:36px;height:36px;border:0;background:none;cursor:pointer;display:grid;place-items:center">${ic(I.menu,18)}</button><b style="letter-spacing:-.02em">Common Room</b></header><p class="small muted" style="padding:14px;margin:0">Swipe the drawer left to close it, or tap outside.</p><div class="scr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none"></div><nav class="dw" style="position:absolute;left:0;top:0;bottom:0;width:200px;background:var(--card);box-shadow:var(--shadow);padding:16px 10px;touch-action:none"><b style="display:block;padding:0 10px 10px;letter-spacing:-.02em">Common Room</b></nav></div>`,
  desc:'The drawer slides in from the edge while its links follow 35ms apart. It tracks a drag 1:1, rubber-bands when pulled past open, and closes past halfway or on a fast flick.',
  api:'x.release(x, vx, x < −W/2 || vx < −500 ? −W : 0)',
  init(st){
    const dw = $(st,'.dw'), scr = $(st,'.scr'), W = 210, L = ['Home','Events','Members','Library','Settings'];
    const links = L.map((n,i) => { const a = document.createElement('a'); a.href = '#'; a.textContent = n; a.onclick = e => e.preventDefault(); a.style.cssText = `display:block;padding:9px 10px;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;color:var(--ink);${i === 0 ? 'background:var(--raised)' : ''}`; dw.appendChild(a); return a; });
    const x = new Track(-W); let held = false, hx = 0, sx = 0, tOpen = -9;
    const set = v => { x.set(v ? 0 : -W); if (v) tOpen = now(); };
    $(st,'.hb').onclick = () => set(true); scr.onclick = () => set(false);
    drag(dw, { down:p => { held = true; sx = x.at() - p.cx; hx = x.at(); }, move:p => { const v = sx + p.cx; hx = v > 0 ? rb(v, 30) : v; }, up:(p, v) => { held = false; x.release(hx, v.vx, hx < -W/2 || v.vx < -500 ? -W : 0); } });
    return t => { const v = held ? hx : x.at(t), p = clamp(1 + v/W); dw.style.transform = `translateX(${px(v)})`; scr.style.opacity = (p*.3).toFixed(3); scr.style.pointerEvents = p > .5 ? 'auto' : 'none';
      links.forEach((a,i) => { const q = x.target === 0 ? clamp(prog(t, tOpen + .06 + i*.035)) : 1; a.style.opacity = q.toFixed(3); a.style.transform = `translateX(${px((1-q)*-10)})`; }); };
  }});
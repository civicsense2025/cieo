atom({ id:'velosheet', cat:'Overlays', name:'Velocity drawer', block:'Drag 1:1, velocity snap, stagger', fam:['X','D'], tall:true,
  html:`<div class="ph card" style="position:relative;width:min(260px,82%);height:290px;overflow:hidden"><header class="row" style="height:50px;padding:0 10px;gap:8px;border-bottom:1px solid var(--line-soft)"><button class="hb" aria-label="Open navigation" style="width:36px;height:36px;border:0;background:none;cursor:pointer;display:grid;place-items:center;padding:0"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="transform:translateY(1px)"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><b style="font-size:15px;font-weight:600">Common Room</b></header><p class="small muted" style="padding:14px;margin:0;font-size:12.5px;line-height:1.55">Drags 1:1 \u00b7 release speed decides.</p><div class="sr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none"></div><nav class="dw" aria-label="Site" style="position:absolute;left:0;top:0;bottom:0;width:200px;background:var(--card);box-shadow:var(--shadow);padding:16px 10px;touch-action:none"><b style="display:block;padding:0 10px 10px;font-size:15px;font-weight:600">Common Room</b></nav></div><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px;font-size:12px"><input type="checkbox" class="st2" checked> stagger links</label><div class="hint">Fling to snap \u00b7 links stagger after settle</div>`,
  desc:'The drawer tracks the drag 1:1 and release velocity picks open or closed. The scrim fades with position and links stagger only after it settles.',
  api:'x.release(x, vx, open?); links stagger after |v|<1',
  init(st){
    const dw = $(st,'.dw'), sr = $(st,'.sr'), W = 210, L = ['Home','Events','Members','Library','Settings'];
    const links = L.map((n,i) => { const a = document.createElement('a'); a.href = '#'; a.textContent = n; a.onclick = e => e.preventDefault();
      a.style.cssText = 'display:block;padding:9px 10px;border-radius:8px;font-size:13.5px;line-height:1.5;font-weight:500;text-decoration:none;color:var(--ink)'; dw.appendChild(a); return a; });
    const x = new Track(-W); let held = false, hx = 0, sx = 0, tOpen = -9, last = null;
    const set = (v, btn) => { x.set(v ? 0 : -W); if (v){ tOpen = now(); last = btn; setTimeout(() => links[0]?.focus?.(), 50); } };
    $(st,'.hb').onclick = ev => set(true, ev.currentTarget); sr.onclick = () => set(false);
    drag(dw, { down:p => { held = true; sx = x.at()-p.cx; hx = x.at(); }, move:p => { const v = sx+p.cx; hx = v > 0 ? rb(v, 30) : v; },
      up:(p, v) => { held = false; const open = hx > -W/2 || v.vx > 500 || (hx > -W && v.vx > 150); if (open){ x.release(hx, v.vx, 0); tOpen = now(); } else x.release(hx, v.vx, -W); } });
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && x.target === 0){ x.set(-W, S.snap); last?.focus?.(); } });
    return t => { const v = held ? hx : x.at(t), p = clamp(1+v/W); dw.style.transform = `translateX(${px(v)})`; sr.style.opacity = (p*.3).toFixed(3); sr.style.pointerEvents = p > .5 ? 'auto' : 'none';
      const settled = !held && Math.abs(v) < 1;
      links.forEach((a,i) => { const q = settled && $(st,'.st2').checked ? clamp(prog(t, tOpen+.06+i*.045)) : (x.target === 0 ? 1 : 0);
        a.style.opacity = q.toFixed(3); a.style.transform = `translateX(${px((1-q)*-12)})`; }); };
  }});

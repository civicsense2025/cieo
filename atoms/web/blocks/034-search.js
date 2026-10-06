

atom({ id:'search', cat:'Chrome', name:'Search expand', block:'search-trigger', fam:['M','S','X','E'], tall:true,
  html:`<div class="sw0" style="position:absolute;top:24px;left:50%;transform:translateX(-50%);width:min(340px,88%)"><div class="card row" style="height:52px;padding:0 8px 0 16px;justify-content:space-between"><b class="brand" style="letter-spacing:-.02em">Paper Trail</b><div class="sx" style="position:relative;height:36px;border-radius:18px;background:var(--raised);overflow:hidden;flex:none"><button class="sb" aria-label="Search" style="position:absolute;left:0;top:0;width:36px;height:36px;border:0;padding:0;background:none;cursor:pointer;display:grid;place-items:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button><input id="srch" role="combobox" aria-expanded="false" aria-autocomplete="list" placeholder="Search posts" aria-label="Search posts" autocomplete="off" style="position:absolute;left:34px;right:12px;top:0;height:36px;border:0;background:none;color:var(--ink);font:14px var(--sans);outline:none"></div></div><div class="rs card" role="listbox" style="position:absolute;top:58px;left:0;right:0;overflow:hidden;transform-origin:50% 0;visibility:hidden"><i class="hl" style="position:absolute;left:6px;right:6px;top:0;border-radius:8px;background:var(--raised)"></i><div class="em small muted" style="position:absolute;left:0;right:0;top:0;height:52px;display:grid;place-items:center"></div></div></div><div class="hint">Click the magnifier, then type “pri” or “fog” · Esc closes</div>`,
  desc:'The icon button widens into the field while the brand fades, and the input appears once the shape has mostly opened. As you type, results open below. Matching rows spring into place with the match in bold, misses blur out, and the highlight follows the arrow keys.',
  api:'w.set(open ? 220 : 36)   results.o.set(query)   row.y.set(k·52)   row.o.set(match)',
  init(st){
    const sx = $(st,'.sx'), inp = $(st,'input'), brand = $(st,'.brand'), rs = $(st,'.rs'), hl = $(st,'.hl'), em = $(st,'.em'), w = new Track(36), io = new Track(0), bo = new Track(1);
    const P = [['On member pricing','Essay · Sep 21'],['The yearly pricing toggle, explained','Guide · Sep 18'],['Fog notes from the mill','Notes · Sep 28'],['A smaller homepage','Essay · Sep 14'],['Fixing the font flash','Notes · Sep 9'],['Harbor at 6am','Photos · Sep 30'],['Why we sunset comments','Essay · Aug 30']], R = 52, PD = 6;
    const esc2 = s => s.replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
    const rows = P.map(([h,m]) => { const d = document.createElement('a'); d.href = '#'; d.setAttribute('role','option'); d.style.cssText = 'position:absolute;left:6px;right:6px;top:0;height:52px;padding:8px 10px;text-decoration:none;color:var(--ink);display:flex;flex-direction:column;justify-content:center;border-radius:8px';
      d.innerHTML = `<span class="ti small" style="font-weight:500"></span><span class="small muted">${m}</span>`; rs.appendChild(d); d.onclick = e => e.preventDefault(); return { d, ti:$(d,'.ti'), h, y:new Track(PD), o:new Track(0) }; });
    const ro = new Track(0), H = new Track(52), e = edges(PD, PD + R); let vis = [], hi = 0;
    const filter = () => { const q = inp.value.trim().toLowerCase(); if (!q){ openSet(ro, false); inp.setAttribute('aria-expanded', false); rows.forEach(r => r.o.set(0, S.snap)); return; }
      const opening = !ro.target; vis = rows.filter(r => r.h.toLowerCase().includes(q)).slice(0, 4);
      rows.forEach(r => { const k = vis.indexOf(r), i = r.h.toLowerCase().indexOf(q); r.ti.innerHTML = i >= 0 ? esc2(r.h.slice(0,i)) + '<b>' + esc2(r.h.slice(i, i + q.length)) + '</b>' + esc2(r.h.slice(i + q.length)) : esc2(r.h);
        if (k >= 0){ (opening || r.o.target === 0) ? r.y.jump(PD + k*R) : r.y.set(PD + k*R); } r.o.set(k >= 0 ? 1 : 0, k >= 0 ? S.base : S.snap); });
      em.textContent = vis.length ? '' : `No posts match “${inp.value.trim()}”`; const h = vis.length ? PD*2 + vis.length*R : 52; opening ? H.jump(h) : H.set(h);
      hi = 0; opening ? e.jump(PD, PD + R) : e.go(PD, PD + R); openSet(ro, true); inp.setAttribute('aria-expanded', true); };
    const set = on => { const t0 = now(); w.set(on ? Math.min(230, st.clientWidth*.55) : 36); io.set(on ? 1 : 0, on ? S.base : S.snap, on ? t0 + .12 : t0); bo.set(on && st.clientWidth < 420 ? 0 : 1); if (on) setTimeout(() => inp.focus(), 0); else { openSet(ro, false); inp.setAttribute('aria-expanded', false); } };
    $(st,'.sb').onclick = () => set(w.target === 36);
    inp.oninput = filter;
    inp.onkeydown = ev => { if (ev.key === 'Escape'){ inp.value = ''; inp.blur(); set(false); return; } if (!vis.length || !ro.target) return;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp'){ ev.preventDefault(); hi = (hi + (ev.key === 'ArrowDown' ? 1 : vis.length - 1)) % vis.length; e.go(PD + hi*R, PD + (hi+1)*R); }
      if (ev.key === 'Enter'){ ev.preventDefault(); inp.value = vis[hi].h; filter(); } };
    rows.forEach(r => { r.d.onpointerdown = ev => ev.preventDefault(); r.d.onpointerenter = () => { const k = vis.indexOf(r); if (k >= 0 && k !== hi){ hi = k; e.go(PD + k*R, PD + (k+1)*R); } }; });
    inp.onblur = () => { if (!inp.value) set(false); else { openSet(ro, false); inp.setAttribute('aria-expanded', false); } };
    inp.onfocus = () => { if (inp.value) filter(); };
    return t => { sx.style.width = px(w.at(t)); fade(inp, io.at(t), null); inp.style.visibility = io.at(t) < .01 ? 'hidden' : 'visible'; brand.style.opacity = clamp(bo.at(t)).toFixed(3);
      pop(rs, ro.at(t)); rs.style.height = px(H.at(t)); plate(hl, e.A.at(t), e.B.at(t)); hl.style.opacity = vis.length ? 1 : 0; em.style.opacity = vis.length ? 0 : 1;
      rows.forEach(r => { r.d.style.transform = `translateY(${px(r.y.at(t))})`; const k = clamp(r.o.at(t)); r.d.style.opacity = k.toFixed(3); r.d.style.filter = k < .98 ? `blur(${((1-k)*BLUR).toFixed(2)}px)` : 'none'; r.d.style.pointerEvents = r.o.target ? 'auto' : 'none'; }); };
  }});
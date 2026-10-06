

atom({ id:'combobox', cat:'Inputs', name:'Combobox', block:'form, Combobox primitive', fam:['X','E','M'], tall:true,
  html:`<div style="position:absolute;top:56px;left:50%;transform:translateX(-50%);width:min(280px,calc(100% - 48px))"><label class="row" style="height:48px;border:1px solid var(--line);border-radius:12px;background:var(--card);padding:0 16px;gap:8px;color:var(--muted)">${ic(I.search,14)}<input id="cbx" role="combobox" aria-autocomplete="list" aria-expanded="false" placeholder="Find a country…" aria-label="Country" aria-controls="country-options" autocomplete="off" style="flex:1;min-width:0;border:0;background:none;color:var(--ink);font:14px var(--sans);outline:none"></label><div id="country-options" class="lb card" role="listbox" style="position:absolute;top:56px;left:0;right:0;overflow:hidden;transform-origin:50% 0;visibility:hidden"><i class="hl" style="position:absolute;left:8px;right:8px;top:0;border-radius:7px;background:var(--raised)"></i></div></div>`,
  desc:'Typing filters in place. Matches spring into their new rows, misses blur out, and the matched letters bold. With no match, an “Add” row takes the first slot. The list height follows the count.',
  api:'row.y.set(k·34)   row.o.set(match)   list.h.set(min(n, 5)·34 + 12)',
  init(st){
    const inp = $(st,'input'), lb = $(st,'.lb'), hl = $(st,'.hl'), C = ['Argentina','Australia','Austria','Belgium','Brazil','Canada','Chile','Denmark','Estonia','Finland'], R = 40, P = 8;
    const mk = () => { const d = document.createElement('div'); d.setAttribute('role','option'); d.style.cssText = 'position:absolute;left:8px;right:8px;top:0;height:40px;display:flex;align-items:center;padding:0 16px;font-size:12px;cursor:pointer;border-radius:7px'; lb.appendChild(d); return d; };
    const rows = C.map(n => ({ el:mk(), n, y:new Track(0), o:new Track(0) })); const add = { el:mk(), n:'', y:new Track(P), o:new Track(0), add:true }; add.el.style.color = 'var(--muted)';
    const o = new Track(0), H = new Track(0), e = edges(P, P + R); let vis = [], hi = 0, open = false;
    const esc2 = s => s.replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
    const render = () => { const q = inp.value.trim().toLowerCase(); vis = rows.filter(r => r.n.toLowerCase().includes(q)).slice(0,5);
      rows.forEach(r => { const k = vis.indexOf(r), i = r.n.toLowerCase().indexOf(q);
        r.el.innerHTML = q && i >= 0 ? esc2(r.n.slice(0,i)) + '<b>' + esc2(r.n.slice(i, i + q.length)) + '</b>' + esc2(r.n.slice(i + q.length)) : esc2(r.n);
        if (k >= 0){ r.o.target === 0 ? r.y.jump(P + k*R) : r.y.set(P + k*R); } r.o.set(k >= 0 ? 1 : 0, k >= 0 ? S.base : S.snap); });
      if (!vis.length && q){ add.el.innerHTML = `Add “${esc2(inp.value.trim())}”`; vis = [add]; add.o.set(1); } else add.o.set(0, S.snap);
      H.set(P*2 + Math.max(1, vis.length)*R); hi = 0; e.go(P, P + R); };
    const setOpen = v => { open = v; openSet(o, v); inp.setAttribute('aria-expanded', v); if (v){ render(); H.jump(P*2 + Math.max(1, vis.length)*R); e.jump(P, P + R); } };
    const choose = r => { inp.value = r.add ? inp.value.trim() : r.n; setOpen(false); };
    inp.onfocus = () => setOpen(true); inp.oninput = () => open ? render() : setOpen(true); inp.onblur = () => setOpen(false);
    inp.onkeydown = ev => { if (!vis.length) return; if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp'){ ev.preventDefault(); hi = (hi + (ev.key === 'ArrowDown' ? 1 : vis.length - 1)) % vis.length; e.go(P + hi*R, P + (hi+1)*R); }
      if (ev.key === 'Enter'){ ev.preventDefault(); choose(vis[hi]); } if (ev.key === 'Escape') setOpen(false); };
    [...rows, add].forEach(r => { r.el.onpointerdown = ev => ev.preventDefault(); r.el.onclick = () => choose(r); r.el.onpointerenter = () => { const k = vis.indexOf(r); if (k >= 0 && k !== hi){ hi = k; e.go(P + k*R, P + (k+1)*R); } }; });
    return t => { pop(lb, o.at(t)); lb.style.height = px(H.at(t)); plate(hl, e.A.at(t), e.B.at(t)); hl.style.opacity = vis.length ? 1 : 0;
      [...rows, add].forEach(r => { r.el.style.transform = `translateY(${px(r.y.at(t))})`; const k = clamp(r.o.at(t)); r.el.style.opacity = k.toFixed(3); r.el.style.filter = k < .98 ? `blur(${((1-k)*BLUR).toFixed(2)}px)` : 'none'; r.el.style.pointerEvents = r.o.target ? 'auto' : 'none'; }); };
  }});
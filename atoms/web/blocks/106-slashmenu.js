

atom({ id:'slashmenu', cat:'Writing', name:'Slash command menu', block:'richtext editor, symbol', fam:['X','E','M'], tall:true,
  html:`<div class="col ed" style="width:min(340px,90%);gap:6px"><input id="slash-in" placeholder="Type / to insert a block" autocomplete="off" aria-label="Editor line" style="border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);font:15px var(--sans);padding:6px 0;outline:none"><div class="blocks col" style="gap:6px"></div></div><div class="mn card" role="listbox" style="position:absolute;left:0;top:0;width:200px;padding:6px;visibility:hidden;transform-origin:0 0"><i class="hl" style="position:absolute;left:6px;right:6px;top:0;border-radius:7px;background:var(--raised)"></i></div>`,
  desc:'Typing “/” opens the menu right at the caret. Typing more filters it in place, the highlight follows with lagging edges, and Enter inserts a block that opens below.',
  api:'menu.at(caretX)   rows.filter(query)   block.h.set(1)',
  init(st){
    const inp = $(st,'input'), mn = $(st,'.mn'), hl = $(st,'.hl'), blocks = $(st,'.blocks'), B = ['Heading','Image','Quote','Divider','Callout','Table'], R = 32, P = 6;
    const rows = B.map((n,i) => { const d = document.createElement('div'); d.setAttribute('role','option'); d.textContent = n; d.style.cssText = 'position:absolute;left:6px;right:6px;top:0;height:32px;display:flex;align-items:center;padding:0 10px;font-size:14px;cursor:pointer;border-radius:7px'; mn.appendChild(d); return { d, n, y:new Track(P + i*R), o:new Track(1) }; });
    const o = new Track(0), H = new Track(P*2 + B.length*R), e = edges(P, P + R); let vis = rows.slice(), hi = 0, ins = [];
    const ctx = document.createElement('canvas').getContext('2d');
    const q = () => { const m = inp.value.match(/\/(\w*)$/); return m ? m[1].toLowerCase() : null; };
    const upd = () => { const s = q(); if (s === null){ o.target && o.set(0, S.snap); return; }
      if (!o.target){ ctx.font = '15px Geist, sans-serif'; const r = relRect(st, inp.getBoundingClientRect()); mn.style.left = px(Math.min(r.x + ctx.measureText(inp.value.slice(0, -s.length - 1)).width, st.clientWidth - 208)); mn.style.top = px(r.y + r.h + 6); o.set(1); }
      vis = rows.filter(r => r.n.toLowerCase().startsWith(s)); rows.forEach(r => { const k = vis.indexOf(r); r.o.set(k >= 0 ? 1 : 0); if (k >= 0) r.y.set(P + k*R); }); H.set(P*2 + Math.max(1, vis.length)*R); hi = 0; e.go(P, P + R); };
    const insert = r => { const d = document.createElement('div'); d.className = 'card small'; d.style.cssText += 'overflow:hidden;padding:0 12px'; d.innerHTML = `<div style="padding:10px 0"><b>${r.n}</b> <span class="muted">block</span></div>`; blocks.prepend(d); ins.unshift({ d, h:new Track(0) }); ins[0].h.set(1); if (ins.length > 3) ins.pop().d.remove();
      inp.value = inp.value.replace(/\/\w*$/, ''); o.set(0, S.snap); inp.focus(); };
    inp.oninput = upd; inp.onblur = () => setTimeout(() => o.set(0, S.snap), 0);
    inp.onkeydown = ev => { if (!o.target || !vis.length) return; if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp'){ ev.preventDefault(); hi = (hi + (ev.key === 'ArrowDown' ? 1 : vis.length - 1)) % vis.length; e.go(P + hi*R, P + (hi+1)*R); } if (ev.key === 'Enter'){ ev.preventDefault(); insert(vis[hi]); } if (ev.key === 'Escape') o.set(0, S.snap); };
    rows.forEach(r => { r.d.onmousedown = ev => ev.preventDefault(); r.d.onclick = () => insert(r); r.d.onpointerenter = () => { const k = vis.indexOf(r); if (k >= 0){ hi = k; e.go(P + k*R, P + (k+1)*R); } }; });
    return t => { pop(mn, o.at(t), 0); mn.style.height = px(H.at(t)); plate(hl, e.A.at(t), e.B.at(t)); rows.forEach(r => { r.d.style.transform = `translateY(${px(r.y.at(t))})`; const k = clamp(r.o.at(t)); r.d.style.opacity = k.toFixed(3); r.d.style.pointerEvents = r.o.target ? 'auto' : 'none'; });
      ins.forEach(b => { const h = clamp(b.h.at(t)); b.d.style.height = px(h*b.d.firstChild.offsetHeight); b.d.style.opacity = h.toFixed(3); }); };
  }});
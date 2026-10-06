

atom({ id:'palette', cat:'Admin', name:'Command palette', block:'AdminCommandPalette', fam:['M','E','S','X'], tall:true,
  html:`<div class="card" style="width:min(380px,90%);overflow:hidden"><input role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="cieo-command-list" id="palq" placeholder="Type a command…" autocomplete="off" aria-label="Search commands" style="width:100%;border:0;border-bottom:1px solid var(--line-soft);background:none;color:var(--ink);font:15px var(--sans);padding:13px 16px;outline:none"><div id="cieo-command-list" role="listbox" aria-label="Commands" class="pll" style="position:relative;overflow:hidden"><div class="hl" style="position:absolute;left:6px;right:6px;border-radius:9px;background:var(--raised)"></div><div class="em layer small muted">No matching commands</div></div><div class="ps" style="position:relative;height:32px;border-top:1px solid var(--line-soft);font-size:12px;color:var(--faint)"></div></div>`,
  desc:'Rows spring to their new slots as the filter changes and hidden rows blur out in place. The highlight moves with lagging edges. Arrow keys and Enter work.',
  api:'row.y.set(k·40)   row.o.set(match)   hl.go(top, bottom)',
  init(st){
    const q = $(st,'input'), list = $(st,'.pll'), hl = $(st,'.hl'), em = $(st,'.em'), ps = $(st,'.ps');
    const C = [['New page','⌘N'],['Open site settings','⌘,'],['Invite teammate','⌘I'],['Toggle theme','⌘T'],['Search media','⌘P'],['Export content','⌘E'],['Sign out','⇧⌘Q']], R = 40, P = 8;
    const rows = C.map(([n,k],i) => { const el = document.createElement('div'); el.style.cssText = 'position:absolute;left:0;right:0;top:0;height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;font-size:14px;cursor:pointer';
      el.innerHTML = `<span></span><kbd style="font:12px var(--mono);color:var(--faint)"></kbd>`; el.id='cieo-command-'+i;el.setAttribute('role','option');el.setAttribute('aria-selected',i===0);el.children[0].textContent = n; el.children[1].textContent = k; list.appendChild(el); return { el, n, y:new Track(P + i*R), o:new Track(1) }; });
    const H = new Track(P*2 + C.length*R), e = edges(P, P + R), eo = new Track(0), sw = new Swap(0), msgs = ['↑↓ to move · Enter to run'];
    const mk = k => { const el = document.createElement('div'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.style.paddingLeft = '16px'; el.textContent = msgs[k]; ps.appendChild(el); return el; };
    msgs.push('');const layers=[mk(0),mk(1)]; let vis = rows.slice(), sel = 0;
    const match = (n, s) => { let j = 0; n = n.toLowerCase(); for (const c of s.toLowerCase()){ j = n.indexOf(c, j); if (j < 0) return false; j++; } return true; };
    const mv=i=>{sel=i;e.go(P+i*R,P+(i+1)*R);rows.forEach(r=>r.el.setAttribute('aria-selected',r===vis[i]));if(vis[i])q.setAttribute('aria-activedescendant',vis[i].el.id);else q.removeAttribute('aria-activedescendant');const top=P+i*R;if(top<list.scrollTop)list.scrollTop=top;if(top+R>list.scrollTop+list.clientHeight)list.scrollTop=top+R-list.clientHeight;};q.setAttribute('aria-activedescendant',rows[0].el.id);
    const run = () => { if (!vis[sel]) return; const next=sw.cur===0?1:0;layers[next].textContent=`Ran “${vis[sel].n}”`;sw.to(next); };
    q.oninput = () => { const s = q.value.trim(); vis = rows.filter(r => match(r.n, s)); rows.forEach(r => { const k = vis.indexOf(r); r.o.set(k >= 0 ? 1 : 0);r.el.setAttribute('aria-hidden',k<0); if (k >= 0) r.y.set(P + k*R); }); H.set(P*2 + Math.max(1, vis.length)*R); eo.set(vis.length ? 0 : 1); mv(0); };
    q.onkeydown = ev => { if (ev.key === 'ArrowDown'){ ev.preventDefault(); if (vis.length) mv((sel+1) % vis.length); } if (ev.key === 'ArrowUp'){ ev.preventDefault(); if (vis.length) mv((sel + vis.length - 1) % vis.length); } if (ev.key === 'Enter'){ ev.preventDefault(); run(); } };
    rows.forEach(r => { r.el.onpointerenter = () => { const k = vis.indexOf(r); if (k >= 0 && k !== sel) mv(k); }; r.el.onclick = () => { const k = vis.indexOf(r); if (k >= 0){ sel = k; run(); } }; });
    return t => { list.style.height = px(H.at(t)); rows.forEach(r => { r.el.style.transform = `translateY(${px(r.y.at(t))})`; fade(r.el, r.o.at(t), null); r.el.style.transform = `translateY(${px(r.y.at(t))})`; r.el.style.pointerEvents = r.o.target ? 'auto' : 'none'; });
      const a = e.A.at(t), b = e.B.at(t); hl.style.transform = `translateY(${px(a)})`; hl.style.height = px(b - a); hl.style.opacity = vis.length ? 1 : 0; em.style.opacity = clamp(eo.at(t));
      layers.forEach((el,k) => sw.apply(el,k,t)); };
  }});
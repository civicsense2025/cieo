

atom({ id:'toc', cat:'Content', name:'Table of contents', block:'table-of-contents', fam:['E','D'], tall:true,
  html:`<div class="card row" style="width:min(400px,94%);height:280px;align-items:stretch;gap:0;overflow:hidden"><nav class="tn" style="position:relative;width:118px;flex:none;padding:12px 0 12px 12px;border-right:1px solid var(--line-soft)"><i class="ti" style="position:absolute;left:12px;width:2px;border-radius:1px;background:var(--ink)"></i></nav><div class="ta small" style="flex:1;overflow:auto;padding:0 14px;line-height:1.6;overscroll-behavior:contain" tabindex="0" aria-label="Sample article"></div></div>`,
  desc:'The active marker tracks the section you are reading, with lagging edges so it stretches between short and long entries. Clicking an entry scrolls there on a spring.',
  api:'active = last heading above scrollTop   marker.go(top, bottom)',
  init(st){
    const tn = $(st,'.tn'), ti = $(st,'.ti'), ta = $(st,'.ta');
    const S2 = [['Setup','Install the CLI, sign in, and pick a starter. The starter sets your fonts, colors and first three pages.'],['Pages','Pages are made of blocks. Drag a block from the panel, then edit its text in place.'],['Domains','Point a CNAME at your site. Certificates are issued within a few minutes.'],['Members','Turn on member areas to gate posts. Readers sign in with a link sent to their email.'],['Publishing','Publish sends every changed page live at once. You can roll back from history.']];
    ta.innerHTML = S2.map(([h,p]) => `<h4 style="margin:14px 0 4px;font-size:14px">${h}</h4><p style="margin:0 0 6px">${p}</p><p class="muted" style="margin:0 0 6px">${p}</p>`).join('') + '<div style="height:160px"></div>';
    const hs = $$(ta,'h4'), links = S2.map(([h],i) => { const a = document.createElement('a'); a.href = '#'; a.textContent = h; a.style.cssText = 'display:block;padding:4px 0 4px 12px;font-size:13px;text-decoration:none;color:var(--muted)'; tn.appendChild(a);
      a.onclick = e => { e.preventDefault(); sc.jump(ta.scrollTop).set(hs[i].offsetTop - 10); auto = true; }; return a; });
    const e = edges(0,0), sc = new Track(0, S.soft); let cur = -1, auto = false;
    const pick = (i, inst) => { if (i === cur) return; cur = i; const a = links[i]; inst ? e.jump(a.offsetTop, a.offsetTop + a.offsetHeight) : e.go(a.offsetTop, a.offsetTop + a.offsetHeight); links.forEach((l,j) => l.style.color = j === i ? 'var(--ink)' : 'var(--muted)'); };
    const onScroll = () => { let i = 0; hs.forEach((h,j) => { if (h.offsetTop - 14 <= ta.scrollTop) i = j; }); pick(i); };
    ta.onscroll = onScroll; ta.addEventListener('wheel', () => auto = false, { passive:true }); ta.addEventListener('touchstart', () => auto = false, { passive:true });
    const init = () => { cur = -1; pick(0, true); }; document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => { if (auto){ ta.scrollTop = sc.at(t); if (!sc.prune(t)) auto = false; } const a = e.A.at(t), b = e.B.at(t); ti.style.top = px(a + 3); ti.style.height = px(Math.max(0, b - a - 6)); };
  }});
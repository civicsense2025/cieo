
atom({ id:'segswitch', cat:'Views', name:'Segmented view switch', block:'segmented, tabs, switcher', fam:['S','M'],
  html:`<div class="col" style="gap:8px;width:min(360px,94%)"><div class="sg" style="position:relative;display:grid;grid-template-columns:repeat(3,1fr);background:var(--fill);border-radius:10px;padding:2px"><div class="ind" style="position:absolute;top:2px;bottom:2px;border-radius:8px;background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.14)"></div><button class="s0">Stories</button><button class="s1">Saved</button><button class="s2">Search</button></div><div class="card vp" style="padding:14px 16px;overflow:hidden"><div class="row" style="justify-content:space-between;align-items:baseline"><b class="vh" style="position:relative;height:23px;flex:1"></b><span class="small muted num"><span class="ct"></span> items</span></div><div class="vr" style="position:relative;margin-top:8px"></div></div><label class="row small muted" style="gap:6px"><input type="checkbox" class="rc" checked> roll counts</label></div><div class="hint">Switch segments</div>`,
  desc:'The plate stretches from its leading edge and the trailing edge catches up 60ms later. The old heading leaves before the new heading and rows arrive 50ms apart. The shell height springs to fit, and the count rolls.',
  api:'edge.go(x0,x1) trails .06   vh.to(i) then vr.to(i,+.05)   h.set(H[i])   ct.set(n)',
  init(st){
    const V = [
      { h:'Stories from the county line', c:'12', r:['Water board votes 4–3 on rates','Bus route 12 quietly disappears'], H:158 },
      { h:'Saved for the weekend', c:'03', r:['Reading a city budget in ten minutes','What a consent calendar hides'], H:158 },
      { h:'Search the archive', c:'08', r:['48,211 clips, fully searchable','Filter by date, desk, reporter'], H:158 }];
    const btns = [$$(st,'.s0')[0], $$(st,'.s1')[0], $$(st,'.s2')[0]];
    btns.forEach(b => Object.assign(b.style, { position:'relative', zIndex:1, height:'32px', border:0, borderRadius:'8px', background:'none', cursor:'pointer', fontSize:'13px', fontWeight:500 }));
    const ind = $(st,'.ind'), vh = $(st,'.vh'), vr = $(st,'.vr'), vp = $(st,'.vp');
    const HL = V.map(v => { const e = document.createElement('b'); e.className = 'layer'; e.textContent = v.h; Object.assign(e.style, { fontSize:'15px', fontWeight:600, lineHeight:1.5, whiteSpace:'nowrap' }); vh.appendChild(e); return e; });
    const RL = V.map(v => { const e = document.createElement('div'); e.className = 'layer'; e.style.width = '100%';
      e.innerHTML = `<div style="font-size:13px;line-height:1.5;padding:8px 0">${v.r[0]}</div><div style="font-size:13px;line-height:1.5;padding:8px 0;border-top:1px solid var(--line)">${v.r[1]}</div>`; vr.appendChild(e); return e; });
    const swH = new Swap(0), swR = new Swap(0), h = new Track(V[0].H), e = edges(0, 0), dg = new Digits($(st,'.ct'), 2);
    let cur = 0; const rc = $(st,'.rc');
    const place = i => { const b = btns[i]; return [b.offsetLeft + 2, b.offsetLeft + b.offsetWidth - 2]; };
    const go = i => { if (i === cur){ swH.cur = -1; swH.to(i); swR.cur = -1; swR.to(i, now() + .05); return; } cur = i; const [a, b] = place(i); e.go(a, b);
      swH.to(i); swR.to(i, now() + .05); h.set(V[i].H); if (rc.checked) dg.set(V[i].c); else dg.set(V[i].c, true); paint(); };
    const paint = () => btns.forEach((b, k) => { b.style.color = k === cur ? 'var(--ink)' : 'var(--muted)'; b.style.fontWeight = k === cur ? 600 : 500; });
    btns.forEach((b, i) => b.onclick = () => go(i));
    requestAnimationFrame(() => { const [a, b] = place(0); e.jump(a, b); paint(); });
    dg.set('12', true); paint();
    return t => { ind.style.left = px(e.A.at(t)); ind.style.width = px(Math.max(0, e.B.at(t) - e.A.at(t)));
      vp.style.height = px(h.at(t)); HL.forEach((el, k) => swH.apply(el, k, t)); RL.forEach((el, k) => swR.apply(el, k, t, 6)); dg.render(t); };
  }});

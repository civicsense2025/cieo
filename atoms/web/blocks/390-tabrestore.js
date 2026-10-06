
atom({ id:'tabrestore', cat:'Views', name:'Tab state restore', block:'tabs, state restore', fam:['S','M'],
  html:`<div class="col" style="gap:8px;width:min(360px,94%)"><div class="tb" style="position:relative;display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line)"><div class="ind" style="position:absolute;bottom:-1px;height:2px;background:var(--ink)"></div><button class="t0">Read <b class="b0 num"></b></button><button class="t1">Saved <b class="b1 num"></b></button><button class="t2">Me <b class="b2 num"></b></button></div><div class="card bd" style="padding:0;overflow:hidden"><div class="pn" style="position:relative;height:150px"><div class="layer p0" style="position:absolute;inset:0;overflow-y:auto;padding:10px 16px"></div><div class="layer p1" style="position:absolute;inset:0;overflow-y:auto;padding:10px 16px"></div><div class="layer p2" style="position:absolute;inset:0;overflow-y:auto;padding:10px 16px"></div></div><div class="small muted" style="padding:8px 16px;border-top:1px solid var(--line);font-size:12px"><span class="dp"></span> · scroll restores</div></div><div class="row" style="gap:8px;align-items:center"><button class="btn ping">Simulate alert</button><span class="small muted">switching a tab clears its badge</span></div></div><div class="hint">Scroll a tab, switch away, come back</div>`,
  desc:'Tabs swap with no travel: the old pane leaves, then the new one arrives. Each tab restores its scroll position and stack depth instantly. The indicator stretches leading-edge-first and badges roll down to zero.',
  api:'sw.apply(amp 0) no travel   scrollTop saved+restored instant   edge.go(tab)   dg.set(0)',
  init(st){
    const rows = [['Water board vote','Bus route 12','Library hours','Clerk packet 2291','Voter drive shifts','Budget hearing','Comment guide','Zoning map'],['Consent calendars','City budgets','Agenda requests'],['Profile','Notifications','Reading history','Membership']];
    const panes = [$$(st,'.p0')[0], $$(st,'.p1')[0], $$(st,'.p2')[0]];
    panes.forEach((pn, i) => pn.innerHTML = rows[i].map(r => `<div style="font-size:13px;line-height:1.5;padding:8px 0;border-top:1px solid var(--line)">${r}</div>`).join(''));
    panes.forEach(pn => pn.firstChild.style.borderTop = '0');
    const btns = [$$(st,'.t0')[0], $$(st,'.t1')[0], $$(st,'.t2')[0]];
    btns.forEach(b => Object.assign(b.style, { height:'36px', border:0, background:'none', cursor:'pointer', fontSize:'13px', fontWeight:500 }));
    const sw = new Swap(0), e = edges(0, 0), ind = $(st,'.ind'), dp = $(st,'.dp');
    const dgs = [new Digits($(st,'.b0'), 1), new Digits($(st,'.b1'), 1), new Digits($(st,'.b2'), 1)];
    const saved = [0, 0, 0], depth = [2, 1, 0], counts = [3, 1, 0];
    let cur = 0;
    dgs.forEach((d, i) => d.set(String(counts[i]), true));
    const place = i => { const b = btns[i]; return [b.offsetLeft + 12, b.offsetLeft + b.offsetWidth - 12]; };
    const go = i => { if (i === cur) return; saved[cur] = panes[cur].scrollTop;
      cur = i; const [a, b] = place(i); e.go(a, b); sw.to(i);
      panes[i].scrollTop = saved[i]; counts[i] = 0; dgs[i].set('0');
      dp.textContent = ['Read', 'Saved', 'Me'][i] + ' · ' + depth[i] + ' deep'; paint(); };
    const paint = () => btns.forEach((b, k) => { b.style.color = k === cur ? 'var(--ink)' : 'var(--muted)'; b.style.fontWeight = k === cur ? 600 : 500; });
    btns.forEach((b, i) => b.onclick = () => go(i));
    $(st,'.ping').onclick = () => { const i = (cur + 1 + Math.floor(Math.random() * 2)) % 3; counts[i]++; dgs[i].set(String(counts[i])); };
    requestAnimationFrame(() => { const [a, b] = place(0); e.jump(a, b); paint(); });
    dp.textContent = 'Read · 2 deep'; paint();
    return t => { ind.style.left = px(e.A.at(t)); ind.style.width = px(Math.max(0, e.B.at(t) - e.A.at(t)));
      panes.forEach((p, k) => sw.apply(p, k, t, 0)); dgs.forEach(d => d.render(t)); };
  }});

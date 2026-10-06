
atom({ id:'splittabs', cat:'Email', name:'Split tabs', block:'email, tabs, focus', fam:['E','S','T'],
  html:`<div class="col" style="gap:8px;width:min(320px,94%)"><div class="card" style="padding:14px 16px;line-height:1.5"><div class="tabs" style="position:relative;display:flex;gap:4px;background:var(--raised);border-radius:10px;padding:3px"><span class="ind" style="position:absolute;left:0;top:0;background:var(--card);border-radius:7px;box-shadow:var(--shadow)"></span></div><div class="panel" style="overflow:hidden;margin-top:8px"><div class="rows"></div><div class="empty" style="position:relative;min-height:52px;display:grid;place-items:center"></div></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" class="sc" checked> show counts</label></div><div class="hint">Tabs trail edges; Tools is empty</div>`,
  desc:'Tab edges trail 60ms behind the pick while counts roll down as mail is triaged. The empty split fades in and its width springs shut to fit.',
  api:'e.go(l, r) trails .06   counts roll on triage   panel h.set(64/156, base)   end: triaged',
  init(st){
    const tabs = $(st,'.tabs'), ind = $(st,'.ind'), rows = $(st,'.rows'), empty = $(st,'.empty'), panel = $(st,'.panel'), sc = $(st,'.sc');
    const data = [['Team', 12, [['MQ','Pricing draft','Tue'],['JK','Scope v2','Tue']]], ['VIP', 3, [['AC','Board pre-read','Mon']]], ['Tools', 0, []]];
    const btns = data.map((d, i) => { const b = document.createElement('button');
      b.style.cssText = 'position:relative;background:none;border:0;border-radius:7px;padding:6px 10px;font-size:13px;font-weight:500;cursor:pointer;min-height:32px;display:flex;gap:6px;align-items:center';
      const n = document.createElement('b'); n.textContent = d[0];
      const c = document.createElement('span'); c.className = 'num'; c.style.fontSize = '12px'; c.style.color = 'var(--muted)';
      b.appendChild(n); b.appendChild(c); tabs.appendChild(b); return { b, c }; });
    const dg = btns.map((o, i) => { const g = new Digits(o.c, 2); g.set(String(data[i][1]), true); return g; });
    const el = ['All caught up in Tools', 'Tools is quiet'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '12.5px'; e.className += ''; e.textContent = s; e.style.color = 'var(--muted)'; empty.appendChild(e); return e; });
    const e = edges(0, 0), sw = new Swap(1), ph = new Track(156), eo = new Track(0);
    let cur = -1, indH = 32;
    const draw = () => { rows.innerHTML = ''; data[cur][2].forEach((r, i) => {
        const d = document.createElement('div');
        d.style.cssText = 'display:flex;align-items:center;gap:10px;min-height:52px' + (i ? ';border-top:1px solid var(--line-soft)' : '');
        d.innerHTML = `<span style="width:34px;height:34px;flex:none;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:12px;font-weight:600;padding:0;transform:translateY(.5px)">${r[0]}</span><span style="display:flex;flex-direction:column;flex:1;line-height:1.5"><b style="font-size:13.5px;font-weight:600">${r[1]}</b><span class="small muted" style="font-size:12px">${r[2]}</span></span>`;
        rows.appendChild(d); }); };
    const pick = (i, inst) => { cur = i; const b = btns[i].b;
      btns.forEach((o, j) => o.b.setAttribute('aria-pressed', i === j));
      indH = b.offsetHeight || 32;
      const go = inst ? 'jump' : 'go'; e[go](b.offsetLeft, b.offsetLeft + b.offsetWidth);
      if (!inst && data[i][1] > 0 && data[i][2].length){ data[i][1]--; dg[i].set(String(data[i][1])); }
      draw(); sw.to(data[i][2].length ? 0 : 1); ph.set(data[i][2].length ? 156 : 64, S.base); eo.set(data[i][2].length ? 0 : 1, S.base); };
    btns.forEach((o, i) => o.b.onclick = () => pick(i));
    sc.onchange = () => btns.forEach(o => o.c.style.visibility = sc.checked ? 'visible' : 'hidden');
    const boot = () => pick(0, true); document.fonts.ready.then(boot); boot();
    return t => { const a = e.A.at(t), b = e.B.at(t);
      ind.style.transform = `translate(${px(a)},${px(3)})`; ind.style.width = px(Math.max(0, b - a)); ind.style.height = px(indH);
      rows.style.opacity = (1 - clamp(eo.at(t))).toFixed(3); empty.style.opacity = clamp(eo.at(t)).toFixed(3);
      empty.style.visibility = eo.at(t) < .05 ? 'hidden' : 'visible';
      panel.style.height = px(Math.max(0, ph.at(t)));
      el.forEach((x, k) => sw.apply(x, k, t)); dg.forEach(g => g.render(t)); };
  }});

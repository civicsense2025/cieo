
atom({ id:'mailjump', cat:'Email', name:'Command-K jump', block:'email, palette, search', fam:['S','E','M'],
  html:`<div class="col" style="gap:8px;width:min(340px,96%);align-items:center"><button class="btn Go" style="min-height:32px">⌘K Jump to email</button><div class="pal card" style="padding:14px 16px;line-height:1.5;width:100%;position:relative"><input class="q" placeholder="Search mail…" style="width:100%;min-height:32px;border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:13px;background:var(--card);color:var(--ink)"><div style="display:flex;gap:10px;margin-top:8px"><div class="lst" style="position:relative;flex:1.2;overflow:hidden"><span class="hl" style="position:absolute;left:0;right:0;background:var(--raised);border-radius:8px"></span></div><div class="pvw" style="flex:1;border-left:1px solid var(--line-soft);padding-left:10px;position:relative;min-height:156px"></div></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox"> search sent too</label></div><div class="hint">Type to filter; ↑↓ to move</div>`,
  desc:'An email-scoped palette where rows spring into slots as you type, the highlight trails on lagging edges, and the preview swaps behind the pick.',
  api:'rows y.set(slot*52, base)   hl.go(top, top+52) lag .06   pvw.to(i)   end: jumped',
  init(st){
    const pal = $(st,'.pal'), q = $(st,'.q'), lst = $(st,'.lst'), hl = $(st,'.hl'), pvw = $(st,'.pvw');
    $(st,'.Go').onclick = () => { q.focus(); q.select(); };
    const mail = [['Board pre-read','AC','Q3 numbers inside'],['Pricing draft','MQ','New tiers attached'],['Scope v2','JK','Ship it Thursday']];
    const ys = mail.map(() => new Track(0)), os = mail.map(() => new Track(1));
    const rows = mail.map((m, i) => { const d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:0;right:0;height:52px;display:flex;gap:8px;align-items:center;cursor:pointer';
      d.innerHTML = `<span style="width:32px;height:32px;flex:none;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:11.5px;font-weight:600;padding:0;transform:translateY(.5px)">${m[1]}</span><span style="font-size:13px;font-weight:600;line-height:1.5">${m[0]}</span>`;
      d.onclick = () => hi(i, true); lst.appendChild(d); return d; });
    const pv = mail.map(m => { const e = document.createElement('span'); e.className = 'layer'; e.style.cssText = 'align-items:flex-start;justify-content:flex-start;flex-direction:column;gap:2px';
      e.innerHTML = `<b style="font-size:13.5px;font-weight:600">${m[0]}</b><span class="small muted" style="font-size:12px">${m[1]} · ${m[2]}</span>`; pvw.appendChild(e); return e; });
    const e = edges(0, 52), sw = new Swap(0);
    let vis = [0,1,2], cur = 0;
    const hi = (k, jump) => { cur = k; const slot = Math.max(0, vis.indexOf(k)); sw.to(k);
      if (jump) e.jump(slot*52, slot*52 + 52); else e.go(slot*52, slot*52 + 52); };
    const filt = () => { const s = q.value.trim().toLowerCase(), t = now();
      vis = mail.map((m, i) => (m[0] + m[1]).toLowerCase().includes(s) ? i : -1).filter(i => i >= 0);
      mail.forEach((m, i) => { const slot = vis.indexOf(i);
        ys[i].set(slot < 0 ? vis.length*52 : slot*52, S.base, t); os[i].set(slot < 0 ? 0 : 1, S.base, t); });
      lst.style.height = px(Math.max(52, vis.length*52));
      if (!vis.includes(cur) && vis.length) hi(vis[0]); else if (vis.length) hi(cur); };
    q.addEventListener('input', filt);
    q.addEventListener('keydown', ev => { if (!vis.length) return;
      let k = vis.indexOf(cur); if (ev.key === 'ArrowDown') k = (k+1) % vis.length; else if (ev.key === 'ArrowUp') k = (k-1+vis.length) % vis.length; else return;
      ev.preventDefault(); hi(vis[k]); });
    lst.style.height = px(156); e.jump(0, 52);
    return t => { rows.forEach((d, i) => { const p = clamp(os[i].at(t));
        d.style.transform = `translateY(${ys[i].at(t).toFixed(2)}px)`; d.style.opacity = (.45 + .55*p).toFixed(3);
        d.style.visibility = p < .03 ? 'hidden' : 'visible'; });
      hl.style.transform = `translateY(${px(e.A.at(t))})`; hl.style.height = px(Math.max(0, e.B.at(t) - e.A.at(t)));
      pv.forEach((x, k) => sw.apply(x, k, t)); };
  }});

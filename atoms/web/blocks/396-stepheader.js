
atom({ id:'stepheader', cat:'Forms', name:'Stepper header', block:'stepper, steps, progress', fam:['S','M'],
  html:`<div class="col" style="gap:8px;width:min(380px,96%)"><div class="card" style="padding:14px 16px"><div class="vw" style="position:relative;overflow-x:auto;scrollbar-width:none"><div class="plate" style="position:absolute;top:0;height:28px;border-radius:14px;background:var(--fill)"></div><div class="tr" style="position:relative;display:flex;align-items:center;gap:0"></div><div class="fdl" style="position:absolute;left:0;top:0;bottom:0;width:20px;background:linear-gradient(90deg,var(--card),transparent);pointer-events:none"></div><div class="fdr" style="position:absolute;right:0;top:0;bottom:0;width:20px;background:linear-gradient(-90deg,var(--card),transparent);pointer-events:none"></div></div><div class="cap small muted" style="font-size:12.5px;margin-top:8px"></div></div><label class="row small muted" style="gap:6px"><input type="checkbox" class="sx"> 6 steps (overflow)</label></div><div class="hint">Click any step; done steps swap to checks</div>`,
  desc:'The active plate glides with its leading edge first. The connector fills toward the new step, then the node inks. Finished steps swap their numbers for checks, and extra steps fade at the scrolled edges.',
  api:'plate edges glide .06   fill.set(i/(n-1)) then node inks   done.to(check)   overflow fades',
  init(st){
    const tr = $(st,'.tr'), plate = $(st,'.plate'), vw = $(st,'.vw'), cap = $(st,'.cap');
    const names4 = ['Invite', 'Details', 'Review', 'Done'], names6 = ['Invite', 'Team', 'Details', 'Plan', 'Review', 'Done'];
    const e = edges(0, 0), fill = new Track(0); let names = names4, cur = 0, nodes = [], segs = [], sws = [];
    const build = () => { tr.innerHTML = ''; nodes = []; segs = []; sws = [];
      names.forEach((n, i) => {
        if (i > 0){ const s = document.createElement('div'); s.style.cssText = 'flex:1;height:2px;border-radius:1px;background:var(--line);margin:0 2px;min-width:14px;position:relative;overflow:hidden';
          const f = document.createElement('div'); f.style.cssText = 'position:absolute;inset:0;background:var(--accent);width:0'; s.appendChild(f); tr.appendChild(s); segs.push(f); }
        const b = document.createElement('button');
        b.style.cssText = 'position:relative;z-index:1;display:flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:14px;background:none;cursor:pointer;font-size:13px;white-space:nowrap';
        const dot = document.createElement('span'); dot.style.cssText = 'position:relative;width:18px;height:18px;display:grid;place-items:center;padding:0;font-size:11px;font-weight:600';
        const n1 = document.createElement('span'); n1.className = 'layer'; n1.textContent = String(i + 1);
        const n2 = document.createElement('span'); n2.className = 'layer'; n2.textContent = '✓'; dot.appendChild(n1); dot.appendChild(n2);
        const lb = document.createElement('span'); lb.textContent = n; b.appendChild(dot); b.appendChild(lb); tr.appendChild(b);
        const sw = new Swap(0); sws.push(sw); nodes.push({ b, dot, lb });
        b.onclick = () => go(i); });
      const r = nodes[cur].b; e.jump(r.offsetLeft, r.offsetLeft + r.offsetWidth);
      fill.jump(names.length < 2 ? 1 : cur / (names.length - 1)); paint(); };
    const go = i => { if (i === cur){ paint(); return; } cur = i; const r = nodes[i].b; e.go(r.offsetLeft, r.offsetLeft + r.offsetWidth);
      fill.set(names.length < 2 ? 1 : i / (names.length - 1), S.base);
      sws.forEach((s, k) => s.to(k < i ? 1 : 0)); paint();
      r.scrollIntoView({ block:'nearest', inline:'nearest', behavior: REDUCE ? 'auto' : 'smooth' }); };
    const paint = () => { nodes.forEach((n, k) => { n.b.style.color = k === cur ? 'var(--ink)' : 'var(--muted)';
        n.b.style.fontWeight = k === cur ? 600 : 500; n.lb.style.opacity = k > cur ? .55 : 1; });
      cap.textContent = `Step ${cur + 1} of ${names.length} · ${names[cur]}`; };
    $(st,'.sx').onchange = ev => { const keep = names[cur]; names = ev.target.checked ? names6 : names4;
      cur = Math.max(0, names.indexOf(keep)); if (cur < 0) cur = 0; build();
      sws.forEach((s, k) => { s.cur = k < cur ? 1 : 0; s.t = -9; }); paint(); };
    build(); cur = 0; sws.forEach(s => { s.cur = 0; s.t = -9; }); go(0); e.jump(nodes[0].b.offsetLeft, nodes[0].b.offsetLeft + nodes[0].b.offsetWidth);
    let vwL = 0; vw.addEventListener('scroll', () => { vwL = vw.scrollLeft; }, { passive:true });
    return t => { const f = clamp(fill.at(t)), n = names.length;
      plate.style.left = px(e.A.at(t)); plate.style.width = px(Math.max(0, e.B.at(t) - e.A.at(t)));
      segs.forEach((s, k) => s.style.width = (clamp(f * (n - 1) - k, 0, 1) * 100).toFixed(1) + '%');
      nodes.forEach((nd, k) => { const ink = clamp(f * (n - 1) - k + 1, 0, 1);
        nd.dot.style.background = mix(ink, 'var(--accent)', 'transparent');
        nd.dot.style.borderRadius = '50%'; nd.dot.style.color = ink > .5 ? 'var(--card)' : 'var(--muted)';
        const kids = nd.dot.querySelectorAll('.layer'); sws[k].apply(kids[0], 0, t, 0); sws[k].apply(kids[1], 1, t, 0); });
      const ml = vwL, mr = size(vw).sw - size(vw).cw - ml;
      $(st,'.fdl').style.opacity = clamp(ml / 16).toFixed(2); $(st,'.fdr').style.opacity = clamp(mr / 16).toFixed(2); };
  }});

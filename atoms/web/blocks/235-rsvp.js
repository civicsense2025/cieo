atom({ id:'rsvp', cat:'Forms', name:'Call RSVP', block:'rsvp (going, maybe, event response)', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Team offsite — are you in?</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">Sat, Jun 14 · Golden Gate Park.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="opts" style="position:relative;display:flex;gap:6px"><i class="pl" style="position:absolute;top:0;bottom:0;border-radius:10px;background:var(--accent-tint);opacity:0"></i></div><div class="cnt row num" style="gap:4px;align-items:baseline;font-size:13px"><span class="hc" style="font-variant-numeric:tabular-nums"></span><span class="small muted" style="font-size:12px">going</span><span class="small muted brk" style="font-size:12px;margin-left:auto"></span></div><div class="fin" style="position:relative;min-height:30px"></div><div class="row" style="gap:8px;align-items:center;justify-content:space-between;border-top:1px solid var(--line-soft);padding-top:8px"><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="sc" checked> show counts</label><button class="btn ch" style="min-height:32px;border-radius:8px">Change</button></div></div></div><div class="hint">Pick a response to join the list</div>`,
  desc:'The plate slides behind your pick with its trailing edge 60ms late, and the headcount rolls its digits. Your answer swaps in a terminal you can change.',
  api:'plate.go(x, w) trails .06   head.set(n)   pick: fin.to(i+1)',
  init(st){
    const O = ['Going',"Maybe","Can't"];
    const opts = $(st,'.opts'), pl = $(st,'.pl'), hc = $(st,'.hc'), brk = $(st,'.brk'), sc = $(st,'.sc');
    const edge = edges(0, 80); edge.jump(-99, 80);
    const vis = new Track(0), cok = new Track(1);
    const hd = new Digits(hc, 2); hd.set(' 9', true);
    const btns = O.map((n,i) => { const b = document.createElement('button'); b.className = 'btn';
      b.style.cssText = 'position:relative;z-index:1;flex:1;min-height:36px;border-radius:8px;background:transparent;border-color:transparent;font-size:13.5px';
      b.textContent = n; b.setAttribute('aria-pressed', 'false'); b.onclick = () => pick(i); opts.appendChild(b); return b; });
    const F = ['', 'You are on the list', 'Maybe — we will hold a spot', 'No worries — next time'].map((s,k) => { const e = document.createElement('span');
      e.className = 'layer'; e.style.cssText = 'font-size:13px;line-height:30px;white-space:nowrap' + (k && k < 3 ? ';color:var(--success);font-weight:600' : k ? ';color:var(--muted)' : '');
      e.textContent = k ? (k < 3 ? '✓ ' : '∅ ') + s : s; $(st,'.fin').appendChild(e); return e; });
    const fsw = new Swap(0);
    const counts = [9, 3, 1];
    let mine = -1;
    const paint = () => { hd.set(String(counts[0]).padStart(2,' '));
      brk.textContent = `${counts[0]} · ${counts[1]} · ${counts[2]}`; };
    paint();
    const pick = i => { const t0 = now();
      if (mine === i) return;
      if (mine >= 0) counts[mine]--; counts[i]++; mine = i; paint();
      const b = btns[i]; edge.go(b.offsetLeft, b.offsetWidth, t0); vis.set(1, S.base, t0);
      fsw.to(i + 1, t0);
      btns.forEach((x,j) => { x.setAttribute('aria-pressed', j === i); x.style.fontWeight = j === i ? '600' : ''; }); };
    $(st,'.ch').onclick = () => { mine = -1; counts[1] += 0; fsw.to(0); paint();
      btns.forEach(x => { x.setAttribute('aria-pressed', 'false'); x.style.fontWeight = ''; }); };
    sc.onchange = () => cok.set(sc.checked ? 1 : 0, S.base);
    return t => { Object.assign(pl.style, { left:px(Math.max(0, edge.A.at(t))), width:px(Math.max(0, edge.B.at(t))), opacity:clamp(vis.at(t)).toFixed(3) });
      F.forEach((e,k) => fsw.apply(e,k,t)); hd.render(t);
      const c = clamp(cok.at(t)), row = $(st,'.cnt');
      row.style.opacity = c.toFixed(3); row.style.visibility = c < .02 ? 'hidden' : 'visible'; };
  }});

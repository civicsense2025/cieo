atom({ id:'heatmap', cat:'Scheduling', name:'Availability heatmap', block:'availability, heatmap', fam:['M','S'], tall:true,
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">When is everyone free?</b><div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px"><div class="hm" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px"></div><div class="row small muted" style="gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:10px"><button class="t0" style="min-height:32px;border:0;border-radius:8px;background:var(--raised);color:var(--ink);padding:0 12px;cursor:pointer;font-size:12px">Team</button><button class="t1" style="min-height:32px;border:0;border-radius:8px;background:var(--raised);color:var(--ink);padding:0 12px;cursor:pointer;font-size:12px">Mine</button><span style="font-size:12px;margin-left:auto">less</span><i class="lg" style="display:flex;gap:2px"></i><span style="font-size:12px">more</span></div></div></div><div class="hint">Hover a cell for the free count · click to book</div>`,
  desc:'Cells rest in soft green-amber tints by free count. Hovering swaps the dot for the count; clicking inks a booking ring that holds. Switching team and mine re-tints every cell.',
  api:'cell.v.set(n/3) soft tint   hover: sw.to(1) count   click: sel.set(1) hold',
  init(st){
    const days = ['M','T','W','T','F'], box = $(st,'.hm');
    const team = [3,1,2,0,2, 1,3,3,1,0, 2,2,1,3,1, 0,1,2,2,3];
    const mine = [1,0,1,2,0, 2,1,0,1,2, 0,2,2,0,1, 1,0,1,1,2];
    const head = days.map(d => { const s = document.createElement('span');
      s.textContent = d; s.style.cssText = 'font-size:12px;color:var(--ink);opacity:.55;text-align:center'; return s; });
    head.forEach(h => box.appendChild(h));
    let set = team;
    const tint = v => 'color-mix(in oklab, ' + mix(clamp(v),'#b45309','#15803d') + ' 30%, var(--card))';
    const cells = set.map((n,i) => {
      const b = document.createElement('button');
      b.style.cssText = 'position:relative;height:32px;border-radius:8px;border:1.5px solid var(--muted);cursor:pointer;padding:0;display:grid;place-items:center;overflow:hidden';
      b.setAttribute('aria-label', n + ' free');
      const dot = document.createElement('i');
      dot.style.cssText = 'position:absolute;width:6px;height:6px;border-radius:50%;background:var(--ink);opacity:.4';
      const ct = document.createElement('span');
      ct.className = 'layer'; ct.textContent = n;
      ct.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;font-size:12px;font-variant-numeric:tabular-nums';
      b.appendChild(dot); b.appendChild(ct);
      const c = { b, dot, ct, sw:new Swap(0), v:new Track(n/3), sT:new Track(0) };
      const show = on => c.sw.to(on ? 1 : 0);
      b.addEventListener('mouseenter', () => show(true)); b.addEventListener('mouseleave', () => show(false));
      b.addEventListener('focus', () => show(true)); b.addEventListener('blur', () => show(false));
      b.onclick = () => cells.forEach((x,j) => x.sT.set(j === i ? 1 : 0));
      box.appendChild(b); return c;
    });
    cells.forEach(c => c.v.jump(c.v.target));
    const lg = $(st,'.lg');
    [0,.33,.66,1].forEach(v => { const s = document.createElement('i');
      s.style.cssText = 'width:14px;height:10px;border-radius:3px;background:' + tint(v); lg.appendChild(s); });
    const t0 = $(st,'.t0'), t1 = $(st,'.t1');
    // selected = ink fill, check icon and semibold label; unselected = plain raised fill
    const pick = (b, on) => { b.dataset.l ??= b.textContent; b.style.display = 'inline-flex'; b.style.alignItems = 'center'; b.style.gap = '5px';
      b.style.background = on ? 'var(--ink)' : 'var(--raised)'; b.style.color = on ? 'var(--card)' : 'var(--ink)'; b.style.fontWeight = on ? '600' : '400';
      b.innerHTML = (on ? ic(I.check, 12, 2.6) : '') + b.dataset.l; };
    const go = mineOn => { set = mineOn ? mine : team;
      cells.forEach((c,i) => { c.v.set(set[i]/3, S.soft); c.ct.textContent = set[i]; c.b.setAttribute('aria-label', set[i] + ' free'); });
      pick(t0, !mineOn); pick(t1, mineOn); };
    t0.onclick = () => go(false); t1.onclick = () => go(true); pick(t0, true); pick(t1, false);
    return t => cells.forEach(c => { const v = clamp(c.v.at(t)), s = clamp(c.sT.at(t));
      c.b.style.background = tint(v); c.b.style.borderColor = mix(s,'var(--ink)','var(--line)');
      c.sw.apply(c.ct, 1, t); fade(c.dot, c.sw.cur === 1 ? 0 : 1, 0, false); });
  }});

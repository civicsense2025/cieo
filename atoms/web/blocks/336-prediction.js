
atom({ id:'prediction', cat:'Forms', name:'Prediction question', block:'poll, vote', fam:['M','S'],
  html:`<div class="card col" style="width:min(380px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Will the launch ship Friday?</b><div class="cp small muted" style="position:relative;font-size:12px;line-height:1.5;min-height:18px"></div><div class="opts col" style="gap:8px"></div><div class="odds row num" style="gap:8px;align-items:center;font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums"><span class="bar" style="position:relative;flex:1;height:8px;border-radius:4px;background:var(--line);overflow:hidden"><i class="fA" style="position:absolute;left:0;top:0;bottom:0;width:50%;background:var(--accent)"></i></span><span class="ot muted">68 / 32</span></div><div class="row" style="gap:8px;align-items:center"><button class="btn un" style="min-height:32px;display:none">Unlock</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="so" checked> show odds</label></div></div><div class="hint">Pick a side · it locks with a press-and-fill</div>`,
  desc:'A pick presses in, then fills while the odds bar stretches leading-edge-first and the caption swaps to locked. The lock holds as the terminal state.',
  api:'press.set(1) → fill.set(1)   odds.go(ship, slip) leading-first   end: locked, hold',
  init(st){
    const opts = $(st,'.opts'), cp = $(st,'.cp'), ot = $(st,'.ot'), odds = $(st,'.odds'), un = $(st,'.un'), so = $(st,'.so'), fA = $(st,'.fA');
    const csw = new Swap(0);
    [['Tap a side to lock your call'],['Locked · Ship it 68% · settled']].forEach(([s]) => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; cp.appendChild(e); });
    const E = edges(50, 50), press = new Track(0), fill = new Track(0), on = new Track(0);
    const B = ['Ship it','Slip'].map((n,i) => { const b = document.createElement('button');
      b.style.cssText = 'position:relative;overflow:hidden;min-height:40px;border:0;background:var(--raised);border-radius:10px;cursor:pointer;font-size:14px;font-weight:500;line-height:1.5';
      b.innerHTML = `<i style="position:absolute;left:0;top:0;bottom:2px;width:0;background:var(--accent)"></i><span style="position:relative">${n}</span>`;
      opts.appendChild(b); return { b, f:$(b,'i') }; });
    let locked = -1;
    B.forEach((x,i) => x.b.onclick = () => { if (locked >= 0) return; locked = i; const t = now(), ship = i === 0 ? 68 : 32;
      if (REDUCE){ press.jump(0); fill.jump(1); E.jump(ship, 100 - ship); on.jump(1); }
      else { press.set(1, S.snap, t); press.set(0, S.base, t + .09); fill.set(1, S.base, t + .09); E.go(ship, 100 - ship, t + .09); on.set(1, S.base, t); }
      csw.to(1); un.style.display = ''; B.forEach(y => { y.b.style.cursor = 'default'; }); });
    un.onclick = () => { locked = -1; csw.to(0); un.style.display = 'none';
      fill.set(0, S.snap); on.set(0, S.snap); E.jump(50, 50); B.forEach(y => y.b.style.cursor = 'pointer'); };
    so.onchange = () => odds.style.display = so.checked ? '' : 'none';
    return t => { B.forEach((x,i) => { const p = press.at(t), f = clamp(fill.at(t)) * (locked === i ? 1 : 0);
        x.f.style.width = (f*100).toFixed(1) + '%'; x.f.style.opacity = (.25 + .2*f).toFixed(3);
        x.b.style.transform = locked === i ? `scale(${(1 - .04*p).toFixed(3)})` : 'none';
        x.b.style.boxShadow = `inset 0 ${(-2*(locked === i ? clamp(on.at(t)) : 0)).toFixed(2)}px 0 var(--ink)`; });
      const a = E.A.at(t); fA.style.width = clamp(a/100)*100 + '%';
      ot.textContent = locked < 0 ? '68 / 32' : `${Math.round(a)} / ${100 - Math.round(a)}`;
      [...cp.children].forEach((e,j) => csw.apply(e,j,t)); };
  }});

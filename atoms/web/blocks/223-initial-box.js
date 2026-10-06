atom({ id:'initialbox', cat:'Documents', name:'Initial box', block:'sign, initials, stamp', fam:['M','S'],
  html:`<div class="col" style="width:min(320px,90%);gap:8px;align-items:center"><div class="card col" style="width:100%;padding:14px 16px;gap:10px;align-items:center"><b style="font-size:15px">Initial here</b><div class="pad" style="position:relative;width:120px;height:76px;border:1.5px dashed var(--line);border-radius:10px;display:grid;place-items:center;overflow:hidden"><span class="ghost small muted" style="font-size:12px">MK</span></div><div class="row" style="gap:8px"><input class="in" maxlength="3" value="MK" aria-label="Your initials" style="width:76px;min-height:32px;border-radius:8px;border:1px solid var(--line);text-align:center;font-size:14px"><button class="btn go" style="min-height:32px;border-radius:8px">Adopt & stamp</button></div><div class="msg small" style="position:relative;height:22px;font-size:12.5px"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="ink" checked> blue ink stamp</label></div><div class="hint">Adopt — the stamp snaps in at 97%</div>`,
  desc:'Adopt-and-stamp swaps the ghost for your initials and snaps the stamp from ninety-seven percent on a fast snap spring. The success message holds as the terminal; clearing reverses it.',
  api:'stamp.to(1) Swap   sc.release(.97,0,1,snap)   msg.to(1) success, hold',
  init(st){
    const pad = $(st,'.pad'), inp = $(st,'.in'), msg = $(st,'.msg'), ink = $(st,'.ink');
    const ghost = $(st,'.ghost');
    const stamp = document.createElement('b'); stamp.className = 'layer'; stamp.style.cssText = 'font-size:26px;font-style:italic'; pad.appendChild(stamp);
    const sw = new Swap(0), msgSw = new Swap(0), sc = new Track(1);
    const M = ['', 'Initialed — page 4 of 4 ✓'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.textContent = s; msg.appendChild(el); return el; });
    let on = false;
    const paint = () => { stamp.textContent = (inp.value || 'MK').toUpperCase(); stamp.style.color = ink.checked ? 'var(--accent)' : 'var(--ink)'; };
    ink.oninput = paint;
    $(st,'.go').onclick = () => { on = !on; paint(); sw.to(on ? 1 : 0); msgSw.to(on ? 1 : 0);
      if (on){ sc.release(0.97, 0, 1, S.snap); } };
    paint();
    return t => { [ghost, stamp].forEach((el,k) => sw.apply(el,k,t));
      const s = clamp(sc.at(t)); stamp.style.transform = `scale(${s.toFixed(4)}) rotate(-4deg)`;
      stamp.style.opacity = String(clamp(sc.at(t) * 1).toFixed(3));
      M.forEach((el,k) => msgSw.apply(el,k,t)); M[1].style.color = 'var(--success)'; };
  }});

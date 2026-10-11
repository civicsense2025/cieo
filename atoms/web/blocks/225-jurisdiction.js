atom({ id:'jurisdiction', cat:'Forms', name:'Jurisdiction pick', block:'form, dropdown, select', fam:['M'],
  html:`<div class="col" style="width:min(320px,90%);gap:8px"><div class="card col" style="padding:14px 16px;gap:0"><b style="font-size:15px;padding-bottom:8px">Governing jurisdiction</b><button class="trig btn row" aria-haspopup="listbox" style="min-height:36px;border-radius:8px;justify-content:space-between"><span class="val" style="font-size:14px">Nevada</span><span class="chev" style="font-size:12px">▾</span></button><div class="list" role="listbox" aria-label="Governing jurisdiction" style="overflow:hidden"></div><div class="msg small" style="position:relative;height:22px;font-size:12.5px;padding-top:4px"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="us" checked> US states only</label></div><div class="hint">Open it — arrow keys trail behind</div>`,
  desc:'The list grows down from the trigger on a base spring while the arrow-key highlight trails sixty milliseconds behind the key. The pick swaps into the trigger and holds a filed success terminal.',
  api:'open.h.set(full, base) from trigger   hi.go(i) trails .06   pick: val.to(i), msg.to(1)',
  init(st){
    const trig = $(st,'.trig'), val = $(st,'.val'), chev = $(st,'.chev'), list = $(st,'.list'), msg = $(st,'.msg');
    const O = ['Nevada', 'California', 'New York', 'Texas', 'Delaware'];
    const h = new Track(0), e = edges(0, 0), sw = new Swap(0);
    const M = ['', 'Filed under Nevada ✓'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.textContent = s; msg.appendChild(el); return el; });
    let open = false, cur = 0, hi = 0, full = 0;
    const B = O.map((o,i) => { const b = document.createElement('button'); b.setAttribute('role', 'option'); b.textContent = o;
      b.style.cssText = 'display:block;width:100%;text-align:left;border:0;background:none;cursor:pointer;min-height:32px;border-radius:8px;font-size:14px;padding:0 10px'; b.onclick = () => pick(i); list.appendChild(b); return b; });
    const measure = () => { list.style.height = 'auto'; full = list.scrollHeight; list.style.height = px(h.at(now())); };
    const paint = () => B.forEach((b,i) => b.style.background = i === hi ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'none');
    const flip = o => { open = o; measure(); h.set(o ? full : 0, S.base); chev.style.transform = `rotate(${(o ? 180 : 0)}deg)`; };
    function pick(i){ cur = i; val.textContent = O[i]; M[1].textContent = `Filed under ${O[i]} ✓`; sw.to(1); flip(false); }
    trig.onclick = () => flip(!open);
    trig.onkeydown = ev => { if (!open && (ev.key === 'ArrowDown' || ev.key === 'Enter')){ ev.preventDefault(); flip(true); return; }
      if (ev.key === 'ArrowDown'){ ev.preventDefault(); hi = Math.min(O.length - 1, hi + 1); e.go(hi, hi); paint(); }
      if (ev.key === 'ArrowUp'){ ev.preventDefault(); hi = Math.max(0, hi - 1); e.go(hi, hi); paint(); }
      if (ev.key === 'Enter'){ ev.preventDefault(); pick(hi); } if (ev.key === 'Escape') flip(false); };
    B.forEach((b,i) => b.onmouseenter = () => { hi = i; e.go(i, i); paint(); });
    measure(); e.jump(0, 0); paint();
    return t => { list.style.height = px(Math.max(0, h.at(t)));
      B.forEach((b,i) => { const g = i === Math.round(e.B.at(t)) ? 'color-mix(in oklab, var(--accent) 16%, transparent)' : (i === hi ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'none'); if (document.activeElement === trig) b.style.background = g; });
      M.forEach((el,k) => sw.apply(el,k,t)); M[1].style.color = 'var(--success)'; };
  }});

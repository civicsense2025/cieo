atom({ id:'qtystep', cat:'Commerce', name:'Quantity stepper', block:'cart, stepper, line-items', fam:['M','S'],
  html:`<div class="card col" style="width:min(300px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Your cart</b><div class="rows col" style="gap:8px"></div><div class="col small" style="gap:4px;border-top:1px solid var(--line);padding-top:12px"><div class="row" style="justify-content:space-between"><span class="muted">Subtotal</span><span class="st num" style="font-variant-numeric:tabular-nums"></span></div><div class="row" style="justify-content:space-between;font-size:15px;font-weight:600"><span>Total</span><span class="tt num" style="font-variant-numeric:tabular-nums"></span></div></div><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="cm" checked> Compact rows</label></div><div class="hint">Step a quantity to zero</div>`,
  desc:'Digits roll on the base spring in the step direction. At zero the row collapses its height, then leaves an undo terminal. Every money value springs to the new total together.',
  api:'q.set(n); h.set(0) then remove → undo   sub.set(sum); tot.set(sum)',
  init(st){
    const box = $(st,'.rows'), sub = new Track(0), tot = new Track(0);
    const I = [['Scout backpack',68],['Trail socks',14]];
    const R = I.map(([n,p]) => { const r = document.createElement('div'); r.style.cssText = 'overflow:hidden';
      r.innerHTML = `<div class="row" style="gap:8px;align-items:center"><span style="width:56px;height:42px;border-radius:12px;background:var(--raised);flex:none"></span><span class="col" style="gap:2px"><b style="font-size:13px;font-weight:600;line-height:1.5">${n}</b><span class="small muted" style="font-size:12.5px">$${p} each</span></span><span class="row" style="gap:6px;margin-left:auto;align-items:center"><button class="m" aria-label="Decrease" style="height:36px;min-width:36px;border-radius:9px;border:1px solid var(--line);background:var(--card);cursor:pointer">−</button><span class="q num" style="min-width:20px;text-align:center;font-size:14px;font-variant-numeric:tabular-nums"></span><button class="pl" aria-label="Increase" style="height:36px;min-width:36px;border-radius:9px;border:1px solid var(--line);background:var(--card);cursor:pointer">+</button></span></div><div class="un small" style="display:none;padding:8px 0"><button class="ub" style="border:0;background:none;color:var(--accent);cursor:pointer;font-size:13px">Removed · Undo</button></div>`;
      box.appendChild(r);
      const it = { p, q:1, r, h:new Track(1), d:new Digits($(r,'.q'), 2), gone:false };
      it.d.set('1', true); it.h.jump(1); r.style.maxHeight = '120px';
      $(r,'.m').onclick = () => step(it, -1); $(r,'.pl').onclick = () => step(it, 1);
      $(r,'.ub').onclick = () => { it.gone = false; it.q = 1; it.d.set('1'); it.h.set(1); $(r,'.un').style.display = 'none'; sum(); };
      return it; });
    const sum = () => { const s = R.reduce((a,r) => a + (r.gone ? 0 : r.p*r.q), 0); sub.set(s); tot.set(s); };
    function step(it, d){ if (it.gone) return; const q = clamp(it.q + d, 0, 99); if (q === it.q) return;
      it.q = q; it.d.set(String(q));
      if (q === 0){ it.gone = true; it.h.set(0); setTimeout(() => { if (it.gone) $(it.r,'.un').style.display = 'block'; }, 320); }
      sum(); }
    sum(true); sub.jump(R.reduce((a,r) => a + r.p, 0)); tot.jump(sub.target);
    $(st,'.cm').onchange = e => box.style.gap = e.target.checked ? '8px' : '16px';
    return t => { R.forEach(r => { r.d.render(t); const h = clamp(r.h.at(t)); r.r.style.opacity = r.gone ? h.toFixed(3) : '1';
        r.r.style.maxHeight = (h*120).toFixed(0) + 'px'; });
      $(st,'.st').textContent = money(sub.at(t)); $(st,'.tt').textContent = money(tot.at(t)); };
  }});

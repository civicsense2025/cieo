atom({ id:'expresspay', cat:'Commerce', name:'Express pay sheet', block:'checkout, sheet, wallets', fam:['M','S'], tall:true,
  html:`<div class="card ph" style="position:relative;width:min(300px,92%);height:360px;overflow:hidden;padding:14px"><div class="col" style="gap:8px"><b style="font-size:15px;font-weight:600">Checkout</b><span class="num" style="font-size:15px;font-weight:600;font-variant-numeric:tabular-nums">$82.00</span><div class="xp col" style="gap:8px"></div><button class="mo" style="height:38px;border-radius:9px;background:var(--raised);cursor:pointer;font-size:14px">More options</button></div><div class="sh" style="position:absolute;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);border-radius:12px 12px 0 0;box-shadow:var(--shadow);padding:14px"><b style="font-size:13px;font-weight:600;line-height:1.5">Order · 2 items</b><div class="ln col small" style="gap:4px;margin:8px 0;font-size:13px;line-height:1.5"></div><label class="row small muted" style="gap:6px;font-size:12.5px;margin-bottom:10px"><input type="checkbox" class="cp" checked> Apply SHIP10 in sheet</label><button class="cf" style="position:relative;height:38px;width:100%;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;overflow:hidden"><span class="tx">Confirm $82.00</span></button></div></div><div class="hint">Wait for wallets, open options</div>`,
  desc:'Wallet buttons fade up staggered once ready. The sheet rises on the base spring carrying line-items, options and coupon inside. Confirm fills toward success and holds its receipt terminal.',
  api:'ready: btn[i]=prog(t,t0+i*.06)   sheet.set(1); ok.set(1) → receipt hold',
  init(st){
    const xp = $(st,'.xp'), sh = $(st,'.sh'), cf = $(st,'.cf');
    const sheet = new Track(0), ok = new Track(0), t0 = now() + .4;
    const WB = ['Pay','G Pay'].map(n => { const b = document.createElement('button'); b.textContent = n;
      b.style.cssText = 'height:38px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;opacity:0'; xp.appendChild(b); return b; });
    const L = [['Scout backpack','$68.00'],['Trail socks','$14.00'],['Coupon SHIP10','−$10.00']].map(([a,b]) => { const r = document.createElement('div'); r.className = 'row'; r.style.justifyContent = 'space-between';
      r.innerHTML = `<span class="muted">${a}</span><span class="num" style="font-variant-numeric:tabular-nums">${b}</span>`; $(st,'.ln').appendChild(r); return r; });
    sheet.jump(1); sheet.set(0, S.base, now() + .01);
    $(st,'.mo').onclick = () => sheet.set(1);
    const pay = () => { if (ok.target < .5){ ok.set(1); $(st,'.tx').textContent = 'Paid · Receipt sent'; } };
    // A wallet press opens the order sheet; a press with the sheet already open confirms, so every press responds.
    cf.onclick = pay; WB.forEach(b => b.onclick = () => { if (sheet.target === 1) pay(); else sheet.set(1); });
    sh.onclick = e => { if (e.target === sh) sheet.set(0); };
    return t => { WB.forEach((b,i) => { const q = clamp(prog(t, t0 + i*.06)); b.style.opacity = q.toFixed(3); b.style.transform = `translateY(${((1-q)*10).toFixed(1)}px)`; });
      const p = clamp(sheet.at(t)); sh.style.transform = `translateY(${((1-p)*220).toFixed(1)}px)`;
      L.forEach((r,i) => { const q = clamp(prog(t, now() - 9 + 0)); r.style.opacity = p.toFixed(3); });
      const g = clamp(ok.at(t)); cf.style.background = mix(g,'var(--success)','var(--ink)'); };
  }});

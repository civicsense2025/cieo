atom({ id:'stockcount', cat:'Storefront', name:'Stock countdown', block:'stock, urgency, product', fam:['T','S'],
  html:`<div class="col" style="gap:8px;width:min(300px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Trail cap <span class="pr num" style="font-size:15px;font-weight:600;font-variant-numeric:tabular-nums">$36</span></h4><div class="bar" role="progressbar" aria-label="Stock remaining" aria-valuemin="0" aria-valuemax="12" aria-valuenow="9" style="height:6px;border-radius:3px;background:var(--raised);overflow:hidden"><i class="fl" style="display:block;height:100%;border-radius:3px;background:var(--ink)"></i></div><div class="row" style="gap:8px;align-items:center"><span class="dg" style="font-size:13px;font-variant-numeric:tabular-nums"></span><span class="pill" style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;background:var(--warning-tint, var(--raised));color:var(--warning)">Low stock</span><span class="msg small" style="position:relative;height:18px;flex:1;font-size:12px;color:var(--muted);line-height:1.5"></span></div><div class="row" style="gap:8px"><button class="btn buy" style="height:36px;border-radius:9px;flex:1">Buy one</button><label class="row small muted" style="gap:6px;cursor:pointer;align-items:center"><input type="checkbox" class="au" checked> Auto-restock demo</label></div></div><div class="hint">Buy until low, then sold out</div>`,
  desc:'The bar drains lazily and only changed digits roll. At 5 left the low pill pops in and the message swaps to order soon. Zero holds as sold out.',
  api:'bar.set(n/12, lazy)   dg.set(n)   pill.set(low, snap); msg.to(low)',
  init(st){
    const N = 12, fl = $(st,'.fl'), bar = $(st,'.bar'), pill = $(st,'.pill'), msg = $(st,'.msg'), buy = $(st,'.buy'), au = $(st,'.au');
    const dg = new Digits($(st,'.dg'), 2), lv = new Track(0), barT = new Track(9 / N, S.lazy), sw = new Swap(0);
    const M = ['In stock', 'Order soon — only a few left', 'Sold out']; const L = M.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; msg.appendChild(e); return e; });
    let n = 9; dg.set(String(n), true);
    const sync = () => { barT.set(n / N, S.lazy); dg.dir = -1; dg.set(String(n)); bar.setAttribute('aria-valuenow', n);
      const low = n <= 5 && n > 0 ? 1 : 0; lv.set(low, REDUCE ? S.base : S.snap); sw.to(n <= 0 ? 2 : low ? 1 : 0);
      buy.disabled = n <= 0; buy.textContent = n <= 0 ? 'Sold out' : 'Buy one'; };
    buy.onclick = () => { if (n <= 0){ if (au.checked){ n = N; sync(); } return; } n--; sync(); if (au.checked && n <= 0) setTimeout(() => { if (document.body.contains(st)){ n = N; sync(); } }, 2200); };
    sync();
    return t => { const f = clamp(barT.at(t)); fl.style.width = (f * 100).toFixed(2) + '%'; fl.style.background = mix(clamp(lv.at(t)), 'var(--warning)', 'var(--ink)');
      dg.render(t); const p = clamp(lv.at(t)); pill.style.opacity = p.toFixed(3); pill.style.transform = `scale(${(.6 + .4 * p).toFixed(4)})`;
      L.forEach((el, k) => sw.apply(el, k, t)); };
  }});

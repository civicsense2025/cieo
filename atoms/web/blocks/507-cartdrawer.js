atom({ id:'cartdrawer', cat:'Commerce', name:'Cart drawer', block:'cart, drawer, free-shipping', fam:['M','S'], tall:true,
  html:`<div class="card ph" style="position:relative;width:min(300px,92%);height:380px;overflow:hidden;padding:16px"><div class="col" style="gap:8px"><b style="font-size:15px;font-weight:600">Scout backpack</b><span class="num" style="font-size:15px;font-weight:600;font-variant-numeric:tabular-nums">$68</span><p style="font-size:13px;line-height:1.5;margin:0">Ballistic nylon, lifetime repairs.</p><button class="vw" style="height:38px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer">View cart</button></div><div class="scr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none"></div><aside class="dw" style="position:absolute;top:0;bottom:0;right:0;width:232px;background:var(--card);box-shadow:var(--shadow);padding:14px;display:flex;flex-direction:column;gap:8px"><b style="font-size:15px;font-weight:600">Your cart</b><div class="bar" style="height:6px;border-radius:3px;background:var(--raised);overflow:hidden"><i style="display:block;height:100%;width:0;background:var(--ink);border-radius:3px"></i></div><span class="sv small" style="position:relative;display:block;min-height:18px;font-size:12.5px;color:var(--ink)"></span><div class="rows col" style="gap:8px"></div><div class="col small" style="gap:4px;border-top:1px solid var(--line);padding-top:12px;margin-top:auto"><div class="row" style="justify-content:space-between"><span class="muted">Subtotal</span><span class="st num"></span></div><div class="row" style="justify-content:space-between;font-size:15px;font-weight:600"><span>Total</span><span class="tt num" style="font-variant-numeric:tabular-nums"></span></div></div><button class="co" style="height:38px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer">Checkout</button><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="th" checked> Free over $50</label></aside></div><div class="hint">Open the drawer</div>`,
  desc:'The drawer slides in on the base spring over a fading scrim while rows trail 40ms apart. The free-shipping bar fills and the savings line swaps to its success terminal. Checkout stays pinned.',
  api:'open.set(1); row[i]=prog(t,t0+i*.04)   fill.set(sub/th); save.to(done?1:0)',
  init(st){
    const dw = $(st,'.dw'), scr = $(st,'.scr'), bar = $(st,'.bar i'), rows = $(st,'.rows');
    const open = new Track(0), fill = new Track(0), sub = new Track(0), tot = new Track(0), sv = new Swap(0);
    const I = [['Scout backpack',68],['Trail socks',14]];
    const th = () => $(st,'.th').checked ? 50 : 75;
    const R = I.map(([n,p]) => { const r = document.createElement('div'); r.className = 'row'; r.style.cssText = 'gap:8px;align-items:center';
      r.innerHTML = `<span style="width:48px;height:36px;border-radius:12px;background:var(--raised);flex:none"></span><span style="font-size:13px;line-height:1.5">${n}</span><span class="num" style="margin-left:auto;font-size:13px;font-variant-numeric:tabular-nums">$${p}</span>`;
      rows.appendChild(r); return r; });
    const L = ['Away from free shipping','Free shipping unlocked'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '12.5px'; e.textContent = s; $(st,'.sv').appendChild(e); return e; });
    let t0 = -9; const S0 = I.reduce((a,r) => a + r[1], 0);
    const paint = () => { sub.set(S0); tot.set(S0); fill.set(Math.min(1, S0/th())); sv.to(S0 >= th() ? 1 : 0); };
    $(st,'.vw').onclick = () => { t0 = now(); open.set(1); paint(); };
    scr.onclick = () => open.set(0); $(st,'.co').onclick = () => open.set(0); $(st,'.th').onchange = paint;
    sub.jump(0); tot.jump(0); paint(); sub.jump(S0); tot.jump(S0); fill.jump(Math.min(1, S0/th()));
    return t => { const p = clamp(open.at(t)); dw.style.transform = `translateX(${((1-p)*232).toFixed(1)}px)`;
      dw.style.visibility = p < .01 ? 'hidden' : 'visible'; dw.setAttribute('aria-hidden', String(p < .01));
      scr.style.opacity = (p*.35).toFixed(3); scr.style.pointerEvents = p > .5 ? 'auto' : 'none';
      R.forEach((r,i) => { const q = open.target === 1 ? clamp(prog(t, t0 + i*.04)) : 1; r.style.opacity = q.toFixed(3); r.style.transform = `translateX(${((1-q)*16).toFixed(1)}px)`; });
      bar.style.width = (clamp(fill.at(t))*100).toFixed(1) + '%'; L.forEach((e,k) => sv.apply(e,k,t));
      $(st,'.st').textContent = money(sub.at(t)); $(st,'.tt').textContent = money(tot.at(t)); };
  }});

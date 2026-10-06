atom({ id:'offlinepack', cat:'Maps', name:'Offline pack', block:'download maps', fam:['M'], wide:true,
  html:`<div class="card" style="width:min(400px,94%);padding:14px 16px;text-align:center"><div class="rg" style="position:relative;width:104px;height:104px;margin:2px auto;border-radius:50%;display:grid;place-items:center;padding:0"><b class="pc" style="font-size:15px;font-weight:600;font-variant-numeric:tabular-nums"></b><b class="dn" style="position:absolute;font-size:15px;color:var(--success)"></b></div><p style="font-size:15px;font-weight:600;line-height:1.5;margin:8px 0 2px">City pack · 184 MB</p><p class="st" style="font-size:13px;line-height:1.55;color:var(--muted);margin:0;position:relative;min-height:22px"></p><div class="tiles" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px"></div><div class="row" style="display:flex;gap:8px;margin-top:12px"><button class="btn ink dl" style="flex:1;height:36px;border-radius:9px">Download</button><button class="btn pg-tg" style="height:36px;border-radius:9px" aria-pressed="true">Wi-Fi only</button></div></div><div class="hint">Tap Download, watch it finish</div>`,
  desc:'The ring fills on base while the percent rolls with it. At 100 the label swaps to a check, the sheet drops soft and tiles fade in top-down. Done holds as the terminal.',
  api:'ring.set(100,base) + pc.digits.set(n)   100: st.to(done) + sheet.y.set(0,soft) + tile.o stagger',
  init(st){
    const rg = $(st,'.rg'), tiles = $(st,'.tiles');
    const pc = new Digits($(st,'.pc'), 4); pc.set('0%', true);
    const L = ['Getting streets…','Saved for offline'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.cssText = 'font-size:13px'; e.textContent = s; $(st,'.st').appendChild(e); return e; });
    const sw = new Swap(0), v = new Track(0), drop = new Track(14);
    const dn = $(st,'.dn'); dn.textContent = '✓'; dn.style.opacity = 0;
    const cells = Array.from({ length: 8 }, () => { const c = document.createElement('i'); c.style.cssText = 'height:34px;border-radius:7px;background:var(--raised)'; tiles.appendChild(c); return { c, o:new Track(0) }; });
    let wifi = true, busy = false;
    $(st,'.pg-tg').onclick = e => { wifi = !wifi; const b = e.currentTarget; b.textContent = wifi ? 'Wi-Fi only' : 'Any network'; b.setAttribute('aria-pressed', wifi); };
    $(st,'.dl').onclick = () => { if (busy) return; busy = true; const t0 = now();
      v.jump(0); cells.forEach(c => c.o.jump(0)); drop.jump(14); dn.style.opacity = 0; sw.to(0);
      if (REDUCE){ v.jump(100); drop.jump(0); sw.cur = 1; sw.prev = null; sw.t = -9; pc.set('100%', true); cells.forEach(c => c.o.jump(1)); dn.style.opacity = 1; busy = false; return; }
      v.set(100, S.base, t0 + .1); sw.to(1, t0 + 1.6);
      cells.forEach((c,i) => c.o.set(1, S.base, t0 + .5 + i*.08)); drop.set(0, S.soft, t0 + 1.5);
      setTimeout(() => busy = false, 2400); };
    return t => { const x = clamp(v.at(t)/100), d = drop.at(t);
      rg.style.background = `conic-gradient(var(--ink) ${x*360}deg, var(--raised) 0deg)`;
      rg.style.transform = `translateY(${d.toFixed(2)}px)`; rg.style.opacity = clamp(1-d/14).toFixed(3);
      pc.set(Math.round(x*100) + '%'); pc.render(t);
      dn.style.opacity = clamp(sw.cur === 1 ? (t - sw.t - .1)*4 : 0).toFixed(3);
      L.forEach((e,k) => sw.apply(e,k,t));
      cells.forEach(c => c.c.style.opacity = clamp(c.o.at(t)).toFixed(3)); };
  }});

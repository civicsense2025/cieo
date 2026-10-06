
atom({ id:'bundlesweep', cat:'Email', name:'Bundle sweep', block:'email, bundle, archive', fam:['S','M','T'],
  html:`<div class="col" style="gap:8px;width:min(300px,92%)"><div class="card" style="padding:14px 16px;line-height:1.5"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600">Promotions</b><b class="cnt num" style="font-size:13px"></b></div><div class="bl"></div><div class="dn2" style="position:relative;min-height:20px;margin-top:6px"></div></div><div class="row" style="gap:8px"><button class="btn ink arch" style="min-height:32px">Archive bundle</button><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" checked> include social</label></div></div><div class="hint">Archive the promo cluster</div>`,
  desc:'Done archives the promo cluster. Rows blur out in place, then the gap closes on base while the count rolls to zero and a success terminal holds.',
  api:'rows fade stagger .05, then h.set(0, base)   cnt.set(0)   end: archived, hold',
  init(st){
    const list = $(st,'.bl'), dn2 = $(st,'.dn2'), btn = $(st,'.arch');
    const items = [['ST','Sale ends Sunday','Store · 3 mails'],['AT','New drops Friday','Atelier · 2 mails'],['FL','Flights from $99','Airline · 4 mails']];
    const rows = items.map((r,i) => {
      const d = document.createElement('div');
      d.style.cssText = 'display:flex;align-items:center;gap:10px;min-height:52px;overflow:hidden' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      const av = document.createElement('span');
      av.style.cssText = 'width:34px;height:34px;flex:none;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:12px;font-weight:600;padding:0;transform:translateY(.5px)';
      av.textContent = r[0];
      const tx = document.createElement('span'); tx.style.cssText = 'display:flex;flex-direction:column;flex:1;line-height:1.5';
      const b = document.createElement('b'); b.style.cssText = 'font-size:13.5px;font-weight:600'; b.textContent = r[1];
      const s = document.createElement('span'); s.className = 'small muted'; s.style.fontSize = '12px'; s.textContent = r[2];
      tx.appendChild(b); tx.appendChild(s); d.appendChild(av); d.appendChild(tx); list.appendChild(d);
      return d;
    });
    const L = ['', 'Archived 3 promos'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; dn2.appendChild(e); return e; });
    L[1].style.color = 'var(--success)'; L[1].style.fontSize = '13px'; L[1].style.fontWeight = '600';
    const o = rows.map(() => new Track(1)), h = rows.map(() => new Track(54)), sw = new Swap(0), dg = new Digits($(st,'.cnt'), 1);
    dg.set('3', true); let done = false;
    btn.onclick = () => {
      const t = now();
      if (done){ done = false; sw.to(0, t); dg.set('3'); o.forEach(x => x.set(1, S.base, t)); h.forEach(x => x.set(54, S.base, t)); btn.textContent = 'Archive bundle'; return; }
      done = true; btn.textContent = 'Undo';
      rows.forEach((r, i) => { o[i].set(0, S.base, t + i*.05); h[i].set(0, S.base, t + .18 + i*.06); });
      dg.set('0'); sw.to(1, t + .3);
    };
    return t => { rows.forEach((d, i) => { const p = clamp(o[i].at(t)), hh = Math.max(0, h[i].at(t));
        d.style.opacity = p.toFixed(3); d.style.filter = p < .98 ? `blur(${((1-p)*BLUR).toFixed(2)}px)` : 'none';
        d.style.height = px(hh); d.style.minHeight = '0px'; d.style.visibility = (p < .02 && hh < 2) ? 'hidden' : 'visible'; });
      L.forEach((e, k) => sw.apply(e, k, t)); dg.render(t); };
  }});

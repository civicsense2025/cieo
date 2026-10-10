atom({ id:'locsearch', cat:'Maps', name:'Location search', block:'search places', fam:['M'], wide:true,
  html:`<div class="card" style="width:min(440px,94%);padding:14px 16px"><p style="font-size:15px;font-weight:600;line-height:1.5;margin:0">Find a place</p><div style="display:flex;gap:8px;margin-top:8px"><input class="q" placeholder="Try “ferry” or “zzz”" aria-label="Search places" style="flex:1;min-width:0;height:36px;border:1.5px solid var(--muted);border-radius:9px;padding:0 12px;font-size:14px;background:var(--card);color:var(--ink)"><button class="btn ink go" style="height:36px;border-radius:9px">Search</button></div><div class="list" style="position:relative;margin-top:6px"></div><p class="empty" style="font-size:13px;line-height:1.55;color:var(--muted);margin:8px 0 0;text-align:center"><b class="em" style="position:relative;display:inline-block;min-width:120px"></b> · <span class="cnt" style="font-variant-numeric:tabular-nums"></span> nearby</p></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;width:min(440px,94%);padding:6px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Pins drop in reading order</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="true">Recent first</button></div><div class="hint">Type, then Search</div>`,
  desc:'Matches stagger in on snap and their pins drop in reading order. A miss swaps to the no-match line and the count rolls to zero. The last result holds as the terminal.',
  api:'row[i].set(1,snap,t+i*.05)   pin.y.set(0,base,t+i*.05)   miss.to(1) + cnt.digits.set(0)',
  init(st){
    const list = $(st,'.list'), q = $(st,'.q'), empty = $(st,'.empty');
    const ALL = ['Ferry Building','Ferry Plaza','Lands End','Dolores Park'];
    const rows = ALL.map(n => { const r = document.createElement('div'); r.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 4px;font-size:14px;line-height:1.5'; r.innerHTML = `<i class="pn" style="flex:none;width:26px;height:26px;border-radius:50%;background:var(--ink);color:var(--card);display:grid;place-items:center;padding:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="transform:translateY(-1px)"><path d="M12 22s7-7.5 7-12a7 7 0 0 0-14 0c0 4.5 7 12 7 12z"/></svg></i><span></span>`;
      r.lastChild.textContent = n; list.appendChild(r); return { r, pin:r.firstChild, o:new Track(1), y:new Track(0) }; });
    rows.forEach((x,i) => { if (i) x.r.style.borderTop = '1px solid var(--line-soft)'; });
    const L = ['0 places match “zzz”','Places near you'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.cssText = 'font-size:13px'; e.textContent = s; $(empty,'.em').appendChild(e); return e; });
    const sw = new Swap(1), cnt = new Digits($(st,'.cnt'), 1); cnt.set('4', true);
    let recent = true;
    $(st,'.pg-tg').onclick = e => { recent = !recent; const b = e.currentTarget; b.textContent = recent ? 'Recent first' : 'A–Z order'; b.setAttribute('aria-pressed', recent); run(false); };
    function run(instant){ const t0 = now(), term = q.value.trim().toLowerCase();
      const hit = ALL.map(n => !term || n.toLowerCase().includes(term)).map((h,i) => recent ? h : h);
      const order = [...hit.keys()].sort((a,b) => recent ? b-a : a-b);
      const miss = term === 'zzz' || !hit.some(Boolean);
      if (instant || REDUCE){ rows.forEach((x,i) => { x.o.jump(hit[i] ? 1 : 0); x.y.jump(0); }); sw.cur = miss ? 0 : 1; sw.prev = null; sw.t = -9; cnt.set(miss ? '0' : String(hit.filter(Boolean).length), true); }
      else { rows.forEach((x,i) => { const d = order.indexOf(i)*.05; x.o.set(hit[i] ? 1 : 0, S.snap, t0 + d); x.y.jump(-26); x.y.set(0, S.base, t0 + d); }); sw.to(miss ? 0 : 1); cnt.set(miss ? '0' : String(hit.filter(Boolean).length)); }
      list.style.display = miss ? 'none' : ''; }
    $(st,'.go').onclick = () => run(false); q.onkeydown = e => { if (e.key === 'Enter') run(false); };
    run(true);
    return t => { rows.forEach(x => { const o = clamp(x.o.at(t)); x.r.style.opacity = o.toFixed(3); x.r.style.display = o < .02 ? 'none' : ''; x.pin.style.transform = `translateY(${x.y.at(t).toFixed(2)}px)`; });
      L.forEach((e,k) => sw.apply(e,k,t)); cnt.render(t); };
  }});

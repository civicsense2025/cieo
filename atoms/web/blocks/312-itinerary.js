atom({ id:'itinerary', cat:'Maps', name:'Itinerary timeline', block:'trip plan, stops', fam:['M'], wide:true,
  html:`<div class="card" style="width:min(480px,94%);padding:14px 16px"><div class="row" style="display:flex;align-items:baseline;gap:10px"><p style="font-size:15px;font-weight:600;line-height:1.5;margin:0">Day one</p><span class="clk" style="font-size:14px;font-weight:600;font-variant-numeric:tabular-nums"></span><span style="flex:1"></span><span class="mi" style="font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums"></span></div><div class="bar" style="position:relative;height:6px;border-radius:3px;background:var(--raised);margin:10px 0 4px;overflow:hidden"><i class="ink" style="position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--ink)"></i><i class="mk" style="position:absolute;top:50%;width:14px;height:14px;margin:-7px;border-radius:50%;background:var(--card);border:3px solid var(--ink)"></i></div><input class="sc" type="range" min="0" max="100" value="30" aria-label="Scrub the day" style="width:100%;accent-color:var(--ink)"><div class="stops" style="position:relative;margin-top:6px"></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;padding:10px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">One value drives ink, clock and miles</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="false">Walking</button></div></div><div class="hint">Drag the slider</div>`,
  desc:'One scrub value inks the route, rolls the clock and the miles together. Stop photos swap in lazy as the marker passes them. Releasing at the end holds Done.',
  api:'scrub v: ink.w=v   clk.digits.set(hh:mm)   mi.digits.set(m)   photo.to(stop) lazy',
  init(st){
    const stops = ['Ferry Building','Coit Tower','North Beach'];
    const box = $(st,'.stops');
    const rows = stops.map((n,i) => { const r = document.createElement('div'); r.style.cssText = 'display:flex;gap:10px;align-items:center;padding:9px 2px;font-size:13.5px;line-height:1.5' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      r.innerHTML = `<span class="th" style="position:relative;flex:none;width:44px;height:32px;border-radius:7px;overflow:hidden;background:var(--raised)"></span><span style="flex:1">${n}</span><span class="tm" style="font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums">${9+i*2}:00</span>`;
      box.appendChild(r); return r; });
    const ths = rows.map(r => $(r,'.th'));
    const cols = [['#c9d8e8','#7d9cbd'],['#dcc9c0','#8a6f63'],['#cfe0c8','#6f8f66']];
    const layers = ths.map((th,i) => { const outs = cols[i].map(c => 0); return cols[i].map((c,j) => { const e = document.createElement('i'); e.className = 'layer'; e.style.background = c; th.appendChild(e); return e; }); });
    const sws = ths.map(() => new Swap(0));
    const clk = new Digits($(st,'.clk'), 5), mi = new Digits($(st,'.mi'), 4);
    const v = new Track(30); let walk = false;
    $(st,'.sc').oninput = e => { const x = +e.target.value; REDUCE ? v.jump(x) : v.set(x, S.base); };
    $(st,'.pg-tg').onclick = e => { walk = !walk; const b = e.currentTarget; b.textContent = walk ? 'Driving' : 'Walking'; b.setAttribute('aria-pressed', walk); };
    clk.set('10:30', true); mi.set('3.2m', true);
    const fmt = x => `${9 + Math.floor(x/60*6)}:${String(30 + Math.round(x*.9) % 60).padStart(2,'0')}`;
    return t => { const x = clamp(v.at(t)/100);
      $(st,'.ink').style.width = (x*100).toFixed(1) + '%'; $(st,'.mk').style.left = `calc(${(x*100).toFixed(1)}% - 0px)`;
      clk.set(fmt(v.at(t))); mi.set((v.at(t)/10*(walk ? .4 : 1)).toFixed(1) + 'm'); clk.render(t); mi.render(t);
      const act = Math.min(2, Math.floor(x*3));
      rows.forEach((r,i) => { r.style.opacity = (i <= act ? 1 : .45).toFixed(2); if (sws[i].cur !== (i <= act ? 1 : 0)) sws[i].to(i <= act ? 1 : 0);
        layers[i].forEach((e,k) => sws[i].apply(e,k,t)); }); };
  }});

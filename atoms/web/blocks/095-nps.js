

atom({ id:'nps', cat:'Forms', name:'NPS scale', block:'form (NPS, linear scale)', fam:['E','S'], wide:true,
  html:`<div class="col" style="width:min(560px,94%);gap:10px"><b class="small">How likely are you to recommend us to a friend?</b><div class="ns" role="radiogroup" aria-label="Score from 0 to 10" style="position:relative;display:flex;gap:4px"><i class="pl" style="position:absolute;top:0;bottom:0;left:0;border-radius:8px;opacity:0"></i></div><div class="row small muted" style="justify-content:space-between"><span>Not likely</span><span class="cap" style="position:relative;height:20px;width:160px;color:var(--ink);font-weight:500"></span><span>Very likely</span></div><div class="cf small" style="position:relative;height:20px"></div><label class="row small muted" style="gap:6px;align-items:center;align-self:center;cursor:pointer"><input type="checkbox" class="cfk" checked> Confirmation note</label></div>`,
  desc:'The selection plate slides across the scale with lagging edges and changes color by band: danger for 0–6, warning for 7–8, success for 9–10. The caption swaps to match.',
  api:'plate.go(l, r)   color.set(band)   caption.to(band)',
  init(st){
    const ns = $(st,'.ns'), pl = $(st,'.pl'), cap = $(st,'.cap'), B = ['','Detractor','Passive','Promoter'];
    const L = B.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; cap.appendChild(e); return e; });
    const btns = [...Array(11)].map((_,i) => { const b = document.createElement('button'); b.setAttribute('role','radio'); b.textContent = i; b.style.cssText = 'position:relative;flex:1;height:40px;border:0;border-radius:8px;background:var(--card);cursor:pointer;font:600 14px var(--sans);font-variant-numeric:tabular-nums'; ns.appendChild(b); return b; });
    const e = edges(0,0), o = new Track(0), cw = new Track(0), cs = new Track(0), sw = new Swap(0), csw = new Swap(0); let sel = -1; const q = []; pl.style.willChange = 'left,width';
    const cfk = $(st,'.cfk'), cf = $(st,'.cf');
    const C = ['', 'Thanks — tell us what hurt.', 'Thanks — noted.', 'Thanks — spread the word.'].map(s => { const e2 = document.createElement('span'); e2.className = 'layer'; e2.textContent = s; cf.appendChild(e2); return e2; });
    const showCf = band => { cf.style.color = band === 1 ? 'var(--danger)' : band === 2 ? 'var(--warning)' : 'var(--success)';
      if (REDUCE){ csw.cur = band; csw.prev = null; csw.t = -9; } else csw.to(band); };
    const hideCf = () => { if (REDUCE){ csw.cur = 0; csw.prev = null; csw.t = -9; } else csw.to(0); };
    cfk.onchange = () => { if (!cfk.checked) hideCf(); else if (sel >= 0) showCf(sel <= 6 ? 1 : sel <= 8 ? 2 : 3); };
    btns.forEach((b,i) => b.onclick = () => { const band = i <= 6 ? 1 : i <= 8 ? 2 : 3; sel < 0 ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); sel = i; o.set(1);
      cw.set(band === 2 ? 1 : 0); cs.set(band === 3 ? 1 : 0); sw.to(band); btns.forEach((x,j) => { x.setAttribute('aria-checked', j === i); });
      q.length = 0; if (!cfk.checked){ hideCf(); return; }
      if (REDUCE) showCf(band); else { const t0 = now(); q.push([t0 + .35, () => showCf(band)]); } });
    return t => { while (q.length && q[0][0] <= t) q.shift()[1](); const a = e.A.at(t), b = e.B.at(t), w = clamp(cw.at(t)), s = clamp(cs.at(t)); pl.style.left = px(a); pl.style.width = px(b - a); pl.style.opacity = clamp(o.at(t)).toFixed(3);
      pl.style.background = `color-mix(in oklab, var(--success) ${(s*100).toFixed(1)}%, ${mix(w,'var(--warning)','var(--danger)')})`;
      btns.forEach(x => { const c = clamp(1 - Math.abs((a + b)/2 - (x.offsetLeft + x.offsetWidth/2))/x.offsetWidth)*clamp(o.at(t)); x.style.color = mix(c,'#fff','var(--ink)'); x.style.background = `color-mix(in oklab, var(--card) ${((1-c)*100).toFixed(1)}%, transparent)`; x.style.borderColor = mix(c,'transparent','var(--line)'); });
      L.forEach((el,k) => sw.apply(el,k,t)); C.forEach((el,k) => csw.apply(el,k,t)); };
  }});


atom({ id:'nps', cat:'Forms', name:'NPS scale', block:'form (NPS, linear scale)', fam:['E','S'], wide:true,
  html:`<div class="col" style="width:min(560px,94%);gap:10px"><b class="small">How likely are you to recommend us to a friend?</b><div class="ns" role="radiogroup" aria-label="Score from 0 to 10" style="position:relative;display:flex;gap:4px"><i class="pl" style="position:absolute;top:0;bottom:0;left:0;border-radius:8px;opacity:0"></i></div><div class="row small muted" style="justify-content:space-between"><span>Not likely</span><span class="cap" style="position:relative;height:20px;width:160px;color:var(--ink);font-weight:500"></span><span>Very likely</span></div></div>`,
  desc:'The selection plate slides across the scale with lagging edges and changes color by band: danger for 0–6, warning for 7–8, success for 9–10. The caption swaps to match.',
  api:'plate.go(l, r)   color.set(band)   caption.to(band)',
  init(st){
    const ns = $(st,'.ns'), pl = $(st,'.pl'), cap = $(st,'.cap'), B = ['','Detractor','Passive','Promoter'];
    const L = B.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; cap.appendChild(e); return e; });
    const btns = [...Array(11)].map((_,i) => { const b = document.createElement('button'); b.setAttribute('role','radio'); b.textContent = i; b.style.cssText = 'position:relative;flex:1;height:40px;border:1px solid var(--line);border-radius:8px;background:var(--card);cursor:pointer;font:600 14px var(--sans);font-variant-numeric:tabular-nums'; ns.appendChild(b); return b; });
    const e = edges(0,0), o = new Track(0), cw = new Track(0), cs = new Track(0), sw = new Swap(0); let sel = -1;
    btns.forEach((b,i) => b.onclick = () => { const band = i <= 6 ? 1 : i <= 8 ? 2 : 3; sel < 0 ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); sel = i; o.set(1);
      cw.set(band === 2 ? 1 : 0); cs.set(band === 3 ? 1 : 0); sw.to(band); btns.forEach((x,j) => { x.setAttribute('aria-checked', j === i); }); });
    return t => { const a = e.A.at(t), b = e.B.at(t), w = clamp(cw.at(t)), s = clamp(cs.at(t)); pl.style.left = px(a); pl.style.width = px(b - a); pl.style.opacity = clamp(o.at(t)).toFixed(3);
      pl.style.background = `color-mix(in oklab, var(--success) ${(s*100).toFixed(1)}%, ${mix(w,'var(--warning)','var(--danger)')})`;
      btns.forEach(x => { const c = clamp(1 - Math.abs((a + b)/2 - (x.offsetLeft + x.offsetWidth/2))/x.offsetWidth)*clamp(o.at(t)); x.style.color = mix(c,'#fff','var(--ink)'); x.style.background = c > .5 ? 'transparent' : 'var(--card)'; x.style.borderColor = c > .5 ? 'transparent' : 'var(--line)'; });
      L.forEach((el,k) => sw.apply(el,k,t)); };
  }});
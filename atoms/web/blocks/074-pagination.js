

atom({ id:'pagination', cat:'Navigation', name:'Pagination', block:'postlist, collection-browser', fam:['E','M'],
  html:`<nav class="row" aria-label="Pagination" style="gap:6px"><button class="btn pv" aria-label="Previous page">‹</button><div class="win" style="position:relative;width:180px;height:34px;overflow:hidden"><i class="in" style="position:absolute;top:0;height:34px;border-radius:9px;background:var(--ink)"></i><div class="sp" style="position:absolute;left:0;top:0;height:34px"></div></div><button class="btn nx" aria-label="Next page">›</button></nav>`,
  desc:'The number strip slides to keep the current page centered, clamped at the ends. The active plate moves with lagging edges, so it stretches on long jumps.',
  api:'strip.set(−clamp(i·36 − 72, 0, max))   plate.go(i·36, i·36 + 36)',
  init(st){
    const sp = $(st,'.sp'), ind = $(st,'.in'), N = 12, C = 36;
    const nums = [...Array(N)].map((_,i) => { const b = document.createElement('button'); b.textContent = i + 1; b.style.cssText = `position:absolute;top:0;left:${i*C}px;width:${C}px;height:34px;border:0;background:none;cursor:pointer;font:500 14px var(--sans);font-variant-numeric:tabular-nums`; sp.appendChild(b); b.onclick = () => go(i); return b; });
    const off = new Track(0), e = edges(0, C); let cur = 0;
    const go = i => { cur = clamp(i, 0, N-1); off.set(-clamp(cur*C - 72, 0, (N-5)*C)); e.go(cur*C + 2, cur*C + C - 2); nums.forEach((b,j) => b.setAttribute('aria-current', j === cur ? 'page' : 'false')); };
    $(st,'.pv').onclick = () => go(cur - 1); $(st,'.nx').onclick = () => go(cur + 1); e.jump(2, C - 2);
    return t => { const o = off.at(t), a = e.A.at(t), b = e.B.at(t); sp.style.transform = `translateX(${px(o)})`; ind.style.left = px(a + o); ind.style.width = px(b - a);
      nums.forEach((n,j) => { const c = clamp(1 - Math.abs((a + b)/2 - (j*C + C/2))/C); n.style.color = mix(c,'var(--card)','var(--ink)'); }); };
  }});
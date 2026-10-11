

atom({ id:'pagination', cat:'Navigation', name:'Pagination', block:'postlist, collection-browser', fam:['E','M'],
  html:`<nav class="row" aria-label="Pagination" style="gap:6px"><button class="btn pv" aria-label="Previous page">‹</button><div class="win" role="group" aria-label="Page numbers, scroll sideways for more" style="position:relative;width:180px;height:34px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none"><i class="in" style="position:absolute;top:0;height:34px;border-radius:9px;background:var(--ink)"></i><div class="sp" style="position:absolute;left:0;top:0;height:34px"></div></div><button class="btn nx" aria-label="Next page">›</button></nav>`,
  desc:'The number strip slides to keep the current page centered, clamped at the ends. The active plate moves with lagging edges, so it stretches on long jumps.',
  api:'strip.set(−clamp(i·36 − 72, 0, max))   plate.go(i·36, i·36 + 36)',
  init(st){
    const win = $(st,'.win'), sp = $(st,'.sp'), ind = $(st,'.in'), N = 12, C = 36;
    const nums = [...Array(N)].map((_,i) => { const b = document.createElement('button'); b.textContent = i + 1; b.setAttribute('aria-label', `Page ${i + 1}`); b.style.cssText = `position:absolute;top:0;left:${i*C}px;width:${C}px;height:34px;border:0;background:none;cursor:pointer;font:500 14px var(--sans);font-variant-numeric:tabular-nums`; sp.appendChild(b); b.onclick = () => go(i); return b; });
    // the window scrolls sideways (wheel, trackpad, or a click on an off-screen page); the strip re-centers on the current page
    const off = new Track(0), e = edges(0, C); let cur = 0, lastO = -1, lastFade = '';
    const go = i => { cur = clamp(i, 0, N-1); off.set(clamp(cur*C - 72, 0, (N-5)*C)); e.go(cur*C + 2, cur*C + C - 2); nums.forEach((b,j) => { b.setAttribute('aria-current', j === cur ? 'page' : 'false'); }); };
    $(st,'.pv').onclick = () => go(cur - 1); $(st,'.nx').onclick = () => go(cur + 1); e.jump(2, C - 2);
    return t => { const o = off.at(t), a = e.A.at(t), b = e.B.at(t);
      if (Math.abs(o - lastO) > .05){ lastO = o; win.scrollLeft = o; }   // write only when the target moves, so manual scrolling is not overridden
      ind.style.left = px(a); ind.style.width = px(b - a);
      // edge fades show that more pages sit past each end of the window
      const max = win.scrollWidth - win.clientWidth, s = win.scrollLeft, fl = s > 1 ? 18 : 0, fr = s < max - 1 ? 18 : 0, fade = `linear-gradient(to right, transparent 0, #000 ${fl}px, #000 calc(100% - ${fr}px), transparent 100%)`;
      if (fade !== lastFade){ lastFade = fade; win.style.maskImage = fade; win.style.webkitMaskImage = fade; }
      nums.forEach((n,j) => { const c = clamp(1 - Math.abs((a + b)/2 - (j*C + C/2))/C); n.style.color = mix(c,'var(--card)','var(--ink)'); }); };
  }});
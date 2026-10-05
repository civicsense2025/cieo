

atom({ id:'line', cat:'Data', name:'Line chart', block:'chart', fam:['T','M'], wide:true,
  html:`<div class="cw" style="position:relative;width:min(560px,92%)"><svg class="ch" viewBox="0 0 520 220" style="width:100%;height:auto;display:block;overflow:visible" aria-label="Weekly active readers by month, in thousands"></svg><div class="tip num" style="position:absolute;top:0;left:0;pointer-events:none;background:var(--ink);color:var(--card);border-radius:8px;padding:4px 9px;font-size:12px;white-space:nowrap"></div></div><button class="btn" style="position:absolute;top:10px;right:12px">Replay</button>`,
  desc:'The line draws on the lazy spring through stroke-dashoffset. The dot and tooltip follow the nearest point on the snap spring.',
  api:'dashoffset = L·(1 − draw.at(t))   tip.x.set(xᵢ, S.snap)',
  init(st){
    const svg = $(st,'.ch'), wrap = $(st,'.cw'), tip = $(st,'.tip');
    const D = [42,48,45,61,58,72,69,84,80,95,103,118], M = 'JFMAMJJASOND'.split(''), X0 = 36, X1 = 508, Y0 = 190, Y1 = 14;
    const xs = i => X0 + i*(X1-X0)/11, ys = v => Y0 - v/120*(Y0-Y1), P = D.map((v,i) => [xs(i), ys(v)]);
    let d = `M${P[0]}`; for (let i = 0; i < 11; i++){ const a = P[Math.max(0,i-1)], b = P[i], c = P[i+1], e = P[Math.min(11,i+2)];
      d += `C${b[0]+(c[0]-a[0])/6} ${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6} ${c[1]-(e[1]-b[1])/6} ${c[0]} ${c[1]}`; }
    let g = ''; for (const v of [0,40,80,120]) g += `<line x1="${X0}" x2="${X1}" y1="${ys(v)}" y2="${ys(v)}" stroke="var(--line)"/><text x="${X0-8}" y="${ys(v)+4}" text-anchor="end" font-size="11" fill="var(--faint)">${v}k</text>`;
    M.forEach((m,i) => g += `<text x="${xs(i)}" y="${Y0+20}" text-anchor="middle" font-size="11" fill="var(--faint)">${m}</text>`);
    svg.innerHTML = g + `<path class="ar" d="${d}L${X1} ${Y0}L${X0} ${Y0}Z" fill="var(--ink)" opacity="0"/><path class="ln" d="${d}" fill="none" stroke="var(--ink)" stroke-width="2.25" stroke-linecap="round"/><line class="gd" y1="${Y1}" y2="${Y0}" stroke="var(--faint)" stroke-dasharray="3 3" opacity="0"/><circle class="dt" r="5" fill="var(--card)" stroke="var(--ink)" stroke-width="2.25" opacity="0"/>`;
    const ln = $(svg,'.ln'), ar = $(svg,'.ar'), dt = $(svg,'.dt'), gd = $(svg,'.gd'), L = ln.getTotalLength(); ln.style.strokeDasharray = L;
    const draw = new Track(0, S.lazy), hx = new Track(P[0][0], S.snap), hy = new Track(P[0][1], S.snap), ho = new Track(0, S.snap); let idx = -1;
    const go = () => draw.jump(0).set(1); $(st,'.btn').onclick = go; go();
    svg.onpointermove = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left)/r.width*520, i = clamp(Math.round((x - X0)/((X1-X0)/11)), 0, 11);
      if (ho.target === 0){ hx.jump(P[i][0]); hy.jump(P[i][1]); } ho.set(1); if (i !== idx){ idx = i; hx.set(P[i][0]); hy.set(P[i][1]); tip.textContent = `${M[i]} · ${D[i]}k readers`; } };
    svg.onpointerleave = () => { ho.set(0); idx = -1; };
    return t => { const p = clamp(draw.at(t)); ln.style.strokeDashoffset = (L*(1-p)).toFixed(2); ar.setAttribute('opacity', (p*p*.07).toFixed(3));
      const o = clamp(ho.at(t))*(p > .98 ? 1 : 0), x = hx.at(t), y = hy.at(t), s = wrap.clientWidth/520;
      dt.setAttribute('cx', x); dt.setAttribute('cy', y); dt.setAttribute('opacity', o); gd.setAttribute('x1', x); gd.setAttribute('x2', x); gd.setAttribute('opacity', o*.8);
      tip.style.opacity = o; tip.style.transform = `translate(calc(${px(x*s)} - 50%), ${px(y*s - 38 + 6*(1-o))})`; };
  }});
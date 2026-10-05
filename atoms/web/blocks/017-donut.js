

atom({ id:'donut', cat:'Data', name:'Donut', block:'chart', fam:['M','S'],
  html:`<div class="row" style="gap:22px"><div style="position:relative;width:150px;height:150px"><svg class="dn" viewBox="0 0 160 160" width="150" height="150" style="transform:rotate(-90deg)"></svg><div class="ctr" style="position:absolute;inset:0"></div></div><div class="col small lg" style="gap:6px"></div></div><button class="btn" style="position:absolute;top:10px;right:12px">Replay</button>`,
  desc:'Segments sweep in together on one spring. Hovering a segment thickens it and swaps the center label.',
  api:'seg.len = vᵢ·draw(t)   seg.width.set(hover ? 22 : 16)',
  init(st){
    const svg = $(st,'.dn'), ctr = $(st,'.ctr'), lg = $(st,'.lg');
    const D = [['Direct',42,'var(--ink)'],['Search',28,'var(--muted)'],['Social',18,'var(--accent)'],['Email',12,'var(--line)']];
    svg.innerHTML = D.map(d => `<circle cx="80" cy="80" r="60" fill="none" stroke="${d[2]}" pathLength="100"/>`).join('');
    const cs = $$(svg,'circle'), wt = D.map(() => new Track(16, S.snap)), draw = new Track(0, S.lazy), sw = new Swap(-1);
    const L = [['Total','100%'], ...D.map(d => [d[0], d[1] + '%'])].map(([a,b]) => { const e = document.createElement('div'); e.className = 'layer'; e.style.flexDirection = 'column'; e.style.gap = '0'; e.innerHTML = `<b class="num" style="font-size:22px;letter-spacing:-.02em">${b}</b><span class="small muted">${a}</span>`; ctr.appendChild(e); return e; });
    D.forEach((d,i) => { const r = document.createElement('div'); r.className = 'row'; r.style.gap = '8px'; r.innerHTML = `<i style="width:10px;height:10px;border-radius:3px;background:${d[2]}"></i><span>${d[0]}</span>`; lg.appendChild(r);
      const on = () => { wt.forEach((w,j) => w.set(j === i ? 22 : 16)); sw.to(i); }, off = () => { wt[i].set(16); sw.to(-1); };
      cs[i].onpointerenter = r.onpointerenter = on; cs[i].onpointerleave = r.onpointerleave = off; });
    const go = () => draw.jump(0).set(1); $(st,'.btn').onclick = go; go();
    return t => { const p = clamp(draw.at(t)); let s = 0;
      cs.forEach((c,i) => { const len = Math.max(0, D[i][1]*p - .8); c.setAttribute('stroke-dasharray', `${len.toFixed(3)} 100`); c.setAttribute('stroke-dashoffset', (-s*p).toFixed(3)); c.setAttribute('stroke-width', wt[i].at(t).toFixed(2)); s += D[i][1]; });
      L.forEach((e,k) => sw.apply(e, k-1, t)); };
  }});
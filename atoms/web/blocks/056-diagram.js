

atom({ id:'diagram', cat:'Data', name:'Diagram build', block:'diagram', fam:['T','M'], wide:true,
  html:`<svg class="dg" viewBox="0 0 560 170" style="width:min(560px,94%);height:auto;overflow:visible" aria-label="Publishing flow: Draft, Review, Publish, with a Changes loop back to Draft"></svg><button class="btn" style="position:absolute;top:10px;right:12px">Replay</button>`,
  desc:'Each node arrives 180ms after the last, and each connector draws from its source only after that source has landed, so the flow reads in order.',
  api:'node[i].o = prog(t, t0 + i·0.18)   edge.draw = prog(t, t0 + from·0.18 + 0.12)',
  init(st){
    const svg = $(st,'.dg'), N = [['Draft',20,40],['Review',210,40],['Publish',400,40],['Changes',210,118]], W = 140, H = 40;
    const E = [[0,1,'M160 60 H210'],[1,2,'M350 60 H400'],[1,3,'M280 80 V118'],[3,0,'M210 138 H90 V80']];
    svg.innerHTML = '<defs><marker id="dgh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="var(--muted)"/></marker></defs>' +
      E.map(e => `<path class="eg" d="${e[2]}" fill="none" stroke="var(--muted)" stroke-width="1.5" pathLength="1" stroke-dasharray="1" marker-end="url(#dgh)"/>`).join('') +
      N.map(([l,x,y],i) => `<g class="nd" style="transform-origin:${x + W/2}px ${y + H/2}px"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="10" fill="${i === 2 ? 'var(--ink)' : 'var(--card)'}" stroke="var(--line)"/><text x="${x + W/2}" y="${y + 25}" text-anchor="middle" font-size="14" font-weight="500" fill="${i === 2 ? 'var(--card)' : 'var(--ink)'}">${l}</text></g>`).join('');
    const nd = $$(svg,'.nd'), eg = $$(svg,'.eg'); let t0 = 0;
    const go = () => t0 = now(); $(st,'.btn').onclick = go; go();
    return t => { nd.forEach((g,i) => { const p = clamp(prog(t, t0 + i*.18)); g.style.opacity = p.toFixed(3); g.style.transform = `scale(${(.96 + .04*p).toFixed(4)})`; });
      eg.forEach((p,i) => { const d = clamp(prog(t, t0 + E[i][0]*.18 + .12 + (i === 3 ? .5 : 0), S.soft)); p.style.strokeDashoffset = (1 - d).toFixed(3); p.style.opacity = d > .02 ? 1 : 0; }); };
  }});
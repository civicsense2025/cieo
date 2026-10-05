

atom({ id:'cart', cat:'Commerce', name:'Add to cart', block:'product, productgrid', fam:['M','S'],
  html:`<div class="card col" style="width:230px;padding:14px;gap:10px"><div style="height:92px;border-radius:10px;background:var(--raised);display:grid;place-items:center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="1.5"><path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg></div><div class="row" style="justify-content:space-between"><b class="small">Canvas tote</b><span class="small muted">$32</span></div><button class="ad" style="position:relative;height:38px;border-radius:10px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer"></button></div><div style="position:absolute;top:14px;right:16px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/></svg><span class="cb" style="position:absolute;left:12px;top:-8px;height:18px;min-width:18px;padding:0 5px;border-radius:9px;background:var(--ink);color:var(--card);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center"><span class="d"></span></span></div>`,
  desc:'The button confirms in place with a blur swap and fills with the success color, then returns. The cart count rolls when the item arrives, 300ms later.',
  api:'btn.to("added"); cart.set(n, t + 0.3); btn.to("add", t + 1.6)',
  init(st){
    const ad = $(st,'.ad'), cb = $(st,'.cb'), d = new Digits($(st,'.d'), 2), co = new Track(0); let n = 0, q = [];
    const L = ['Add to cart','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>Added'].map(h => { const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = h; ad.appendChild(e); return e; });
    const sw = new Swap(0), ok = new Track(0); d.set('0', true);
    ad.onclick = () => { const t0 = now(); sw.to(1); ok.set(1); n = Math.min(99, n + 1); q = q.filter(x => x[2] !== 'back');
      q.push([t0 + .3, () => { d.set(String(n)); co.set(1); }, 'cnt'], [t0 + 1.6, () => { sw.to(0); ok.set(0); }, 'back']); q.sort((a,b) => a[0] - b[0]); };
    return t => { while (q.length && q[0][0] <= t) q.shift()[1](); L.forEach((e,k) => sw.apply(e,k,t)); d.render(t);
      const g = clamp(ok.at(t)); ad.style.background = mix(g,'var(--success)','var(--ink)'); ad.style.color = mix(g,'#fff','var(--card)');
      const o = clamp(co.at(t)); cb.style.opacity = o.toFixed(3); cb.style.transform = `scale(${(.6+.4*o).toFixed(4)})`; };
  }});
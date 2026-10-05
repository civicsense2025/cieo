

atom({ id:'skeleton', cat:'Dynamic', name:'Skeleton to content', block:'entry-list, related-content, postlist', fam:['S','T'], tall:true,
  html:`<div class="col sk" style="width:min(340px,88%);gap:10px"></div><button class="btn" style="position:absolute;top:10px;right:12px">Reload</button>`,
  desc:'Placeholders pulse on a 1.2-second clock while loading. When data lands, each row swaps from skeleton to content 50ms after the one above.',
  api:'pulse = 0.55 + 0.25·cos(2πt/1.2)   row.swap.to("data", tLoad + i·0.05)',
  init(st){
    const sk = $(st,'.sk'), D = [['Notes from the river path','Sep 28 · 4 min read'],['What we learned shipping members','Sep 21 · 7 min read'],['A smaller homepage','Sep 14 · 3 min read']];
    const rows = D.map(([h,m]) => { const c = document.createElement('div'); c.className = 'card'; c.style.cssText += 'position:relative;height:64px';
      c.innerHTML = `<div class="layer s" style="justify-content:flex-start;padding:0 14px;gap:12px"><i style="width:36px;height:36px;border-radius:8px;background:var(--raised)"></i><span class="col" style="gap:7px;flex:1"><i style="height:10px;width:78%;border-radius:5px;background:var(--raised)"></i><i style="height:8px;width:42%;border-radius:4px;background:var(--raised)"></i></span></div><div class="layer d" style="justify-content:flex-start;padding:0 14px;gap:12px"><i style="width:36px;height:36px;border-radius:8px;background:var(--ink);flex:none"></i><span class="col" style="gap:1px;min-width:0"><b class="small" style="overflow:hidden;text-overflow:ellipsis">${h}</b><span class="small muted">${m}</span></span></div>`;
      sk.appendChild(c); return { s:$(c,'.s'), d:$(c,'.d'), sw:new Swap('s') }; });
    let q = [];
    const load = () => { const t0 = now(); rows.forEach(r => r.sw.to('s', t0)); q = rows.map((r,i) => [t0 + 1.4 + i*.05, () => r.sw.to('d')]); };
    $(st,'.btn').onclick = load; load();
    return t => { while (q.length && q[0][0] <= t) q.shift()[1](); const pulse = REDUCE ? .7 : .55 + .25*Math.cos(2*Math.PI*t/1.2);
      rows.forEach(r => { r.sw.apply(r.s,'s',t,0); r.sw.apply(r.d,'d',t,4); if (r.sw.cur === 's') r.s.style.opacity = (parseFloat(r.s.style.opacity)*pulse/.8).toFixed(3); }); };
  }});
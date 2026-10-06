

atom({ id:'ranks', cat:'SEO', name:'Keyword ranks', block:'table, metric', fam:['M','S'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center"><div class="card" style="width:min(360px,92%);overflow:hidden"><div class="row small muted" style="height:32px;padding:0 12px;gap:0;border-bottom:1px solid var(--line)"><span style="flex:1">Keyword</span><span style="width:50px;text-align:right">Rank</span><span style="width:60px;text-align:right">Change</span></div><div class="rb" style="position:relative;height:180px"></div></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="dv" checked> Dividers</label></div><button class="btn rf" style="position:absolute;top:10px;right:12px">Refresh</button>`,
  desc:'On refresh, rows re-sort by rank on springs, rank digits roll, and each change chip swaps to its new value in success or danger.',
  api:'row.y.set(order·36)   rank.digits.set(n)   delta.to(±k)',
  init(st){
    const rb = $(st,'.rb'), K = ['member pricing','newsletter platform','paid newsletter','site builder','creator store'];
    let pos = [4,7,12,18,23], bottom = K.length - 1;
    const dv = $(st,'.dv');
    const rows = K.map((k,i) => { const r = document.createElement('div'); r.className = 'row small'; r.style.cssText += 'position:absolute;left:0;right:0;top:0;height:36px;padding:0 12px;gap:0;border-bottom:1px solid var(--line-soft)';
      r.innerHTML = `<span style="flex:1;font-weight:500">${k}</span><span style="width:50px;text-align:right" class="num"><span class="d"></span></span><span class="dl" style="position:relative;width:60px;height:20px"></span>`; rb.appendChild(r);
      const x = { r, d:new Digits($(r,'.d'), 2), dl:$(r,'.dl'), y:new Track(i*36), sw:new Swap('0'), L:{} }; x.d.set(String(pos[i]), true); return x; });
    const chip = (x, v) => { if (!x.L[v]){ const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-end'; const up = +v > 0; e.innerHTML = +v === 0 ? '<span class="muted">–</span>' : `<span style="color:${up ? 'var(--success)' : 'var(--danger)'};font-weight:600">${up ? '▲' : '▼'} ${Math.abs(v)}</span>`; x.dl.appendChild(e); x.L[v] = e; } x.sw.to(String(v)); };
    rows.forEach(x => chip(x, '0'));
    $(st,'.rf').onclick = () => { const np = pos.map(p => clamp(p + Math.round((Math.random() - .55)*8), 1, 40)); const ord = np.map((p,i) => [p,i]).sort((a,b) => a[0] - b[0]); const t0 = now();
      ord.forEach(([,i],k) => rows[i].y.set(k*36, S.base, t0 + k*.02)); rows.forEach((x,i) => { x.d.dir = np[i] < pos[i] ? -1 : 1; x.d.set(String(np[i])); chip(x, String(pos[i] - np[i])); }); pos = np; bottom = ord[ord.length - 1][1]; paint(); };
    const paint = () => rows.forEach((x,i) => { x.r.style.borderBottom = (!dv.checked || i === bottom) ? 'none' : '1px solid var(--line-soft)'; });
    dv.onchange = paint; paint();
    return t => rows.forEach(x => { x.r.style.transform = `translateY(${px(x.y.at(t))})`; x.d.render(t); for (const k in x.L) x.sw.apply(x.L[k], k, t); });
  }});
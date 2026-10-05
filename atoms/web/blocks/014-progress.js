

atom({ id:'progress', cat:'Data', name:'Progress bars', block:'progress, poll', fam:['M','T'],
  html:`<div class="col pg" style="width:min(340px,88%);gap:14px"></div><button class="btn" style="position:absolute;top:10px;right:12px">Shuffle</button>`,
  desc:'Fills stagger by 40ms and percentages count with the same spring, so number and bar always agree.',
  api:'bar[i].set(v, S.base, t + i*0.04)',
  init(st){
    const box = $(st,'.pg'), N = ['Design','Build','Content','Launch'];
    const rows = N.map(name => { const r = document.createElement('div'); r.className = 'col'; r.style.gap = '6px';
      r.innerHTML = `<div class="row small" style="justify-content:space-between"><span></span><span class="num muted"></span></div><div style="height:8px;border-radius:4px;background:var(--raised);overflow:hidden"><div style="height:100%;border-radius:4px;background:var(--ink)"></div></div>`;
      r.querySelector('span').textContent = name; box.appendChild(r); return { pct:$$(r,'span')[1], fill:$(r,'div div div'), v:new Track(0) }; });
    const go = () => { const t0 = now(); rows.forEach((r,i) => r.v.set(Math.round(15 + Math.random()*85), S.base, t0 + i*.04)); };
    $(st,'button').onclick = go; go();
    return t => rows.forEach(r => { const v = r.v.at(t); r.fill.style.width = clamp(v/100)*100 + '%'; r.pct.textContent = Math.round(v) + '%'; });
  }});
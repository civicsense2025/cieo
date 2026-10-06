

atom({ id:'progress', cat:'Data', name:'Progress bars', block:'progress, poll', fam:['M','T'],
  html:`<div class="col" style="width:min(340px,88%);gap:16px"><div class="col pg" style="gap:16px"></div><div class="row small muted" style="gap:16px;justify-content:center"><button class="btn full">Fill 100%</button><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" class="tn" checked> success tint</label></div></div><button class="btn sf" style="position:absolute;top:16px;right:16px">Shuffle</button>`,
  desc:'Fills stagger by 40ms and percentages count with the same spring, so number and bar always agree. A bar that lands on 100 morphs to the success tint with a check.',
  api:'bar[i].set(v, S.base, t + i*0.04)   100: done.set(1) + success tint',
  init(st){
    const box = $(st,'.pg'), tn = $(st,'.tn'), N = ['Design','Build','Content','Launch'];
    const rows = N.map(name => { const r = document.createElement('div'); r.className = 'col'; r.style.gap = '8px';
      r.innerHTML = `<div class="row small" style="justify-content:space-between"><span></span><span class="row" style="gap:4px"><span class="ck" style="display:inline-flex;color:var(--success);opacity:0">${ic(I.check,13,3)}</span><span class="num muted pc"></span></span></div><div style="height:8px;border-radius:4px;background:var(--raised);overflow:hidden"><div class="fl" style="height:100%;border-radius:4px;background:var(--ink)"></div></div>`;
      r.querySelector('span').textContent=name;const meter=$(r,'.fl').parentElement;meter.setAttribute('role','progressbar');meter.setAttribute('aria-label',name);meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100'); box.appendChild(r); return { pct:$(r,'.pc'), fill:$(r,'.fl'), ck:$(r,'.ck'), v:new Track(0), done:new Track(0) }; });
    const setTargets = vals => { const t0 = now(); rows.forEach((r,i) => { r.v.set(vals[i], S.base, t0 + i*.04); r.done.set(vals[i] >= 100 ? 1 : 0, S.base, t0 + i*.04); }); };
    const go = () => setTargets(N.map(() => Math.round(15 + Math.random()*85)));
    $(st,'.sf').onclick = go; $(st,'.full').onclick = () => setTargets(N.map(() => 100)); go();
    return t => rows.forEach(r => { const v = r.v.at(t), dn = tn.checked ? clamp(r.done.at(t)) : 0;
      r.fill.style.width = clamp(v/100)*100 + '%'; r.fill.style.background = mix(dn,'var(--success)','var(--accent)');
      r.fill.parentElement.setAttribute('aria-valuenow',String(Math.round(clamp(v/100)*100)));r.pct.textContent = Math.round(v) + '%'; r.ck.style.opacity = dn.toFixed(3); });
  }});
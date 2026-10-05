

atom({ id:'matrix', cat:'Forms', name:'Matrix', block:'form (matrix)', fam:['E','M'], tall:true,
  html:`<div class="card mx" role="group" aria-label="Rate each area" style="width:min(400px,94%);padding:12px 14px"></div>`,
  desc:'Each row has one dot that slides between columns instead of a fresh fill per cell. A row inks a success check once answered.',
  api:'row.dot.x.set(colX)   row.done.set(1)',
  init(st){
    const mx = $(st,'.mx'), COLS = ['Poor','Fair','Good','Great'], ROWS = ['Page speed','Editor','Support'];
    mx.innerHTML = `<div class="row small muted" style="gap:0;padding-bottom:6px"><span style="flex:1.5"></span>${COLS.map(c => `<span style="flex:1;text-align:center">${c}</span>`).join('')}<span style="width:20px"></span></div>`;
    const rows = ROWS.map(n => { const r = document.createElement('div'); r.className = 'row'; r.setAttribute('role','radiogroup'); r.setAttribute('aria-label', n); r.style.cssText += 'gap:0;height:40px;border-top:1px solid var(--line-soft);position:relative';
      r.innerHTML = `<span class="small" style="flex:1.5;font-weight:500">${n}</span>${COLS.map(c => `<button role="radio" aria-checked="false" aria-label="${c}" style="flex:1;height:100%;border:0;background:none;cursor:pointer;display:grid;place-items:center"><i style="width:18px;height:18px;border-radius:50%;border:2px solid var(--line)"></i></button>`).join('')}<span class="dn" style="width:20px;color:var(--success)">${ic(I.check,14,2.5)}</span><i class="dot" style="position:absolute;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:var(--ink);pointer-events:none"></i>`;
      mx.appendChild(r); const btns = $$(r,'button'), x = { r, btns, dot:$(r,'.dot'), dn:$(r,'.dn'), x:new Track(0), o:new Track(0), d:new Track(0), sel:-1 };
      btns.forEach((b,i) => b.onclick = () => { const cx = b.offsetLeft + b.offsetWidth/2; x.sel < 0 ? x.x.jump(cx) : x.x.set(cx); x.sel = i; x.o.set(1); x.d.set(1, S.base, now() + LAG*2); btns.forEach((y,j) => y.setAttribute('aria-checked', j === i)); }); return x; });
    return t => rows.forEach(x => { const o = clamp(x.o.at(t)); x.dot.style.left = px(x.x.at(t)); x.dot.style.transform = `scale(${o.toFixed(3)})`; const d = clamp(x.d.at(t)); x.dn.style.opacity = d.toFixed(3); x.dn.style.transform = `scale(${(.6+.4*d).toFixed(3)})`;
      x.btns.forEach((b,j) => $(b,'i').style.borderColor = j === x.sel ? mix(o,'var(--ink)','var(--line)') : 'var(--line)'); });
  }});
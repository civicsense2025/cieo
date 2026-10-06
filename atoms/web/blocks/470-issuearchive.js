

atom({ id:'issuearchive', cat:'Newsletter', name:'Issue archive', block:'newsletter, archive', fam:['M'], tall:true,
  html:`<div class="card col" style="width:min(380px,92%);padding:6px 16px 16px;gap:0;line-height:1.55"><b style="font-size:15px;font-weight:600;padding:10px 0 2px">Past issues</b><span class="muted" style="font-size:12.5px;padding-bottom:8px">Open one; the rest wait their turn.</span><div class="acc"></div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px;padding-top:10px"><input type="checkbox" class="st" checked> stagger headlines</label></div>`,
  desc:'The open row springs to its measured height while its chevron turns. The next row headlines swap with a 40ms stagger. One open row holds.',
  api:'row.h.set(open, S.base) · chev = 180·p · head.to(i, t0 + i*.04)',
  init(st){
    const box = $(st,'.acc'), stg = $(st,'.st');
    const Q = [['#42 — The rivers issue','Routes, ferries and five slow mornings. 6 min read.'],['#41 — Maps we kept','Three annotated walks plus reader corrections. 4 min read.'],['#40 — Winter kitchens','Broth, bread and one perfect soup pot. 5 min read.']];
    const rows = Q.map(([q,a],i) => { const r = document.createElement('div'); r.style.borderTop = i ? '1px solid var(--line-soft)' : '0';
      r.innerHTML = `<button style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;background:none;border:0;min-height:44px;padding:10px 0;font-weight:600;font-size:14px;cursor:pointer;text-align:left;color:var(--ink)"><span></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button><div style="overflow:hidden;height:0"><p class="hd" style="position:relative;height:20px;margin:0;font-size:13px"></p><p class="bd small muted" style="margin:0;padding:0 0 12px;font-size:12.5px;line-height:1.55"></p></div>`;
      r.querySelector('span').textContent = q; r.querySelector('.bd').textContent = a;
      const hd = r.querySelector('.hd');
      const H = [q, 'Opening… ' + q].map(s => { const x = document.createElement('span'); x.className = 'layer'; x.style.justifyContent = 'flex-start'; x.textContent = s; hd.appendChild(x); return x; });
      box.appendChild(r);
      return { btn:$(r,'button'), chev:$(r,'svg'), body:$(r,'div'), inner:$(r,'.bd'), h:new Track(0), sw:new Swap(0), H }; });
    let open = 0; rows[0].h.jump(1);
    rows.forEach((r,i) => r.btn.onclick = () => { open = open === i ? -1 : i; const t0 = now();
      rows.forEach((x,j) => { x.h.set(open === j ? 1 : 0); x.btn.setAttribute('aria-expanded', open === j);
        if (stg.checked && !REDUCE && open >= 0 && j !== open) x.sw.to(1, t0 + Math.abs(j-open)*.04); else x.sw.to(0); }); });
    return t => rows.forEach(r => { const p = clamp(r.h.at(t)); r.body.style.height = px(p*(20 + r.inner.offsetHeight)); r.chev.style.transform = `rotate(${(p*180).toFixed(1)}deg)`; r.H.forEach((x,j) => r.sw.apply(x,j,t)); fade(r.inner, p, (1-p)*-4); });
  }});

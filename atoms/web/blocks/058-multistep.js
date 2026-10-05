

atom({ id:'multistep', cat:'Interactive', name:'Multi-step form', block:'form', fam:['S','M'], tall:true,
  html:`<form class="card col ms" novalidate style="width:min(320px,90%);padding:16px;gap:12px"><div style="height:4px;border-radius:2px;background:var(--raised);overflow:hidden"><i class="pb" style="display:block;height:100%;background:var(--ink)"></i></div><div class="pn" style="position:relative;height:96px;overflow:hidden"></div><div class="row" style="justify-content:space-between"><button type="button" class="btn bk">Back</button><button class="btn ink nx">Continue</button></div></form>`,
  desc:'Panels slide sideways in the direction of travel with the blur swap. An empty required field rings in the danger color with a message; the final step confirms in the success color.',
  api:'panel.to(i, dir)   progress.set(i/(n − 1))   err.set(empty)',
  init(st){
    const form = $(st,'.ms'), pn = $(st,'.pn'), pb = $(st,'.pb'), nx = $(st,'.nx');
    const P = [['Your name','ms-name','text','Ada Lovelace'],['Work email','ms-email','email','ada@studio.co'],null];
    const panels = P.map((p,i) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;gap:6px';
      d.innerHTML = p ? `<label class="small" for="${p[1]}" style="font-weight:500">${p[0]}</label><input id="${p[1]}" type="${p[2]}" placeholder="${p[3]}" style="border:1.5px solid var(--line);border-radius:9px;padding:9px 11px;background:var(--card);color:var(--ink);font:14px var(--sans);outline:none"><span class="small er" style="color:var(--danger);opacity:0">This field is required</span>`
        : `<div class="row" style="gap:10px;color:var(--success);font-weight:600"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5 10.5 15.5 16.5 9"/></svg>Request sent</div><span class="small muted">We’ll reply within one business day.</span>`;
      pn.appendChild(d); return { d, inp:$(d,'input'), er:$(d,'.er'), e:new Track(0) }; });
    let i = 0, dir = 1; const sw = new Swap(0), pg = new Track(0);
    const go = n => { dir = n > i ? 1 : -1; i = n; sw.to(i); pg.set(i/(P.length-1)); nx.textContent = i === 1 ? 'Send' : i === 2 ? 'Start over' : 'Continue'; $(st,'.bk').style.visibility = i === 1 ? 'visible' : 'hidden'; };
    form.onsubmit = ev => { ev.preventDefault(); const p = panels[i];
      if (i === 2){ panels.forEach(x => { if (x.inp) x.inp.value = ''; }); go(0); return; }
      if (!p.inp.value.trim()){ p.e.set(1); p.inp.setAttribute('aria-invalid', true); p.inp.focus(); return; }
      p.e.set(0); p.inp.removeAttribute('aria-invalid'); go(i + 1); };
    panels.forEach(p => p.inp && (p.inp.oninput = () => { if (p.inp.value.trim()){ p.e.set(0); p.inp.removeAttribute('aria-invalid'); } }));
    $(st,'.bk').onclick = () => go(i - 1); $(st,'.bk').style.visibility = 'hidden';
    return t => { pb.style.width = (clamp(pg.at(t))*100).toFixed(2) + '%';
      panels.forEach((p,k) => { sw.apply(p.d, k, t, 0); const o = parseFloat(p.d.style.opacity); const sgn = k === sw.cur ? dir : -dir; p.d.style.transform = `translateX(${px((1 - o)*16*sgn)})`; p.d.style.pointerEvents = k === sw.cur ? 'auto' : 'none';
        if (p.inp){ const e = clamp(p.e.at(t)); p.inp.style.borderColor = mix(e,'var(--danger)','var(--line)'); fade(p.er, e, (1-e)*-3); } }); };
  }});
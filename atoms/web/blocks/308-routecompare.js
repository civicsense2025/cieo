atom({ id:'routecompare', cat:'Maps', name:'Route comparison', block:'directions, eta', fam:['M'], wide:true,
  html:`<div class="card" style="width:min(440px,94%);padding:14px 16px"><p style="font-size:15px;font-weight:600;line-height:1.5;margin:0 0 2px">Pick a route</p><p style="font-size:12.5px;color:var(--muted);line-height:1.5;margin:0 0 10px">2 options · traffic now</p><div class="rts" style="position:relative;display:flex;flex-direction:column"></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;padding:10px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Winner keeps the plate</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="true">Traffic on</button></div></div><div class="hint">Tap a route to choose it</div>`,
  desc:'Rival inks chase each other with the trailing edge 60ms behind. The winner plate lands leading-edge-first. ETAs roll on a base spring and the loser holds dimmed as the terminal.',
  api:'edge.go(pick) trails .06   eta[i].digits.set(min)   plate.o.set(pick)',
  init(st){
    const box = $(st,'.rts');
    const R = [{ n:'Via Embarcadero', m:14, fast:true }, { n:'Via Market St', m:19, fast:false }];
    const rows = R.map((r,i) => { const d = document.createElement('button'); d.style.cssText = 'position:relative;display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:none;cursor:pointer;padding:10px 10px;border-radius:10px' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      d.innerHTML = `<span class="plt" style="position:absolute;inset:4px;border-radius:8px;background:var(--raised)"></span><span style="position:relative;flex:1;min-width:0"><b style="display:block;font-size:14px;line-height:1.5">${r.n}</b><span style="display:block;height:5px;border-radius:3px;background:var(--line);margin-top:6px;overflow:hidden"><i class="ink" style="display:block;height:100%;border-radius:3px;background:var(--ink)"></i></span></span><span class="eta" style="position:relative;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums"></span><span style="position:relative;font-size:12.5px;color:var(--muted)">min</span>`;
      d.setAttribute('aria-label', `${r.n}, ${r.m} minutes`); box.appendChild(d); return d; });
    const e = edges(0, 1); e.jump(1, 0);
    const etas = rows.map(r => { const d = new Digits($(r,'.eta'), 2); return d; });
    etas.forEach((d,i) => d.set(String(R[i].m), true));
    let pick = 0, traffic = true;
    const tg = $(st,'.pg-tg');
    const apply = inst => { const t0 = now();
      if (inst || REDUCE){ e.jump(pick ? 0 : 1, pick ? 1 : 0); etas.forEach((d,i) => d.set(String(R[i].m + (traffic ? 0 : -2)), true)); }
      else { e.go(pick ? 0 : 1, pick ? 1 : 0); etas.forEach((d,i) => d.set(String(R[i].m + (traffic ? 0 : -2)))); } };
    rows.forEach((r,i) => r.onclick = () => { pick = i; apply(false); });
    tg.onclick = () => { traffic = !traffic; tg.textContent = traffic ? 'Traffic on' : 'Traffic off'; tg.setAttribute('aria-pressed', traffic); apply(false); };
    apply(true);
    return t => { const a = clamp(e.A.at(t)), b = clamp(e.B.at(t));
      rows.forEach((r,i) => { const on = (i === pick ? a : 1-a), off = (i === pick ? b : 1-b);
        r.querySelector('.plt').style.opacity = (i === pick ? .6+.4*b : .25*off).toFixed(3);
        r.querySelector('.ink').style.width = ((i === pick ? b : .55*off)*100).toFixed(1) + '%';
        r.style.opacity = (i === pick ? 1 : .55 + .2*off).toFixed(3); });
      etas.forEach(d => d.render(t)); };
  }});

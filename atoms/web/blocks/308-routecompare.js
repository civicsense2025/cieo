atom({ id:'routecompare', cat:'Maps', name:'Route comparison', block:'directions, eta', fam:['M'], wide:true,
  html:`<div class="card" style="width:min(440px,94%);padding:14px 16px"><p style="font-size:15px;font-weight:600;line-height:1.5;margin:0 0 2px">Pick a route</p><p style="font-size:12.5px;color:var(--muted);line-height:1.5;margin:0 0 10px">2 options · traffic now</p><div class="rts" style="position:relative;display:flex;flex-direction:column;gap:4px"></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;padding:10px 2px 0;font-size:12.5px;color:var(--muted)"><span class="rc-st" style="flex:1" aria-live="polite">Tap a route to select it</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="true">Traffic on</button></div></div><div class="hint">Tap a route to choose it</div>`,
  desc:'Rival inks chase each other with the trailing edge 60ms behind. The chosen route fills its bar and its plate lands leading-edge-first, while the other route dims. ETAs roll on a base spring and the loser holds dimmed as the terminal.',
  api:'edge.go(w0, w1) trails .06   eta[i].digits.set(min)   plate.o.set(w_i)   bar.w = mix(w_i)',
  init(st){
    const box = $(st,'.rts'), status = $(st,'.rc-st');
    const R = [{ n:'Via Embarcadero', m:14 }, { n:'Via Market St', m:19 }];
    const rows = R.map((r,i) => { const d = document.createElement('button'); d.type = 'button'; d.style.cssText = 'position:relative;display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:none;cursor:pointer;padding:10px 10px;border-radius:10px;color:var(--ink)';
      d.innerHTML = `<span class="plt" style="position:absolute;inset:4px;border-radius:8px;background:var(--raised);opacity:0"></span><span style="position:relative;flex:1;min-width:0"><b style="display:block;font-size:14px;line-height:1.5">${r.n}</b><span style="display:block;height:5px;border-radius:3px;background:var(--line);margin-top:6px;overflow:hidden"><i class="ink" style="display:block;height:100%;border-radius:3px;background:var(--ink);width:0"></i></span></span><span class="eta" style="position:relative;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums"></span><span style="position:relative;font-size:12.5px;color:var(--muted)">min</span>`;
      d.setAttribute('aria-label', `${r.n}, ${r.m} minutes`); d.setAttribute('aria-pressed', 'false'); box.appendChild(d); return d; });
    const e = edges(0, 0);
    const etas = rows.map(r => new Digits($(r,'.eta'), 2));
    let pick = -1, traffic = true;
    const tg = $(st,'.pg-tg');
    const apply = inst => {
      const w0 = pick === 0 ? 1 : 0, w1 = pick === 1 ? 1 : 0, mins = i => R[i].m + (traffic ? 0 : -2);
      if (inst || REDUCE) e.jump(w0, w1); else e.go(w0, w1);
      etas.forEach((d,i) => d.set(String(mins(i)), inst || REDUCE));
      rows.forEach((r,i) => r.setAttribute('aria-pressed', String(i === pick)));
      status.textContent = pick < 0 ? 'Tap a route to select it' : `${R[pick].n} selected, ${mins(pick)} min`;
    };
    rows.forEach((r,i) => r.onclick = () => { pick = pick === i ? -1 : i; apply(false); });
    tg.onclick = () => { traffic = !traffic; tg.textContent = traffic ? 'Traffic on' : 'Traffic off'; tg.setAttribute('aria-pressed', String(traffic)); apply(false); };
    apply(true);
    return t => { const ws = [clamp(e.A.at(t)), clamp(e.B.at(t))], any = clamp(ws[0] + ws[1]);
      rows.forEach((r,i) => { const w = ws[i];
        r.querySelector('.plt').style.opacity = w.toFixed(3);
        r.querySelector('.ink').style.width = (R[i].m / 19 * 100 * (.5 + .5*w)).toFixed(1) + '%';
        r.querySelector('.ink').style.background = mix(w, 'var(--ink)', 'var(--muted)');
        r.style.opacity = (1 - .45*(1 - w)*any).toFixed(3); });
      etas.forEach(d => d.render(t)); };
  }});

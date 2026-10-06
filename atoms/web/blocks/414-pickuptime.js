atom({ id:'pickuptime', cat:'Storefront', name:'Pickup time picker', block:'pickup, slots, scheduling', fam:['E','S'],
  html:`<div class="col" style="gap:8px;width:min(320px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Choose pickup time</h4><div class="dys row" role="group" aria-label="Day" style="gap:4px;position:relative"></div><div class="slts" role="group" aria-label="Time slots" style="display:flex;flex-wrap:wrap;gap:6px;min-height:36px"></div><span class="cf small" style="font-size:12px;color:var(--muted);line-height:1.5;min-height:18px">Pick a day to see slots.</span><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="we" checked> Include weekend</label></div><div class="hint">Days glide, slots stagger, choice lifts</div>`,
  desc:'The day disc glides under the new day while slots blur-swap 60ms apart. The chosen chip lifts onto a plate that stretches to it.',
  api:'day.go(l, r)   slots.forEach(at t0+i·.06, to(day))   chip.lift.set(1); plate.go(l, r)',
  init(st){
    const D = ['Today', 'Tomorrow', 'Sat'], SL = [['9:00', '11:30', '2:00', '4:30'], ['10:00', '12:00', '3:00'], ['9:30', '1:00']];
    const dys = $(st,'.dys'), slw = $(st,'.slts'), cf = $(st,'.cf'), we = $(st,'.we');
    const disc = document.createElement('i'); disc.style.cssText = 'position:absolute;top:0;bottom:0;left:0;border-radius:9px;background:var(--ink);opacity:0'; dys.appendChild(disc);
    const db = D.map((d, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = d; b.setAttribute('aria-pressed', i === 0);
      b.style.cssText = 'position:relative;height:32px;padding:0 12px;border-radius:8px;border:1px solid transparent;background:none;cursor:pointer;font-size:13px;font-weight:500;z-index:1'; dys.appendChild(b); return b; });
    const de = edges(0, 0), dop = new Track(0);
    const plate = document.createElement('i'); plate.style.cssText = 'position:absolute;left:0;top:0;border:1.5px solid var(--ink);border-radius:10px;pointer-events:none;opacity:0';
    slw.style.position = 'relative'; slw.appendChild(plate); const pe = edges(0, 0), pop = new Track(0);
    let day = 0, slot = -1, q = []; const sw = new Swap(-1);
    const chips = [];
    const draw = inst => { chips.forEach(c => c.remove()); chips.length = 0;
      SL[day].forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s; b.setAttribute('aria-pressed', 'false');
        b.style.cssText = 'min-width:64px;height:32px;padding:0 12px;border-radius:8px;border:1.5px solid var(--line);background:var(--card);cursor:pointer;font-size:13px;font-weight:500';
        slw.appendChild(b); chips.push(b);
        b.onclick = () => { slot = chips.indexOf(b); chips.forEach((x, j) => { x.setAttribute('aria-pressed', j === slot); if (j !== slot) x.style.transform = ''; });
          if (REDUCE){ pe.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); pop.jump(1); } else { pe.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); pop.set(1); }
          b.style.transform = 'translateY(-2px)'; cf.textContent = `${D[day]} at ${s} — ready in 15 min.`; }; });
      if (inst || REDUCE){ sw.cur = day; sw.prev = null; sw.t = -9; } };
    const layers = D.map(d => { const e2 = document.createElement('span'); return e2; });
    db.forEach((b, i) => b.onclick = () => { if (i === day) return; day = i; slot = -1; const t0 = now();
      if (REDUCE){ de.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); draw(true); pe.jump(0, 0); pop.jump(0); }
      else { de.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); dop.set(1); q = SL[day].map((_, k) => [t0 + k * .06, () => draw(k === SL[day].length - 1)]); }
      db.forEach((x, j) => { x.setAttribute('aria-pressed', j === day); x.style.color = mix(j === day ? 1 : 0, 'var(--card)', 'var(--ink)'); });
      cf.textContent = 'Pick a time ' + D[day].toLowerCase() + '.'; });
    we.onchange = () => { db[2].style.display = we.checked ? '' : 'none'; if (!we.checked && day === 2) db[0].click(); };
    const init = () => { const b = db[0]; de.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); dop.jump(1); draw(true); }; document.fonts.ready.then(init); init();
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const a = de.A.at(t), b = de.B.at(t), o = clamp(dop.at(t));
      disc.style.transform = `translateX(${px(a)})`; disc.style.width = px(b - a); disc.style.opacity = o.toFixed(3);
      db.forEach((x, j) => { if (document.activeElement !== x) x.style.color = mix(j === day ? clamp(dop.at(t)) : 0, 'var(--card)', 'var(--ink)'); });
      const c = pe.A.at(t), d = pe.B.at(t), p = clamp(pop.at(t));
      plate.style.transform = `translate(${px(c)},0)`; plate.style.width = px(d - c); plate.style.height = '32px'; plate.style.opacity = p.toFixed(3); };
  }});



atom({ id:'booking', cat:'Interactive', name:'Date and time picker', block:'booking', fam:['M','X'], tall:true,
  html:`<div class="card col" style="width:min(300px,90%);padding:14px;gap:10px"><div class="row" style="justify-content:space-between"><b class="small">October 2026</b><span class="small muted">Pick a day</span></div><div class="cal" style="position:relative;display:grid;grid-template-columns:repeat(7,1fr);gap:2px;font-size:12.5px;text-align:center"><i class="sel" style="position:absolute;left:0;top:0;border-radius:50%;background:var(--ink)"></i></div><div class="sl row" style="gap:6px;height:32px"></div></div>`,
  desc:'The selection disc glides between days on two axes. Time slots for the new day blur in 40ms apart after the old ones leave.',
  api:'disc.{x,y}.set(cell)   slot[i].swap.to(day, t + i·0.04)',
  init(st){
    const card = $(st,'.card'), cal = $(st,'.cal'), selEl = $(st,'.sel'), sl = $(st,'.sl'), head = $(card, '.row');
    'SMTWTFS'.split('').forEach(c => { const h = document.createElement('span'); h.textContent = c; h.style.cssText = 'color:var(--muted);padding:2px 0'; cal.appendChild(h); });
    for (let i = 0; i < 4; i++) cal.appendChild(document.createElement('span'));
    const days = []; for (let d = 1; d <= 31; d++){ const b = document.createElement('button'); b.textContent = d; const past = d < 3, wk = [0,6].includes((d + 3) % 7);
      b.disabled = past || wk; b.style.cssText = `position:relative;border:0;background:none;height:30px;border-radius:50%;cursor:${b.disabled ? 'default' : 'pointer'};color:${b.disabled ? 'var(--faint)' : 'var(--ink)'};font-size:12.5px`; cal.appendChild(b); days.push(b); }
    const slotsFor = d => [['9:00','11:30','14:00'],['10:00','13:00','16:30'],['9:30','12:00','15:00']][d % 3];
    const slots = [0,1,2].map(i => { const b = document.createElement('button'); b.className = 'btn small'; b.style.cssText += 'position:relative;flex:1;height:32px;padding:0'; sl.appendChild(b); const S2 = { b, sw:new Swap(-1), L:{}, on:new Track(0) }; return S2; });
    let sel = -1;
    slots.forEach((S2,i) => S2.b.onclick = () => { sel = i; slots.forEach(x => x.on.set(x === S2 ? 1 : 0)); cfBtn.disabled = false; });
    const pn = document.createElement('div'); pn.style.cssText = 'position:relative;height:300px;overflow:hidden';
    const p0 = document.createElement('div'); p0.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;gap:8px';
    const p1 = document.createElement('div'); p1.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center';
    p1.innerHTML = `<b style="color:var(--success)">✓ Booked</b><span class="small muted sum"></span><button class="btn ink ag" style="margin-top:4px">Book another</button>`;
    p0.appendChild(cal); p0.appendChild(sl);
    const cf = document.createElement('div'); cf.className = 'row'; cf.style.cssText = 'gap:8px;align-items:center'; cf.innerHTML = `<span class="small muted lb" style="flex:1">Pick a time</span>`;
    const cfBtn = document.createElement('button'); cfBtn.className = 'btn ink'; cfBtn.textContent = 'Confirm'; cfBtn.disabled = true; cf.appendChild(cfBtn); p0.appendChild(cf);
    pn.appendChild(p0); pn.appendChild(p1); card.appendChild(pn);
    const sum = $(p1,'.sum');
    const sw2 = new Swap(0);
    cfBtn.onclick = () => { if (sel < 0) return; sum.textContent = `Oct ${day} · ${slotsFor(day)[sel]}`; sw2.to(1); };
    $(p1,'.ag').onclick = () => sw2.to(0);
    const cust = document.createElement('div'); cust.className = 'row small muted'; cust.style.cssText += 'gap:6px;align-items:center'; cust.innerHTML = `<span>View:</span>`; card.appendChild(cust);
    [['Form',0],['Success',1]].forEach(([label,n]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'padding:2px 8px'; b.textContent = label; b.onclick = () => { if (n === 1 && sel < 0) return; sw2.to(n); }; cust.appendChild(b); });
    const x = new Track(0), y = new Track(0), o = new Track(0); let day = 0;
    const pick = (d, inst) => { day = d; sel = -1; cfBtn.disabled = true; $(cf,'.lb').textContent = `Oct ${d} · pick a time`; const b = days[d-1], k = inst ? 'jump' : 'set'; x[k](b.offsetLeft); y[k](b.offsetTop); o.set(1); const t0 = now();
      days.forEach((x2,j) => x2.style.color = x2.disabled ? 'var(--faint)' : j === d-1 ? 'var(--card)' : 'var(--ink)');
      slots.forEach((s,i) => { s.on.set(0); const v = slotsFor(d)[i]; if (!s.L[v]){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = v; s.b.appendChild(e); s.L[v] = e; } s.sw.to(v, t0 + i*.04); }); };
    days.forEach((b,i) => b.onclick = () => pick(i+1));
    slots.forEach((S2,i) => { const prev = S2.b.onclick; S2.b.onclick = () => { prev(); $(cf,'.lb').textContent = `Oct ${day} · ${slotsFor(day)[i]}`; }; });
    const init = () => pick(day || 7, true); document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => { const b = days[(day || 7)-1]; if (b && b.offsetWidth){ Object.assign(selEl.style, { width:px(b.offsetWidth), height:px(b.offsetHeight), transform:`translate(${px(x.at(t))},${px(y.at(t))})`, opacity:clamp(o.at(t)) }); }
      slots.forEach(s => { for (const k in s.L) s.sw.apply(s.L[k], k, t); const on = clamp(s.on.at(t)); s.b.style.background = mix(on,'var(--ink)','var(--card)'); s.b.style.color = mix(on,'var(--card)','var(--ink)'); });
      sw2.apply(p0, 0, t); sw2.apply(p1, 1, t); p0.style.pointerEvents = sw2.cur === 0 ? 'auto' : 'none'; p1.style.pointerEvents = sw2.cur === 1 ? 'auto' : 'none'; };
  }});
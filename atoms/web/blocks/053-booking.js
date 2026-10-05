

atom({ id:'booking', cat:'Interactive', name:'Date and time picker', block:'booking', fam:['M','X'], tall:true,
  html:`<div class="card col" style="width:min(300px,90%);padding:14px;gap:10px"><div class="row" style="justify-content:space-between"><b class="small">October 2026</b><span class="small muted">Pick a day</span></div><div class="cal" style="position:relative;display:grid;grid-template-columns:repeat(7,1fr);gap:2px;font-size:12.5px;text-align:center"><i class="sel" style="position:absolute;left:0;top:0;border-radius:50%;background:var(--ink)"></i></div><div class="sl row" style="gap:6px;height:32px"></div></div>`,
  desc:'The selection disc glides between days on two axes. Time slots for the new day blur in 40ms apart after the old ones leave.',
  api:'disc.{x,y}.set(cell)   slot[i].swap.to(day, t + i·0.04)',
  init(st){
    const cal = $(st,'.cal'), selEl = $(st,'.sel'), sl = $(st,'.sl');
    'SMTWTFS'.split('').forEach(c => { const h = document.createElement('span'); h.textContent = c; h.style.cssText = 'color:var(--faint);padding:2px 0'; cal.appendChild(h); });
    for (let i = 0; i < 4; i++) cal.appendChild(document.createElement('span'));
    const days = []; for (let d = 1; d <= 31; d++){ const b = document.createElement('button'); b.textContent = d; const past = d < 3, wk = [0,6].includes((d + 3) % 7);
      b.disabled = past || wk; b.style.cssText = `position:relative;border:0;background:none;height:30px;border-radius:50%;cursor:${b.disabled ? 'default' : 'pointer'};color:${b.disabled ? 'var(--faint)' : 'var(--ink)'};font-size:12.5px`; cal.appendChild(b); days.push(b); }
    const slotsFor = d => [['9:00','11:30','14:00'],['10:00','13:00','16:30'],['9:30','12:00','15:00']][d % 3];
    const slots = [0,1,2].map(i => { const b = document.createElement('button'); b.className = 'btn small'; b.style.cssText += 'position:relative;flex:1;height:32px;padding:0'; sl.appendChild(b); const S2 = { b, sw:new Swap(-1), L:{}, on:new Track(0) }; b.onclick = () => slots.forEach(x => x.on.set(x === S2 ? 1 : 0)); return S2; });
    const x = new Track(0), y = new Track(0), o = new Track(0); let day = 0;
    const pick = (d, inst) => { day = d; const b = days[d-1], k = inst ? 'jump' : 'set'; x[k](b.offsetLeft); y[k](b.offsetTop); o.set(1); const t0 = now();
      days.forEach((x2,j) => x2.style.color = x2.disabled ? 'var(--faint)' : j === d-1 ? 'var(--card)' : 'var(--ink)');
      slots.forEach((s,i) => { s.on.set(0); const v = slotsFor(d)[i]; if (!s.L[v]){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = v; s.b.appendChild(e); s.L[v] = e; } s.sw.to(v, t0 + i*.04); }); };
    days.forEach((b,i) => b.onclick = () => pick(i+1));
    const init = () => pick(day || 7, true); document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => { const b = days[(day || 7)-1]; Object.assign(selEl.style, { width:px(b.offsetWidth), height:px(b.offsetHeight), transform:`translate(${px(x.at(t))},${px(y.at(t))})`, opacity:clamp(o.at(t)) });
      slots.forEach(s => { for (const k in s.L) s.sw.apply(s.L[k], k, t); const on = clamp(s.on.at(t)); s.b.style.background = mix(on,'var(--ink)','var(--card)'); s.b.style.color = mix(on,'var(--card)','var(--ink)'); }); };
  }});
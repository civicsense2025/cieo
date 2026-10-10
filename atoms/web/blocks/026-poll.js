

/* ---------- Interactive ---------- */
atom({ id:'poll', cat:'Interactive', name:'Poll', block:'poll', fam:['M','S'], tall:true,
  html:`<div class="col pl" style="width:min(340px,88%);gap:8px"><b style="margin-bottom:4px">Which block should ship next?</b></div><button class="btn rs" style="position:absolute;top:10px;right:12px">Reset</button>`,
  desc:'Each option morphs in place into its result bar. Fills stagger, percentages count up and the chosen row keeps a check.',
  api:'opt[i].fill.set(pct[i], S.base, t + i*0.05)',
  init(st){
    const pl = $(st,'.pl'), O = [['Booking calendar',38],['Course player',27],['Job board',21],['Map directory',14]];
    const rows = O.map(([n]) => { const b = document.createElement('button'); b.style.cssText = 'position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;border:0;background:var(--card);border-radius:10px;padding:10px 12px;cursor:pointer;text-align:left';
      b.innerHTML = `<i style="position:absolute;left:0;top:0;bottom:0;background:var(--raised)"></i><span style="position:relative;display:flex;gap:8px;align-items:center"><svg class="ck" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg><span></span></span><span class="num small" style="position:relative"></span>`;
      $$(b,'span')[1].textContent = n; pl.appendChild(b); return { b, fill:$(b,'i'), ck:$(b,'.ck'), pct:$$(b,'span')[2], v:new Track(0), o:new Track(0), c:new Track(0) }; });
    let voted = -1;
    rows.forEach((r,i) => r.b.onclick = () => { if (voted >= 0) return; voted = i; const t0 = now();
      rows.forEach((x,j) => { const pc = O[j][1] + (j === i ? 1 : 0); x.v.set(pc, S.base, t0 + j*.05); x.o.set(1, S.base, t0 + EXIT + j*.05); x.c.set(j === i ? 1 : 0); x.b.style.cursor = 'default'; }); });
    $(st,'.rs').onclick = () => { voted = -1; rows.forEach(x => { x.v.set(0); x.o.set(0, S.snap); x.c.set(0); x.b.style.cursor = 'pointer'; }); };
    return t => rows.forEach(r => { const v = r.v.at(t), c = clamp(r.c.at(t)); r.fill.style.width = clamp(v/100)*100 + '%';
      r.pct.textContent = Math.round(v) + '%'; fade(r.pct, r.o.at(t), 0);
      r.ck.style.width = px(14*c); r.ck.style.opacity = c; r.b.style.borderColor = mix(c,'var(--ink)','var(--line)'); });
  }});
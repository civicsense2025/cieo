
atom({ id:'livepoll', cat:'Forms', name:'Live poll', block:'poll, vote', fam:['M','S'], tall:true,
  html:`<div class="col pl" style="width:min(360px,calc(100% - 24px));margin:0 auto;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45;margin-bottom:2px">Which block should ship next?</b><div class="cap small muted num" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums">Tap to vote · 0 of 128 in</div><div class="row ct" style="gap:8px;align-items:center"><button class="btn rs" style="min-height:32px">Reset</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="ch"> let me change my vote</label></div></div><div class="hint">Options morph into result bars</div>`,
  desc:'A vote morphs each option into its result bar with stagger. Percentages roll up together, and the chosen row keeps its check. It ends counted and settled.',
  api:'opt[i].fill.set(pct, S.base, t + i·.06)   pct[i].n.set(votes)   end: counted, hold',
  init(st){
    const pl = $(st,'.pl'), cap = $(st,'.cap'), ch = $(st,'.ch');
    const O = [['Booking calendar',38],['Course player',27],['Job board',21]];
    const head = $(st,'b');
    const rows = O.map(([n]) => { const b = document.createElement('button');
      b.style.cssText = 'position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;min-height:40px;border:1px solid var(--line);background:var(--card);border-radius:10px;padding:10px 12px;cursor:pointer;text-align:left;font-size:14px;line-height:1.5';
      b.innerHTML = `<i style="position:absolute;left:0;top:0;bottom:0;width:0;background:var(--raised)"></i><span style="position:relative;display:flex;gap:8px;align-items:center"><svg class="ck" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:0;opacity:0"><path d="M5 12.5 10 17.5 19 7"/></svg><span></span></span><span class="pc num small" style="position:relative;font-size:12px;font-variant-numeric:tabular-nums"></span>`;
      $$(b,'span')[1].textContent = n; pl.insertBefore(b, $(pl,'.ct')); return { b, fill:$(b,'i'), ck:$(b,'.ck'), pc:$(b,'.pc'), v:new Track(0), o:new Track(0), c:new Track(0) }; });
    let voted = -1, total = 0;
    const paint = () => cap.textContent = voted < 0 ? `Tap to vote · ${total} of 128 in` : `Vote counted · ${total} of 128 in · settled`;
    rows.forEach((r,i) => r.b.onclick = () => { if (voted >= 0 && !ch.checked) return;
      voted = i; total++; const t0 = now();
      rows.forEach((x,j) => { const pc = O[j][1] + (j === i ? 2 : 0);
        if (REDUCE){ x.v.jump(pc); x.o.jump(1); x.c.jump(j === i ? 1 : 0); }
        else { x.v.set(pc, S.base, t0 + j*.06); x.o.set(1, S.base, t0 + EXIT + j*.06); x.c.set(j === i ? 1 : 0, S.base, t0); }
        x.b.style.cursor = ch.checked ? 'pointer' : 'default'; });
      paint(); });
    $(st,'.rs').onclick = () => { voted = -1; rows.forEach(x => { x.v.set(0, S.snap); x.o.set(0, S.snap); x.c.set(0, S.snap); x.b.style.cursor = 'pointer'; }); paint(); };
    paint();
    return t => rows.forEach(r => { const v = r.v.at(t), c = clamp(r.c.at(t));
      r.fill.style.width = clamp(v/100)*100 + '%';
      r.pc.textContent = Math.round(v) + '%'; fade(r.pc, Math.max(r.o.at(t), v > .5 ? 1 : 0), 0);
      r.ck.style.width = px(14*c); r.ck.style.opacity = c.toFixed(3);
      r.b.style.borderColor = mix(c,'var(--ink)','var(--line)'); });
  }});



atom({ id:'pollblock', cat:'Newsletter', name:'Reader poll', block:'newsletter, poll', fam:['M','S'],
  html:`<div class="card col" style="width:min(360px,92%);padding:16px;gap:8px;line-height:1.55"><b style="font-size:15px;font-weight:600;line-height:1.5">What should we cover next?</b><span class="muted" style="font-size:12.5px;line-height:1.5">One vote. Results hold.</span><div class="pl col" style="gap:8px;margin-top:4px"></div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="pc" checked> show percents</label></div><button class="btn rs" style="position:absolute;top:10px;right:12px;min-height:36px;border-radius:9px">Reset</button>`,
  desc:'A vote morphs each option into its result bar with a 50ms stagger. Percents ride the lazy spring and the chosen row keeps its check.',
  api:'opt[i].fill.set(pct, S.base, t0 + i*.05) · pct rides S.lazy · check on chosen',
  init(st){
    const pl = $(st,'.pl'), pc = $(st,'.pc');
    const O = [['Rivers & routes',46],['Winter kitchens',31],['Maps we kept',23]];
    const rows = O.map(([n]) => { const b = document.createElement('button');
      b.style.cssText = 'position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--card);border-radius:10px;padding:0 13px;min-height:44px;cursor:pointer;text-align:left;font-size:13.5px;line-height:1.5;color:var(--ink)';
      b.innerHTML = `<i style="position:absolute;left:0;top:0;bottom:0;background:var(--raised)"></i><span style="position:relative;display:flex;gap:8px;align-items:center"><span class="ck" style="display:grid;place-items:center;padding:0;width:16px;transform:translateY(.5px)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg></span><span></span></span><span class="num small" style="position:relative;font-variant-numeric:tabular-nums;font-size:12.5px"></span>`;
      $$(b,'span')[2].textContent = n; pl.appendChild(b);
      return { b, fill:$(b,'i'), ck:$(b,'.ck'), pct:$$(b,'span')[3], v:new Track(0, S.lazy), o:new Track(0), c:new Track(0) }; });
    let voted = -1;
    rows.forEach((r,i) => r.b.onclick = () => { if (voted >= 0) return; voted = i; const t0 = now();
      rows.forEach((x,j) => { const p = O[j][1] + (j === i ? 2 : -1);
        if (REDUCE){ x.v.jump(p); x.o.jump(1); x.c.jump(j === i ? 1 : 0); }
        else { x.v.set(p, S.base, t0 + j*.05); x.o.set(1, S.base, t0 + EXIT + j*.05); x.c.set(j === i ? 1 : 0); }
        x.b.style.cursor = 'default'; }); });
    $(st,'.rs').onclick = () => { voted = -1; rows.forEach(x => { x.v.set(0); x.o.set(0, S.snap); x.c.set(0); x.b.style.cursor = 'pointer'; }); };
    return t => rows.forEach(r => { const v = r.v.at(t), c = clamp(r.c.at(t));
      r.fill.style.width = (clamp(v/100)*100).toFixed(1) + '%';
      r.pct.textContent = Math.round(v) + '%'; r.pct.style.display = pc.checked ? '' : 'none';
      fade(r.pct, r.o.at(t), 0); r.ck.style.opacity = c.toFixed(3); r.ck.style.width = px(16*c);
      r.b.style.borderColor = mix(c,'var(--ink)','var(--line)'); });
  }});

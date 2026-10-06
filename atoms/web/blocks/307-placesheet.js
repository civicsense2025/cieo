atom({ id:'placesheet', cat:'Maps', name:'Place card sheet', block:'map sheet, place card', fam:['M','X'], wide:true,
  html:`<div class="mp card" style="position:relative;width:min(560px,94%);height:250px;overflow:hidden">${mapBg}<div class="sht card" style="position:absolute;left:12px;right:12px;bottom:12px;padding:14px 16px;cursor:grab;touch-action:none"><div class="grp" style="width:36px;height:4px;border-radius:2px;background:var(--line);margin:0 auto 8px"></div><div class="row" style="display:flex;gap:12px;align-items:center"><div class="ph" style="position:relative;flex:none;width:64px;height:64px;border-radius:10px;overflow:hidden;background:var(--raised)"></div><div style="flex:1;min-width:0"><p style="font-size:15px;font-weight:600;line-height:1.5;margin:0">Ferry Building</p><p style="font-size:13px;line-height:1.5;margin:2px 0 0;color:var(--muted)">Marketplace · 0.3 mi away</p><p class="rt" style="font-size:12.5px;line-height:1.5;margin:2px 0 0;color:var(--muted);font-variant-numeric:tabular-nums"><b class="dg" style="color:var(--ink)"></b> · 2,140 reviews</p></div><button class="btn ink go" style="height:32px;border-radius:9px;flex:none">Go</button></div><p class="ex" style="font-size:13px;line-height:1.55;margin:8px 0 0;overflow:hidden">Farmers market Saturdays, ferry terminal, bay views from the deck.</p></div></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;width:min(560px,94%);padding:6px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Drag the sheet · map stays live</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="true">Photos on</button></div><div class="hint">Drag the card up or down</div>`,
  desc:'The sheet drags through peek, half and full and settles on the nearest stop on a soft spring. Photos cross-fade while the rating rolls its digits. The map never moves.',
  api:'sheet.y drag + release(soft) to detent   photo.to(i) swap   rate.digits.set(48)',
  init(st){
    const sht = $(st,'.sht'), ph = $(st,'.ph'), ex = $(st,'.ex'), tg = $(st,'.pg-tg');
    const y = new Track(0); let det = 0, showPh = true; const DET = [118, 62, 0];
    const cols = [['#c9d8e8','#7d9cbd'],['#e5d3b3','#a07f4a']];
    const L = cols.map((c,i) => { const e = document.createElement('div'); e.className = 'layer'; e.style.background = `linear-gradient(135deg,${c[0]},${c[1]})`; if (i) e.innerHTML = '<span style="font-size:12.5px;color:#fff;opacity:.9">interior</span>'; ph.appendChild(e); return e; });
    const sw = new Swap(0), dg = new Digits($(st,'.dg'), 2); dg.set('48', true);
    const goDet = d => { det = d; sw.to(d === 2 ? 1 : 0); y.set(DET[d], S.soft); };
    tg.onclick = () => { showPh = !showPh; tg.textContent = showPh ? 'Photos on' : 'Photos off'; tg.setAttribute('aria-pressed', showPh); ph.style.display = showPh ? '' : 'none'; };
    let sy = 0;
    sht.addEventListener('pointerdown', e => { sy = e.clientY - y.target; sht.setPointerCapture(e.pointerId); });
    sht.addEventListener('pointermove', e => { if (e.buttons) y.jump(Math.min(DET[0], Math.max(DET[2], e.clientY - sy))); });
    sht.addEventListener('pointerup', () => { let b = 0; DET.forEach((v,i) => { if (Math.abs(y.target - v) < Math.abs(y.target - DET[b])) b = i; }); REDUCE ? y.jump(DET[b]) : goDet(b); if (!REDUCE && b !== det) { det = b; sw.to(b === 2 ? 1 : 0); } else det = b; });
    $(st,'.go').onclick = () => goDet(2);
    return t => { const v = y.at(t); sht.style.transform = `translateY(${v.toFixed(2)}px)`;
      const p = 1 - v/DET[0]; ex.style.opacity = clamp((p-.25)/.5).toFixed(3); ex.style.maxHeight = (p > .3 ? 60 : 0) + 'px';
      L.forEach((e,k) => sw.apply(e,k,t)); dg.render(t); };
  }});

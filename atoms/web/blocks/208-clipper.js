atom({ id:'clipper', cat:'Writing', name:'Clip drop target', block:'clipper, drop target, saved preview', fam:['D','M'], tall:true,
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(320px,90%);gap:12px;align-items:stretch;padding:12px"><div class="card col tg" style="padding:16px;gap:8px;border:2px dashed var(--line)"><b style="font-size:14px">Drop here to save</b><span class="small muted">Drag the quote chip onto this card</span><div class="pv" style="overflow:hidden;height:0"><div class="pic" style="height:96px;border-radius:10px;background:linear-gradient(135deg,var(--accent-tint),var(--line))"></div><div class="tt small" style="position:relative;height:20px;margin-top:8px"></div></div></div><div class="row" style="gap:8px;align-items:center"><span class="chip small" style="border:1px solid var(--line);border-radius:999px;padding:8px 14px;cursor:grab;touch-action:none">“Write what you notice.”</span><button class="btn rs" style="margin-left:auto">Reset</button></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Tint on hover</span></label><div class="hint">Drag the chip onto the card</div>`,
  desc:'Dragging over the card warms its tint. Dropping grows the saved preview down from nothing. The cover starts soft and sharpens, then the title trades places with a saved line and its check.',
  api:'tint.set(1, snap) on snap   h.set(H, base) on drop   sharp.set(1, lazy); title.to(saved)   reset: all.set(0)',
  init(st){
    const card = $(st,'.tg'), chip = $(st,'.chip'), pv = $(st,'.pv'), pic = $(st,'.pic'), tt = $(st,'.tt');
    const L = ['A note on attention','Saved · check'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = (s === 'Saved · check' ? '✓ ' : '') + s; tt.appendChild(e); return e; });
    const tint = new Track(0), h = new Track(0), sharp = new Track(0), sw = new Swap(0); let H = 150, saved = false;
    const measure = () => { pv.style.height = 'auto'; H = pv.scrollHeight || 150; if (!saved) pv.style.height = '0px'; }; measure();
    const drop = () => { if (saved) return; saved = true; const t0 = now();
      tint.set(1, S.snap); h.set(H, S.base, t0); sharp.set(1, S.lazy, t0 + .25); sw.to(1, t0 + .25); };
    drag(chip, { move: p => { const r = card.getBoundingClientRect(), c = chip.getBoundingClientRect();
        const over = c.left + c.width/2 > r.left && c.left + c.width/2 < r.right && c.top > r.top - 60 && c.top < r.bottom;
        tint.set(over ? 1 : 0, S.snap); },
      up: (p, v) => { const r = card.getBoundingClientRect();
        if (p.cx > r.left && p.cx < r.right && p.cy > r.top - 40 && p.cy < r.bottom + 40) drop(); else tint.set(0, S.snap); } });
    chip.addEventListener('click', drop);
    $(st,'.rs').onclick = () => { saved = false; tint.set(0); h.set(0); sharp.set(0); sw.to(0); };
    return t => { const o = clamp(tint.at(t)), s = clamp(sharp.at(t));
      card.style.background = mix(o,'var(--accent-tint)','var(--card)'); card.style.borderColor = mix(o,'var(--accent)','var(--line)');
      pv.style.height = px(Math.max(0, h.at(t)));
      pic.style.filter = s > .98 ? 'none' : `blur(${((1-s)*6).toFixed(2)}px)`; pic.style.opacity = (.4+.6*Math.max(o, s)).toFixed(3);
      L.forEach((e,k) => sw.apply(e,k,t)); };
  }});

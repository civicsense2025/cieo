

atom({ id:'shortcutsheet', cat:'Guidance', name:'Shortcut sheet', block:'shortcuts, hotkeys', fam:['X','M','S'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="ui card" style="position:relative;width:min(320px,94%);padding:14px 16px;min-height:250px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.5">Editor</b><div class="small muted" style="line-height:1.5">Hold the button to peek at shortcuts.</div><button class="btn ink hold" style="min-height:32px;padding:6px 14px;margin-top:10px;touch-action:none">Hold for shortcuts</button><div class="sh" style="position:absolute;left:12px;right:12px;bottom:12px;background:var(--card);border:0;border-radius:10px;box-shadow:var(--shadow);padding:12px 14px;visibility:hidden;text-align:left"><div class="row" style="justify-content:space-between"><b style="font-size:13px;line-height:1.5">Shortcuts</b><span class="cap" style="font-size:12px;color:var(--muted);line-height:1.5">release to close</span></div><div class="kg" style="position:relative;min-height:108px;margin-top:8px"></div></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Keys:</span></div></div><div class="hint">Hold to open · tap a keycap · release to close</div>`,
  desc:'Holding springs the sheet up; each keycap snaps down under the pointer and the grid swaps by category. Letting go snaps shut instantly — the resting state is the terminal.',
  api:'hold: sheet.o.set(1, base)   key: k.set(1, snap)   cat.to(n)   release: o.set(0, snap) · REDUCE: jump',
  init(st){
    const kg = $(st,'.kg'), sh = $(st,'.sh'), hold = $(st,'.hold'), tw = $(st,'.tw');
    const CATS = [[['⌘K','Command menu'],['⌘S','Save draft'],['⌘⏎','Publish']],[['⌘Z','Undo'],['⇧⌘Z','Redo'],['⌘D','Duplicate']]];
    const NAMES = ['General','Edit'];
    const L = CATS.map(rows => { const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += 'flex-direction:column;gap:6px;align-items:stretch;white-space:normal';
      rows.forEach(([k,d]) => { const r = document.createElement('button'); r.className = 'key'; r.style.cssText = 'display:flex;align-items:center;gap:10px;border:0;background:none;padding:2px 0;cursor:pointer;text-align:left;min-height:32px';
        r.innerHTML = `<kbd style="min-width:30px;min-height:28px;display:inline-grid;place-items:center;border:0;border-radius:7px;background:var(--raised);font-size:12px;padding:0 6px;font-family:inherit">${k}</kbd><span style="font-size:13px;line-height:1.5">${d}</span>`; e.appendChild(r); });
      kg.appendChild(e); return e; });
    const o = new Track(0), cat = new Swap(0); let cur = 0;
    const keys = L.map((e,ci) => [...e.querySelectorAll('.key')].map(k => { const s = new Track(0);
      k.addEventListener('pointerdown', ev => { ev.stopPropagation(); REDUCE ? s.jump(1) : s.set(1, S.snap); });
      ['pointerup','pointerleave','pointercancel'].forEach(ev => k.addEventListener(ev, () => REDUCE ? s.jump(0) : s.set(0, S.snap)));
      k.onclick = ev => ev.stopPropagation(); return { k, s }; }));
    L.forEach((e,ci) => { if (ci !== cur){ e.style.opacity = 0; e.style.visibility = 'hidden'; } });
    const open = () => REDUCE ? o.jump(1) : o.set(1, S.base);
    const shut = () => REDUCE ? o.jump(0) : o.set(0, S.snap);
    hold.addEventListener('pointerdown', e => { e.preventDefault(); hold.setPointerCapture && e.pointerId !== undefined && hold.setPointerCapture(e.pointerId); open(); });
    ['pointerup','pointercancel','lostpointercapture'].forEach(ev => hold.addEventListener(ev, shut));
    hold.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') open(); });
    hold.addEventListener('keyup', shut);
    NAMES.forEach((n,ci) => { const b = document.createElement('button'); b.className = 'btn' + (ci === 0 ? ' ink' : ''); b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = n; b.setAttribute('aria-pressed', ci === 0);
      b.onclick = () => { cur = ci; REDUCE ? (cat.cur = ci, cat.prev = null, cat.t = -9) : cat.to(ci); $$(tw,'.btn').forEach((x,j) => { x.classList.toggle('ink', j === ci); x.setAttribute('aria-pressed', j === ci); }); }; tw.appendChild(b); });
    return t => { pop(sh, o.at(t), 8); L.forEach((el,k) => cat.apply(el,k,t));
      keys.forEach(ks => ks.forEach(({k,s}) => { const p = clamp(s.at(t)); k.querySelector('kbd').style.transform = `translateY(${(p*2).toFixed(2)}px) scale(${(1 - .06*p).toFixed(3)})`; })); };
  }});

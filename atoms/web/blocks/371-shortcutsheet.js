

atom({ id:'shortcutsheet', cat:'Guidance', name:'Shortcut sheet', block:'shortcuts, hotkeys', fam:['X','M','S'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="ui card" style="position:relative;width:min(320px,94%);padding:14px 16px;min-height:280px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.5">Editor</b><div class="small muted" style="line-height:1.5">Hold the button to peek at shortcuts.</div><button class="btn ink hold" aria-describedby="sc-hint" style="position:relative;overflow:hidden;min-height:32px;padding:6px 14px;margin-top:10px;touch-action:none">Hold for shortcuts<i class="hp" aria-hidden="true" style="position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--accent);transform:scaleX(0);transform-origin:0 50%"></i></button><div class="shk" style="position:absolute;left:12px;right:12px;bottom:12px;background:var(--card);border:0;border-radius:10px;box-shadow:var(--shadow);padding:12px 14px;visibility:hidden;text-align:left"><div class="row" style="justify-content:space-between"><b style="font-size:13px;line-height:1.5">Shortcuts</b><span class="cap" aria-live="polite" style="font-size:12px;color:var(--muted);line-height:1.5">release to close</span></div><div class="kg" style="position:relative;min-height:108px;margin-top:8px"></div></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Keys:</span></div></div><div class="hint" id="sc-hint">Hold to peek, or tap to pin · tap a keycap to select it</div>`,
  desc:'Pressing fills a bar under the button. Held for half a second, the sheet springs up; each keycap snaps down under the pointer and its shortcut replaces the caption, and the grid swaps by category. Letting go snaps shut. A quick tap pins the sheet open until the next tap or Escape.',
  api:'hold: sheet.o.set(1, base)   key: k.set(1, snap)   cat.to(n)   release: o.set(0, snap) · REDUCE: jump',
  init(st){
    const kg = $(st,'.kg'), sh = $(st,'.shk'), hold = $(st,'.hold'), hp = $(st,'.hp'), cap = $(st,'.cap'), tw = $(st,'.tw');
    const PEEK = .5; // seconds a press must last before the sheet opens while held
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
      k.onclick = ev => { ev.stopPropagation(); cap.textContent = k.querySelector('kbd').textContent + ' · ' + k.querySelector('span').textContent; }; return { k, s }; }));
    L.forEach((e,ci) => { if (ci !== cur){ e.style.opacity = 0; e.style.visibility = 'hidden'; } });
    const open = () => REDUCE ? o.jump(1) : o.set(1, S.base);
    const shut = () => { cap.textContent = 'release to close'; REDUCE ? o.jump(0) : o.set(0, S.snap); };
    // press state: a press that lasts PEEK opens the sheet while held (progress bar fills first);
    // a shorter tap pins the sheet open until the next tap, Escape, or Enter/Space on the button
    let down = false, peeking = false, pinned = false, hs = 0;
    const pin = on => { pinned = on; if (on){ cap.textContent = 'tap to close'; open(); } else shut(); };
    hold.addEventListener('pointerdown', e => { if (e.button) return; e.preventDefault(); down = true; peeking = false; hs = now(); });
    const release = () => { if (!down) return; down = false; if (peeking){ peeking = false; pinned = false; shut(); } else pin(!pinned); };
    addEventListener('pointerup', release); addEventListener('pointercancel', release);
    hold.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat){ e.preventDefault(); pin(!pinned); } });
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && pinned){ e.stopPropagation(); pin(false); hold.focus(); } });
    NAMES.forEach((n,ci) => { const b = document.createElement('button'); b.className = 'btn' + (ci === 0 ? ' ink' : ''); b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = n; b.setAttribute('aria-pressed', ci === 0);
      b.onclick = () => { cur = ci; REDUCE ? (cat.cur = ci, cat.prev = null, cat.t = -9) : cat.to(ci); $$(tw,'.btn').forEach((x,j) => { x.classList.toggle('ink', j === ci); x.setAttribute('aria-pressed', j === ci); }); }; tw.appendChild(b); });
    return t => {
      const pr = down ? clamp((t - hs) / PEEK) : 0;
      hp.style.transform = `scaleX(${pr.toFixed(3)})`;
      if (down && !peeking && pr >= 1){ peeking = true; cap.textContent = 'release to close'; open(); }
      pop(sh, o.at(t), 8); L.forEach((el,k) => cat.apply(el,k,t));
      keys.forEach(ks => ks.forEach(({k,s}) => { const p = clamp(s.at(t)); k.querySelector('kbd').style.transform = `translateY(${(p*2).toFixed(2)}px) scale(${(1 - .06*p).toFixed(3)})`; })); };
  }});

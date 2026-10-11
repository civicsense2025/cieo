atom({ id:'delivnotes', cat:'Commerce', name:'Delivery instructions', block:'checkout, notes, form', fam:['M','S'],
  html:`<div class="card col" style="width:min(300px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Delivery</b><button class="lk" style="border:0;background:none;color:var(--accent);cursor:pointer;font-size:13px;line-height:1.5;text-align:left;padding:0">Add instructions</button><div class="fd" style="overflow:hidden;max-height:0"><textarea class="ta" rows="3" maxlength="120" placeholder="Gate code, drop spot…" aria-label="Delivery instructions" style="width:100%;box-sizing:border-box;border:1.5px solid var(--muted);border-radius:9px;padding:8px 10px;font-size:13px;line-height:1.5;resize:none"></textarea><div class="row" style="justify-content:space-between;align-items:center"><span class="ct num small muted" style="font-size:12.5px;font-variant-numeric:tabular-nums"></span><button class="sv" style="height:38px;padding:0 14px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer">Save</button></div></div><span class="chp" style="display:none;align-items:center;gap:8px;align-self:flex-start;max-width:100%"></span><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="ld"> “Leave at door” shortcut</label></div><div class="hint">Add a note, watch the count</div>`,
  desc:'The link opens the textarea on the base height spring while the counter warns past 90%. Save swaps to a compact chip with Edit; saving empty leaves zero trace.',
  api:'open.set(1); warn = n>108   save: chip.to(1) or collapse silent',
  init(st){
    const fd = $(st,'.fd'), ta = $(st,'.ta'), ct = $(st,'.ct'), chp = $(st,'.chp'), lk = $(st,'.lk');
    const open = new Track(0), chip = new Swap(0); let saved = '';
    const paint = () => { const n = ta.value.length; ct.textContent = n + '/120';
      ct.style.color = n > 108 ? 'var(--danger)' : ''; };
    ta.oninput = paint; paint();
    lk.onclick = () => { open.set(1); chip.to(0); chp.style.display = 'none'; setTimeout(() => ta.focus(), 200); };
    $(st,'.sv').onclick = () => { saved = ta.value.trim(); open.set(0);
      if (!saved){ chip.to(0); chp.style.display = 'none'; return; }
      chp.style.display = 'inline-flex'; chp.innerHTML = `<span style="display:inline-block;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:1.5;background:var(--raised);border-radius:15px;padding:6px 8px 6px 12px"></span><button class="ed" style="border:0;background:none;color:var(--accent);cursor:pointer;font-size:13px">Edit</button>`;
      chp.querySelector('span').textContent = saved;
      chp.querySelector('.ed').onclick = () => { open.set(1); chip.to(0); chp.style.display = 'none'; setTimeout(() => ta.focus(), 200); };
      chip.to(1); };
    $(st,'.ld').onchange = e => { if (e.target.checked && !ta.value) { ta.value = 'Leave at door. '; paint(); } };
    return t => { const p = clamp(open.at(t)); fd.style.maxHeight = (p*190).toFixed(0) + 'px'; fd.style.opacity = p.toFixed(3);
      lk.style.display = p > .5 || chip.target === 1 ? 'none' : 'block'; };
  }});

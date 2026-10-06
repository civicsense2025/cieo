
atom({ id:'snoozesheet', cat:'Email', name:'Snooze sheet', block:'email, snooze, sheet', fam:['X','S','M'],
  html:`<div class="col" style="gap:8px;width:min(300px,92%)"><div class="card" style="padding:14px 16px;line-height:1.5;position:relative;overflow:hidden"><div class="erow" style="display:flex;gap:10px;align-items:center;min-height:52px;overflow:hidden"><span style="width:34px;height:34px;flex:none;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:12px;font-weight:600;padding:0;transform:translateY(.5px)">AC</span><span class="etx" style="position:relative;flex:1;min-height:22px"></span></div><div class="row" style="gap:8px;margin-top:8px"><button class="btn snz" style="min-height:32px">Snooze</button></div><div class="sheet" style="position:absolute;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:14px 16px"></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" checked> remind with sound</label></div><div class="hint">Snooze, then pick a time</div>`,
  desc:'The sheet rises on base and time chips stagger in every 40ms. Picking one collapses the top row, which returns on soft as a snoozed terminal.',
  api:'sheet.set(1, base); chips stagger .04   rh.set(0, base) then (58, soft)   end: snoozed, hold',
  init(st){
    const sheet = $(st,'.sheet'), etx = $(st,'.etx'), erow = $(st,'.erow'), btn = $(st,'.snz');
    const subj = ['Invoice #2041 due Friday', 'Snoozed until Tomorrow, 8:00 AM'].map((s, k) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.fontSize = '13.5px'; e.style.fontWeight = '600'; e.textContent = s; if (k) e.style.color = 'var(--success)'; etx.appendChild(e); return e; });
    const times = ['Tonight', 'Tomorrow', 'This weekend', 'Next week'];
    const chips = times.map(s => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'min-height:32px;margin:0 6px 6px 0;font-size:13px'; b.textContent = s; sheet.appendChild(b); return b; });
    const sh = new Track(0), ce = chips.map(() => new Track(0)), rh = new Track(58), sw = new Swap(0);
    let open = false;
    const show = v => { open = v; const t = now(); sh.set(v ? 1 : 0, v ? S.base : S.snap, t); if (v) chips.forEach((c, i) => { ce[i].jump(0); ce[i].set(1, S.base, t + .08 + i*.04); }); };
    btn.onclick = () => show(!open);
    chips.forEach((c, i) => c.onclick = () => { const t = now(); show(false); rh.set(0, S.base, t); rh.set(58, S.soft, t + .22); sw.to(1, t + .22); btn.textContent = 'Snoozed'; btn.disabled = true; });
    return t => { const p = clamp(sh.at(t));
      sheet.style.opacity = p.toFixed(3); sheet.style.visibility = p < .02 ? 'hidden' : 'visible';
      sheet.style.transform = `translateY(${((1-p)*16).toFixed(2)}px)`;
      chips.forEach((c, i) => { const q = clamp(ce[i].at(t)); c.style.opacity = (.45 + .55*q).toFixed(3); c.style.transform = `translateY(${((1-q)*8).toFixed(2)}px)`; });
      erow.style.height = px(Math.max(0, rh.at(t))); erow.style.minHeight = '0px';
      subj.forEach((e, k) => sw.apply(e, k, t)); };
  }});

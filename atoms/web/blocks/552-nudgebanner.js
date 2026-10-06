
atom({ id:'nudgebanner', cat:'Email', name:'Follow-up nudge', block:'email, nudge, reminder', fam:['X','S'],
  html:`<div class="col" style="gap:8px;width:min(300px,92%)"><div class="card" style="padding:14px 16px;line-height:1.5;position:relative;overflow:hidden"><div class="bn" style="display:flex;gap:8px;align-items:center;background:var(--warning-tint);border-radius:10px;padding:8px 10px"><span style="width:22px;height:22px;flex:none;border-radius:50%;background:var(--warning);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:700;padding:0;transform:translateY(.5px)">!</span><span style="font-size:12.5px;line-height:1.45">No reply in 3 days — the thread is stalling.</span></div><div class="th"></div><div class="row" style="gap:8px;margin-top:8px"><button class="btn ink rem" style="min-height:32px">Check for replies</button><span class="rs num" style="position:relative;flex:1;min-height:20px;font-size:12.5px"></span></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" checked> nudge after 3 days</label></div><div class="hint">Check, then set a reminder</div>`,
  desc:'The no-reply warning drops in and pushes the thread down on base. Setting a reminder swaps a spinner into a success check terminal.',
  api:'ban.set(1, base); thread rides same track   rs.to(spinner) -> (check, base)   end: reminded',
  init(st){
    const th = $(st,'.th'), bn = $(st,'.bn'), btn = $(st,'.rem'), rs = $(st,'.rs');
    [['MQ','Maya · pricing draft','Tue 9:12 AM'],['JK','Jon · +1, send it','Tue 9:40 AM']].forEach((r, i) => {
      const d = document.createElement('div');
      d.style.cssText = 'display:flex;align-items:center;gap:10px;min-height:52px' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      const av = document.createElement('span');
      av.style.cssText = 'width:34px;height:34px;flex:none;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:12px;font-weight:600;padding:0;transform:translateY(.5px)';
      av.textContent = r[0];
      const tx = document.createElement('span'); tx.style.cssText = 'display:flex;flex-direction:column;flex:1;line-height:1.5';
      const b = document.createElement('b'); b.style.cssText = 'font-size:13.5px;font-weight:600'; b.textContent = r[1];
      const s = document.createElement('span'); s.className = 'small muted'; s.style.fontSize = '12px'; s.textContent = r[2];
      tx.appendChild(b); tx.appendChild(s); d.appendChild(av); d.appendChild(tx); th.appendChild(d);
    });
    const rl = [' ', 'Setting reminder…', 'Reminder set'].map((s, k) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.fontSize = '12.5px'; e.textContent = s; if (k === 2){ e.style.color = 'var(--success)'; e.style.fontWeight = '600'; } rs.appendChild(e); return e; });
    const ban = new Track(0), sw = new Swap(0);
    let phase = 0;
    btn.onclick = () => { const t = now();
      if (phase === 0){ phase = 1; ban.set(1, S.base, t); btn.textContent = 'Set reminder'; }
      else if (phase === 1){ phase = 2; sw.to(1, t); btn.disabled = true;
        setTimeout(() => sw.to(2, now()), 650); } };
    return t => { const p = clamp(ban.at(t));
      bn.style.opacity = p.toFixed(3); bn.style.visibility = p < .02 ? 'hidden' : 'visible';
      bn.style.transform = `translateY(${((p-1)*12).toFixed(2)}px)`;
      th.style.transform = `translateY(${(p*8).toFixed(2)}px)`;
      rl.forEach((e, k) => sw.apply(e, k, t)); };
  }});

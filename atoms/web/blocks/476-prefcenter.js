

atom({ id:'prefcenter', cat:'Newsletter', name:'Preference center', block:'newsletter, preferences', fam:['M','S'],
  html:`<div class="card col" style="width:min(360px,92%);padding:16px;gap:0;line-height:1.55"><b style="font-size:15px;font-weight:600;padding-bottom:2px">What lands in your inbox</b><span class="muted" style="font-size:12.5px;padding-bottom:8px">The parent follows its children.</span><div class="rows"></div><div class="nt" style="position:relative;height:22px;font-size:12.5px;color:var(--muted);margin-top:8px"></div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px;padding-top:8px"><input type="checkbox" class="wk" checked> weekly digest note</label></div>`,
  desc:'The parent morphs between check and dash on one spring for the mixed state. Children stagger in and the frequency note blur-swaps. Saved holds.',
  api:'mix.set(0|1|2, S.base) · child[i].set(v, S.base, t0 + i*.05) · note.to(freq)',
  init(st){
    const box = $(st,'.rows'), nt = $(st,'.nt'), wk = $(st,'.wk');
    const K = ['Sunday letter','Midweek notes','Event invites'];
    const row = (label, sub, top) => { const d = document.createElement('div');
      d.style.cssText = 'display:flex;gap:10px;align-items:center;min-height:44px;padding:6px 0' + (top ? '' : ';border-top:1px solid var(--line-soft)');
      d.innerHTML = `<button aria-pressed="false" style="flex:none;width:22px;height:22px;border-radius:7px;border:1.5px solid var(--line);background:var(--card);cursor:pointer;display:grid;place-items:center;padding:0"><svg class="ck" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg><svg class="da" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg></button><span style="flex:1"><b style="display:block;font-size:13.5px;font-weight:600;line-height:1.5"></b><span class="muted" style="font-size:12px;line-height:1.5"></span></span>`;
      d.querySelector('b').textContent = label; d.querySelector('.muted').textContent = sub; box.appendChild(d);
      return { b:$(d,'button'), ck:$(d,'.ck'), da:$(d,'.da'), v:new Track(0) }; };
    const P = row('All product mail', 'One spring for every state', true);
    const C = K.map((k,i) => row(k, ['Weekly essay','Short updates','City meetups'][i], false));
    const N = ['Instant: mail as it happens','Weekly: one digest on Sundays'].map(s => { const x = document.createElement('span'); x.className = 'layer'; x.style.justifyContent = 'flex-start'; x.textContent = s; nt.appendChild(x); return x; });
    const nsw = new Swap(0), pm = new Track(0);
    const syncParent = inst => { const on = C.filter(c => c.v.target).length;
      const mode = on === 3 ? 0 : on === 0 ? -1 : 1;
      if (inst){ pm.jump(mode === 0 ? 1 : 0); } else { pm.set(mode === 0 ? 1 : 0); }
      P.mode = mode; };
    P.b.onclick = () => { const t0 = now(); const to = P.mode === 0 ? 0 : 1;
      C.forEach((c,i) => { if (REDUCE) c.v.jump(to); else c.v.set(to, S.base, t0 + i*.05); c.b.setAttribute('aria-pressed', !!to); });
      syncParent(); nsw.to(wk.checked && to ? 1 : 0); };
    C.forEach(c => c.b.onclick = () => { c.v.set(c.v.target ? 0 : 1); c.b.setAttribute('aria-pressed', !!c.v.target); syncParent(); });
    wk.onchange = () => nsw.to(wk.checked && P.mode !== -1 ? 1 : 0);
    syncParent(true);
    const all = [P, ...C];
    return t => { all.forEach((r,ri) => { const v = ri === 0 ? (r.mode === 0 ? 1 : r.mode === 1 ? clamp(pm.at(t)) : 0) : clamp(r.v.at(t));
      const isMix = ri === 0 && r.mode === 1;
      r.ck.style.opacity = isMix ? 0 : v.toFixed(3); r.da.style.opacity = isMix ? 1 : 0;
      r.b.style.background = mix(isMix ? .5 : v, 'var(--ink)', 'var(--card)');
      r.b.style.borderColor = mix(isMix ? .5 : v, 'var(--ink)', 'var(--line)');
      r.b.style.color = 'var(--card)'; });
      N.forEach((x,i) => nsw.apply(x,i,t)); };
  }});

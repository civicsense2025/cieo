

atom({ id:'payment', cat:'Documents', name:'Pay button', block:'payment-methods, checkout', fam:['M','S'],
  html:`<div class="card col" style="width:min(300px,88%);padding:16px;gap:10px"><div class="row" style="justify-content:space-between"><span class="muted small">Invoice INV-0042</span><b class="num tot"></b></div><button class="pay" aria-label="Pay invoice" style="position:relative;height:44px;border:0;border-radius:11px;color:#fff;font-weight:500;cursor:pointer;overflow:hidden"></button><div class="pm small" style="position:relative;height:20px"></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" id="pay-decline" class="dc"> Simulate a declined card</label></div>`,
  desc:'Processing keeps the button in place with a spinner. Success fills it with the success color; a decline fills it with danger and opens a fix-it message. Both settle back to a retryable state. On success the invoice total counts up on a soft spring while the receipt swaps in.',
  api:'plan(processing → paid | declined)   fill = mix(success | danger, ink)   total.set(64.80, S.soft, t0 + .25)',
  init(st){
    const pay = $(st,'.pay'), pm = $(st,'.pm'), dc = $(st,'.dc'), totEl = $(st,'.tot'), TOTAL = 64.80;
    const L = { idle:'Pay $64.80', busy:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9"/></svg>Processing', paid:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>Paid', bad:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>Declined' };
    const lay = {}; for (const k in L){ const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = L[k]; pay.appendChild(e); lay[k] = e; }
    const M = { none:'', paid:'Receipt sent to billing@northstudio.co', bad:'Your bank declined the card. Try another card.' }, ml = {};
    for (const k in M){ const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.color = k === 'bad' ? 'var(--danger)' : 'var(--success)'; e.textContent = M[k]; pm.appendChild(e); ml[k] = e; }
    const sw = new Swap('idle'), msw = new Swap('none'), ok = new Track(0), bad = new Track(0), tot = new Track(TOTAL); let q = [];
    pay.onclick = () => { if (sw.cur !== 'idle' || q.length) return; const t0 = now(), fail = dc.checked; sw.to('busy'); msw.to('none');
      q = [[t0 + 1.2, () => { sw.to(fail ? 'bad' : 'paid'); (fail ? bad : ok).set(1); msw.to(fail ? 'bad' : 'paid'); if (!fail){ tot.jump(0); tot.set(TOTAL, S.soft, t0 + 1.45); } }], [t0 + (fail ? 3 : 4), () => { sw.to('idle'); ok.set(0); bad.set(0); if (!fail) msw.to('none'); }]]; };
    const spin = $(lay.busy,'svg');
    return t => { while (q.length && q[0][0] <= t) q.shift()[1](); const g = clamp(ok.at(t)), k = clamp(bad.at(t));
      totEl.textContent = money(tot.at(t));
      pay.style.background = `color-mix(in oklab, var(--danger) ${(k*100).toFixed(1)}%, ${mix(g,'var(--success)','var(--ink)')})`; pay.style.color = g + k > .3 ? '#fff' : 'var(--card)';
      for (const k2 in lay) sw.apply(lay[k2], k2, t); for (const k2 in ml) msw.apply(ml[k2], k2, t); spin.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`; };
  }});


atom({ id:'donation', cat:'Commerce', name:'Donation amount', block:'donation', fam:['E','M','S'], tall:true,
  html:`<div class="card col" style="width:min(320px,90%);padding:16px;gap:12px"><b>Support the newsroom</b><div class="seg da" style="display:flex"><div class="ind"></div><button>$10</button><button>$25</button><button>$50</button><button>$100</button><button>Other</button></div><div class="ow" style="overflow:hidden;height:0"><label class="row small" style="gap:6px;border:1.5px solid var(--muted);border-radius:9px;padding:8px 10px;background:var(--card)"><span class="muted">$</span><input id="don-amt" inputmode="numeric" placeholder="Amount" aria-label="Custom amount" style="flex:1;min-width:0;border:0;background:none;color:var(--ink);font:14px var(--sans);outline:none"></label></div><button class="btn ink go" aria-label="Donate" style="position:relative;height:40px;display:flex;align-items:center;justify-content:center;gap:4px;overflow:hidden"></button><div class="rc small" style="position:relative;height:20px"></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="rc-on" checked> Receipt</label></div>`,
  desc:'The amount indicator stretches between chips. “Other” opens a field below on a height spring, and the button’s amount rolls digit by digit. Giving fills the button with success and swaps to a thank-you state with a receipt line, then settles back to a retryable Give.',
  api:'ind.go(l, r)   other.h.set(1)   digits.set(amount)   give: busy → thanks → idle   receipt.to(rc | none)',
  init(st){
    const seg = $(st,'.da'), ind = $(seg,'.ind'), btns = $$(seg,'button'), ow = $(st,'.ow'), inp = $(st,'input'), go = $(st,'.go'), rc = $(st,'.rc'), rcOn = $(st,'.rc-on');
    const e = edges(0,0), oh = new Track(0); let cur = 1;
    const amt = document.createElement('span'); amt.className = 'amt';
    const d = new Digits(amt, 4);
    const L = { idle:null, busy:null, thanks:null };
    L.idle = document.createElement('span'); L.idle.className = 'layer'; L.idle.innerHTML = 'Give $'; L.idle.appendChild(amt);
    L.busy = document.createElement('span'); L.busy.className = 'layer';
    L.busy.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9"/></svg>Processing';
    L.thanks = document.createElement('span'); L.thanks.className = 'layer';
    L.thanks.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>Thank you';
    Object.values(L).forEach(l => go.appendChild(l));
    const M = { none:'', rc:'Receipt sent · thank you for supporting the newsroom' }, ml = {};
    for (const k in M){ const s = document.createElement('span'); s.className = 'layer'; s.style.justifyContent = 'flex-start'; s.style.color = 'var(--success)'; s.textContent = M[k]; rc.appendChild(s); ml[k] = s; }
    const sw = new Swap('idle'), msw = new Swap('none'), ok = new Track(0); let q = [];
    d.set('25', true);
    const sel = (i, inst) => { cur = i; const b = btns[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth);
      if (i === 4){ oh.set(1); d.set(String(parseInt(inp.value) || 0)); setTimeout(() => inp.focus({ preventScroll:true }), 0); } else { oh.set(0); d.set(btns[i].textContent.slice(1)); } };
    btns.forEach((b,i) => b.onclick = () => sel(i)); inp.oninput = () => { inp.value = inp.value.replace(/\D/g,'').slice(0,4); d.set(String(parseInt(inp.value) || 0)); };
    go.onclick = () => { if (sw.cur !== 'idle' || q.length) return; const t0 = now(); sw.to('busy'); msw.to('none');
      q = [[t0 + 1.1, () => { sw.to('thanks'); ok.set(1); msw.to(rcOn.checked ? 'rc' : 'none'); }], [t0 + 3.5, () => { sw.to('idle'); ok.set(0); msw.to('none'); }]]; };
    const init = () => sel(cur, true); document.fonts.ready.then(init); requestAnimationFrame(init); d.set('25', true);
    const spin = $(L.busy,'svg');
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)'});
      const o = clamp(oh.at(t)); ow.style.height = px(o*40); fade($(ow,'label'), o, (1-o)*-4); d.render(t);
      const g = clamp(ok.at(t)); go.style.background = mix(g,'var(--success)','var(--ink)'); go.style.color = g > .3 ? '#fff' : 'var(--card)';
      for (const k in L) sw.apply(L[k], k, t); for (const k in ml) msw.apply(ml[k], k, t); spin.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`; };
  }});
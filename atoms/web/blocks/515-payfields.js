atom({ id:'payfields', cat:'Commerce', name:'Payment fields', block:'checkout, card-form, validation', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600">Payment</b><span class="br small" style="position:relative;display:block;min-height:19px;font-size:12.5px"></span></div><input class="cn" inputmode="numeric" placeholder="Card number" aria-label="Card number" style="height:38px;border-radius:9px;border:1px solid var(--line);padding:0 10px;font-size:14px;font-variant-numeric:tabular-nums"><p class="m1 small" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px"></p><div class="row" style="gap:8px"><input class="ex" placeholder="MM/YY" aria-label="Expiry" style="flex:1;height:38px;border-radius:9px;border:1px solid var(--line);padding:0 10px;font-size:14px;min-width:0"><input class="cv" inputmode="numeric" maxlength="4" placeholder="CVC" aria-label="CVC" style="width:88px;height:38px;border-radius:9px;border:1px solid var(--line);padding:0 10px;font-size:14px"></div><p class="m2 small" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px"></p><button class="py" style="height:38px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer">Pay $82.00</button><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="sv"> Save card</label></div><div class="hint">Type 4242… then a short number</div>`,
  desc:'Spaces land every four digits while the brand swaps live. Valid fields earn a success check inline; invalid ones ring danger with a fix, as you type — never submit-only. Pay holds its terminal.',
  api:'brand.to(visa|mc|amex|unknown)   ok[i].set(1)/bad[i].ring() live on input',
  init(st){
    const cn = $(st,'.cn'), ex = $(st,'.ex'), cv = $(st,'.cv'), m1 = $(st,'.m1'), m2 = $(st,'.m2'), py = $(st,'.py');
    const brand = new Swap(0), ok = new Track(0);
    ['Card','Visa','Mastercard','Amex'].forEach((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '12.5px'; e.style.justifyContent = 'flex-end'; e.textContent = s; $(st,'.br').appendChild(e); });
    const luhn = s => { let d = 0, alt = false; for (let i = s.length-1; i >= 0; i--){ let n = +s[i]; if (alt){ n *= 2; if (n > 9) n -= 9; } d += n; alt = !alt; } return s.length >= 15 && d % 10 === 0; };
    const chk = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"><path d="M5 12.5 10 17.5 19 7"/></svg>`;
    function vCard(live){ const raw = cn.value.replace(/\D/g,'').slice(0,16);
      cn.value = raw.replace(/(\d{4})(?=\d)/g,'$1 ');
      brand.to(raw[0] === '4' ? 1 : raw[0] === '5' ? 2 : raw[0] === '3' ? 3 : 0);
      const good = luhn(raw); cn.style.borderColor = !raw ? 'var(--line)' : good ? 'var(--success)' : 'var(--danger)';
      m1.innerHTML = !raw ? '' : good ? chk + ' Looks good.' : 'Card looks short — check the 16 digits.';
      m1.style.color = good ? 'var(--success)' : 'var(--danger)'; return good; }
    function vRest(){ let e = ex.value.replace(/\D/g,'').slice(0,4);
      if (e.length >= 3) e = e.slice(0,2) + '/' + e.slice(2); ex.value = e;
      const m = +e.slice(0,2), goodE = /^\d{2}\/\d{2}$/.test(e) && m >= 1 && m <= 12;
      const goodC = /^\d{3,4}$/.test(cv.value);
      ex.style.borderColor = !ex.value ? 'var(--line)' : goodE ? 'var(--success)' : 'var(--danger)';
      cv.style.borderColor = !cv.value ? 'var(--line)' : goodC ? 'var(--success)' : 'var(--danger)';
      m2.textContent = !ex.value && !cv.value ? '' : !goodE ? 'Use MM/YY — e.g. 08/28.' : !goodC ? 'CVC is the 3 digits on the back.' : '';
      m2.style.color = 'var(--danger)'; return goodE && goodC; }
    cn.oninput = () => vCard(true); ex.oninput = vRest; cv.oninput = vRest;
    py.onclick = () => { const a = vCard(false), b = vRest();
      if (a && b){ ok.set(1); py.textContent = 'Paid · Done'; } else { ok.set(0); py.textContent = 'Pay $82.00'; (!a ? cn : !/^\d{2}\/\d{2}$/.test(ex.value) ? ex : cv).focus(); } };
    return t => { [...$(st,'.br').childNodes].forEach((e,k) => brand.apply(e,k,t));
      const g = clamp(ok.at(t)); py.style.background = mix(g,'var(--success)','var(--ink)'); };
  }});

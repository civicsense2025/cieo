

atom({ id:'checkout', cat:'Commerce', name:'Checkout totals', block:'checkout, line-items, totals', fam:['T','S'], tall:true,
  html:`<div class="card col co" style="width:min(320px,90%);padding:16px;gap:12px"></div>`,
  desc:'Quantity digits roll, and every money value springs toward its new total, so subtotal, tax and total move together.',
  api:'total.set(sum); label = money(total.at(t))',
  init(st){
    const co = $(st,'.co'), I = [['Canvas tote',32,1],['Enamel mug',18,2]], tax = .08;
    const rows = I.map(([n,p,q]) => { const r = document.createElement('div'); r.className = 'row'; r.style.justifyContent = 'space-between';
      r.innerHTML = `<div class="col" style="gap:2px"><span class="small" style="font-weight:500"></span><span class="small muted">$${p} each</span></div><div class="row" style="gap:6px"><button class="btn m" aria-label="Decrease" style="padding:2px 9px">−</button><span class="q num small" style="min-width:18px;text-align:center"></span><button class="btn p" aria-label="Increase" style="padding:2px 9px">+</button><span class="lt num small" style="min-width:64px;text-align:right"></span></div>`;
      $(r,'span').textContent = n; co.appendChild(r); const it = { p, q, d:new Digits($(r,'.q'), 2), lt:$(r,'.lt'), v:new Track(p*q) }; it.d.set(String(q), true);
      $(r,'.m').onclick = () => upd(it, -1); $(r,'.p').onclick = () => upd(it, 1); return it; });
    const tot = document.createElement('div'); tot.className = 'col small'; tot.style.cssText = 'gap:6px;border-top:1px solid var(--line);padding-top:12px';
    tot.innerHTML = ['Subtotal','Tax (8%)','Total'].map((l,i) => `<div class="row" style="justify-content:space-between;${i === 2 ? 'font-weight:600;font-size:16px' : ''}"><span class="${i < 2 ? 'muted' : ''}">${l}</span><span class="num"></span></div>`).join(''); co.appendChild(tot);
    const out = $$(tot,'.num'), sub = new Track(0), tx = new Track(0), tt = new Track(0);
    const sum = inst => { const s = rows.reduce((a,r) => a + r.p*r.q, 0), k = inst ? 'jump' : 'set'; sub[k](s); tx[k](s*tax); tt[k](s*(1+tax)); };
    function upd(it, d){ const q = clamp(it.q + d, 0, 99); if (q === it.q) return; it.q = q; it.d.set(String(q)); it.v.set(it.p*q); sum(); }
    sum(true);
    return t => { rows.forEach(r => { r.d.render(t); r.lt.textContent = money(r.v.at(t)); }); out[0].textContent = money(sub.at(t)); out[1].textContent = money(tx.at(t)); out[2].textContent = money(tt.at(t)); };
  }});
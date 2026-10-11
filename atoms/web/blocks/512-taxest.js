atom({ id:'taxest', cat:'Commerce', name:'Tax estimator', block:'checkout, tax, totals', fam:['M','S'],
  html:`<div class="card col" style="width:min(300px,92%);padding:14px;gap:8px"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600">Tax estimate</b><span class="num muted small" style="font-size:12.5px">US only</span></div><button class="lk" style="border:0;background:none;color:var(--accent);cursor:pointer;font-size:13px;line-height:1.5;text-align:left;padding:0">Estimate with ZIP</button><div class="fd" style="overflow:hidden;max-height:0"><div class="row" style="gap:8px"><input class="zp" inputmode="numeric" maxlength="5" placeholder="ZIP" aria-label="ZIP code" style="width:96px;height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><button class="go" style="height:38px;padding:0 14px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer">Estimate</button></div><p class="msg small" style="font-size:12.5px;line-height:1.5;margin:6px 0 0;min-height:19px"></p><div class="rows col small" style="gap:6px;border-top:1px solid var(--line);padding-top:12px;margin-top:4px"></div></div><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="rt" checked> Include county rate</label></div><div class="hint">Enter 94110, then Estimate</div>`,
  desc:'The ZIP estimator opens on the base height spring. Estimate swaps in itemized rows 50ms apart while every money value springs to its figure together.',
  api:'open.set(1); est: rows[i]=prog(t,t0+i*.05)   tax.set(rate*sub)',
  init(st){
    const fd = $(st,'.fd'), zp = $(st,'.zp'), msg = $(st,'.msg'), rows = $(st,'.rows');
    const open = new Track(0), sub = new Track(68), tx = new Track(0), tt = new Track(68);
    const names = ['Subtotal','Tax','Total']; let t0 = -9, shown = false;
    const R = names.map(n => { const r = document.createElement('div'); r.className = 'row'; r.style.justifyContent = 'space-between';
      r.innerHTML = `<span class="muted">${n}</span><span class="v num" style="font-variant-numeric:tabular-nums"></span>`; rows.appendChild(r); return $(r,'.v'); });
    sub.jump(68); tx.jump(0); tt.jump(68);
    $(st,'.lk').onclick = () => { shown = !shown; open.set(shown ? 1 : 0); };
    const rate = () => ($(st,'.rt').checked ? .0825 : .06);
    zp.oninput = () => { const ok = /^\d{5}$/.test(zp.value); zp.style.borderColor = zp.value && !ok ? 'var(--danger)' : 'var(--muted)';
      msg.textContent = zp.value && !ok ? 'Enter all 5 digits.' : ''; msg.style.color = 'var(--danger)'; };
    $(st,'.go').onclick = () => { if (!/^\d{5}$/.test(zp.value)){ zp.style.borderColor = 'var(--danger)'; msg.textContent = 'Enter all 5 digits to estimate.'; msg.style.color = 'var(--danger)'; zp.focus(); return; }
      msg.textContent = ''; t0 = now(); const r = rate(), x = 68*r; tx.set(x); tt.set(68 + x); };
    $(st,'.rt').onchange = () => { if (t0 > 0){ const r = rate(), x = 68*r; tx.set(x); tt.set(68 + x); } };
    return t => { const p = clamp(open.at(t)); fd.style.maxHeight = (p*300).toFixed(0) + 'px'; fd.style.opacity = p.toFixed(3);
      const vals = [sub.at(t), tx.at(t), tt.at(t)];
      R.forEach((el,i) => { const q = t0 < 0 ? 0 : clamp(prog(t, t0 + i*.05)); el.parentElement.style.opacity = q.toFixed(3);
        el.parentElement.style.transform = `translateY(${((1-q)*8).toFixed(1)}px)`; el.textContent = money(Math.max(0, vals[i])); }); };
  }});

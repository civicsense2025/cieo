

atom({ id:'otp', cat:'Inputs', name:'One-time code', block:'form, account, Input OTP', fam:['S','E','M'],
  html:`<div class="col" style="align-items:center;gap:10px"><div class="ob" style="position:relative;display:flex;gap:8px"><i class="ring" style="position:absolute;top:-3px;height:54px;border-radius:12px;border:2px solid var(--ink);pointer-events:none"></i><input id="otp-in" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="Six digit code" style="position:absolute;inset:0;opacity:0;font-size:16px;cursor:text"></div><div class="om small" style="position:relative;height:20px;width:260px"></div></div><div class="hint">The code is 246810</div>`,
  desc:'Each digit rolls into its box and a focus ring slides to the next box with lagging edges. A full code turns every box success or danger; a wrong code clears itself after a beat.',
  api:'box[i].to(digit)   ring.go(x[i])   status → success | danger',
  init(st){
    const ob = $(st,'.ob'), inp = $(st,'input'), ring = $(st,'.ring'), om = $(st,'.om');
    const boxes = [...Array(6)].map(() => { const b = document.createElement('span'); b.style.cssText = 'position:relative;width:40px;height:48px;border-radius:10px;border:1.5px solid var(--muted);background:var(--card);font:600 22px var(--sans);display:block'; ob.insertBefore(b, inp); return { b, sw:new Swap(''), L:{} }; });
    const M = { '':'', ok:'Verified. Signing you in…', bad:'That code didn’t match. Try again.' }, ml = {};
    for (const k in M){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = M[k]; e.style.color = k === 'ok' ? 'var(--success)' : 'var(--danger)'; om.appendChild(e); ml[k] = e; }
    const e = edges(0,40), ok = new Track(0), bad = new Track(0), fo = new Track(0), msw = new Swap(''); let clearAt = 0;
    const show = () => { const v = inp.value; boxes.forEach((x,i) => { const c = v[i] || ''; if (!(c in x.L)){ const s = document.createElement('span'); s.className = 'layer'; s.textContent = c; x.b.appendChild(s); x.L[c] = s; } x.sw.to(c); });
      const i = Math.min(v.length, 5), b = boxes[i].b; e.go(b.offsetLeft - 3, b.offsetLeft + b.offsetWidth + 3);
      if (v.length === 6){ const good = v === '246810'; (good ? ok : bad).set(1); msw.to(good ? 'ok' : 'bad'); if (!good) clearAt = now() + 1.1; } else { ok.set(0); bad.set(0); if (v.length) msw.to(''); } };
    inp.oninput = () => { inp.value = inp.value.replace(/\D/g,'').slice(0,6); show(); };
    inp.onfocus = () => fo.set(1); inp.onblur = () => fo.set(0);
    show(); const b0 = boxes[0].b; e.jump(b0.offsetLeft - 3, b0.offsetLeft + b0.offsetWidth + 3);
    return t => { if (clearAt && t >= clearAt){ clearAt = 0; inp.value = ''; show(); }
      const g = clamp(ok.at(t)), k = clamp(bad.at(t)), a = e.A.at(t), b = e.B.at(t);
      ring.style.left = px(a); ring.style.width = px(b - a); ring.style.opacity = (clamp(fo.at(t))*(1 - Math.max(g,k))).toFixed(3);
      const bc = `color-mix(in oklab, var(--danger) ${(k*100).toFixed(1)}%, ${mix(g,'var(--success)','var(--muted)')})`;
      boxes.forEach(x => { x.b.style.borderColor = bc; for (const c in x.L) x.sw.apply(x.L[c], c, t, 10); }); for (const c in ml) msw.apply(ml[c], c, t); };
  }});
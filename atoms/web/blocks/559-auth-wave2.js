
atom({ id:'auth-passkey', cat:'Auth', name:'Passkey sign in', block:'auth, passkey, webauthn', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Sign in with a passkey</b><p class="small" style="font-size:12.5px;line-height:1.5;margin:0;color:var(--muted)">No password to type. Your device checks it is really you.</p><button class="pk" style="position:relative;height:44px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px"></button><p class="nt small" style="overflow:hidden;height:0;opacity:0;font-size:12.5px;line-height:1.5;margin:0;color:var(--muted)">This device can’t use passkeys. Use your password or a code instead.</p><p class="sm small" role="status" aria-live="polite" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:var(--success)"></p><button class="tg" aria-pressed="false" style="position:relative;height:28px;border:0;background:none;color:var(--muted);font-size:12.5px;cursor:pointer;padding:4px 0;text-align:left"></button></div><div class="hint">Press the button, then flip the unavailable toggle</div>`,
  desc:'The button busies with waiting text while the ceremony runs, then lands a signed-in status. Flipping the toggle reveals the fallback note and parks the button.',
  api:'press: label.swap(waiting) + aria-busy → status.to(signed in)   toggle: fallback.hidden.set(!unavailable)',
  init(st){
    const pk = $(st,'.pk'), nt = $(st,'.nt'), sm = $(st,'.sm'), tg = $(st,'.tg');
    const psw = new Swap('idle'), tsw = new Swap('available'), nh = new Track(0, S.soft), no = new Track(0), motion = motionSettings(st);
    const PL = { idle:'Continue with a passkey', wait:'Waiting for your passkey…' }, PE = {}, TL = { available:'Simulate an unavailable device', unavailable:'Simulate an available device' }, TE = {};
    for (const k in PL){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = PL[k]; pk.appendChild(e); PE[k] = e; }
    for (const k in TL){ const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = TL[k]; tg.appendChild(e); TE[k] = e; }
    let unavailable = false, doneAt = 0;
    pk.onclick = () => {
      if (unavailable || doneAt) return;
      pk.disabled = true; pk.setAttribute('aria-busy', 'true'); pk.setAttribute('aria-label', PL.wait); if (motion.reduced()) psw.jump('wait'); else psw.to('wait');
      sm.textContent = ''; doneAt = now() + 1.2;
    };
    tg.onclick = () => {
      unavailable = !unavailable;
      pk.disabled = unavailable; const next = unavailable ? 'unavailable' : 'available', height = unavailable ? nt.scrollHeight : 0, opacity = unavailable ? 1 : 0;
      if (motion.reduced()){ tsw.jump(next); nh.jump(height); no.jump(opacity); } else { tsw.to(next); nh.set(height, S.soft); no.set(opacity); }
      tg.setAttribute('aria-pressed', String(unavailable));
      if (unavailable) sm.textContent = '';
    };
    return t => { if (motion.changedToReduced()) { psw.jump(doneAt ? 'wait' : 'idle'); const target = unavailable ? 'unavailable' : 'available'; tsw.jump(target); nh.jump(unavailable ? nt.scrollHeight : 0); no.jump(unavailable ? 1 : 0); }
      if (doneAt && t >= doneAt){ doneAt = 0; pk.disabled = false; pk.removeAttribute('aria-busy'); pk.removeAttribute('aria-label'); if (motion.reduced()) psw.jump('idle'); else psw.to('idle'); sm.textContent = 'Signed in with your passkey.'; }
      for (const k in PE) psw.apply(PE[k], k, t); for (const k in TE) tsw.apply(TE[k], k, t); nt.style.height = px(Math.max(0, nh.at(t))); nt.style.opacity = clamp(no.at(t)).toFixed(3); };
  }});

atom({ id:'auth-sso', cat:'Auth', name:'Single sign-on', block:'auth, sso, oauth', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Continue with</b><button data-p="google" data-label="Google" style="height:44px;border-radius:9px;border:1.5px solid var(--muted);background:var(--card);color:var(--ink);font-weight:500;cursor:pointer;font-size:14px">Continue with Google</button><button data-p="northwind" data-label="Northwind" style="height:44px;border-radius:9px;border:1.5px solid var(--muted);background:var(--card);color:var(--ink);font-weight:500;cursor:pointer;font-size:14px">Continue with Northwind</button><button data-p="okta" data-label="Okta" style="height:44px;border-radius:9px;border:1.5px solid var(--muted);background:var(--card);color:var(--ink);font-weight:500;cursor:pointer;font-size:14px">Continue with Okta</button><p class="se small" role="alert" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:var(--danger)"></p><p class="sm small" role="status" aria-live="polite" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:var(--success)"></p></div><div class="hint">Press a provider, watch it busy, then retry after the error</div>`,
  desc:'Each provider owns its accessible name. A press busies that button with connecting text; the first attempt lands an inline error and the retry signs in.',
  api:'press: label.swap(connecting) + aria-busy → error.to(alert, try 1) | status.to(signed in, try 2)',
  init(st){
    const btns = [...st.querySelectorAll('[data-p]')], se = $(st,'.se'), sm = $(st,'.sm'), motion = motionSettings(st);
    const label = b => b.getAttribute('data-label');
    const labels = btns.map(b => { const sw = new Swap('idle'), idle = document.createElement('span'), wait = document.createElement('span'); idle.className = wait.className = 'layer'; idle.textContent = `Continue with ${label(b)}`; wait.textContent = `Connecting to ${label(b)}…`; b.textContent = ''; b.style.position = 'relative'; b.append(idle, wait); return { b, sw, idle, wait }; });
    let busy = null, doneAt = 0, tries = 0;
    btns.forEach(b => b.onclick = () => {
      if (busy) return;
      busy = b; tries += 1;
      btns.forEach(x => { x.disabled = true; });
      b.setAttribute('aria-busy', 'true'); b.setAttribute('aria-label', `Connecting to ${label(b)}…`); const sw = labels.find(x => x.b === b).sw; if (motion.reduced()) sw.jump('wait'); else sw.to('wait');
      se.textContent = ''; sm.textContent = ''; doneAt = now() + 1.2;
    });
    return t => { if (motion.changedToReduced()) labels.forEach(x => x.sw.jump(busy === x.b ? 'wait' : 'idle'));
      if (doneAt && t >= doneAt){ doneAt = 0; const b = busy; busy = null;
      btns.forEach(x => { x.disabled = false; });
      b.removeAttribute('aria-busy'); b.removeAttribute('aria-label'); const sw = labels.find(x => x.b === b).sw; if (motion.reduced()) sw.jump('idle'); else sw.to('idle');
      if (tries % 2 === 1) se.textContent = `${label(b)} didn’t approve the sign-in. Try again.`;
      else sm.textContent = `Signed in with ${label(b)}.`; }
      labels.forEach(x => { x.sw.apply(x.idle, 'idle', t); x.sw.apply(x.wait, 'wait', t); }); };
  }});

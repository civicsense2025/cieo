
atom({ id:'auth-passkey', cat:'Auth', name:'Passkey sign in', block:'auth, passkey, webauthn', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Sign in with a passkey</b><p class="small" style="font-size:12.5px;line-height:1.5;margin:0;color:var(--muted)">No password to type. Your device checks it is really you.</p><button class="pk" style="height:44px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Continue with a passkey</button><p class="nt small" style="font-size:12.5px;line-height:1.5;margin:0;color:var(--muted)" hidden>This device can’t use passkeys. Use your password or a code instead.</p><p class="sm small" role="status" aria-live="polite" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:var(--success)"></p><button class="tg" aria-pressed="false" style="border:0;background:none;color:var(--muted);font-size:12.5px;cursor:pointer;padding:4px 0;text-align:left">Simulate an unavailable device</button></div><div class="hint">Press the button, then flip the unavailable toggle</div>`,
  desc:'The button busies with waiting text while the ceremony runs, then lands a signed-in status. Flipping the toggle reveals the fallback note and parks the button.',
  api:'press: label.swap(waiting) + aria-busy → status.to(signed in)   toggle: fallback.hidden.set(!unavailable)',
  init(st){
    const pk = $(st,'.pk'), nt = $(st,'.nt'), sm = $(st,'.sm'), tg = $(st,'.tg');
    let unavailable = false, doneAt = 0;
    pk.onclick = () => {
      if (unavailable || doneAt) return;
      pk.disabled = true; pk.setAttribute('aria-busy', 'true'); pk.textContent = 'Waiting for your passkey…';
      sm.textContent = ''; doneAt = now() + 1.2;
    };
    tg.onclick = () => {
      unavailable = !unavailable;
      nt.hidden = !unavailable; pk.disabled = unavailable;
      tg.textContent = unavailable ? 'Simulate an available device' : 'Simulate an unavailable device';
      tg.setAttribute('aria-pressed', String(unavailable));
      if (unavailable) sm.textContent = '';
    };
    return t => { if (doneAt && t >= doneAt){ doneAt = 0; pk.disabled = false; pk.removeAttribute('aria-busy'); pk.textContent = 'Continue with a passkey'; sm.textContent = 'Signed in with your passkey.'; } };
  }});

atom({ id:'auth-sso', cat:'Auth', name:'Single sign-on', block:'auth, sso, oauth', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Continue with</b><button data-p="google" data-label="Google" style="height:44px;border-radius:9px;border:1.5px solid var(--muted);background:var(--card);color:var(--ink);font-weight:500;cursor:pointer;font-size:14px">Continue with Google</button><button data-p="northwind" data-label="Northwind" style="height:44px;border-radius:9px;border:1.5px solid var(--muted);background:var(--card);color:var(--ink);font-weight:500;cursor:pointer;font-size:14px">Continue with Northwind</button><button data-p="okta" data-label="Okta" style="height:44px;border-radius:9px;border:1.5px solid var(--muted);background:var(--card);color:var(--ink);font-weight:500;cursor:pointer;font-size:14px">Continue with Okta</button><p class="se small" role="alert" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:var(--danger)"></p><p class="sm small" role="status" aria-live="polite" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px;color:var(--success)"></p></div><div class="hint">Press a provider, watch it busy, then retry after the error</div>`,
  desc:'Each provider owns its accessible name. A press busies that button with connecting text; the first attempt lands an inline error and the retry signs in.',
  api:'press: label.swap(connecting) + aria-busy → error.to(alert, try 1) | status.to(signed in, try 2)',
  init(st){
    const btns = [...st.querySelectorAll('[data-p]')], se = $(st,'.se'), sm = $(st,'.sm');
    const label = b => b.getAttribute('data-label');
    let busy = null, doneAt = 0, tries = 0;
    btns.forEach(b => b.onclick = () => {
      if (busy) return;
      busy = b; tries += 1;
      btns.forEach(x => { x.disabled = true; });
      b.setAttribute('aria-busy', 'true'); b.textContent = `Connecting to ${label(b)}…`;
      se.textContent = ''; sm.textContent = ''; doneAt = now() + 1.2;
    });
    return t => { if (doneAt && t >= doneAt){ doneAt = 0; const b = busy; busy = null;
      btns.forEach(x => { x.disabled = false; });
      b.removeAttribute('aria-busy'); b.textContent = `Continue with ${label(b)}`;
      if (tries % 2 === 1) se.textContent = `${label(b)} didn’t approve the sign-in. Try again.`;
      else sm.textContent = `Signed in with ${label(b)}.`; } };
  }});

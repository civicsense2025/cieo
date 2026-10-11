
atom({ id:'auth-magic-link', cat:'Auth', name:'Magic link', block:'auth, email, passwordless', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Sign in with email</b><label class="small" for="aml-em" style="font-weight:500">Email</label><input id="aml-em" class="em" type="email" autocomplete="email" placeholder="you@studio.co" aria-label="Email" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><button class="snd" style="height:38px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Send sign-in link</button><div class="row small" style="justify-content:space-between;align-items:center"><span class="sm" style="position:relative;display:block;min-height:19px;font-size:12.5px"></span><button class="rs" style="border:0;background:none;color:var(--muted);font-size:12.5px;cursor:pointer;padding:4px 0">Resend</button></div></div><div class="hint">Send, then try resending twice</div>`,
  desc:'Send delivers a link state and starts a 30 second resend countdown. Hammering resend never starts two timers: each send carries a guard token and stale ticks are ignored.',
  api:'send: status.to(sent); count.set(30) guarded   resend disabled while count > 0',
  init(st){
    const em = $(st,'.em'), snd = $(st,'.snd'), rs = $(st,'.rs'), sm = $(st,'.sm');
    const msw = new Swap(''); const M = { '':'', sent:'Check your inbox for the link.', bad:'Enter an email like you@studio.co.' };
    const EL = Object.keys(M).map(k => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '12.5px'; e.style.justifyContent = 'flex-start'; e.textContent = M[k]; if (k === 'bad') e.style.color = 'var(--danger)'; sm.appendChild(e); return e; });
    let guard = 0, until = 0;
    const left = () => Math.max(0, Math.ceil((until - now()) / 1));
    const send = () => {
      const ok = /^\S+@\S+\.\S+$/.test(em.value.trim());
      msw.to(ok ? 'sent' : 'bad');
      if (!ok) return;
      guard += 1; until = now() + 30;
    };
    snd.onclick = send;
    rs.onclick = () => { if (left() === 0) send(); };
    return t => { EL.forEach((e,k) => msw.apply(e, Object.keys(M)[k], t));
      const n = left(); rs.disabled = n > 0; rs.textContent = n > 0 ? `Resend in ${n}s` : 'Resend'; rs.style.opacity = n > 0 ? '.5' : '1'; };
  }});

atom({ id:'auth-mfa-challenge', cat:'Auth', name:'MFA challenge', block:'auth, otp, recovery code', fam:['M','S'], tall:true,
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Check your authenticator</b><div class="md-code col" style="gap:8px"><div class="bx" style="display:flex;gap:8px" role="group" aria-label="Six digit code"></div><input class="in" inputmode="numeric" autocomplete="one-time-code" aria-label="Six digit code" placeholder="••••••" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px;font-variant-numeric:tabular-nums"></div><div class="md-rec col" style="gap:8px" hidden><label class="small" style="font-weight:500" for="amf-rc">Recovery code</label><input id="amf-rc" class="ri" autocomplete="off" placeholder="apple-orange-4582" aria-label="Recovery code" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><button class="vf" style="height:38px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Use recovery code</button></div><p class="sm small" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px"></p><button class="tg" style="border:0;background:none;color:var(--muted);font-size:12.5px;cursor:pointer;padding:4px 0;text-align:left">Use a recovery code instead</button></div><div class="hint">Wrong code clears itself; try a code with spaces</div>`,
  desc:'Six boxes mirror one input and a wrong code clears itself after a beat. The recovery toggle swaps the boxes for a single field that forgives spaces and dashes.',
  api:'code.length === 6 → ok | clear after 1.1s   recovery.normalize(s) === apple-orange-4582',
  init(st){
    const bx = $(st,'.bx'), inp = $(st,'.in'), ri = $(st,'.ri'), vf = $(st,'.vf'), sm = $(st,'.sm'), tg = $(st,'.tg');
    const code = $(st,'.md-code'), rec = $(st,'.md-rec');
    const cells = [...Array(6)].map(() => { const d = document.createElement('span'); d.style.cssText = 'width:36px;height:44px;border-radius:9px;border:1.5px solid var(--muted);background:var(--card);display:grid;place-items:center;font:600 20px var(--sans);font-variant-numeric:tabular-nums'; bx.appendChild(d); return d; });
    let clearAt = 0, mode = 'code';
    const say = (s, bad) => { sm.textContent = s; sm.style.color = bad ? 'var(--danger)' : 'var(--success)'; };
    const flip = () => { mode = mode === 'code' ? 'rec' : 'code'; const isRec = mode === 'rec';
      code.hidden = isRec; rec.hidden = !isRec; tg.textContent = isRec ? 'Use the authenticator instead' : 'Use a recovery code instead'; sm.textContent = ''; };
    inp.oninput = () => { inp.value = inp.value.replace(/\D/g,'').slice(0,6);
      cells.forEach((d,i) => d.textContent = inp.value[i] || '');
      if (inp.value.length === 6){ if (inp.value === '246810') say('Verified. Signing you in…'); else { say('That code didn’t match. Try again.', true); clearAt = now() + 1.1; } } };
    vf.onclick = () => { const v = ri.value.toLowerCase().replace(/[\s-]/g,'');
      if (v === 'appleorange4582') say('Recovery code accepted. Signing you in…'); else say('That code didn’t match. Try again.', true); };
    tg.onclick = flip;
    return t => { if (clearAt && t >= clearAt){ clearAt = 0; inp.value = ''; cells.forEach(d => d.textContent = ''); } };
  }});

atom({ id:'auth-reset', cat:'Auth', name:'Password reset', block:'auth, password, recovery', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Reset your password</b><div class="st-req col" style="gap:8px"><label class="small" style="font-weight:500" for="ars-em">Email</label><input id="ars-em" class="em" type="email" autocomplete="email" placeholder="you@studio.co" aria-label="Email" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><button class="go1" style="height:38px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Send reset link</button></div><div class="st-cf col" style="gap:8px" hidden><label class="small" style="font-weight:500" for="ars-pw">New password</label><input id="ars-pw" class="pw" type="password" autocomplete="new-password" aria-label="New password" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><div class="mt" style="display:flex;gap:4px" role="meter" aria-label="Password strength" aria-valuemin="0" aria-valuemax="4" aria-valuenow="0"><i></i><i></i><i></i><i></i></div><button class="go2" style="height:38px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Save new password</button></div><p class="sm small" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px"></p></div><div class="hint">Request, then save a 12 character password</div>`,
  desc:'Request swaps to a confirm step with a live strength meter. Short passwords stay on the step with a text error; a strong save lands a confirmation.',
  api:'step.to(request | confirm)   score(pw) 0-4   save requires score ≥ 3',
  init(st){
    const req = $(st,'.st-req'), cf = $(st,'.st-cf'), em = $(st,'.em'), pw = $(st,'.pw');
    const sm = $(st,'.sm'), mt = $(st,'.mt'), segs = [...mt.querySelectorAll('i')];
    segs.forEach(s => s.style.cssText = 'flex:1;height:4px;border-radius:2px;background:var(--raised)');
    const say = (s, bad) => { sm.textContent = s; sm.style.color = bad ? 'var(--danger)' : 'var(--success)'; };
    const score = v => Math.min(4, (v.length >= 8 ? 1 : 0) + (v.length >= 12 ? 1 : 0) + (/[a-z]/.test(v) && /[A-Z]/.test(v) ? 1 : 0) + (/\d/.test(v) && /[^a-zA-Z0-9]/.test(v) ? 1 : 0));
    $(st,'.go1').onclick = () => { if (!/^\S+@\S+\.\S+$/.test(em.value.trim())){ say('Enter an email like you@studio.co.', true); return; }
      req.hidden = true; cf.hidden = false; say('Link sent. Choose a new password.'); pw.focus(); };
    const paint = () => { const s = score(pw.value); mt.setAttribute('aria-valuenow', s);
      segs.forEach((g,i) => g.style.background = i < s ? (s < 3 ? 'var(--warning)' : 'var(--success)') : 'var(--raised)'); return s; };
    pw.oninput = paint; paint();
    $(st,'.go2').onclick = () => { if (paint() < 3){ say('Use 12 or more characters with mixed case, a number, and a symbol.', true); return; }
      say('Password saved. Signing you in…'); };
    return () => {};
  }});

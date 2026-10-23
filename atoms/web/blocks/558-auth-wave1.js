
atom({ id:'auth-magic-link', cat:'Auth', name:'Magic link', block:'auth, email, passwordless', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Sign in with email</b><label class="small" for="aml-em" style="font-weight:500">Email</label><input id="aml-em" class="em" type="email" autocomplete="email" placeholder="you@studio.co" aria-label="Email" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><button class="snd" style="height:44px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Send sign-in link</button><div class="row small" style="justify-content:space-between;align-items:center"><span class="sm" style="position:relative;display:block;min-height:19px;font-size:12.5px"></span><button class="rs" style="border:0;background:none;color:var(--muted);font-size:12.5px;cursor:pointer;padding:4px 0">Resend</button></div></div><div class="hint">Send, then try resending twice</div>`,
  desc:'Send delivers a link state and starts a 30 second resend countdown. Hammering resend never starts two timers: each send carries a guard token and stale ticks are ignored.',
  api:'send: status.to(sent); count.set(30) guarded   resend disabled while count > 0',
  init(st){
    const em = $(st,'.em'), snd = $(st,'.snd'), rs = $(st,'.rs'), sm = $(st,'.sm');
    const msw = new Swap(''), motion = motionSettings(st); const M = { '':'', sent:'Check your inbox for the link.', bad:'Enter an email like you@studio.co.' };
    const EL = Object.keys(M).map(k => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '12.5px'; e.style.justifyContent = 'flex-start'; e.textContent = M[k]; if (k === 'bad') e.style.color = 'var(--danger)'; sm.appendChild(e); return e; });
    let guard = 0, until = 0, state = '';
    const left = () => Math.max(0, Math.ceil((until - now()) / 1));
    const send = () => {
      if (left() > 0) return;
      const ok = /^\S+@\S+\.\S+$/.test(em.value.trim());
      const next = ok ? 'sent' : 'bad'; state = next;
      if (motion.reduced()) msw.jump(next); else msw.to(next);
      if (!ok) return;
      guard += 1; until = now() + 30;
    };
    snd.onclick = send;
    rs.onclick = () => { if (left() === 0) send(); };
    return t => { if (motion.changedToReduced()) msw.jump(state);
      EL.forEach((e,k) => msw.apply(e, Object.keys(M)[k], t));
      const n = left(); rs.disabled = n > 0; snd.disabled = n > 0; rs.textContent = n > 0 ? `Resend in ${n}s` : 'Resend'; rs.style.opacity = n > 0 ? '.5' : '1'; };
  }});

atom({ id:'auth-mfa-challenge', cat:'Auth', name:'MFA challenge', block:'auth, otp, recovery code', fam:['M','S'], tall:true,
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Check your authenticator</b><div class="md-panes" style="position:relative;overflow:hidden"><div class="md-code col" style="position:absolute;inset:0 0 auto;gap:8px"><div class="bx" style="display:flex;gap:8px" role="group" aria-label="Six digit code"></div><input class="in" inputmode="numeric" autocomplete="one-time-code" aria-label="Six digit code" placeholder="••••••" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px;font-variant-numeric:tabular-nums"></div><div class="md-rec col" style="position:absolute;inset:0 0 auto;gap:8px"><label class="small" style="font-weight:500" for="amf-rc">Recovery code</label><input id="amf-rc" class="ri" autocomplete="off" placeholder="apple-orange-4582" aria-label="Recovery code" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><button class="vf" style="height:44px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Use recovery code</button></div></div><p class="sm small" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px"></p><button class="tg" style="position:relative;height:28px;border:0;background:none;color:var(--muted);font-size:12.5px;cursor:pointer;padding:4px 0;text-align:left"></button></div><div class="hint">Wrong code clears itself; try a code with spaces</div>`,
  desc:'Six boxes mirror one input and a wrong code clears itself after a beat. The recovery toggle swaps the boxes for a single field that forgives spaces and dashes.',
  api:'code.length === 6 → ok | clear after 1.1s   recovery.normalize(s) === apple-orange-4582',
  init(st){
    const bx = $(st,'.bx'), inp = $(st,'.in'), ri = $(st,'.ri'), vf = $(st,'.vf'), sm = $(st,'.sm'), tg = $(st,'.tg');
    const panes = $(st,'.md-panes'), code = $(st,'.md-code'), rec = $(st,'.md-rec');
    const cells = [...Array(6)].map(() => { const d = document.createElement('span'); d.style.cssText = 'width:36px;height:44px;border-radius:9px;border:1.5px solid var(--muted);background:var(--card);display:grid;place-items:center;font:600 20px var(--sans);font-variant-numeric:tabular-nums'; bx.appendChild(d); return d; });
    const psw = new Swap('code'), tsw = new Swap('code'), ph = new Track(0, S.soft), motion = motionSettings(st);
    const TL = { code:'Use a recovery code instead', rec:'Use the authenticator instead' }, TE = {};
    for (const k in TL){ const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = TL[k]; tg.appendChild(e); TE[k] = e; }
    let clearAt = 0, mode = 'code';
    const setPanes = () => [[code, 'code'], [rec, 'rec']].forEach(([el, k]) => {
      const active = k === mode;
      el.inert = !active;
      if (active) { el.removeAttribute('aria-hidden'); el.style.visibility = 'visible'; }
      else el.setAttribute('aria-hidden', 'true');
    });
    const jumpToMode = () => { psw.jump(mode); tsw.jump(mode); ph.jump((mode === 'rec' ? rec : code).offsetHeight); };
    setPanes();
    const say = (s, bad) => { sm.textContent = s; sm.style.color = bad ? 'var(--danger)' : 'var(--success)'; };
    const flip = () => { mode = mode === 'code' ? 'rec' : 'code'; const isRec = mode === 'rec';
      setPanes();
      if (motion.reduced()) jumpToMode();
      else { psw.to(mode); tsw.to(mode); ph.set((isRec ? rec : code).offsetHeight, S.soft); }
      sm.textContent = ''; (isRec ? ri : inp).focus({ preventScroll:true }); };
    inp.oninput = () => { inp.value = inp.value.replace(/\D/g,'').slice(0,6);
      cells.forEach((d,i) => d.textContent = inp.value[i] || '');
      if (inp.value.length === 6){ if (inp.value === '246810') say('Verified. Signing you in…'); else { say('That code didn’t match. Try again.', true); clearAt = now() + 1.1; } } };
    vf.onclick = () => { const v = ri.value.toLowerCase().replace(/[\s-]/g,'');
      if (v === 'appleorange4582') say('Recovery code accepted. Signing you in…'); else say('That code didn’t match. Try again.', true); };
    tg.onclick = flip;
    ph.jump(code.offsetHeight); panes.style.height = px(ph.at(now()));
    return t => { if (clearAt && t >= clearAt){ clearAt = 0; inp.value = ''; cells.forEach(d => d.textContent = ''); }
      if (motion.changedToReduced()) jumpToMode();
      panes.style.height = px(Math.max(0, ph.at(t)));
      psw.apply(code, 'code', t); if (mode === 'code') code.style.visibility = 'visible';
      psw.apply(rec, 'rec', t); if (mode === 'rec') rec.style.visibility = 'visible';
      for (const k in TE) tsw.apply(TE[k], k, t); };
  }});

atom({ id:'auth-reset', cat:'Auth', name:'Password reset', block:'auth, password, recovery', fam:['M','S'],
  html:`<div class="card col" style="width:min(320px,92%);padding:14px;gap:8px"><b style="font-size:15px;font-weight:600">Reset your password</b><div class="st-panes" style="position:relative;overflow:hidden"><div class="st-req col" style="position:absolute;inset:0 0 auto;gap:8px"><label class="small" style="font-weight:500" for="ars-em">Email</label><input id="ars-em" class="em" type="email" autocomplete="email" placeholder="you@studio.co" aria-label="Email" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><button class="go1" style="height:44px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Send reset link</button></div><div class="st-cf col" style="position:absolute;inset:0 0 auto;gap:8px"><label class="small" style="font-weight:500" for="ars-pw">New password</label><input id="ars-pw" class="pw" type="password" autocomplete="new-password" aria-label="New password" style="height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px"><div class="mt" style="display:flex;gap:4px" role="meter" aria-label="Password strength" aria-valuemin="0" aria-valuemax="4" aria-valuenow="0"><i></i><i></i><i></i><i></i></div><button class="go2" style="height:44px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;font-size:14px">Save new password</button></div></div><p class="sm small" style="font-size:12.5px;line-height:1.5;margin:0;min-height:19px"></p></div><div class="hint">Request, then save a 12 character password</div>`,
  desc:'Request swaps to a confirm step with a live strength meter. Short passwords stay on the step with a text error; a strong save lands a confirmation.',
  api:'step.to(request | confirm)   score(pw) 0-4   save requires score ≥ 3',
  init(st){
    const panes = $(st,'.st-panes'), req = $(st,'.st-req'), cf = $(st,'.st-cf'), em = $(st,'.em'), pw = $(st,'.pw');
    const sm = $(st,'.sm'), mt = $(st,'.mt'), segs = [...mt.querySelectorAll('i')];
    const sw = new Swap('request'), h = new Track(0, S.soft), motion = motionSettings(st);
    segs.forEach(s => s.style.cssText = 'flex:1;height:4px;border-radius:2px;background:var(--raised)');
    let step = 'request';
    const setPanes = (active) => [[req, 'request'], [cf, 'confirm']].forEach(([el, k]) => {
      const live = k === active;
      el.inert = !live;
      if (live) { el.removeAttribute('aria-hidden'); el.style.visibility = 'visible'; }
      else el.setAttribute('aria-hidden', 'true');
    });
    const heightFor = (next) => next === 'request' ? req.offsetHeight : next === 'confirm' ? cf.offsetHeight : 0;
    const jumpToStep = () => { sw.jump(step); h.jump(heightFor(step)); setPanes(step); };
    const go = (next, focus) => {
      step = next; setPanes(next);
      if (motion.reduced()) { sw.jump(next); h.jump(heightFor(next)); }
      else { sw.to(next); h.set(heightFor(next), S.soft); }
      focus?.focus({ preventScroll:true });
    };
    setPanes(step);
    const say = (s, bad) => { sm.textContent = s; sm.style.color = bad ? 'var(--danger)' : 'var(--success)'; };
    const score = v => Math.min(4, (v.length >= 8 ? 1 : 0) + (v.length >= 12 ? 1 : 0) + (/[a-z]/.test(v) && /[A-Z]/.test(v) ? 1 : 0) + (/\d/.test(v) && /[^a-zA-Z0-9]/.test(v) ? 1 : 0));
    $(st,'.go1').onclick = () => { if (!/^\S+@\S+\.\S+$/.test(em.value.trim())){ say('Enter an email like you@studio.co.', true); return; }
      go('confirm', pw); say('Link sent. Choose a new password.'); };
    const paint = () => { const s = score(pw.value); mt.setAttribute('aria-valuenow', s);
      segs.forEach((g,i) => g.style.background = i < s ? (s < 3 ? 'var(--warning)' : 'var(--success)') : 'var(--raised)'); return s; };
    pw.oninput = paint; paint();
    $(st,'.go2').onclick = () => { if (paint() < 3){ say('Use 12 or more characters with mixed case, a number, and a symbol.', true); return; }
      say('Password saved. Signing you in…'); };
    h.jump(req.offsetHeight); panes.style.height = px(h.at(now()));
    return t => { if (motion.changedToReduced()) jumpToStep();
      panes.style.height = px(Math.max(0, h.at(t)));
      sw.apply(req, 'request', t); if (step === 'request') req.style.visibility = 'visible';
      sw.apply(cf, 'confirm', t); if (step === 'confirm') cf.style.visibility = 'visible'; };
  }});

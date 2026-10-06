

atom({ id:'signupfields', cat:'Newsletter', name:'Signup fields', block:'newsletter, form', fam:['M','S'],
  html:`<div class="card col" style="width:min(360px,92%);padding:16px;gap:8px;line-height:1.55"><b style="font-size:15px;font-weight:600;line-height:1.5">Join the letter</b><span class="muted" style="font-size:12.5px;line-height:1.5">Name first, then a valid email.</span><label class="fw" style="position:relative;display:block;height:54px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);cursor:text;margin-top:4px"><span class="lb" style="position:absolute;left:13px;top:16px;transform-origin:0 0;color:var(--faint);font-size:14px">First name</span><input class="nm" type="text" autocomplete="off" style="position:absolute;left:12px;right:40px;bottom:7px;border:0;background:none;color:var(--ink);font-size:14px;outline:none;padding:0"><span class="ic" style="position:absolute;right:12px;top:17px;width:18px;height:18px;display:grid;place-items:center;padding:0;transform:translateY(.5px)"></span></label><label class="fw2" style="position:relative;display:block;height:54px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);cursor:text"><span class="lb2" style="position:absolute;left:13px;top:16px;transform-origin:0 0;color:var(--faint);font-size:14px">Email address</span><input class="em" type="email" autocomplete="off" style="position:absolute;left:12px;right:40px;bottom:7px;border:0;background:none;color:var(--ink);font-size:14px;outline:none;padding:0"><span class="ic2" style="position:absolute;right:12px;top:17px;width:18px;height:18px;display:grid;place-items:center;padding:0;transform:translateY(.5px)"></span></label><div class="er" style="position:relative;overflow:hidden;height:0"><span class="small" role="alert" style="display:block;padding-top:6px;color:var(--danger);font-size:12.5px">Enter an address like name@example.com</span></div><button class="go" style="height:44px;min-height:36px;border-radius:10px;border:0;background:var(--ink);color:var(--card);font-weight:600;font-size:14px;cursor:pointer">Subscribe</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="lv" checked> validate as I type</label></div><div class="hint">Leave email wrong once, then fix it</div>`,
  desc:'Labels float on focus. A complete field snaps a success check; an incomplete one rings danger with a message. A valid form holds subscribed.',
  api:'float.set(focus||value) · ok.set(1, S.snap) · bad.set(1) → ring + message',
  init(st){
    const mk = (fs, ls, is, icn) => { const fw = $(st,fs), lb = $(st,ls), inp = $(st,is), ic = $(st,icn);
      const okI = document.createElement('span'); okI.className = 'layer'; okI.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>'; ic.appendChild(okI);
      const f = new Track(0), ok = new Track(0), bad = new Track(0), sw = new Swap(-1);
      const sync = () => f.set(document.activeElement === inp || inp.value ? 1 : 0);
      inp.onfocus = sync; inp.onblur = sync;
      return { fw, lb, inp, f, ok, bad, sw, okI, sync }; };
    const A = mk('.fw','.lb','.nm','.ic'), B = mk('.fw2','.lb2','.em','.ic2');
    const er = $(st,'.er'), msg = $(er,'span'), lv = $(st,'.lv'), go = $(st,'.go'), done = new Track(0);
    const okMail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(B.inp.value);
    const paint = F => t => { const p = clamp(F.f.at(t)), g = clamp(F.ok.at(t)), k = clamp(F.bad.at(t));
      F.lb.style.transform = `translateY(${(-9*p).toFixed(2)}px) scale(${(1-.2*p).toFixed(4)})`;
      F.lb.style.color = k > .5 ? 'var(--danger)' : g > .5 ? 'var(--success)' : 'var(--faint)';
      F.fw.style.borderColor = `color-mix(in oklab, var(--danger) ${(k*100).toFixed(1)}%, color-mix(in oklab, var(--success) ${(g*100).toFixed(1)}%, var(--line)))`;
      F.sw.apply(F.okI, 0, t, 0); };
    const pA = paint(A), pB = paint(B);
    B.inp.oninput = () => { if (!lv.checked) return;
      if (B.bad.target && okMail()){ B.bad.set(0); B.ok.set(1, S.snap); B.sw.to(0); } };
    go.onclick = () => { const goodN = A.inp.value.trim().length > 1, goodE = okMail();
      A.ok.set(goodN ? 1 : 0, S.snap); A.bad.set(goodN ? 0 : 1); A.sw.to(goodN ? 0 : -1);
      B.ok.set(goodE ? 1 : 0, S.snap); B.bad.set(goodE ? 0 : 1); B.sw.to(goodE ? 0 : -1);
      B.inp.setAttribute('aria-invalid', !goodE);
      if (goodN && goodE){ done.set(1); go.textContent = 'You’re subscribed'; } };
    return t => { pA(t); pB(t); const k = clamp(B.bad.at(t));
      er.style.height = px(k*msg.offsetHeight); fade(msg, k, (1-k)*-4);
      go.style.background = mix(clamp(done.at(t)), 'var(--success)', 'var(--ink)'); };
  }});

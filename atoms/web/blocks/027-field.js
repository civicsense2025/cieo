

atom({ id:'field', cat:'Interactive', name:'Text field', block:'form, newsletter', fam:['M','S'],
  html:`<div class="col" style="width:min(320px,88%);gap:0"><label class="fw" style="position:relative;display:block;height:54px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);cursor:text"><span class="lb" style="position:absolute;left:13px;top:16px;transform-origin:0 0;color:var(--faint)">Email address</span><input id="fld-email" type="email" autocomplete="off" style="position:absolute;left:12px;right:40px;bottom:7px;border:0;background:none;color:var(--ink);font:15px var(--sans);outline:none;padding:0"><span class="ic" style="position:absolute;right:12px;top:17px;width:18px;height:18px"><svg class="layer" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg><svg class="layer" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.25" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/></svg></span></label><div class="er" style="position:relative;overflow:hidden;height:0"><span class="small" role="alert" style="display:block;padding-top:6px;color:var(--danger)">Enter an address like name@example.com</span></div></div><div class="hint">Type an address, then press Tab</div>`,
  desc:'The label floats on focus. On blur the field settles into one of three states: neutral, valid in the success color with a check, or invalid in the danger color with a message.',
  api:'status.to(valid ? "ok" : "error")   border = mix(status color, line)',
  init(st){
    const fw = $(st,'.fw'), lb = $(st,'.lb'), inp = $(st,'input'), er = $(st,'.er'), msg = $(er,'span'), icons = $$(st,'.ic svg');
    const f = new Track(0), fo = new Track(0), ok = new Track(0), bad = new Track(0), sw = new Swap(-1);
    const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
    const status = s => { ok.set(s === 0 ? 1 : 0); bad.set(s === 1 ? 1 : 0); sw.to(s); inp.setAttribute('aria-invalid', s === 1); };
    const sync = () => f.set(document.activeElement === inp || inp.value ? 1 : 0);
    inp.onfocus = () => { sync(); fo.set(1); };
    inp.oninput = () => { if (bad.target && valid()) status(0); else if (ok.target && !valid()) status(-1); };
    inp.onblur = () => { sync(); fo.set(0); status(!inp.value ? -1 : valid() ? 0 : 1); };
    return t => { const p = clamp(f.at(t)), g = clamp(ok.at(t)), k = clamp(bad.at(t)), q = clamp(fo.at(t));
      lb.style.transform = `translateY(${px(-9*p)}) scale(${(1 - .2*p).toFixed(4)})`;
      const base = mix(q,'var(--ink)','var(--line)');
      fw.style.borderColor = `color-mix(in oklab, var(--danger) ${(k*100).toFixed(1)}%, color-mix(in oklab, var(--success) ${(g*100).toFixed(1)}%, ${base}))`;
      lb.style.color = k > .5 ? 'var(--danger)' : g > .5 ? 'var(--success)' : 'var(--faint)';
      icons.forEach((el,i) => sw.apply(el, i, t, 0));
      er.style.height = px(k*msg.offsetHeight); fade(msg, k, (1-k)*-4); };
  }});
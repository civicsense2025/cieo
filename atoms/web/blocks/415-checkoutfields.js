atom({ id:'checkoutfields', cat:'Forms', name:'Checkout fields', block:'checkout form, inputs, validation', fam:['S','M'],
  html:`<div class="col" style="gap:8px;width:min(320px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Payment details</h4><div class="fd" style="position:relative"><input class="in nm" id="co-nm" type="text" placeholder=" " autocomplete="off" style="height:44px;width:100%;border:1.5px solid var(--muted);border-radius:9px;padding:14px 12px 4px;font-size:14px;line-height:1.5;background:var(--card)"><label for="co-nm" class="lb lb0" style="position:absolute;left:12px;top:12px;font-size:14px;color:var(--muted);pointer-events:none;line-height:1.5">Full name</label><span class="ok ok0" style="position:absolute;right:10px;top:12px;color:var(--success);opacity:0">✓</span><div class="em em0" style="position:relative;min-height:18px;font-size:12px;line-height:1.5;display:grid"></div></div><div class="fd" style="position:relative"><input class="in em2" id="co-em" type="email" placeholder=" " autocomplete="off" style="height:44px;width:100%;border:1.5px solid var(--muted);border-radius:9px;padding:14px 12px 4px;font-size:14px;line-height:1.5;background:var(--card)"><label for="co-em" class="lb lb1" style="position:absolute;left:12px;top:12px;font-size:14px;color:var(--muted);pointer-events:none;line-height:1.5">Email</label><span class="ok ok1" style="position:absolute;right:10px;top:12px;color:var(--success);opacity:0">✓</span><div class="em em1" style="position:relative;min-height:18px;font-size:12px;line-height:1.5;display:grid"></div></div><button class="btn go" style="height:36px;border-radius:9px">Pay $24.00</button><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="lv" checked> Validate live</label></div><div class="hint">Leave a field empty, then fix it</div>`,
  desc:'Labels snap up on focus or fill. An invalid submit rings danger and swaps in a message; fixing a field swaps it out and stamps a success check that holds.',
  api:'label.set(float, snap)   err.set(1); msg.to(err)   ok.set(valid)',
  init(st){
    const F = [0, 1].map(i => ({ inp:$(st, '.in.nm,.in.em2'.split(',')[i] || '.in'), lb:$(st, '.lb' + i), em:$(st, '.em' + i), ok:$(st, '.ok' + i), fl:new Track(0), er:new Track(0), gd:new Track(0) }));
    F[0].inp = $(st, '.nm'); F[1].inp = $(st, '.em2');
    const msgs = ['Enter your full name', 'Enter a valid email'];
    const layers = F.map((f, i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.position = 'relative'; e.style.gridArea = '1/1'; e.style.minWidth = '0'; e.style.overflowWrap = 'anywhere'; e.style.color = 'var(--danger)'; e.textContent = msgs[i]; f.em.appendChild(e); return e; });
    const sw = [new Swap(-1), new Swap(-1)], lv = $(st, '.lv'), go = $(st, '.go');
    const valid = (i, v) => i ? /^\S+@\S+\.\S+$/.test(v.trim()) : v.trim().length > 1;
    const paint = (f, i) => { const on = document.activeElement === f.inp || f.inp.value; f.fl.set(on ? 1 : 0, S.snap); };
    F.forEach((f, i) => { f.inp.onfocus = () => paint(f, i); f.inp.onblur = () => paint(f, i);
      f.inp.oninput = () => { paint(f, i); if (!lv.checked) return; const v = valid(i, f.inp.value);
        f.er.set(f.inp.value && !v ? 1 : 0); sw[i].to(f.inp.value && !v ? i : -1); if (v){ f.gd.set(1); } }; });
    go.onclick = () => { let first = -1;
      F.forEach((f, i) => { const v = valid(i, f.inp.value); f.er.set(v ? 0 : 1); sw[i].to(v ? -1 : i); if (v) f.gd.set(1); if (!v && first < 0) first = i; });
      if (first >= 0){ F[first].inp.focus(); return; }
      go.textContent = '✓ Paid — receipt sent'; go.disabled = true; };
    return t => { F.forEach((f, i) => { const fl = clamp(f.fl.at(t)), er = clamp(f.er.at(t)), gd = clamp(f.gd.at(t));
        f.lb.style.transform = `translateY(${(-fl * 9).toFixed(2)}px) scale(${(1 - fl * .18).toFixed(3)})`; f.lb.style.transformOrigin = 'left top';
        f.inp.style.borderColor = mix(er, 'var(--danger)', 'var(--muted)'); f.inp.style.boxShadow = `0 0 0 ${(er * 3).toFixed(1)}px color-mix(in oklab, var(--danger) ${(er * 18).toFixed(1)}%, transparent)`;
        f.ok.style.opacity = gd.toFixed(3); f.ok.style.transform = `scale(${(.6 + .4 * gd).toFixed(3)})`;
        layers.forEach((el, k) => { if (k === i) sw[i].apply(el, i, t); else { el.style.opacity = '0'; el.style.visibility = 'hidden'; } }); }); };
  }});

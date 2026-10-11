

atom({ id:'signupform', cat:'Newsletter', name:'Popup, slide-in and bar', block:'newsletter, announcement', fam:['X','E'], wide:true, tall:true,
  html:`<div class="col" style="width:min(560px,94%);gap:10px;align-items:flex-start"><div class="seg sm" style="display:flex"><div class="ind"></div><button>Popup</button><button>Slide-in</button><button>Top bar</button></div><div class="site card" style="position:relative;width:100%;height:240px;overflow:hidden"><div class="small muted" style="padding:16px;line-height:1.7"><b style="color:var(--ink);font-size:16px">Field Notes</b><br>A weekly letter about rivers, routes and slow mornings. The sign-up form appears after 1.2 seconds, the way it would for a visitor.</div><div class="scr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none"></div><div class="fm card" style="position:absolute;padding:16px;visibility:hidden"><button class="x" aria-label="Close" style="position:absolute;top:8px;right:8px;border:0;background:none;cursor:pointer;color:var(--muted)">${ic(I.x,14)}</button><div class="v0"><b class="tt" style="display:block">Get the Sunday letter</b><span class="small muted ds">One email a week. Unsubscribe any time.</span><div class="row in" style="margin-top:10px;gap:6px"><input id="sf-email" type="email" placeholder="you@example.com" aria-label="Email" style="flex:1;min-width:0;border:1.5px solid var(--muted);border-radius:8px;padding:7px 9px;background:var(--bg);color:var(--ink);font:13px var(--sans)"><button class="btn ink jn">Join</button></div></div><div class="v1 layer" style="font-weight:500;color:var(--success);gap:8px"><span class="tk" style="display:flex">${ic(I.check,16,2.5)}</span><span>You’re on the list</span></div></div></div><button class="btn rp">Replay</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="ck" checked> Check + tint confirmation</label></div>`,
  desc:'Three ways to show one sign-up form. A popup scales up over a scrim, a slide-in rises from the corner, and a bar drops from the top without blocking. Each waits 1.2 seconds, and closing is quicker than opening.',
  api:'show at t0 + 1.2   popup: scale .96→1 + scrim · slide-in: y 24→0 · bar: y −100%→0',
  init(st){
    const seg = $(st,'.sm'), ind = $(seg,'.ind'), btns = $$(seg,'button'), site = $(st,'.site'), scr = $(st,'.scr'), fm = $(st,'.fm');
    const jn = $(fm,'.jn'), ck = $(st,'.ck'), v0 = $(fm,'.v0'), v1 = $(fm,'.v1'), tk = $(fm,'.tk');
    v1.style.pointerEvents = 'none';
    const e = edges(0,0), o = new Track(0), csw = new Swap(0), dn = new Track(0); let mode = 0, at = 0;
    const tint = on => { tk.style.display = ck.checked ? '' : 'none'; return on && ck.checked ? 1 : 0; };
    const join = () => { if (csw.cur === 1) return; const t0 = now(), g = tint(true);
      if (REDUCE){ csw.cur = 1; csw.prev = 0; csw.t = t0; dn.jump(g); } else { csw.to(1); dn.set(g, S.base, t0 + EXIT); } };
    const resetOk = () => { if (REDUCE){ csw.cur = 0; csw.prev = null; csw.t = -9; dn.jump(0); } else { csw.to(0); dn.set(0, S.snap); } };
    jn.onclick = join;
    ck.onchange = () => { if (csw.cur === 1){ const g = tint(true); if (REDUCE) dn.jump(g); else dn.set(g); } };
    const layout = () => { const S2 = fm.style; S2.left = S2.right = S2.top = S2.bottom = S2.width = ''; S2.borderRadius = '14px';
      if (mode === 0){ S2.left = '50%'; S2.top = '50%'; S2.width = '270px'; } else if (mode === 1){ S2.right = '12px'; S2.bottom = '12px'; S2.width = '240px'; } else { S2.left = '0'; S2.right = '0'; S2.top = '0'; S2.borderRadius = '0'; }
      $(fm,'.ds').style.display = mode === 2 ? 'none' : ''; $(fm,'.in').style.marginTop = mode === 2 ? '6px' : '10px'; };
    const replay = () => { o.jump(0); resetOk(); at = now() + 1.2; };
    const sel = (i, inst) => { mode = i; const b = btns[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); layout(); replay(); };
    btns.forEach((b,i) => b.onclick = () => sel(i)); $(st,'.rp').onclick = replay; $(fm,'.x').onclick = () => o.set(0, S.snap); scr.onclick = () => o.set(0, S.snap);
    const init = () => sel(mode, true); document.fonts.ready.then(() => e.jump(btns[mode].offsetLeft, btns[mode].offsetLeft + btns[mode].offsetWidth)); requestAnimationFrame(init);
    return t => { if (at && t >= at){ at = 0; o.set(1); } const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)'});
      const p = clamp(o.at(t)); fm.style.opacity = p.toFixed(3); fm.style.visibility = p < .01 ? 'hidden' : 'visible'; fm.style.pointerEvents = p > .5 ? 'auto' : 'none';
      csw.apply(v0, 0, t); csw.apply(v1, 1, t); fm.style.background = mix(clamp(dn.at(t)), 'var(--success-tint)', 'var(--card)');
      scr.style.opacity = (mode === 0 ? p*.35 : 0).toFixed(3); scr.style.pointerEvents = mode === 0 && p > .5 ? 'auto' : 'none';
      fm.style.transform = mode === 0 ? `translate(-50%, calc(-50% + ${px((1-p)*8)})) scale(${(.96+.04*p).toFixed(4)})` : mode === 1 ? `translateY(${px((1-p)*24)})` : `translateY(${((p - 1)*100).toFixed(2)}%)`; };
  }});
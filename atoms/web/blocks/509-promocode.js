atom({ id:'promocode', cat:'Commerce', name:'Promo code', block:'cart, coupon, discount', fam:['M','S'],
  html:`<div class="card col" style="width:min(300px,92%);padding:14px;gap:8px"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600">Order total</b><span class="tt num" style="font-size:15px;font-weight:600;font-variant-numeric:tabular-nums"></span></div><button class="lk" style="border:0;background:none;color:var(--accent);cursor:pointer;font-size:13px;line-height:1.5;text-align:left;padding:0">Have a code?</button><div class="fd" style="overflow:hidden;max-height:0"><div class="row" style="gap:8px"><input class="in" placeholder="TRY SHIP10" aria-label="Promo code" style="flex:1;height:38px;border-radius:9px;border:1.5px solid var(--muted);padding:0 10px;font-size:14px;min-width:0"><button class="ap" style="position:relative;height:38px;padding:0 14px;border-radius:9px;border:0;background:var(--ink);color:var(--card);font-weight:500;cursor:pointer;min-width:76px"><span class="tx">Apply</span></button></div><p class="msg small" style="font-size:12.5px;line-height:1.5;margin:6px 0 0;min-height:19px"></p></div><span class="chip" style="display:none;align-self:flex-start;height:30px;padding:0 12px;border-radius:15px;background:var(--raised);font-size:13px;font-weight:600;align-items:center"></span><label class="row small muted" style="gap:6px;font-size:12.5px"><input type="checkbox" class="st" checked> Auto-apply best code</label></div><div class="hint">Type SHIP10, then try a bad code</div>`,
  desc:'The field grows open on the base spring. Apply spins, then the success chip width-springs in while the discount rolls. A bad code rings danger with an inline fix, never only at submit.',
  api:'open.set(H); apply: spin → ok.set(1)/err.ring()   off.set(10); chipW.set(measure)',
  init(st){
    const fd = $(st,'.fd'), ap = $(st,'.ap'), tx = $(st,'.tx'), msg = $(st,'.msg'), chip = $(st,'.chip'), inp = $(st,'.in');
    const open = new Track(0), ok = new Track(0), off = new Track(0), cw = new Track(0), ring = new Track(0);
    const TOTAL = 82; let shown = false, busy = false, bad = null;
    const paint = () => { const v = TOTAL - off.target; $(st,'.tt').textContent = money(off.at() || v); };
    off.jump(0); $(st,'.tt').textContent = money(TOTAL);
    $(st,'.lk').onclick = () => { shown = !shown; open.set(shown ? 1 : 0); if (shown) setTimeout(() => inp.focus(), 200); };
    inp.oninput = () => { msg.textContent = inp.value.length ? 'Codes are 6 letters — try SHIP10.' : ''; msg.style.color = 'var(--ink)'; inp.style.borderColor = 'var(--muted)'; };
    ap.onclick = () => { if (busy || !shown) return; const code = inp.value.trim().toUpperCase(); busy = true; bad = null;
      msg.textContent = ''; const t0 = now();
      const tick = () => { if (now() - t0 > .9){ busy = false; tx.textContent = 'Apply';
          if (code === 'SHIP10'){ off.set(10); ok.set(1); ring.set(0); chip.style.display = 'inline-flex'; chip.textContent = 'SHIP10 · −$10'; cw.set(chip.textContent.length*7.4 + 24); msg.textContent = ''; }
          else { bad = now(); ring.set(1); ok.set(0); off.set(0); chip.style.display = 'none'; msg.textContent = 'That code didn’t work. Check spelling — try SHIP10.'; msg.style.color = 'var(--danger)'; inp.style.borderColor = 'var(--danger)'; }
          return; } tx.textContent = '···'; requestAnimationFrame(tick); };
      tick(); };
    $(st,'.st').onchange = e => { if (e.target.checked){ inp.value = 'SHIP10'; } };
    return t => { const H = 108; fd.style.maxHeight = (clamp(open.at(t))*H).toFixed(0) + 'px'; fd.style.opacity = clamp(open.at(t)).toFixed(3);
      const g = clamp(ok.at(t)); ap.style.background = mix(g,'var(--success)','var(--ink)');
      if (busy) tx.textContent = ['···','·· ·','· ··'][(Math.floor(t*8)%3)];
      chip.style.width = px(cw.at(t)); chip.style.opacity = g.toFixed(3);
      if (bad) inp.style.transform = `translateX(${(Math.sin((t-bad)*28)*4*Math.exp(-(t-bad)*6)).toFixed(2)}px)`;
      const v = TOTAL - clamp(off.at(t), 0, TOTAL); $(st,'.tt').textContent = money(v);
      msg.style.opacity = clamp(ring.at(t) + (msg.textContent ? 1 : 0)).toFixed(3); };
  }});

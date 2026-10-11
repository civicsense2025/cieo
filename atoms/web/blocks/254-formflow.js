

atom({ id:'formflow', cat:'Layout', name:'Multi-column flow', block:'form, checkout, settings', fam:['D','M'], wide:true,
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Multi-column flow</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">Fields reflow between two columns and one without jumping. An error swaps in and pushes the rows below it.</p></div><div class="row small muted" style="gap:8px;align-items:center"><span class="fl" style="position:relative;display:inline-block;min-width:150px;min-height:20px"></span></div><div class="ff card" style="width:min(440px,94%);padding:14px 16px"><div class="grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label class="small" style="font-size:13px;line-height:1.5">Name<input class="in" style="display:block;width:100%;margin-top:4px;min-height:32px;border-radius:8px;border:1.5px solid var(--muted);padding:6px 10px;font-size:13px" value="Ada"></label><label class="small" style="font-size:13px;line-height:1.5">Email<input class="im" style="display:block;width:100%;margin-top:4px;min-height:32px;border-radius:8px;border:1.5px solid var(--muted);padding:6px 10px;font-size:13px" placeholder="you@site.com"></label><div class="err small" style="grid-column:1/-1;overflow:hidden;font-size:12px;color:var(--danger);line-height:1.5">Email is needed before you can save.</div><label class="small" style="font-size:13px;line-height:1.5">City<input style="display:block;width:100%;margin-top:4px;min-height:32px;border-radius:8px;border:1.5px solid var(--muted);padding:6px 10px;font-size:13px" value="Lagos"></label><label class="small" style="font-size:13px;line-height:1.5">Zip<input style="display:block;width:100%;margin-top:4px;min-height:32px;border-radius:8px;border:1.5px solid var(--muted);padding:6px 10px;font-size:13px" value="10001"></label></div></div><div class="row" style="gap:8px;align-items:center"><button class="btn bF" style="min-height:32px">Save</button><button class="btn bW" style="min-height:32px">2-col / 1-col</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="lv" checked> live error</label></div></div><div class="hint">Toggle columns, then save with an empty email</div>`,
  desc:'Fields reflow between two columns and one with FLIP springs, so nothing jumps. An empty email swaps its error in and pushes the rows below on springs. A clean save holds a success terminal.',
  api:'FLIP: dy.jump(old-new); dy.set(0, base, t0+i*.02)   err.set(1) pushes rows   save: success.set(1), hold',
  init(st){
    const grid = $(st,'.grid'), err = $(st,'.err'), mail = $(st,'.im'), btn = $(st,'.bF'), sw = new Swap(0);
    const L = ['Draft','Missing email','Saved'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; $(st,'.fl').appendChild(e); return e; });
    const flds = [...grid.children].map(el => ({ el, dy:new Track(0) }));
    const eh = new Track(0), sv = new Track(0);
    let one = false;
    err.style.height = '0px'; err.style.opacity = '0';
    const flip = fn => { const a = flds.map(f => f.el.offsetTop); fn();
      const b = flds.map(f => f.el.offsetTop), t0 = now(), dead = REDUCE;
      flds.forEach((f, i) => { const d = a[i] - b[i]; if (!d){ f.dy.jump(0); return; }
        if (dead) f.dy.jump(0); else { f.dy.jump(d); f.dy.set(0, S.base, t0 + i*.02); } }); };
    const showErr = on => { flip(() => { if (REDUCE || !$(st,'.lv').checked){ eh.jump(on ? 20 : 0); } else eh.set(on ? 20 : 0, S.base); });
      sw.to(on ? 1 : sv.at() > .5 ? 2 : 0); };
    $(st,'.bW').onclick = () => { one = !one; flip(() => { grid.style.gridTemplateColumns = one ? '1fr' : '1fr 1fr'; }); };
    mail.oninput = () => { if (mail.value.trim()){ showErr(false); sv.set(0, S.base); } };
    btn.onclick = () => { if (!mail.value.trim()){ showErr(true); mail.focus(); return; }
      showErr(false); sw.to(2); sv.set(1, S.base); btn.disabled = true; btn.textContent = 'Saved'; };
    return t => { flds.forEach(f => { f.el.style.transform = `translateY(${px(f.dy.at(t))})`; });
      err.style.height = px(Math.max(0, eh.at(t))); err.style.opacity = clamp(eh.at(t) / 20).toFixed(3);
      const s = clamp(sv.at(t)); btn.style.background = mix(s, 'var(--success)', 'var(--card)');
      L.forEach((e,k) => sw.apply(e, k, t)); };
  }});

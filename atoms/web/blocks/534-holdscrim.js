atom({ id:'holdscrim', cat:'Overlays', name:'Hold scrim dismiss', block:'Press-hold 500ms dismiss', fam:['X'], tall:true,
  html:`<div class="ph card" style="position:relative;width:min(250px,80%);height:230px;overflow:hidden;display:grid;place-items:center"><button class="btn ink op" style="min-height:36px">Open preview</button><div class="sr" role="button" tabindex="0" aria-label="Press and hold to dismiss" style="position:absolute;inset:0;background:var(--ink);opacity:0;touch-action:none;display:grid;place-items:center"><span class="ring" style="width:44px;height:44px;border-radius:50%;border:3px solid #fff;display:grid;place-items:center;padding:0;color:#fff;font-size:12px">500</span></div><b class="tt" style="position:absolute;bottom:14px;font-size:15px;font-weight:600">Hold the shade to dismiss</b></div><div class="hint">Press dims deeper \u00b7 hold 500ms dismisses</div><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px;font-size:12px"><input type="checkbox" class="kb" checked> Space holds too</label>`,
  desc:'Pressing dims the scrim deeper as a snap preview. Holding 500ms dismisses; releasing early springs back. Space held works the same.',
  api:'press: dim snap preview; hold 0.5s dismiss; early release springs back',
  init(st){
    const sr = $(st,'.sr'), ring = $(st,'.ring'), dim = new Track(0), prog2 = new Track(0); let t0 = 0, on = false, timer = 0, done = false;
    const set = v => { on = v; openSet(dim, v); if (v){ done = false; t0 = now(); prog2.jump(0); } };
    $(st,'.op').onclick = ev => { last = ev.currentTarget; set(true); sr.focus(); };
    let last = null;
    const start = () => { if (!on || done) return; clearTimeout(timer); prog2.set(1, { w:2 }); timer = setTimeout(() => { done = true; dismiss(); }, 500); };
    const cancel = () => { clearTimeout(timer); if (!done && on) prog2.set(0, S.snap); };
    const dismiss = () => { on = false; dim.set(0, S.snap); prog2.jump(0); last?.focus?.(); };
    sr.addEventListener('pointerdown', e => { sr.setPointerCapture(e.pointerId); dim.set(1, S.snap); start(); });
    sr.addEventListener('pointerup', () => { if (!done){ dim.set(1); cancel(); } }); sr.addEventListener('pointercancel', cancel);
    sr.addEventListener('keydown', ev => { if ((ev.key === ' ' || ev.key === 'Enter') && $(st,'.kb').checked && !ev.repeat){ ev.preventDefault(); dim.set(1, S.snap); start(); } });
    sr.addEventListener('keyup', ev => { if (ev.key === ' ' || ev.key === 'Enter'){ ev.preventDefault(); if (!done){ dim.set(1); cancel(); } } });
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && on) dismiss(); });
    return t => { const d = clamp(dim.at(t)), p = clamp(prog2.at(t)); sr.style.opacity = (d*.35+p*.3).toFixed(3); sr.style.pointerEvents = d > .02 ? 'auto' : 'none';
      ring.style.transform = `scale(${(.9+.1*d).toFixed(3)})`; ring.style.opacity = d.toFixed(2); ring.textContent = done ? '\u2713' : String(Math.max(0, Math.ceil((1-p)*500))); };
  }});

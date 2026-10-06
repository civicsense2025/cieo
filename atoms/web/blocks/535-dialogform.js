atom({ id:'dialogform', cat:'Overlays', name:'Dialog form steps', block:'Pinned header footer Swap body', fam:['X','S'], tall:true,
  html:`<button class="btn ink op" style="min-height:36px">Invite member</button><div class="sr" style="position:absolute;inset:0;background:var(--ink);opacity:0;pointer-events:none"></div><div class="dl card" role="dialog" aria-modal="true" aria-labelledby="df-t" style="position:absolute;left:50%;top:50%;width:min(270px,86%);padding:18px 20px;visibility:hidden;border-radius:15px"><b id="df-t" style="display:block;font-size:15px;font-weight:600;line-height:1.5">Invite to Common Room</b><div class="bd" style="position:relative;min-height:74px;margin:10px 0 12px"></div><div class="row" style="justify-content:flex-end;gap:8px;border-top:1px solid var(--line-soft);padding-top:12px"><button class="btn cs" style="min-height:36px">Cancel</button><button class="btn ink nx" style="min-height:36px">Continue</button></div><p class="er small" style="color:var(--danger);font-size:12.5px;line-height:1.5;min-height:18px;margin:8px 0 0"></p></div><div class="hint">Step 1 of 2 \u00b7 invalid shakes danger</div><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px;font-size:12px"><input type="checkbox" class="fx" checked> focus first invalid</label>`,
  desc:'Header and footer stay pinned while only the body swaps on base. Invalid fields turn danger with a message, valid ones show a success check.',
  api:'body.to(step, base only); invalid: danger + message + focus',
  init(st){
    const sr = $(st,'.sr'), dl = $(st,'.dl'), bd = $(st,'.bd'), er = $(st,'.er'), o = new Track(0), sw = new Swap(0); let step = 0, last = null;
    const pages = [['Email', 'maya@studio.co', 'email'], ['Role', 'Editor', 'text']];
    const layers = pages.map(([lb, ph, type], k) => { const w = document.createElement('div'); w.className = 'layer'; w.style.width = '100%';
      w.innerHTML = `<label class="small" style="display:block;font-size:13px;line-height:1.5;margin-bottom:6px">${lb}</label><div class="row" style="gap:8px"><input class="in" type="${type}" value="${ph}" aria-label="${lb}" style="flex:1;height:36px;border:1px solid var(--line);border-radius:9px;padding:0 10px;font-size:13.5px"><span class="ck" style="width:24px;height:24px;border-radius:50%;display:grid;place-items:center;padding:0;font-size:13px"></span></div>`; bd.appendChild(w); return w; });
    const inputs = layers.map(w => w.querySelector('.in')), cks = layers.map(w => w.querySelector('.ck'));
    const set = v => { openSet(o, v); if (v){ last = document.activeElement; setTimeout(() => inputs[step].focus(), 0); } else last?.focus?.(); };
    $(st,'.op').onclick = ev => { last = ev.currentTarget; step = 0; sw.cur = 0; sw.prev = null; er.textContent = ''; set(true); };
    $(dl,'.cs').onclick = () => set(false); sr.onclick = () => set(false);
    $(dl,'.nx').onclick = () => { const v = inputs[step].value.trim(); const bad = step === 0 ? !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) : v.length < 2;
      if (bad){ inputs[step].style.borderColor = 'var(--danger)'; cks[step].textContent = ''; er.textContent = step === 0 ? 'Enter an email like maya@studio.co.' : 'Give a role with at least 2 letters.';
        if ($(st,'.fx').checked) inputs[step].focus(); return; }
      inputs[step].style.borderColor = 'var(--success)'; cks[step].textContent = '\u2713'; cks[step].style.color = 'var(--success)';
      er.textContent = ''; if (step === 0){ step = 1; sw.to(1); setTimeout(() => inputs[1].focus(), 120); } else set(false); };
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape' && o.target) set(false); });
    return t => { const p = clamp(o.at(t)); sr.style.opacity = (p*.35).toFixed(3); sr.style.pointerEvents = p > .5 ? 'auto' : 'none';
      dl.style.opacity = p.toFixed(3); dl.style.visibility = p < .01 ? 'hidden' : 'visible'; dl.style.transform = `translate(-50%,calc(-50% + ${px((1-p)*8)})) scale(${(.96+.04*p).toFixed(4)})`; dl.style.pointerEvents = p > .5 ? 'auto' : 'none';
      layers.forEach((e,k) => sw.apply(e,k,t)); };
  }});

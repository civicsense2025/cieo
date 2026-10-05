

atom({ id:'undosend', cat:'Email', name:'Undo send', block:'form (submit), Toast', fam:['M','T','S'], tall:true,
  html:`<div class="cm card col" style="position:absolute;left:50%;top:50%;width:min(300px,86%);padding:14px;gap:8px;transform-origin:50% 100%"><span class="small muted">To: maya@studio.co</span><b class="small">Re: Spring launch</b><p class="small" style="margin:0">Looks great. Ship it Thursday.</p><button class="btn ink sd" style="align-self:flex-end">Send</button></div><div class="ts card row" style="position:absolute;left:50%;bottom:16px;padding:10px 12px;gap:10px;visibility:hidden;white-space:nowrap"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="var(--raised)" stroke-width="3"/><circle class="rg" cx="12" cy="12" r="9" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1" transform="rotate(-90 12 12)"/></svg><span class="lb small" style="position:relative;width:150px;height:20px"></span><button class="btn un" style="padding:4px 10px">Undo</button></div>`,
  desc:'Send shrinks the draft away and a toast takes over with a ring that empties over 5 seconds. Undo brings the draft back exactly. When the ring runs out, the toast swaps to a success “Sent”.',
  api:'ring = 1 − (t − tSend)/5   undo: draft.o.set(1)   at 5s: label.to("sent")',
  init(st){
    const cm = $(st,'.cm'), ts = $(st,'.ts'), rg = $(st,'.rg'), lb = $(st,'.lb'), un = $(st,'.un');
    const L = ['Sending in 5 s', 'Sent'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; if (i){ e.innerHTML = `<span style="display:inline-flex;gap:5px;align-items:center;color:var(--success);font-weight:500">${ic(I.check,13,3)}Sent to Maya</span>`; } else e.textContent = s; lb.appendChild(e); return e; });
    const co = new Track(1), to = new Track(0), sw = new Swap(0); let ts0 = 0, sent = false;
    $(st,'.sd').onclick = () => { co.set(0, S.snap); to.set(1, S.base, now() + .12); ts0 = now() + .12; sent = false; sw.cur = 0; sw.prev = null; sw.t = -9; un.style.display = ''; };
    un.onclick = () => { ts0 = 0; to.set(0, S.snap); co.set(1, S.base, now() + .1); };
    return t => { const c = clamp(co.at(t)), o = clamp(to.at(t));
      cm.style.opacity = c.toFixed(3); cm.style.transform = `translate(-50%, -50%) translateY(${px((1 - c)*20)}) scale(${(.92 + .08*c).toFixed(4)})`; cm.style.pointerEvents = c > .5 ? 'auto' : 'none';
      ts.style.opacity = o.toFixed(3); ts.style.visibility = o < .01 ? 'hidden' : 'visible'; ts.style.transform = `translateX(-50%) translateY(${px((1 - o)*12)})`;
      if (ts0){ const left = 5 - (t - ts0); rg.style.strokeDashoffset = (1 - clamp(left/5)).toFixed(4); L[0].textContent = `Sending in ${Math.max(1, Math.ceil(left))} s`;
        if (left <= 0 && !sent){ sent = true; sw.to(1); un.style.display = 'none'; ts0 = 0; setTimeout(() => { to.set(0, S.snap); co.set(1, S.base, now() + .3); }, 2200/clock.scale); } }
      L.forEach((e,k) => sw.apply(e,k,t)); };
  }});
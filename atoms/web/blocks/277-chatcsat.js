
atom({ id:'chatcsat', cat:'Forms', name:'CSAT in chat', block:'chat, CSAT', fam:['M','S','T'],
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:8px;align-items:center"><b style="font-size:15px;font-weight:600;line-height:1.5;align-self:flex-start">How did I do?</b><svg class="bf" width="56" height="56" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="var(--ink)" stroke-width="2.5"/><circle class="e1" cx="23" cy="26" r="3" fill="var(--ink)"/><circle class="e2" cx="41" cy="26" r="3" fill="var(--ink)"/><path class="mo" fill="none" stroke="var(--ink)" stroke-width="2.75" stroke-linecap="round"/></svg><div class="row fc" role="radiogroup" aria-label="Rate the answer" style="gap:6px"></div><span class="lb small" style="position:relative;height:20px;min-width:180px;font-size:12px"></span><span class="ty small" style="position:relative;height:20px;min-width:180px;font-size:12px"></span><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px;align-self:flex-start"><input type="checkbox" class="tk" checked> Thank-you note on pick</label></div><div class="hint">Hover the faces, then pick one</div>`,
  desc:'Faces rise in on soft with a stagger. One mood value drives the big face, so hovering reads as a single expression changing. The caption swaps per score.',
  api:'face[i] rises at t0 + i·0.05 (S.soft)   mood → mouth + eyes   caption.swap.to(score)',
  init(st){
    const N = ['Very unhappy','Unhappy','Neutral','Happy','Very happy'];
    const FACE = i => { const sad = 2 - i, lift = i - 2;
      return `<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="17" cy="${19 - lift*.6}" r="2.6" fill="currentColor"/><circle cx="31" cy="${19 - lift*.6}" r="2.6" fill="currentColor"/><path d="M15 ${31 - sad*1.6 + lift*1.2} Q24 ${31 + sad*2.2 - lift*2.4} 33 ${31 - sad*1.6 + lift*1.2}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`; };
    const mo = $(st,'.mo'), e1 = $(st,'.e1'), e2 = $(st,'.e2'), fc = $(st,'.fc'), lb = $(st,'.lb'), ty = $(st,'.ty'), tk = $(st,'.tk');
    const bf = $(st,'.bf'); bf.style.transformBox = 'fill-box'; bf.style.transformOrigin = 'center';
    const L = ['', ...N].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.color = 'var(--muted)'; e.textContent = s; lb.appendChild(e); return e; });
    const Y = ['', 'Thanks — logged.'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; if (i) e.style.color = 'var(--success)'; ty.appendChild(e); return e; });
    Y[1].textContent = '';
    const mood = new Track(.5), sw = new Swap(0), tsw = new Swap(0), pop = new Track(0), en = new Track(0);
    let sel = -1; const t0 = now(); if (REDUCE) en.jump(1); else en.set(1);
    const thanks = i => `Thanks — logged as ${N[i]}.`;
    tk.onchange = () => { if (!tk.checked) tsw.to(0); else if (sel >= 0){ Y[1].textContent = thanks(sel); tsw.to(1); } };
    const btns = N.map((n,i) => { const b = document.createElement('button'); b.setAttribute('role','radio'); b.setAttribute('aria-label', n);
      b.innerHTML = FACE(i); b.style.cssText = 'width:36px;height:36px;border-radius:10px;border:1.5px solid var(--muted);background:var(--card);display:grid;place-items:center;padding:0;cursor:pointer';
      b.onpointerenter = () => { mood.set(i/4, REDUCE ? S.snap : S.soft); sw.to(i + 1); };
      b.onpointerleave = () => { mood.set(sel < 0 ? .5 : sel/4, REDUCE ? S.snap : S.soft); sw.to(sel + 1); };
      b.onclick = () => { sel = i; const t = now();
        btns.forEach((x,j) => { x.setAttribute('aria-checked', j === i); x.style.background = j === i ? 'var(--ink)' : 'var(--card)'; x.style.color = j === i ? 'var(--card)' : 'var(--ink)'; });
        Y[1].textContent = thanks(i);
        if (REDUCE){ mood.jump(i/4); pop.jump(0); if (tk.checked){ tsw.cur = 1; tsw.prev = 0; tsw.t = t; } }
        else { mood.set(i/4, S.soft); pop.set(1, S.soft); setTimeout(() => pop.set(0, S.soft), 180/clock.scale);
          if (tk.checked) setTimeout(() => tsw.to(1), 380/clock.scale); } };
      fc.appendChild(b); return b; });
    return t => { const m = mood.at(t), c = lerp(-8, 10, m);
      mo.setAttribute('d', `M20 ${(42 - c*.3).toFixed(2)} Q32 ${(42 + c).toFixed(2)} 44 ${(42 - c*.3).toFixed(2)}`);
      bf.style.transform = `scale(${(1 + .12*clamp(pop.at(t))).toFixed(4)})`;
      const ey = (26 - 2*m).toFixed(2); e1.setAttribute('cy', ey); e2.setAttribute('cy', ey);
      const e = REDUCE ? 1 : clamp(en.at(t));
      btns.forEach((b,i) => { const p = REDUCE ? 1 : clamp(prog(t, t0 + i*.05, S.soft)); fade(b, Math.min(e, p), (1-p)*10); });
      L.forEach((el,k) => sw.apply(el,k,t)); Y.forEach((el,k) => tsw.apply(el,k,t)); };
  }});

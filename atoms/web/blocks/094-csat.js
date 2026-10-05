

atom({ id:'csat', cat:'Forms', name:'Satisfaction faces', block:'form (CSAT), reviews', fam:['M','E'],
  html:`<div class="col" style="align-items:center;gap:14px"><svg class="bf" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="var(--ink)" stroke-width="2.5"/><circle class="e1" cx="23" cy="26" r="3" fill="var(--ink)"/><circle class="e2" cx="41" cy="26" r="3" fill="var(--ink)"/><path class="mo" fill="none" stroke="var(--ink)" stroke-width="2.75" stroke-linecap="round"/></svg><div class="row fc" role="radiogroup" aria-label="How satisfied are you?" style="gap:6px"></div><span class="lb small muted" style="position:relative;height:20px;width:200px"></span></div>`,
  desc:'One large face holds a continuous mood value. Its mouth curve and eye height follow the hovered or chosen score on a spring, so moving across the scale reads as one expression changing.',
  api:'mouth.cy = lerp(−8, 10, mood.at(t))   label.to(score)',
  init(st){
    const mo = $(st,'.mo'), e1 = $(st,'.e1'), e2 = $(st,'.e2'), fc = $(st,'.fc'), lb = $(st,'.lb'), N = ['Very unhappy','Unhappy','Neutral','Happy','Very happy'];
    const L = ['', ...N].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; lb.appendChild(e); return e; });
    const mood = new Track(.5), sw = new Swap(0); let sel = -1;
    const btns = N.map((n,i) => { const b = document.createElement('button'); b.setAttribute('role','radio'); b.setAttribute('aria-label', n); b.textContent = i + 1; b.className = 'btn'; b.style.cssText += 'width:40px;height:40px;padding:0;font-weight:600';
      b.onpointerenter = () => { mood.set(i/4); sw.to(i + 1); }; b.onpointerleave = () => { mood.set(sel < 0 ? .5 : sel/4); sw.to(sel + 1); };
      b.onclick = () => { sel = i; btns.forEach((x,j) => { x.setAttribute('aria-checked', j === i); x.style.background = j === i ? 'var(--ink)' : 'var(--card)'; x.style.color = j === i ? 'var(--card)' : 'var(--ink)'; }); }; fc.appendChild(b); return b; });
    return t => { const m = mood.at(t), c = lerp(-8, 10, m); mo.setAttribute('d', `M20 ${(42 - c*.3).toFixed(2)} Q32 ${(42 + c).toFixed(2)} 44 ${(42 - c*.3).toFixed(2)}`);
      const ey = (26 - 2*m).toFixed(2); e1.setAttribute('cy', ey); e2.setAttribute('cy', ey); L.forEach((e,k) => sw.apply(e,k,t)); };
  }});
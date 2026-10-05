

atom({ id:'loadbar', cat:'Files and browsing', name:'Page load bar', block:'site-header, reading-progress', fam:['T','X'], tall:true,
  html:`<div class="card" style="position:relative;width:min(340px,90%);height:240px;overflow:hidden"><i class="lb" style="position:absolute;left:0;top:0;height:3px;background:var(--accent);opacity:0"></i><nav class="row small" style="gap:14px;padding:14px 16px;border-bottom:1px solid var(--line-soft)"></nav><div class="pg" style="position:relative;height:170px"></div></div>`,
  desc:'While a page loads, the bar creeps toward 90% on an easing curve and never stalls at a fixed point. When the page arrives it springs to the end and fades, and the content swaps.',
  api:'creep = 0.9·(1 − e^(−(t − t0)/0.9))   done: bar.set(1); o.set(0, t + 0.2)',
  init(st){
    const lb = $(st,'.lb'), nav = $(st,'nav'), pg = $(st,'.pg'), P = [['Home','A weekly letter about rivers, routes and slow mornings.'],['Archive','142 issues since 2023, newest first.'],['About','Written by Maya Chen from a small studio by the river.']];
    const panes = P.map(([h,p]) => { const d = document.createElement('div'); d.className = 'layer'; d.style.cssText += 'flex-direction:column;align-items:flex-start;justify-content:flex-start;padding:16px;white-space:normal;gap:6px'; d.innerHTML = `<b style="font-size:18px">${h}</b><span class="small muted">${p}</span>`; pg.appendChild(d); return d; });
    const sw = new Swap(0), fin = new Track(0), o = new Track(0); let t0 = 0, doneAt = 0, target = 0, done = true;
    P.forEach(([h],i) => { const a = document.createElement('a'); a.href = '#'; a.textContent = h; a.style.cssText = 'color:var(--ink);text-decoration:none;font-weight:500'; a.onclick = e => { e.preventDefault(); if (i === sw.cur) return; t0 = now(); doneAt = t0 + .9 + Math.random()*1.4; target = i; done = false; fin.jump(0); o.jump(1); }; nav.appendChild(a); });
    return t => { let w; if (!done){ w = .9*(1 - Math.exp(-(t - t0)/.9)); if (t >= doneAt){ done = true; fin.jump(w).set(1, S.snap); o.set(0, S.base, t + .2); sw.to(target); } } else w = fin.at(t);
      lb.style.width = (clamp(w)*100).toFixed(2) + '%'; lb.style.opacity = clamp(o.at(t)).toFixed(3); panes.forEach((p,k) => sw.apply(p,k,t)); };
  }});


atom({ id:'countdown', cat:'Data', name:'Countdown', block:'countdown', fam:['S','T'],
  html:`<div class="col" style="align-items:center;gap:6px"><div class="cd num" style="font-size:40px;font-weight:600;letter-spacing:-.02em;display:flex;align-items:baseline"></div><div class="row small muted" style="gap:34px"><span>hours</span><span>min</span><span>sec</span></div><div class="cap small muted" style="display:grid;justify-items:center;margin-top:8px;height:20px"></div><div class="row small muted" style="gap:8px;margin-top:2px"><button class="btn end">Skip to end</button><button class="btn re">Restart</button></div></div>`,
  desc:'Remaining time is computed from the clock each frame. Only digits that change roll, each on its own swap. At zero the caption swaps to the done state and the digits take the success tint.',
  api:'digits.set(format(T − t))   done: swap.to(1) + success.set(1)',
  init(st){
    const cd = $(st,'.cd'), groups = [0,1,2].map(i => { if (i){ const c = document.createElement('span'); c.textContent = ':'; c.style.padding = '0 4px'; c.style.color = 'var(--faint)'; cd.appendChild(c); } const s = document.createElement('span'); cd.appendChild(s); return new Digits(s, 2); });
    const cap = $(st,'.cap'), sw = new Swap(0), done = new Track(0);
    const L = ['until doors open','Doors are open'].map(s => { const e = document.createElement('span'); e.style.cssText = 'grid-area:1/1;white-space:nowrap'; e.textContent = s; cap.appendChild(e); return e; });
    const T = 2*3600 + 14*60 + 9, f = s => { s = Math.max(0, Math.ceil(T - s)); return [Math.floor(s/3600), Math.floor(s/60)%60, s%60].map(v => String(v).padStart(2,'0')); };
    let last = '', t0 = 0, skip = 0;
    f(0).forEach((v,i) => groups[i].set(v, true));
    $(st,'.end').onclick = () => { skip = T; };
    $(st,'.re').onclick = () => { t0 = now(); skip = 0; last = ''; done.jump(0); sw.cur = 0; sw.prev = null; sw.t = -9; f(0).forEach((v,i) => groups[i].set(v, true)); };
    return t => { const el = (t - t0) + skip, v = f(el), k = v.join(), isDone = el >= T;
      if (k !== last){ last = k; v.forEach((x,i) => groups[i].set(x)); } groups.forEach(g => g.render(t));
      if (isDone !== (sw.cur === 1)) sw.to(isDone ? 1 : 0, t);
      if ((done.target === 1) !== isDone) done.set(isDone ? 1 : 0, S.base, t);
      const a = clamp(done.at(t)); cd.style.color = mix(a,'var(--success)','var(--ink)');
      L.forEach((e,i) => sw.apply(e, i, t)); };
  }});


atom({ id:'countdown', cat:'Data', name:'Countdown', block:'countdown', fam:['S','T'],
  html:`<div class="col" style="align-items:center;gap:6px"><div class="cd num" style="font-size:40px;font-weight:600;letter-spacing:-.02em;display:flex;align-items:baseline"></div><div class="row small muted" style="gap:34px"><span>hours</span><span>min</span><span>sec</span></div><span class="small muted" style="margin-top:8px">until doors open</span></div>`,
  desc:'Remaining time is computed from the clock each frame. Only digits that change roll, each on its own swap.',
  api:'digits.set(format(T − t))',
  init(st){
    const cd = $(st,'.cd'), groups = [0,1,2].map(i => { if (i){ const c = document.createElement('span'); c.textContent = ':'; c.style.padding = '0 4px'; c.style.color = 'var(--faint)'; cd.appendChild(c); } const s = document.createElement('span'); cd.appendChild(s); return new Digits(s, 2); });
    const T = 2*3600 + 14*60 + 9, f = s => { s = Math.max(0, Math.ceil(T - s)); return [Math.floor(s/3600), Math.floor(s/60)%60, s%60].map(v => String(v).padStart(2,'0')); };
    let last = ''; f(0).forEach((v,i) => groups[i].set(v, true));
    return t => { const v = f(t), k = v.join(); if (k !== last){ last = k; v.forEach((x,i) => groups[i].set(x)); } groups.forEach(g => g.render(t)); };
  }});
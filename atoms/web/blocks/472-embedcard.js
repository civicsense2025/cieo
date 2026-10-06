

atom({ id:'embedcard', cat:'Newsletter', name:'Embed card', block:'newsletter, embed', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:center;line-height:1.55"><button class="tr" style="height:44px;min-height:36px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-weight:600;font-size:14px;padding:0 18px;cursor:pointer">Get the Sunday letter</button><div class="card em" style="width:100%;padding:16px;transform-origin:top center"><b style="font-size:15px;font-weight:600">Stay in the loop</b><p class="muted" style="margin:4px 0 8px;font-size:13px;line-height:1.55">One thoughtful email a week.</p><form class="nf row" novalidate style="gap:8px"><input type="email" placeholder="you@example.com" aria-label="Email" style="flex:1;min-width:0;height:44px;border:1px solid var(--line);border-radius:10px;padding:0 12px;font-size:14px;background:var(--bg);color:var(--ink);outline:none"><button class="go" style="height:44px;min-height:36px;min-width:88px;border-radius:10px;border:0;background:var(--ink);color:var(--card);font-weight:600;font-size:14px;cursor:pointer">Join</button></form><div class="ok" style="position:relative;height:26px;font-size:13.5px;font-weight:600;color:var(--success)"></div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="cp" checked> collapse to referral row</label></div></div>`,
  desc:'The card grows from 97% of the trigger. A valid submit blur-swaps to a success check, then collapses to a referral row that holds.',
  api:'grow.set(1, S.base, .97→1) · ok.to(1) · slim.set(collapsed)',
  init(st){
    const tr = $(st,'.tr'), em = $(st,'.em'), nf = $(st,'.nf'), inp = $(st,'input'), cp = $(st,'.cp'), ok = $(st,'.ok');
    const O = ['','<span style="display:inline-grid;place-items:center;padding:0;transform:translateY(.5px)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg></span> You’re on the list'].map(h => { const x = document.createElement('span'); x.className = 'layer'; x.style.justifyContent = 'flex-start'; x.innerHTML = h; ok.appendChild(x); return x; });
    const grow = new Track(0), sw = new Swap(0), slim = new Track(0);
    let open = false, q = [];
    tr.onclick = () => { if (open) return; open = true; const t0 = now();
      if (REDUCE){ grow.jump(1); } else { grow.release(.97, 0, 1); } };
    nf.onsubmit = ev => { ev.preventDefault(); if (!open || sw.cur === 1) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)){ inp.focus(); inp.setAttribute('aria-invalid','true'); return; }
      inp.removeAttribute('aria-invalid'); const t0 = now();
      if (REDUCE){ sw.cur = 1; slim.jump(cp.checked ? 1 : 0); } else { sw.to(1); slim.set(cp.checked ? 1 : 0, S.base, t0 + .45); } };
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const g = clamp(grow.at(t)), s = clamp(slim.at(t));
      em.style.opacity = g.toFixed(3); em.style.visibility = g < .02 ? 'hidden' : 'visible';
      em.style.transform = `scale(${(.97+.03*g).toFixed(4)})`;
      O.forEach((x,i) => sw.apply(x,i,t));
      nf.style.opacity = (1-s).toFixed(3); nf.style.visibility = s > .98 ? 'hidden' : 'visible'; nf.style.height = ((1-s)*52).toFixed(1) + 'px'; nf.style.overflow = 'hidden';
      ok.style.opacity = s > .02 ? s.toFixed(3) : g.toFixed(3); };
  }});

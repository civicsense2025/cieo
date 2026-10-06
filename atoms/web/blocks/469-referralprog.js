

atom({ id:'referralprog', cat:'Newsletter', name:'Referral progress', block:'newsletter, referral', fam:['M','S'],
  html:`<div class="card col" style="width:min(360px,92%);padding:16px;gap:8px;line-height:1.55"><b style="font-size:15px;font-weight:600;line-height:1.5">Bring 5, get Plus free</b><span class="muted" style="font-size:12.5px;line-height:1.5">Each signup inks the next node.</span><div class="bar" style="position:relative;height:8px;border-radius:99px;background:var(--raised);overflow:hidden"><i style="position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:var(--ink)"></i></div><div class="nds row" style="gap:0;justify-content:space-between"></div><div class="row" style="gap:8px;align-items:baseline"><b class="ct num" style="font-size:14px;font-variant-numeric:tabular-nums"></b><span class="muted" style="font-size:12.5px">of 5 referrals</span></div><div class="rw" style="position:relative;height:24px;font-size:13px;font-weight:600"></div><button class="btn adv" style="min-height:36px;border-radius:9px">Invite one</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="tk" checked> reward tint</label></div>`,
  desc:'The bar fills on the lazy spring, milestone nodes ink 60ms apart, the count rides digits and the reward swaps to a check. Five of five holds.',
  api:'fill.set(p, S.lazy) · node[i].set(1, S.base, t0 + i*.06) · digits.set(n) · rw.to(done)',
  init(st){
    const fill = $(st,'.bar i'), nds = $(st,'.nds'), rw = $(st,'.rw'), tk = $(st,'.tk');
    const dots = [0,1,2,3,4].map(i => { const s = document.createElement('span'); s.style.cssText = 'display:grid;place-items:center;padding:0;width:22px;height:22px;border-radius:99px;border:1.5px solid var(--line);font-size:12px;transform:translateY(.5px)'; s.textContent = i+1; nds.appendChild(s); return { s, v:new Track(0) }; });
    const R = ['3 to go: stickers at 3','Reward unlocked — Plus is free'].map(s => { const x = document.createElement('span'); x.className = 'layer'; x.style.justifyContent = 'flex-start'; x.textContent = s; rw.appendChild(x); return x; });
    const rsw = new Swap(0), fillT = new Track(0, S.lazy), dg = new Digits($(st,'.ct'), 1); dg.set('0', true);
    let n = 0;
    $(st,'.adv').onclick = () => { if (n >= 5) return; n++; const t0 = now();
      if (REDUCE){ fillT.jump(n/5); dots.forEach((d,i) => d.v.jump(i < n ? 1 : 0)); dg.set(String(n), true); rsw.cur = n >= 5 ? 1 : 0; }
      else { fillT.set(n/5); dots.forEach((d,i) => { if (i === n-1) d.v.set(1, S.base, t0 + i*.06); }); dg.set(String(n)); rsw.to(n >= 5 ? 1 : 0); } };
    return t => { fill.style.width = (clamp(fillT.at(t))*100).toFixed(2) + '%'; dg.render(t);
      dots.forEach(d => { const k = clamp(d.v.at(t)); d.s.style.background = mix(k,'var(--ink)','transparent'); d.s.style.color = mix(k,'var(--card)','var(--muted)'); d.s.style.borderColor = mix(k,'var(--ink)','var(--line)'); });
      R.forEach((x,i) => rsw.apply(x,i,t));
      rw.style.color = (rsw.cur === 1 && tk.checked) ? 'var(--success)' : 'var(--ink)'; };
  }});



atom({ id:'setupwizard', cat:'Guidance', name:'Setup wizard', block:'onboarding wizard, setup', fam:['S','E','M'],
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="bc card" style="width:min(330px,94%);padding:14px 16px"><b style="font-size:15px;font-weight:600;line-height:1.5">Set up your space</b><div class="segbar" style="position:relative;height:6px;border-radius:99px;background:var(--raised);margin-top:10px"><div class="thumb" style="position:absolute;top:0;bottom:0;background:var(--accent);border-radius:99px"></div></div><div class="pn" style="position:relative;min-height:150px;margin-top:10px"></div><div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn bk" style="min-height:32px;padding:6px 12px;visibility:hidden">Back</button><span class="row" style="gap:6px"><button class="btn sk" style="min-height:32px;padding:6px 12px">Skip</button><button class="btn ink nx" style="min-height:32px;padding:6px 12px">Continue</button></span></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Jump:</span></div></div><div class="hint">Personal and team paths branch · Skip lands softly</div>`,
  desc:'The segmented thumb trails its edges across three or four steps while panels swap in the direction you travel. Team and personal branch apart; Done and Skipped both hold as terminals.',
  api:'thumb.go(l, r) trails .06   panel.to(step, dir·10px)   skip.to(skipped) · REDUCE: jump',
  init(st){
    const pn = $(st,'.pn'), bar = $(st,'.segbar'), thumb = $(st,'.thumb'), nx = $(st,'.nx'), bk = $(st,'.bk'), sk = $(st,'.sk'), tw = $(st,'.tw');
    const sw = new Swap(0), ind = edges(0, 40); let step = 0, team = false, dir = 1;
    const panel = inner => { const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += 'flex-direction:column;align-items:stretch;justify-content:flex-start;white-space:normal;gap:6px;text-align:left'; e.innerHTML = inner; pn.appendChild(e); return e; };
    const pickBtn = (label, sub, fn) => { const b = document.createElement('button'); b.style.cssText = 'border:0;background:var(--raised);border-radius:9px;padding:7px 13px;min-height:36px;cursor:pointer;font-size:14px;line-height:1.5;text-align:left'; b.innerHTML = `${label}<br><span class="small muted">${sub}</span>`; b.onclick = fn; return b; };
    const L = [];
    L.push(panel(`<b style="font-size:14px;line-height:1.5">Welcome in</b><span class="small muted" style="line-height:1.5">Four small choices and your space runs itself.</span>`));
    const type = panel(`<b style="font-size:14px;line-height:1.5">Who is this for?</b>`); L.push(type);
    const per = panel(`<b style="font-size:14px;line-height:1.5">Pick a theme</b>`); L.push(per);
    const tem = panel(`<b style="font-size:14px;line-height:1.5">How big is the team?</b>`); L.push(tem);
    L.push(panel(`<b style="font-size:14px;color:var(--success);line-height:1.5">All set ✓</b><span class="small muted" style="line-height:1.5">Your space is ready — invite someone to break it in.</span>`));
    L.push(panel(`<b style="font-size:14px;line-height:1.5">Skipped — defaults applied</b><span class="small muted" style="line-height:1.5">A calm personal space. Change anything later.</span>`));
    const PICK = [[type, [['Just me','A quiet personal desk.'],['My team','Shared queues and roles.']], v => { team = v === 1; go(v === 1 ? 3 : 2); }],
      [per, [['Warm paper','Soft and bookish.'],['Midnight','Dark and focused.']], () => go(4)],
      [tem, [['2 – 5 people','A tight crew.'],['6+ people','Bring the whole org.']], () => go(4)]];
    PICK.forEach(([el, opts, fn]) => opts.forEach(([label, sub], vi) => el.appendChild(pickBtn(label, sub, () => fn(vi)))));
    const N = () => 4, pos = s => { const w = bar.clientWidth || 280, n = N(), k = Math.min(s, n - 1); return [k*w/n, (k + 1)*w/n]; };
    const go = (n, inst) => { const R = REDUCE || inst; dir = n >= step ? 1 : -1; step = n;
      const [l, r] = pos(n > 4 ? 3 : n); R ? ind.jump(l, r) : ind.go(l, r);
      if (R){ sw.cur = n; sw.prev = null; sw.t = -9; } else sw.to(n);
      bk.style.visibility = (n === 0 || n > 3) ? 'hidden' : 'visible';
      nx.style.display = n > 3 ? 'none' : ''; sk.style.display = n > 3 ? 'none' : '';
      nx.textContent = n === 3 ? 'Finish' : 'Continue'; };
    const fwd = () => { if (step === 0) go(1); else if (step === 1) go(2); else if (step === 2 || step === 3) go(4); else if (step > 4) go(4); };
    nx.onclick = () => { if (step === 2 || step === 3){ go(4); return; } if (step === 1){ team = false; go(2); return; } fwd(); };
    bk.onclick = () => go(step === 4 ? (team ? 3 : 2) : (step === 2 || step === 3 ? 1 : Math.max(0, step - 1)));
    sk.onclick = () => go(5);
    [['1',0],['2',1],['3',2],['Done',4],['Skip',5]].forEach(([label,n]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = label; b.onclick = () => go(n, true); tw.appendChild(b); });
    go(0, true);
    addEventListener('resize', () => { const [l, r] = pos(step > 4 ? 3 : step); ind.jump(l, r); });
    return t => { const a = ind.A.at(t), b = ind.B.at(t); thumb.style.left = px(Math.min(a,b)); thumb.style.width = px(Math.max(2, Math.abs(b - a)));
      L.forEach((el,k) => sw.apply(el,k,t,10*dir)); };
  }});

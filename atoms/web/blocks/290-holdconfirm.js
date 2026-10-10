atom({ id:'holdconfirm', cat:'Scheduling', name:'Hold to confirm', block:'booking, confirm', fam:['M','S'],
  html:`<div class="col" style="width:min(320px,90%);margin:0 auto;gap:8px;line-height:1.5;align-items:center"><b style="font-size:15px;font-weight:600">Confirm your slot</b><div class="card" style="width:100%;padding:16px;display:flex;flex-direction:column;gap:10px;align-items:center"><p style="font-size:13px;margin:0">Tue 9:00 AM · 30 min · Room B</p><div class="pad" style="position:relative;width:64px;height:64px;border-radius:50%;display:grid;place-items:center;padding:0;cursor:pointer;touch-action:none" role="button" tabindex="0" aria-label="Press and hold to confirm"><i class="core" style="position:absolute;inset:8px;border-radius:50%;background:var(--card);display:grid;place-items:center"></i></div><div class="lb" style="position:relative;height:22px;font-size:13px;overflow:hidden"></div><div class="row small muted" style="gap:6px;align-items:center;border-top:1px solid var(--line);padding-top:10px;width:100%;justify-content:center"><span style="font-size:12px">Hold</span><button class="h0" style="min-height:32px;border-radius:8px;border:0;background:var(--raised);padding:0 10px;cursor:pointer;font-size:12px">0.6s</button><button class="h1" style="min-height:32px;border-radius:8px;border:0;background:var(--raised);padding:0 10px;cursor:pointer;font-size:12px">0.9s</button><button class="h2" style="min-height:32px;border-radius:8px;border:0;background:var(--raised);padding:0 10px;cursor:pointer;font-size:12px">1.2s</button></div></div></div><div class="hint">Press and hold the ring · release early to cancel</div>`,
  desc:'Holding fills the ring at a steady pace. Letting go early springs the fill back to zero. A full hold swaps the arrow for a check and the card holds its success tint as the terminal.',
  api:'hold: pv += dt/dur   release: bk.release(pv,0,0) springs back   full: sw.to(1), sv.set(1) hold',
  init(st){
    const pad = $(st,'.pad'), core = $(st,'.core'), lb = $(st,'.lb');
    const arrow = document.createElement('span'); arrow.textContent = '→';
    arrow.style.cssText = 'position:relative;font-size:20px;transform:translateY(-1px)';
    const check = document.createElement('span'); check.textContent = '✓';
    check.className = 'layer'; check.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;font-size:20px;color:var(--success);transform:translateY(-1px)';
    const aL = document.createElement('span'); aL.className = 'layer';
    aL.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center';
    aL.appendChild(arrow); core.appendChild(aL); core.appendChild(check);
    const L = ['Hold to confirm','Booked · Tue 9:00'].map(s => { const e = document.createElement('span');
      e.className = 'layer'; e.textContent = s;
      e.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center'; lb.appendChild(e); return e; });
    const sw = new Swap(0), bk = new Track(0), sv = new Track(0);
    let dur = .9, holding = false, pv = 0, done = false, last = now();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) dur = .001;
    const down = () => { if (done) return; holding = true; };
    const up = () => { if (done || !holding) return; holding = false; bk.release(pv, 0, 0, S.soft); };
    pad.addEventListener('pointerdown', e => { pad.setPointerCapture(e.pointerId); down(); });
    pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up);
    pad.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(); });
    pad.addEventListener('keyup', up);
    const hs = [$$(st,'.h0')[0] || $(st,'.h0'), $(st,'.h1'), $(st,'.h2')];
    const mark = () => hs.forEach((h,i) => h.style.boxShadow = [0.6,0.9,1.2][i] === dur ? 'inset 0 -2px 0 var(--ink)' : 'none');
    hs.forEach((h,i) => h.onclick = () => { dur = [.6,.9,1.2][i]; done = false; pv = 0; bk.jump(0); sw.to(0); sv.set(0); mark(); });
    mark();
    return t => { const dt = Math.min(.05, t - last); last = t;
      if (holding && !done){ pv = Math.min(1, pv + dt/dur);
        if (pv >= 1){ done = true; holding = false; sw.to(1); sv.set(1, S.base); } }
      else if (!done) pv = clamp(bk.at(t));
      pad.style.background = 'conic-gradient(var(--ink) ' + (clamp(done ? 1 : pv)*360).toFixed(1) + 'deg, var(--raised) 0deg)';
      sw.apply(aL, 0, t); sw.apply(check, 1, t);
      L.forEach((e,k) => sw.apply(e,k,t));
      const s = clamp(sv.at(t)); $(st,'.card').style.borderColor = mix(s,'var(--success)','var(--line)'); };
  }});

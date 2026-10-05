

atom({ id:'download', cat:'Files and browsing', name:'Download progress', block:'download, video', fam:['M','S','T'],
  html:`<div class="col" style="align-items:center;gap:10px"><button class="dl" aria-label="Download" style="position:relative;width:64px;height:64px;border-radius:50%;border:0;background:var(--card);box-shadow:var(--shadow);cursor:pointer;color:var(--ink)"><svg viewBox="0 0 64 64" width="64" height="64" style="position:absolute;inset:0" aria-hidden="true"><circle class="rg" cx="32" cy="32" r="29" fill="none" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 32 32)"/></svg><span class="ic" style="position:absolute;inset:0"></span></button><b class="small">annual-report.pdf</b><span class="st small muted num" style="position:relative;width:170px;height:20px"></span></div><button class="btn rs" style="position:absolute;top:10px;right:12px">Reset</button>`,
  desc:'The ring fills as bytes arrive, at an uneven real-world pace, while the icon swaps between download, pause and resume. Finishing turns the ring and icon success and the status rolls to “Open”.',
  api:'p += rate(t)·dt (paused: 0)   ring.dashoffset = 1 − p   done → icon.to("check"), color success',
  init(st){
    const dl = $(st,'.dl'), rg = $(st,'.rg'), ic2 = $(st,'.ic'), stx = $(st,'.st');
    const IC = { get:ic(I.up.replace('M12 19V5M6 11l6-6 6 6','M12 5v14M6 13l6 6 6-6'),22,2.25), pause:ic('<path d="M9 6v12M15 6v12"/>',20,2.5), play:ic('<path d="M8 5l11 7-11 7z"/>',18,2.25), check:ic(I.check,22,2.75) }, L = {};
    for (const k in IC){ const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = IC[k]; ic2.appendChild(e); L[k] = e; }
    const SS = { idle:'8.4 MB', run:'', paused:'Paused', done:'Done · Open' }, SL = {};
    for (const k in SS){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = SS[k]; if (k === 'done') e.style.color = 'var(--success)'; stx.appendChild(e); SL[k] = e; }
    const sw = new Swap('get'), ssw = new Swap('idle'), ok = new Track(0), shown = new Track(0, S.snap); let state = 'idle', p = 0, last = 0;
    dl.onclick = () => { if (state === 'idle' || state === 'paused'){ state = 'run'; sw.to('pause'); ssw.to('run'); dl.setAttribute('aria-label','Pause'); } else if (state === 'run'){ state = 'paused'; sw.to('play'); ssw.to('paused'); dl.setAttribute('aria-label','Resume'); } };
    $(st,'.rs').onclick = () => { state = 'idle'; p = 0; shown.jump(0); sw.to('get'); ssw.to('idle'); ok.set(0); dl.setAttribute('aria-label','Download'); };
    return t => { const dt = Math.max(0, t - last); last = t; if (state === 'run'){ p = Math.min(1, p + dt*(.12 + .1*Math.sin(t*2.7) + .06*Math.sin(t*7.1))); shown.jump(p); SL.run.textContent = `${(p*8.4).toFixed(1)} of 8.4 MB`; if (p >= 1){ state = 'done'; sw.to('check'); ssw.to('done'); ok.set(1); dl.setAttribute('aria-label','Open'); } }
      const g = clamp(ok.at(t)); rg.style.strokeDashoffset = (1 - clamp(shown.at(t))).toFixed(4); rg.style.stroke = mix(g,'var(--success)','var(--ink)'); dl.style.color = mix(g,'var(--success)','var(--ink)');
      for (const k in L) sw.apply(L[k], k, t, 6); for (const k in SL) ssw.apply(SL[k], k, t); };
  }});
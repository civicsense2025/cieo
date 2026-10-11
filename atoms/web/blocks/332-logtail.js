
atom({ id:'logtail', cat:'Dynamic', name:'Streaming log tail', block:'log, feed', fam:['S','M'], tall:true,
  html:`<div class="card col" style="width:min(420px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Deploy log</b><span class="pl small num" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums">Live tail</span></div><div class="box col" style="gap:0;height:132px;overflow-y:auto;overflow-x:hidden;border-radius:10px;padding:6px 10px;background:var(--raised)"></div><div class="cap small muted" style="font-size:12px;line-height:1.5">Stuck to the latest · scroll up to read back</div><div class="row" style="gap:8px;align-items:center"><button class="btn ps" aria-label="Pause or resume" style="min-height:32px;position:relative"></button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="sk" checked> stick to latest</label></div></div><div class="hint">New rows open, then fade up</div>`,
  desc:'A new row opens its height first, then fades up into place while older rows spring down. The tail auto-sticks unless you scrolled up to read back.',
  api:'row.h.set(1, S.base) → o.set(1)   olds.y.release(-8, v, 0)   stick: scrollTop = scrollHeight',
  init(st){
    const box = $(st,'.box'), cap = $(st,'.cap'), ps = $(st,'.ps'), sk = $(st,'.sk'), pl = $(st,'.pl');
    const sw = new Swap(0), L = ['Pause','Resume'].map(x => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = x; ps.appendChild(e); return e; });
    const EV = ['build ok','tests 42/42','edge push 200','cache warm','canary 5%','migrate up','dns cut','tls ok','p99 180ms','sweep done'];
    let rows = [], n = 0, paused = false, next = .6, userUp = false;
    box.onscroll = () => { userUp = box.scrollHeight - box.scrollTop - box.clientHeight > 30; };
    const add = t => { const r = document.createElement('div');
      r.style.cssText = 'display:block;overflow:hidden;max-width:100%;min-height:22px;font-size:13px;line-height:1.5;font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis';
      r.innerHTML = `<span class="c" style="display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-height:22px;line-height:1.5"><span style="color:var(--accent)">✓</span> <span class="m"></span> <span class="ts small muted" style="font-size:12px"></span></span>`;
      box.appendChild(r);
      const ts = new Date(Date.now()).toLocaleTimeString('en-US',{hour12:false});
      const label = EV[n % EV.length];
      $(r,'.m').textContent = label; $(r,'.ts').textContent = '#' + (++n) + ' · ' + ts;
      r.title = label + ' #' + n + ' · ' + ts;
      const h = new Track(REDUCE ? 1 : 0), o = new Track(REDUCE ? 1 : 0), y = new Track(0);
      rows.forEach(x => { if (!REDUCE){ x.y.jump(x.y.at(t) - 8); x.y.set(0, S.base, t); } });
      rows.push({ r, h, o, y, c:$(r,'.c') });
      if (!REDUCE){ h.set(1, S.base, t); o.set(1, S.base, t + EXIT); }
      while (rows.length > 12){ const x = rows.shift(); x.r.remove(); } };
    ps.onclick = () => { paused = !paused; sw.to(paused ? 1 : 0); };
    return t => { if (!paused && t >= next){ add(t); next = t + .9; }
      rows.forEach(x => { const h = x.h.at(t);
        const hh = h <= 0.01 ? 0 : Math.max(22, h*26);
        x.r.style.height = hh.toFixed(2) + 'px';
        fade(x.c, x.o.at(t), (1 - x.o.at(t))*6 + x.y.at(t)); });
      if (sk.checked && !userUp && !paused) box.scrollTop = box.scrollHeight;
      pl.textContent = paused ? 'Paused' : (userUp ? 'Reading back' : 'Live tail');
      cap.textContent = paused ? 'Paused · settled on row ' + n : (userUp ? 'You scrolled up · new rows wait below' : 'Stuck to the latest · row ' + n);
      L.forEach((e,k) => sw.apply(e,k,t)); };
  }});

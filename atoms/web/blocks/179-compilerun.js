

atom({ id:'compilerun', cat:'Writing', name:'Compile run', block:'manuscript export, progress bar', fam:['S','T'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="gap:8px;margin:0 auto;width:min(320px,90%);padding:12px"><div class="cp-track" style="height:8px;border-radius:5px;background:var(--raised);overflow:hidden"><div class="cp-bar" style="height:100%;width:0;border-radius:5px;background:var(--ink)"></div></div><div class="row cp-ticks" style="gap:8px"></div><div class="row" style="justify-content:space-between;align-items:center"><span class="cp-st small" style="position:relative;width:170px;height:20px"></span><button class="cp-run" style="height:32px;border-radius:10px;padding:0 16px;cursor:pointer">Run</button></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Weave footnotes</span></label><div class="hint">Run builds the manuscript</div>`,
  desc:'Run creeps the bar to most of the way on the clock, then springs it shut. Chapter ticks land one after another and the status swaps to open the book.',
  api:'run(): creep→0.9; done: p.set(1,base); ticks+60ms; swap.to(open)',
  init(st){
    const bar = $(st,'.cp-bar'), ticks = $(st,'.cp-ticks'), holder = $(st,'.cp-st'), run = $(st,'.cp-run');
    const N = 5, tk = []; let t0 = -9, done = -9, live = false;
    for (let i = 0; i < N; i++){ const d = document.createElement('span'); d.className = 'small muted'; d.textContent = 'ch' + (i+1); d.style.opacity = '.25'; ticks.appendChild(d); tk.push({ d, on:false, f:-9 }); }
    const mk = html => { const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = html; holder.appendChild(e); return e; };
    const L0 = mk('<span class="muted">Ready to compile</span>');
    const L1 = mk('<span class="muted">Weaving chapters…</span>');
    const L2 = mk('<span style="color:var(--success);font-weight:600">Open manuscript →</span>');
    const sw = new Swap(0);
    const fin = new Track(0);
    run.onclick = () => {
      if (live) return;
      live = true; t0 = now(); done = -9; fin.jump(0); sw.to(1);
      tk.forEach(o => { o.on = false; o.f = -9; o.d.style.opacity = '.25'; });
      run.style.opacity = '.4';
    };
    return t => {
      let p = 0;
      if (live){
        const creep = Math.min(.9, (t - t0)/2.2*.9);
        tk.forEach((o,i) => { const ft = t0 + .4 + i*.06; if (t >= ft && !o.on){ o.on = true; o.f = t; } });
        if (creep >= .9 && done < 0){ done = t; fin.set(1, S.base, t); sw.to(2); live = 'done'; }
        if (done < 0) p = creep; else { p = .9 + .1*clamp(prog(t, done, S.base)); if (p > .999){ live = false; run.style.opacity = '1'; } }
      } else if (done >= 0) p = 1;
      bar.style.width = (p*100).toFixed(1) + '%';
      tk.forEach(o => { if (o.on) o.d.style.opacity = (.25 + .75*clamp(prog(t, o.f, S.base))).toFixed(3); });
      const f = clamp(fin.at(t)); bar.style.background = f > .5 ? 'var(--success)' : 'var(--ink)';
      sw.apply(L0, 0, t); sw.apply(L1, 1, t); sw.apply(L2, 2, t);
    };
  }});



atom({ id:'surveyblock', cat:'Newsletter', name:'Reader survey', block:'newsletter, survey', fam:['M','S'], tall:true,
  html:`<div class="card col" style="width:min(380px,92%);padding:16px;gap:8px;line-height:1.55"><b style="font-size:15px;font-weight:600;line-height:1.5">Two quick questions</b><div class="pg" style="height:6px;border-radius:99px;background:var(--raised);overflow:hidden"><i style="display:block;height:100%;border-radius:99px;background:var(--ink)"></i></div><div class="pn" style="position:relative;min-height:150px;overflow:hidden"></div><div class="th" style="position:relative;height:0;overflow:hidden;text-align:center"></div><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;font-size:12.5px"><input type="checkbox" class="sb" checked> show progress</label></div><button class="btn rs" style="position:absolute;top:10px;right:12px;min-height:36px;border-radius:9px">Reset</button>`,
  desc:'Panels slide sideways between questions while progress fills. Thanks morphs to a success tint with a digit count. The count holds.',
  api:'slide.set(i, S.base) + Swap(i) · prog.set(i/2) · thanks: tint + digits',
  init(st){
    const pn = $(st,'.pn'), th = $(st,'.th'), fill = $(st,'.pg i'), sb = $(st,'.sb'), pg = $(st,'.pg');
    const Q = [['How often do you open us?',['Every week','Monthly','Rarely']],['What do you want more of?',['Rivers','Kitchens','Maps']]];
    const sw = new Swap(0), slide = new Track(0), prog = new Track(0), tint = new Track(0);
    const num = document.createElement('b'); num.className = 'num'; num.style.cssText = 'font-variant-numeric:tabular-nums;font-size:14px;line-height:1.5'; th.appendChild(num);
    const dg2 = new Digits(num, 3); dg2.set('   ', true);
    let qi = 0, answers = 0;
    const panels = Q.map(([q, opts], pi) => { const d = document.createElement('div'); d.className = 'layer'; d.style.cssText = 'flex-direction:column;gap:8px;align-items:stretch';
      d.innerHTML = `<span style="font-size:13.5px;font-weight:600;line-height:1.5"></span><div class="col" style="gap:8px"></div>`;
      d.querySelector('span').textContent = q; const list = d.querySelector('.col');
      opts.forEach(o => { const b = document.createElement('button'); b.textContent = o;
        b.style.cssText = 'min-height:44px;border-radius:10px;border:0;background:var(--raised);font-size:13.5px;cursor:pointer;color:var(--ink)';
        b.onclick = () => next(); list.appendChild(b); });
      pn.appendChild(d); return d; });
    const thL = document.createElement('div'); thL.className = 'layer'; thL.style.justifyContent = 'center';
    thL.innerHTML = '<span style="display:inline-grid;place-items:center;padding:0;transform:translateY(.5px)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg></span><span style="font-size:13.5px;font-weight:600">Thanks — counted.</span>';
    th.appendChild(thL);
    const tsw = new Swap(0);
    const next = () => { if (qi > 1) return; qi++; answers++;
      if (REDUCE){ slide.jump(-qi*100); prog.jump(qi/2); sw.cur = Math.min(qi,1); }
      else { slide.set(-qi*100); prog.set(qi/2); sw.to(Math.min(qi,1)); }
      if (qi > 1){ tsw.to(1); tint.set(1); dg2.set('128'); } };
    $(st,'.rs').onclick = () => { qi = 0; answers = 0; slide.jump(0); prog.jump(0); tint.jump(0); sw.cur = 0; sw.prev = null; tsw.cur = 0; dg2.set('   ', true); };
    return t => { panels.forEach((p,i) => { sw.apply(p, i > 1 ? 1 : i, t);
        p.style.transform = `translateX(${(slide.at(t) + i*100).toFixed(2)}%)`; });
      fill.style.width = (clamp(prog.at(t))*100).toFixed(1) + '%'; pg.style.display = sb.checked ? '' : 'none';
      th.style.height = px(clamp(tint.at(t))*64); tsw.apply(thL, 1, t); dg2.render(t);
      $(st,'.card').style.background = mix(clamp(tint.at(t)), 'var(--success-tint)', 'var(--card)'); };
  }});



atom({ id:'stepper', cat:'Content', name:'Stepper', block:'stepper', fam:['E','M','S'],
  html:`<div class="col" style="width:min(360px,90%);gap:14px"><div class="sp" style="position:relative;height:30px"><div style="position:absolute;left:15px;right:15px;top:14px;height:2px;background:var(--line)"></div><div class="fill" style="position:absolute;left:15px;top:14px;height:2px;background:var(--ink)"></div></div><div class="row small muted lbl" style="justify-content:space-between"><span>Account</span><span>Domain</span><span>Theme</span><span>Publish</span></div><div class="fin" role="status" style="position:relative;height:30px"><span class="layer small muted">Finish to publish your site.</span><span class="layer"><span class="small" style="background:var(--accent-tint);color:var(--accent);font-weight:600;padding:4px 6px 4px 10px;border-radius:999px;display:inline-flex;align-items:center;gap:6px">Published — nice work <button class="btn redo" style="padding:2px 9px;font-size:12px">Start over</button></span></span></div><div class="row" style="justify-content:space-between;align-items:center"><span class="row small muted" style="gap:6px">Confirmation <button class="btn cf-on" aria-pressed="true" style="padding:2px 9px;font-size:12px">On</button><button class="btn cf-off" aria-pressed="false" style="padding:2px 9px;font-size:12px">Off</button></span><span class="row" style="gap:6px"><button class="btn back">Back</button><button class="btn ink next">Next</button></span></div></div>`,
  desc:'The connector fills first, then the next node inks in after the lag. Completed nodes swap their number for a check. Finish swaps in a sticky success confirmation.',
  api:'line.set(step); node[i].set(step >= i, S.base, t + LAG)   finish: done.to(1, S.base) · REDUCE: instant',
  init(st){
    const sp = $(st,'.sp'), fill = $(st,'.fill'), N = 4; let step = 0;
    const nodes = [...Array(N)].map((_,i) => { const n = document.createElement('div');
      Object.assign(n.style,{position:'absolute',top:0,width:'30px',height:'30px',borderRadius:'50%',display:'grid',placeItems:'center',fontSize:'13px',fontWeight:600,border:'2px solid var(--line)'});
      n.innerHTML = `<span class="layer">${i+1}</span><span class="layer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg></span>`;
      sp.appendChild(n); return { n, l:$$(n,'.layer'), ink:new Track(i === 0 ? 1 : 0), sw:new Swap(0) }; });
    const line = new Track(0), done = new Swap(0);
    const show = v => { if (REDUCE){ done.cur = v; done.prev = null; done.t = -9; } else done.to(v); };
    let finished = false, confirm = true;
    const nextBtn = $(st,'.next'), last = N - 1;
    const go = s => { if (s < 0 || s >= N) return; const t0 = now(), fwd = s > step; step = s; line.set(s);
      if (s !== last && finished){ finished = false; show(0); }
      nodes.forEach((x,i) => { x.ink.set(i <= s ? 1 : 0, S.base, t0 + (fwd ? LAG*2 : 0)); x.sw.to((i < s || (s === last && i === s)) ? 1 : 0, t0 + (fwd ? LAG : 0)); });
      nextBtn.textContent = s === last ? 'Finish' : 'Next'; };
    nextBtn.onclick = () => { if (step === last){ if (!confirm || finished) return; finished = true; show(1); return; } go(step + 1); };
    $(st,'.back').onclick = () => go(step - 1);
    $(st,'.redo').onclick = () => { finished = false; show(0); go(0); };
    const cf = [$(st,'.cf-on'), $(st,'.cf-off')];
    const pickCf = v => { confirm = v; cf.forEach((b,i) => { const on = (i === 0) === v; b.setAttribute('aria-pressed', on); b.classList.toggle('ink', on); }); if (!v && finished){ finished = false; show(0); } };
    cf.forEach((b,i) => b.onclick = () => pickCf(i === 0)); pickCf(true);
    const finL = $$(st,'.fin .layer');
    return t => { const W = sp.clientWidth - 30, p = line.at(t)/(N-1); fill.style.width = px(W*p);
      nodes.forEach((x,i) => { const k = clamp(x.ink.at(t)); x.n.style.left = px(W*i/(N-1)); x.n.style.background = mix(k,'var(--ink)','var(--tile)'); x.n.style.borderColor = mix(k,'var(--ink)','var(--line)'); x.n.style.color = mix(k,'var(--card)','var(--muted)'); x.l.forEach((el,j) => x.sw.apply(el,j,t)); });
      finL.forEach((el,j) => done.apply(el,j,t)); };
  }});
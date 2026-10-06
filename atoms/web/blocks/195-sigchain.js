

atom({ id:'sigchain', cat:'Writing', name:'Signature chain', block:'signature chain, approvals', fam:['S','X'], tall:true,
  html:`<div class="col" style="width:min(300px,88%);gap:12px"><div class="chain" style="position:relative;padding-left:46px"></div><div class="st small" style="position:relative;height:20px"></div><div class="row" style="gap:6px"><button class="btn ink ad">Advance seal</button><button class="btn rs">Reset</button></div></div><div class="hint">Each seal inks after the line reaches it</div>`,
  desc:'Advance fills the connector first, then the next seal inks 60ms later. The status swaps forward, ending in Signed.',
  api:'line.set(k) seal[i].set(k>=i,S.base,t+LAG) status.to(all?2:k?1:0) · REDUCE: instant',
  init(st){
    const N = ['Ava Chen · Author','Ravi Patel · Editor','June Park · Legal','Sam Ortiz · Publisher'];
    const chain = $(st,'.chain'), stx = $(st,'.st');
    const rail = document.createElement('div');
    rail.style.cssText = 'position:absolute;left:15px;top:12px;bottom:12px;width:2px;background:var(--line)';
    const fill = document.createElement('div');
    fill.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:0;background:var(--ink)'; rail.appendChild(fill); chain.appendChild(rail);
    const line = new Track(0), done = new Swap(0);
    const seals = N.map((n,i) => {
      const r = document.createElement('div'); r.style.cssText = 'position:relative;height:56px;display:flex;align-items:center;gap:10px';
      r.innerHTML = `<span class="nd" style="position:absolute;left:-46px;top:13px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:600;border:2px solid var(--line)"><span class="layer">${i+1}</span><span class="layer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg></span></span><span class="small">${n}</span>`;
      chain.appendChild(r);
      return { r, nd:$(r,'.nd'), l:$$(r,'.layer'), ink:new Track(i === 0 ? 1 : 0), sw:new Swap(0) };
    });
    const sts = ['Waiting for signatures','Collecting seals…','Signed — ready to file'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; stx.appendChild(e); return e; });
    let k = 0;
    const go = n => {
      n = Math.max(0, Math.min(N.length - 1, n)); const t0 = now(), fwd = n > k; k = n;
      if (REDUCE){ line.jump(n); seals.forEach((s,i) => { s.ink.jump(i <= n ? 1 : 0); s.sw.cur = i < n || n === N.length-1 && i === n ? 1 : 0; s.sw.prev = null; s.sw.t = -9; }); done.cur = n === N.length-1 ? 2 : n > 0 ? 1 : 0; done.prev = null; done.t = -9; }
      else {
        line.set(n); seals.forEach((s,i) => { s.ink.set(i <= n ? 1 : 0, S.base, t0 + (fwd ? LAG : 0)); s.sw.to(i < n || (n === N.length-1 && i === n) ? 1 : 0, t0 + (fwd ? LAG : 0)); });
        done.to(n === N.length-1 ? 2 : n > 0 ? 1 : 0);
      }
      $(st,'.ad').disabled = n === N.length - 1;
    };
    $(st,'.ad').onclick = () => go(k + 1); $(st,'.rs').onclick = () => go(0);
    go(0);
    return t => {
      fill.style.height = (clamp(line.at(t)/(N.length-1))*100).toFixed(2) + '%';
      seals.forEach(s => { const v = clamp(s.ink.at(t));
        s.nd.style.background = mix(v,'var(--ink)','var(--tile)'); s.nd.style.borderColor = mix(v,'var(--ink)','var(--line)'); s.nd.style.color = mix(v,'var(--card)','var(--muted)');
        s.l.forEach((el,j) => s.sw.apply(el, j, t)); });
      sts.forEach((el,j) => done.apply(el, j, t));
    };
  }});

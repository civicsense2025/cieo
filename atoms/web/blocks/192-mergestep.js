

atom({ id:'mergestep', cat:'Writing', name:'Merge preview stepper', block:'merge preview, record stepper', fam:['M','S'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(340px,92%);gap:8px;padding:12px"><div class="card col" style="padding:14px;gap:8px"><div class="ttl" style="position:relative;height:22px;font-weight:600"></div><div class="recs" style="position:relative;height:180px"><div class="plate" style="position:absolute;left:-6px;right:-6px;background:var(--accent-tint);border-radius:10px;pointer-events:none"></div></div><div class="row small" style="justify-content:space-between;align-items:center"><span class="cnt muted"></span><span class="inv" style="position:relative;height:18px;min-width:150px;color:var(--danger)"></span></div></div><div class="row" style="justify-content:space-between;align-items:center"><button class="btn pv">Prev</button><span class="row" style="gap:8px"><button class="btn t0">1</button><button class="btn t1">2</button><button class="btn t2">3</button></span><button class="btn ink nx">Next</button></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Flag missing fields</span></label><div class="hint">Step through merge candidates</div>`,
  desc:'The record title swaps while the field plate slides behind the rows with its far edge trailing 60ms. A missing field rings in the danger color with a note.',
  api:'rec.to(i) plate.go(top,bot,S.snap,t+LAG) err.set(bad) · REDUCE: instant',
  init(st){
    const R = [
      { t:'Acme buyout — draft 3', f:[['Buyer','Acme Corp',0],['Price','$42M',0],['Close date','Missing',1]] },
      { t:'Acme buyout — draft 4', f:[['Buyer','Acme Corp',0],['Price','$44M',0],['Close date','June 30',0]] },
      { t:'Globex merger — draft 1', f:[['Buyer','Missing',1],['Price','$9M',0],['Close date','July 12',0]] }
    ];
    const SLOT = 62, PH = 56;
    const ttl = $(st,'.ttl'), recs = $(st,'.recs'), plate = $(st,'.plate'), inv = $(st,'.inv'), cnt = $(st,'.cnt');
    const sw = new Swap(0), pT = new Track(0, S.snap), pB = new Track(PH, S.snap), err = new Track(0);
    const badEls = [];
    R.forEach((r,i) => {
      const h = document.createElement('span'); h.className = 'layer'; h.textContent = r.t; ttl.appendChild(h);
      const d = document.createElement('div'); d.className = 'layer'; d.style.cssText = 'flex-direction:column;gap:6px';
      r.f.forEach(f => {
        const w = document.createElement('div'); w.style.cssText = 'height:56px;display:flex;flex-direction:column;gap:2px';
        w.innerHTML = `<span class="small" style="font-weight:500">${f[0]}</span><span class="fv" style="border:1.5px solid var(--line);border-radius:9px;padding:6px 10px;font-size:14px">${f[1]}</span>`;
        d.appendChild(w); if (f[2]) badEls[i] = $(w,'.fv');
      });
      recs.appendChild(d);
    });
    const ttlL = $$(ttl,'.layer'), recL = $$(recs,'.layer').filter(e => !e.classList.contains('plate'));
    const invL = R.map(r => { const e = document.createElement('span'); e.className = 'layer small'; e.textContent = r.f.find(f => f[2]) ? `${r.f.find(f => f[2])[0]} is missing` : ''; inv.appendChild(e); return e; });
    const tabs = [$(st,'.t0'), $(st,'.t1'), $(st,'.t2')];
    let cur = 0;
    const flag = $(st,'.twk');
    const focus = i => Math.max(0, R[i].f.findIndex(f => f[2]));
    const go = n => {
      n = Math.max(0, Math.min(R.length - 1, n)); const t0 = now(), f = focus(n), nt = f*SLOT, nb = nt + PH;
      const bad = flag.checked && R[n].f.some(f => f[2]) ? 1 : 0; cur = n;
      if (REDUCE){ sw.cur = n; sw.prev = null; sw.t = -9; pT.jump(nt); pB.jump(nb); err.jump(bad); }
      else {
        sw.to(n);
        if (nt >= pT.target){ pB.set(nb, S.snap, t0); pT.set(nt, S.snap, t0 + LAG); }
        else { pT.set(nt, S.snap, t0); pB.set(nb, S.snap, t0 + LAG); }
        err.set(bad, S.base, t0);
      }
      tabs.forEach((b,i) => { b.classList.toggle('ink', i === n); b.setAttribute('aria-selected', i === n); });
      cnt.textContent = `Record ${n+1} of ${R.length}`;
      $(st,'.pv').disabled = n === 0; $(st,'.nx').disabled = n === R.length - 1;
    };
    $(st,'.pv').onclick = () => go(cur - 1); $(st,'.nx').onclick = () => go(cur + 1);
    tabs.forEach((b,i) => b.onclick = () => go(i));
    flag.onchange = () => err.set(flag.checked && R[cur].f.some(f => f[2]) ? 1 : 0, S.base);
    go(0); pT.jump(focus(0)*SLOT); pB.jump(focus(0)*SLOT + PH); err.jump(1);
    return t => {
      ttlL.forEach((el,k) => sw.apply(el, k, t)); recL.forEach((el,k) => sw.apply(el, k, t, 0));
      plate.style.top = px(pT.at(t)); plate.style.height = px(Math.max(0, pB.at(t) - pT.at(t)));
      const e = clamp(err.at(t));
      badEls.forEach((el,i) => { if (el) el.style.borderColor = mix(i === cur ? e : 0,'var(--danger)','var(--line)'); });
      invL.forEach((el,k) => sw.apply(el, k, t, 0)); fade(inv, e, (1-e)*-3, false);
    };
  }});

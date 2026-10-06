

atom({ id:'budget', cat:'Writing', name:'Assignment budget board', block:'assignment budget, rank board', fam:['M','T'], wide:true, tall:true,
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(560px,96%);gap:8px;padding:12px"><div class="row" style="gap:8px;align-items:center"><span class="small" style="font-weight:600">Funded</span><span class="dg1" aria-label="Funded count"></span><span class="small muted">of 4 ·</span><span class="dg2" aria-label="Funded hours"></span><span class="small muted">hrs</span><span style="flex:1"></span><button class="btn rs">Restore all</button></div><div class="bd" style="position:relative;height:232px"><div class="lead" style="position:absolute;left:0;width:4px;border-radius:2px;background:var(--accent);pointer-events:none"></div></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Count freed hours</span></label><div class="hint">Kill a row to free its hours</div>`,
  desc:'Rows spring into their rank slots while the leader plate follows with its far edge trailing 60ms. Killing swaps a row out, then its space collapses; the counts roll to match.',
  api:'y[i].set(slot,S.base) lead.go(t,b,t+LAG) kill:out.to(1);h.set(0,t+EXIT) dg.set(n) · REDUCE: instant',
  init(st){
    const A = [{ n:'Cover story', h:12 }, { n:'Photo essay', h:9 }, { n:'Interview', h:9 }, { n:'Briefs', h:6 }];
    const SLOT = 60, RH = 52, bd = $(st,'.bd'), lead = $(st,'.lead');
    const cDg = new Digits($(st,'.dg1'), 1), hDg = new Digits($(st,'.dg2'), 2);
    cDg.dir = -1; hDg.dir = -1;
    const y = [], h = [], out = [], dead = [];
    const rows = A.map((a,i) => {
      const r = document.createElement('div');
      r.style.cssText = 'position:absolute;left:12px;right:0;overflow:hidden';
      const inner = document.createElement('div');
      inner.className = 'card'; inner.style.cssText = 'height:52px;position:relative;padding:0 12px';
      const l0 = document.createElement('div'); l0.className = 'layer';
      l0.style.cssText = 'flex-direction:row;gap:8px;align-items:center';
      l0.innerHTML = `<span class="rk small muted" style="width:18px">${i+1}</span><span class="small" style="font-weight:600">${a.n}</span><span class="small muted">${a.h}h</span><span style="flex:1"></span>`;
      const kl = document.createElement('button'); kl.className = 'btn kl'; kl.style.cssText = 'padding:2px 10px;font-size:12px'; kl.textContent = 'Kill';
      l0.appendChild(kl); inner.appendChild(l0);
      const l1 = document.createElement('div'); l1.className = 'layer small';
      l1.style.cssText = 'justify-content:flex-start;color:var(--danger)'; l1.textContent = `Removed — ${a.h}h freed`;
      inner.appendChild(l1); r.appendChild(inner);
      bd.appendChild(r);
      y.push(new Track(i*SLOT)); h.push(new Track(RH)); out.push(new Swap(0)); dead.push(false);
      return { r, inner, l0, l1, btn:kl, rk:$(l0,'.rk') };
    });
    const pT = new Track(0), pB = new Track(RH);
    cDg.set('4', true); hDg.set('36', true);
    const alive = () => A.map((_,i) => i).filter(i => !dead[i]);
    const sums = () => alive().reduce((s,i) => s + A[i].h, 0);
    const layout = (t0, instant) => {
      alive().forEach((r,s) => { if (instant) y[r].jump(s*SLOT); else y[r].set(s*SLOT, S.base, t0); });
      rows.forEach((c,i) => c.rk.textContent = dead[i] ? '–' : (alive().indexOf(i)+1));
      const L = alive()[0];
      const nt = L == null ? 0 : alive().indexOf(L)*SLOT, nb = nt + RH;
      if (instant){ pT.jump(0); pB.jump(0); }
      else if (nt >= pT.target){ pB.set(nb, S.base, t0); pT.set(nt, S.base, t0 + LAG); }
      else { pT.set(nt, S.base, t0); pB.set(nb, S.base, t0 + LAG); }
    };
    const counts = () => {
      const n = String(alive().length), s = String(sums());
      if (REDUCE){ cDg.set(n, true); hDg.set(s, true); } else { cDg.dir = -1; hDg.dir = -1; cDg.set(n); hDg.set(s); }
    };
    const kill = i => {
      if (dead[i]) return; dead[i] = true; const t0 = now();
      rows[i].btn.textContent = 'Restore';
      if (REDUCE){ out[i].cur = 1; out[i].prev = null; out[i].t = -9; h[i].jump(0); layout(t0, true); counts(); }
      else { out[i].to(1, t0); h[i].set(0, S.base, t0 + EXIT); layout(t0 + EXIT, false); setTimeout(counts, EXIT*1000); }
    };
    const restore = i => {
      if (!dead[i]) return; dead[i] = false; const t0 = now();
      rows[i].btn.textContent = 'Kill';
      if (REDUCE){ h[i].jump(RH); out[i].cur = 0; out[i].prev = null; out[i].t = -9; layout(t0, true); counts(); }
      else { h[i].set(RH, S.base, t0); out[i].to(0, t0 + EXIT); layout(t0, false); cDg.dir = 1; hDg.dir = 1; setTimeout(counts, EXIT*1000); }
    };
    rows.forEach((c,i) => c.btn.onclick = () => dead[i] ? restore(i) : kill(i));
    $(st,'.rs').onclick = () => alive().length < A.length && A.forEach((_,i) => restore(i));
    return t => {
      rows.forEach((c,i) => {
        c.r.style.top = px(y[i].at(t)); c.r.style.height = px(Math.max(0, h[i].at(t)));
        out[i].apply(c.l0, 0, t, 0); out[i].apply(c.l1, 1, t, 0);
        const vis = clamp(h[i].at(t)/RH); c.inner.style.opacity = vis.toFixed(3);
        c.r.style.pointerEvents = dead[i] && h[i].target === 0 ? 'none' : 'auto';
      });
      lead.style.top = px(pT.at(t)); lead.style.height = px(Math.max(0, pB.at(t) - pT.at(t)));
      lead.style.opacity = alive().length ? 1 : 0;
      cDg.render(t); hDg.render(t);
    };
  }});

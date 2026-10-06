atom({ id:'intakeq', cat:'Scheduling', name:'Intake questions', block:'intake, booking flow', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">Book a visit</b><div class="card qcard" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px"><div class="prow" style="display:flex;align-items:center;gap:8px"><div class="ptrack" style="position:relative;flex:1;height:6px;border-radius:3px;background:var(--raised);overflow:hidden"><i class="pfill" style="position:absolute;left:0;top:0;bottom:0;width:0;background:var(--ink);border-radius:3px"></i></div><span class="pcap" style="font-size:12px;color:var(--ink);opacity:.6;font-variant-numeric:tabular-nums;white-space:nowrap">1 of 3</span></div><div class="qa" style="position:relative;min-height:132px;overflow:hidden"></div><div class="row small muted" style="gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:10px"><button class="bk" style="min-height:32px;border-radius:8px;border:0;background:none;padding:0 4px;cursor:pointer;font-size:12px;color:var(--ink);opacity:.7">← Back</button><button class="sv" style="margin-left:auto;min-height:32px;border-radius:8px;border:1px solid var(--line);background:none;padding:0 12px;cursor:pointer;font-size:12px;color:var(--ink);opacity:.7">Save draft</button></div></div></div><div class="hint">Answer to advance · empty continues shake</div>`,
  desc:'Each answer slides the next question up from below while the progress bar fills. Continuing empty snaps the card side to side and swaps in what is missing. The sent summary holds as the terminal.',
  api:'qa.to(step+1) rises   pr.set(step/3) fills   empty: sh.release shake + need.to(1)',
  init(st){
    const Q = [
      { q:'What brings you in?', opts:['Tour','Consult','Follow-up'] },
      { q:'Party size?', opts:['1–2','3–5','6+'] },
      { q:'Preferred time?', opts:['Mornings','Afternoons','Evenings'] }];
    const qa = $(st,'.qa'), qcard = $(st,'.qcard'), pcap = $(st,'.pcap'), pfill = $(st,'.pfill');
    const sw = new Swap(0), pr = new Track(0), sh = new Track(0), need = new Swap(0), sv = new Track(0);
    const ans = [null,null,null]; let step = 0;
    const layers = [];
    const build = k => {
      const L = document.createElement('div'); L.className = 'layer';
      L.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;gap:8px';
      if (k < 3){
        const t = document.createElement('b'); t.textContent = Q[k].q;
        t.style.cssText = 'font-size:14px;font-weight:600'; L.appendChild(t);
        Q[k].opts.forEach(o => { const b = document.createElement('button'); b.textContent = o;
          b.style.cssText = 'min-height:34px;border-radius:8px;border:1px solid var(--line);background:var(--card);cursor:pointer;font-size:13px;text-align:left;padding:0 12px';
          if (ans[k] === o){ b.style.borderColor = 'var(--ink)'; b.style.fontWeight = '600'; }
          b.onclick = () => { ans[k] = o; need.to(0);
            [...L.querySelectorAll('button')].forEach(x => { x.style.borderColor = x.textContent === o ? 'var(--ink)' : 'var(--line)'; x.style.fontWeight = x.textContent === o ? '600' : '400'; });
            next(); };
          L.appendChild(b); });
        const c = document.createElement('button'); c.textContent = 'Continue';
        c.style.cssText = 'min-height:34px;border-radius:8px;border:0;background:var(--ink);color:var(--card);cursor:pointer;font-size:13px;font-weight:600';
        c.onclick = () => { if (ans[k]){ need.to(0); next(); }
          else { sh.release(10, 0, 0, { w:46, z:.22 }); need.to(1); } };
        L.appendChild(c);
        const wrap = document.createElement('span');
        wrap.style.cssText = 'position:relative;display:block;height:18px';
        const n = document.createElement('span'); n.className = 'layer'; n.textContent = 'Pick one to continue';
        n.style.cssText = 'position:absolute;inset:0;font-size:12px;color:var(--danger,#c9403b)';
        const n0 = document.createElement('span'); n0.className = 'layer';
        n0.style.cssText = 'position:absolute;inset:0;font-size:12px';
        wrap.appendChild(n0); wrap.appendChild(n); L.appendChild(wrap); L._n = [n0, n];
      } else {
        L.style.alignItems = 'center'; L.style.justifyContent = 'center'; L.style.textAlign = 'center';
        const ck = document.createElement('span'); ck.textContent = '✓';
        ck.style.cssText = 'width:40px;height:40px;border-radius:50%;display:grid;place-items:center;padding:0;background:var(--success);color:#fff;font-size:18px;transform:translateY(-1px)';
        const s = document.createElement('b'); s.style.cssText = 'font-size:14px;font-weight:600'; s.textContent = 'Request sent';
        const d = document.createElement('span'); d.style.cssText = 'font-size:12px;color:var(--ink);opacity:.6';
        d.textContent = ans.join(' · ');
        L.appendChild(ck); L.appendChild(s); L.appendChild(d);
      }
      qa.appendChild(L); return L; };
    for (let k = 0; k < 4; k++) layers.push(build(k));
    const next = () => { if (step >= 3) return; step++;
      sw.to(step); pr.set(step/3, S.base);
      pcap.textContent = step >= 3 ? 'Done' : (step + 1) + ' of 3';
      if (step >= 3) sv.set(1, S.base); };
    $(st,'.bk').onclick = () => { if (step <= 0) return; step--; ans[step] = null;
      const fresh = build(step); layers[step].replaceWith(fresh); layers[step] = fresh;
      sw.to(step); pr.set(step/3); need.to(0);
      pcap.textContent = (step + 1) + ' of 3'; sv.set(0); };
    $(st,'.sv').onclick = e => { const b = e.target;
      b.textContent = b.textContent === 'Save draft' ? 'Draft saved ✓' : 'Save draft'; };
    return t => { layers.forEach((L,k) => sw.apply(L,k,t,10));
      layers.forEach(L => { if (L._n) L._n.forEach((n,j) => need.apply(n, j ? 1 : 0, t, 3)); });
      pfill.style.width = (clamp(pr.at(t))*100).toFixed(1) + '%';
      qcard.style.transform = 'translateX(' + sh.at(t).toFixed(2) + 'px)';
      qcard.style.borderColor = mix(clamp(sv.at(t)),'var(--success)','var(--line)'); };
  }});

atom({ id:'prefquiz', cat:'Forms', name:'Preference quiz', block:'quiz, onboarding, recommendations', fam:['S','X'],
  html:`<div class="col" style="gap:8px;width:min(320px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Find your fit</h4><div class="pbar" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style="height:4px;border-radius:2px;background:var(--raised);overflow:hidden"><i class="pfl" style="display:block;height:100%;background:var(--ink);width:0"></i></div><div class="deck" style="position:relative;min-height:150px"></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="rst"> Restart when done</label></div><div class="hint">Answer two questions for a shelf</div>`,
  desc:'Cards slide in the direction of travel with a blur swap while progress fills. The result swaps into a mini shelf that holds as the terminal.',
  api:'card.to(i, dir) slides ±24   prog.set((i+1)/3)   result.to(shelf)',
  init(st){
    const deck = $(st,'.deck'), pfl = $(st,'.pfl'), pbar = $(st,'.pbar'), rst = $(st,'.rst');
    const Q = [{ q:'Weekend uniform?', a:['Trail', 'Street'] }, { q:'Palette?', a:['Earth', 'Ink'] }];
    const sw = new Swap(0), prog = new Track(0);
    const panes = [];
    Q.forEach((qq, i) => { const d = document.createElement('div'); d.className = 'layer'; d.style.cssText += ';flex-direction:column;gap:8px;align-items:stretch;justify-content:flex-start;background:var(--card);border-radius:12px;padding:14px 16px';
      d.innerHTML = `<b style="font-size:14px;line-height:1.5">${qq.q}</b>`; qq.a.forEach(a => { const b = document.createElement('button'); b.type = 'button'; b.textContent = a;
        b.style.cssText = 'height:36px;border-radius:9px;border:1.5px solid var(--line);background:var(--card);cursor:pointer;font-size:13px;font-weight:500'; b.onclick = () => go(i + 1, 1); d.appendChild(b); }); deck.appendChild(d); panes.push(d); });
    const res = document.createElement('div'); res.className = 'layer'; res.style.cssText += ';flex-direction:column;gap:8px;align-items:stretch;background:var(--card);border-radius:12px;padding:14px 16px';
    res.innerHTML = `<b style="font-size:14px;line-height:1.5">Your shelf</b><div class="row" style="gap:8px"><span style="flex:1;aspect-ratio:4/3;border-radius:12px;background:var(--raised);display:grid;place-items:center;font-size:12px;color:var(--muted)">Trail</span><span style="flex:1;aspect-ratio:4/3;border-radius:12px;background:var(--line-soft);display:grid;place-items:center;font-size:12px;color:var(--muted)">Earth</span></div><span class="small" style="font-size:12px;color:var(--muted);line-height:1.5">2 picks · prices from $32.</span><button type="button" class="agn" style="height:32px;border-radius:8px;background:var(--raised);cursor:pointer;font-size:13px">Retake</button>`;
    deck.appendChild(res); panes.push(res);
    let dir = 1;
    $(res,'.agn').onclick = () => go(0, -1);
    const go = (i, d) => { dir = d; sw.to(i); prog.set(i / 2, S.base); pbar.setAttribute('aria-valuenow', Math.round(i / 2 * 100)); if (i >= 2 && rst.checked) setTimeout(() => go(0, -1), 4000); };
    return t => { prog.at && (pfl.style.width = (clamp(prog.at(t)) * 100).toFixed(2) + '%');
      panes.forEach((p, k) => { sw.apply(p, k, t, 0); const o = parseFloat(p.style.opacity) || 0; p.style.transform = `translateX(${((1 - o) * 24 * (k <= sw.cur ? dir : -dir)).toFixed(2)}px)`; p.style.pointerEvents = k === sw.cur ? 'auto' : 'none'; p.style.visibility = o < .02 ? 'hidden' : 'visible'; }); };
  }});

atom({ id:'validationshake', cat:'Foundations', name:'Validation shake', block:'validation, error states, danger ring', fam:['T','S'],
  html:`<div class="card col" style="width:min(360px,92%);padding:18px;gap:16px"><input class="em" type="email" value="ada@" aria-label="Email" spellcheck="false" style="height:40px;border:1.5px solid var(--muted);border-radius:10px;background:var(--card);color:var(--ink);padding:0 12px;font-size:14px;outline:none"><div class="ms" style="position:relative;min-height:20px;font-size:12px;color:var(--danger)"></div><div class="row" style="gap:8px"><button class="btn go" style="flex:1;min-height:36px">Validate</button></div><div class="row small muted" style="gap:8px;align-items:center"><span style="font-size:12px">Distance</span><input type="range" class="dl" min="4" max="16" step="1" value="8" aria-label="Shake distance pixels" style="flex:1;min-height:32px"><b class="dlv" style="font:13px var(--mono);font-variant-numeric:tabular-nums">8px</b></div></div><div class="hint">Distance dials the shake · the danger ring and message persist</div>`,
  desc:'Failed validation shakes the field, rings it in danger and swaps in the message. Distance is the only dial; everything else is fixed.',
  api:'amp.set(0, S.soft) envelope · ring.set(1, S.snap) → danger',
  init(st){
    const inp = $(st,'.em'), ms = $(st,'.ms'), dl = $(st,'.dl'), dlv = $(st,'.dlv');
    const L = ['', 'Enter a valid email address'].map(s => { const e = document.createElement('span');
      e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; ms.appendChild(e); return e; });
    const ring = new Track(0, S.snap), amp = new Track(0, S.soft), sw = new Swap(0);
    let t0s = -9;
    dl.oninput = () => dlv.textContent = dl.value + 'px';
    dl.oninput();
    $(st,'.go').onclick = () => { const t0 = now();
      if (REDUCE){ ring.jump(1); amp.jump(0); sw.to(1); }
      else { ring.set(1, S.snap, t0); t0s = t0; amp.jump(1); amp.set(0, S.soft, t0); sw.to(1, t0); } };
    return t => { const a = REDUCE ? 0 : clamp(amp.at(t));
      inp.style.transform = a > .002 ? `translateX(${((+dl.value) * a * Math.sin((t - t0s) * 30)).toFixed(2)}px)` : 'none';
      inp.style.borderColor = mix(clamp(ring.at(t)), 'var(--danger)', 'var(--muted)');
      L.forEach((el, k) => sw.apply(el, k, REDUCE ? sw.t + 9 : t)); };
  }});

atom({ id:'staggerlab', cat:'Foundations', name:'Stagger lab', block:'stagger composer, edge trail, delay', fam:['T','E'],
  html:`<div class="card col" style="width:min(380px,94%);padding:18px;gap:16px"><div class="row bars" style="align-items:flex-end;height:96px;gap:8px">${'<div style="flex:1;border-radius:6px;background:var(--ink)"></div>'.repeat(5)}</div><div class="ro" style="font:13px var(--mono);font-variant-numeric:tabular-nums;color:var(--muted)">delay 40ms · forward</div><div class="row" style="gap:8px"><button class="btn play" style="flex:1;min-height:36px">Play</button><select class="ord" aria-label="Stagger order" style="min-height:36px;font-size:13px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink)"><option value="fwd">forward</option><option value="rev">reverse</option></select></div><div class="row small muted" style="gap:8px;align-items:center"><span style="font-size:12px">Delay</span><input type="range" class="dl" min="0" max="80" step="5" value="40" aria-label="Stagger delay milliseconds" style="flex:1;min-height:32px"><b class="dlv" style="font:13px var(--mono);font-variant-numeric:tabular-nums">40ms</b></div><div style="height:1px;background:var(--line)"></div><div class="col" style="gap:8px"><span class="small muted" style="font-size:12px">Separate demo · 60ms edge trail</span><div class="eg" style="position:relative;height:32px;border-radius:8px;background:var(--raised)"><i class="ea" style="position:absolute;left:10px;top:10px;width:12px;height:12px;border-radius:50%;background:var(--ink)"></i><i class="ebb" style="position:absolute;left:10px;top:10px;width:12px;height:12px;border-radius:50%;border:2px solid var(--accent)"></i></div><button class="btn slide" style="min-height:32px;align-self:flex-start">Slide edge</button></div></div><div class="hint">Stagger composes starts · the edge trail always follows 60ms later</div>`,
  desc:'Compose a stagger: dial the per-item delay and flip the order. Below, kept separate, the 60ms edge trail follows every slide.',
  api:'x.set(v, S.base, t0 + i*delay) · edge.go(a, b) trails .06',
  init(st){
    const bars = $$(st,'.bars div'), ro = $(st,'.ro'), dl = $(st,'.dl'), dlv = $(st,'.dlv'), ord = $(st,'.ord');
    const ea = $(st,'.ea'), eb = $(st,'.ebb'), eg = $(st,'.eg');
    const A = [.3, .55, .8, .45, .95], B = [.85, .4, .25, .7, .35];
    const T = A.map(v => new Track(v));
    let k = 0, eo = 1;
    const e = edges(0, 0); e.jump(0, 0);
    const upd = () => { dlv.textContent = dl.value + 'ms';
      ro.textContent = 'delay ' + dl.value + 'ms · ' + (ord.value === 'rev' ? 'reverse' : 'forward') + (REDUCE ? ' · instant' : ''); };
    dl.oninput = upd; ord.onchange = upd; upd();
    $(st,'.play').onclick = () => { k ^= 1; const t0 = now(), d = dl.value / 1000, tg = k ? B : A;
      T.forEach((x, i) => { const at = t0 + (ord.value === 'rev' ? (4 - i) * d : i * d);
        if (REDUCE) x.jump(tg[i]); else x.set(tg[i], undefined, at); }); };
    $(st,'.slide').onclick = () => { eo = eo ? 0 : 1;
      if (REDUCE) e.jump(eo, eo); else e.go(eo, eo); };
    return t => { T.forEach((x, i) => bars[i].style.height = px(Math.max(8, clamp(x.at(t)) * 96)));
      const W = Math.max(1, eg.clientWidth - 32);
      ea.style.transform = `translateX(${px(clamp(e.A.at(t)) * W)})`;
      eb.style.transform = `translateX(${px(clamp(e.B.at(t)) * W)})`; };
  }});

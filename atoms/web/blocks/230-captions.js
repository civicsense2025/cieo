atom({ id:'captions', cat:'Video calls', name:'Captions roll', block:'video call (captions, transcript)', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Captions roll</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">Lines rise as they are spoken.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="row" style="gap:8px;align-items:center"><span class="small muted" style="font-size:12px">Now</span><span class="spk" style="position:relative;display:inline-block;min-width:60px;height:20px;font-size:13px;font-weight:600;line-height:20px"></span></div><div class="cap col" style="gap:8px;min-height:96px;border-radius:12px;background:#0C1016;padding:12px 14px"></div><div class="row" style="gap:8px;align-items:center;justify-content:space-between"><div class="fin" style="position:relative;height:30px;flex:1"></div><button class="btn nx" style="min-height:32px;border-radius:8px">Next line</button></div><label class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px"><input type="checkbox" class="nm" checked> speaker names</label></div></div><div class="hint">Run the segment to save the transcript</div>`,
  desc:'Each new caption rises on base while the oldest swaps out; the speaker name swaps with it. At the end of the segment a success terminal holds the saved transcript.',
  api:'line.{y,o}.set(in, S.base)   old: swap.to(out)   spk.to(speaker)   end: fin.to(1)',
  init(st){
    const LINES = [['Maya','Welcome back — quick round of updates.'],['Theo','Design is ready for review.'],['Maya','Love it. Shipping after lunch?'],['Theo','Yes — merging right after this.']];
    const WHO = [...new Set(LINES.map(l => l[0]))];
    const cap = $(st,'.cap'), spk = $(st,'.spk'), nx = $(st,'.nx'), nm = $(st,'.nm');
    const sL = WHO.map(n => { const e = document.createElement('span'); e.className = 'layer';
      e.style.cssText = 'font-size:13px;font-weight:600;line-height:20px;color:var(--ink)'; e.textContent = n; spk.appendChild(e); return e; });
    const ssw = new Swap(0);
    const F = ['', 'Saved to transcript'].map((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.innerHTML = k ? `<span class="small" style="background:color-mix(in oklab, var(--success) 12%, transparent);color:var(--success);font-weight:600;padding:4px 10px;border-radius:999px;font-size:12.5px">✓ ${s}</span>` : s;
      $(st,'.fin').appendChild(e); return e; });
    const fsw = new Swap(0), ok = new Track(0);
    let idx = -1, live = [];
    const showNames = () => live.forEach(l => l.who.style.display = nm.checked ? '' : 'none');
    nm.onchange = showNames;
    const next = () => { const t0 = now();
      if (idx >= LINES.length - 1){ idx = -1; live.forEach(l => l.d.remove()); live = [];
        ssw.to(0, t0); fsw.to(0, t0); ok.set(0, S.snap, t0); nx.textContent = 'Next line'; step(); return; }
      step(); };
    const step = () => { const t0 = now(); idx++;
      const [who, text] = LINES[idx];
      const d = document.createElement('div'); d.style.cssText = 'display:flex;gap:8px;align-items:baseline';
      const w = document.createElement('b'); w.style.cssText = 'font-size:12px;color:var(--success);white-space:nowrap'; w.textContent = who;
      const p = document.createElement('span'); p.style.cssText = 'font-size:13.5px;line-height:1.5;color:#fff'; p.textContent = text;
      d.append(w, p); cap.appendChild(d);
      const it = { d, who:w, y:new Track(REDUCE ? 0 : 14), o:new Track(REDUCE ? 1 : 0) };
      if (!REDUCE){ it.y.set(0, S.base, t0); it.o.set(1, S.base, t0); }
      live.push(it); showNames();
      ssw.to(WHO.indexOf(who), t0);
      while (live.length > 2){ const old = live.shift(); const oo = old.o, od = old.d;
        if (REDUCE){ od.remove(); } else { oo.set(0, S.snap, t0); setTimeout(() => od.remove(), 260); } }
      if (idx === LINES.length - 1){ fsw.to(1, t0); ok.set(1, S.snap, t0); nx.textContent = 'Replay'; } };
    nx.onclick = next; step();
    return t => { live.forEach(l => { l.d.style.opacity = clamp(l.o.at(t)).toFixed(3);
        l.d.style.transform = `translateY(${l.y.at(t).toFixed(2)}px)`; });
      sL.forEach((e,k) => ssw.apply(e,k,t)); F.forEach((e,k) => fsw.apply(e,k,t));
      const d = clamp(ok.at(t)), fin = $(st,'.fin');
      fin.style.opacity = d.toFixed(3); fin.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});

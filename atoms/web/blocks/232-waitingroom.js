atom({ id:'waitingroom', cat:'Video calls', name:'Waiting-room admit', block:'video call (waiting room, admit)', fam:['M','S'], tall:true,
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Waiting room</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">Admit guests one by one.</span><div class="card col" style="padding:14px 16px;gap:4px"><div class="row" style="gap:8px;align-items:center;justify-content:space-between;padding-bottom:6px"><span style="font-size:13px;font-weight:600">Waiting</span><span class="ct num" style="font-size:12.5px;font-variant-numeric:tabular-nums"></span></div><div class="lst col"></div><div class="fin" style="position:relative;height:30px;margin-top:6px"></div><div class="row" style="gap:8px;align-items:center;justify-content:space-between"><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="at"> auto-admit</label><button class="btn iv" style="min-height:32px;border-radius:8px">Invite back</button></div></div></div><div class="hint">Admit everyone to clear the room</div>`,
  desc:'Each row springs shut on base when its guest is admitted, while a green dot pops on snap and the waiting count rolls its digits. The last admit swaps in an empty terminal.',
  api:'row.h.set(0, S.base); dot.set(1, S.snap)   count.set(n)   empty: fin.to(1)',
  init(st){
    const GUESTS = [['Priya','2 min'],['Sam','4 min'],['Jonas','6 min']];
    const lst = $(st,'.lst'), ct = $(st,'.ct'), at = $(st,'.at');
    const cd = new Digits(ct, 1);
    const F = ['', 'Room is clear'].map((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.innerHTML = k ? `<span class="small" style="background:color-mix(in oklab, var(--success) 12%, transparent);color:var(--success);font-weight:600;padding:4px 10px;border-radius:999px;font-size:12.5px">✓ ${s}</span>` : s;
      $(st,'.fin').appendChild(e); return e; });
    const fsw = new Swap(0), ok = new Track(0);
    let rows = [], lastA = 0;
    const build = () => { lst.innerHTML = ''; rows = GUESTS.map(([n, w], i) => {
        const wrap = document.createElement('div'); wrap.style.cssText = 'overflow:hidden';
        const r = document.createElement('div'); r.className = 'row';
        r.style.cssText = 'gap:10px;align-items:center;height:52px' + (i ? ';border-top:1px solid var(--line-soft)' : '');
        r.innerHTML = `<span style="position:relative;width:32px;height:32px;flex:none"><span style="position:absolute;inset:0;border-radius:50%;background:var(--raised);display:grid;place-items:center;padding:0;font:600 13px var(--sans);transform:translateY(-.5px)">${n[0]}</span><i class="dt" style="position:absolute;right:-1px;bottom:-1px;width:12px;height:12px;border-radius:50%;background:var(--success);border:2px solid var(--card);transform:scale(0)"></i></span><span style="flex:1;min-width:0"><b style="display:block;font-size:13.5px;line-height:1.45">${n}</b><span class="small muted" style="font-size:12px">waiting ${w}</span></span>`;
        const b = document.createElement('button'); b.className = 'btn'; b.style.cssText = 'min-height:32px;border-radius:8px';
        b.textContent = 'Admit'; b.onclick = () => admit(it);
        r.appendChild(b); wrap.appendChild(r); lst.appendChild(wrap);
        const it = { wrap, r, b, dot:r.querySelector('.dt'), h:new Track(52), o:new Track(1), d:new Track(0), gone:false };
        return it; });
      cd.set(String(rows.length), true); fsw.to(0); ok.set(0); };
    const admit = it => { if (!it || it.gone) return; it.gone = true; const t0 = now();
      it.d.set(1, S.snap, t0); it.h.set(0, S.base, t0 + .12); it.o.set(0, S.base, t0 + .12);
      setTimeout(() => { it.wrap.remove(); rows = rows.filter(r => r !== it);
        cd.set(String(rows.length));
        if (!rows.length){ fsw.to(1); ok.set(1, S.snap); } }, REDUCE ? 60 : 420); };
    build();
    $(st,'.iv').onclick = () => { at.checked = false; build(); };
    return t => { if (at.checked && rows.length && t - lastA > 1.6){ lastA = t; admit(rows.find(r => !r.gone)); }
      rows.forEach(it => { it.wrap.style.height = px(Math.max(0, it.h.at(t)));
        it.r.style.opacity = clamp(it.o.at(t)).toFixed(3);
        it.dot.style.transform = `scale(${clamp(it.d.at(t)).toFixed(3)})`; });
      F.forEach((e,k) => fsw.apply(e,k,t)); cd.render(t);
      const d = clamp(ok.at(t)), fin = $(st,'.fin');
      fin.style.opacity = d.toFixed(3); fin.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});

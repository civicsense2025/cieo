

atom({ id:'embargo', cat:'Writing', name:'Embargo countdown', block:'richtext editor, publish bar', fam:['M','X'],
  html:`<div class="col" style="gap:10px;align-items:center"><div class="card eb" style="position:relative;height:58px;width:min(280px,88%);overflow:hidden"></div><button class="btn rs" type="button">Reset</button></div><div class="hint">Only changing digits roll</div>`,
  desc:'Only the digits that change roll each second. At zero the count lifts into a Live pill on a soft spring. Reset puts the count back.',
  api:'tick: dg.set(pad(floor)); delta only rolls   0: sw.to(live); ly -10→0 soft   rs: jump back',
  init(st){
    const TOTAL = 8, box = $(st,'.eb');
    const mk = html => { const e = document.createElement('div'); e.className = 'layer';
      e.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:6px'; e.innerHTML = html; box.appendChild(e); return e; };
    const count = mk('<span class="small muted">Lifts in</span><span class="eg" style="font:600 26px var(--mono)"></span><span class="small muted">sec</span>');
    const live = mk('<span style="display:inline-flex;align-items:center;gap:7px;font-weight:600;color:var(--success)"><i style="width:8px;height:8px;border-radius:50%;background:var(--success)"></i>Live · embargo lifted</span>');
    const dg = new Digits($(count,'.eg'), 2); dg.dir = -1;
    const sw = new Swap('count'), tint = new Track(0), ly = new Track(0);
    let rem = TOTAL, last = -1, shown = -1, lifted = false;
    const lift = t => { lifted = true;
      if (REDUCE){ sw.cur = 'live'; sw.prev = null; tint.jump(1); ly.jump(0); }
      else { sw.to('live', t); tint.set(1, S.base, t); ly.set(-10, S.soft, t); ly.set(0, S.soft, t + .14); } };
    $(st,'.rs').onclick = () => { const t = now(); rem = TOTAL; shown = -1; lifted = false;
      if (REDUCE){ sw.cur = 'count'; sw.prev = null; tint.jump(0); ly.jump(0); }
      else { sw.to('count', t); tint.set(0, S.base, t); ly.jump(0); } };
    dg.set('08', true);
    return t => {
      if (last < 0) last = t;
      const dt = Math.min(.25, t - last); last = t;
      if (!lifted && rem > 0){ rem = Math.max(0, rem - dt);
        const s = Math.ceil(rem);
        if (s !== shown){ shown = s; dg.set(String(s).padStart(2,'0'), REDUCE); }
        if (rem <= 0) lift(t); }
      dg.render(t);
      const g = clamp(tint.at(t));
      box.style.background = mix(g, 'var(--success-tint)', 'var(--card)');
      box.style.borderColor = mix(g, 'var(--success)', 'var(--line)');
      box.style.transform = `translateY(${ly.at(t).toFixed(2)}px)`;
      sw.apply(count, 'count', t, 10); sw.apply(live, 'live', t, 10);
    };
  }});

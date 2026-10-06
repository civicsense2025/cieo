

atom({ id:'savemeter', cat:'Guidance', name:'Save meter', block:'form completeness, autosave', fam:['E','S','M'],
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="bc card" style="width:min(320px,94%);padding:14px 16px"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600;line-height:1.5">Profile</b><span style="position:relative;display:inline-flex;height:20px;min-width:118px;justify-content:flex-end"><span class="layer s0" style="justify-content:flex-end"><span class="num" style="font-size:12px;color:var(--muted);line-height:1.5"><span class="dn"></span>% · <span class="ct">0 of 4</span></span></span><span class="layer s1" style="justify-content:flex-end"><span style="background:var(--accent-tint);color:var(--accent);font-weight:600;padding:2px 10px;border-radius:999px;font-size:12px;line-height:1.5">Saved ✓</span></span></span></div><div class="bar" style="position:relative;height:6px;border-radius:99px;background:var(--raised);margin-top:10px;overflow:hidden"><div class="fl" style="position:absolute;left:0;top:0;bottom:0;background:var(--accent);border-radius:99px"></div><div class="hd" style="position:absolute;top:0;bottom:0;background:var(--accent-tint);border-radius:99px"></div></div><div class="ls col" style="gap:0;margin-top:6px"></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Fill:</span></div></div><div class="hint">Tick fields · the bar trails behind you</div>`,
  desc:'Every tick moves the leading edge now and drags the trailing edge 60ms behind while the percent rolls. A full form swaps the label to a Saved success pill that holds.',
  api:'lead.set(f) now, trail.set(f, t + .06)   pct.set(n)   full: label.to(saved) · REDUCE: jump',
  init(st){
    const ls = $(st,'.ls'), fl = $(st,'.fl'), hd = $(st,'.hd'), ct = $(st,'.ct'), tw = $(st,'.tw');
    const I = [['Display name',1],['Avatar image',1],['Short bio',0],['Custom domain',0]];
    const dg = new Digits($(st,'.dn'), 2), lab = new Swap(0), lead = new Track(.5), trail = new Track(.5);
    const rows = I.map(([n,d],ix) => { const b = document.createElement('button'); b.setAttribute('role','checkbox');
      b.style.cssText = 'display:flex;align-items:center;gap:10px;border:0;background:none;padding:8px 0;cursor:pointer;text-align:left;font-size:14px;line-height:1.5;min-height:32px' + (ix < I.length - 1 ? ';border-bottom:1px solid var(--line-soft)' : '');
      b.innerHTML = `<span class="bx" style="width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);flex:none;display:grid;place-items:center;padding:0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--card)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="transform:translateY(.5px)"><path d="M5 12.5 10 17.5 19 7" pathLength="1" stroke-dasharray="1"/></svg></span><span class="tx"></span>`;
      b.querySelector('.tx').textContent = n; ls.appendChild(b);
      const r = { b, bx:b.querySelector('.bx'), ck:b.querySelector('path'), on:d, f:new Track(d) };
      b.setAttribute('aria-checked', !!d);
      b.onclick = () => { r.on = r.on ? 0 : 1; b.setAttribute('aria-checked', !!r.on); REDUCE ? r.f.jump(r.on) : r.f.set(r.on); sync(); };
      return r; });
    const sync = () => { const n = rows.filter(x => x.on).length, f = n/4, t0 = now();
      REDUCE ? lead.jump(f) : lead.set(f); REDUCE ? trail.jump(f) : trail.set(f, S.base, t0 + .06);
      dg.set(String(Math.round(f*100)), REDUCE); ct.textContent = `${n} of 4`;
      const v = n === 4 ? 1 : 0; if (REDUCE){ lab.cur = v; lab.prev = null; lab.t = -9; } else lab.to(v); };
    [['None',0],['All',1]].forEach(([label,v]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = label;
      b.onclick = () => rows.forEach(r => { r.on = v; r.b.setAttribute('aria-checked', !!v); REDUCE ? r.f.jump(v) : r.f.set(v); sync(); }); tw.appendChild(b); });
    const n0 = rows.filter(x => x.on).length; dg.set(String(Math.round(n0/4*100)), true); ct.textContent = `${n0} of 4`; lead.jump(n0/4); trail.jump(n0/4);
    return t => { rows.forEach(r => { const f = clamp(r.f.at(t)); r.bx.style.background = mix(f,'var(--ink)','transparent'); r.bx.style.borderColor = mix(f,'var(--ink)','var(--line)'); r.ck.style.strokeDashoffset = (1 - f).toFixed(3); });
      const l = clamp(lead.at(t)), tr = clamp(trail.at(t)); fl.style.width = (tr*100).toFixed(1) + '%'; fl.style.background = mix(tr,'var(--success)','var(--accent)'); hd.style.left = (tr*100).toFixed(1) + '%'; hd.style.width = (Math.max(0, l - tr)*100).toFixed(1) + '%';
      dg.render(t); [$(st,'.s0'), $(st,'.s1')].forEach((el,j) => lab.apply(el,j,t)); };
  }});

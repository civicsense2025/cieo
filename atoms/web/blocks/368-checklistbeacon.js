

atom({ id:'checklistbeacon', cat:'Guidance', name:'Checklist beacon', block:'onboarding, checklist', fam:['M','S','E'],
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="bc card" style="width:min(320px,94%);padding:14px 16px"><button class="pillbtn" style="display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;cursor:pointer;padding:0;text-align:left;min-height:32px"><span style="display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--accent-tint);padding:0;flex:none"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="transform:translateY(.5px)"><path d="M5 12.5 10 17.5 19 7"/></svg></span><span class="col" style="gap:2px;flex:1"><b style="font-size:15px;font-weight:600;line-height:1.5">Launch list</b><span style="position:relative;display:block;height:20px"><span class="layer h0" style="justify-content:flex-start"><span class="num" style="font-size:12px;color:var(--muted);line-height:1.5"><span class="dn"></span> of 4 done</span></span><span class="layer h1" style="justify-content:flex-start"><span style="background:var(--accent-tint);color:var(--accent);font-weight:600;padding:2px 10px;border-radius:999px;font-size:12px;line-height:1.5">All done ✓</span></span></span></span><span class="chev muted" style="font-size:12px">▾</span></button><div class="bar" style="position:relative;height:6px;border-radius:99px;background:var(--raised);margin-top:10px;overflow:hidden"><div class="fl" style="position:absolute;left:0;top:0;bottom:0;background:var(--accent);border-radius:99px"></div><div class="hd" style="position:absolute;top:0;bottom:0;background:var(--accent-tint);border-radius:99px"></div><span style="position:absolute;top:0;bottom:0;left:25%;width:2px;background:var(--card)"></span><span style="position:absolute;top:0;bottom:0;left:50%;width:2px;background:var(--card)"></span><span style="position:absolute;top:0;bottom:0;left:75%;width:2px;background:var(--card)"></span></div><div class="ls col" style="gap:0;overflow:hidden"></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Congrats:</span></div></div><div class="hint">Tap the pill to fold the list · finish all four</div>`,
  desc:'The pill folds into a list whose height springs open. The segmented bar runs a leading edge now and a trailing edge 60ms behind, and the count rolls. All four done swaps the header to a success pill that holds.',
  api:'list.h.set(open ? full : 0)   bar: lead.set(f), trail.set(f, t + .06)   all 4: head.to(1) · REDUCE: jump',
  init(st){
    const ls = $(st,'.ls'), fl = $(st,'.fl'), hd = $(st,'.hd'), chev = $(st,'.chev'), tw = $(st,'.tw');
    const I = [['Connect a domain',1],['Write the about page',1],['Turn on members',0],['Publish',0]];
    const dn = new Digits($(st,'.dn'), 1), head = new Swap(0), lead = new Track(.5), trail = new Track(.5), H = new Track(160);
    let cel = true, open = true;
    const rows = I.map(([n,d],ix) => { const b = document.createElement('button'); b.setAttribute('role','checkbox');
      b.style.cssText = 'display:flex;align-items:center;gap:10px;border:0;background:none;padding:8px 0;cursor:pointer;text-align:left;font-size:14px;line-height:1.5;min-height:32px' + (ix < I.length - 1 ? ';border-bottom:1px solid var(--line-soft)' : '');
      b.innerHTML = `<span class="bx" style="position:relative;width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);flex:none;display:grid;place-items:center;padding:0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--card)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="transform:translateY(.5px)"><path d="M5 12.5 10 17.5 19 7" pathLength="1" stroke-dasharray="1"/></svg></span><span class="tx"></span>`;
      b.querySelector('.tx').textContent = n; ls.appendChild(b);
      const r = { b, bx:b.querySelector('.bx'), ck:b.querySelector('path'), on:d, f:new Track(d) };
      b.setAttribute('aria-checked', !!d);
      b.onclick = () => { r.on = r.on ? 0 : 1; b.setAttribute('aria-checked', !!r.on); REDUCE ? r.f.jump(r.on) : r.f.set(r.on); sync(); };
      return r; });
    const sync = () => { const n = rows.filter(x => x.on).length, f = n/4, t0 = now();
      REDUCE ? lead.jump(f) : lead.set(f); REDUCE ? trail.jump(f) : trail.set(f, S.base, t0 + .06);
      dn.set(String(n), REDUCE);
      const v = (n === 4 && cel) ? 1 : 0; if (REDUCE){ head.cur = v; head.prev = null; head.t = -9; } else head.to(v); };
    const fold = v => { open = v; const h = ls.scrollHeight || 160; REDUCE ? H.jump(v ? h : 0) : H.set(v ? h : 0); chev.textContent = v ? '▾' : '▸'; };
    $(st,'.pillbtn').onclick = () => fold(!open);
    [['On',true],['Off',false]].forEach(([label,v]) => { const b = document.createElement('button'); b.className = 'btn' + (v ? ' ink' : ''); b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = label; b.setAttribute('aria-pressed', v); b.onclick = () => { cel = v; $$(tw,'.btn').forEach(x => { const on = x === b; x.classList.toggle('ink', on); x.setAttribute('aria-pressed', on); }); sync(); }; tw.appendChild(b); });
    dn.set(String(rows.filter(x => x.on).length), true); sync();
    document.fonts.ready.then(() => H.jump(open ? (ls.scrollHeight || 160) : 0));
    return t => { ls.style.height = px(Math.max(0, H.at(t))); ls.style.opacity = clamp(H.at(t)/60).toFixed(3);
      rows.forEach(r => { const f = clamp(r.f.at(t)); r.bx.style.background = mix(f,'var(--ink)','transparent'); r.bx.style.borderColor = mix(f,'var(--ink)','var(--line)'); r.ck.style.strokeDashoffset = (1 - f).toFixed(3); });
      const l = clamp(lead.at(t)), tr = clamp(trail.at(t)); fl.style.width = (tr*100).toFixed(1) + '%'; hd.style.left = (tr*100).toFixed(1) + '%'; hd.style.width = (Math.max(0, l - tr)*100).toFixed(1) + '%';
      dn.render(t); [$(st,'.h0'), $(st,'.h1')].forEach((el,j) => head.apply(el,j,t)); };
  }});



atom({ id:'checklist', cat:'Content', name:'Checklist', block:'list', fam:['M','S'],
  html:`<div class="col" style="width:min(300px,86%);gap:16px"><div class="row small muted" style="justify-content:space-between"><span>Launch checklist</span><span class="hdn" style="position:relative;display:inline-flex;min-width:92px;height:20px;justify-content:flex-end"><span class="layer" style="justify-content:flex-end"><span class="dn"></span>&nbsp;of 4 done</span><span class="layer" style="justify-content:flex-end"><span style="background:var(--accent-tint);color:var(--accent);font-weight:600;padding:2px 10px;border-radius:999px">All done ✓</span></span></span></div><div class="cl col" style="gap:4px"></div><div class="row small muted" style="gap:8px">Celebrate <button class="btn cb-on" aria-pressed="true" style="padding:2px 9px;font-size:12px">On</button><button class="btn cb-off" aria-pressed="false" style="padding:2px 9px;font-size:12px">Off</button></div></div>`,
  desc:'The box fills, the check draws, and a strike line runs through the text, each 40ms after the last. The done count rolls. All four done swaps the header to a success pill.',
  api:'box.set(1); check.set(1, S.base, t + 0.04); strike.set(1, S.base, t + 0.08)   all 4: head.to(1, S.base) · REDUCE: instant',
  init(st){
    const cl = $(st,'.cl'), dn = new Digits($(st,'.dn'), 1), I = [['Connect a domain',1],['Write the about page',1],['Turn on members',0],['Publish',0]];
    const head = new Swap(0), headL = $$(st,'.hdn .layer'); let celebrate = true;
    const syncHead = () => { const n = rows.filter(x => x.on).length; const v = (n === 4 && celebrate) ? 1 : 0;
      if (REDUCE){ head.cur = v; head.prev = null; head.t = -9; } else head.to(v); };
    const rows = I.map(([n,d]) => { const b = document.createElement('button'); b.type='button';b.setAttribute('role','checkbox'); b.style.cssText = 'display:flex;align-items:center;gap:16px;border:0;background:none;padding:8px 0;min-height:40px;cursor:pointer;text-align:left;font-size:14px';
      b.innerHTML = `<span class="bx" style="position:relative;width:24px;height:24px;border-radius:8px;border:1px solid var(--line);flex:none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--card)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:3px;top:3px"><path d="M5 12.5 10 17.5 19 7" pathLength="1" stroke-dasharray="1"/></svg></span><span class="tx" style="position:relative"><span></span><i style="position:absolute;left:0;top:52%;height:1.5px;background:var(--muted)"></i></span>`;
      $(b,'.tx span').textContent = n; cl.appendChild(b);
      const r = { b, bx:$(b,'.bx'), ck:$(b,'path'), tx:$(b,'.tx'), ln:$(b,'i'), on:d, f:new Track(d), c:new Track(d), s:new Track(d) };
      b.onclick = () => { r.on = r.on ? 0 : 1; const t0 = now(); r.f.set(r.on); r.c.set(r.on, S.base, t0 + (r.on ? .04 : 0)); r.s.set(r.on, S.base, t0 + (r.on ? .08 : 0)); b.setAttribute('aria-checked', !!r.on); dn.set(String(rows.filter(x => x.on).length)); syncHead(); };
      b.setAttribute('aria-checked', !!d); return r; });
    dn.set(String(rows.filter(x => x.on).length), true); syncHead();
    const cb = [$(st,'.cb-on'), $(st,'.cb-off')];
    const pickCb = v => { celebrate = v; cb.forEach((b,i) => { const on = (i === 0) === v; b.setAttribute('aria-pressed', on); b.classList.toggle('ink', on); }); syncHead(); };
    cb.forEach((b,i) => b.onclick = () => pickCb(i === 0)); pickCb(true);
    return t => { rows.forEach(r => { const f = clamp(r.f.at(t)), c = clamp(r.c.at(t)), s = clamp(r.s.at(t));
      r.bx.style.background = mix(f,'var(--accent)','transparent'); r.bx.style.borderColor = mix(f,'var(--accent)','var(--line)'); r.ck.style.strokeDashoffset = (1 - c).toFixed(3);
      r.ln.style.width = (s*100).toFixed(1) + '%'; r.tx.style.color = mix(s,'var(--muted)','var(--ink)'); }); dn.render(t); headL.forEach((el,j) => head.apply(el,j,t)); };
  }});
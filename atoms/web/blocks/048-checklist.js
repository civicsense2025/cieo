

atom({ id:'checklist', cat:'Content', name:'Checklist', block:'list', fam:['M','S'],
  html:`<div class="col" style="width:min(300px,86%);gap:10px"><div class="row small muted" style="justify-content:space-between"><span>Launch checklist</span><span><span class="dn"></span> of 4 done</span></div><div class="cl col" style="gap:4px"></div></div>`,
  desc:'The box fills, the check draws, and a strike line runs through the text, each 40ms after the last. The done count rolls.',
  api:'box.set(1); check.set(1, S.base, t + 0.04); strike.set(1, S.base, t + 0.08)',
  init(st){
    const cl = $(st,'.cl'), dn = new Digits($(st,'.dn'), 1), I = [['Connect a domain',1],['Write the about page',1],['Turn on members',0],['Publish',0]];
    const rows = I.map(([n,d]) => { const b = document.createElement('button'); b.setAttribute('role','checkbox'); b.style.cssText = 'display:flex;align-items:center;gap:10px;border:0;background:none;padding:6px 0;cursor:pointer;text-align:left;font-size:14px';
      b.innerHTML = `<span class="bx" style="position:relative;width:18px;height:18px;border-radius:5px;border:1.5px solid var(--line);flex:none"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--card)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:1.5px;top:1.5px"><path d="M5 12.5 10 17.5 19 7" pathLength="1" stroke-dasharray="1"/></svg></span><span class="tx" style="position:relative"><span></span><i style="position:absolute;left:0;top:52%;height:1.5px;background:var(--muted)"></i></span>`;
      $(b,'.tx span').textContent = n; cl.appendChild(b);
      const r = { b, bx:$(b,'.bx'), ck:$(b,'path'), tx:$(b,'.tx'), ln:$(b,'i'), on:d, f:new Track(d), c:new Track(d), s:new Track(d) };
      b.onclick = () => { r.on = r.on ? 0 : 1; const t0 = now(); r.f.set(r.on); r.c.set(r.on, S.base, t0 + (r.on ? .04 : 0)); r.s.set(r.on, S.base, t0 + (r.on ? .08 : 0)); b.setAttribute('aria-checked', !!r.on); dn.set(String(rows.filter(x => x.on).length)); };
      b.setAttribute('aria-checked', !!d); return r; });
    dn.set(String(rows.filter(x => x.on).length), true);
    return t => { rows.forEach(r => { const f = clamp(r.f.at(t)), c = clamp(r.c.at(t)), s = clamp(r.s.at(t));
      r.bx.style.background = mix(f,'var(--ink)','transparent'); r.bx.style.borderColor = mix(f,'var(--ink)','var(--line)'); r.ck.style.strokeDashoffset = (1 - c).toFixed(3);
      r.ln.style.width = (s*100).toFixed(1) + '%'; r.tx.style.color = mix(s,'var(--muted)','var(--ink)'); }); dn.render(t); };
  }});
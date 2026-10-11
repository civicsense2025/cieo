atom({ id:'rsvp3', cat:'Scheduling', name:'RSVP', block:'rsvp, yes no maybe', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,90%);margin:0 auto;gap:8px;line-height:1.5"><b style="font-size:15px;font-weight:600">Can you make it?</b><div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px"><p style="font-size:13px;margin:0">Summer picnic · Sat 12:00 PM · 20 invited</p><div class="seg" style="position:relative;display:flex;gap:4px;background:var(--raised);border-radius:10px;padding:4px" role="radiogroup"></div><div class="row small muted" style="gap:6px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:10px"><span style="font-size:12px">Plus-one</span><button class="m" style="min-height:32px;min-width:32px;border-radius:8px;border:1.5px solid var(--muted);background:var(--card);cursor:pointer;font-size:13px;padding:0">−</button><b class="g" style="font-size:13px;font-variant-numeric:tabular-nums">0</b><button class="p" style="min-height:32px;min-width:32px;border-radius:8px;border:1.5px solid var(--muted);background:var(--card);cursor:pointer;font-size:13px;padding:0">+</button><span class="note" style="font-size:12px;margin-left:auto;min-width:0;overflow-wrap:anywhere;text-align:right"></span></div></div></div><div class="hint">Maybe holds amber — the honest answer</div>`,
  desc:'One plate slides between yes, no and maybe. Counts roll on digits with every vote, yes inks success and maybe holds a warning tint instead of ever resolving green.',
  api:'plate.go(l, r) single plate   counts Digits roll   maybe: warn.set(1) amber hold',
  init(st){
    const pristine = st.innerHTML;
    const O = ['Yes','No','Maybe'], base = [12,3,5], seg = $(st,'.seg'), pl = edges(0, 0);
    let dead = false;
    const tabs = O.map((o,i) => {
      const b = document.createElement('button'); b.setAttribute('role','radio');
      b.style.cssText = 'position:relative;z-index:1;flex:1;min-width:0;min-height:40px;border:0;background:none;border-radius:8px;cursor:pointer;font-size:13px;color:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;padding:4px 0;overflow:hidden';
      const l = document.createElement('span'); l.textContent = o;
      l.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%'; b.appendChild(l);
      const c = document.createElement('span'); c.style.cssText = 'font-size:12px;font-variant-numeric:tabular-nums;opacity:.7';
      b.appendChild(c); seg.appendChild(b);
      const dg = new Digits(c, 2); dg.set(String(base[i]), true);
      return { b, dg, tn:new Track(0) }; });
    const plate = document.createElement('i');
    plate.style.cssText = 'position:absolute;top:4px;bottom:4px;border-radius:8px;background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.15)';
    seg.prepend(plate);
    let pick = -1, plus = 0;
    const counts = () => tabs.forEach((x,i) => x.dg.set(String(base[i] + (i === pick ? 1 : 0) + (i === 0 ? plus : 0))));
    const vote = i => { pick = i; const t0 = now();
      tabs.forEach((x,j) => x.tn.set(j === i ? 1 : 0, S.base, j === i ? t0 : t0 + .04));
      pl.go(tabs[i].offsetLeft, tabs[i].offsetLeft + tabs[i].offsetWidth);
      counts();
      $(st,'.note').textContent = i === 2 ? 'We saved you a maybe seat' : i === 0 ? 'See you there' : 'You will be missed'; };
    tabs.forEach((x,i) => x.b.onclick = () => vote(i));
    const minus = $(st,'.m'), plusBtn = $(st,'.p');
    minus.onclick = () => { plus = Math.max(0, plus - 1); $(st,'.g').textContent = plus; counts(); };
    plusBtn.onclick = () => { plus = Math.min(4, plus + 1); $(st,'.g').textContent = plus; counts(); };
    counts();
    document.fonts.ready.then(() => { if (!dead) pl.jump(0, 0); }); pl.jump(0, 0);
    const render = t => { const wpx = Math.max(0, pl.B.at(t) - pl.A.at(t));
      plate.style.left = px(pl.A.at(t)); plate.style.width = px(wpx);
      plate.style.opacity = pick < 0 ? '0' : '1';
      plate.style.background = pick === 2 ? mix(clamp(tabs[2].tn.at(t)),'#fef3c7','var(--card)') : 'var(--card)';
      tabs.forEach((x,i) => { x.dg.render(t); const v = clamp(x.tn.at(t));
        x.b.style.fontWeight = v > .5 ? '600' : '400';
        x.b.style.color = i === 2 ? mix(v,'#92400e','var(--ink)') : i === 0 ? mix(v,'var(--success)','var(--ink)') : 'var(--ink)'; }); };
    render.ctl = { tabs, plate:pl, get pick(){ return pick; }, get plus(){ return plus; } };
    render.dispose = () => { if (render.disposed) return; render.disposed = true; dead = true;
      tabs.forEach(x => { x.b.onclick = null; }); minus.onclick = null; plusBtn.onclick = null;
      st.innerHTML = pristine; };
    return render;
  }});

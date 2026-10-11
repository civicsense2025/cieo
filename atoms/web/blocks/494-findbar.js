atom({ id:'findbar', cat:'Chrome', name:'Find-in-page bar', block:'chrome, find, search', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:460px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Find in page</div><div class="small muted" style="font-size:12.5px;line-height:1.5;font-variant-numeric:tabular-nums">Drops top-right on snap &middot; digits roll by direction</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;background:var(--card)"><div class="row" style="gap:8px"><button class="tg" style="min-height:32px;border-radius:8px;border:0;background:var(--raised);font-size:13px;line-height:1.5;cursor:pointer;padding:0 12px">Find &#8984;F</button><div class="bar" style="position:relative;flex:1;display:flex;gap:6px;align-items:center"><input class="q" type="text" value="spring" aria-label="Find text" style="flex:1;min-width:0;min-height:32px;border-radius:8px;border:1.5px solid var(--muted);padding:0 10px;font-size:13.5px;line-height:1.5"><span class="dg" style="font-size:12.5px;line-height:1.5;font-variant-numeric:tabular-nums;white-space:nowrap"></span><button class="pv" aria-label="Previous" style="min-width:32px;min-height:32px;border-radius:8px;border:1.5px solid var(--muted);background:transparent;cursor:pointer">&#8593;</button><button class="nx" aria-label="Next" style="min-width:32px;min-height:32px;border-radius:8px;border:1.5px solid var(--muted);background:transparent;cursor:pointer">&#8595;</button></div></div><div class="doc" style="position:relative;margin-top:8px;border-radius:10px;padding:14px 16px;font-size:13.5px;line-height:1.6;background:color-mix(in oklab, var(--ink) 4%, transparent)"><div class="plate" style="position:absolute;border-radius:6px;background:color-mix(in oklab, var(--ink) 10%, transparent)"></div><span class="tx">A spring settles fast. A spring with damping settles calm. Every spring here lands without overshoot.</span></div><div class="foot small muted" style="font-size:12px;line-height:1.5;margin-top:8px"><span class="msg"></span></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="cs" checked> stretch plate with trailing edges</label></div><div class="hint">Enter next &middot; Shift+Enter previous &middot; Esc closes</div>`,
  desc:'Bar drops top-right on snap. Match digits roll up or down by travel direction while the current-match plate stretches with trailing edges. Last match holds the terminal. Reduced motion jumps instantly.',
  api:'drop.set(open?0:-8,S.snap); dg.dir=travel; plate.go(a,b)   end: last match, hold',
  init(st){
    const bar = $(st,'.bar'), tg = $(st,'.tg'), q = $(st,'.q'), pv = $(st,'.pv'),
          nx = $(st,'.nx'), dg = $(st,'.dg'), msg = $(st,'.msg'),
          tx = $(st,'.tx'), plate = $(st,'.plate'), cs = $(st,'.cs');
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const drop = new Track(-8,S.snap), op = new Track(0,S.snap), pe = edges(0,40);
    const words = tx.textContent.split(' ');
    tx.textContent = '';
    const spans = words.map(wd => { const s = document.createElement('span'); s.textContent = wd + ' '; tx.appendChild(s); return s; });
    const digits = new Digits(dg, 5);
    let open = false, hits = [], qi = 0;
    drop.jump(-8); op.jump(0);
    const layout = k => {
      const r = spans[k].getBoundingClientRect(), d = tx.getBoundingClientRect();
      return [r.left-d.left, r.top-d.top, r.width, r.height];
    };
    const paintPlate = () => {
      if (!hits.length || !cs.checked){ pe.jump(0,0); plate.style.opacity = '0'; return; }
      plate.style.opacity = '1';
      const [lx,ty,w2,hh] = layout(hits[qi]);
      spans.forEach((s,i) => { s.style.background = i === hits[qi] ? 'color-mix(in oklab, var(--ink) 14%, transparent)' : ''; s.style.borderRadius = '4px'; });
      const go = REDUCE ? pe.jump.bind(pe) : pe.go.bind(pe);
      go(lx, lx+w2);
      plate.style.top = (ty-2)+'px'; plate.style.height = (hh+4)+'px';
    };
    const search = dir => {
      const s = q.value.trim().toLowerCase();
      const next = spans.map((sp,i) => sp.textContent.toLowerCase().includes(s) && s ? i : -1).filter(i => i >= 0);
      if (dir) digits.dir = dir;
      hits = next;
      if (!hits.length){ digits.set(' 0/0', true); msg.textContent = 'no matches'; plate.style.opacity = '0'; return; }
      qi = ((qi % hits.length) + hits.length) % hits.length;
      const label = String(qi+1).padStart(2,' ') + '/' + String(hits.length).padStart(2,' ');
      if (REDUCE) digits.set(label, true); else digits.set(label);
      msg.textContent = (qi+1) + ' of ' + hits.length + (qi === hits.length-1 ? ' \u2713 last match' : '');
      paintPlate();
    };
    const setOpen = o => {
      open = o; put(drop, o?0:-8, o?S.snap:S.snap); put(op, o?1:0, o?S.snap:S.snap);
      tg.textContent = o ? 'Close' : 'Find \u2318F';
      if (o){ qi = 0; search(1); setTimeout(() => q.focus(), 20); }
    };
    tg.onclick = () => setOpen(!open);
    nx.onclick = () => { qi++; search(1); };
    pv.onclick = () => { qi--; search(-1); };
    q.addEventListener('input', () => { qi = 0; search(1); });
    q.addEventListener('keydown', e => {
      if (e.key === 'Enter'){ qi += e.shiftKey ? -1 : 1; search(e.shiftKey ? -1 : 1); e.preventDefault(); }
      else if (e.key === 'Escape'){ setOpen(false); tg.focus(); e.preventDefault(); }
      else if (e.key === 'ArrowDown'){ qi++; search(1); e.preventDefault(); }
      else if (e.key === 'ArrowUp'){ qi--; search(-1); e.preventDefault(); }
    });
    search(1);
    return t => {
      bar.style.transform = `translateY(${drop.at(t).toFixed(2)}px)`;
      const o = clamp(op.at(t)); bar.style.opacity = o.toFixed(3);
      bar.style.visibility = o < .02 ? 'hidden' : 'visible';
      plate.style.left = px(pe.A.at(t)); plate.style.width = px(Math.max(0, pe.B.at(t)-pe.A.at(t)));
      digits.render(t);
    };
  }});

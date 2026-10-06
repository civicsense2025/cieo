atom({ id:'profileswitch', cat:'Chrome', name:'Profile switcher', block:'chrome, profile, identity', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:400px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Profile switcher</div><div class="small muted" style="font-size:12.5px;line-height:1.5">Ring inks on base &middot; &#8593;&#8595; + Enter &middot; Esc snaps shut</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;background:var(--card);display:flex;flex-direction:column;gap:8px"><button class="av" aria-haspopup="listbox" style="display:flex;align-items:center;gap:10px;min-height:40px;border-radius:8px;border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);background:transparent;cursor:pointer;padding:4px 10px 4px 4px;text-align:left"><span class="ring" style="display:grid;place-items:center;padding:0;width:32px;height:32px;border-radius:50%;background:color-mix(in oklab, var(--ink) 8%, transparent);font-size:13px;font-weight:600;transform:translateY(.5px)">A</span><span class="who" style="position:relative;flex:1;font-size:13.5px;line-height:1.5;min-height:22px"></span><span class="small muted" style="font-size:12px">Esc</span></button><div class="panel" role="listbox" style="overflow:hidden;border-radius:10px"><div class="opts"></div></div><div class="foot small muted" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums"><span class="msg">1 of 3 active</span></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="wx" checked> spring width to longest name</label></div><div class="hint">Arrows choose &middot; Enter switches &middot; Esc snaps shut</div>`,
  desc:'Avatar ring inks on a base spring. The panel swaps identity with blur while width springs to the longest name. Esc snaps shut on snap. Switching holds the terminal. Reduced motion jumps instantly.',
  api:'ring.set(active?1:0,S.base); w.set(nameW); sw.to(id)   end: switched \u2713, hold',
  init(st){
    const PEOPLE = [{n:'Ada Lovelace',r:'Work'},{n:'Bo',r:'Personal'},{n:'Cleo Zhang-Mbeki',r:'School'}];
    const av = $(st,'.av'), ring = $(st,'.ring'), who = $(st,'.who'),
          panel = $(st,'.panel'), opts = $(st,'.opts'), msg = $(st,'.msg'), wx = $(st,'.wx');
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const ringT = new Track(0,S.base), openT = new Track(0,S.base), w = new Track(120,S.base);
    const sw = new Swap(0);
    const layers = PEOPLE.map((p,i) => {
      const d = document.createElement('div');
      d.style.cssText = 'font-size:13.5px;line-height:1.5;white-space:nowrap';
      d.innerHTML = '<b></b><span class="small muted" style="font-size:12px"></span>';
      d.firstChild.textContent = p.n + ' ';
      d.lastChild.textContent = '\u00B7 ' + p.r;
      who.appendChild(d); return d;
    });
    const rows = PEOPLE.map((p,i) => {
      const b = document.createElement('button');
      b.setAttribute('role','option');
      Object.assign(b.style,{display:'flex',alignItems:'center',gap:'10px',width:'100%',minHeight:'40px',borderRadius:'8px',border:'0',background:'transparent',fontSize:'13.5px',lineHeight:'1.5',cursor:'pointer',padding:'4px 10px',boxSizing:'border-box',textAlign:'left'});
      if (i > 0) b.style.borderTop = '1px solid color-mix(in oklab, var(--ink) 10%, transparent)';
      b.innerHTML = '<span style="display:grid;place-items:center;padding:0;width:28px;height:28px;border-radius:50%;background:color-mix(in oklab, var(--ink) 7%, transparent);font-size:12px;font-weight:600;transform:translateY(.5px)"></span><span></span>';
      b.firstChild.textContent = p.n[0];
      b.lastChild.textContent = p.n + ' \u00B7 ' + p.r;
      opts.appendChild(b);
      b.onclick = () => choose(i);
      return b;
    });
    let cur = 0, open = false, done = true;
    const width = k => {
      const m = document.createElement('span');
      m.textContent = PEOPLE[k].n + ' \u00B7 ' + PEOPLE[k].r;
      Object.assign(m.style,{position:'absolute',visibility:'hidden',whiteSpace:'nowrap',font:'400 13.5px var(--sans)'});
      st.appendChild(m); const x = m.offsetWidth + 60; m.remove(); return x;
    };
    const paint = () => {
      ring.textContent = PEOPLE[cur].n[0];
      msg.textContent = (cur+1) + ' of ' + PEOPLE.length + ' active' + (done ? ' \u2713' : '');
    };
    const setOpen = o => { open = o; put(openT, o?1:0, o?S.base:S.snap); if (o) done = false; };
    const choose = i => { cur = i; done = true; sw.to(i); put(ringT, 1, S.base); put(w, wx.checked ? width(i) : 200, S.base); paint(); setOpen(false); av.focus(); };
    av.onclick = () => setOpen(!open);
    av.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        if (!open) setOpen(true);
        const d = e.key === 'ArrowDown' ? 1 : PEOPLE.length-1;
        const n = (cur+d)%PEOPLE.length; cur = n; done = false;
        sw.to(n); put(ringT, 0.4, S.base); put(w, wx.checked ? width(n) : 200, S.base); paint();
        e.preventDefault();
      }
      else if (e.key === 'Enter'){ choose(cur); e.preventDefault(); }
      else if (e.key === 'Escape'){ setOpen(false); done = true; paint(); e.preventDefault(); }
    });
    put(w, width(0), S.base); w.jump(width(0)); paint();
    return t => {
      const r = clamp(ringT.at(t));
      ring.style.boxShadow = `0 0 0 ${(2+r*2).toFixed(2)}px color-mix(in oklab, var(--ink) ${(20+r*60).toFixed(1)}%, transparent)`;
      const o = clamp(openT.at(t));
      panel.style.height = (o*PEOPLE.length*40).toFixed(2)+'px';
      panel.style.opacity = o.toFixed(3);
      panel.style.visibility = o < .02 ? 'hidden' : 'visible';
      av.style.width = px(w.at(t)); av.style.maxWidth = '100%';
      layers.forEach((l,k) => sw.apply(l,k,t));
      rows.forEach((b,i) => { b.style.background = i === cur && open ? 'color-mix(in oklab, var(--ink) 8%, transparent)' : 'transparent'; });
    };
  }});

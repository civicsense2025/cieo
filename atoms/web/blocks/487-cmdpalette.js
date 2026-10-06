atom({ id:'cmdpalette', cat:'Chrome', name:'Command palette drop', block:'chrome, palette, command', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:440px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Command palette</div><div class="small muted" style="font-size:12.5px;line-height:1.5;font-variant-numeric:tabular-nums">Type to filter &middot; &#8593;&#8595; move &middot; Enter runs &middot; Esc closes</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;display:flex;flex-direction:column;gap:8px;background:var(--card)"><button class="op" style="min-height:32px;border-radius:8px;border:1px solid color-mix(in oklab, var(--ink) 16%, transparent);background:transparent;font-size:13.5px;line-height:1.5;cursor:pointer">Open palette &#8984;K</button><div class="pal" style="overflow:hidden;border-radius:10px"><input class="q" type="text" placeholder="Type a command&hellip;" aria-label="Filter commands" style="width:100%;min-height:36px;border-radius:8px;border:1px solid color-mix(in oklab, var(--ink) 16%, transparent);padding:0 10px;font-size:13.5px;line-height:1.5;box-sizing:border-box"><div class="list" style="position:relative;margin-top:8px"><div class="plate" style="position:absolute;left:0;right:0;border-radius:8px;background:color-mix(in oklab, var(--ink) 8%, transparent)"></div></div><div class="foot small muted" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums"><span class="msg">4 commands</span></div></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="wr" checked> wrap selection</label></div><div class="hint">Arrows move &middot; Enter runs &middot; Esc closes</div>`,
  desc:'Palette drops on a soft spring. Rows spring to their slots while misses blur out. The highlight plate trails its edges by 60ms. Running a command holds a success terminal. Reduced motion jumps instantly.',
  api:'drop.set(open?0:-12,S.soft); row.set(match?1:0); hl.go(top,bottom)   end: ran, hold',
  init(st){
    const CMDS = ['Go to file','Toggle sidebar','New tab','Close window'];
    const list = $(st,'.list'), plate = $(st,'.plate'), q = $(st,'.q'),
          msg = $(st,'.msg'), op = $(st,'.op'), pal = $(st,'.pal'), wr = $(st,'.wr');
    const rows = CMDS.map((c,i) => {
      const r = document.createElement('div');
      r.setAttribute('role','option'); r.tabIndex = -1;
      Object.assign(r.style,{position:'relative',display:'flex',alignItems:'center',gap:'8px',minHeight:'40px',height:'40px',borderRadius:'8px',padding:'0 10px',fontSize:'13.5px',lineHeight:'1.5',cursor:'pointer',overflow:'hidden',boxSizing:'border-box'});
      if (i > 0) r.style.borderTop = '1px solid color-mix(in oklab, var(--ink) 10%, transparent)';
      r.innerHTML = '<span style="display:grid;place-items:center;padding:0;width:22px;height:22px;border-radius:6px;background:color-mix(in oklab, var(--ink) 7%, transparent);font-size:12px;transform:translateY(.5px)">&#8984;</span><span></span>';
      r.lastChild.textContent = c;
      list.appendChild(r); return r;
    });
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const hlgo = (a,b) => { if (REDUCE) hl.jump(a,b); else hl.go(a,b); };
    const drop = new Track(-12,S.soft), opT = new Track(0,S.soft), hl = edges(0,40);
    const mts = rows.map(() => new Track(1,S.base));
    let open = false, qi = 0, done = false;
    drop.jump(-12); opT.jump(0);
    const visIdx = () => {
      const s = q.value.trim().toLowerCase();
      return CMDS.map((_,i) => i).filter(i => CMDS[i].toLowerCase().includes(s));
    };
    const refresh = () => {
      const s = q.value.trim().toLowerCase();
      rows.forEach((_,i) => put(mts[i], CMDS[i].toLowerCase().includes(s) ? 1 : 0, S.base));
      const idx = visIdx();
      if (!idx.includes(qi)) qi = idx.length ? idx[0] : 0;
      const pos = Math.max(0, idx.indexOf(qi));
      hlgo(pos*40, pos*40+40);
      msg.textContent = done ? 'Ran \u201C' + CMDS[qi] + '\u201D \u2713' : idx.length + ' of ' + CMDS.length + ' commands';
    };
    const setOpen = o => {
      open = o; done = false;
      put(drop, o?0:-12, o?S.soft:S.snap); put(opT, o?1:0, o?S.soft:S.snap);
      op.textContent = o ? 'Close palette' : 'Open palette \u2318K';
      if (o){ q.value=''; qi=0; setTimeout(() => q.focus(), 30); }
      refresh();
    };
    const run = () => { done = true; refresh(); };
    op.onclick = () => setOpen(!open);
    q.addEventListener('input', () => { done = false; refresh(); });
    q.addEventListener('keydown', e => {
      const idx = visIdx(); if (!idx.length) return;
      let p = idx.indexOf(qi);
      if (e.key === 'ArrowDown'){ p = p+1 >= idx.length ? (wr.checked ? 0 : idx.length-1) : p+1; qi = idx[p]; const pos = idx.indexOf(qi); hlgo(pos*40,pos*40+40); e.preventDefault(); }
      else if (e.key === 'ArrowUp'){ p = p-1 < 0 ? (wr.checked ? idx.length-1 : 0) : p-1; qi = idx[p]; const pos = idx.indexOf(qi); hlgo(pos*40,pos*40+40); e.preventDefault(); }
      else if (e.key === 'Enter'){ run(); e.preventDefault(); }
      else if (e.key === 'Escape'){ setOpen(false); op.focus(); e.preventDefault(); }
    });
    rows.forEach((r,i) => { r.onclick = () => { if(!open) return; qi = i; run(); }; });
    refresh();
    return t => {
      pal.style.transform = `translateY(${drop.at(t).toFixed(2)}px)`;
      const o = clamp(opT.at(t)); pal.style.opacity = o.toFixed(3);
      pal.style.visibility = o < .02 ? 'hidden' : 'visible';
      plate.style.top = px(hl.A.at(t)); plate.style.height = px(hl.B.at(t) - hl.A.at(t));
      plate.style.opacity = o.toFixed(3);
      rows.forEach((r,i) => {
        const m = clamp(mts[i].at(t));
        r.style.height = (40*m).toFixed(2)+'px'; r.style.minHeight = (40*m).toFixed(2)+'px';
        fade(r, m, (1-m)*6);
      });
    };
  }});

atom({ id:'extpopover', cat:'Chrome', name:'Extension popover', block:'chrome, extension, popover', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:360px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Extension popover</div><div class="small muted" style="font-size:12.5px;line-height:1.5">Grows from the icon &middot; snaps shut faster &middot; Esc closes</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;background:var(--card)"><div class="row" style="justify-content:flex-end"><button class="tb" aria-expanded="false" aria-label="Open extension" style="display:grid;place-items:center;padding:0;width:36px;height:36px;border-radius:8px;border:1px solid color-mix(in oklab, var(--ink) 16%, transparent);background:transparent;font-size:15px;cursor:pointer;transform:translateY(.5px)">&#9673;</button></div><div class="pop" style="overflow:hidden;border-radius:10px;transform-origin:top right"><div class="rows"></div></div><div class="foot small muted" style="font-size:12px;line-height:1.5;margin-top:8px"><span class="msg">closed</span></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="stg" checked> stagger rows 25ms</label></div><div class="hint">Enter toggles &middot; arrows move &middot; Esc snaps shut</div>`,
  desc:'Popover grows from the toolbar icon on base and snaps shut faster on snap. Rows fade in staggered 25ms with the danger row tinted. Choosing holds a terminal. Reduced motion jumps instantly.',
  api:'grow.set(open?1:0,open?S.base:S.snap); row[i] fades +25ms*i   end: chosen, hold',
  init(st){
    const ITEMS = [{t:'Block trackers',d:false},{t:'Save to reading list',d:false},{t:'Remove extension',d:true}];
    const tb = $(st,'.tb'), pop = $(st,'.pop'), box = $(st,'.rows'), msg = $(st,'.msg'), stg = $(st,'.stg');
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const grow = new Track(0,S.base);
    const rows = ITEMS.map((it,i) => {
      const b = document.createElement('button');
      Object.assign(b.style,{display:'flex',alignItems:'center',gap:'8px',width:'100%',minHeight:'40px',borderRadius:'8px',border:'0',cursor:'pointer',padding:'0 10px',fontSize:'13.5px',lineHeight:'1.5',boxSizing:'border-box',textAlign:'left'});
      if (it.d){ b.style.background = 'color-mix(in oklab, #c23b2a 12%, transparent)'; b.style.color = '#c23b2a'; }
      else { b.style.background = 'transparent'; if (i > 0) b.style.borderTop = '1px solid color-mix(in oklab, var(--ink) 10%, transparent)'; }
      b.innerHTML = '<span style="display:grid;place-items:center;padding:0;width:22px;height:22px;border-radius:6px;background:color-mix(in oklab, var(--ink) 7%, transparent);font-size:12px;transform:translateY(.5px)"></span><span></span>';
      b.lastChild.textContent = it.t;
      box.appendChild(b);
      b.onclick = () => pick(i);
      return { b, o:new Track(0,S.base), danger:it.d };
    });
    let open = false, qi = 0;
    const timers = [];
    const setOpen = o => {
      open = o; tb.setAttribute('aria-expanded', String(o));
      put(grow, o?1:0, o?S.base:S.snap);
      timers.forEach(clearTimeout); timers.length = 0;
      rows.forEach((r,i) => {
        if (!o){ put(r.o, 0, S.snap); return; }
        r.o.jump(0);
        timers.push(setTimeout(() => put(r.o, 1, S.base), REDUCE ? 0 : (stg.checked ? i*25 : 0)));
      });
      msg.textContent = o ? ITEMS.length + ' actions' : 'closed';
      if (o) rows[0].b.focus();
    };
    const pick = i => {
      qi = i; msg.textContent = '\u201C' + ITEMS[i].t + '\u201D \u2713';
      setOpen(false);
    };
    tb.onclick = () => setOpen(!open);
    tb.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ setOpen(!open); e.preventDefault(); } };
    box.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        qi = (qi + (e.key === 'ArrowDown' ? 1 : rows.length-1)) % rows.length;
        rows[qi].b.focus(); e.preventDefault();
      }
      else if (e.key === 'Enter'){ pick(qi); e.preventDefault(); }
      else if (e.key === 'Escape'){ setOpen(false); tb.focus(); e.preventDefault(); }
    });
    return t => {
      const g = clamp(grow.at(t));
      pop.style.height = (g*rows.length*40).toFixed(2)+'px';
      pop.style.opacity = g.toFixed(3);
      pop.style.visibility = g < .02 ? 'hidden' : 'visible';
      pop.style.transform = `scale(${(0.92+0.08*g).toFixed(3)})`;
      rows.forEach(r => fade(r.b, clamp(r.o.at(t)), (1-clamp(r.o.at(t)))*6));
    };
  }});

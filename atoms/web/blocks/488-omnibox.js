atom({ id:'omnibox', cat:'Chrome', name:'Omnibox suggestions', block:'chrome, omnibox, suggest', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:440px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Omnibox</div><div class="small muted" style="font-size:12.5px;line-height:1.5;font-variant-numeric:tabular-nums">List height springs to match count &middot; &#8593;&#8595; + Enter &middot; Esc clears</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;display:flex;flex-direction:column;gap:8px;background:var(--card)"><input class="q" type="text" value="git" aria-label="Address bar" style="width:100%;min-height:36px;border-radius:8px;border:1px solid color-mix(in oklab, var(--ink) 16%, transparent);padding:0 10px;font-size:13.5px;line-height:1.5;box-sizing:border-box"><div class="wrap" style="position:relative;overflow:hidden;border-radius:10px"><div class="plate" style="position:absolute;left:0;right:0;border-radius:8px;background:color-mix(in oklab, var(--ink) 8%, transparent)"></div></div><div class="foot small muted" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums"><span class="msg"></span></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="bw" checked> bold matched letters</label></div><div class="hint">Type to filter &middot; Enter opens &middot; Esc clears</div>`,
  desc:'Suggestion list height springs to the match count. Matches spring in with bolded letters while the plate slides with lagging edges. Opening a result holds a success terminal. Reduced motion jumps instantly.',
  api:'h.set(count*40,S.base); row.set(in?1:0); hl.go(top,bottom)   end: opened, hold',
  init(st){
    const URLS = ['git.example.com/team','git-scm.com/docs','gitlab.com/explore','gitter.im/home','gist.example.com'];
    const wrap = $(st,'.wrap'), plate = $(st,'.plate'), q = $(st,'.q'),
          msg = $(st,'.msg'), bw = $(st,'.bw');
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const h = new Track(URLS.length*40, S.base), hl = edges(0,40);
    const hlgo = (a,b) => { if (REDUCE) hl.jump(a,b); else hl.go(a,b); };
    const rows = URLS.map((u,i) => {
      const r = document.createElement('div');
      Object.assign(r.style,{position:'relative',display:'flex',alignItems:'center',gap:'8px',height:'40px',minHeight:'40px',borderRadius:'8px',padding:'0 10px',fontSize:'13.5px',lineHeight:'1.5',cursor:'pointer',overflow:'hidden',boxSizing:'border-box'});
      if (i > 0) r.style.borderTop = '1px solid color-mix(in oklab, var(--ink) 10%, transparent)';
      const ic = document.createElement('span');
      Object.assign(ic.style,{display:'grid',placeItems:'center',padding:'0',width:'22px',height:'22px',borderRadius:'6px',background:'color-mix(in oklab, var(--ink) 7%, transparent)',fontSize:'12px',transform:'translateY(.5px)'});
      ic.textContent = '\u2315';
      const tx = document.createElement('span'); tx.style.cssText = 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      r.appendChild(ic); r.appendChild(tx); wrap.appendChild(r);
      return { r, tx, u, m:new Track(1,S.base) };
    });
    let qi = 0, done = false;
    const paint = (tx, u, s) => {
      tx.textContent = '';
      const k = s.trim().toLowerCase(); const at = k ? u.toLowerCase().indexOf(k) : -1;
      if (at < 0 || !bw.checked){ tx.textContent = u; return; }
      tx.appendChild(document.createTextNode(u.slice(0,at)));
      const b = document.createElement('b'); b.textContent = u.slice(at, at+k.length); tx.appendChild(b);
      tx.appendChild(document.createTextNode(u.slice(at+k.length)));
    };
    const refresh = () => {
      const s = q.value.trim().toLowerCase();
      const idx = rows.map((_,i) => i).filter(i => rows[i].u.toLowerCase().includes(s));
      rows.forEach((row,i) => { put(row.m, rows[i].u.toLowerCase().includes(s) ? 1 : 0, S.base); paint(row.tx, row.u, q.value); });
      if (!idx.includes(qi)) qi = idx.length ? idx[0] : 0;
      const pos = Math.max(0, idx.indexOf(qi));
      put(h, idx.length*40, S.base); hlgo(pos*40, pos*40+40);
      msg.textContent = done ? 'Opened \u201C' + rows[qi].u + '\u201D \u2713' : idx.length + ' of ' + URLS.length + ' matches';
    };
    const open = () => { done = true; refresh(); };
    q.addEventListener('input', () => { done = false; refresh(); });
    q.addEventListener('keydown', e => {
      const s = q.value.trim().toLowerCase();
      const idx = rows.map((_,i) => i).filter(i => rows[i].u.toLowerCase().includes(s));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        if (!idx.length) return;
        let p = idx.indexOf(qi);
        p = e.key === 'ArrowDown' ? (p+1)%idx.length : (p-1+idx.length)%idx.length;
        qi = idx[p]; hlgo(p*40, p*40+40); e.preventDefault();
      }
      else if (e.key === 'Enter'){ if (idx.length) open(); e.preventDefault(); }
      else if (e.key === 'Escape'){ q.value=''; done=false; qi=0; refresh(); q.blur(); e.preventDefault(); }
    });
    rows.forEach((row,i) => { row.r.onclick = () => { qi = i; open(); }; });
    refresh();
    return t => {
      wrap.style.height = px(Math.max(0,h.at(t)));
      plate.style.top = px(hl.A.at(t)); plate.style.height = px(Math.max(0, hl.B.at(t)-hl.A.at(t)));
      rows.forEach(row => {
        const m = clamp(row.m.at(t));
        row.r.style.height = (40*m).toFixed(2)+'px'; row.r.style.minHeight = (40*m).toFixed(2)+'px';
        fade(row.r, m, (1-m)*8);
      });
    };
  }});

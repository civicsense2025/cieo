atom({ id:'settingsearch', cat:'Chrome', name:'Settings search filter', block:'chrome, settings, filter', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:440px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Settings search</div><div class="small muted" style="font-size:12.5px;line-height:1.5;font-variant-numeric:tabular-nums">Filters in place &middot; misses blur out &middot; &#8593;&#8595; highlights</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;background:var(--card)"><input class="q" type="text" placeholder="Search settings&hellip;" aria-label="Search settings" style="width:100%;min-height:36px;border-radius:8px;border:1.5px solid var(--muted);padding:0 10px;font-size:13.5px;line-height:1.5;box-sizing:border-box"><div class="secs" style="margin-top:8px;display:flex;flex-direction:column;gap:8px"></div><div class="foot small muted" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums;margin-top:8px"><span class="msg"></span></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="hl" checked> highlight matched text</label></div><div class="hint">Type to filter &middot; arrows highlight &middot; Enter jumps</div>`,
  desc:'Sections filter in place while misses blur out. Closed section heights spring shut and the highlight plate rides the arrow keys. Jumping to a section holds the terminal. Reduced motion jumps instantly.',
  api:'sec.set(open?1:0,S.base); row.set(match?1:0); hl.go(top,bottom)   end: jumped, hold',
  init(st){
    const DATA = [{s:'Appearance',r:['Theme','Font size']},{s:'Privacy',r:['Block trackers','Clear history']},{s:'Sync',r:['Sync tabs','Manage account']}];
    const secs = $(st,'.secs'), q = $(st,'.q'), msg = $(st,'.msg'), hlc = $(st,'.hl');
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const hl = edges(0,40);
    const hlgo = (a,b) => { if (REDUCE) hl.jump(a,b); else hl.go(a,b); };
    const built = [];
    DATA.forEach((sec,si) => {
      const box = document.createElement('div');
      box.style.cssText = 'position:relative;border:1px solid color-mix(in oklab, var(--ink) 12%, transparent);border-radius:10px;padding:10px 10px 10px;overflow:hidden;box-sizing:border-box';
      const title = document.createElement('div');
      title.style.cssText = 'font-size:13px;font-weight:600;line-height:1.5';
      title.textContent = sec.s;
      const plate = document.createElement('div');
      plate.style.cssText = 'position:absolute;left:4px;right:4px;border-radius:8px;background:color-mix(in oklab, var(--ink) 8%, transparent);pointer-events:none';
      box.appendChild(title); box.appendChild(plate);
      const rowObjs = sec.r.map((rn,ri) => {
        const b = document.createElement('button');
        Object.assign(b.style,{display:'flex',alignItems:'center',width:'100%',minHeight:'40px',borderRadius:'8px',border:'0',background:'transparent',fontSize:'13.5px',lineHeight:'1.5',cursor:'pointer',padding:'0 10px',boxSizing:'border-box',textAlign:'left',position:'relative'});
        if (ri > 0) b.style.borderTop = '1px solid color-mix(in oklab, var(--ink) 10%, transparent)';
        const sp = document.createElement('span'); box.appendChild(b); b.appendChild(sp);
        b.onclick = () => jump(flat.indexOf(ro));
        const ro = { b, sp, name:rn, sec:sec.s, m:new Track(1,S.base), box };
        return ro;
      });
      secs.appendChild(box);
      built.push({ box, plate, title, rows:rowObjs, h:new Track(1,S.base) });
    });
    const flat = built.flatMap(b => b.rows);
    let qi = 0, done = false;
    const paintRow = (ro, s) => {
      ro.sp.textContent = '';
      const at = s ? ro.name.toLowerCase().indexOf(s) : -1;
      if (at < 0 || !hlc.checked){ ro.sp.textContent = ro.name; return; }
      ro.sp.appendChild(document.createTextNode(ro.name.slice(0,at)));
      const b = document.createElement('b'); b.textContent = ro.name.slice(at, at+s.length); ro.sp.appendChild(b);
      ro.sp.appendChild(document.createTextNode(ro.name.slice(at+s.length)));
    };
    const refresh = () => {
      const s = q.value.trim().toLowerCase();
      const vis = flat.filter(ro => ro.name.toLowerCase().includes(s) || ro.sec.toLowerCase().includes(s));
      flat.forEach(ro => { put(ro.m, vis.includes(ro) ? 1 : 0, S.base); paintRow(ro, s); });
      built.forEach(b => {
        const any = b.rows.some(ro => vis.includes(ro));
        put(b.h, any ? 1 : 0, S.base);
      });
      if (!vis.includes(flat[qi])) qi = flat.length && vis.length ? flat.indexOf(vis[0]) : 0;
      const order = flat.filter(ro => vis.includes(ro));
      const pos = Math.max(0, order.indexOf(flat[qi]));
      hlgo(pos*40, pos*40+40);
      const ro = flat[qi];
      msg.textContent = done && ro ? 'Jumped to \u201C' + ro.name + '\u201D \u2713' : vis.length + ' of ' + flat.length + ' settings';
      flat.forEach(ro2 => { ro2.b.style.outline = (ro2 === ro) ? '2px solid color-mix(in oklab, var(--ink) 40%, transparent)' : 'none'; ro2.b.style.outlineOffset = '-2px'; });
    };
    const jump = i => { qi = i; done = true; refresh(); };
    q.addEventListener('input', () => { done = false; refresh(); });
    q.addEventListener('keydown', e => {
      const s = q.value.trim().toLowerCase();
      const vis = flat.filter(ro => ro.name.toLowerCase().includes(s) || ro.sec.toLowerCase().includes(s));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        if (!vis.length) return;
        let p = vis.indexOf(flat[qi]);
        p = e.key === 'ArrowDown' ? (p+1)%vis.length : (p-1+vis.length)%vis.length;
        qi = flat.indexOf(vis[p]); done = false; refresh(); e.preventDefault();
      }
      else if (e.key === 'Enter'){ if (vis.length) jump(qi); e.preventDefault(); }
      else if (e.key === 'Escape'){ q.value=''; done=false; refresh(); q.blur(); e.preventDefault(); }
    });
    refresh();
    return t => {
      flat.forEach(ro => {
        const m = clamp(ro.m.at(t));
        ro.b.style.height = (40*m).toFixed(2)+'px'; ro.b.style.minHeight = (40*m).toFixed(2)+'px';
        fade(ro.b, m, (1-m)*6);
      });
      built.forEach(b => {
        const open = clamp(b.h.at(t));
        const rowsH = b.rows.reduce((a,ro) => a + 40*clamp(ro.m.at(t)), 0);
        b.box.style.height = (34 + rowsH).toFixed(2)+'px';
        b.box.style.opacity = (0.25+0.75*open).toFixed(3);
        b.plate.style.top = px(hl.A.at(t)+30); b.plate.style.height = '0px'; b.plate.style.opacity = '0';
      });
    };
  }});

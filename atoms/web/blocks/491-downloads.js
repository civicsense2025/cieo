atom({ id:'downloads', cat:'Chrome', name:'Downloads shelf', block:'chrome, downloads, progress', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:440px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Downloads</div><div class="small muted" style="font-size:12.5px;line-height:1.5;font-variant-numeric:tabular-nums">Shelf pushes up &middot; rows stagger 40ms &middot; ring fills live</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;background:var(--card)"><button class="go" style="min-height:32px;width:100%;border-radius:8px;border:0;background:var(--ink);color:var(--card);font-size:13.5px;line-height:1.5;cursor:pointer">Download 3 files</button><div class="shelf" style="overflow:hidden;border-radius:10px"><div class="rows" style="display:flex;flex-direction:column"></div></div><div class="foot small muted" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums;margin-top:8px"><span class="pct"></span> <span class="msg">idle</span></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="st" checked> stagger rows 40ms</label></div><div class="hint">Enter starts &middot; Esc resets</div>`,
  desc:'The shelf pushes up on a base spring. Rows stagger in every 40ms while each ring fills live, then swap-blurs to a success check with rolling digits. All complete holds the terminal. Reduced motion jumps instantly.',
  api:'shelf.set(open?1:0,S.base); row[i].set(1,delay 40ms); ring tracks bytes   end: complete \u2713, hold',
  init(st){
    const FILES = ['Setup.dmg','Report.pdf','Wallpaper.png'];
    const go = $(st,'.go'), rows = $(st,'.rows'), shelf = $(st,'.shelf'),
          pct = $(st,'.pct'), msg = $(st,'.msg'), stg = $(st,'.st');
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const shelfT = new Track(0,S.base), prog = new Track(0,S.base);
    const sw = new Swap(0);
    const dg = new Digits(pct, 3);
    dg.set('  0', true);
    const card = FILES.map((f,i) => {
      const r = document.createElement('div');
      Object.assign(r.style,{display:'flex',alignItems:'center',gap:'10px',minHeight:'40px',borderRadius:'8px',padding:'4px 10px 4px 4px',boxSizing:'border-box'});
      if (i > 0) r.style.borderTop = '1px solid color-mix(in oklab, var(--ink) 10%, transparent)';
      r.innerHTML = '<span class="ring" style="display:grid;place-items:center;padding:0;width:32px;height:32px;border-radius:50%;font-size:12px;transform:translateY(.5px)"></span><span style="flex:1;min-width:0"><span class="nm" style="display:block;font-size:13.5px;line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span><span class="st8 small muted" style="display:block;font-size:12px;line-height:1.5"></span></span><span class="ck" style="position:relative;width:20px;height:20px;display:grid;place-items:center"></span>';
      r.querySelector('.nm').textContent = f;
      r.querySelector('.st8').textContent = 'waiting';
      const ck = r.querySelector('.ck');
      const a = document.createElement('span'), b = document.createElement('span');
      a.textContent = ''; b.textContent = '\u2713';
      b.style.cssText = 'font-size:14px;color:var(--success)';
      ck.appendChild(a); ck.appendChild(b);
      rows.appendChild(r);
      return { r, ring:r.querySelector('.ring'), st8:r.querySelector('.st8'), ck:[a,b], show:new Track(0,S.base), p:new Track(0,S.base), sw:new Swap(0) };
    });
    shelf.style.height = '0px';
    let busy = false, raf = 0;
    const renderMsg = doneAll => { msg.textContent = doneAll ? '3 of 3 complete \u2713' : (busy ? 'downloading\u2026' : 'idle'); };
    const start = () => {
      if (busy) return; busy = true;
      card.forEach(c => { c.sw.to(0); c.p.jump(0); });
      sw.to(0); prog.jump(0); dg.set('  0', true);
      put(shelfT, 1, S.base); renderMsg(false);
      const t0 = now();
      card.forEach((c,i) => setTimeout(() => { put(c.show, 1, S.base); c.st8.textContent = 'downloading\u2026'; }, REDUCE ? 0 : (stg.checked ? i*40 : 0)));
      cancelAnimationFrame(raf);
      const tick = () => {
        const el = (now()-t0);
        const p = clamp(el/2.4);
        prog.set(p);
        dg.set(String(Math.round(p*100)).padStart(3,' '));
        card.forEach((c,i) => {
          const lp = clamp((el - i*0.35)/1.4);
          c.p.set(lp);
          if (lp >= 1 && c.sw.cur !== 1){ c.sw.to(1); c.st8.textContent = 'done \u2713'; }
        });
        if (p >= 1){ busy = false; sw.to(1); renderMsg(true); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const reset = () => { busy = false; cancelAnimationFrame(raf); put(shelfT, 0, S.snap); card.forEach(c => put(c.show, 0, S.snap)); dg.set('  0', true); renderMsg(false); };
    go.onclick = start;
    go.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ start(); e.preventDefault(); } else if (e.key === 'Escape'){ reset(); e.preventDefault(); } };
    st.addEventListener('keydown', e => { if (e.key === 'Escape') reset(); });
    return t => {
      const s = clamp(shelfT.at(t));
      shelf.style.height = (s*card.length*48).toFixed(2)+'px';
      shelf.style.transform = `translateY(${((1-s)*-10).toFixed(2)}px)`;
      shelf.style.opacity = s.toFixed(3);
      const p = clamp(prog.at(t));
      dg.render(t);
      card.forEach(c => {
        const m = clamp(c.show.at(t)), cp = clamp(c.p.at(t));
        c.r.style.opacity = m.toFixed(3);
        c.r.style.visibility = m < .02 ? 'hidden' : 'visible';
        c.ring.style.background = `conic-gradient(var(--success) ${(cp*100).toFixed(1)}%, color-mix(in oklab, var(--ink) 10%, transparent) 0)`;
        c.ring.textContent = Math.round(cp*100) + '';
        c.ring.style.fontVariantNumeric = 'tabular-nums';
        c.sw.apply(c.ck[0], 0, t); c.sw.apply(c.ck[1], 1, t);
      });
    };
  }});

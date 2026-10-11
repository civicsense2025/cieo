

atom({ id:'voicenote', cat:'Writing', name:'Audio-note insert', block:'richtext editor, audio', fam:['X','M'], tall:true,
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><style>
.vn{position:relative;height:320px;margin:0 auto;width:min(340px,92%);padding:14px;text-align:left;overflow:hidden}
.vn-doc{font-size:13.5px;line-height:1.6;color:var(--muted)}
.vn-doc b{color:var(--ink)}
.vs{position:absolute;left:14px;right:14px;top:118px;height:0;overflow:visible}
.vs i{position:absolute;left:0;right:0;top:0;display:block;height:0;border:1.5px dashed var(--line);border-radius:12px;opacity:0}
.vt{position:absolute;left:0;top:0;width:190px;height:56px;border-radius:12px;background:var(--raised);border:0;display:flex;align-items:center;gap:8px;padding:0 12px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.vb{flex:none;width:3px;border-radius:2px;background:var(--ink)}
.vn-tray{position:absolute;left:14px;right:14px;bottom:56px;height:72px;border-radius:12px;border:0;background:var(--bg)}
.vn-ctl{position:absolute;left:14px;right:14px;bottom:12px;display:flex;gap:8px}
</style>
<div class="card vn"><div class="vn-doc"><b>Spring launch</b><br>Doors at 6 pm, talk at 7. Press play on the note, or drop it into the draft.</div><div class="vs"><i></i></div><div class="vn-tray"></div><div class="vt"><span class="vw" style="display:flex;align-items:center;gap:2.5px;height:26px"></span><span class="small muted">0:12</span></div><div class="vn-ctl"><button class="btn pl" type="button" aria-label="Play or pause note" style="position:relative;height:32px;min-width:70px"></button><button class="btn insb" type="button" aria-label="Insert into draft" style="position:relative;height:32px;min-width:78px"></button></div></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Preview waveform</span></label><div class="hint">Drag the note, or use Insert</div>`,
  desc:'The tile lifts under your pointer and follows it. Dropping it over the draft draws the waveform bar by bar on soft and opens the slot on a height spring. Play and Insert do the same without dragging.',
  api:'down: lft.set(1)   drop in: x/y.set(slot, soft); bars i·.03 soft; hs.set(64)   pl/ib mirror',
  init(st){
    const stage = $(st,'.vn'), tile = $(st,'.vt'), slotBox = $(st,'.vs i');
    const H = [8,14,20,12,22,16,10,18,24,14,10,16,20,12], vw = $(st,'.vw');
    const bars = H.map(() => { const b = document.createElement('span'); b.className = 'vb'; b.style.height = '0px'; vw.appendChild(b); return b; });
    const hi = H.map(() => new Track(0));
    const X0 = 22, Y0 = 200, TW = 190, TH = 56;
    const x = new Track(X0), y = new Track(Y0), lft = new Track(0), hs = new Track(0), so = new Track(0);
    const pl = $(st,'.pl'), ib = $(st,'.insb'), PE = {}, IE = {};
    for (const [k, label] of [['play','Play'],['pause','Pause']]){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = label; pl.appendChild(e); PE[k] = e; }
    for (const [k, label] of [['out','Insert'],['in','Remove']]){ const e = document.createElement('span'); e.className = 'layer'; e.textContent = label; ib.appendChild(e); IE[k] = e; }
    const psw = new Swap('play'), isw = new Swap('out');
    let inserted = false, playing = false, drew = false;
    const slotP = () => ({ x:(stage.clientWidth - TW)/2, y:122 });
    const draw = t => { if (drew) return; drew = true;
      hi.forEach((h,k) => REDUCE ? h.jump(H[k]) : h.set(H[k], S.soft, t + k*.03)); };
    const snapBack = t => { if (REDUCE){ x.jump(X0); y.jump(Y0); } else { x.set(X0, S.soft, t); y.set(Y0, S.soft, t); } };
    const insert = t => { inserted = true; const p = slotP(); draw(t);
      if (REDUCE){ x.jump(p.x); y.jump(p.y); hs.jump(64); so.jump(1); isw.cur = 'in'; isw.prev = null; }
      else { x.set(p.x, S.soft, t); y.set(p.y, S.soft, t); hs.set(64, S.base, t); so.set(1, S.base, t); isw.to('in', t); } };
    const remove = t => { inserted = false;
      if (REDUCE){ x.jump(X0); y.jump(Y0); hs.jump(0); so.jump(0); isw.cur = 'out'; isw.prev = null; }
      else { x.set(X0, S.soft, t); y.set(Y0, S.soft, t); hs.set(0, S.base, t + EXIT); so.set(0, S.snap, t); isw.to('out', t); } };
    ib.onclick = () => inserted ? remove(now()) : insert(now());
    pl.onclick = () => { playing = !playing; const t = now(); draw(t);
      if (REDUCE){ psw.cur = playing ? 'pause' : 'play'; psw.prev = null; } else psw.to(playing ? 'pause' : 'play', t); };
    drag(tile, {
      down:() => { if (REDUCE) lft.jump(1); else lft.set(1, S.snap); },
      move:(p, e) => { const r = stage.getBoundingClientRect();
        x.jump(e.clientX - r.left - TW/2); y.jump(e.clientY - r.top - TH/2); },
      up:() => { const t = now(); if (REDUCE) lft.jump(0); else lft.set(0, S.snap);
        if (y.at(t) < 180) insert(t); else if (inserted) remove(t); else snapBack(t); }
    });
    return t => {
      const lf = clamp(lft.at(t));
      tile.style.transform = `translate(${x.at(t).toFixed(1)}px, ${(y.at(t) - 8*lf).toFixed(1)}px)`;
      tile.style.boxShadow = lf > .02 ? '0 10px 24px rgba(0,0,0,.18)' : 'none';
      tile.style.cursor = lf > .02 ? 'grabbing' : 'grab';
      slotBox.style.height = px(Math.max(0, hs.at(t)));
      slotBox.style.opacity = clamp(so.at(t)).toFixed(3);
      bars.forEach((b,k) => { const wob = playing && !REDUCE ? .72 + .28*Math.sin(t*7 + k*.9) : 1;
        b.style.height = px(Math.max(0, hi[k].at(t)*wob)); });
      for (const k in PE) psw.apply(PE[k], k, t, 3);
      for (const k in IE) isw.apply(IE[k], k, t, 3);
    };
  }});

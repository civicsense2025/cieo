

atom({ id:'hintbubble', cat:'Guidance', name:'Hint bubble', block:'form hints, coachmarks', fam:['X','E','S'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="ui card" style="position:relative;width:min(320px,94%);padding:14px 16px"><b style="font-size:15px;font-weight:600;line-height:1.5">Billing details</b><div class="small muted" style="line-height:1.5">The bubble follows your focus.</div><div class="flds" style="margin-top:6px"><label class="f0" style="display:block;padding:10px 0;border-bottom:1px solid var(--line-soft)"><span style="display:block;font-size:12px;color:var(--muted);line-height:1.5">Name</span><input class="in" aria-label="Name" placeholder="Ada Lovelace" style="width:100%;border:0;background:none;font:inherit;font-size:14px;line-height:1.5;padding:2px 0;outline:none"></label><label class="f1" style="display:block;padding:10px 0"><span style="display:block;font-size:12px;color:var(--muted);line-height:1.5">Email</span><input class="in" aria-label="Email" placeholder="ada@analytical.engine" style="width:100%;border:0;background:none;font:inherit;font-size:14px;line-height:1.5;padding:2px 0;outline:none"></label></div><div class="bb" style="position:absolute;width:190px;background:var(--ink);color:var(--card);border-radius:10px;padding:10px 12px;visibility:hidden"><div class="bt" style="position:relative;min-height:40px"></div></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Field:</span></div></div><div class="hint">Click a field · typing dismisses fast</div>`,
  desc:'The bubble rises beside the focused field and glides field to field with both edges trailing 60ms behind; only its text swaps. Typing snaps it shut — the quiet form is the terminal.',
  api:'bubble.{x,y} edges-trail .06   tip.to(field)   typing: o.set(0, snap) · REDUCE: jump',
  init(st){
    const ui = $(st,'.ui'), bb = $(st,'.bb'), bt = $(st,'.bt'), tw = $(st,'.tw');
    const TIPS = ['First and last — it prints on the invoice.', 'Work email — receipts land here, never spam.'];
    const L = TIPS.map(p => { const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += 'justify-content:flex-start;white-space:normal;text-align:left'; e.innerHTML = `<span style="font-size:12.5px;line-height:1.5">${p}</span>`; bt.appendChild(e); return e; });
    const ex = edges(0, 190), ey = edges(0, 0), o = new Track(0), sw = new Swap(0); let cur = -1;
    const flds = [$(st,'.f0'), $(st,'.f1')];
    const place = (n, inst) => { cur = n; const R = REDUCE || inst;
      if (n < 0){ R ? o.jump(0) : o.set(0, S.snap); return; }
      const u = ui.getBoundingClientRect(), r = flds[n].querySelector('input').getBoundingClientRect();
      const x = Math.max(8, Math.min(u.width - 198, (r.left - u.left))), y = (r.top - u.top) - 62;
      if (R){ ex.jump(x, x + 190); ey.jump(y, y + 60); o.jump(1); sw.cur = n; sw.prev = null; sw.t = -9; }
      else { ex.go(x, x + 190); ey.go(y, y + 60); o.set(1, S.base); sw.to(n); } };
    flds.forEach((f,n) => { f.querySelector('input').addEventListener('focus', () => place(n)); f.querySelector('input').addEventListener('input', () => { cur = -1; REDUCE ? o.jump(0) : o.set(0, S.snap); }); });
    [['Name',0],['Email',1],['Hide',-1]].forEach(([label,n]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = label; b.onclick = () => { n < 0 ? place(-1, true) : (flds[n].querySelector('input').focus(), place(n)); }; tw.appendChild(b); });
    addEventListener('resize', () => { if (cur >= 0) place(cur, true); });
    return t => { const x0 = ex.A.at(t), y0 = ey.A.at(t); bb.style.left = px(x0); bb.style.top = px(Math.max(4, y0));
      pop(bb, o.at(t), 6); L.forEach((el,k) => sw.apply(el,k,t)); };
  }});

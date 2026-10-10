

atom({ id:'presence', cat:'Writing', name:'Live collaborators', block:'richtext editor (multiplayer)', fam:['M','X','T'], tall:true,
  html:`<div class="card" style="position:relative;width:min(380px,92%);padding:16px"><div class="row" style="justify-content:space-between;margin-bottom:8px"><b class="small">Launch plan</b><div class="av row" style="gap:0;padding:4px 0 4px 6px;margin:-4px 0 -4px -6px"></div></div><p class="tx small" style="margin:0;line-height:1.8"></p></div>`,
  desc:'Remote cursors glide word to word with name flags, and each person’s avatar joins the stack with a ring in their color. Positions are scheduled on the clock, so the scene replays identically.',
  api:'cursor.{x,y}.set(word[i] rect) every 1.3s   avatar.o.set(1)',
  init(st){
    const tx = $(st,'.tx'), av = $(st,'.av'), card = tx.parentNode;
    const words = wordSpans(tx, 'Ship the pricing page on Tuesday, then the members area on Thursday. Maya owns copy and Theo owns the checkout flow. We review together Friday morning.');
    const U = [['Maya','var(--accent)', .0, [3,9,14,20,26]],['Theo','var(--warning)', 1.6, [24,11,17,2,22]]];
    const us = U.map(([n,c,delay,seq]) => { const cur = document.createElement('div'); cur.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
      cur.innerHTML = `<i style="display:block;width:2px;height:18px;background:${c}"></i><span style="position:absolute;left:0;top:-16px;font:600 10.5px var(--sans);color:#fff;background:${c};padding:1px 5px;border-radius:4px 4px 4px 0;white-space:nowrap">${n}</span>`; card.appendChild(cur);
      const a = document.createElement('span'); a.style.cssText = `width:26px;height:26px;margin-left:-6px;border-radius:50%;background:${c};color:#fff;font:600 11px var(--sans);display:grid;place-items:center;border:2px solid var(--card);box-shadow:0 0 0 0 ${c}`; a.textContent = n[0]; av.appendChild(a);
      return { cur, a, c, delay, seq, x:new Track(0), y:new Track(0), o:new Track(0), step:-1, joined:0 }; });
    const pos = w => { const r = w.getBoundingClientRect(), c = card.getBoundingClientRect(); return [r.left - c.left + r.width, r.top - c.top + 2]; };
    return t => us.forEach(u => { const k = Math.floor((t - u.delay)/1.3); if (k >= 0 && k !== u.step){ const first = u.step < 0; u.step = k; const [x,y] = pos(words[u.seq[k % u.seq.length] % words.length]); first ? (u.x.jump(x), u.y.jump(y)) : (u.x.set(x), u.y.set(y)); if (first){ u.o.set(1); u.joined = t; } }
      const p = clamp(u.o.at(t)); u.cur.style.transform = `translate(${px(u.x.at(t))},${px(u.y.at(t))})`; u.cur.style.opacity = p.toFixed(3); u.a.style.opacity = p.toFixed(3); u.a.style.transform = `scale(${(.6 + .4*p).toFixed(3)})`;
      const ring = clamp(1 - (t - u.joined)/.9)*(u.joined ? 1 : 0); u.a.style.boxShadow = `0 0 0 ${px(4*ring)} color-mix(in oklab, ${u.c} ${(ring*60).toFixed(0)}%, transparent)`; });
  }});
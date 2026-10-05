

atom({ id:'chatthread', cat:'AI chat', name:'Chat send and reply', block:'chat, comments', fam:['M','X','T'], tall:true,
  html:`<div class="card col" style="position:relative;width:min(340px,90%);height:300px;overflow:hidden"><div class="th col" style="flex:1;gap:8px;padding:12px;overflow:hidden;justify-content:flex-end"></div><form class="row cf" style="gap:6px;padding:8px;border-top:1px solid var(--line-soft)"><input id="chat-in" value="Can we ship Thursday?" autocomplete="off" aria-label="Message" style="flex:1;min-width:0;border:1px solid var(--line);border-radius:18px;padding:8px 12px;background:var(--bg);color:var(--ink);font:14px var(--sans);outline:none"><button class="btn ink" style="border-radius:18px">Send</button></form><div class="fly" style="position:absolute;left:0;top:0;padding:8px 12px;border-radius:18px;background:var(--ink);color:var(--card);font:14px var(--sans);white-space:nowrap;visibility:hidden"></div></div>`,
  desc:'Your message lifts out of the input and travels to the thread as a bubble. A typing indicator then pulses in a wave and morphs into the reply bubble, growing to fit the text before the words fade in.',
  api:'fly.{x,y}.set(slot)   dots: o = 0.4 + 0.6·wave(t − i·0.15)   bubble.{w,h}.set(measure(reply))',
  init(st){
    const th = $(st,'.th'), cf = $(st,'.cf'), inp = $(st,'input'), fly = $(st,'.fly');
    const R = ['Yes. QA signed off this morning, so Thursday works.','I’ll draft the announcement and send it over by noon.','Pricing page is live in preview if you want a look first.'];
    let k = 0, q = []; const fx = new Track(0), fy = new Track(0), fo = new Track(0, S.snap);
    const bubble = (mine, html) => { const b = document.createElement('div'); b.style.cssText = `align-self:${mine ? 'flex-end' : 'flex-start'};max-width:80%;padding:8px 12px;border-radius:18px;font-size:14px;line-height:1.4;${mine ? 'background:var(--ink);color:var(--card)' : 'background:var(--raised);color:var(--ink)'};overflow:hidden;position:relative`; b.innerHTML = html; th.appendChild(b); while (th.children.length > 6) th.firstChild.remove(); return b; };
    let reply = null;
    cf.onsubmit = ev => { ev.preventDefault(); const txt = inp.value.trim(); if (!txt || q.length) return; const t0 = now();
      const ir = relRect(st, inp.getBoundingClientRect()); fly.textContent = txt; fx.jump(ir.x); fy.jump(ir.y); fo.jump(1); inp.value = '';
      const mine = bubble(true, ''); mine.textContent = txt; mine.style.visibility = 'hidden';
      requestAnimationFrame(() => { const r = relRect(st, mine.getBoundingClientRect()); fx.set(r.x); fy.set(r.y); });
      q = [[t0 + .45, () => { mine.style.visibility = 'visible'; fo.jump(0); reply = { b:bubble(false, '<span class="dots" style="display:inline-flex;gap:4px;padding:4px 2px">' + '<i style="width:7px;height:7px;border-radius:50%;background:var(--muted)"></i>'.repeat(3) + '</span>'), t:now(), w:new Track(46), h:new Track(32), o:new Track(0) }; reply.b.style.width = '46px'; }],
           [t0 + 2.1, () => { const txt2 = R[k++ % R.length], m = document.createElement('div'); m.style.cssText = 'position:absolute;visibility:hidden;max-width:220px;padding:8px 12px;font-size:14px;line-height:1.4'; m.textContent = txt2; th.appendChild(m); const W = Math.min(m.offsetWidth + 2, th.clientWidth*.8), H = m.offsetHeight; m.remove();
             reply.b.innerHTML = `<span class="rt" style="display:block;width:${W - 24}px;opacity:0">${txt2}</span>`; reply.w.set(W); reply.h.set(H); reply.o.set(1, S.base, now() + .12); reply.done = true; }],
           [t0 + 2.2, () => { inp.value = ['Great, thanks.','Perfect.','Sounds good.'][k % 3]; }]]; };
    return t => { while (q.length && q[0][0] <= t) q.shift()[1](); fly.style.transform = `translate(${px(fx.at(t))},${px(fy.at(t))})`; fly.style.visibility = fo.at(t) > .5 ? 'visible' : 'hidden';
      if (reply){ if (!reply.done){ $$(reply.b,'.dots i').forEach((d,i) => { const w = .5 + .5*Math.sin((t - reply.t)*6 - i*.9); d.style.opacity = (.35 + .65*w).toFixed(3); d.style.transform = `translateY(${px(-2*w)})`; }); }
        else { reply.b.style.width = px(reply.w.at(t)); reply.b.style.height = px(reply.h.at(t)); const rt = $(reply.b,'.rt'); if (rt) fade(rt, reply.o.at(t), null); if (!reply.w.prune(t) && !reply.o.prune(t)){ reply.b.style.width = reply.b.style.height = ''; reply = null; } } } };
  }});
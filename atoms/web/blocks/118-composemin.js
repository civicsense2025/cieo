

atom({ id:'composemin', cat:'Email', name:'Minimize to bar', block:'Dialog / sheet, compose window', fam:['M','X'], tall:true,
  html:`<div class="fr card" style="position:relative;width:min(380px,92%);height:290px;overflow:hidden;background:var(--bg)"><p class="small muted" style="padding:14px;margin:0">Inbox · 12 unread</p><div class="cw card" style="position:absolute;overflow:hidden"><div class="hd row" style="height:36px;padding:0 6px 0 12px;background:var(--ink);color:var(--card);cursor:pointer;justify-content:space-between"><b class="small">New message</b><button class="mn" aria-label="Minimize" style="border:0;background:none;color:inherit;cursor:pointer;width:28px;height:28px">—</button></div><div class="bd col small" style="padding:10px 12px;gap:6px"><span class="muted">To: theo@studio.co</span><span class="muted">Subject: Pricing</span><span>Can we review the yearly toggle today?</span></div></div></div>`,
  desc:'Minimizing flies the window down into a bar at the bottom edge. Its position, size and radius each spring from the window’s rect, and the body fades first. Clicking the bar restores it along the same path.',
  api:'win.{x,y,w,h}.set(minimized ? barRect : windowRect)   body.o.set(!minimized)',
  init(st){
    const fr = $(st,'.fr'), cw = $(st,'.cw'), bd = $(st,'.bd'), mn = $(st,'.mn'), hd = $(st,'.hd');
    const T = { x:new Track(0), y:new Track(0), w:new Track(0), h:new Track(0), b:new Track(1) }; let mini = false;
    const big = () => [24, 44, fr.clientWidth - 48, 200], bar = () => [fr.clientWidth - 200, fr.clientHeight - 36, 188, 36];
    const go = (m, inst) => { mini = m; const [x,y,w,h] = m ? bar() : big(), k = inst ? 'jump' : 'set', t0 = now(); T.x[k](x, S.base, t0 + (m ? EXIT : 0)); T.y[k](y, S.base, t0 + (m ? EXIT : 0)); T.w[k](w, S.base, t0 + (m ? EXIT : 0)); T.h[k](h, S.base, t0 + (m ? EXIT : 0)); m ? T.b.set(0, S.snap) : T.b.set(1, S.base, t0 + .15); mn.setAttribute('aria-label', m ? 'Restore' : 'Minimize'); };
    mn.onclick = e => { e.stopPropagation(); go(!mini); }; hd.onclick = () => mini && go(false); requestAnimationFrame(() => go(false, true));
    return t => { Object.assign(cw.style, { left:px(T.x.at(t)), top:px(T.y.at(t)), width:px(T.w.at(t)), height:px(T.h.at(t)), borderRadius:mini ? '10px 10px 0 0' : '12px' }); fade(bd, T.b.at(t), null); };
  }});
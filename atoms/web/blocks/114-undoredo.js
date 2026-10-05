

atom({ id:'undoredo', cat:'Design tools', name:'Undo and redo', block:'editor history', fam:['M','X'], tall:true,
  html:`<div class="col" style="width:min(340px,90%);gap:10px"><div class="cv card" style="position:relative;height:150px;overflow:hidden;background:var(--bg)"><i class="gh" style="position:absolute;border:1.5px dashed var(--muted);border-radius:10px"></i><i class="sq" style="position:absolute;border-radius:10px"></i></div><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn a1">Nudge right</button><button class="btn a2">Grow</button><button class="btn a3">Recolor</button><span style="flex:1"></span><button class="btn un" aria-label="Undo">↶</button><button class="btn re" aria-label="Redo">↷</button></div><span class="small muted st num"></span></div>`,
  desc:'Undo and redo spring the shape between saved states. A dashed ghost stays at the state you just left and fades out, so you can see what changed.',
  api:'state = history[i]; props.set(state)   ghost = previous, o: 1 → 0 over 0.5s',
  init(st){
    const sq = $(st,'.sq'), gh = $(st,'.gh'), stx = $(st,'.st'), hist = [{ x:40, s:60, c:0 }]; let i = 0, ghost = null, gt = -9;
    const P = { x:new Track(40), s:new Track(60), c:new Track(0) };
    const apply = (from) => { const s = hist[i]; P.x.set(s.x); P.s.set(s.s); P.c.set(s.c); ghost = from; gt = now(); stx.textContent = `Step ${i} of ${hist.length - 1}`; };
    const act = f => { const cur = { ...hist[i] }; f(cur); hist.splice(i + 1); hist.push(cur); const from = hist[i]; i++; apply(from); };
    $(st,'.a1').onclick = () => act(s => s.x = Math.min(s.x + 60, 240)); $(st,'.a2').onclick = () => act(s => s.s = Math.min(s.s + 20, 120)); $(st,'.a3').onclick = () => act(s => s.c = (s.c + 1) % 3);
    $(st,'.un').onclick = () => { if (i > 0){ const from = hist[i]; i--; apply(from); } }; $(st,'.re').onclick = () => { if (i < hist.length - 1){ const from = hist[i]; i++; apply(from); } };
    stx.textContent = 'Step 0 of 0'; const C = ['var(--accent)','var(--warning)','var(--ink)'];
    return t => { const s = P.s.at(t), c = P.c.at(t), ci = Math.round(c); Object.assign(sq.style, { left:px(P.x.at(t)), top:px(75 - s/2), width:px(s), height:px(s), background:C[clamp(ci,0,2)] });
      const g = clamp(1 - (t - gt)/.5); if (ghost){ Object.assign(gh.style, { left:px(ghost.x), top:px(75 - ghost.s/2), width:px(ghost.s), height:px(ghost.s), opacity:g.toFixed(3) }); } else gh.style.opacity = 0; };
  }});
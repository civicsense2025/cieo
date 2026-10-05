

atom({ id:'signature', cat:'Interactive', name:'Signature pad', block:'signature', fam:['D'],
  html:`<div class="col" style="width:min(340px,88%);gap:8px"><canvas class="sg card" style="width:100%;height:150px;touch-action:none;cursor:crosshair" aria-label="Signature pad"></canvas><div class="row" style="justify-content:space-between"><span class="small muted">Sign with mouse or finger</span><button class="btn cl">Clear</button></div></div>`,
  desc:'Ink follows the pointer exactly. Stroke width thins with speed, and Clear fades the ink out on a spring before wiping.',
  api:'width = 3.2 − clamp(speed/1800)·2   ink.set(0, S.snap)',
  init(st){
    const cv = $(st,'.sg'), cx = cv.getContext('2d'), ink = new Track(1, S.snap); let strokes = [], cur = null, lastW = 0, lastH = 0;
    drag(cv, { down:p => { if (ink.target === 0){ strokes = []; ink.jump(1); } cur = [{ x:p.x, y:p.y, t:now() }]; strokes.push(cur); },
      move:p => { const a = cur[cur.length-1], dt = Math.max(1e-3, now() - a.t); cur.push({ x:p.x, y:p.y, t:now(), w:3.2 - clamp(Math.hypot(p.x - a.x, p.y - a.y)/dt/1800)*2 }); }, up:() => cur = null });
    $(st,'.cl').onclick = () => ink.set(0);
    return t => { const dpr = devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
      if (W !== lastW || H !== lastH){ cv.width = W*dpr; cv.height = H*dpr; lastW = W; lastH = H; }
      cx.setTransform(dpr,0,0,dpr,0,0); cx.clearRect(0,0,W,H);
      cx.strokeStyle = getComputedStyle(cv).color; cx.globalAlpha = clamp(ink.at(t)); cx.lineCap = cx.lineJoin = 'round';
      for (const s of strokes) for (let i = 1; i < s.length; i++){ cx.lineWidth = s[i].w; cx.beginPath(); cx.moveTo(s[i-1].x, s[i-1].y); cx.lineTo(s[i].x, s[i].y); cx.stroke(); }
      if (ink.target === 0 && ink.prune(t) === 0) strokes = []; };
  }});


atom({ id:'signature', cat:'Interactive', name:'Signature pad', block:'signature', fam:['D'],
  html:`<div class="col" style="width:min(340px,88%);gap:8px"><canvas class="sg card" style="width:100%;height:150px;touch-action:none;cursor:crosshair" aria-label="Signature pad"></canvas><div class="row" style="justify-content:space-between"><span class="small muted">Sign with mouse or finger</span><button class="btn cl">Clear</button></div></div>`,
  desc:'Ink follows the pointer exactly. Stroke width thins with speed, and Clear fades the ink out on a spring before wiping.',
  api:'width = 3.2 − clamp(speed/1800)·2   ink.set(0, S.snap)',
  init(st){
    const cv = $(st,'.sg'), cx = cv.getContext('2d'), ink = new Track(1, S.snap); let strokes = [], cur = null, lastW = 0, lastH = 0;
    const row = $(st,'.row'), hint = $(row,'.small'), cl = $(st,'.cl');
    const sv = document.createElement('button'); sv.className = 'btn ink sv'; sv.style.cssText = 'margin-left:6px'; sv.textContent = 'Save'; sv.disabled = true; row.appendChild(sv);
    const tx = document.createElement('div'); tx.className = 'tx'; tx.style.cssText = 'position:relative;height:20px;flex:1'; hint.replaceWith(tx);
    const mk = h => { const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += 'justify-content:flex-start;white-space:normal'; e.innerHTML = h; tx.appendChild(e); return e; };
    const Lpad = mk(`<span class="small muted">Sign with mouse or finger</span>`);
    const Ldone = mk(`<span class="small" style="color:var(--success);font-weight:600">✓ Signature saved</span>`);
    const sw2 = new Swap('pad');
    const redraw = document.createElement('button'); redraw.className = 'btn'; redraw.style.cssText = 'padding:2px 8px'; redraw.textContent = 'Draw again';
    const cust = document.createElement('div'); cust.className = 'row small muted'; cust.style.cssText += 'gap:6px;align-items:center'; cust.innerHTML = `<span>View:</span>`; $(st,'.col').appendChild(cust);
    const bPad = document.createElement('button'); bPad.className = 'btn'; bPad.style.cssText += 'padding:2px 8px'; bPad.textContent = 'Pad';
    const bDone = document.createElement('button'); bDone.className = 'btn'; bDone.style.cssText += 'padding:2px 8px'; bDone.textContent = 'Saved';
    cust.appendChild(bPad); cust.appendChild(bDone); cust.appendChild(redraw);
    // Each press writes its result into the status line, so a repeat press on the current view still answers.
    const PAD_TX = 'Sign with mouse or finger', SAVED_OK = '✓ Signature saved', SAVED_NONE = 'Nothing to save yet. Draw first.';
    const show = v => { sw2.to(v); bPad.setAttribute('aria-pressed', String(v === 'pad')); bDone.setAttribute('aria-pressed', String(v === 'done')); };
    bPad.setAttribute('aria-pressed', 'true'); bDone.setAttribute('aria-pressed', 'false');
    bPad.onclick = () => { show('pad'); Lpad.firstChild.textContent = 'Ready. Sign below.'; };
    bDone.onclick = () => { Ldone.firstChild.textContent = strokes.length ? SAVED_OK : SAVED_NONE; show('done'); };
    redraw.onclick = () => { strokes = []; ink.jump(1); show('pad'); Lpad.firstChild.textContent = 'Cleared. Sign again.'; };
    cl.disabled = true;
    drag(cv, { down:p => { if (ink.target === 0){ strokes = []; ink.jump(1); } show('pad'); Lpad.firstChild.textContent = PAD_TX; cur = [{ x:p.x, y:p.y, t:now() }]; strokes.push(cur); },
      move:p => { const a = cur[cur.length-1], dt = Math.max(1e-3, now() - a.t); cur.push({ x:p.x, y:p.y, t:now(), w:3.2 - clamp(Math.hypot(p.x - a.x, p.y - a.y)/dt/1800)*2 }); }, up:() => cur = null });
    cl.onclick = () => ink.set(0);
    sv.onclick = () => { if (strokes.length) show('done'); };
    return t => { const dpr = devicePixelRatio || 1, W = size(cv).cw, H = size(cv).ch;
      if (W !== lastW || H !== lastH){ cv.width = W*dpr; cv.height = H*dpr; lastW = W; lastH = H; }
      cx.setTransform(dpr,0,0,dpr,0,0); cx.clearRect(0,0,W,H);
      cx.strokeStyle = getComputedStyle(cv).color; cx.globalAlpha = clamp(ink.at(t)); cx.lineCap = cx.lineJoin = 'round';
      for (const s of strokes) for (let i = 1; i < s.length; i++){ cx.lineWidth = s[i].w || 3.2; cx.beginPath(); cx.moveTo(s[i-1].x, s[i-1].y); cx.lineTo(s[i].x, s[i].y); cx.stroke(); }
      if (ink.target === 0 && ink.prune(t) === 0) strokes = [];
      const has = strokes.length > 0; cl.disabled = !has; sv.disabled = !has;
      sw2.apply(Lpad, 'pad', t); sw2.apply(Ldone, 'done', t); };
  }});


atom({ id:'seltoolbar', cat:'Writing', name:'Selection toolbar', block:'richtext editor', fam:['X','M'],
  html:`<p class="tx" style="max-width:320px;margin:0;line-height:1.7;font-size:15px;cursor:text">Select a few words in this paragraph. A small toolbar appears above your selection and glides to follow it when you select somewhere else.</p><div class="tb card row" role="toolbar" aria-label="Format" style="position:absolute;left:0;top:0;padding:4px;gap:2px;visibility:hidden"></div>`,
  desc:'The toolbar appears above the selection and glides to the next selection instead of jumping. It leaves quickly when the selection collapses.',
  api:'tb.{x,y}.set(selectionCenter)   tb.o.set(hasSelection)',
  init(st){
    const tx = $(st,'.tx'), tb = $(st,'.tb'), x = new Track(0), y = new Track(0), o = new Track(0);
    ['<b>B</b>','<i>I</i>','<u>U</u>', ic(I.link,14)].forEach((h,i) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'border:0;width:30px;height:30px;padding:0;display:grid;place-items:center'; b.innerHTML = h; b.setAttribute('aria-pressed','false'); b.setAttribute('aria-label', ['Bold','Italic','Underline','Link'][i]);
      b.onmousedown = e => e.preventDefault(); b.onclick = () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.style.background = on ? 'var(--raised)' : 'none'; }; tb.appendChild(b); });
    const check = () => { const sel = getSelection(); if (!sel.rangeCount || sel.isCollapsed || !tx.contains(sel.anchorNode)){ if (o.target) o.set(0, S.snap); return; }
      const r = relRect(st, sel.getRangeAt(0).getBoundingClientRect()), W = tb.offsetWidth, nx = clamp(r.x + r.w/2 - W/2, 8, st.clientWidth - W - 8), ny = r.y - 44;
      if (!o.target){ x.jump(nx); y.jump(ny + 6); } x.set(nx); y.set(ny); o.set(1); };
    document.addEventListener('selectionchange', check);
    return t => { const p = clamp(o.at(t)); tb.style.left = px(x.at(t)); tb.style.top = px(y.at(t)); tb.style.opacity = p.toFixed(3); tb.style.visibility = p < .01 ? 'hidden' : 'visible'; tb.style.transform = `scale(${(.96 + .04*p).toFixed(4)})`; tb.style.pointerEvents = p > .5 ? 'auto' : 'none'; };
  }});
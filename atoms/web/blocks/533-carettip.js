atom({ id:'carettip', cat:'Overlays', name:'Caret tooltip', block:'Follows caret, Swap per word', fam:['X','S'], tall:false,
  html:`<div class="col" style="gap:10px;align-items:center;width:100%"><div class="ed card" contenteditable="true" spellcheck="false" aria-label="Type to move the tip" style="width:min(280px,90%);padding:12px 14px;font-size:13.5px;line-height:1.55;min-height:44px">type here to glide the tip</div><div class="tp card" aria-hidden="true" style="position:absolute;padding:6px 10px;font-size:12.5px;border-radius:10px;visibility:hidden;white-space:nowrap"><span class="tx layer" style="position:relative"></span></div></div><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px;font-size:12px"><input type="checkbox" class="gl" checked> glide caret</label><div class="hint">Tip glides word to word \u00b7 never steals focus</div>`,
  desc:'The tip anchors to the caret with a snap, then glides word to word on base as you type. Text swaps per word and focus never leaves the field.',
  api:'caret.x snap; glide base; tx.to(word)',
  init(st){
    const ed = $(st,'.ed'), tp = $(st,'.tp'), tx = $(st,'.tx'), L = ['word','rivers','routes','mornings'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = '\u201c'+s+'\u201d \u00b7 4 letters'.replace('4', String(s.length)); tp.appendChild(e); return e; });
    const x = new Track(0), sw = new Swap(0); let wi = 0;
    const place = instant => { const s = getSelection(); if (!s.rangeCount) return; const r = s.getRangeAt(0).cloneRange(); r.collapse(false);
      const m = document.createElement('span'); r.insertNode(m); const sr = st.getBoundingClientRect(), mr = m.getBoundingClientRect();
      const nx = mr.left-sr.left+mr.width/2-tp.offsetWidth/2, ny = mr.top-sr.top-tp.offsetHeight-8; m.remove();
      if (instant || !$(st,'.gl').checked) x.jump(nx); else x.set(nx); tp.style.top = px(Math.max(4, ny)); };
    ed.addEventListener('input', () => { const w = ed.textContent.trim().split(/\s+/).filter(Boolean).length; const n = w % L.length; if (n !== wi){ wi = n; sw.to(n); } place(false); });
    ed.addEventListener('keyup', () => place(false)); ed.addEventListener('click', () => place(true));
    setTimeout(() => place(true), 300);
    return t => { tp.style.transform = `translateX(${px(x.at(t))})`; tp.style.visibility = 'visible'; tp.style.opacity = '1'; L.forEach((e,k) => sw.apply(e,k,t,3)); tx.style.visibility = 'hidden'; };
  }});

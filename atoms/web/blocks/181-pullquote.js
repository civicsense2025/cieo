

atom({ id:'pullquote', cat:'Writing', name:'Pull-quote extractor', block:'quote, manuscript', fam:['D','M'],
  html:`<div class="col" style="gap:8px;width:min(320px,90%)"><div class="pq-list col" style="gap:8px"></div><div class="row" style="justify-content:flex-end"><button class="pq-reset small" style="cursor:pointer">Reset</button></div></div><div class="hint">Drag the quote into the story</div>`,
  desc:'Drag the quote and it lifts while the paragraphs spring aside. Dropping it grows the block open from zero height. Reset puts it back.',
  api:'drag(q): lift; sib.y.set(gap); drop: h.set(1,base); reset()',
  init(st){
    const list = $(st,'.pq-list'), reset = $(st,'.pq-reset');
    const P = ['Mara kept the lamp lit long after the ferry left.', 'The orchard deal could wait until morning, she said.'];
    const rows = P.map(s => { const d = document.createElement('div'); d.className = 'card small'; d.style.cssText = 'padding:10px 12px'; d.textContent = s; list.appendChild(d); return { d, y:new Track(0) }; });
    const q = document.createElement('div');
    q.className = 'card small';
    q.style.cssText = 'padding:10px 12px;border-left:3px solid var(--ink);cursor:grab;touch-action:none;font-style:italic';
    q.textContent = '“We start over on the first line.”';
    list.appendChild(q);
    const qrow = { d:q, y:new Track(0) };
    const h = new Track(0); let placed = null, dy = 0, idx = 2;
    const QH = 44;
    drag(q, {
      down(){ q.style.cursor = 'grabbing'; q.style.boxShadow = '0 8px 20px rgba(0,0,0,.18)'; },
      move(p){ dy = p.y - q.offsetTop - 20; qrow.y.set(dy, S.base);
        idx = clamp(Math.round((q.offsetTop + dy)/QH), 0, rows.length);
        rows.forEach((r,i) => r.y.set(i < idx ? -8 : i >= idx && placed === null ? 8 : 0, S.base));
      },
      up(){
        q.style.cursor = 'grab'; q.style.boxShadow = 'none';
        if (placed) placed.remove();
        placed = document.createElement('div');
        placed.className = 'card small';
        placed.style.cssText = 'overflow:hidden;padding:0 12px;border-left:3px solid var(--ink);font-style:italic';
        placed.innerHTML = '<div style="padding:10px 0">“We start over on the first line.”</div>';
        list.insertBefore(placed, list.children[Math.min(idx, list.children.length)]);
        h.jump(0); h.set(1, S.base);
        qrow.y.set(0, S.base); dy = 0;
        rows.forEach(r => r.y.set(0, S.base));
      }
    });
    reset.onclick = () => { if (placed){ placed.remove(); placed = null; } h.jump(0); qrow.y.set(0, S.base); rows.forEach(r => r.y.set(0, S.base)); };
    return t => {
      q.style.transform = 'translateY(' + qrow.y.at(t).toFixed(2) + 'px) scale(' + (1 + .03*clamp(Math.abs(qrow.y.at(t))/60)).toFixed(3) + ')';
      rows.forEach(r => { r.d.style.transform = 'translateY(' + r.y.at(t).toFixed(2) + 'px)'; });
      if (placed){ const k = clamp(h.at(t)); placed.style.height = px(k*placed.firstChild.offsetHeight); placed.style.opacity = k.toFixed(3); }
    };
  }});

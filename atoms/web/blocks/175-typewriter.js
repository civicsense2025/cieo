atom({ id:'typewriter', cat:'Writing', name:'Typewriter lock', block:'writing, draft', fam:['M','X'], tall:true,
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="vw small" style="position:relative;height:150px;overflow:hidden;background:var(--raised);border-radius:10px"><div class="caret" style="position:absolute;left:6px;right:6px;height:24px;border-radius:6px;background:var(--wash)"></div><div class="paper" style="position:absolute;left:14px;right:14px;top:0"></div></div><div class="row" style="gap:8px;margin-top:8px;padding:12px"><button class="pv">Prev</button><button class="nx">Next</button><label class="row small" style="gap:8px;cursor:pointer"><input type="checkbox" class="lk" checked> lock</label></div><div class="hint">Caret pinned mid-screen, paper moves</div>`,
  desc:'The caret stays pinned to the middle of the screen while the paper glides beneath it on a soft spring. A lock switch in the tile turns the effect off, so the caret walks the page instead of the page walking to it.',
  api:'line.set(i): lock?paper.set(mid-i*h):caret.set(i*h)',
  init(st){
    const LH = 26, MID = 63, N = 6, R = REDUCE, lock = $(st,'.lk');
    const paper = $(st,'.paper'), caret = $(st,'.caret');
    for (let i = 0; i < N; i++){ const d = document.createElement('div');
      d.textContent = `Line ${i+1} — the draft keeps going.`; d.style.cssText = `height:${LH}px;line-height:${LH}px`; paper.appendChild(d); }
    const py = new Track(MID), cy = new Track(MID); let cur = 0;
    const go = i => { cur = (i + N) % N;
      if (R){ py.jump(lock.checked ? MID-cur*LH : 0); cy.jump(lock.checked ? MID : cur*LH); }
      else if (lock.checked){ py.set(MID-cur*LH, S.soft); } else { py.set(0, S.soft); cy.set(cur*LH, S.soft); } };
    $(st,'.pv').onclick = () => go(cur-1); $(st,'.nx').onclick = () => go(cur+1); lock.onchange = () => go(cur);
    return t => { paper.style.transform = `translateY(${px(py.at(t))})`; caret.style.top = px(cy.at(t)); };
  }});

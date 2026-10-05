

atom({ id:'stagger', cat:'Foundations', name:'Stagger', block:'progress, chart, lists', fam:['T','M'],
  html:`<div class="row" style="align-items:flex-end;height:140px;gap:10px">${'<div style="width:22px;border-radius:6px;background:var(--ink)"></div>'.repeat(7)}</div><div class="hint">Click to reshuffle</div>`,
  desc:'The same spring started 40ms apart per item. Order reads left to right without any keyframes.',
  api:'items.forEach((x, i) => x.set(v[i], S.base, t + i*0.04))',
  init(st){
    const bars = $$(st,'.row div'), sets = [[.3,.55,.8,.45,.95,.6,.7],[.85,.4,.25,.7,.35,.9,.5]]; let k = 0;
    const tr = sets[0].map(v => new Track(v));
    st.onclick = () => { k ^= 1; const t0 = now(); tr.forEach((x,i) => x.set(sets[k][i], S.base, t0 + i*.04)); };
    return t => tr.forEach((x,i) => bars[i].style.height = px(x.at(t)*140));
  }});
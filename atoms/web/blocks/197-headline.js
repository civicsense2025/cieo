atom({ id:'headline', cat:'Writing', name:'Headline tester', block:'headline tester', fam:['S','M'],
  html:`<div class="col" style="gap:10px;width:min(360px,92%)"><div class="card" style="position:relative;overflow:hidden;padding:12px 14px"><i class="win" style="position:absolute;left:0;right:0;top:0;background:color-mix(in oklab, var(--success) 14%, transparent)"></i><div class="hl" style="position:relative;min-height:48px;font-size:17px;font-weight:650;line-height:1.4"></div><div class="row small muted" style="gap:6px;align-items:baseline"><span>CTR</span><b class="ctr" style="font-variant-numeric:tabular-nums"></b><span>%</span><span class="tag" style="margin-left:auto"></span></div></div><div class="row" style="gap:8px"><button class="btn nx">Next variant</button><button class="btn ink tw">Test winner</button></div></div>`,
  desc:'Each headline swaps out before the next one swaps in. The winner plate stretches open leading edge first. The click rate rolls over like digits.',
  api:'sw.to(i)   plate.go(top,bot)   ctr.set(rate)',
  init(st){
    const V = [['City hall hid the fee hike in a footnote',12],['Your water bill is going up. Here is why',34],['The 40-cent charge nobody voted on',58]];
    const box = $(st,'.hl'), tag = $(st,'.tag'), win = $(st,'.win');
    const L = V.map(v => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = v[0]; box.appendChild(e); return e; });
    const sw = new Swap(0), plate = edges(0, 0), ctr = new Digits($(st,'.ctr'), 2);
    let i = 0; const best = 2;
    ctr.set(String(V[0][1]), true); tag.textContent = 'variant 1 of 3';
    const show = k => { sw.to(k); ctr.set(String(V[k][1]), REDUCE); tag.textContent = k === best ? 'winner' : `variant ${k+1} of 3`; };
    $(st,'.nx').onclick = () => { i = (i+1) % V.length; show(i); };
    $(st,'.tw').onclick = () => { i = best; show(i); plate.jump(0, 0); plate.go(0, box.offsetHeight + 34); };
    show(0);
    return t => { L.forEach((e,k) => sw.apply(e,k,t));
      win.style.transform = `translateY(${px(plate.A.at(t))})`; win.style.height = px(Math.max(0, plate.B.at(t) - plate.A.at(t)));
      ctr.render(t); };
  }});

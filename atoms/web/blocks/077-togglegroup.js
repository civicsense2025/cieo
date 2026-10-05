

atom({ id:'togglegroup', cat:'Inputs', name:'Toggle group', block:'richtext toolbar, Toggle group primitive', fam:['M','E'],
  html:`<div class="col" style="gap:14px;width:min(300px,88%)"><div class="row"><div class="seg fm" role="group" aria-label="Formatting" style="display:flex"></div><div class="seg al" role="group" aria-label="Alignment" style="display:flex"><div class="ind"></div></div></div><p class="pvw card" style="margin:0;padding:12px 14px;font-size:15px">Spring launch notes</p></div>`,
  desc:'Formatting buttons are independent, so each fills on its own spring. Alignment is single-choice, so one plate slides between options with lagging edges.',
  api:'bold.on.set(!on)   align.go(l, r)',
  init(st){
    const fm = $(st,'.fm'), al = $(st,'.al'), ind = $(al,'.ind'), pvw = $(st,'.pvw');
    const F = [['B','font-weight:700','fontWeight','700'],['I','font-style:italic','fontStyle','italic'],['U','text-decoration:underline','textDecoration','underline']];
    const fb = F.map(([l,css,prop,val]) => { const b = document.createElement('button'); b.setAttribute('aria-pressed','false'); b.setAttribute('aria-label', { B:'Bold', I:'Italic', U:'Underline' }[l]); b.innerHTML = `<span style="${css}">${l}</span>`; b.style.cssText += 'width:32px;border-radius:7px'; fm.appendChild(b);
      const x = { b, on:false, p:new Track(0) }; b.onclick = () => { x.on = !x.on; x.p.set(x.on ? 1 : 0); b.setAttribute('aria-pressed', x.on); pvw.style[prop] = x.on ? val : ''; }; return x; });
    const ab = [['left',I.alL],['center',I.alC],['right',I.alR]].map(([a,d]) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Align ' + a); b.innerHTML = ic(d,15); b.style.cssText += 'width:32px;display:grid;place-items:center'; al.appendChild(b); return { b, a }; });
    const e = edges(0,0); let cur = 0;
    const pick = (i, inst) => { cur = i; const b = ab[i].b; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); pvw.style.textAlign = ab[i].a; ab.forEach((x,j) => x.b.setAttribute('aria-pressed', j === i)); };
    ab.forEach((x,i) => x.b.onclick = () => pick(i)); const init = () => pick(cur, true); document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => { fb.forEach(x => { const p = clamp(x.p.at(t)); x.b.style.background = mix(p,'var(--card)','transparent'); x.b.style.boxShadow = p > .5 ? 'var(--shadow)' : 'none'; });
      const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)'}); };
  }});
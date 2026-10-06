

atom({ id:'radio', cat:'Inputs', name:'Radio group', block:'form, poll', fam:['M'],
  html:`<div class="col rg" role="radiogroup" aria-label="Email digest" style="gap:8px;width:min(264px,calc(100% - 48px));padding:24px;border-radius:16px;background:var(--card);box-shadow:var(--shadow)"><b class="small">Email digest</b></div>`,
  desc:'The inner dot grows from the center of the new choice while the old one shrinks, on the same spring. Arrow keys move the choice.',
  api:'dot[i].set(i === picked ? 1 : 0)',
  init(st){
    const rg = $(st,'.rg'), O = ['Daily','Weekly','Never'];
    const it = O.map((n,i) => { const b = document.createElement('button'); b.setAttribute('role','radio'); b.style.cssText = 'display:flex;align-items:center;gap:16px;border:0;background:none;cursor:pointer;padding:8px 0;min-height:40px;font-size:12px';
      b.innerHTML = `<span style="position:relative;width:24px;height:24px;border-radius:50%;border:2px solid var(--line)"><i style="position:absolute;inset:3px;border-radius:50%;background:var(--accent)"></i></span>${n}`; rg.appendChild(b); return { b, ring:$(b,'span'), dot:$(b,'i'), p:new Track(i === 1 ? 1 : 0) }; });
    let cur = 1; const pick = i => { cur = (i + O.length) % O.length; it.forEach((x,j) => { x.p.set(j === cur ? 1 : 0); x.b.setAttribute('aria-checked', j === cur); x.b.tabIndex = j === cur ? 0 : -1; }); it[cur].b.focus(); };
    it.forEach((x,i) => { x.b.onclick = () => pick(i); x.b.onkeydown = ev => { if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight'){ ev.preventDefault(); pick(cur + 1); } if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft'){ ev.preventDefault(); pick(cur - 1); } }; x.b.tabIndex = i === 1 ? 0 : -1; x.b.setAttribute('aria-checked', i === 1); });
    return t => it.forEach(x => { const p = clamp(x.p.at(t)); x.dot.style.transform = `scale(${p.toFixed(4)})`; x.ring.style.borderColor = mix(p,'var(--accent)','var(--line)'); });
  }});


atom({ id:'mobilemenu', cat:'Chrome', name:'Mobile menu', block:'nav-menu, site-header', fam:['M','X'], tall:true,
  html:`<div class="card" style="width:min(270px,86%);height:290px;overflow:hidden;position:relative"><header style="display:flex;justify-content:space-between;align-items:center;height:52px;padding:0 14px;border-bottom:1px solid var(--line-soft)"><b style="letter-spacing:-.02em">North Studio</b><button class="hb" aria-label="Open menu" aria-expanded="false" style="width:36px;height:36px;border:0;background:none;cursor:pointer;position:relative"><i></i><i></i><i></i></button></header><nav class="mm" style="position:absolute;left:0;right:0;top:52px;overflow:hidden;background:var(--card)"><div class="col" style="padding:10px 16px 16px;gap:4px"></div></nav></div>`,
  desc:'The three lines morph into a cross on one spring. The panel height opens and each link enters 40ms after the last.',
  api:'open.set(1); link[i].o.set(1, S.base, t + 0.08 + i*0.04)',
  init(st){
    const hb = $(st,'.hb'), lines = $$(hb,'i'), mm = $(st,'.mm'), col = $(mm,'.col');
    lines.forEach(l => l.style.cssText = 'position:absolute;left:9px;width:18px;height:2px;border-radius:1px;background:var(--ink)');
    const L = ['Work','Services','Journal','About','Contact'].map(n => { const a = document.createElement('a'); a.href = '#'; a.textContent = n; a.style.cssText = 'font-size:22px;font-weight:600;letter-spacing:-.02em;color:var(--ink);text-decoration:none;padding:4px 0'; col.appendChild(a); return { a, o:new Track(0) }; });
    const op = new Track(0); let open = false;
    hb.onclick = () => { open = !open; hb.setAttribute('aria-expanded', open); const t0 = now(); op.set(open ? 1 : 0);
      L.forEach((x,i) => open ? x.o.set(1, S.base, t0 + .08 + i*.04) : x.o.set(0, S.snap, t0)); };
    L.forEach(x => x.a.onclick = e => e.preventDefault());
    return t => { const p = clamp(op.at(t));
      lines[0].style.transform = `translateY(${px(11 + 6*p)}) rotate(${(45*p).toFixed(2)}deg)`; lines[1].style.transform = 'translateY(17px)'; lines[1].style.opacity = (1-p).toFixed(3);
      lines[2].style.transform = `translateY(${px(23 - 6*p)}) rotate(${(-45*p).toFixed(2)}deg)`;
      mm.style.height = px(p*238); L.forEach(x => fade(x.a, x.o.at(t), (1 - clamp(x.o.at(t)))*8)); };
  }});
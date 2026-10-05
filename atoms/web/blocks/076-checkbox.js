

atom({ id:'checkbox', cat:'Inputs', name:'Checkbox with mixed state', block:'form, list', fam:['M'],
  html:`<div class="col cbx" style="gap:8px;min-width:200px"></div>`,
  desc:'The parent box morphs its check into a dash when only some children are on. The three points of the check slide to a flat line on one spring, with no swap.',
  api:'mark = lerp(CHECK, DASH, mixed.at(t))   fill.set(any checked)',
  init(st){
    const box = $(st,'.cbx'), CK = [[5,12.5],[10,17.5],[19,7]], DS = [[6,12],[12,12],[18,12]];
    const mk = (label, child) => { const b = document.createElement('button'); b.setAttribute('role','checkbox'); b.style.cssText = `display:flex;align-items:center;gap:10px;border:0;background:none;cursor:pointer;padding:0;font-size:14px;${child ? 'margin-left:28px' : 'font-weight:600'}`;
      b.innerHTML = `<span style="width:18px;height:18px;border-radius:5px;border:1.5px solid var(--line);display:grid;place-items:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--card)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path/></svg></span>${label}`;
      box.appendChild(b); return { b, bx:$(b,'span'), p:$(b,'path'), f:new Track(0), m:new Track(0), on:false }; };
    const par = mk('All files'), kids = ['Photos','Documents','Audio'].map(n => mk(n, true)); kids[0].on = true; kids[0].f.jump(1);
    const sync = () => { const n = kids.filter(k => k.on).length; par.f.set(n ? 1 : 0); par.m.set(n && n < kids.length ? 1 : 0); par.b.setAttribute('aria-checked', n === kids.length ? 'true' : n ? 'mixed' : 'false'); kids.forEach(k => { k.f.set(k.on ? 1 : 0); k.b.setAttribute('aria-checked', k.on); }); };
    kids.forEach(k => k.b.onclick = () => { k.on = !k.on; sync(); }); par.b.onclick = () => { const all = kids.every(k => k.on); kids.forEach(k => k.on = !all); sync(); };
    sync(); par.f.jump(par.f.target); par.m.jump(par.m.target);
    return t => [par, ...kids].forEach(c => { const f = clamp(c.f.at(t)), m = clamp(c.m.at(t)); c.bx.style.background = mix(f,'var(--ink)','transparent'); c.bx.style.borderColor = mix(f,'var(--ink)','var(--line)');
      const pts = CK.map((p,i) => [lerp(p[0], DS[i][0], m), lerp(p[1], DS[i][1], m)]); c.p.setAttribute('d', 'M' + pts.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L')); c.p.style.opacity = f.toFixed(3); c.p.parentNode.style.transform = `scale(${(.5+.5*f).toFixed(3)})`; });
  }});


atom({ id:'fab', cat:'Navigation', name:'Extended action button', block:'cta-button, Material FAB', fam:['M','S'], tall:true,
  html:`<style>.fa-i{display:flex;align-items:center;gap:8px;height:40px;padding:0 14px 0 12px;border:0;border-radius:12px;background:var(--card);color:var(--ink);font-size:13px;font-weight:500;white-space:nowrap;cursor:pointer;box-shadow:var(--shadow)}.fa-i:hover,.fa-i:focus-visible{background:var(--raised)}.fa-i:focus-visible{outline:2px solid var(--accent);outline-offset:2px}</style><div class="col" style="gap:8px;align-items:center"><div class="row small muted" style="gap:8px"><span>Dividers</span><button class="btn dv" aria-pressed="true">On</button></div><div class="card" style="position:relative;width:min(270px,84%);height:290px;overflow:hidden"><div class="ls" style="height:100%;overflow:auto;overscroll-behavior:contain" tabindex="0" aria-label="Sample inbox"></div><button class="fb" style="position:absolute;right:14px;bottom:14px;height:52px;border:0;border-radius:16px;background:var(--ink);color:var(--card);cursor:pointer;overflow:hidden;box-shadow:var(--shadow);display:flex;align-items:center;padding:0 0 0 16px;gap:10px"><span style="flex:none;display:grid">${ic(I.pen,20)}</span><span class="lb" style="font-weight:600;white-space:nowrap">Compose</span></button>
<div class="fa" role="group" aria-label="Compose actions" style="position:absolute;right:14px;bottom:76px;display:flex;flex-direction:column;align-items:flex-end;gap:8px">
<button type="button" class="fa-i" data-k="note">${ic(I.pen,16)}<span>New note</span></button><button type="button" class="fa-i" data-k="task">${ic(I.check,16)}<span>New task</span></button><button type="button" class="fa-i" data-k="file">${ic(I.up,16)}<span>Upload file</span></button></div></div><div class="hint">Scroll down, then back up</div></div>`,
  desc:'Scrolling down hides the label first, then the button shrinks to its icon. Scrolling up reverses the order: the button widens, then the label fades in.',
  api:'collapse: label.o→0 now, w→52 at t + 0.1   expand: w now, label at t + 0.12',
  init(st){
    const ls = $(st,'.ls'), fb = $(st,'.fb'), lb = $(st,'.lb'), dv = $(st,'.dv');
    const NN = ['Maya Chen','Theo Park','Field Notes','Billing','Jonas Weber','Ada Kim','North Studio','Sam Ruiz','Priya Shah','Loop Press'];
    const SS = ['Draft is ready for review','Comment on pricing table','Weekly digest','Invoice INV-0042 paid','Can we move Thursday?','New subscriber','Proof attached','Photos from Saturday','Notes on the about page','Reprint request'];
    let dividers = true;
    const paint = () => { ls.innerHTML = NN.map((n,i) => `<div style="padding:12px 14px${dividers && i < NN.length - 1 ? ';border-bottom:1px solid var(--line-soft)' : ''}"><b class="small" style="display:block">${n}</b><span class="small muted">${SS[i]}</span></div>`).join(''); };
    paint();
    dv.onclick = () => { dividers = !dividers; dv.setAttribute('aria-pressed', String(dividers)); dv.textContent = dividers ? 'On' : 'Off'; paint(); };
    const w = new Track(138), lo = new Track(1); let last = 0, ext = true;
    ls.onscroll = () => { const y = ls.scrollTop, d = y - last; last = y; if (d > 2 && menu) setMenu(false); if (d > 2 && ext){ ext = false; lo.set(0, S.snap); w.set(52, S.base, now() + EXIT); } else if ((d < -2 || y < 8) && !ext){ ext = true; w.set(138); lo.set(1, S.base, now() + .12); } };
    fb.setAttribute('aria-label','Compose'); fb.setAttribute('aria-expanded','false');
    // speed dial: Compose fans out three actions above it, last in first out
    const fa = $(st,'.fa'), fai = $$(fa,'.fa-i'), ft = fai.map(() => new Track(0)); let menu = false, tmr = 0;
    const setMenu = v => { if (v === menu) return; menu = v; const t0 = now(); fai.forEach((b,i) => { ft[i].set(v ? 1 : 0, S.base, v ? t0 + i*.035 : t0 + (fai.length - 1 - i)*.03); b.tabIndex = v ? 0 : -1; }); fb.setAttribute('aria-expanded', String(v)); };
    fb.onclick = () => setMenu(!menu);
    fai.forEach(b => { b.tabIndex = -1; b.onclick = () => { setMenu(false); const name = b.querySelector('span').textContent; lb.textContent = name; clearTimeout(tmr); tmr = setTimeout(() => { lb.textContent = 'Compose'; }, 1600); }; });
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && menu){ e.stopPropagation(); setMenu(false); fb.focus(); } });
    ls.addEventListener('pointerdown', () => setMenu(false));
    return t => { fb.style.width = px(w.at(t)); fade(lb, lo.at(t), null); fai.forEach((b,i) => pop(b, ft[i].at(t), 6)); };
  }});
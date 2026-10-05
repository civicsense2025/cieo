

atom({ id:'fab', cat:'Navigation', name:'Extended action button', block:'cta-button, Material FAB', fam:['M','S'], tall:true,
  html:`<div class="card" style="position:relative;width:min(270px,84%);height:290px;overflow:hidden"><div class="ls" style="height:100%;overflow:auto;overscroll-behavior:contain" tabindex="0" aria-label="Sample inbox"></div><button class="fb" style="position:absolute;right:14px;bottom:14px;height:52px;border:0;border-radius:16px;background:var(--ink);color:var(--card);cursor:pointer;overflow:hidden;box-shadow:var(--shadow);display:flex;align-items:center;padding:0 0 0 16px;gap:10px"><span style="flex:none;display:grid">${ic(I.pen,20)}</span><span class="lb" style="font-weight:600;white-space:nowrap">Compose</span></button></div><div class="hint">Scroll down, then back up</div>`,
  desc:'Scrolling down hides the label first, then the button shrinks to its icon. Scrolling up reverses the order: the button widens, then the label fades in.',
  api:'collapse: label.o→0 now, w→52 at t + 0.1   expand: w now, label at t + 0.12',
  init(st){
    const ls = $(st,'.ls'), fb = $(st,'.fb'), lb = $(st,'.lb');
    ls.innerHTML = ['Maya Chen','Theo Park','Field Notes','Billing','Jonas Weber','Ada Kim','North Studio','Sam Ruiz','Priya Shah','Loop Press'].map((n,i) => `<div style="padding:12px 14px;border-bottom:1px solid var(--line-soft)"><b class="small" style="display:block">${n}</b><span class="small muted">${['Draft is ready for review','Comment on pricing table','Weekly digest','Invoice INV-0042 paid','Can we move Thursday?','New subscriber','Proof attached','Photos from Saturday','Notes on the about page','Reprint request'][i]}</span></div>`).join('');
    const w = new Track(138), lo = new Track(1); let last = 0, ext = true;
    ls.onscroll = () => { const y = ls.scrollTop, d = y - last; last = y; if (d > 2 && ext){ ext = false; lo.set(0, S.snap); w.set(52, S.base, now() + EXIT); } else if ((d < -2 || y < 8) && !ext){ ext = true; w.set(138); lo.set(1, S.base, now() + .12); } };
    fb.setAttribute('aria-label','Compose');
    return t => { fb.style.width = px(w.at(t)); fade(lb, lo.at(t), null); };
  }});
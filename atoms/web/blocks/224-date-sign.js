atom({ id:'datesign', cat:'Documents', name:'Date signed', block:'sign, date, calendar', fam:['M'],
  html:`<div class="col" style="width:min(340px,92%);gap:8px"><div class="card col" style="padding:14px 16px;gap:10px"><b style="font-size:15px">Date signed</b><div class="cal" style="position:relative"><div class="disc" style="position:absolute;top:0;width:36px;height:36px;border-radius:50%;background:color-mix(in oklab, var(--accent) 18%, transparent);border:2px solid var(--accent)"></div><div class="days row" style="gap:4px"></div></div><div class="picked" style="position:relative;height:28px;font-size:15px;font-weight:600"></div><div class="msg small" style="position:relative;height:22px;font-size:12.5px"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="tm" checked> include time of signing</label></div><div class="hint">Pick a day — the disc glides over</div>`,
  desc:'The calendar disc glides to the picked day on a base spring while the date blur-swaps in below. Confirming holds a signed-and-dated success terminal.',
  api:'disc.x.set(i*cell, base)   date.to(i) Swap-blur   confirm holds success',
  init(st){
    const days = $(st,'.days'), disc = $(st,'.disc'), picked = $(st,'.picked'), msg = $(st,'.msg'), tm = $(st,'.tm');
    const D = ['Mon 6', 'Tue 7', 'Wed 8', 'Thu 9', 'Fri 10'];
    const x = new Track(0), sw = new Swap(0), ok = new Swap(0);
    const CELL = 40; let cur = 2;
    const PL = D.map(d => { const el = document.createElement('span'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.textContent = `October ${d.slice(4)}, 2026`; picked.appendChild(el); return el; });
    const ML = ['', 'Signed and dated ✓'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.textContent = s; msg.appendChild(el); return el; });
    const B = D.map((d,i) => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = d; b.style.cssText = 'position:relative;z-index:1;width:36px;min-height:36px;border-radius:50%;border:0;background:none;cursor:pointer;font-size:12px'; b.onclick = () => land(i); days.appendChild(b); return b; });
    const stamp = () => tm.checked ? ` · 9:41 AM` : '';
    function land(i){ cur = i; x.set(i * CELL, S.base); PL.forEach(el => el.textContent = `October ${D[i].slice(4)}, 2026`); sw.to(i); ok.to(1);
      ML[1].textContent = `Signed October ${D[i].slice(4)}${stamp()} ✓`; paint(); }
    function paint(){ B.forEach((b,i) => { b.style.fontWeight = i === cur ? 700 : 400; b.style.color = i === cur ? 'var(--accent)' : ''; }); }
    tm.onchange = () => land(cur); land(2);
    return t => { disc.style.transform = `translateX(${x.at(t).toFixed(2)}px)`; disc.style.top = '0px';
      PL.forEach((el,k) => sw.apply(el,k,t)); ML.forEach((el,k) => ok.apply(el,k,t)); ML[1].style.color = 'var(--success)'; };
  }});

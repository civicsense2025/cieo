atom({ id:'statcount', cat:'Landing', name:'Stat count-up', block:'Landing stats', fam:['T','S'],
  html:`<div class="col" style="gap:0;align-items:center;max-width:360px;margin:0 auto;padding:44px 16px;text-align:center"><p style="margin:0;font-size:15px;font-weight:600;line-height:1.45">Powering small teams</p><div class="cd num" style="margin-top:8px;font-size:30px;font-weight:600;letter-spacing:-.035em;display:flex"></div><div class="cap" style="position:relative;margin-top:8px;height:22px;display:grid;justify-items:center;font-size:12.5px;color:var(--muted);line-height:1.5"></div><button class="btn re" style="margin-top:16px;min-height:36px;border-radius:10px">Replay</button></div><div class="hint">Counts once at 50% in view · label swaps after settle</div>`,
  desc:'The count fires once when half the tile is visible and rides lazy rolling digits to the total. Only after the number settles does the caption swap from counting to the final label: the settled terminal state.',
  api:'n.set(T, lazy) once @50%   settled → label.to(1)',
  init(st){
    const cd = $(st,'.cd'), cap = $(st,'.cap');
    const d = new Digits(cd, 5);
    const L = ['counting…','paying members'].map(s => { const e = document.createElement('span'); e.style.cssText = 'grid-area:1/1;white-space:nowrap'; e.textContent = s; cap.appendChild(e); return e; });
    const n = new Track(0, S.lazy), sw = new Swap(0), T = 12840;
    let cache = '';
    d.set('0', true);
    const fire = () => { n.set(T); };
    new IntersectionObserver((es,ob) => { if (es.some(e => e.isIntersecting)){ fire(); ob.disconnect(); } }, { threshold:.5 }).observe(st);
    $(st,'.re').onclick = () => { n.jump(0); d.set('0', true); sw.cur = 0; sw.prev = null; sw.t = -9; cache = ''; fire(); };
    const fmt = v => String(Math.round(v)).padStart(5,' ');
    return t => {
      const v = fmt(n.at(t));
      if (v !== cache){ cache = v; d.set(v); }
      d.render(t);
      if (sw.cur === 0 && Math.abs(n.at(t) - T) < 1 && n.target === T) sw.to(1);
      L.forEach((e,i) => sw.apply(e,i,t));
    };
  }});

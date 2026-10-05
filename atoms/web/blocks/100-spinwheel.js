

atom({ id:'spinwheel', cat:'Newsletter', name:'Prize wheel', block:'newsletter (spinner form)', fam:['T','S'], tall:true,
  html:`<div class="col" style="align-items:center;gap:12px"><div style="position:relative;width:200px;height:200px"><svg class="wh" viewBox="-100 -100 200 200" width="200" height="200" aria-hidden="true"></svg><i style="position:absolute;left:50%;top:-6px;margin-left:-8px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:14px solid var(--ink)"></i><button class="sp btn ink" style="position:absolute;left:50%;top:50%;width:62px;height:62px;margin:-31px;border-radius:50%;padding:0">Spin</button></div><div class="rs small" role="status" style="position:relative;height:20px;width:240px"></div></div>`,
  desc:'The wheel turns on a slow critically damped spring toward a precomputed angle, so it decelerates smoothly and stops without rocking back. The result swaps in once it settles.',
  api:'angle.set(current + 5 turns + slice offset, { w: 1.8 })   on settle: result.to(prize)',
  init(st){
    const wh = $(st,'.wh'), sp = $(st,'.sp'), rs = $(st,'.rs'), P = ['10% off','Free shipping','15% off','Free gift','20% off','Early access'], n = P.length, seg = 360/n;
    wh.innerHTML = P.map((p,i) => { const a0 = (i*seg - 90 - seg/2)*Math.PI/180, a1 = ((i+1)*seg - 90 - seg/2)*Math.PI/180, r = 96, mid = (i*seg - 90)*Math.PI/180;
      return `<path d="M0 0 L${(r*Math.cos(a0)).toFixed(2)} ${(r*Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(r*Math.cos(a1)).toFixed(2)} ${(r*Math.sin(a1)).toFixed(2)}Z" fill="${['var(--raised)','var(--card)','var(--accent-tint)'][i % 3]}" stroke="var(--line)"/><text x="${(62*Math.cos(mid)).toFixed(2)}" y="${(62*Math.sin(mid)).toFixed(2)}" font-size="9.5" font-weight="600" fill="var(--ink)" text-anchor="middle" dominant-baseline="middle" transform="rotate(${i*seg} ${(62*Math.cos(mid)).toFixed(2)} ${(62*Math.sin(mid)).toFixed(2)})">${p}</text>`; }).join('');
    const L = ['Spin for a welcome offer', ...P.map(p => 'You won: ' + p)].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; if (i) e.style.color = 'var(--success)'; e.style.fontWeight = i ? 600 : 400; rs.appendChild(e); return e; });
    const ang = new Track(0, { w:1.8 }), sw = new Swap(0); let spinning = false, win = 0;
    sp.onclick = () => { if (spinning) return; spinning = true; sp.disabled = true; win = Math.floor(Math.random()*n); const base = Math.ceil(ang.target/360)*360; ang.set(base + 5*360 - win*seg); sw.to(0); };
    return t => { const a = ang.at(t); wh.style.transform = `rotate(${a.toFixed(2)}deg)`; if (spinning && Math.abs(a - ang.target) < .3){ spinning = false; sp.disabled = false; sw.to(win + 1); } L.forEach((e,k) => sw.apply(e,k,t)); };
  }});
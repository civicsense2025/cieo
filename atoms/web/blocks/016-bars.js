

atom({ id:'bars', cat:'Data', name:'Bar chart', block:'chart', fam:['M','T','E'],
  html:`<div class="col" style="width:min(340px,90%);gap:10px"><div class="seg ds" style="align-self:flex-start"><div class="ind"></div><button>2025</button><button>2026</button></div><svg class="bc" viewBox="0 0 320 160" style="width:100%;height:auto;overflow:visible" aria-label="Signups per quarter-month"></svg></div>`,
  desc:'Switching datasets retargets every bar mid-flight with a stagger. Labels stay on a fixed 0–100 scale.',
  api:'bar[i].h.set(data[i], S.base, t + i*0.03)',
  init(st){
    const svg = $(st,'.bc'), seg = $(st,'.ds'), ind = $(seg,'.ind'), btns = $$(seg,'button');
    const DS = [[34,52,41,68,59,77,64,88],[48,44,62,58,81,70,92,85]], X0 = 30, Y0 = 140, H = 130, bw = 24, gap = (320 - X0 - 8*bw)/8;
    let g = ''; for (const v of [0,50,100]) g += `<line x1="${X0}" x2="320" y1="${Y0 - v/100*H}" y2="${Y0 - v/100*H}" stroke="var(--line)"/><text x="${X0-6}" y="${Y0 - v/100*H + 4}" text-anchor="end" font-size="11" fill="var(--faint)">${v}</text>`;
    svg.innerHTML = g + DS[0].map((_,i) => `<rect x="${X0 + gap/2 + i*(bw+gap)}" width="${bw}" rx="4" fill="var(--ink)"/>`).join('');
    const rects = $$(svg,'rect'), tr = DS[0].map(v => new Track(0)), e = edges(0,0); let k = 0;
    // opens on 2026 so that 2025 has something to switch from; re-clicking the active year replays its bars from zero
    const sel = (i, inst) => { const again = !inst && i === k; k = i; const b = btns[i]; inst ? e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth);
      btns.forEach((x,j) => x.setAttribute('aria-pressed', String(j === i)));
      const t0 = now(); tr.forEach((x,j) => { if (again) x.jump(0); x.set(DS[i][j], S.base, t0 + j*.03); }); };
    btns.forEach((b,i) => b.onclick = () => sel(i)); requestAnimationFrame(() => sel(1, true)); document.fonts.ready.then(() => e.jump(btns[k].offsetLeft, btns[k].offsetLeft + btns[k].offsetWidth));
    return t => { const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style,{transform:`translate(${px(a)},3px)`,width:px(b-a),height:'calc(100% - 6px)'});
      rects.forEach((r,i) => { const h = Math.max(0, tr[i].at(t))/100*H; r.setAttribute('y', (Y0 - h).toFixed(2)); r.setAttribute('height', h.toFixed(2)); }); };
  }});
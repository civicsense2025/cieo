atom({ id:'swatch', cat:'Storefront', name:'Variant swatch morph', block:'swatch, variant, product', fam:['E','S'],
  html:`<div class="col" style="gap:8px;width:min(320px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Everyday overshirt</h4><div class="row" style="gap:12px;align-items:center"><span class="nm small" style="position:relative;height:18px;min-width:60px;font-size:13px;font-weight:500;line-height:1.5"></span><span class="pr num" style="font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.5"></span></div><div class="swr row" role="group" aria-label="Color" style="gap:12px;position:relative;padding:4px"></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="so" checked> Show sold-out variant</label></div><div class="hint">Pick a color; ring glides, sold-out draws a slash</div>`,
  desc:'The selection ring glides with its trailing edge 60ms behind. The sold-out swatch fades and a slash draws across it. The name blur-swaps.',
  api:'ring.go(l, r) trails .06   sold.set(1) + slash.draw   name.to(i)',
  init(st){
    const C = [{ n:'Ink', c:'var(--ink)', p:142, out:false }, { n:'Moss', c:'var(--accent)', p:128, out:false }, { n:'Stone', c:'var(--faint)', p:128, out:true }, { n:'Clay', c:'var(--warning)', p:136, out:false }];
    const wr = $(st,'.swr'), nm = $(st,'.nm'), pr = $(st,'.pr'), so = $(st,'.so');
    const ring = document.createElement('i'); ring.setAttribute('aria-hidden','true');
    ring.style.cssText = 'position:absolute;top:0;left:0;border:2px solid var(--ink);border-radius:50%;pointer-events:none'; wr.appendChild(ring);
    const btns = C.map((v, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', v.n + (v.out ? ', sold out' : '')); b.disabled = v.out;
      b.style.cssText = 'position:relative;width:28px;height:28px;border-radius:50%;border:1.5px solid var(--muted);padding:0;background:' + v.c + ';cursor:pointer;display:grid;place-items:center';
      b.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><circle class="rg" cx="14" cy="14" r="12" stroke="var(--ink)" stroke-width="2" pathLength="1" stroke-dasharray="1" opacity="0"/><line class="sl" x1="6" y1="22" x2="22" y2="6" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" pathLength="1" stroke-dasharray="1"/></svg>`;
      wr.appendChild(b); return b; });
    const rg = btns.map(b => $(b, '.rg')), sl = btns.map(b => $(b, '.sl'));
    const L = C.map(v => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = v.n; nm.appendChild(e); return e; });
    const e = edges(0, 0), sel = C.map(() => new Track(0)), dim = C.map(c => new Track(c.out ? 1 : 0)), drw = C.map(c => new Track(c.out ? 1 : 0)), sw = new Swap(0);
    let cur = 0; const prT = new Track(C[0].p); pr.textContent = '$' + C[0].p;
    const INST = v => REDUCE ? 'jump' : v;
    const place = (i, inst) => { const b = btns[i], f = inst ? 'jump' : 'go'; e[f](b.offsetLeft - 4, b.offsetLeft + b.offsetWidth + 4); };
    const pick = (i, inst) => { if (C[i].out) return; cur = i; sw[INST('to')](i); sel.forEach((s, j) => s[inst ? 'jump' : 'set'](j === i ? 1 : 0)); prT[inst ? 'jump' : 'set'](C[i].p); place(i, inst || REDUCE);
      btns.forEach((b, j) => b.setAttribute('aria-pressed', j === i)); };
    btns.forEach((b, i) => b.onclick = () => pick(i));
    so.onchange = () => { C.forEach((v, j) => { if (!v.out) return; btns[j].style.display = so.checked ? '' : 'none'; }); place(cur, true); };
    const init = () => { place(0, true); sel[0].jump(1); }; document.fonts.ready.then(init); init();
    return t => { const a = e.A.at(t), b = e.B.at(t);
      ring.style.transform = `translate(${px(a)},${px((4 + (28 - (b - a)) / 2))})`; ring.style.width = px(b - a); ring.style.height = px(b - a); ring.style.opacity = '1';
      btns.forEach((btn, i) => { const s = clamp(sel[i].at(t)); btn.style.transform = `scale(${(.92 + .12 * s).toFixed(4)})`;
        rg[i].setAttribute('opacity', s.toFixed(3)); rg[i].style.strokeDashoffset = (1 - s).toFixed(3);
        const d = clamp(dim[i].at(t)); btn.style.opacity = (1 - .55 * d).toFixed(3);
        sl[i].style.strokeDashoffset = (1 - clamp(drw[i].at(t))).toFixed(3); sl[i].setAttribute('opacity', d > .02 ? 1 : 0); });
      L.forEach((el, k) => sw.apply(el, k, t)); pr.textContent = '$' + Math.round(prT.at(t)); };
  }});

atom({ id:'shelf', cat:'Storefront', name:'Shelf carousel', block:'shelf, carousel, productgrid', fam:['D','S','X'],
  html:`<div class="col" style="gap:8px;width:min(360px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">New arrivals</h4><div class="svp" tabindex="0" role="group" aria-roledescription="carousel" aria-label="New arrivals" style="overflow:hidden;border-radius:12px;touch-action:pan-y;cursor:grab"><div class="sst" style="display:flex"></div></div><div class="sdt row" style="gap:6px;justify-content:center" role="tablist" aria-label="Choose item"></div><label class="row small muted" style="gap:6px;cursor:pointer;align-self:center"><input type="checkbox" class="pk" checked> Peek next card</label></div><div class="hint">Drag the shelf, or tap a dot</div>`,
  desc:'The shelf follows a drag 1:1 and rubber-bands past the edges, then settles to the nearest card. Dots roll with the shelf and peek cards trail in 60ms apart.',
  api:'shelf.x.release(x, v, i·W)   dots.set(i)   peek.at(t0 + i·.06)',
  init(st){
    const P = [['Field tee',42,'var(--raised)'],['Canvas tote',32,'var(--line-soft)'],['Stone mug',28,'var(--raised)'],['Linen set',64,'var(--line-soft)'],['Trail cap',36,'var(--raised)']];
    const vp = $(st,'.svp'), strip = $(st,'.sst'), dtw = $(st,'.sdt'), pk = $(st,'.pk');
    const W = 168;
    const cards = P.map(p => { const d = document.createElement('div'); d.style.cssText = 'flex:none;width:156px;margin-right:12px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px';
      d.innerHTML = `<div style="aspect-ratio:4/3;border-radius:12px;background:${p[2]};display:grid;place-items:center;color:var(--faint);padding:0"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg></div><b style="font-size:13px;font-weight:500;line-height:1.5">${p[0]}</b><span class="num" style="font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.5">$${p[1]}</span>`;
      strip.appendChild(d); return d; });
    const dots = P.map((_, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role','tab'); b.setAttribute('aria-label','Go to item ' + (i+1)); b.style.cssText = 'width:22px;height:22px;padding:0;border:0;background:none;cursor:pointer;display:grid;place-items:center'; b.innerHTML = '<i style="display:block;width:6px;height:6px;border-radius:50%;background:var(--faint)"></i>'; dtw.appendChild(b); return b; });
    const gx = new Track(0), ds = P.map(() => new Track(0)), sc = P.map(() => new Track(1));
    let cur = 0, held = false, hx = 0, sx = 0, from = 0, q = [];
    const max = (P.length - 1) * W;
    const mark = inst => { dots.forEach((b, i) => { b.setAttribute('aria-selected', i === cur); ds[i][inst ? 'jump' : 'set'](i === cur ? 1 : 0); }); vp.setAttribute('aria-label', 'New arrivals, item ' + (cur+1) + ' of ' + P.length); };
    const goto = (i, v) => { cur = clamp(i, 0, P.length - 1); const t0 = now();
      if (REDUCE) gx.jump(cur * W); else gx.release(held ? hx : gx.at(), v || 0, cur * W, S.soft, t0);
      mark(false); const q2 = [];
      P.forEach((_, j) => q2.push([t0 + Math.abs(j - cur) * .06, () => sc[j].set(j === cur ? 1 : .94, S.base)]));
      q2.sort((a, b) => a[0] - b[0]); q = q.concat(q2); };
    dots.forEach((b, i) => b.onclick = () => goto(i));
    drag(vp, { down:p => { held = true; from = cur; sx = gx.at() + p.cx; hx = gx.at(); },
      move:p => { let v = sx - p.cx; if (v < 0) v = rb(v, 60); if (v > max) v = max + rb(v - max, 60); hx = v; },
      up:(p, vel) => { const v = REDUCE ? 0 : -vel.vx; goto(clamp(Math.round((hx + v * .18) / W), from - 1, from + 1), v); held = false; } });
    vp.onkeydown = e => { if (e.key === 'ArrowRight'){ goto(cur + 1); e.preventDefault(); } if (e.key === 'ArrowLeft'){ goto(cur - 1); e.preventDefault(); } };
    pk.onchange = () => vp.style.setProperty('padding-right', pk.checked ? '0px' : '0px');
    ds.forEach(d => d.jump(0)); ds[0].jump(1);
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const x = held ? hx : gx.at(t); strip.style.transform = `translateX(${px(-x)})`;
      const peek = pk.checked ? 14 : 0; strip.style.paddingRight = peek + 'px';
      cards.forEach((c, i) => { const d = Math.abs(i * W - x) / W, s = clamp(sc[i].at(t)); c.style.opacity = (1 - Math.min(.45, d * .3)).toFixed(3); c.style.transform = `scale(${(s * (1 - Math.min(.06, d * .04))).toFixed(4)})`; });
      dots.forEach((b, i) => { const o = clamp(ds[i].at(t)), dot = b.firstChild; dot.style.background = mix(o, 'var(--ink)', 'var(--faint)'); dot.style.transform = `scale(${(.8 + .5 * o).toFixed(3)})`; }); };
  }});

atom({ id:'issuelist', cat:'SEO', name:'Issue severity list', block:'seo audit, issues', fam:['M','S','X'], tall:true,
  html:`<div class="col" style="width:min(360px,92%);gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Top issues · <span class="dg num" style="font-variant-numeric:tabular-nums"></span> open</b><div class="ls col" style="gap:8px"></div><div class="dn card" role="status" style="position:relative;height:26px;padding:0 14px;font-size:13px;font-weight:600;line-height:26px"></div><div class="row small muted" style="gap:6px;font-size:12.5px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="dv" checked> dividers</label><span aria-hidden="true">·</span><span>fix panels measure open</span></div></div><button class="btn rs" style="position:absolute;top:10px;right:12px;min-height:32px">Reset</button>`,
  desc:'Rows arrive staggered 60ms apart on base. Tapping a row expands its measured fix-it panel; resolving fades the card and springs its height shut while the open count rolls down. Zero issues swaps in the terminal all-clear.',
  api:'row.o.set(1, base, t+i*.06) fix.h.set(measure) resolve: o.snap h.base dg.set(n)',
  init(st){
    const T = [
      { s:'Missing meta descriptions', d:'danger', f:'Add a unique description under 155 characters to each of the 14 pages listed.' },
      { s:'Slow LCP on /pricing', d:'warning', f:'Compress the hero image under 200 KB and preload it. Target LCP under 2.5 s.' },
      { s:'Orphaned /changelog page', d:'warning', f:'Link /changelog from the footer sitemap so crawlers can reach it within 3 hops.' }
    ];
    const C = { danger:'var(--danger)', warning:'var(--warning)' };
    const list = $(st,'.ls'), dn = $(st,'.dn'), dv = $(st,'.dv');
    const L = ['Keep fixing — issues remain', 'All clear ✓'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; if (i) e.style.color = 'var(--success)'; dn.appendChild(e); return e; });
    const dg = new Digits($(st,'.dg'), 1); dg.dir = -1; dg.set('3', true);
    const fin = new Swap(0), rows = [];
    T.forEach((c,i) => {
      const w = document.createElement('div'); w.style.cssText = 'overflow:hidden';
      const b = document.createElement('div'); b.className = 'card'; b.style.cssText = 'padding:14px 16px;display:flex;flex-direction:column;gap:0';
      b.innerHTML = '<button class="tg" aria-expanded="false" style="display:flex;align-items:center;gap:10px;border:0;background:none;padding:0;cursor:pointer;text-align:left;line-height:1.5;min-height:32px"><i style="flex:none;width:10px;height:10px;border-radius:50%;background:' + C[c.d] + '"></i><span style="flex:1;font-weight:600;font-size:13.5px">' + c.s + '</span><span class="muted cv" style="font-size:12px;display:grid;place-items:center;padding:0">▾</span></button><div class="fx" style="overflow:hidden;height:0"><p style="margin:8px 0 10px;font-size:13px;line-height:1.55">' + c.f + '</p><button class="btn rv" style="align-self:flex-start;min-height:32px;font-size:13px">Mark resolved</button></div>';
      w.appendChild(b); list.appendChild(w);
      const r = { w, b, fx:$(b,'.fx'), tg:$(b,'.tg'), rv:$(b,'.rv'), o:new Track(0, S.base), h:new Track(0), H:0, base:0, done:false, open:false };
      rows.push(r);
      r.tg.onclick = () => { if (r.done) return; r.open = !r.open; r.tg.setAttribute('aria-expanded', r.open);
        const to = r.open ? r.H : r.base;
        if (REDUCE){ r.h.jump(to); } else { r.h.set(to); } };
      r.rv.onclick = ev => { ev.stopPropagation(); if (r.done) return; r.done = true;
        if (REDUCE){ r.o.jump(0); r.h.jump(0); } else { r.o.set(0, S.snap); r.h.set(0, S.base, now() + EXIT); }
        r.rv.disabled = true;
        setTimeout(() => { const n = rows.filter(x => !x.done).length; dg.dir = -1; dg.set(String(n)); fin.to(n ? 0 : 1); paint(); }, REDUCE ? 0 : 220); };
    });
    const paint = () => rows.forEach((r,i) => { const vis = rows.filter(x => !x.done); const last = vis[vis.length - 1] === r;
      r.w.style.borderBottom = (!dv.checked || r.done || last) ? 'none' : '1px solid var(--line-soft)'; });
    requestAnimationFrame(() => { const t0 = now(); rows.forEach((r,i) => {
        r.fx.style.height = 'auto'; const full = r.b.offsetHeight; r.fx.style.height = '0px'; r.base = r.b.offsetHeight; r.H = full;
        r.h.jump(0);
        if (REDUCE) r.o.jump(1); else r.o.set(1, S.base, t0 + i*.06); });
      rows.forEach(r => r.h.jump(0));
      requestAnimationFrame(() => rows.forEach(r => { if (!r.done && !r.open) r.h.jump(r.base); }));
      paint(); });
    dv.onchange = paint;
    $(st,'.rs').onclick = () => { dg.dir = 1; if (REDUCE) dg.set('3', true); else dg.set('3'); fin.to(0);
      rows.forEach((r,i) => { r.done = false; r.open = false; r.rv.disabled = false; r.tg.setAttribute('aria-expanded', 'false');
        if (REDUCE){ r.o.jump(1); r.h.jump(r.base); } else { r.o.set(1, S.base, now() + i*.06); r.h.set(r.base); } }); paint(); };
    return t => { rows.forEach(r => { r.w.style.height = px(Math.max(0, r.h.at(t))); r.w.style.visibility = r.done && clamp(r.o.at(t)) < .02 ? 'hidden' : 'visible';
        fade(r.b, clamp(r.o.at(t)), (1-clamp(r.o.at(t)))*6); r.fx.style.height = px(Math.max(0, r.h.at(t) - r.base)); });
      dg.render(t); L.forEach((el,k) => fin.apply(el,k,t)); };
  }});

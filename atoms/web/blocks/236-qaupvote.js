atom({ id:'qaupvote', cat:'Forms', name:'Live Q&A upvote', block:'q&a (upvote, questions, AMA)', fam:['M','S'], tall:true,
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">Live Q&A</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">Vote the best questions up.</span><div class="card col" style="padding:14px 16px;gap:8px"><div class="qr col" style="gap:8px"></div><div class="fin" style="position:relative;height:30px"></div><label class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px"><input type="checkbox" class="so" checked> auto-sort by votes</label></div></div><div class="hint">Resolve every question to close the queue</div>`,
  desc:'Voting springs each row to its new rank on base while the counts roll digits. Resolving swaps a row to answered; the last one swaps in an empty terminal.',
  api:'row.y.set((rank-home)*H, S.base)   votes.set(n)   resolve: slot.to(1)   all: fin.to(1)',
  init(st){
    const Q = ['Will there be recordings?','How do breakouts get assigned?','Can guests join by phone?','Is the recap emailed?'];
    const V0 = [12, 8, 5, 3];
    const qr = $(st,'.qr'), so = $(st,'.so');
    const F = ['', 'Queue clear — great session'].map((s,k) => { const e = document.createElement('span'); e.className = 'layer';
      e.innerHTML = k ? `<span class="small" style="background:color-mix(in oklab, var(--success) 12%, transparent);color:var(--success);font-weight:600;padding:4px 10px;border-radius:999px;font-size:12.5px">✓ ${s}</span>` : s;
      $(st,'.fin').appendChild(e); return e; });
    const fsw = new Swap(0), ok = new Track(0);
    const rows = Q.map((q,i) => { const r = document.createElement('div'); r.className = 'row';
      r.style.cssText = 'gap:10px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:var(--card)';
      const vb = document.createElement('b'); vb.style.cssText = 'font-size:13px;font-variant-numeric:tabular-nums;min-width:20px;text-align:right';
      const dg = new Digits(vb, 2); dg.set(String(V0[i]).padStart(2,' '), true);
      const tx = document.createElement('span'); tx.style.cssText = 'font-size:13.5px;line-height:1.5;flex:1'; tx.textContent = q;
      const slot = document.createElement('span'); slot.style.cssText = 'position:relative;display:inline-block;width:74px;height:32px;flex:none';
      const up = document.createElement('button'); up.className = 'btn'; up.style.cssText = 'min-height:32px;border-radius:8px;width:74px'; up.textContent = 'Upvote';
      const an = document.createElement('span'); an.className = 'layer';
      an.innerHTML = `<span class="small" style="color:var(--success);font-weight:600;font-size:12.5px;line-height:32px;white-space:nowrap">✓ Answered</span>`;
      const ul = document.createElement('span'); ul.className = 'layer'; ul.appendChild(up); slot.append(ul, an);
      const rv = document.createElement('button'); rv.className = 'btn'; rv.style.cssText = 'min-height:32px;border-radius:8px;padding:0 9px;font-size:12.5px';
      rv.textContent = '✓'; rv.title = 'Resolve'; rv.setAttribute('aria-label', 'Resolve: ' + q);
      r.append(vb, tx, slot, rv); qr.appendChild(r);
      const sw = new Swap(0), dim = new Track(0), y = new Track(0);
      up.onclick = () => vote(it, 1); rv.onclick = () => resolve(it);
      const it = { r, tx, rv, dg, sw, dim, y, votes:V0[i], home:i, done:false }; return it; });
    const rank = () => [...rows].sort((a,b) => b.votes - a.votes || a.home - b.home);
    const H = () => (rows[0] ? rows[0].r.offsetHeight + 8 : 58);
    const layout = () => { const t0 = now(), rk = rank(), h = H();
      rows.forEach(it => { const k = rk.indexOf(it);
        it.y.set(so.checked ? (k - it.home)*h : 0, S.base, t0); }); };
    const vote = (it, d) => { if (it.done) return; it.votes += d; it.dg.set(String(it.votes).padStart(2,' ')); layout(); };
    const resolve = it => { if (it.done) return; const t0 = now(); it.done = true;
      it.sw.to(1, t0); it.dim.set(1, S.base, t0);
      if (rows.every(r => r.done)){ fsw.to(1, t0); ok.set(1, S.snap, t0); } };
    so.onchange = layout;
    return t => { rows.forEach(it => { it.r.style.transform = `translateY(${it.y.at(t).toFixed(2)}px)`;
        it.dg.render(t);
        [it.r.querySelectorAll('.layer')[0], it.r.querySelectorAll('.layer')[1]].forEach((e,k) => it.sw.apply(e,k,t));
        const d = clamp(it.dim.at(t));
        it.tx.style.opacity = (1 - .45*d).toFixed(3); it.rv.style.opacity = (1 - d).toFixed(3);
        it.rv.style.visibility = d > .98 ? 'hidden' : 'visible';
        it.r.style.borderColor = mix(d,'var(--success)','var(--line)'); });
      F.forEach((e,k) => fsw.apply(e,k,t));
      const d = clamp(ok.at(t)), fin = $(st,'.fin');
      fin.style.opacity = d.toFixed(3); fin.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});

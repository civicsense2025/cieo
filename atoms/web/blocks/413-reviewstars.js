atom({ id:'reviewstars', cat:'Forms', name:'Review stars input', block:'stars, rating, review form', fam:['S','M'],
  html:`<div class="col" style="gap:8px;width:min(300px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Rate your order</h4><div class="row" role="radiogroup" aria-label="Rating" style="gap:4px"></div><span class="cap small" style="position:relative;height:18px;font-size:12px;color:var(--muted);line-height:1.5"></span><div class="row" style="gap:8px"><button class="btn sub" style="height:36px;padding:0 16px;border-radius:9px;flex:1">Submit review</button><label class="row small muted" style="gap:6px;cursor:pointer;align-items:center"><input type="checkbox" class="hf" checked> Half stars</label></div></div><div class="hint">Drag across, release to settle, then submit</div>`,
  desc:'Fill follows the pointer while held, then settles on release. The caption swaps to the score and submit morphs into a held thanks.',
  api:'fill.jump(held) → fill.set(score, base)   cap.to(score)   submit.to(thanks)',
  init(st){
    const row = $(st,'.row'), cap = $(st,'.cap'), sub = $(st,'.sub'), hf = $(st,'.hf');
    const C = ['Tap a star', 'Poor', 'Fair', 'Good', 'Great', 'Loved it'];
    const L = C.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; cap.appendChild(e); return e; });
    const stars = []; for (let i = 0; i < 5; i++){ const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', (i + 1) + ' stars');
      b.style.cssText = 'width:36px;height:36px;padding:0;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:var(--muted)';
      b.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><path d="M12 3.5 14.8 9l5.9.6-4.4 4 1.2 5.9L12 16.4 6.5 19.5l1.2-5.9-4.4-4L9.2 9z"/></svg>';
      row.appendChild(b); stars.push(b); }
    const fill = new Track(0), sw = new Swap(0), done = new Track(0), bsw = new Swap(0);
    const BL = ['Submit review', 'Thanks — review posted']; const BLy = BL.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; sub.appendChild(e); return e; });
    let score = 0, held = false;
    const val = e => { const r = row.getBoundingClientRect(); const p = clamp((e.clientX - r.left) / r.width) * 5; return hf.checked ? Math.round(p * 2) / 2 : Math.round(p); };
    const paint = v => stars.forEach((b, i) => { const f = clamp(v - i, 0, 1); b.style.color = mix(f, 'var(--warning)', 'var(--faint)'); b.firstChild.setAttribute('fill', f > .75 ? 'currentColor' : 'none'); b.style.transform = `scale(${(1 + .12 * (f > 0 && f < 1 ? 1 : 0)).toFixed(3)})`; });
    stars.forEach((b, i) => { b.onclick = () => { score = i + 1; fill.set(score, S.base); sw.to(score); stars.forEach((x, j) => x.setAttribute('aria-checked', j < score)); }; });
    row.addEventListener('pointerdown', e => { held = true; row.setPointerCapture(e.pointerId); const v = val(e); fill.jump(v); paint(v); });
    row.addEventListener('pointermove', e => { if (!held) return; const v = val(e); fill.jump(v); paint(v); });
    const end = e => { if (!held) return; held = false; score = Math.max(1, Math.round(val(e))); fill.set(score, S.base); sw.to(score); stars.forEach((x, j) => x.setAttribute('aria-checked', j < score)); };
    row.addEventListener('pointerup', end); row.addEventListener('pointercancel', end);
    sub.onclick = () => { if (!score || done.target) return; done.set(1, S.base); bsw.to(1); };
    return t => { if (!held) paint(fill.at(t)); L.forEach((el, k) => sw.apply(el, k, t)); BLy.forEach((el, k) => bsw.apply(el, k, t));
      const d = clamp(done.at(t)); sub.style.background = mix(d, 'var(--success)', 'var(--ink)'); sub.style.color = '#fff'; sub.disabled = !!done.target; };
  }});

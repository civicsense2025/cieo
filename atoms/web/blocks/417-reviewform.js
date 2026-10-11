atom({ id:'reviewform', cat:'Forms', name:'Review form', block:'review form, photos, mood', fam:['M','S'],
  html:`<div class="col" style="gap:8px;width:min(320px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Write a review</h4><div class="ph row" role="group" aria-label="Photos" style="gap:6px"></div><div class="md row" role="radiogroup" aria-label="Mood" style="gap:4px;position:relative"></div><span class="ml small" style="position:relative;height:18px;font-size:12px;color:var(--muted);line-height:1.5"></span><textarea aria-label="Review" placeholder="What stood out? (optional)" style="min-height:56px;border:1.5px solid var(--muted);border-radius:9px;padding:8px 12px;font:14px/1.5 var(--sans);resize:vertical"></textarea><div class="row" style="gap:8px"><button class="btn snd" aria-label="Post review" style="position:relative;height:36px;padding:0 16px;border-radius:9px;flex:1;overflow:hidden"></button><label class="row small muted" style="gap:6px;cursor:pointer;align-items:center"><input type="checkbox" class="iph" checked> Include photos</label></div></div><div class="hint">Add photos, slide mood, then post</div>`,
  desc:'Photo tiles open their height first and sharpen after. Faces glide with the mood and the label swaps; posting morphs a held thanks.',
  api:'tile.h.set(open, base) → sharp.set(1)   mood.set(i, soft); label.to(i)   post.to(thanks)',
  init(st){
    const ph = $(st,'.ph'), md = $(st,'.md'), ml = $(st,'.ml'), snd = $(st,'.snd'), iph = $(st,'.iph');
    const T = 2, tiles = [];
    for (let i = 0; i < T; i++){ const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Add photo ' + (i + 1));
      b.style.cssText = 'flex:1;aspect-ratio:1;max-width:88px;border-radius:12px;border:1.5px dashed var(--muted);background:var(--raised);padding:0;display:grid;place-items:center;cursor:pointer;color:var(--muted);overflow:hidden;height:0;min-height:0;opacity:0';
      b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2.5h5L16 6"/></svg>';
      ph.appendChild(b); const h = new Track(0), sh = new Track(0); tiles.push({ b, h, sh, on:false });
      b.onclick = () => { const o = !b._on; b._on = o; b.setAttribute('aria-pressed', o); tiles[i].h.set(o ? 1 : 0, S.base);
        if (o) setTimeout(() => tiles[i].sh.set(1, S.soft), REDUCE ? 0 : 180); else tiles[i].sh.jump(0);
        b.innerHTML = o ? `<span style="width:100%;height:100%;background:linear-gradient(135deg,var(--line-soft),var(--raised));display:grid;place-items:center;font-size:18px">◍</span>` : b.innerHTML; }; }
    const M = ['😞', '🙁', '😐', '🙂', '😍'], MN = ['Tap a face', 'Rough', 'Okay', 'Fine', 'Good', 'Loved it'];
    const L = MN.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; ml.appendChild(e); return e; });
    const faces = M.map((m, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', MN[i + 1]); b.textContent = m;
      b.style.cssText = 'width:36px;height:36px;padding:0;border:0;background:none;font-size:20px;cursor:pointer;display:grid;place-items:center;filter:grayscale(1);opacity:.55'; md.appendChild(b); return b; });
    const mood = new Track(2), msw = new Swap(0), psw = new Swap(0);
    const PL = ['Post review', '✓ Thanks — posted'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; snd.appendChild(e); return e; });
    let mi = -1;
    faces.forEach((b, i) => b.onclick = () => { mi = i; mood.set(i, S.soft); msw.to(i + 1); faces.forEach((x, j) => x.setAttribute('aria-checked', j === i)); });
    iph.onchange = () => tiles.forEach(tl => { const o = iph.checked; tl.b._on = o; tl.b.setAttribute('aria-pressed', o); tl.h.set(o ? 1 : 0, REDUCE ? S.base : S.soft);
      if (o) setTimeout(() => tl.sh.set(1, S.soft), REDUCE ? 0 : 180); else tl.sh.jump(0); });
    setTimeout(() => { if (st.isConnected && iph.checked) iph.onchange(); }, 300);
    snd.onclick = () => { if (mi < 0){ faces[3].click(); } psw.to(1); snd.disabled = true; };
    return t => { tiles.forEach(tl => { const o = clamp(tl.h.at(t)), s = clamp(tl.sh.at(t)); tl.b.style.height = 'auto'; tl.b.style.minHeight = (o * 72).toFixed(1) + 'px'; tl.b.style.opacity = o.toFixed(3); tl.b.style.visibility = o < .02 ? 'hidden' : 'visible';
        tl.b.style.filter = s > .5 ? 'none' : `blur(${((1 - s) * 4).toFixed(2)}px)`; tl.b.style.borderStyle = tl.b._on ? 'solid' : 'dashed'; });
      const m = mood.at(t); faces.forEach((b, i) => { const d = 1 - Math.min(1, Math.abs(m - i)); b.style.opacity = (.55 + .45 * d).toFixed(3); b.style.filter = `grayscale(${((1 - d)).toFixed(2)})`; b.style.transform = `translateY(${(-4 * d).toFixed(2)}px) scale(${(1 + .1 * d).toFixed(3)})`; });
      L.forEach((el, k) => msw.apply(el, k, t)); PL.forEach((el, k) => psw.apply(el, k, t)); };
  }});

atom({ id:'slug', cat:'Writing', name:'Slug renamer', block:'slug field', fam:['S','E'],
  html:`<div class="col" style="gap:10px;width:min(360px,92%)"><label class="small muted">Post title <input class="ti" value="The fee hike nobody voted on" style="display:block;width:100%;margin-top:4px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:none;color:var(--ink);font:14px var(--sans)"></label><div class="row small" style="gap:6px;align-items:center"><span class="muted">/posts/</span><span class="fld card" style="position:relative;display:inline-block;overflow:hidden;padding:6px 10px;min-height:30px;vertical-align:middle"><span class="o layer"></span><span class="u layer"></span></span><span class="warn" style="color:var(--danger)"></span></div><div class="row" style="gap:8px"><button class="btn ink rn">Rename</button></div><div class="hint">Try “water rates” — that slug is taken</div></div>`,
  desc:'The field stretches or shrinks to fit as you type. The old slug blurs into the new one. A taken slug rings red and says so.',
  api:'w.set(fit(live))   sw.to(new)   taken: ring.set(1), msg',
  init(st){
    const TAKEN = new Set(['water-rates', 'fee-hike']);
    const inp = $(st,'.ti'), fld = $(st,'.fld'), o = $(st,'.o'), u = $(st,'.u'), warn = $(st,'.warn');
    const slugify = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';
    const sw = new Swap(0), w = new Track(120), ring = new Track(0);
    const layers = [o, u]; let cur = 0, val = slugify(inp.value);
    o.textContent = val;
    const fit = s => { const m = document.createElement('span'); m.textContent = s;
      Object.assign(m.style, { position:'absolute', visibility:'hidden', whiteSpace:'nowrap', font:'13px var(--sans)', padding:'6px 10px' });
      st.appendChild(m); const x = m.offsetWidth + 22; m.remove(); return Math.max(80, x); };
    const apply = v => { const t = now(); cur = 1 - cur; layers[cur].textContent = v;
      sw.to(cur, t); w.set(fit(v), S.base, t);
      const bad = TAKEN.has(v); ring.set(bad ? 1 : 0, S.snap, t); warn.textContent = bad ? 'taken — try another' : ''; };
    inp.oninput = () => apply(slugify(inp.value));
    $(st,'.rn').onclick = () => { inp.value = inp.value === 'Water rates' ? 'The fee hike nobody voted on' : 'Water rates'; apply(slugify(inp.value)); };
    w.jump(fit(val)); if (REDUCE) { ring.jump(0); }
    return t => { const r = clamp(ring.at(t));
      fld.style.width = px(w.at(t));
      fld.style.borderColor = mix(r, 'var(--danger)', 'var(--line)');
      fld.style.boxShadow = r > .02 ? `0 0 0 ${(r*3).toFixed(1)}px color-mix(in oklab, var(--danger) ${(r*45).toFixed(0)}%, transparent)` : 'none';
      layers.forEach((e,k) => sw.apply(e,k,t)); };
  }});

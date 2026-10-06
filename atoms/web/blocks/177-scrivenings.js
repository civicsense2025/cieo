

atom({ id:'scrivenings', cat:'Writing', name:'Joined scenes', block:'manuscript, scene list', fam:['M','S'], tall:true,
  html:`<div class="col" style="gap:16px;width:min(340px,92%)"><div class="row sc-chips" style="gap:8px;flex-wrap:wrap"></div><div class="card sc-join" style="overflow:hidden;width:100%"><div class="sc-in col" style="gap:0;padding:24px"></div></div></div><div class="hint">Tick scenes to stitch them together</div>`,
  desc:'Tick scenes to stitch them into one scroll. Divider titles swap without overlap while the joined height springs to fit.',
  api:'sel.toggle(i); div.swap(i); h.set(fit)',
  init(st){
    const SC = [{ t:'Arrival', b:'Mara reaches the lake house after dark, every light on.' },{ t:'The letter', b:'An unsent letter on the table names the buyer of the orchard.' },{ t:'Storm', b:'Rain takes the power out; they talk by candlelight until dawn.' }];
    const chips = $(st,'.sc-chips'), join = $(st,'.sc-join'), inn = $(st,'.sc-in');
    const h = new Track(0); let sel = [0, 2]; const divs = [];
    const fit = () => h.set(inn.scrollHeight || 1, S.base);
    const paint = () => {
      chips.querySelectorAll('button').forEach((b,i) => {
        const on = sel.includes(i);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.background=on?'var(--accent-tint)':'var(--card)';b.style.color=on?'var(--accent)':'var(--muted)';
      });
    };
    SC.forEach((s,i) => {
      const b = document.createElement('button'); b.type='button';b.className='chipb small'; b.textContent = s.t;
      b.style.cssText += 'min-height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);padding:8px 16px;cursor:pointer';
      b.onclick = () => { sel = sel.includes(i) ? sel.filter(k => k !== i) : [...sel, i].sort(); render(); };
      chips.appendChild(b);
    });
    const divider = title => {
      const d = document.createElement('div');
      d.style.cssText = 'position:relative;height:24px;margin:8px 0 8px';
      const e = document.createElement('span'); e.className = 'layer small muted'; e.textContent = '';
      const f = document.createElement('span'); f.className = 'layer small muted'; f.textContent = title;
      d.appendChild(e); d.appendChild(f);
      const sw = new Swap(0); sw.to(1);
      divs.push({ sw, e, f });
      return d;
    };
    const render = () => {
      divs.length = 0; inn.innerHTML = '';
      if (!sel.length){ const p = document.createElement('p'); p.className = 'small muted'; p.textContent = 'Nothing stitched yet — tick a scene above.'; inn.appendChild(p); }
      sel.forEach((si,n) => {
        if (n > 0) inn.appendChild(divider('§ ' + (n+1) + ' · ' + SC[si].t));
        const p = document.createElement('p'); p.className = 'small'; p.style.margin = '0 0 8px'; p.textContent = SC[si].b; inn.appendChild(p);
      });
      paint(); fit();
    };
    render(); h.jump(inn.scrollHeight || 1);
    return t => { join.style.height = px(Math.max(1, h.at(t))); divs.forEach(d => d.sw.apply(d.e, 0, t) || d.sw.apply(d.f, 1, t)); };
  }});

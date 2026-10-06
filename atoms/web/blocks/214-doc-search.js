atom({ id:'docsearch', cat:'Documents', name:'In-doc search', block:'find in page, search jump', fam:['M'],
  html:`<div class="col" style="width:min(380px,94%);gap:8px"><div class="card col" style="padding:14px 16px;gap:10px"><div class="row" style="gap:8px"><input class="q" type="search" value="spring" aria-label="Search document" style="flex:1;min-height:32px;border-radius:8px;border:1px solid var(--line);padding:0 10px;font-size:14px"><button class="btn up" style="min-height:32px;border-radius:8px">‹</button><button class="btn dn" style="min-height:32px;border-radius:8px">›</button><b class="n" style="font-size:13px;font-variant-numeric:tabular-nums;align-self:center"></b></div><div class="doc col" style="position:relative;gap:0;font-size:13.5px;line-height:1.6"><div class="hl" style="position:absolute;left:-4px;right:-4px;border-radius:6px;background:var(--accent);opacity:.18"></div><div class="gh" style="position:absolute;left:-4px;right:-4px;border-radius:6px;border:1px solid var(--accent);opacity:.35"></div><p class="p0" style="margin:0;padding:6px 0">The spring essay opens with a market bell.</p><hr style="border:0;border-top:1px solid var(--line);margin:0"><p class="p1" style="margin:0;padding:6px 0">Attention is the spring tax every reader pays.</p><hr style="border:0;border-top:1px solid var(--line);margin:0"><p class="p2" style="margin:0;padding:6px 0">Care survives where the spring runs dry.</p></div><div class="term small" style="position:relative;height:22px;font-size:12.5px"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="cs" checked> match case-insensitive</label></div><div class="hint">Search “spring”, jump with ›, try “xyz”</div>`,
  desc:'Jumping slides the highlight while its outline trails a beat behind. The match counter rolls digits. A query with no hits blurs out to a quiet empty terminal instead of flashing.',
  api:'jump: hl.go(top) trails .06   n.set(hits)   miss: term.to(1) Swap-out, hold',
  init(st){
    const q = $(st,'.q'), doc = $(st,'.doc'), hl = $(st,'.hl'), gh = $(st,'.gh'), term = $(st,'.term'), cs = $(st,'.cs');
    const paras = [$$(st,'.p0')[0], $$(st,'.p1')[0], $$(st,'.p2')[0]];
    const E = ['','No matches — try “spring”'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.textContent = s; term.appendChild(el); return el; });
    const sw = new Swap(0), e = edges(0, 0), dg = new Digits($(st,'.n'), 2);
    let marks = [], ai = 0;
    const top = el => el.offsetTop - doc.offsetTop + doc.parentElement.scrollTop * 0;
    function run(){
      const needle = cs.checked ? q.value.toLowerCase() : q.value;
      marks = []; paras.forEach(p => p.innerHTML = p.textContent);
      if (needle){ paras.forEach(p => { const tx = p.textContent, hay = cs.checked ? tx.toLowerCase() : tx; let i = hay.indexOf(needle), html = '', last = 0;
        while (i >= 0){ html += `${tx.slice(last, i)}<mark>${tx.slice(i, i + needle.length)}</mark>`; last = i + needle.length; i = hay.indexOf(needle, last); }
        if (html){ p.innerHTML = html + tx.slice(last); } }); marks = [...doc.querySelectorAll('mark')]; }
      marks.forEach(m => { m.style.borderRadius = '4px'; m.style.padding = '0 1px'; });
      ai = 0; dg.set(String(marks.length).padStart(2, '0')); sw.to(marks.length ? 0 : 1);
      if (marks.length){ const y = top(marks[0]); e.jump(y, y); paint(0); } else { hl.style.opacity = 0; gh.style.opacity = 0; }
    }
    function paint(i){ marks.forEach((m,j) => m.style.background = j === i ? 'var(--accent)' : ''); const y = top(marks[i]); e.go(y, y); }
    const step = d => { if (!marks.length) return; ai = (ai + d + marks.length) % marks.length; paint(ai); };
    q.oninput = run; cs.onchange = run; $(st,'.up').onclick = () => step(-1); $(st,'.dn').onclick = () => step(1);
    run();
    return t => { const A = e.A.at(t), B = e.B.at(t);
      if (marks.length){ hl.style.opacity = .18; gh.style.opacity = .35; hl.style.top = px(A); hl.style.height = px(22); gh.style.top = px(B); gh.style.height = px(22); }
      E.forEach((el,k) => sw.apply(el,k,t)); dg.render(t); };
  }});

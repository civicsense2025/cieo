
atom({ id:'emailpoll', cat:'Email', name:'Poll by email', block:'email, poll, vote', fam:['M','S','T'],
  html:`<div class="col" style="gap:8px;width:min(300px,92%)"><div class="card" style="padding:14px 16px;line-height:1.5"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600">Team offsite?</b><span class="small muted num" style="font-size:12px"><b class="tot" style="font-size:12.5px"></b> votes</span></div><div class="opts" style="margin-top:4px"></div></div><label class="row small muted" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" class="chg" checked> allow change vote</label></div><div class="hint">Tap an option to vote</div>`,
  desc:'Vote bars fill with a base stagger while percents fade in lazy. The pick keeps its check, the tally rolls its digits, and votes can move.',
  api:'bars w.set(pct, base) stagger .06   pct fade lazy   tot.set(n)   end: voted check, hold',
  init(st){
    const box = $(st,'.opts'), chg = $(st,'.chg');
    const opts = [['Cabin weekend', 5], ['City day', 3], ['Stay remote', 2]];
    const tot = new Digits($(st,'.tot'), 2); tot.set('10', true);
    let mine = -1, total = 10;
    const rows = opts.map((o, i) => {
      const d = document.createElement('button');
      d.style.cssText = 'position:relative;display:flex;align-items:center;gap:8px;width:100%;min-height:52px;border:0;background:none;cursor:pointer;padding:6px 0;text-align:left;color:var(--ink)' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      d.innerHTML = `<span class="bar" style="position:absolute;left:0;top:8px;bottom:8px;border-radius:8px;background:var(--accent-tint);width:0"></span><span class="ck" style="position:relative;width:22px;height:22px;flex:none;border-radius:50%;border:1.5px solid var(--muted);background:var(--card);display:grid;place-items:center;font-size:12px;font-weight:700;padding:0;transform:translateY(.5px)"></span><span style="position:relative;flex:1;font-size:13.5px;font-weight:500;line-height:1.5">${o[0]}</span><b class="pc num" style="position:relative;font-size:12.5px"></b>`;
      box.appendChild(d);
      return { d, bar: d.querySelector('.bar'), ck: d.querySelector('.ck'), pc: d.querySelector('.pc'), w: new Track(0), f: new Track(0) };
    });
    const paint = (t, instant) => { const sum = opts.reduce((a, o) => a + o[1], 0);
      rows.forEach((r, i) => { const p = opts[i][1] / sum;
        r.w.set(p*100, S.base, t + i*.06); r.f.set(1, S.lazy, t + .15 + i*.06);
        if (instant){ r.w.jump(p*100); r.f.jump(1); }
        r.ck.textContent = i === mine ? '✓' : '';
        r.ck.style.background = i === mine ? 'var(--ink)' : 'var(--card)';
        r.ck.style.color = i === mine ? 'var(--card)' : 'var(--ink)';
        r.ck.style.borderColor = i === mine ? 'var(--ink)' : 'var(--muted)';
        r.pc.textContent = Math.round(p*100) + '%'; }); };
    rows.forEach((r, i) => r.d.onclick = () => { const t = now();
      if (mine === i) return;
      if (mine >= 0 && !chg.checked) return;
      if (mine >= 0) opts[mine][1]--;
      opts[i][1]++; mine = i; total++;
      tot.set(String(total)); paint(t); });
    paint(now() + .15);
    return t => { rows.forEach(r => { r.bar.style.width = Math.max(0, r.w.at(t)).toFixed(2) + '%';
        r.pc.style.opacity = (.45 + .55*clamp(r.f.at(t))).toFixed(3); });
      tot.render(t); };
  }});


/* ---------- Forms (in-chat) ---------- */
atom({ id:'chatpoll', cat:'Forms', name:'In-chat poll', block:'chat, poll', fam:['M','S','T'], tall:true,
  html:`<div class="card col" style="width:min(320px,calc(100% - 24px));padding:14px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.5">Which block should ship next?</b><div class="pl col" style="gap:6px"></div><span class="cap small" style="position:relative;display:block;height:20px;font-size:12px"></span><div class="row" style="justify-content:space-between"><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="an" checked> Animate fills</label><button class="btn rs" style="min-height:32px;border-radius:9px">Reset</button></div></div><div class="hint">Vote, then watch the bars land</div>`,
  desc:'Each option morphs in place into its result bar. Fills stagger in, percents roll their digits, and the picked row keeps its check.',
  api:'opt[i].fill.set(pct[i], S.base, t + i·0.06)   pct digits roll   picked.ck.w→14',
  init(st){
    const O = [['Booking calendar',38],['Course player',27],['Job board',21],['Map directory',14]];
    const pl = $(st,'.pl'), cap = $(st,'.cap'), an = $(st,'.an');
    const rows = O.map(([n]) => { const b = document.createElement('button');
      b.style.cssText = 'position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;background:var(--card);border-radius:10px;padding:11px 13px;cursor:pointer;text-align:left;min-height:44px';
      b.innerHTML = `<i style="position:absolute;left:0;top:0;bottom:0;background:var(--raised)"></i><span style="position:relative;display:flex;gap:8px;align-items:center;font-size:13.5px"><svg class="ck" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="transform:translateY(.5px)"><path d="M5 12.5 10 17.5 19 7"/></svg><span></span></span><span class="num small" style="position:relative;display:flex;align-items:center;gap:2px;font-size:13px"></span>`;
      $$(b,'span')[1].textContent = n; pl.appendChild(b);
      const dg = new Digits($$(b,'span')[2], 2); dg.set(' 0', true);
      const pct = document.createElement('span'); pct.textContent = '%'; $$(b,'span')[2].appendChild(pct);
      return { b, fill:$(b,'i'), ck:$(b,'.ck'), v:new Track(0), o:new Track(0), c:new Track(0), dg }; });
    const C = ['Tap an option to vote', 'You picked Booking calendar · 128 votes'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.style.fontSize = '12px'; e.textContent = s; if (i){ e.style.color = 'var(--success)'; } else { e.style.color = 'var(--muted)'; } cap.appendChild(e); return e; });
    const csw = new Swap(0);
    let voted = -1;
    rows.forEach((r,i) => r.b.onclick = () => { if (voted >= 0) return; voted = i; const t = now();
      C[1].textContent = `You picked ${O[i][0]} · 128 votes`;
      rows.forEach((x,j) => { const pc = O[j][1] + (j === i ? 1 : 0);
        if (REDUCE){ x.v.jump(pc); x.o.jump(1); x.c.jump(j === i ? 1 : 0); x.dg.set(String(pc), true); }
        else { const d = an.checked ? j*.06 : 0; x.v.set(pc, S.base, t + d); x.o.set(1, S.base, t + EXIT + d); x.c.set(j === i ? 1 : 0); x.dg.set(String(pc)); }
        x.b.style.cursor = 'default'; });
      if (REDUCE){ csw.cur = 1; csw.prev = 0; csw.t = t; } else csw.to(1); });
    $(st,'.rs').onclick = () => { voted = -1; C[1].textContent = 'You picked Booking calendar · 128 votes';
      rows.forEach(x => { x.v.set(0, REDUCE ? S.snap : S.base); x.o.set(0, S.snap); x.c.set(0); x.dg.set(' 0', REDUCE); x.b.style.cursor = 'pointer'; });
      if (REDUCE){ csw.cur = 0; csw.prev = null; csw.t = -9; } else csw.to(0); };
    return t => { rows.forEach(r => { const vv = r.v.at(t), c = clamp(r.c.at(t));
      r.fill.style.width = (clamp(vv/100)*100).toFixed(2) + '%'; r.dg.render(t);
      fade($$(r.b,'span')[2], r.o.at(t), 0);
      r.ck.style.width = px(14*c); r.ck.style.opacity = c.toFixed(3);
      r.b.style.borderColor = c > .5 ? 'var(--ink)' : 'var(--line)'; });
      C.forEach((e,k) => csw.apply(e,k,t)); };
  }});

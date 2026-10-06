

atom({ id:'quizrouter', cat:'Forms', name:'Goal router', block:'onboarding quiz, questions', fam:['S','M'],
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="bc card" style="width:min(320px,94%);padding:14px 16px"><div class="row" style="justify-content:space-between;align-items:baseline"><b style="font-size:15px;font-weight:600;line-height:1.5">Welcome</b><span class="num" style="font-size:12px;color:var(--muted);line-height:1.5"><span class="dn"></span> of 2</span></div><div class="qq" style="position:relative;min-height:172px;margin-top:8px"></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Jump:</span></div></div><div class="hint">Pick a goal — the next card is routed to it</div>`,
  desc:'Tapping a goal dips the card on a fast snap, then swaps to the branch that goal routes to while the step rolls forward. Every path ends in a Got-it terminal with a Start-over.',
  api:'press.set(1, snap) dip, then branch.to(goal)   step.set(n)   done holds · REDUCE: jump',
  init(st){
    const qq = $(st,'.qq'), tw = $(st,'.tw');
    const GOALS = [['Ship faster','Cut review time in half.'],['Look sharper','A portfolio that reads in seconds.'],['Stay organized','One inbox for every draft.']];
    const PACES = ['A calm weekly digest','A brisk daily briefing'];
    const dg = new Digits($(st,'.dn'), 1), sw = new Swap(0), press = new Track(0); let step = 0, goal = 0;
    const optBtn = (label, sub) => { const b = document.createElement('button'); b.style.cssText = 'display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:1px solid var(--line);background:var(--card);border-radius:9px;padding:6px 12px;min-height:36px;cursor:pointer;font-size:14px;line-height:1.5'; b.innerHTML = `<span style="flex:1">${label}<br><span class="small muted">${sub}</span></span>`; return b; };
    const L = [];
    const goalLayer = document.createElement('div'); goalLayer.className = 'layer'; goalLayer.style.cssText += 'flex-direction:column;gap:6px;align-items:stretch;white-space:normal';
    goalLayer.innerHTML = `<span style="font-size:13px;line-height:1.5">What brings you here?</span>`;
    GOALS.forEach(([g,sub],gi) => { const b = optBtn(g, sub); b.onclick = () => pick(gi); goalLayer.appendChild(b); });
    qq.appendChild(goalLayer); L.push(goalLayer);
    GOALS.forEach(([g,sub],gi) => { const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += 'flex-direction:column;gap:6px;align-items:stretch;white-space:normal';
      e.innerHTML = `<span style="font-size:13px;line-height:1.5">For <b>${g.toLowerCase()}</b> — pick a pace.</span>`;
      PACES.forEach(p => { const b = optBtn(p, gi === 2 ? 'Batched, skimmable.' : (gi === 1 ? 'Fresh examples.' : 'Shipped deltas only.')); b.onclick = () => done(); e.appendChild(b); });
      qq.appendChild(e); L.push(e); });
    const fin = document.createElement('div'); fin.className = 'layer'; fin.style.cssText += 'flex-direction:column;gap:6px;align-items:stretch;white-space:normal;text-align:center';
    fin.innerHTML = `<b style="font-size:14px;color:var(--success);line-height:1.5">You are set ✓</b><span class="small muted fin-sub" style="line-height:1.5"></span><span><button class="btn rp" style="min-height:32px;padding:6px 12px">Start over</button></span>`;
    qq.appendChild(fin); L.push(fin);
    const dip = fn => { if (REDUCE){ fn(); return; } const t0 = now(); press.set(1, S.snap, t0); press.set(0, S.base, t0 + .09); setTimeout(() => fn(), 110); };
    const pick = gi => dip(() => { goal = gi; step = 1; REDUCE ? (sw.cur = gi + 1, sw.prev = null, sw.t = -9) : sw.to(gi + 1); dg.set('2', REDUCE); });
    const done = () => dip(() => { step = 2; fin.querySelector('.fin-sub').textContent = `${GOALS[goal][0]} · ${PACES[0].split(' ')[2]} pace, changeable anytime.`;
      REDUCE ? (sw.cur = 4, sw.prev = null, sw.t = -9) : sw.to(4); dg.set('2', REDUCE); });
    fin.querySelector('.rp').onclick = () => { step = 0; REDUCE ? (sw.cur = 0, sw.prev = null, sw.t = -9) : sw.to(0); dg.set('1', REDUCE); };
    [['1',0],['2',1],['Done',2]].forEach(([label,n]) => { const b = document.createElement('button'); b.className = 'btn'; b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = label;
      b.onclick = () => { if (n === 0){ step = 0; REDUCE ? (sw.cur = 0, sw.prev = null, sw.t = -9) : sw.to(0); dg.set('1', REDUCE); } else if (n === 1){ step = 1; REDUCE ? (sw.cur = goal + 1, sw.prev = null, sw.t = -9) : sw.to(goal + 1); dg.set('2', REDUCE); } else done(); }; tw.appendChild(b); });
    dg.set('1', true);
    return t => { const p = clamp(press.at(t)); qq.style.transform = `scale(${(1 - .02*p).toFixed(4)})`;
      L.forEach((el,k) => sw.apply(el,k,t)); dg.render(t); };
  }});

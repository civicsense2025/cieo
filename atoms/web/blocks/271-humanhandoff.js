
atom({ id:'humanhandoff', cat:'AI chat', name:'Human handoff', block:'chat, handoff', fam:['S','M'], tall:true,
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.5">Talk to a person</b><div class="row" style="gap:10px"><span class="av" style="position:relative;width:36px;height:36px;border-radius:50%;flex:none;overflow:hidden"></span><span class="col" style="gap:0;flex:1;min-width:0"><b class="nm small" style="position:relative;display:block;height:20px;font-size:13px"></b><span class="small muted" style="font-size:12px">Typically replies in minutes</span></span><span class="qpill" style="position:relative;min-width:118px;height:26px;background:var(--raised);border-radius:999px;font-size:12px;overflow:hidden"></span></div><div class="row" style="gap:6px"><span class="small muted" style="font-size:12px">Wait</span><span class="wt num" style="font-size:13px"></span><span class="small muted" style="font-size:12px">min</span></div><div class="tsum small" style="overflow:hidden;font-size:13px;line-height:1.55">Summary sent: launch date plus the pricing question.</div><div class="row" style="justify-content:space-between"><button class="btn ink ask" aria-label="Ask assistant" style="position:relative;min-width:170px;min-height:36px;border-radius:9px;overflow:hidden"></button><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="st" checked> Transcript</label></div></div><div class="hint">Ask for a person, then watch the queue</div>`,
  desc:'The avatar swaps to your teammate while the queue pill drops in on base. Digits count the wait down, then the transcript unfolds to a joined terminal.',
  api:'ask: avatar.swap.to(1), pill drops (S.base)   wait 03→00, 1.1s each   at 00: joined, tsum.h.set(H)',
  init(st){
    const av = $(st,'.av'), nm = $(st,'.nm'), pill = $(st,'.qpill'), tsum = $(st,'.tsum'), ask = $(st,'.ask'), showT = $(st,'.st');
    const A0 = document.createElement('span'); A0.className = 'layer'; A0.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>';
    const A1 = document.createElement('span'); A1.className = 'layer'; A1.style.cssText += ';font-weight:600;font-size:15px'; A1.textContent = 'M';
    av.append(A0, A1);
    const N = ['Assistant', 'Maya · Support'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; nm.appendChild(e); return e; });
    const P = ['', '#2 in queue', 'Maya joined'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.fontSize = '12px'; e.textContent = s; if (i === 2) e.style.color = 'var(--success)'; pill.appendChild(e); return e; });
    const B = ['Talk to a person', 'Chatting with Maya'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; ask.appendChild(e); return e; });
    const asw = new Swap(0), nsw = new Swap(0), psw = new Swap(-1), bsw = new Swap(0);
    const tint = new Track(0), drop = new Track(0), th = new Track(0), dg = new Digits($(st,'.wt'), 2);
    dg.set('··', true);
    let t0 = 0, phase = 0, lastEta = -1, H = 0;
    requestAnimationFrame(() => { tsum.style.height = 'auto'; H = tsum.offsetHeight; tsum.style.height = '0px'; th.jump(0); });
    ask.onclick = () => { if (phase) return; phase = 1; t0 = now(); lastEta = -1; const t = t0;
      if (REDUCE){ asw.cur = 1; asw.prev = 0; asw.t = t; nsw.cur = 1; nsw.prev = 0; nsw.t = t; tint.jump(1); drop.jump(1); psw.cur = 1; psw.prev = -1; psw.t = t; }
      else { asw.to(1); nsw.to(1); tint.set(1, S.base); drop.set(1, S.base, t + .06); psw.to(1); } };
    return t => { if (phase === 1){ const eta = Math.max(0, 3 - Math.floor((t - t0)/1.1));
        if (eta !== lastEta){ lastEta = eta; dg.set('0' + eta, REDUCE); }
        if (eta <= 0){ phase = 2; dg.set('00', REDUCE);
          if (REDUCE){ psw.cur = 2; psw.prev = 1; psw.t = t; bsw.cur = 1; bsw.prev = 0; bsw.t = t; th.jump(showT.checked ? H : 0); }
          else { psw.to(2); bsw.to(1); th.set(showT.checked ? H : 0, S.soft, t + .15); }
          ask.disabled = true; } }
      av.style.background = mix(clamp(tint.at(t)), 'var(--ink)', 'var(--raised)');
      A0.style.color = mix(clamp(tint.at(t)), 'var(--card)', 'var(--ink)'); A1.style.color = 'var(--card)';
      [A0,A1].forEach((e,k) => asw.apply(e,k,t)); N.forEach((e,k) => nsw.apply(e,k,t)); P.forEach((e,k) => psw.apply(e,k,t)); B.forEach((e,k) => bsw.apply(e,k,t));
      pill.style.opacity = clamp(drop.at(t)).toFixed(3); pill.style.transform = `translateY(${(-8*(1-clamp(drop.at(t)))).toFixed(2)}px)`;
      tsum.style.height = px(Math.max(0, th.at(t))); dg.render(t); };
  }});

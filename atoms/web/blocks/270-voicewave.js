
atom({ id:'voicewave', cat:'AI chat', name:'Voice waveform', block:'chat, voice', fam:['T','M','S'], tall:true,
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.5">Voice reply</b><div class="bars" style="display:flex;align-items:center;gap:3px;height:48px;padding:0 2px" aria-hidden="true"></div><div class="tx small" style="position:relative;align-self:flex-start;max-width:75%;min-height:38px;overflow:hidden;background:var(--raised);border-radius:12px;font-size:13.5px;line-height:1.5"></div><div class="row" style="justify-content:space-between"><button class="btn ink mic" style="display:inline-flex;align-items:center;gap:8px;min-height:40px;border-radius:10px;touch-action:none"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>Hold to talk</button><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="tr" checked> Transcript</label></div></div><div class="hint">Hold the button, then release</div>`,
  desc:'Bars pulse live off the clock while held. On release they spring back and the transcript bubble swaps in as the terminal state.',
  api:'held: bar[i] = rest + live·pulse(t·9 − i·0.55)   release: live.set(0, S.soft), tx.swap.to(1)',
  init(st){
    const N = 14, bars = $(st,'.bars'), tx = $(st,'.tx'), mic = $(st,'.mic'), tr = $(st,'.tr');
    const els = [];
    for (let i = 0; i < N; i++){ const b = document.createElement('i'); b.style.cssText = 'width:4px;border-radius:2px;background:var(--ink);height:6px'; bars.appendChild(b); els.push(b); }
    const L = ['', 'Ship it Thursday. QA signed off.'].map(s => { const e = document.createElement('span'); e.className = 'layer'; e.style.cssText += ';justify-content:flex-start;padding:8px 12px;white-space:normal;text-align:left'; e.textContent = s; tx.appendChild(e); return e; });
    const live = new Track(0, S.snap), sw = new Swap(0), th = new Track(0);
    let downAt = 0;
    mic.onpointerdown = e => { mic.setPointerCapture(e.pointerId); downAt = now(); live.set(1, S.snap); };
    const up = () => { if (!live.target) return; const t = now();
      if (REDUCE){ live.jump(0); sw.cur = tr.checked ? 1 : 0; sw.prev = null; sw.t = -9; th.jump(tr.checked ? 56 : 0); }
      else { live.set(0, S.soft); th.set(tr.checked ? 56 : 0, S.soft, t + .08); if (tr.checked) sw.to(1); else sw.to(0); } };
    mic.onpointerup = up; mic.onpointercancel = up;
    return t => { const a = clamp(live.at(t));
      els.forEach((b,i) => { const p = REDUCE ? (i % 3 === 0 ? .5 : .2) : (.5 + .5*Math.sin(t*9 - i*.55));
        const hh2 = 6 + a*30*p + (1-a)*2*(i % 2); b.style.height = px(hh2); b.style.opacity = (.35 + .65*(.3 + .7*a*p)).toFixed(3); });
      tx.style.height = px(Math.max(0, th.at(t))); L.forEach((e,k) => sw.apply(e,k,t)); };
  }});

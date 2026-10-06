
atom({ id:'memtoggle', cat:'AI chat', name:'Memory toggle', block:'chat, memory', fam:['E','M','S'],
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:10px"><b style="font-size:15px;font-weight:600;line-height:1.5">Memory</b><div class="row" style="justify-content:space-between;gap:10px"><span style="font-size:13.5px;line-height:1.5">Remember details</span><button class="tg" role="switch" aria-checked="false" aria-label="Remember details" style="position:relative;width:64px;height:36px;border-radius:18px;border:0;padding:0;cursor:pointer;background:var(--raised);flex:none"></button></div><div class="chipw" style="overflow:hidden;align-self:flex-start;max-width:100%"><span class="chipin" style="display:inline-flex;align-items:center;gap:8px;background:var(--raised);border-radius:12px;padding:8px 12px;font-size:13px;white-space:nowrap"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="transform:translateY(.5px)"><path d="M6 3h12v18l-6-4-6 4z"/></svg><span>Prefers morning standup</span></span></div><span class="mc small" style="position:relative;display:block;height:20px;font-size:12px"></span><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="ss" checked> Show source</label></div><div class="hint">Flip the switch to save the fact</div>`,
  desc:'The knob slides with trailing edges on base. The saved-fact chip opens its width first, then the text fades in as the terminal state.',
  api:'knob.go(l, r) edges trail 60ms   chip.w.set(W, S.base), text.o→1 at t + exit',
  init(st){
    const tg = $(st,'.tg'), chipw = $(st,'.chipw'), chipin = $(st,'.chipin'), mc = $(st,'.mc'), ss = $(st,'.ss');
    const kn = document.createElement('span'); kn.style.cssText = 'position:absolute;top:4px;left:0;height:28px;border-radius:14px;background:var(--card);box-shadow:var(--shadow)'; tg.appendChild(kn);
    const src = document.createElement('span'); src.className = 'muted'; src.style.cssText = 'display:block;font-size:12px;margin-top:2px'; src.textContent = 'from yesterday’s chat'; chipin.appendChild(src);
    const M = ['Memory off — nothing saved','Saved to memory'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; if (i){ e.style.color = 'var(--success)'; } else { e.style.color = 'var(--muted)'; } mc.appendChild(e); return e; });
    const OFF = [4,32], ON = [32,60], e = edges(...OFF), w = new Track(0), o = new Track(0), fl = new Track(0), sw = new Swap(0);
    let on = false, W = 0;
    requestAnimationFrame(() => { chipw.style.width = 'auto'; W = chipin.offsetWidth; chipw.style.width = '0px'; w.jump(0); });
    const flip = () => { on = !on; const t = now(); tg.setAttribute('aria-checked', on);
      if (REDUCE){ on ? e.jump(...ON) : e.jump(...OFF); fl.jump(on ? 1 : 0); w.jump(on ? W : 0); o.jump(on ? 1 : 0); sw.cur = on ? 1 : 0; sw.prev = null; sw.t = t; }
      else { e.go(...(on ? ON : OFF)); fl.set(on ? 1 : 0); w.set(on ? W : 0, S.base); o.set(on ? 1 : 0, S.base, t + EXIT); sw.to(on ? 1 : 0); } };
    tg.onclick = flip;
    tg.onkeydown = ev => { if (ev.key === ' ' || ev.key === 'Enter'){ ev.preventDefault(); flip(); } };
    return t => { const l = e.A.at(t), r = e.B.at(t);
      kn.style.transform = `translateX(${px(l)})`; kn.style.width = px(Math.max(0, r - l));
      tg.style.background = mix(clamp(fl.at(t)), 'var(--ink)', 'var(--raised)');
      chipw.style.width = px(Math.max(0, w.at(t))); fade(chipin, o.at(t), 0);
      src.style.display = ss.checked ? 'block' : 'none';
      M.forEach((el,k) => sw.apply(el,k,t)); };
  }});

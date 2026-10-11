

atom({ id:'fbeacon', cat:'Guidance', name:'Feature beacon', block:'feature hint, whats-new', fam:['X','M','T'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="ui card" style="position:relative;width:min(340px,94%);padding:14px 16px;min-height:230px" tabindex="0"><b style="font-size:15px;font-weight:600;line-height:1.5">Projects</b><div class="small muted" style="line-height:1.5">Three active, one new trick.</div><div class="row" style="gap:10px;margin-top:10px;padding:10px 0;border-top:1px solid var(--line-soft)"><button class="dot" aria-label="Show the new feature" style="position:relative;width:30px;height:30px;border-radius:50%;border:0;background:var(--accent);display:grid;place-items:center;padding:0;cursor:pointer;flex:none"><span class="ring" style="position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--accent)"></span><span class="glyph" style="position:relative;width:10px;height:10px"><span class="d1" style="position:absolute;inset:0;border-radius:50%;background:var(--card)"></span><span class="d2" style="position:absolute;inset:0;border-radius:50%;background:var(--card);display:grid;place-items:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="transform:translateY(.5px)"><path d="M5 12.5 10 17.5 19 7"/></svg></span></span></button><span class="col" style="gap:0"><b style="font-size:14px;line-height:1.5">Bulk actions <span style="font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-tint);border-radius:99px;padding:1px 8px">New</span></b><span class="cap" style="font-size:12px;color:var(--muted);line-height:1.5">Select rows, act once.</span></span></div><div class="hb" style="position:absolute;left:12px;right:12px;bottom:12px;background:var(--card);border-radius:10px;box-shadow:var(--shadow);padding:12px 14px;visibility:hidden"><b style="font-size:13px;line-height:1.5">Bulk actions are here</b><div class="small muted" style="line-height:1.5">Tick any two rows, then archive both at once.</div><div class="row" style="gap:6px;margin-top:8px"><button class="btn ink got" style="min-height:32px;padding:6px 12px">Got it</button><button class="btn esc" style="min-height:32px;padding:6px 12px">Esc</button></div></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Pulse:</span></div></div><div class="hint">Click the dot · Esc closes fast · Got it checks the dot</div>`,
  desc:'The dot breathes on a soft loop. Clicking springs the hint open and freezes the pulse; Esc snaps it shut. Got it closes and checks the dot, a success terminal that holds.',
  api:'pulse = soft loop, frozen while open   hint.o.set(1, base) / set(0, snap)   got it: seen.set(1) · REDUCE: still',
  init(st){
    const ui = $(st,'.ui'), dot = $(st,'.dot'), ring = $(st,'.ring'), hb = $(st,'.hb'), tw = $(st,'.tw');
    const d1 = $(st,'.d1'), d2 = $(st,'.d2');
    const o = new Track(0), seen = new Track(0); let open = false, pulse = true; const t0 = now();
    const show = () => { open = true; REDUCE ? o.jump(1) : o.set(1, S.base); };
    const hide = snap => { open = false; snap || REDUCE ? o.jump(0) : o.set(0, S.snap); };
    dot.onclick = e => { e.stopPropagation(); open ? hide() : show(); };
    $(st,'.got').onclick = e => { e.stopPropagation(); hide(); REDUCE ? seen.jump(1) : seen.set(1); };
    $(st,'.esc').onclick = e => { e.stopPropagation(); hide(true); ui.focus(); };
    ui.addEventListener('keydown', e => { if (e.key === 'Escape' && open){ e.stopPropagation(); hide(true); } });
    [['On',true],['Off',false]].forEach(([label,v]) => { const b = document.createElement('button'); b.className = 'btn' + (v ? ' ink' : ''); b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = label; b.setAttribute('aria-pressed', v); b.onclick = () => { pulse = v; $$(tw,'.btn').forEach(x => { const on = x === b; x.classList.toggle('ink', on); x.setAttribute('aria-pressed', on); }); }; tw.appendChild(b); });
    return t => { pop(hb, o.at(t), 6);
      const s = clamp(seen.at(t)); d1.style.opacity = (1 - s).toFixed(3); d2.style.opacity = s.toFixed(3);
      const live = (pulse && !open && !REDUCE) ? (0.5 + 0.5*Math.sin((t - t0)*3.2)) : 0;
      ring.style.opacity = (live * .7 * (1 - s)).toFixed(3); ring.style.transform = `scale(${(1 + live*.28).toFixed(3)})`;
      dot.style.background = mix(s,'var(--success)','var(--accent)'); };
  }});

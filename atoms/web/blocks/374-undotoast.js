

atom({ id:'undotoast', cat:'Guidance', name:'Undo toast', block:'undo, archive', fam:['X','S','T'], tall:true,
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="ui card" style="position:relative;width:min(320px,94%);padding:14px 16px;min-height:210px;overflow:hidden"><b style="font-size:15px;font-weight:600;line-height:1.5">Roadmap</b><div class="small muted" style="line-height:1.5">Archive a step — it waits behind the toast.</div><div class="itwrap" style="overflow:hidden;margin-top:8px"><div class="it row" style="gap:10px;padding:8px 0;min-height:32px"><span style="display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--accent-tint);padding:0;flex:none;font-size:13px;font-weight:600;color:var(--accent)"><span style="transform:translateY(-.5px)">Q3</span></span><span class="col" style="gap:0;flex:1"><b style="font-size:14px;line-height:1.5">Launch checklist</b><span class="cap" style="font-size:12px;color:var(--muted);line-height:1.5">4 of 4 · ships Friday</span></span><span class="ck" style="position:relative;display:inline-block;width:18px;height:14px"><span class="layer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg></span></span><button class="btn ar" style="min-height:32px;padding:6px 12px">Archive</button></div></div><div class="ts" style="position:absolute;left:12px;right:12px;bottom:12px;background:var(--ink);color:var(--card);border-radius:10px;padding:10px 12px;visibility:hidden"><div class="row" style="gap:10px"><span style="position:relative;width:20px;height:20px;flex:none;display:grid;place-items:center;padding:0"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,.25)" stroke-width="2.5"/><circle class="ring" cx="10" cy="10" r="8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" pathLength="1" stroke-dasharray="1" transform="rotate(-90 10 10)"/></svg></span><span style="font-size:13px;line-height:1.5;flex:1">Step archived</span><button class="btn un" style="min-height:32px;padding:6px 12px;background:transparent;color:var(--card);border-color:rgba(255,255,255,.4)">Undo</button></div></div></div><div class="tw row small muted" style="gap:6px"><span style="font-size:12px">Demo:</span></div></div><div class="hint">Archive parks the step · the ring drains in 6s</div>`,
  desc:'Archiving collapses the step on a height spring while the toast rises; its ring drains over six seconds. Undo restores the height and swaps a check in. Expiry or Undo both land in a quiet terminal.',
  api:'item.h.set(0) parks behind   toast.o.set(1, base) + ring 6s   undo: h.set(full), check.to(1) · REDUCE: jump',
  init(st){
    const wrap = $(st,'.itwrap'), it = $(st,'.it'), ts = $(st,'.ts'), ring = $(st,'.ring'), tw = $(st,'.tw');
    const h = new Track(200), o = new Track(0), ck = new Swap(0); let gone = false, tArch = -99; const DUR = 6;
    const full = () => it.scrollHeight || 60;
    const archive = () => { if (gone) return; gone = true; tArch = now(); const R = REDUCE;
      R ? h.jump(0) : h.set(0, S.soft); R ? o.jump(1) : o.set(1, S.base);
      if (R){ ck.cur = 0; ck.prev = null; ck.t = -9; } else ck.to(0); };
    const undo = () => { if (!gone) return; gone = false; const R = REDUCE;
      R ? h.jump(full()) : h.set(full(), S.soft); R ? o.jump(0) : o.set(0, S.snap);
      if (R){ ck.cur = 1; ck.prev = null; ck.t = -9; } else ck.to(1); };
    $(st,'.ar').onclick = archive; $(st,'.un').onclick = undo;
    const rb = document.createElement('button'); rb.className = 'btn'; rb.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; rb.textContent = 'Replay archive';
    rb.onclick = () => { gone = false; h.jump(full()); o.jump(0); ck.cur = 0; ck.prev = null; ck.t = -9; archive(); }; tw.appendChild(rb);
    document.fonts.ready.then(() => h.jump(gone ? 0 : full()));
    return t => { const hh = Math.max(0, h.at(t)); wrap.style.height = px(hh); wrap.style.opacity = clamp(hh/40).toFixed(3);
      if (gone && !REDUCE && t - tArch > DUR && clamp(o.at(t)) > .5) o.set(0, S.snap);
      ts.style.left = '12px'; ts.style.right = '12px'; pop(ts, o.at(t), 8);
      const p = REDUCE ? (gone ? 1 : 0) : clamp((t - tArch)/DUR);
      ring.style.strokeDashoffset = gone ? (p).toFixed(3) : 0;
      ring.style.opacity = gone ? 1 : 0;
      ck.apply($$(st,'.ck .layer')[0], 1, t);
      it.style.visibility = hh < 4 && gone ? 'hidden' : 'visible'; };
  }});

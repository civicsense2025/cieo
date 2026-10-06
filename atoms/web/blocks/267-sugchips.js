
/* ---------- AI chat ---------- */
atom({ id:'sugchips', cat:'AI chat', name:'Suggestion chips', block:'chat, prompts', fam:['S','M','T'], tall:true,
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.5">Draft a launch note</b><div style="align-self:flex-start;max-width:75%;background:var(--raised);color:var(--ink);border-radius:12px;padding:8px 12px;font-size:13.5px;line-height:1.5">Pick a tone to start.</div><div class="cprow" style="display:flex;gap:6px;overflow:hidden"></div><div class="ub" style="position:relative;align-self:flex-end;min-width:132px;max-width:75%;overflow:hidden;background:var(--ink);color:var(--card);border-radius:12px;font-size:13.5px"></div><div class="rb small" style="align-self:flex-start;max-width:75%;overflow:hidden;background:var(--raised);border-radius:12px;line-height:1.55">Draft ready in a playful voice. Say the word and I will tune it.</div><div class="row" style="justify-content:space-between"><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="stg" checked> Stagger chips in</label><button class="btn rs" style="min-height:32px;border-radius:9px">Reset</button></div></div><div class="hint">Tap a chip</div>`,
  desc:'Chips stagger in 40ms apart. The tapped chip morphs into your bubble while siblings blur out, and the reply fades up as the terminal state.',
  api:'chip[i] in at t0 + i·0.04 (S.base)   tap: sib.o→0, ub.swap.to(i), reply.o→1 at t + 0.5',
  init(st){
    const TONES = ['Playful','Formal','Shorter'], SAID = ['Make it playful','Keep it formal','Make it shorter'];
    const row = $(st,'.cprow'), ub = $(st,'.ub'), rb = $(st,'.rb'), stg = $(st,'.stg');
    const chips = TONES.map(s => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = s; b.style.cssText += ';min-height:32px;border-radius:9px;white-space:nowrap'; row.appendChild(b); return b; });
    const L = SAID.map(s => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = s; ub.appendChild(e); return e; });
    const sw = new Swap(-1), sib = new Track(1, S.snap), hh = new Track(0), uh = new Track(0), uo = new Track(0), rh = new Track(0), ro = new Track(0);
    let picked = -1, t0 = now(); const q = [];
    const RH = 62;
    hh.jump(row.offsetHeight || 46);
    const pick = i => { if (picked >= 0) return; picked = i; const t = now();
      if (REDUCE){ sw.cur = i; sw.prev = null; sw.t = -9; sib.jump(0); hh.jump(0); uh.jump(36); uo.jump(1); rh.jump(RH); ro.jump(1); }
      else { sw.to(i); sib.set(0); hh.set(0, S.base, t + .06); uh.set(36, S.base, t + .1); uo.set(1, S.base, t + .1); rh.set(RH, S.base, t + .5); q.push([t + .62, () => ro.set(1, S.base)]); } };
    chips.forEach((b,i) => b.onclick = () => pick(i));
    $(st,'.rs').onclick = () => { picked = -1; q.length = 0; t0 = now(); sw.to(-1);
      if (REDUCE){ sib.jump(1); hh.jump(row.scrollHeight || 46); uh.jump(0); uo.jump(0); rh.jump(0); ro.jump(0); }
      else { sib.set(1); hh.set(row.scrollHeight || 46, S.base); uh.set(0, S.base); uo.set(0, S.snap); rh.set(0, S.base); ro.set(0, S.snap); } };
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const s = clamp(sib.at(t));
      chips.forEach((b,i) => { const e = (stg.checked && !REDUCE) ? clamp(prog(t, t0 + i*.04, S.base)) : 1; fade(b, e*s, (1-e)*6); b.style.pointerEvents = picked >= 0 ? 'none' : 'auto'; });
      row.style.height = px(Math.max(0, hh.at(t))); row.style.opacity = s.toFixed(3);
      ub.style.height = px(Math.max(0, uh.at(t))); ub.style.opacity = clamp(uo.at(t)).toFixed(3); ub.style.visibility = uo.at(t) > .02 ? 'visible' : 'hidden';
      L.forEach((e,k) => sw.apply(e,k,t));
      rb.style.height = px(Math.max(0, rh.at(t))); fade(rb, ro.at(t), 8); };
  }});

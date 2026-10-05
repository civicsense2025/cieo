

atom({ id:'pullrefresh', cat:'Files and browsing', name:'Pull to refresh', block:'entry-list, postlist (mobile)', fam:['D','M'], tall:true,
  html:`<div class="pr card" style="position:relative;width:min(260px,82%);height:290px;overflow:hidden;touch-action:none;cursor:grab"><div class="sp" style="position:absolute;left:0;right:0;top:0;height:56px;display:grid;place-items:center;color:var(--muted)"><span class="ar" style="display:grid"></span></div><div class="ls" style="position:relative;background:var(--card)"></div></div><div class="hint">Drag the list down and let go</div>`,
  desc:'The list follows the pull with growing resistance while the arrow turns to say “release”. Past the threshold it holds open on a spinner, a new item arrives, and the list springs shut.',
  api:'y = rb(pull, 80)   arrow.rot = clamp(y/70)·180   release > 70: hold 56 → load → 0',
  init(st){
    const pr = $(st,'.pr'), ls = $(st,'.ls'), ar = $(st,'.ar'); let n = 0;
    const row = (txt, fresh) => { const r = document.createElement('div'); r.style.cssText = 'padding:12px 14px;border-bottom:1px solid var(--line-soft)'; r.innerHTML = `<b class="small" style="display:block">${txt}</b><span class="small muted">${fresh ? 'just now' : 'earlier'}</span>`; ls.prepend(r); return r; };
    ['Harbor at 6am','On member pricing','Three CSS habits','A smaller homepage','Fog bank'].forEach(s => row(s));
    const y = new Track(0); let held = false, hy = 0, sy = 0, state = 'idle', until = 0, fresh = null, fo = new Track(1);
    ar.innerHTML = ic('<path d="M12 5v14M6 13l6 6 6-6"/>',18,2.25) ; const spinner = document.createElement('span'); spinner.innerHTML = ic('<path d="M12 3a9 9 0 0 1 9 9"/>',18,2.5); spinner.style.cssText = 'position:absolute;display:none'; ar.parentNode.appendChild(spinner);
    drag(pr, { down:p => { if (state !== 'idle') return; held = true; sy = p.cy; hy = 0; }, move:p => { if (held) hy = rb(Math.max(0, p.cy - sy), 80); },
      up:(p, v) => { if (!held) return; held = false; if (hy > 52){ state = 'load'; y.release(hy, v.vy, 56); until = now() + 1.2; } else y.release(hy, v.vy, 0); } });
    return t => { if (state === 'load' && t >= until){ state = 'idle'; y.set(0); const r = row(`New post ${++n}`, true); fresh = r; fo.jump(0).set(1, S.base, t + .1); }
      const v = held ? hy : y.at(t); ls.style.transform = `translateY(${px(v)})`; const k = clamp(v/52);
      ar.style.transform = `rotate(${(k*180).toFixed(1)}deg)`; ar.style.opacity = state === 'load' ? 0 : k.toFixed(3); spinner.style.display = state === 'load' ? 'grid' : 'none'; spinner.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
      if (fresh){ const f = clamp(fo.at(t)); fresh.style.background = mix((1 - f)*.6 + 0,'var(--accent-tint)','var(--card)'); fade(fresh.firstChild, f, null); } };
  }});
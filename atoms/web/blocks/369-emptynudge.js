

atom({ id:'emptynudge', cat:'Guidance', name:'Empty nudge', block:'empty state, onboarding', fam:['S','T','M'],
  html:`<div class="col" style="gap:8px;align-items:center;width:100%"><div class="es card" style="width:min(320px,94%);padding:16px;text-align:center;position:relative"><div class="art" style="display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--accent-tint);padding:0;margin:0 auto"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="transform:translateY(.5px)"><path d="M3 7h18v13H3zM3 7l2-4h14l2 4M9 12h6"/></svg></div><div class="tt" style="position:relative;min-height:76px;margin-top:8px"></div><button class="btn ink cta" style="min-height:32px;padding:6px 14px;margin-top:8px">Create a report</button><div class="tw row small muted" style="gap:6px;justify-content:center;margin-top:8px"><span style="font-size:12px">Tips:</span></div></div></div><div class="hint">Empty breathes · CTA nudges once · tips rotate</div>`,
  desc:'The empty art breathes on a slow clock while the CTA rings once, then goes quiet. Tips rotate underneath on a timer. Creating a report swaps the whole card to a success terminal that holds.',
  api:'breathe = sin(clock) · pulse = once(t - t0)   tips.to(floor(t / 3.2s))   cta: main.to(done) · REDUCE: still',
  init(st){
    const tt = $(st,'.tt'), art = $(st,'.art'), cta = $(st,'.cta'), tw = $(st,'.tw');
    const TIPS = ['Reports land here every Monday.', 'Invite a teammate to share the load.', 'Star one metric to watch it closely.'];
    const L = TIPS.map(p => { const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += 'flex-direction:column;gap:2px;white-space:normal;text-align:center'; e.innerHTML = `<b style="font-size:15px;font-weight:600;line-height:1.5">No reports yet</b><span class="small muted" style="line-height:1.5">${p}</span>`; tt.appendChild(e); return e; });
    const fin = document.createElement('div'); fin.className = 'layer'; fin.style.cssText += 'flex-direction:column;gap:4px;white-space:normal;text-align:center'; fin.innerHTML = `<b style="font-size:15px;font-weight:600;color:var(--success);line-height:1.5">First report queued ✓</b><span class="small muted" style="line-height:1.5">It will land here on Monday morning.</span><span><button class="btn rp" style="min-height:32px;padding:6px 12px">Start over</button></span>`; tt.appendChild(fin); L.push(fin);
    const sw = new Swap(0), main = new Swap(0); let tip = 0, breathe = true; const t0 = now();
    TIPS.forEach((p,k) => { const b = document.createElement('button'); b.className = 'btn' + (k === 0 ? ' ink' : ''); b.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; b.textContent = k + 1; b.onclick = () => { tip = k; pool(); if (REDUCE){ sw.cur = k; sw.prev = null; sw.t = -9; } else sw.to(k); }; tw.appendChild(b); });
    const pool = () => $$(tw,'.btn').forEach((x,j) => x.classList.toggle('ink', j === tip));
    const br = document.createElement('button'); br.className = 'btn ink'; br.style.cssText += 'min-height:32px;padding:6px 10px;font-size:12px'; br.textContent = 'Air: on'; br.setAttribute('aria-pressed','true');
    br.onclick = () => { breathe = !breathe; br.textContent = breathe ? 'Air: on' : 'Air: off'; br.classList.toggle('ink', breathe); br.setAttribute('aria-pressed', breathe); }; tw.appendChild(br);
    cta.onclick = () => REDUCE ? (main.cur = 1, main.prev = null, main.t = -9) : main.to(1);
    fin.querySelector('.rp').onclick = () => { REDUCE ? (main.cur = 0, main.prev = null, main.t = -9) : main.to(0); };
    const E = L.slice(0, 3), F = [fin];
    return t => { const done = main.cur === 1;
      if (!done && !REDUCE){ const k = Math.floor((t - t0)/3.2) % 3; if (k !== tip){ tip = k; sw.to(k); pool(); } }
      const p = REDUCE ? 0 : (t - t0 < 1.4 && !done ? Math.sin(Math.PI * (t - t0)/1.4) : 0);
      cta.style.boxShadow = p > .02 ? `0 0 0 ${(p*7).toFixed(1)}px color-mix(in oklab, var(--accent) ${(p*38).toFixed(0)}%, transparent)` : 'none';
      const br2 = (breathe && !REDUCE && !done) ? 1 + .025*Math.sin((t - t0)*2.2) : 1;
      art.style.transform = `scale(${br2.toFixed(4)})`;
      E.forEach((el,k) => { if (done){ el.style.opacity = 0; el.style.visibility = 'hidden'; } else sw.apply(el,k,t); });
      F.forEach(el => main.apply(el, 1, t));
      cta.style.display = done ? 'none' : ''; };
  }});

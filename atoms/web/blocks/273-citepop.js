
atom({ id:'citepop', cat:'AI chat', name:'Citation popover', block:'chat, citations', fam:['X','M','S'],
  html:`<div class="card col" style="position:relative;width:min(340px,calc(100% - 24px));padding:14px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.5">Yearly pricing wins</b><p style="margin:0;font-size:13.5px;line-height:1.6">Teams on yearly plans renew 23% more often <button class="c1" aria-label="Source 1" style="display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 5px;border-radius:8px;border:0;background:var(--raised);font-size:12px;cursor:pointer;vertical-align:2px">1</button> and support costs fall <button class="c2" aria-label="Source 2" style="display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 5px;border-radius:8px;border:0;background:var(--raised);font-size:12px;cursor:pointer;vertical-align:2px">2</button>.</p><div class="panel card col" style="position:absolute;left:12px;right:12px;bottom:12px;padding:6px 12px;gap:0;visibility:hidden;transform-origin:50% 100%"></div><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="sg" checked> Stagger sources</label></div><div class="hint">Tap a number, tap outside to close</div>`,
  desc:'The number pops on snap while the panel grows on base. Sources stagger 30ms apart, and tapping outside closes everything faster.',
  api:'num.pop snap, panel.p.set(1, S.base)   src[i] at t0 + i·0.03   outside: p.set(0, S.snap)',
  init(st){
    const SRC = [['Pricing benchmarks 2026','studio.co/benchmarks'],['Renewal data, Q1','studio.co/renewals'],['Support cost review','studio.co/support']];
    const panel = $(st,'.panel'), sg = $(st,'.sg');
    const rows = SRC.map(([t2,d],i) => { const r = document.createElement('div'); r.style.cssText = 'display:flex;flex-direction:column;gap:0;padding:8px 0' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      r.innerHTML = `<span style="font-size:13px;line-height:1.5">${i+1}. ${t2}</span><span class="muted" style="font-size:12px">${d}</span>`; panel.appendChild(r); return r; });
    const p = new Track(0), pop = new Track(0); let open = -1, t0 = 0, popEl = null; const q = [];
    const openFor = (i, el) => { open = i; t0 = now(); popEl = el;
      if (REDUCE){ p.jump(1); pop.jump(0); } else { p.set(1, S.base); pop.set(1, S.snap); q.push([t0 + .18, () => pop.set(0, S.snap)]); } };
    const close = fast => { if (open < 0) return; open = -1;
      if (REDUCE || fast) p.set(0, S.snap); else p.set(0, S.base); };
    [$(st,'.c1'), $(st,'.c2')].forEach((b,i) => b.onclick = ev => { ev.stopPropagation(); open === i ? close(true) : openFor(i, b); });
    st.addEventListener('click', ev => { if (open >= 0 && !panel.contains(ev.target)) close(true); });
    st.addEventListener('keydown', ev => { if (ev.key === 'Escape') close(true); });
    return t => { while (q.length && q[0][0] <= t) q.shift()[1]();
      const v = clamp(p.at(t)), s = clamp(pop.at(t));
      panel.style.opacity = v.toFixed(3); panel.style.visibility = v < .01 ? 'hidden' : 'visible';
      panel.style.transform = `translateY(${((1-v)*8).toFixed(2)}px) scale(${(.97 + .03*v).toFixed(4)})`;
      if (popEl) popEl.style.transform = `scale(${(1 + .3*s).toFixed(3)})`;
      rows.forEach((r,i) => { const e = (sg.checked && !REDUCE) ? clamp(prog(t, t0 + EXIT + i*.03, S.base)) : 1; fade(r, open < 0 ? v : e*v, (1-e)*8); }); };
  }});

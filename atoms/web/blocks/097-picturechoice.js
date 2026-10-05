

atom({ id:'picturechoice', cat:'Forms', name:'Picture choice', block:'form (image choice)', fam:['M','X'], tall:true,
  html:`<div class="pc" role="radiogroup" aria-label="Pick a starter" tabindex="0" style="display:grid;grid-template-columns:repeat(2,130px);gap:10px"></div><div class="hint">Click, or press A to D</div>`,
  desc:'Choosing a card presses it in slightly, inks its border and pops a check badge in the corner. Letter keys pick an option, as in conversational forms.',
  api:'card.sel.set(1); badge.o.set(1, S.base, t + 0.05)   keys A–D',
  init(st){
    const pc = $(st,'.pc'), O = [['Journal','var(--ink)'],['Portfolio','var(--accent)'],['Shop','var(--muted)'],['Newsletter','var(--faint)']];
    const it = O.map(([n,c],i) => { const b = document.createElement('button'); b.setAttribute('role','radio'); b.style.cssText = 'position:relative;border:2px solid var(--line);border-radius:12px;background:var(--card);padding:6px;cursor:pointer;text-align:left';
      b.innerHTML = `<span style="display:block;height:64px;border-radius:8px;overflow:hidden">${`<svg viewBox="0 0 100 60" preserveAspectRatio="none" width="100%" height="100%"><rect width="100" height="60" fill="${c}"/><rect x="10" y="10" width="40" height="6" rx="3" fill="var(--card)" opacity=".7"/><rect x="10" y="22" width="80" height="4" rx="2" fill="var(--card)" opacity=".35"/><rect x="10" y="30" width="64" height="4" rx="2" fill="var(--card)" opacity=".35"/></svg>`}</span><span class="row small" style="gap:6px;padding:6px 2px 2px"><kbd style="font:600 11px var(--sans);border:1px solid var(--line);border-radius:4px;padding:0 4px">${'ABCD'[i]}</kbd>${n}</span><span class="bd" style="position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:var(--ink);color:var(--card);display:grid;place-items:center">${ic(I.check,12,3)}</span>`;
      pc.appendChild(b); return { b, bd:$(b,'.bd'), s:new Track(0), o:new Track(0), pr:new Track(0, S.snap) }; });
    const pick = i => { const t0 = now(); it.forEach((x,j) => { x.s.set(j === i ? 1 : 0); x.o.set(j === i ? 1 : 0, j === i ? S.base : S.snap, t0 + (j === i ? .05 : 0)); x.b.setAttribute('aria-checked', j === i); }); it[i].pr.jump(1).set(0); };
    it.forEach((x,i) => x.b.onclick = () => pick(i));
    st.addEventListener('keydown', e => { const i = 'abcd'.indexOf(e.key.toLowerCase()); if (i >= 0 && !e.metaKey && !e.ctrlKey){ pick(i); it[i].b.focus(); } });
    return t => it.forEach(x => { const s = clamp(x.s.at(t)), o = clamp(x.o.at(t)), p = clamp(x.pr.at(t)); x.b.style.borderColor = mix(s,'var(--ink)','var(--line)'); x.b.style.transform = `scale(${(1 - .03*p).toFixed(4)})`; x.bd.style.opacity = o.toFixed(3); x.bd.style.transform = `scale(${(.5+.5*o).toFixed(3)})`; });
  }});


/* ---------- Foundations ---------- */
atom({ id:'step', cat:'Foundations', name:'Spring presets', block:'every block', fam:['T'],
  html:`<div class="col" style="width:min(340px,86%);gap:16px">${['snap · ω34','base · ω22','soft · ω15','lazy · ω9'].map(l=>`<div style="position:relative;height:16px;border-bottom:1px dashed var(--line)"><b style="position:absolute;left:0;top:0;width:14px;height:14px;border-radius:50%;background:var(--ink)"></b><i class="small muted" style="position:absolute;right:0;top:-18px;font-style:normal">${l}</i></div>`).join('')}</div><div class="hint">Click to send all four</div>`,
  desc:'Critically damped step responses solved in closed form. No integration, no drift, no overshoot.',
  api:'x = to + resp(t − t0, from − to, v0, S.base)',
  init(st){
    const dots = $$(st,'b'), tr = [S.snap,S.base,S.soft,S.lazy].map(c => new Track(0,c));
    st.setAttribute('role', 'button'); st.tabIndex = 0; st.setAttribute('aria-label', 'Send all four springs');
    const go = () => tr.forEach(x => x.set(x.target ? 0 : 1));
    st.onclick = go;
    st.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); } };
    return t => { const w = dots[0].parentNode.clientWidth - 14; tr.forEach((x,i) => dots[i].style.transform = `translateX(${px(x.at(t)*w)})`); };
  }});


atom({ id:'retarget', cat:'Foundations', name:'Retarget as a sum', block:'every block', fam:['T'],
  html:`<div style="position:absolute;left:8%;right:8%;top:50%;height:2px;background:var(--line)"></div><div class="puck" style="position:absolute;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:var(--ink)"></div><div class="ro">springs in sum: <span>0</span></div><div class="hint">Click quickly in different places</div>`,
  desc:'Each new target adds one spring from its own start time. The value stays a pure sum you can scrub or render offline.',
  api:'value(t) = to + Σ resp(t − tᵢ, prevᵢ − toᵢ, 0, cfg)',
  init(st){
    const puck = $(st,'.puck'), n = $(st,'.ro span'), x = new Track(.5, S.soft);
    st.onpointerdown = e => { const r = st.getBoundingClientRect(); x.set(clamp(((e.clientX - r.left)/r.width - .08)/.84)); };
    return t => { const W = st.clientWidth; puck.style.left = px(W*.08 + x.at(t)*W*.84); n.textContent = x.prune(t); };
  }});
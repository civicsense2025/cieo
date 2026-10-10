

atom({ id:'conversational', cat:'Forms', name:'One question at a time', block:'form (conversational)', fam:['S','M','T'], wide:true, tall:true,
  html:`<div class="cv" style="position:relative;width:min(560px,94%);height:250px"></div><div class="pg" style="position:absolute;left:16px;right:16px;bottom:10px;height:3px;border-radius:2px;background:var(--raised);overflow:hidden"><i style="display:block;height:100%;background:var(--ink)"></i></div>`,
  desc:'Each answer moves the question up and out while the next rises from below. Choices take letter keys and confirm with a short pulse before advancing. Enter submits text, and the progress bar fills per answer.',
  api:'q.to(i)   enter y +24 → 0, exit 0 → −24   pulse, then advance at t + 0.45',
  init(st){
    const cv = $(st,'.cv'), pg = $(st,'.pg i');
    const Q = [{ t:'text', q:'First, what’s your name?', ph:'Type your answer here…' }, { t:'choice', q:'Which plan fits your team?', o:['Starter','Studio','Business'] }, { t:'choice', q:'Need help migrating content?', o:['Yes','No'] }, { t:'end' }];
    let name = '';
    const panes = Q.map((q,i) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:0 8px';
      const num = `<span class="small muted">${i + 1} →</span>`;
      if (q.t === 'text') d.innerHTML = `${num}<b style="font-size:22px;letter-spacing:-.02em">${q.q}</b><input id="cv-name" placeholder="${q.ph}" autocomplete="off" style="border:0;border-bottom:2px solid var(--line);background:none;color:var(--ink);font:20px var(--sans);padding:6px 0;outline:none"><div class="row"><button class="btn ink ok">OK ${ic(I.check,13,3)}</button><span class="small muted">press <b>Enter ↵</b></span><span class="er small" style="color:var(--danger);opacity:0">Please fill this in</span></div>`;
      else if (q.t === 'choice') d.innerHTML = `${num}<b style="font-size:22px;letter-spacing:-.02em">${q.q}</b><div class="col" style="gap:6px;max-width:260px">${q.o.map((o,j) => `<button class="opt" style="display:flex;align-items:center;gap:10px;border:1.5px solid var(--line);border-radius:9px;background:var(--card);padding:7px 10px;cursor:pointer;text-align:left;font-size:15px"><kbd style="font:600 11px var(--sans);border:1px solid var(--line);border-radius:4px;padding:0 5px">${'ABC'[j]}</kbd>${o}</button>`).join('')}</div>`;
      else d.innerHTML = `<div class="row" style="gap:12px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path class="ck" d="M7.5 12.5 10.5 15.5 16.5 9" pathLength="1" stroke-dasharray="1"/></svg><b class="thx" style="font-size:22px;letter-spacing:-.02em"></b></div><span class="small muted">We’ll email your migration checklist shortly.</span><button class="btn again" style="align-self:flex-start">Start again</button>`;
      cv.appendChild(d); return d; });
    const sw = new Swap(0), prog2 = new Track(0); let cur = 0, pulse = null, adv = 0, tEnd = 0;
    const go = i => { cur = i; sw.to(i); prog2.set(i/(Q.length - 1)); if (Q[i].t === 'text') setTimeout(() => $(panes[i],'input').focus({ preventScroll:true }), 120); if (Q[i].t === 'end'){ tEnd = now(); $(panes[i],'.thx').textContent = `Thanks, ${name.split(' ')[0]}.`; } };
    const inp = $(panes[0],'input'), er = $(panes[0],'.er'), eT = new Track(0);
    const submitText = () => { if (!inp.value.trim()){ eT.set(1); inp.setAttribute('aria-invalid', true); return; } eT.set(0); inp.removeAttribute('aria-invalid'); name = inp.value.trim(); go(1); };
    $(panes[0],'.ok').onclick = submitText; inp.onkeydown = e => { if (e.key === 'Enter'){ e.preventDefault(); submitText(); } }; inp.oninput = () => { if (inp.value.trim()) eT.set(0); };
    panes.forEach((p,i) => $$(p,'.opt').forEach((b,j) => b.onclick = () => choose(i, j)));
    const choose = (i, j) => { if (adv) return; pulse = { b:$$(panes[i],'.opt')[j], t:now() }; $$(panes[i],'.opt').forEach((b,k) => b.style.borderColor = k === j ? 'var(--ink)' : 'var(--line)'); adv = now() + .45; };
    st.addEventListener('keydown', e => { if (Q[cur].t !== 'choice' || e.metaKey || e.ctrlKey) return; const j = 'abc'.indexOf(e.key.toLowerCase()); if (j >= 0 && j < Q[cur].o.length) choose(cur, j); });
    $(panes[3],'.again').onclick = () => { inp.value = ''; name = ''; panes.forEach(p => $$(p,'.opt').forEach(b => { b.style.borderColor = 'var(--line)'; b.style.background = 'var(--card)'; })); go(0); };
    const ck = $(panes[3],'.ck');
    return t => { if (adv && t >= adv){ adv = 0; go(cur + 1); }
      panes.forEach((p,k) => { sw.apply(p, k, t, 24); p.style.pointerEvents = k === sw.cur ? 'auto' : 'none'; });
      if (pulse){ const a = clamp((t - pulse.t)/.36), v = Math.sin(a*Math.PI); pulse.b.style.background = mix(v*.5 + (a >= 1 ? .12 : 0),'var(--ink)','var(--card)'); if (a >= 1) pulse = null; }
      pg.style.width = (clamp(prog2.at(t))*100).toFixed(2) + '%'; const e = clamp(eT.at(t)); er.style.opacity = e.toFixed(3); inp.style.borderBottomColor = mix(e,'var(--danger)','var(--line)');
      ck.style.strokeDashoffset = cur === 3 ? (1 - clamp(prog(t, tEnd + .2, S.soft))).toFixed(3) : 1; };
  }});
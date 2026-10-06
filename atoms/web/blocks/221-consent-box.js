atom({ id:'consentbox', cat:'Forms', name:'Consent checkbox', block:'form, consent, checkbox', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,92%);gap:8px"><div class="card col" style="padding:14px 16px;gap:0;font-size:14px;line-height:1.5"><button class="c0 crow" style="all:unset;display:flex;gap:10px;align-items:flex-start;cursor:pointer"><span class="box" style="position:relative;flex:none;width:22px;height:22px;border-radius:6px;border:2px solid var(--line)"><i class="dash" style="position:absolute;left:3px;right:3px;top:8px;height:2px;border-radius:1px;background:#fff"></i><svg class="ck" width="18" height="18" viewBox="0 0 20 20" style="position:absolute;inset:0"><path d="M4 10l4 4 8-9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg></span><span><b>Share my exhibits with counsel</b><br><span class="small muted" style="font-size:12px">Required to finish filing.</span></span></button><hr style="border:0;border-top:1px solid var(--line);margin:12px 0"><div class="row" style="gap:8px"><button class="btn some" style="min-height:32px;border-radius:8px">Partial</button><button class="btn none" style="min-height:32px;border-radius:8px">Clear</button><span class="st small" style="position:relative;flex:1;height:22px;align-self:center;font-size:12.5px"></span></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="log" checked> record consent timestamp</label></div><div class="hint">Tap the box, then try Partial</div>`,
  desc:'Checking fills the box first and the check draws after. The Partial state morphs the check into a dash. A recorded consent holds a success terminal.',
  api:'fill.set(1) then ck.set(1)   mixed: dash.set(1), ck.set(0)   recorded: st.to(2)',
  init(st){
    const box = $(st,'.box'), ck = $(st,'.ck path'), dash = $(st,'.dash'), status = $(st,'.st');
    const fill = new Track(0), ckT = new Track(0), dashT = new Track(0), sw = new Swap(0);
    const L = ['Not consented', 'Partially selected', 'Consent recorded ✓'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.textContent = s; status.appendChild(el); return el; });
    const LEN = 24; let mode = 0;
    const set = m => { mode = m; const t0 = now();
      if (m === 0){ dashT.set(0, S.base, t0); ckT.set(0, S.base, t0); fill.set(0, S.base, t0 + 0.1); }
      if (m === 2){ dashT.set(0, S.base, t0); fill.set(1, S.base, t0); ckT.set(1, S.base, t0 + 0.12); }
      if (m === 1){ ckT.set(0, S.base, t0); fill.set(1, S.base, t0); dashT.set(1, S.base, t0 + 0.12); }
      sw.to(m); };
    $(st,'.c0').onclick = () => set(mode === 2 ? 0 : 2); $(st,'.some').onclick = () => set(1); $(st,'.none').onclick = () => set(0);
    return t => { const f = clamp(fill.at(t));
      box.style.background = mix(f, 'var(--ink)', 'transparent'); box.style.borderColor = mix(f, 'var(--ink)', 'var(--line)');
      ck.style.strokeDasharray = LEN; ck.style.strokeDashoffset = ((1 - clamp(ckT.at(t))) * LEN).toFixed(2);
      dash.style.transform = `scaleX(${clamp(dashT.at(t)).toFixed(3)})`;
      L.forEach((el,k) => sw.apply(el,k,t)); L[2].style.color = 'var(--success)'; };
  }});

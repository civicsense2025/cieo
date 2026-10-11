

atom({ id:'autosave', cat:'Writing', name:'Autosave status', block:'richtext editor, form', fam:['S'],
  html:`<div class="col" style="width:min(320px,88%);gap:8px"><div class="row" style="justify-content:space-between"><b class="small">Draft · Spring launch</b><span class="as small" role="status" style="position:relative;width:130px;height:20px"></span></div><textarea id="as-ta" aria-label="Draft text" rows="4" style="resize:none;border:1.5px solid var(--muted);border-radius:10px;background:var(--card);color:var(--ink);font:14px/1.5 var(--sans);padding:10px;outline:none">We launch the spring collection on Thursday.</textarea></div><div class="hint">Type, then pause</div>`,
  desc:'The status moves through Editing, Saving with a spinner, and Saved with a success check, then relaxes to a quiet “Saved just now”. Each change is a blur swap timed from your last keystroke.',
  api:'on input: to("editing"); idle 0.8s → "saving"; +0.6s → "saved"; +2s → "idle"',
  init(st){
    const as = $(st,'.as'), ta = $(st,'textarea');
    const M = { idle:['<span class="muted">Saved just now</span>'], editing:['<span class="muted">Editing…</span>'], saving:[`<span class="muted" style="display:inline-flex;gap:6px;align-items:center"><svg class="spn" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9"/></svg>Saving…</span>`], saved:[`<span style="display:inline-flex;gap:5px;align-items:center;color:var(--success);font-weight:500">${ic(I.check,13,3)}Saved</span>`] }, L = {};
    for (const k in M){ const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-end'; e.innerHTML = M[k][0]; as.appendChild(e); L[k] = e; }
    const sw = new Swap('idle'), spn = $(L.saving,'.spn'); let last = -9, phase = 'idle';
    ta.oninput = () => { last = now(); phase = 'editing'; sw.to('editing'); };
    return t => { if (phase === 'editing' && t - last > .8){ phase = 'saving'; sw.to('saving'); } else if (phase === 'saving' && t - last > 1.4){ phase = 'saved'; sw.to('saved'); } else if (phase === 'saved' && t - last > 3.4){ phase = 'idle'; sw.to('idle'); }
      for (const k in L) sw.apply(L[k], k, t); spn.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`; };
  }});
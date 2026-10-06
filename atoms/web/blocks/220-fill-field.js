atom({ id:'fillfield', cat:'Forms', name:'Fillable field', block:'form, text input, validation', fam:['M','S'],
  html:`<div class="col" style="width:min(320px,90%);gap:8px"><div class="card col" style="padding:14px 16px;gap:12px"><b style="font-size:15px">Exhibit title</b><div class="wrap" style="position:relative"><label class="fl" style="position:absolute;left:12px;font-size:14px;color:var(--muted);pointer-events:none">e.g. Delivery schedule</label><input class="in" type="text" autocomplete="off" style="width:100%;min-height:36px;border-radius:8px;border:1px solid var(--line);padding:0 32px 0 10px;font-size:14px"><svg class="ck" width="18" height="18" viewBox="0 0 20 20" style="position:absolute;right:8px;top:9px"><path d="M4 10l4 4 8-9" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"/></svg></div><div class="msg small" style="position:relative;height:22px;font-size:12.5px;line-height:1.5"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="rq" checked> required field</label></div><div class="hint">Type 3+ letters, erase to feel danger</div>`,
  desc:'The label floats up the moment typing starts. An empty required field rings danger with its message; a valid one inks a success check and holds a looks-good terminal.',
  api:'float.set(typing?1:0, base)   invalid: ring danger + msg.to(1)   valid: ck.set(1), msg.to(2)',
  init(st){
    const inp = $(st,'.in'), fl = $(st,'.fl'), ck = $(st,'.ck path'), msg = $(st,'.msg'), rq = $(st,'.rq');
    const flT = new Track(0), ring = new Track(0), ckT = new Track(0), sw = new Swap(0);
    const M = ['', 'Enter at least 3 characters', 'Looks good ✓'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.textContent = s; msg.appendChild(el); return el; });
    const LEN = 24; let touched = false;
    const check = () => { const v = inp.value, bad = touched && rq.checked && v.length > 0 && v.length < 3, empty = touched && rq.checked && !v.length;
      flT.set(v.length ? 1 : 0, S.base); ring.set(bad || empty ? 1 : 0, S.base); ckT.set(v.length >= 3 ? 1 : 0, S.base);
      sw.to(v.length >= 3 ? 2 : (bad || empty ? 1 : 0)); };
    inp.oninput = () => { touched = true; check(); }; inp.onblur = () => { touched = true; check(); }; rq.onchange = check;
    return t => { const f = clamp(flT.at(t));
      fl.style.top = (10 - f * 8).toFixed(1) + 'px'; fl.style.fontSize = (14 - f * 3).toFixed(1) + 'px';
      const r = clamp(ring.at(t)); inp.style.borderColor = mix(r, 'var(--danger)', 'var(--line)');
      inp.style.boxShadow = r > 0.02 ? `0 0 0 2px color-mix(in oklab, var(--danger) ${(r * 30).toFixed(0)}%, transparent)` : 'none';
      ck.style.strokeDasharray = LEN; ck.style.strokeDashoffset = ((1 - clamp(ckT.at(t))) * LEN).toFixed(2);
      M.forEach((el,k) => sw.apply(el,k,t)); M[1].style.color = 'var(--danger)'; M[2].style.color = 'var(--success)'; };
  }});

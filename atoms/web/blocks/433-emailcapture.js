atom({ id:'emailcapture', cat:'Landing', name:'Email capture', block:'Landing signup', fam:['S','M'],
  html:`<div class="col" style="gap:0;align-items:center;max-width:380px;margin:0 auto;padding:44px 16px;text-align:center"><p style="margin:0;font-size:15px;font-weight:600;line-height:1.45">Get the launch issue</p><p class="small muted" style="margin:6px 0 0;font-size:13px;line-height:1.5">One email a month. Unsubscribe anytime.</p><form class="fm" style="display:flex;gap:8px;margin-top:16px;width:100%" novalidate><input type="email" autocomplete="email" placeholder="you@example.com" aria-label="Email address" style="flex:1;min-width:0;min-height:36px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font:14px/1.45 var(--sans);padding:0 12px;outline:none"><button class="btn go" aria-label="Submit email" style="position:relative;flex:none;min-height:36px;min-width:96px;border-radius:10px;display:grid;place-items:center;padding:0;overflow:hidden"></button></form><div class="msg" style="position:relative;margin-top:10px;height:20px;display:grid;justify-items:center;font-size:12.5px;line-height:1.5"></div><button class="btn rs small muted" style="margin-top:8px;min-height:36px;border-radius:10px;font-size:12.5px">Reset demo</button></div><div class="hint">Invalid rings danger · valid spins, checks, then holds the pill</div>`,
  desc:'Submit settles into neutral, invalid or valid. Invalid rings the field danger with a swapped message; valid spins the button, lands a check, and holds the success pill as the terminal state.',
  api:'status.to(ok|err)   btn: join → sending → done(hold)   ring = mix(danger)',
  init(st){
    const inp = $(st,'input'), go = $(st,'.go'), msg = $(st,'.msg');
    const states = ['Join','Sending','✓ Joined'];
    const bl = states.map(s => { const e = document.createElement('span'); e.style.cssText = 'grid-area:1/1;white-space:nowrap'; e.textContent = s; go.appendChild(e); return e; });
    const ml = ['Get launch updates. Only the good ones.','Enter an address like name@example.com','Check your inbox to confirm.'].map(s => { const e = document.createElement('span'); e.style.cssText = 'grid-area:1/1;white-space:nowrap'; e.textContent = s; msg.appendChild(e); return e; });
    const bsw = new Swap(0), msw = new Swap(0), bad = new Track(0), ok = new Track(0);
    let phase = 'idle', due = 0, dots = '';
    const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
    const send = () => {
      if (phase !== 'idle') return;
      if (!valid()){ bad.set(1); ok.set(0); bsw.to(0); msw.to(1); inp.setAttribute('aria-invalid','true'); inp.focus(); return; }
      phase = 'sending'; due = now() + .9; bsw.to(1); msw.to(0);
    };
    $(st,'form').onsubmit = e => { e.preventDefault(); send(); };
    inp.oninput = () => { if (phase === 'idle' && bad.target && valid()){ bad.set(0); msw.to(0); inp.removeAttribute('aria-invalid'); } };
    $(st,'.rs').onclick = () => { phase = 'idle'; inp.value = ''; inp.disabled = false; bad.jump(0); ok.jump(0); bsw.cur = 0; bsw.prev = null; bsw.t = -9; msw.to(0); };
    return t => {
      if (phase === 'sending'){
        const d = 'Sending' + '.'.repeat(1 + Math.floor(t*3)%3);
        if (d !== dots){ dots = d; bl[1].textContent = d; }
        if (t >= due){ phase = 'done'; bsw.to(2); msw.to(2); ok.set(1); bad.set(0); inp.disabled = true; }
      }
      const g = clamp(ok.at(t)), k = clamp(bad.at(t));
      inp.style.borderColor = `color-mix(in oklab, var(--danger) ${(k*100).toFixed(1)}%, color-mix(in oklab, var(--success) ${(g*100).toFixed(1)}%, var(--line)))`;
      inp.style.boxShadow = k > .02 ? `0 0 0 3px color-mix(in oklab, var(--danger) ${(k*28).toFixed(1)}%, transparent)` : 'none';
      go.style.background = mix(g,'var(--success)','var(--ink)');
      go.style.borderColor = mix(g,'var(--success)','var(--ink)');
      go.style.color = 'var(--card)';
      ml.forEach((e,i) => { msw.apply(e,i,t); e.style.color = i === 1 ? 'var(--danger)' : i === 2 ? 'var(--success)' : 'var(--muted)'; });
      bl.forEach((e,i) => bsw.apply(e,i,t,0));
    };
  }});

atom({ id:'postcall', cat:'Video calls', name:'Post-call checkout', block:'video call (checkout, feedback, recap)', fam:['M','S'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:stretch"><b style="font-size:15px;font-weight:600;line-height:1.5">How did it go?</b><span class="small muted" style="font-size:12px;line-height:1.5;margin-top:-4px">Two taps and you are out.</span><div class="card col" style="padding:14px 16px;gap:10px"><div class="row oc" style="gap:6px"><button class="btn" data-o="0" style="flex:1;min-height:36px;border-radius:8px">Great</button><button class="btn" data-o="1" style="flex:1;min-height:36px;border-radius:8px">Okay</button><button class="btn" data-o="2" style="flex:1;min-height:36px;border-radius:8px">Bad</button></div><div class="pn" style="position:relative;min-height:64px"></div><label class="row" style="gap:8px;font-size:13px;align-items:center"><input type="checkbox" class="rc"> Email me the recap <b class="pp" style="display:grid;place-items:center;padding:0;width:18px;height:18px;border-radius:50%;background:var(--success);color:#fff;font-size:11px;transform:translateY(-.5px) scale(0)">✓</b></label><div class="row" style="gap:8px"><button class="btn ink sb" style="flex:1;min-height:36px;border-radius:8px">Submit</button><button class="btn rs" style="min-height:36px;border-radius:8px">Start over</button></div><div class="fin" style="position:relative;min-height:30px"></div><label class="row small muted" style="gap:6px;font-size:12px;border-top:1px solid var(--line-soft);padding-top:8px"><input type="checkbox" class="an"> stay anonymous</label></div></div><div class="hint">Pick an outcome, then submit</div>`,
  desc:'Your outcome swaps the follow-up panel; the recap opt-in pops on snap. Submitting swaps in a thanks terminal instead of leaving you hanging.',
  api:'panel.to(outcome)   pop.set(checked, S.snap)   submit: fin.to(1)',
  init(st){
    const P = [['Loved it','Tell us one highlight — we will repeat it.'],['It was fine','One thing to fix next time?'],['Rough call','Sorry — what should we change?']];
    const pn = $(st,'.pn'), rc = $(st,'.rc'), pp = $(st,'.pp'), an = $(st,'.an');
    const L = P.map(([t, s]) => { const e = document.createElement('div'); e.className = 'layer';
      e.innerHTML = `<b style="display:block;font-size:13.5px;line-height:1.5">${t}</b><span class="small muted" style="font-size:12.5px;line-height:1.5">${s}</span>`;
      pn.appendChild(e); return e; });
    const psw = new Swap(0);
    const th = document.createElement('span'); th.className = 'layer';
    th.innerHTML = `<span class="small" style="background:color-mix(in oklab, var(--success) 12%, transparent);color:var(--success);font-weight:600;padding:4px 10px;border-radius:999px;font-size:12.5px">✓ <span class="tx"></span></span>`;
    $(st,'.fin').appendChild(th);
    const empty = document.createElement('span'); empty.className = 'layer'; $(st,'.fin').prepend(empty);
    const fsw = new Swap(0), ok = new Track(0), pop = new Track(0);
    let out = -1;
    const btns = [...st.querySelectorAll('.oc .btn')];
    btns.forEach(b => b.onclick = () => { out = +b.dataset.o; const t0 = now(); psw.to(out, t0);
      btns.forEach(x => { const on = x === b; x.setAttribute('aria-pressed', on); x.style.fontWeight = on ? '600' : ''; }); });
    rc.onchange = () => pop.set(rc.checked ? 1 : 0, S.snap);
    $(st,'.sb').onclick = () => { if (out < 0){ psw.to(1); out = 1;
        btns.forEach(x => { const on = x.dataset.o === '1'; x.setAttribute('aria-pressed', on); x.style.fontWeight = on ? '600' : ''; }); }
      const t0 = now();
      th.querySelector('.tx').textContent = an.checked ? 'Thanks — noted anonymously' : rc.checked ? 'Thanks — recap on its way' : 'Thanks — noted';
      fsw.to(1, t0); ok.set(1, S.snap, t0); };
    $(st,'.rs').onclick = () => { out = -1; psw.to(0); fsw.to(0); ok.set(0, S.snap);
      rc.checked = false; pop.set(0, S.snap);
      btns.forEach(x => { x.setAttribute('aria-pressed', 'false'); x.style.fontWeight = ''; }); };
    return t => { L.forEach((e,k) => psw.apply(e,k,t));
      [empty, th].forEach((e,k) => fsw.apply(e,k,t));
      pp.style.transform = `translateY(-.5px) scale(${clamp(pop.at(t)).toFixed(3)})`;
      const d = clamp(ok.at(t)), fin = $(st,'.fin');
      fin.style.opacity = d.toFixed(3);
      fin.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});

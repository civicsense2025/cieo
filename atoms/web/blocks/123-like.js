

atom({ id:'like', cat:'Social', name:'Like', block:'reviews, testimonial, poll', fam:['M','S'],
  html:`<button class="lk" aria-pressed="false" aria-label="Like" style="display:flex;align-items:center;gap:8px;border:1.5px solid var(--muted);background:var(--card);border-radius:999px;padding:8px 14px 8px 12px;cursor:pointer;font:600 15px var(--sans)"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path class="hf" d="M12 20s-7-4.4-9.3-9A5 5 0 0 1 12 6a5 5 0 0 1 9.3 5C19 15.6 12 20 12 20z" stroke-width="2" stroke-linejoin="round"/></svg><span class="c num"></span></button><div class="hint">No particles, just a fill and a roll</div>`,
  desc:'The heart presses to 80% and settles back as it fills. The count rolls up on like and down on unlike, so the direction of change is visible.',
  api:'fill.set(on); press.jump(1).set(0)   digits.dir = ±1; digits.set(n)',
  init(st){
    const lk = $(st,'.lk'), hf = $(st,'.hf'), d = new Digits($(st,'.c'), 4), f = new Track(0), pr = new Track(0, S.snap); let on = false, n = 1283; d.set(String(n), true);
    lk.onclick = () => { on = !on; n += on ? 1 : -1; d.dir = on ? 1 : -1; d.set(String(n)); f.set(on ? 1 : 0); pr.jump(1).set(0); lk.setAttribute('aria-pressed', on); };
    return t => { const k = clamp(f.at(t)), p = clamp(pr.at(t)); hf.style.fill = `color-mix(in oklab, var(--danger) ${(k*100).toFixed(1)}%, transparent)`; hf.style.stroke = mix(k,'var(--danger)','var(--ink)'); hf.parentNode.style.transform = `scale(${(1 - .2*p).toFixed(4)})`; d.render(t); };
  }});
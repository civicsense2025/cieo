

atom({ id:'numstep', cat:'Forms', name:'Number stepper', block:'form (number), line-items', fam:['S'],
  html:`<div class="col" style="align-items:center;gap:8px"><span class="small muted">Guests</span><div class="card row" style="padding:6px;gap:6px"><button class="btn mn" aria-label="Fewer guests" style="width:36px;height:36px;padding:0;font-size:18px">−</button><span class="v num" role="status" aria-live="polite" style="min-width:44px;text-align:center;font-size:24px;font-weight:600"></span><button class="btn pl" aria-label="More guests" style="width:36px;height:36px;padding:0;font-size:18px">+</button></div><span class="small muted">Hold a button to repeat · 1 to 20</span></div>`,
  desc:'Digits roll up when the value rises and down when it falls, so direction is readable at a glance. Holding a button repeats after 400ms, every 80ms, on the clock.',
  api:'digits.dir = ±1; digits.set(n)   repeat at t0 + 0.4 + k·0.08',
  init(st){
    const d = new Digits($(st,'.v'), 2), mn = $(st,'.mn'), pl = $(st,'.pl'); let n = 2, hold = null; d.set('2', true);
    const step = s => { const v = clamp(n + s, 1, 20); if (v === n) return; d.dir = s; n = v; d.set(String(n)); mn.disabled = n === 1; pl.disabled = n === 20; };
    [[mn,-1],[pl,1]].forEach(([b,s]) => { b.onpointerdown = e => { e.preventDefault(); step(s); hold = { s, next:now() + .4 }; }; b.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); step(s); } }; });
    addEventListener('pointerup', () => hold = null); addEventListener('pointercancel', () => hold = null);
    return t => { if (hold && t >= hold.next){ step(hold.s); hold.next = t + .08; } d.render(t); };
  }});
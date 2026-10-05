

atom({ id:'surface', cat:'Admin', name:'Morph surface', block:'buttons → loader → island → toast', fam:['M','S'], wide:true, tall:true,
  html:`<button class="sf" style="position:relative;border:0;cursor:pointer;font-weight:500;overflow:hidden;padding:0"></button><div class="ro st">button</div><div class="hint">Click the button</div>`,
  desc:'Button, loader, check, dynamic island and toast are one element. Width, height, radius and ink ride springs, and the check fills with the success color. Content swaps by the blur rule. The run is a list of timed events.',
  api:'plan([[0,"loader"],[1.1,"check"],[1.9,"island"],[3.6,"toast"],[5.6,"button"]])',
  init(st){
    const sf = $(st,'.sf'), ro = $(st,'.st');
    const ST = { button:[180,52,26,1,0], loader:[52,52,26,1,0], check:[52,52,26,1,1], island:[252,44,22,1,0], toast:[300,60,16,0,0] }, K = Object.keys(ST), L = {};
    const mk = (k,h) => { const e = document.createElement('div'); e.className = 'layer'; e.innerHTML = h; sf.appendChild(e); L[k] = e; };
    mk('button','Get started'); mk('loader','<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9"/></svg>');
    mk('check','<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7" pathLength="1" stroke-dasharray="1"/></svg>');
    mk('island','<i style="width:8px;height:8px;border-radius:50%;background:var(--danger)"></i><span>Recording</span><span class="bs" style="display:flex;gap:2px;align-items:center;height:14px">' + '<i style="width:2px;border-radius:1px;background:currentColor"></i>'.repeat(9) + '</span><span class="it num small">0:00</span>');
    mk('toast','<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg><span>Recording saved</span><span class="muted" style="font-weight:400">· Undo</span>');
    const spin = $(L.loader,'svg'), chk = $(L.check,'path'), bars = $$(L.island,'.bs i'), it = $(L.island,'.it');
    const T = [0,1,2,3,4].map(() => new Track(0)), sw = new Swap('button'); let state = 'button', since = 0, q = [];
    const to = (k, t, inst) => { state = k; since = t; sw.to(k, t); ro.textContent = k; ST[k].forEach((v,i) => inst ? T[i].jump(v) : T[i].set(v, S.base, t)); };
    to('button', 0, true); sw.prev = null;
    sf.onclick = () => { if (state !== 'button' || q.length) return; const t0 = now(); q = [[0,'loader'],[1.1,'check'],[1.9,'island'],[3.6,'toast'],[5.6,'button']].map(([d,k]) => [t0 + d, k]); };
    return t => { while (q.length && q[0][0] <= t){ const [tt,k] = q.shift(); to(k, tt); }
      const [w,h,r,d,g] = T.map(x => x.at(t)); Object.assign(sf.style, { width:px(w), height:px(h), borderRadius:px(r), background:mix(g,'var(--success)',mix(d,'var(--ink)','var(--card)')), color:mix(g,'#fff',mix(d,'var(--card)','var(--ink)')), boxShadow:d < .5 ? 'var(--shadow)' : 'none' });
      K.forEach(k => sw.apply(L[k], k, t)); spin.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
      chk.style.strokeDashoffset = state === 'check' ? (1 - clamp(prog(t, since + .08, S.soft))).toFixed(3) : 0;
      bars.forEach((b,i) => b.style.height = px(4 + 8*Math.abs(Math.sin(t*6 + i*.9)*Math.sin(t*2.3 + i))));
      if (state === 'island') it.textContent = '0:' + String(Math.floor((t - since)*3) % 60).padStart(2,'0'); };
  }});
atom({ id:'layerswitch', cat:'Maps', name:'Layer switcher', block:'map layers, tiles', fam:['M'], wide:true,
  html:`<div class="mp card" style="position:relative;width:min(560px,94%);height:240px;overflow:hidden"><div class="t0" style="position:absolute;inset:0;background:linear-gradient(135deg,var(--raised),color-mix(in oklab,var(--accent-tint) 55%, var(--raised)))"></div><div class="t1" style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.14) 0 2px,transparent 2px 26px),linear-gradient(135deg,#3a4350,#20262e)"></div><div class="pins" style="position:absolute;inset:0;pointer-events:none"></div><div class="chips" style="position:absolute;left:12px;bottom:12px;display:flex;gap:6px;padding:4px;border-radius:12px;background:color-mix(in oklab,var(--card) 88%, transparent);box-shadow:var(--shadow)"><span class="plate" style="position:absolute;top:4px;bottom:4px;border-radius:8px;background:var(--ink)"></span></div></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;width:min(560px,94%);padding:6px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Old tiles cross-fade, new blooms in</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="true">Labels on</button></div><div class="hint">Switch Map, Satellite, Transit</div>`,
  desc:'Chips morph a plate whose trailing edge arrives 60ms late. Old tiles cross-fade while the new layer blooms from 0.97 on base. Pins ride above it all.',
  api:'plate.go(i) trails .06   tiles.o.set(layer) cross-fade   bloom.set(1,base)',
  init(st){
    const mp = $(st,'.mp'), chips = $(st,'.chips'), plate = $(st,'.plate'), t0 = $(st,'.t0'), t1 = $(st,'.t1'), pins = $(st,'.pins');
    const N = ['Map','Satellite','Transit']; let cur = 0, labels = true;
    const btns = N.map((n,i) => { const b = document.createElement('button'); b.textContent = n; b.style.cssText = 'position:relative;z-index:1;height:32px;padding:0 12px;border:0;background:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;color:var(--muted)'; b.setAttribute('aria-pressed', i === 0); chips.appendChild(b); b.onclick = () => pick(i); return b; });
    [[.2,.3],[.6,.55],[.78,.28]].forEach(([x,y]) => { const p = document.createElement('i'); p.style.cssText = `position:absolute;left:${x*100}%;top:${y*100}%;width:12px;height:12px;margin:-6px;border-radius:50%;background:var(--ink);border:2px solid var(--card)`; pins.appendChild(p); });
    const e = edges(0, 132); e.jump(0, 132);
    const to = new Track(1), bloom = new Track(1); to.jump(1); bloom.jump(1);
    const tg = $(st,'.pg-tg');
    tg.onclick = () => { labels = !labels; tg.textContent = labels ? 'Labels on' : 'Labels off'; tg.setAttribute('aria-pressed', labels); pins.style.opacity = labels ? 1 : .25; };
    const lefts = () => btns.map(b => b.offsetLeft), widths = () => btns.map(b => b.offsetWidth);
    function pick(i){ cur = i; const t0n = now(); const L = lefts(), W = widths();
      btns.forEach((b,k) => { b.style.color = k === i ? 'var(--card)' : 'var(--muted)'; b.setAttribute('aria-pressed', k === i); });
      if (REDUCE){ e.jump(L[i], L[i]+W[i]); to.jump(i === 1 ? 1 : 0); bloom.jump(1); }
      else { e.go(L[i], L[i]+W[i]); bloom.jump(.4); bloom.set(1, S.base, t0n); to.set(i === 1 ? 1 : 0, S.base, t0n); } }
    requestAnimationFrame(() => { const L = lefts(), W = widths(); e.jump(L[0], L[0]+W[0]); });
    return t => { const a = e.A.at(t), b = e.B.at(t); plate.style.left = px(Math.min(a,b)); plate.style.width = px(Math.max(8, Math.abs(b-a)));
      const k = clamp(to.at(t)), bl = clamp(bloom.at(t));
      t1.style.opacity = k.toFixed(3); t1.style.transform = `scale(${(.97+.03*bl).toFixed(4)})`; t1.style.filter = bl < .98 ? `blur(${((1-bl)*4).toFixed(2)}px)` : 'none';
      t0.style.opacity = (1-k*.85).toFixed(3); };
  }});

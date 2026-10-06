
atom({ id:'regendiff', cat:'AI chat', name:'Regeneration diff', block:'chat, diff', fam:['S','M'], tall:true,
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.5">Regenerate answer</b><div class="ans" style="position:relative;overflow:hidden;font-size:13.5px;line-height:1.6"></div><span class="cap small" style="position:relative;display:block;height:20px;font-size:12px"></span><div class="row" style="justify-content:space-between"><button class="btn ink rg" style="min-height:32px;border-radius:9px">Regenerate</button><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="hl" checked> Highlight changes</label></div></div><div class="hint">Regenerate, watch phrases glow, then settle</div>`,
  desc:'The old answer blurs out while the new one swaps in. Changed phrases glow, then fade, and the card height springs to fit.',
  api:'ans.swap.to(1)   chg glow fades at t + 1.4 (S.soft)   ans.h.set(measure(new), S.soft)',
  init(st){
    const OLD = 'Start from your monthly price and offer two months free.';
    const NEW = ['Start from your ', 'annual price', ' and offer ', 'three months free', '.'];
    const ans = $(st,'.ans'), cap = $(st,'.cap'), hlt = $(st,'.hl');
    const mk = (k, html) => { const d = document.createElement('div'); d.className = 'layer'; d.style.cssText += ';align-items:flex-start;justify-content:flex-start;white-space:normal;text-align:left;padding:2px 0';
      if (k === 0) d.textContent = html; else { const f = document.createElement('span'); f.textContent = NEW[0];
        const m1 = document.createElement('span'); m1.className = 'chg'; m1.textContent = NEW[1];
        const m2 = document.createElement('span'); m2.textContent = NEW[2];
        const m3 = document.createElement('span'); m3.className = 'chg'; m3.textContent = NEW[3];
        const m4 = document.createElement('span'); m4.textContent = NEW[4];
        f.append(m1, m2, m3, m4); d.appendChild(f); } ans.appendChild(d); return d; };
    const L = [mk(0, OLD), mk(1)];
    const chg = [...L[1].querySelectorAll('.chg')];
    const C = ['Original draft', 'Regenerating…', '2 phrases changed — kept'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; if (i === 2) e.style.color = 'var(--success)'; cap.appendChild(e); return e; });
    const sw = new Swap(0), csw = new Swap(0), h = new Track(0), glow = new Track(0);
    const measure = txt => { const m = document.createElement('div'); m.style.cssText = `position:absolute;visibility:hidden;width:${ans.clientWidth || 280}px;font-size:13.5px;line-height:1.6`; m.textContent = txt; ans.appendChild(m); const x = m.offsetHeight + 4; m.remove(); return x; };
    const H0 = measure(OLD), H1 = measure(NEW.join('')); h.jump(H0);
    let regen = false;
    $(st,'.rg').onclick = () => { regen = !regen; const t = now();
      if (REDUCE){ sw.cur = regen ? 1 : 0; sw.prev = null; sw.t = -9; csw.cur = regen ? 2 : 0; csw.prev = null; csw.t = t; h.jump(regen ? H1 : H0); glow.jump(0); }
      else { sw.to(regen ? 1 : 0); csw.to(regen ? 1 : 0); h.set(regen ? H1 : H0, S.soft);
        if (regen){ if (hlt.checked){ glow.set(1); glow.set(0, S.soft, t + 1.4); } csw.to(1);
          setTimeout(() => { if (regen) csw.to(2); }, 900/clock.scale); } } };
    return t => { ans.style.height = px(Math.max(0, h.at(t)));
      L.forEach((e,k) => sw.apply(e,k,t)); C.forEach((e,k) => csw.apply(e,k,t));
      const g = clamp(glow.at(t));
      chg.forEach(c => { c.style.background = g > .02 ? `color-mix(in oklab, var(--warning-tint) ${(g*100).toFixed(0)}%, transparent)` : 'transparent';
        c.style.borderRadius = '4px'; }); };
  }});

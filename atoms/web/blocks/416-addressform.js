atom({ id:'addressform', cat:'Forms', name:'Address form', block:'address, country, postcode', fam:['S','E'],
  html:`<div class="col" style="gap:8px;width:min(320px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Shipping address</h4><div class="seg row" role="group" aria-label="Country" style="gap:4px;position:relative"><i class="ind" style="position:absolute;top:0;bottom:0;left:0;border-radius:8px;background:var(--ink);opacity:0"></i></div><div class="set" style="position:relative;overflow:hidden"><div class="us col" style="gap:8px"><div class="row" style="gap:8px"><input aria-label="ZIP code" class="zp" placeholder="ZIP code" inputmode="numeric" style="height:36px;flex:1;min-width:0;border:1.5px solid var(--muted);border-radius:9px;padding:0 12px;font-size:14px;line-height:1.5"><input aria-label="State" class="ct2" placeholder="State" style="height:36px;flex:1;min-width:0;border:1.5px solid var(--muted);border-radius:9px;padding:0 12px;font-size:14px;line-height:1.5"></div><span class="cy small" style="position:relative;height:18px;font-size:12px;color:var(--muted);line-height:1.5"></span></div></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="lp2" checked> Look up city from postcode</label></div><div class="hint">Flip country, then type 94110</div>`,
  desc:'Switching country cross-fades the field set while the wrapper height springs to fit. Typing a known postcode swaps the city in with blur.',
  api:'set.to(country) + h.set(natural, base)   city.to(match)',
  init(st){
    const seg = $(st,'.seg'), ind = $(st,'.ind'), set = $(st,'.set'), zp = $(st,'.zp'), cy = $(st,'.cy'), lp = $(st,'.lp2');
    const N = ['US', 'UK']; const btns = N.map((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = n === 'US' ? 'United States' : 'United Kingdom'; b.setAttribute('aria-pressed', i === 0);
      b.style.cssText = 'position:relative;flex:1;height:32px;border-radius:8px;border:0;background:none;cursor:pointer;font-size:13px;font-weight:500;z-index:1'; seg.appendChild(b); return b; });
    const us = $(st,'.us');
    const uk = document.createElement('div'); uk.className = 'col'; uk.style.cssText = 'gap:8px;position:absolute;inset:0 0 auto 0';
    uk.innerHTML = `<div class="row" style="gap:8px"><input aria-label="Postcode" class="zp2" placeholder="Postcode" style="height:36px;flex:1;min-width:0;border:1.5px solid var(--muted);border-radius:9px;padding:0 12px;font-size:14px"><input aria-label="County" placeholder="County" style="height:36px;flex:1;min-width:0;border:1.5px solid var(--muted);border-radius:9px;padding:0 12px;font-size:14px"></div><span class="cy2 small" style="font-size:12px;color:var(--muted);line-height:1.5">Try SW1A 1AA.</span>`;
    set.appendChild(uk);
    const e = edges(0, 0), sw = new Swap(0), h = new Track(76), csw = new Swap(0);
    const CL = ['Enter ZIP to look up the city', 'San Francisco, CA', 'Unknown ZIP — keep typing'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.textContent = s; cy.appendChild(el); return el; });
    let mode = 0;
    const H = [76, 76];
    const pick = (i, inst) => { mode = i; btns.forEach((b, j) => { b.setAttribute('aria-pressed', j === i); if (!inst) b.style.color = ''; });
      const b = btns[i]; if (inst || REDUCE){ e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); sw.cur = i; sw.prev = null; sw.t = -9; h.jump(H[i]); }
      else { e.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); sw.to(i); h.set(H[i], S.base); } };
    btns.forEach((b, i) => b.onclick = () => pick(i));
    const init = () => pick(0, true); document.fonts.ready.then(init); init();
    const zip = v => { if (!lp.checked){ csw.to(0); return; } const d = v.trim();
      csw.to(d === '94110' ? 1 : d.length >= 5 ? 2 : 0); };
    zp.oninput = () => zip(zp.value);
    return t => { const a = e.A.at(t), b = e.B.at(t); ind.style.transform = `translateX(${px(a)})`; ind.style.width = px(b - a); ind.style.opacity = '1';
      btns.forEach((x, j) => x.style.color = mix(j === mode ? 1 : 0, 'var(--card)', 'var(--ink)'));
      set.style.height = px(h.at(t));
      const o = (el, on) => { el.style.opacity = on; };
      us.style.opacity = ''; uk.style.opacity = '';
      sw.apply(us, 0, t); sw.apply(uk, 1, t);
      us.style.pointerEvents = mode === 0 ? 'auto' : 'none'; uk.style.pointerEvents = mode === 1 ? 'auto' : 'none';
      CL.forEach((el, k) => csw.apply(el, k, t)); };
  }});

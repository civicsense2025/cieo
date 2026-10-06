atom({ id:'addressfields', cat:'Forms', name:'Address fields', block:'address, verify', fam:['M'],
  html:`<div class="card" style="width:min(400px,94%);padding:14px 16px"><p style="font-size:15px;font-weight:600;line-height:1.5;margin:0">Delivery address</p><div style="position:relative;margin-top:10px"><div class="plate" style="position:absolute;left:-4px;top:-4px;bottom:-4px;width:4px;border-radius:2px;background:var(--success)"></div><label style="display:block;font-size:12.5px;color:var(--muted);line-height:1.5">Street<input class="f0" value="1 Ferry Bldg" aria-label="Street" style="display:block;width:100%;height:36px;margin-top:4px;border:1px solid var(--line);border-radius:9px;padding:0 12px;font-size:14px"></label><div class="sg" style="position:relative;height:30px;margin-top:6px;font-size:13px"><span class="op" style="position:absolute;inset:0;display:flex;align-items:center;padding:0 12px;border-radius:8px;background:var(--raised);cursor:pointer"></span></div><div class="row" style="display:flex;gap:8px;margin-top:6px"><label style="flex:1;font-size:12.5px;color:var(--muted);line-height:1.5">City<input class="f1" value="San Francisco" aria-label="City" style="display:block;width:100%;height:36px;margin-top:4px;border:1px solid var(--line);border-radius:9px;padding:0 12px;font-size:14px"></label><label style="width:110px;font-size:12.5px;color:var(--muted);line-height:1.5">ZIP<input class="f2" value="94111" aria-label="ZIP" style="display:block;width:100%;height:36px;margin-top:4px;border:1px solid var(--line);border-radius:9px;padding:0 12px;font-size:14px;font-variant-numeric:tabular-nums"></label></div><p class="er" style="font-size:12.5px;color:var(--danger);line-height:1.5;min-height:20px;margin:6px 0 0"></p><button class="btn ink vf" style="width:100%;height:36px;border-radius:9px;margin-top:2px">Verify address</button></div><div class="row small muted" style="display:flex;align-items:center;gap:8px;padding:10px 2px 0;font-size:12.5px;color:var(--muted)"><span style="flex:1">Verified plate glides behind</span><button type="button" class="btn pg-tg" style="height:32px;border-radius:9px" aria-pressed="true">Suggest on</button></div></div><div class="hint">Clear the ZIP, then Verify</div>`,
  desc:'The verified plate glides with its trailing edge late. Typing swaps the suggestion on snap. A bad ZIP shakes the row on snap and the error holds as the terminal.',
  api:'plate.go(ok) trails .06   sg.to(i) snap   err: x.shake snap   ok terminal',
  init(st){
    const plate = $(st,'.plate'), sg = $(st,'.sg'), op = $(st,'.op'), er = $(st,'.er');
    const e = edges(0, 0); e.jump(0, 0);
    const L = ['1 Ferry Building, SF','1 Ferry Plaza, SF'].map(s => { const x = document.createElement('span'); x.className = 'layer'; x.style.cssText = 'justify-content:flex-start;font-size:13px'; x.textContent = s; op.appendChild(x); return x; });
    const sw = new Swap(0), sh = new Track(0); let sug = true, ok = 1;
    const tg = $(st,'.pg-tg');
    tg.onclick = () => { sug = !sug; tg.textContent = sug ? 'Suggest on' : 'Suggest off'; tg.setAttribute('aria-pressed', sug); sg.style.display = sug ? '' : 'none'; };
    $(st,'.f0').oninput = ev => { if (!sug) return; sw.to(ev.target.value.length > 12 ? 1 : 0); };
    op.onclick = () => { $(st,'.f0').value = L[sw.cur].textContent.split(',')[0]; sw.to(sw.cur); };
    $(st,'.vf').onclick = () => { const zip = $(st,'.f2').value.trim(), good = /^\d{5}$/.test(zip), t0 = now();
      ok = good ? 1 : 0;
      if (REDUCE){ e.jump(0, good ? 1 : 0); sh.jump(0); }
      else { e.go(0, good ? 1 : 0, t0); if (!good){ sh.jump(-8); sh.set(0, S.snap, t0); } }
      er.textContent = good ? '' : 'Enter the 5-digit ZIP so the courier finds the door.'; };
    return t => { plate.style.transform = `scaleY(${clamp(e.B.at(t)).toFixed(3)})`; plate.style.opacity = clamp(e.B.at(t)).toFixed(3);
      plate.style.transformOrigin = 'top'; $(st,'.f0').parentElement.parentElement.style.transform = `translateX(${sh.at(t).toFixed(2)}px)`;
      L.forEach((x,k) => sw.apply(x,k,t)); };
  }});

atom({ id:'clausepick', cat:'Forms', name:'Clause pick-one', block:'form, radio, choice', fam:['M','S'],
  html:`<div class="col" style="width:min(340px,92%);gap:8px"><div class="card col rg" role="radiogroup" aria-label="Governing clause" style="padding:14px 16px;gap:0"><b style="font-size:15px;padding-bottom:4px">Governing clause</b></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="lk" checked> lock pick with success mark</label></div><div class="hint">Pick a clause — arrows work too</div>`,
  desc:'The dot grows from the center of the new clause while the old one shrinks on the same spring. The locked pick carries a success check and the summary swaps to a filed terminal.',
  api:'dot[i].set(picked?1:0, base) same spring   sum.to(i)   locked holds ✓',
  init(st){
    const rg = $(st,'.rg'), lk = $(st,'.lk');
    const O = [['Arbitration', 'Disputes settle in Reno.'], ['Mediation', 'A neutral talks first.'], ['Litigation', 'Courts decide in public.']];
    const sum = document.createElement('div'); sum.className = 'small'; sum.style.cssText = 'position:relative;height:22px;font-size:12.5px;line-height:1.5;margin-top:8px';
    rg.appendChild(sum);
    const SL = O.map(o => { const el = document.createElement('span'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.textContent = `Filed under ${o[0]} ✓`; sum.appendChild(el); return el; });
    const sw = new Swap(0); let cur = 0;
    const it = O.map((o,i) => { const b = document.createElement('button'); b.setAttribute('role', 'radio');
      b.style.cssText = 'display:flex;align-items:center;gap:10px;border:0;background:none;cursor:pointer;padding:8px 0;font-size:14px;text-align:left';
      b.innerHTML = `<span style="position:relative;flex:none;width:20px;height:20px;border-radius:50%;border:2px solid var(--line)"><i style="position:absolute;inset:3px;border-radius:50%;background:var(--ink)"></i></span><span><b>${o[0]}</b> <span class="small muted" style="font-size:12px">— ${o[1]}</span><b class="ok" style="color:var(--success);font-size:12px"></b></span>`;
      if (i < 2){ const hr = document.createElement('hr'); hr.style.cssText = 'border:0;border-top:1px solid var(--line);margin:0'; rg.insertBefore(hr, sum); }
      rg.insertBefore(b, sum); return { b, ring: b.querySelector('span'), dot: b.querySelector('i'), ok: b.querySelector('.ok'), p: new Track(i === 0 ? 1 : 0) }; });
    const pick = (i, focus = true) => { cur = (i + O.length) % O.length;
      it.forEach((x,j) => { x.p.set(j === cur ? 1 : 0, S.base); x.b.setAttribute('aria-checked', j === cur); x.b.tabIndex = j === cur ? 0 : -1; x.ok.textContent = lk.checked && j === cur ? ' ✓' : ''; });
      sw.to(cur); if (focus) it[cur].b.focus(); };
    it.forEach((x,i) => { x.b.onclick = () => pick(i, false); x.b.onkeydown = ev => { if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight'){ ev.preventDefault(); pick(cur + 1); } if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft'){ ev.preventDefault(); pick(cur - 1); } }; x.b.tabIndex = i === 0 ? 0 : -1; x.b.setAttribute('aria-checked', i === 0); });
    lk.onchange = () => pick(cur, false); pick(0, false);
    return t => { it.forEach(x => { const p = clamp(x.p.at(t)); x.dot.style.transform = `scale(${p.toFixed(4)})`; x.ring.style.borderColor = mix(p, 'var(--ink)', 'var(--line)'); });
      SL.forEach((el,k) => sw.apply(el,k,t)); SL.forEach(el => el.style.color = 'var(--success)'); };
  }});

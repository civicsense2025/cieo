atom({ id:'sigguide', cat:'Documents', name:'Signature ceremony', block:'sign, fields, guided signing', fam:['M'],
  html:`<div class="col" style="width:min(340px,92%);gap:8px"><div class="card col sg" style="position:relative;padding:14px 16px 14px 40px;gap:0"><div class="pulse" style="position:absolute;left:14px;top:20px;width:14px;height:14px;border-radius:50%;background:var(--accent)"></div><div class="f0 flow" style="padding:8px 0"><div class="micro" style="font-size:11px;color:var(--muted)">FIELD 1 OF 3</div><input class="i0" placeholder="Full name" style="width:100%;min-height:32px;border-radius:8px;border:1px solid var(--line);padding:0 10px;font-size:14px"></div><hr style="border:0;border-top:1px solid var(--line);margin:0"><div class="f1 flow" style="padding:8px 0"><div class="micro" style="font-size:11px;color:var(--muted)">FIELD 2 OF 3</div><input class="i1" placeholder="Email" style="width:100%;min-height:32px;border-radius:8px;border:1px solid var(--line);padding:0 10px;font-size:14px"></div><hr style="border:0;border-top:1px solid var(--line);margin:0"><div class="f2 flow" style="padding:8px 0"><div class="micro" style="font-size:11px;color:var(--muted)">FIELD 3 OF 3</div><button class="btn sign" style="min-height:32px;border-radius:8px">Sign here</button> <svg class="ck" width="20" height="20" viewBox="0 0 20 20" style="vertical-align:-4px"><path d="M4 10l4 4 8-9" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"/></svg></div><div class="fin small" style="position:relative;height:22px;font-size:12.5px"></div></div><div class="row" style="gap:8px"><button class="btn next" style="min-height:32px;border-radius:8px">Next field</button><button class="btn rs" style="min-height:32px;border-radius:8px">Reset</button></div></div><div class="hint">Next through empty fields to feel the rings</div>`,
  desc:'A pulse travels down the rail to the next open field. Skipping ahead rings the unfinished field in danger. Signing inks a success check and the ceremony holds a signed terminal.',
  api:'pulse.y.set(i*row, base)   skip: ring.set(1) danger   sign: ck.set(1), fin.to(1)',
  init(st){
    const flows = [$$(st,'.f0')[0], $$(st,'.f1')[0], $$(st,'.f2')[0]], ins = [$$(st,'.i0')[0], $$(st,'.i1')[0]];
    const pulse = $(st,'.pulse'), ck = $(st,'.ck path'), fin = $(st,'.fin');
    const F = ['Document signed — thank you ✓', ''].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.textContent = s; fin.appendChild(el); return el; });
    const y = new Track(8), draw = new Track(0), ring = new Track(0), sw = new Swap(1);
    const LEN = 24; let i = 0, signed = false;
    const paint = () => { flows.forEach((f,j) => { f.style.opacity = signed || j <= i ? 1 : 0.45; }); };
    const next = () => { if (signed) return;
      if (i < 2 && !ins[i].value.trim()){ ring.set(1, S.snap); setTimeout(() => ring.set(0, S.base), 450); return; }
      if (i >= 2){ signed = true; draw.set(1, S.base); sw.to(0); paint(); return; }
      i++; y.set(8 + i * 62, S.base); ring.set(0); paint(); };
    $(st,'.next').onclick = next; $(st,'.sign').onclick = () => { if (i === 2) next(); };
    $(st,'.rs').onclick = () => { i = 0; signed = false; ins.forEach(x => x.value = ''); draw.jump(0); y.set(8, S.base); sw.to(1); paint(); };
    ins.forEach(x => x.oninput = () => ring.set(0)); paint();
    return t => { pulse.style.top = px(y.at(t)); pulse.style.transform = `scale(${(1 + 0.25 * Math.sin(t * 4)).toFixed(3)})`;
      ck.style.strokeDasharray = LEN; ck.style.strokeDashoffset = ((1 - clamp(draw.at(t))) * LEN).toFixed(2);
      const r = clamp(ring.at(t)); flows[Math.min(i, 2)].style.boxShadow = r > 0.02 ? `0 0 0 2px color-mix(in oklab, var(--danger) ${(r * 80).toFixed(0)}%, transparent)` : 'none';
      F.forEach((el,k) => sw.apply(el,k,t)); F[0].style.color = 'var(--success)'; };
  }});

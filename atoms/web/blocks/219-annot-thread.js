atom({ id:'annotthread', cat:'Documents', name:'Annotation thread', block:'comments, resolve, review', fam:['M'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px"><div class="card col th" style="padding:14px 16px;gap:0;overflow:hidden"><div class="row" style="gap:10px;align-items:center"><span style="display:grid;place-items:center;width:36px;height:36px;padding:0;border-radius:50%;background:var(--wash);font-size:15px;transform:translateY(1px)">💬</span><div><b style="font-size:15px">Mara on §2</b><div class="small muted" style="font-size:12px">“The bell image carries the whole opening.”</div></div></div><hr style="border:0;border-top:1px solid var(--line);margin:12px 0 0"><div class="reps col" style="gap:8px"><div class="small" style="font-size:13px;line-height:1.5;padding-top:8px"><b>Theo:</b> Agreed — keep it.</div><div class="small" style="font-size:13px;line-height:1.5"><b>June:</b> Trim the second clause.</div></div><div class="row" style="gap:8px;align-items:center;padding-top:12px"><button class="btn res" style="min-height:32px;border-radius:8px">Resolve</button><button class="btn ro" style="min-height:32px;border-radius:8px">Reopen</button><svg class="ck" width="20" height="20" viewBox="0 0 20 20"><path d="M4 10l4 4 8-9" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"/></svg><span class="st small muted" style="font-size:12.5px">open</span></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="nt" checked> notify author on resolve</label></div><div class="hint">Resolve collapses it — Reopen reverses</div>`,
  desc:'Resolving inks the check first and only then collapses the thread height on a base spring, landing on a quiet resolved terminal. Reopening plays the same motion in reverse.',
  api:'res: ck.set(1) then h.set(0, base)   open: h.set(full, base), ck.set(0)',
  init(st){
    const th = $(st,'.th'), reps = $(st,'.reps'), ck = $(st,'.ck path'), status = $(st,'.st');
    const ckT = new Track(0), h = new Track(1), lab = new Swap(0);
    const L = ['open', 'resolved ✓'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.style.fontSize = '12.5px'; el.textContent = s; status.appendChild(el); status.firstChild.remove(); return el; });
    status.firstChild && status.firstChild.remove(); const LEN = 24; let full = 0;
    const measure = () => { reps.style.height = 'auto'; full = reps.scrollHeight; };
    measure(); h.jump(1);
    $(st,'.res').onclick = () => { measure(); ckT.set(1, S.base); setTimeout(() => h.set(0, S.base), 160); lab.to(1); };
    $(st,'.ro').onclick = () => { measure(); h.set(1, S.base); ckT.set(0, S.base); lab.to(0); };
    return t => { ck.style.strokeDasharray = LEN; ck.style.strokeDashoffset = ((1 - clamp(ckT.at(t))) * LEN).toFixed(2);
      const p = clamp(h.at(t)); reps.style.height = (p * full).toFixed(1) + 'px'; reps.style.overflow = 'hidden';
      reps.style.opacity = p.toFixed(3); L.forEach((el,k) => lab.apply(el,k,t)); L[1].style.color = 'var(--success)'; };
  }});

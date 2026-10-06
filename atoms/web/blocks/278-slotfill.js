
atom({ id:'slotfill', cat:'Forms', name:'Slot-filling form', block:'chat, form', fam:['M','E','S'], tall:true,
  html:`<div class="card col" style="width:min(340px,calc(100% - 24px));padding:14px;gap:0"><b style="font-size:15px;font-weight:600;line-height:1.5">Book a room</b><div class="pbar" style="height:3px;border-radius:2px;background:var(--raised);overflow:hidden;position:relative;margin:8px 0 2px"><i class="tr" style="position:absolute;left:0;top:0;bottom:0;background:var(--line)"></i><i class="ld" style="position:absolute;left:0;top:0;bottom:0;background:var(--ink)"></i></div><span class="ct num small muted" style="position:relative;display:block;height:20px;font-size:12px"></span><div class="slots col" style="gap:0"></div><span class="dn small" style="position:relative;display:block;min-height:0;font-size:13px;overflow:hidden"></span><div class="row" style="justify-content:space-between;margin-top:8px"><label class="row small muted" style="gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="cp" checked> Compact done rows</label><button class="btn rs" style="min-height:32px;border-radius:9px">Reset</button></div></div><div class="hint">Fill each slot to book the room</div>`,
  desc:'Missing slots stack compact while the first open one offers picks. Each answer inks a check and collapses, and the progress edge trails to a booked terminal.',
  api:'answer[i]: ck.set(1), opts.h→0 (S.soft)   edge.go(n/3) trails 60ms   at 3/3: summary.swap.to(done)',
  init(st){
    const DEF = [{ k:'Date', o:['Tue','Wed'] },{ k:'Time', o:['2 pm','4 pm'] },{ k:'Size', o:['2','4 people'] }];
    const box = $(st,'.slots'), ct = $(st,'.ct'), dn = $(st,'.dn'), cp = $(st,'.cp'), tr = $(st,'.tr'), ld = $(st,'.ld');
    const C = ['0 of 3','1 of 3','2 of 3','3 of 3'].map(s => { const e = document.createElement('span'); e.className = 'layer num'; e.style.justifyContent = 'flex-start'; e.textContent = s; ct.appendChild(e); return e; });
    const D = ['', 'Booked · Tue 2 pm · 4 people'].map((s,i) => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = 'flex-start'; e.textContent = s; if (i) e.style.color = 'var(--success)'; dn.appendChild(e); return e; });
    const csw = new Swap(0), dsw = new Swap(0), eg = edges(0, 0), dh = new Track(0);
    const slots = DEF.map((d,i) => { const row = document.createElement('div'); row.style.cssText = 'display:flex;flex-direction:column;gap:6px;padding:10px 0' + (i ? ';border-top:1px solid var(--line-soft)' : '');
      row.innerHTML = `<span class="row" style="gap:8px"><svg class="ck" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success);transform:translateY(.5px)"><path d="M5 12.5 10 17.5 19 7"/></svg><b style="font-size:13px">${d.k}</b><span class="vl" style="font-size:13px"></span><span class="wt small muted" style="margin-left:auto;font-size:12px">Waiting…</span></span><span class="opts" style="display:flex;gap:6px;overflow:hidden"></span>`;
      box.appendChild(row);
      const opts = $(row,'.opts'), vl = $(row,'.vl'), wt = $(row,'.wt');
      d.o.forEach(v => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = v; b.style.cssText += ';min-height:32px;border-radius:9px'; b.onclick = () => answer(i, v); opts.appendChild(b); return b; });
      return { row, opts, vl, wt, ck:$(row,'.ck'), v:new Track(0), ckT:new Track(0), oh:new Track(i === 0 ? 44 : 0), ans:'' }; });
    slots.forEach((s,i) => { s.oh.jump(i === 0 ? 44 : 0); s.v.jump(0); s.ckT.jump(0); });
    dn.style.height = '0px';
    let n = 0;
    const answer = (i, val) => { const s = slots[i]; if (s.ans || (i > 0 && !slots[i-1].ans)) return; s.ans = val; n++;
      const t = now(), compact = cp.checked;
      s.vl.textContent = val; s.wt.style.display = 'none';
      [...s.opts.children].forEach(b => b.disabled = true);
      if (REDUCE){ s.ckT.jump(1); s.oh.jump(compact ? 0 : 44); eg.jump(n/3*120, n/3*120); csw.cur = n; csw.prev = n - 1; csw.t = t; }
      else { s.ckT.set(1); s.oh.set(compact ? 0 : 44, S.soft); eg.go(n/3*120, n/3*120); csw.to(n); }
      const nx = slots[i+1]; if (nx && !nx.ans){ REDUCE ? nx.oh.jump(44) : nx.oh.set(44, S.soft, t + EXIT); }
      if (n === 3){ const sum = `Booked · ${slots.map(x => x.ans).join(' ')}`;
        D[1].textContent = sum;
        if (REDUCE){ dsw.cur = 1; dsw.prev = 0; dsw.t = t; dh.jump(26); } else { dsw.to(1); dh.set(26, S.soft, t + .15); } } };
    $(st,'.rs').onclick = () => { n = 0; D[1].textContent = '';
      slots.forEach((s,i) => { s.ans = ''; s.vl.textContent = ''; s.wt.style.display = ''; [...s.opts.children].forEach(b => b.disabled = false);
        if (REDUCE){ s.ckT.jump(0); s.oh.jump(i === 0 ? 44 : 0); } else { s.ckT.set(0); s.oh.set(i === 0 ? 44 : 0, S.soft); } });
      if (REDUCE){ eg.jump(0, 0); csw.cur = 0; csw.prev = null; csw.t = -9; dsw.cur = 0; dsw.prev = null; dsw.t = -9; dh.jump(0); }
      else { eg.go(0, 0); csw.to(0); dsw.to(0); dh.set(0, S.base); } };
    cp.onchange = () => slots.forEach(s => { if (!s.ans) return;
      REDUCE ? s.oh.jump(cp.checked ? 0 : 44) : s.oh.set(cp.checked ? 0 : 44, S.base); });
    return t => { tr.style.width = clamp(eg.B.at(t)/120*100) + '%'; ld.style.width = clamp(eg.A.at(t)/120*100) + '%';
      C.forEach((e,k) => csw.apply(e,k,t));
      slots.forEach(s => { const c = clamp(s.ckT.at(t));
        s.ck.style.width = px(14*c); s.ck.style.opacity = c.toFixed(3);
        s.opts.style.height = px(Math.max(0, s.oh.at(t))); s.opts.style.opacity = clamp(s.oh.at(t)/44).toFixed(3); });
      dn.style.height = px(Math.max(0, dh.at(t))); D.forEach((e,k) => dsw.apply(e,k,t)); };
  }});

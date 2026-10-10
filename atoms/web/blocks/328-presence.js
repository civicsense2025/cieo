
atom({ id:'presencelive', cat:'Dynamic', name:'Presence avatars', block:'avatars, presence', fam:['S','M'],
  html:`<div class="card col" style="width:min(400px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><b style="font-size:15px;font-weight:600;line-height:1.45">Who is here</b><div class="stage" style="position:relative;height:40px"></div><div class="cap small muted num" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums">3 online · settled</div><div class="row" style="gap:8px;align-items:center"><button class="btn jn" style="min-height:32px">Join</button><button class="btn lv" style="min-height:32px">Leave</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="or" checked> owner ring</label></div></div><div class="hint">Joiners fan out · leavers shrink away</div>`,
  desc:'A joiner pops in at 60% scale and fans the stack out with stagger. A leaver shrinks in place, then the gap springs closed. The owner keeps a ring.',
  api:'slot[i].x.set(i·24, S.base, t + i·.05)   join: sc.jump(.6).set(1)',
  init(st){
    const stage = $(st,'.stage'), cap = $(st,'.cap'), or = $(st,'.or');
    const C = ['#6b5cff','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899'], N = ['A','B','C','D','E','F'];
    let order = [], gone = [], nextId = 0, lastEv = -9;
    const mk = id => { const e = document.createElement('span');
      e.style.cssText = `position:absolute;left:0;top:6px;width:28px;height:28px;border-radius:50%;background:${C[id % 6]};color:#fff;font:600 12px/1 var(--sans);display:grid;place-items:center;padding:0;border:2px solid var(--card)`;
      e.textContent = N[id % 6]; stage.appendChild(e);
      return { id, e, x:new Track(0), sc:new Track(1), o:new Track(1) }; };
    for (let i = 0; i < 3; i++){ const a = mk(nextId++); a.x.jump(i*24); order.push(a); }
    const layout = (t, keep) => order.forEach((a,i) => { if (a !== keep) a.x.set(i*24, S.base, t + i*.05); a.e.style.zIndex = 10 - i; });
    layout(-9); order.forEach((a,i) => a.e.style.zIndex = 10 - i);
    $(st,'button.jn').onclick = () => { if (order.length >= 6) return; const t = now(), a = mk(nextId++);
      a.x.jump(order.length*24 + 20); a.sc.jump(REDUCE ? 1 : .6); a.o.jump(0);
      order.push(a); lastEv = t;
      if (REDUCE){ a.o.jump(1); a.sc.jump(1); a.x.jump((order.length - 1)*24); layout(t); }
      else { a.o.set(1, S.snap, t); a.sc.set(1, S.base, t); a.x.set((order.length - 1)*24, S.base, t + .04); layout(t, a); } };
    $(st,'button.lv').onclick = () => { if (order.length <= 1) return; const t = now();
      const a = order.find(x => x.id !== 0) || order[order.length - 1];
      order = order.filter(x => x !== a); lastEv = t;
      if (REDUCE){ a.e.remove(); layout(t); }
      else { a.sc.set(.5, S.snap, t); a.o.set(0, S.snap, t); gone.push({ a, at:t + .14 }); layout(t); } };
    return t => { gone = gone.filter(g => { if (t < g.at) return true; g.a.e.remove(); return false; });
      order.forEach(a => { const p = clamp(a.o.at(t)), s = a.sc.at(t);
        a.e.style.opacity = p.toFixed(3);
        a.e.style.transform = `translate(${px(a.x.at(t))},0) scale(${s.toFixed(3)})`;
        const own = a.id === 0 && or.checked;
        a.e.style.boxShadow = own ? '0 0 0 2px var(--card), 0 0 0 4px var(--accent)' : 'none'; });
      const busy = gone.length || t - lastEv < 1;
      cap.textContent = `${order.length} online · ${busy ? 'updating' : 'settled'}`; };
  }});

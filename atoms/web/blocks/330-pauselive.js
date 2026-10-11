
atom({ id:'pauselive', cat:'Dynamic', name:'Pause-live buffer', block:'feed, ticker', fam:['S','M'], tall:true,
  html:`<div class="card col" style="width:min(420px,calc(100% - 24px));margin:0 auto;padding:15px 16px;gap:8px"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Deploy feed</b><span class="row" style="gap:6px;align-items:center;font-size:12px;line-height:1.5"><i class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--success)"></i><span class="pl num" style="font-variant-numeric:tabular-nums">Live</span></span></div><div class="list col" style="gap:0;min-height:136px"></div><div class="cap small muted" style="font-size:12px;line-height:1.5">Live · caught up</div><div class="row" style="gap:8px;align-items:center"><button class="btn ps" aria-label="Pause or resume" style="min-height:32px;position:relative"></button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer;margin-left:auto;font-size:12px"><input type="checkbox" class="kb" checked> keep buffer</label></div></div><div class="hint">Freeze to pile up · resume drains top-down</div>`,
  desc:'Freeze raises a paused pill with a rolling backlog count. Resume drains the backlog top-down with stagger, then the pill settles back to live.',
  api:'backlog.n.set(k)   drain[i].o.set(1, S.base, t + i·.12)',
  init(st){
    const list = $(st,'.list'), cap = $(st,'.cap'), ps = $(st,'.ps'), kb = $(st,'.kb'), pl = $(st,'.pl'), dot = $(st,'.dot');
    const sw = new Swap(0), L = ['Freeze','Resume'].map(x => { const e = document.createElement('span'); e.className = 'layer'; e.textContent = x; ps.appendChild(e); return e; });
    const EV = ['build passed','preview ready','edge cached','tests green','bundle cut','canary at 5%','rollback armed','logs shipped'];
    let items = ['build passed','preview ready','edge cached','tests green'], backlog = [], frozen = false, ei = 0, next = 1.4, queue = [];
    const rows = items.map(() => { const r = document.createElement('div');
      r.style.cssText = 'display:flex;justify-content:space-between;align-items:center;min-height:34px;padding:6px 0;font-size:13px;line-height:1.5';
      r.innerHTML = `<span class="m"></span><span class="n num small muted" style="font-size:12px;font-variant-numeric:tabular-nums"></span>`;
      list.appendChild(r); return { r, m:$(r,'.m'), n:$(r,'.n'), o:new Track(1), y:new Track(0) }; });
    const paint = () => rows.forEach((r,i) => { r.m.textContent = items[i] || ''; r.n.textContent = items[i] ? `#${ei - (3 - i)}` : ''; });
    paint();
    const push = t => { const ev = EV[ei % EV.length] + ' · #' + (++ei);
      if (!frozen){ items.push(ev); items.shift(); paint();
        rows.forEach((r,i) => { if (REDUCE){ r.o.jump(1); r.y.jump(0); } else if (i === 3){ r.o.jump(0); r.y.jump(6); r.o.set(1, S.base, t); r.y.set(0, S.base, t); } }); }
      else if (kb.checked) backlog.push(ev); };
    ps.onclick = () => { const t = now(); frozen = !frozen; sw.to(frozen ? 1 : 0);
      if (!frozen){ queue = backlog.map((ev,i) => ({ ev, at:t + .1 + i*.12 })); backlog = []; } };
    return t => { if (t >= next){ push(t); next = t + 1.4; }
      while (queue.length && t >= queue[0].at){ const { ev } = queue.shift();
        items.push(ev); items.shift(); paint();
        rows.forEach((r,i) => { const d = (3 - i)*.0 + (i === 3 ? 0 : .12);
          if (REDUCE){ r.o.jump(1); r.y.jump(0); } else if (i >= 1){ r.o.jump(.25); r.y.jump(5); r.o.set(1, S.base, t + (3 - i)*.05); r.y.set(0, S.base, t + (3 - i)*.05); } }); }
      rows.forEach(r => fade(r.r, r.o.at(t), r.y.at(t)));
      const n = backlog.length + queue.length;
      pl.textContent = frozen ? `Paused · ${n} buffered` : (n ? `Catching up · ${n}` : 'Live');
      dot.style.background = frozen ? 'var(--warning)' : 'var(--success)';
      cap.textContent = frozen ? (kb.checked ? `Holding · ${n} waiting` : 'Holding · new ticks dropped') : (n ? `Draining · ${n} left` : 'Live · caught up');
      L.forEach((e,k) => sw.apply(e,k,t)); };
  }});

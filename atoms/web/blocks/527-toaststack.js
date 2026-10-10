atom({ id:'toaststack', cat:'Overlays', name:'Toast stack pile', block:'Toast stack, polite announce', fam:['X','M'], tall:true,
  html:`<button class="btn ink add" style="min-height:36px">Show toast</button><div class="ts" role="status" aria-live="polite" style="position:absolute;left:50%;bottom:20px;width:min(300px,86%);transform:translateX(-50%);height:120px"></div><label class="row small muted" style="gap:6px;position:absolute;top:10px;right:12px"><input type="checkbox" class="ex" checked> expand on hover</label><div class="hint">Hover the pile to expand + pause timers</div>`,
  desc:'Newest slides in on base while older ones sink with soft depth. Hovering expands the pile and pauses timers; toasts announce politely, errors assertively.',
  api:'add: i.set(j, S.soft); hover: spread.set(1); timers pause while hover',
  init(st){
    const ts = $(st,'.ts'), ex = $(st,'.ex'), M = [['ok','Page published'],['warn','Storage 90% full'],['err','Couldn\u2019t reach the domain'],['ok','Invite sent']]; let list = [], all = [], k = 0, spread = new Track(0);
    ts.onpointerenter = () => { if (ex.checked) spread.set(1); }; ts.onpointerleave = () => spread.set(0, S.snap);
    const add = () => { const el = document.createElement('div'); el.className = 'card row';
      el.style.cssText += 'position:absolute;left:0;right:0;bottom:0;padding:12px 14px;gap:10px;cursor:default';
      const [kind, text] = M[k++ % M.length], col = { ok:'var(--success)', warn:'var(--warning)', err:'var(--danger)' }[kind];
      if (kind === 'err') el.setAttribute('role','alert'); else el.setAttribute('role','status');
      el.innerHTML = `<span style="width:24px;height:24px;border-radius:8px;background:${col}22;display:grid;place-items:center;padding:0;flex:none"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" style="transform:translateY(1px)"><path d="M5 12.5 10 17.5 19 7"/></svg></span><span class="small" style="flex:1;font-weight:500;font-size:13.5px;line-height:1.5"></span><button class="btn xx" style="min-height:36px;padding:4px 10px">Undo</button>`;
      el.querySelector('span.small').textContent = text; ts.appendChild(el);
      const T = { el, i:new Track(-1), o:new Track(0), born:now(), life:6 }; T.i.jump(-1); list.unshift(T); all.push(T); T.o.set(1); list.forEach((x,j) => x.i.set(j, S.soft));
      el.querySelector('.xx').onclick = ev => { ev.stopPropagation(); dismiss(T); }; el.onclick = () => dismiss(T); };
    const dismiss = T => { if (T.gone) return; T.gone = true; T.o.set(0, S.snap); list = list.filter(x => x !== T); list.forEach((x,j) => x.i.set(j, S.soft)); setTimeout(() => T.el.remove(), 1500); };
    $(st,'.add').onclick = add; add();
    return t => { const sp = clamp(spread.at(t));
      for (const T of [...list]) if (!ts.matches(':hover') && t - T.born > T.life) dismiss(T);
      all = all.filter(T => T.el.isConnected);
      for (const T of all){ const i = clamp(T.i.at(t),0,4), o = clamp(T.o.at(t)), gap = 10 + sp*34;
        T.el.style.transform = `translateY(${px(-Math.max(0,i)*gap + (1-o)*16)}) scale(${(.96+.04*o-Math.max(0,i)*.03).toFixed(4)})`;
        T.el.style.opacity = (o*clamp(3-i)).toFixed(3); T.el.style.zIndex = String(100-Math.round(i)); } };
  }});

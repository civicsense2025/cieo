

atom({ id:'toast', cat:'Admin', name:'Toast stack', block:'Toast primitive', fam:['X','D'], tall:true,
  html:`<button class="btn ink add" style="position:absolute;top:16px;left:50%;transform:translateX(-50%)">Show toast</button><div class="ts" style="position:absolute;left:50%;bottom:24px;width:min(300px,86%);transform:translateX(-50%)"></div><div class="hint" style="bottom:auto;top:72px">Swipe a toast sideways to dismiss</div>`,
  desc:'Success, warning and error toasts carry their status color on the icon and the action. New toasts push older ones back in depth. Drag one sideways 1:1; a long or fast swipe flings it out from release velocity, a short one springs home.',
  api:'x.release(x, vx, |x| > 100 || |vx| > 600 ? ±420 : 0)',
  init(st){
    const ts = $(st,'.ts'), M = [['ok','Page published'],['err','Couldn’t reach the domain'],['ok','Invite sent to maya@studio.co'],['warn','Storage 90% full'],['ok','Draft saved']]; let list = [], all = [], k = 0;
    const add = () => { const el = document.createElement('div'); el.className = 'card row'; el.style.cssText += 'position:absolute;left:0;right:0;bottom:0;padding:16px;gap:8px;touch-action:pan-y;cursor:grab;transform-origin:50% 100%';
      const [kind, text] = M[k++ % M.length], col = { ok:'var(--success)', err:'var(--danger)', warn:'var(--warning)' }[kind];
      const icon = kind === 'ok' ? '<path d="M5 12.5 10 17.5 19 7"/>' : '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>';
      el.setAttribute('role',kind==='err'?'alert':'status');
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" style="flex:none">${icon}</svg><span class="small" style="flex:1;font-weight:500"></span><button type="button" class="tc" aria-label="Dismiss notification" style="border:0;background:none;color:var(--muted);min-width:32px;min-height:32px;border-radius:8px">✕</button>`;
      el.querySelector('span').textContent = text; ts.appendChild(el);
      const T = { el, x:new Track(0), i:new Track(-1), o:new Track(0), held:false, hx:0, gone:false, born:now() }; T.i.jump(-1); list.unshift(T); all.push(T); T.o.set(1);
      list.forEach((x,j) => x.i.set(j));const close=el.querySelector('.tc');close.onpointerdown=e=>e.stopPropagation();close.onclick=()=>dismiss(T);
      drag(el, { down:p => { T.held = true; T.hx = T.x.at(); T.sx = p.cx - T.hx; }, move:p => { T.hx = p.cx - T.sx; }, up:(p,v) => { T.held = false; const out = Math.abs(T.hx) > 100 || Math.abs(v.vx) > 600;
        T.x.release(T.hx, v.vx, out ? Math.sign(T.hx || v.vx)*420 : 0); if (out) dismiss(T); } });
      if (list.length > 4) dismiss(list[list.length-1]); };
    const dismiss = T => { if (T.gone) return; T.gone = true;T.el.inert=true; T.o.set(0, S.snap); list = list.filter(x => x !== T); list.forEach((x,j) => x.i.set(j)); setTimeout(() => T.el.remove(), 1500/clock.scale); };
    $(st,'.add').onclick = add;add();list[0].born=Infinity;
    return t => { for (const T of [...list]) if (!T.held && t - T.born > 6) dismiss(T);
      all = all.filter(T => T.el.isConnected);
      for (const T of all){ const i = T.i.at(t), o = clamp(T.o.at(t)), x = T.held ? T.hx : T.x.at(t);
        T.el.style.transform = `translate(${px(x)}, ${px(-i*10 + (1 - o)*16)}) scale(${(1 - Math.max(0,i)*.05).toFixed(4)})`;
        T.el.style.opacity = (o*clamp(3 - i)*(1 - clamp(Math.abs(x)/420))).toFixed(3); T.el.style.zIndex = String(100 - Math.round(i)); T.el.style.pointerEvents = !T.gone && i < .5 ? 'auto' : 'none'; } };
  }});
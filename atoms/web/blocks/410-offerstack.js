atom({ id:'offerstack', cat:'Storefront', name:'Offer banner stack', block:'promo, banner, offers', fam:['D','E'],
  html:`<div class="col" style="gap:8px;width:min(320px,100%)"><h4 style="margin:0;font-size:15px;font-weight:600;line-height:1.5">Offers for you</h4><div class="stk" style="position:relative;height:118px"></div><label class="row small muted" style="gap:6px;cursor:pointer"><input type="checkbox" class="dp" checked> Depth effect</label></div><div class="hint">Drag the top card away, or tap dismiss</div>`,
  desc:'Promos rest pushed back in depth. The top card follows a drag and flings away on velocity, else springs home. Dismissing all holds a done terminal with undo.',
  api:'card[i].set(depth, base)   top.x.release(x, vx, fling ? off : home)',
  init(st){
    const O = [{ t:'20% off outerwear', s:'Ends Sunday', c:'var(--ink)' }, { t:'Free shipping over $100', s:'Members only', c:'var(--accent)' }, { t:'Extra 10% in cart', s:'Auto-applied', c:'var(--success)' }];
    const stk = $(st,'.stk'), dp = $(st,'.dp');
    const cards = O.map((o, i) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:12px;right:12px;top:0;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:flex;gap:10px;align-items:center;box-shadow:var(--shadow);touch-action:pan-y';
      d.innerHTML = `<span style="width:32px;height:32px;border-radius:10px;background:${o.c};color:#fff;padding:0;display:grid;place-items:center;flex:none;transform:translateY(.5px)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 7v12M12 7s-1.5-4-4.5-4S5 7 12 7zM12 7s1.5-4 4.5-4S19 7 12 7z"/></svg></span><span style="flex:1;min-width:0"><b style="display:block;font-size:14px;font-weight:600;line-height:1.5">${o.t}</b><span class="small muted" style="font-size:12px;line-height:1.5">${o.s}</span></span><button type="button" aria-label="Dismiss ${o.t}" style="width:32px;height:32px;padding:0;border:0;background:none;border-radius:8px;cursor:pointer;display:grid;place-items:center">✕</button>`;
      stk.appendChild(d); return { d, x:new Track(0), y:new Track(0), gone:new Track(0), q:null }; });
    const done = document.createElement('div'); done.style.cssText = 'position:absolute;left:12px;right:12px;top:0;border:1px dashed var(--line);border-radius:12px;padding:14px 16px;display:flex;gap:10px;align-items:center';
    done.innerHTML = `<b style="font-size:14px;line-height:1.5">You are all caught up</b><button type="button" style="margin-left:auto;height:32px;padding:0 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);cursor:pointer;font-size:13px">Undo</button>`;
    stk.appendChild(done); const doneT = new Track(0);
    const depth = i => dp.checked ? i : 0;
    const layout = () => { const live = cards.filter(c => c.gone.target === 0); live.forEach((c, i) => { c.y.set(depth(i) * 10, S.base); }); doneT.set(live.length ? 0 : 1, S.base); };
    const dismiss = c => { c.gone.set(1, S.base); layout(); };
    $(done,'button').onclick = () => { cards.forEach(c => { c.x.jump(0); c.gone.jump(0); }); layout(); };
    cards.forEach(c => { $(c.d,'button').onclick = ev => { ev.stopPropagation(); dismiss(c); };
      drag(c.d, { down:() => {}, move:p => { if (c.gone.target) return; c.x.jump(p.cx - p.w / 2); },
        up:(p, vel) => { if (c.gone.target) return; const live = cards.filter(k => k.gone.target === 0);
          if (live[0] !== c) { c.x.set(0, S.base); return; }
          if (Math.abs(p.cx - p.w / 2) > 90 || Math.abs(vel.vx) > 600) dismiss(c); else c.x.set(0, S.base); } }); });
    layout();
    return t => { const live = cards.filter(c => c.gone.target === 0);
      cards.forEach(c => { const g = clamp(c.gone.at(t)), x = c.x.at(t), y = c.y.at(t);
        const idx = Math.max(0, live.indexOf(c)), sc = 1 - (dp.checked ? idx * .04 : 0);
        c.d.style.transform = `translate(${px(x * (1 + g))},${px(y + g * -140)}) scale(${sc.toFixed(4)}) rotate(${(x * .02 * (1 - g)).toFixed(2)}deg)`;
        c.d.style.opacity = (1 - g).toFixed(3); c.d.style.visibility = g > .98 ? 'hidden' : 'visible'; c.d.style.zIndex = 10 - idx; });
      const d = clamp(doneT.at(t)); done.style.opacity = d.toFixed(3); done.style.visibility = d < .02 ? 'hidden' : 'visible'; };
  }});

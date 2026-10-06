atom({ id:'tabcards', cat:'Chrome', name:'Tab hover cards', block:'chrome, tabs, hovercard', fam:['S','M'],
  html:`<div class="col" style="gap:8px;max-width:460px;margin:0 auto;width:100%"><div style="font-size:15px;font-weight:600;line-height:1.5">Tab hover cards</div><div class="small muted" style="font-size:12.5px;line-height:1.5">Rest 300ms to preview &middot; &#8592;&#8594; move &middot; Enter pins &middot; Esc dismisses</div><div style="border:1px solid color-mix(in oklab, var(--ink) 14%, transparent);border-radius:12px;padding:15px;background:var(--card)"><div class="strip" role="tablist" tabindex="0" aria-label="Tabs" style="display:flex;gap:8px"></div><div class="stage" style="position:relative;height:132px;margin-top:8px;border-radius:10px;overflow:hidden"><div class="card" style="position:absolute;left:0;top:0;width:100%;border:1px solid color-mix(in oklab, var(--ink) 12%, transparent);border-radius:10px;padding:14px 16px;box-sizing:border-box;background:var(--card)"><div class="pv" style="position:relative;min-height:56px"></div><div class="cap small muted" style="font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums;margin-top:8px"></div></div></div></div><label class="row small muted" style="gap:6px;font-size:12px;line-height:1.5"><input type="checkbox" class="gl" checked> glide card tab-to-tab</label></div><div class="hint">Hover rests, then card rises &middot; arrows move &middot; Esc dismisses</div>`,
  desc:'Hover rests 300ms, then the card rises on a base spring at 97% rest height. Moving tab-to-tab glides position while the preview swap-blurs. Pinning holds a terminal. Reduced motion jumps instantly.',
  api:'x.set(tab*W,S.base); y.set(show?0:10); sw.to(tab)   end: pinned, hold',
  init(st){
    const TABS = [{t:'Docs',p:'Editor draft autosaves to this tab.'},{t:'Inbox',p:'4 unread threads wait here.'},{t:'Charts',p:'Weekly active users, up 12%.'}];
    const strip = $(st,'.strip'), card = $(st,'.card'), pv = $(st,'.pv'), cap = $(st,'.cap'), gl = $(st,'.gl');
    const put = (tr,v,c) => { if (REDUCE) tr.jump(v); else tr.set(v,c); };
    const x = new Track(0,S.base), y = new Track(10,S.base), o = new Track(0,S.base);
    const sw = new Swap(0);
    const layers = TABS.map((tb,i) => {
      const d = document.createElement('div');
      d.style.cssText = 'font-size:13.5px;line-height:1.5';
      d.innerHTML = '<div style="font-size:13.5px;font-weight:600;line-height:1.5"></div><div class="small muted" style="font-size:12.5px;line-height:1.5"></div>';
      d.firstChild.textContent = tb.t; d.lastChild.textContent = tb.p;
      pv.appendChild(d); return d;
    });
    const btns = TABS.map((tb,i) => {
      const b = document.createElement('button');
      b.textContent = tb.t; b.setAttribute('role','tab');
      b.style.cssText = 'flex:1;min-height:32px;border-radius:8px;border:1px solid color-mix(in oklab, var(--ink) 16%, transparent);background:transparent;font-size:13px;line-height:1.5;cursor:pointer';
      strip.appendChild(b);
      b.addEventListener('mouseenter', () => hover(i));
      b.addEventListener('focus', () => hover(i));
      b.addEventListener('click', () => { hover(i); pin(); });
      return b;
    });
    let cur = -1, shown = false, pinned = false, timer = 0;
    const W = () => Math.max(1, strip.offsetWidth / TABS.length);
    const show = i => {
      cur = i; shown = true;
      sw.to(i);
      put(x, gl.checked ? i*W() : x.target, S.base);
      if (!gl.checked) x.jump(i*W());
      put(y, 0, S.base); put(o, 1, S.base);
      cap.textContent = 'Tab ' + (i+1) + ' of ' + TABS.length + ' \u00B7 ' + TABS[i].t;
    };
    const hover = i => {
      if (pinned) { cur = i; sw.to(i); put(x, i*W(), S.base); cap.textContent = 'Pinned \u00B7 ' + TABS[i].t; return; }
      clearTimeout(timer);
      timer = setTimeout(() => show(i), REDUCE ? 0 : 300);
    };
    const hide = snap => { clearTimeout(timer); shown = false; put(y, 10, snap?S.snap:S.base); put(o, 0, snap?S.snap:S.base); };
    const pin = () => { pinned = true; cap.textContent = 'Pinned \u00B7 ' + TABS[cur].t + ' \u2713'; };
    strip.addEventListener('mouseleave', () => { if (!pinned) hide(false); });
    strip.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        const n = (cur < 0 ? 0 : (cur + (e.key === 'ArrowRight' ? 1 : TABS.length-1)) % TABS.length);
        show(n); btns[n].focus(); e.preventDefault();
      }
      else if (e.key === 'Enter'){ if (cur >= 0) pin(); e.preventDefault(); }
      else if (e.key === 'Escape'){ pinned = false; hide(true); e.preventDefault(); }
    });
    show(0); hide(false); show(0);
    return t => {
      card.style.transform = `translate(${x.at(t).toFixed(2)}px,${(y.at(t)*0.97).toFixed(2)}px)`;
      card.style.width = '97%';
      const oo = clamp(o.at(t)); card.style.opacity = oo.toFixed(3);
      card.style.visibility = oo < .02 ? 'hidden' : 'visible';
      layers.forEach((l,k) => sw.apply(l,k,t));
    };
  }});

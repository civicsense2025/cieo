

atom({ id:'resolvesweep', cat:'Writing', name:'Resolve sweep', block:'comment threads, resolve', fam:['M','E'],
  html:`<style>.btn{min-height:32px!important;border-radius:8px!important;font-size:13px!important;line-height:1.5!important}b,h4{font-size:15px!important;font-weight:600!important;line-height:1.5!important}.small{font-size:12.5px!important;line-height:1.5!important}.hint{font-size:12.5px!important;line-height:1.5!important}.card{line-height:1.5!important}.dg,.dn,.ctr,.ct,.iv,.len,.dm,.ds,.eg,.d{font-variant-numeric:tabular-nums!important}.av,.nd{padding:0!important;display:grid!important;place-items:center!important}</style><div class="col" style="margin:0 auto;width:min(340px,92%);gap:8px;padding:12px"><div class="row" style="align-items:center;gap:8px"><span class="small" style="font-weight:600">Open threads</span><span class="dg" aria-label="Open thread count"></span><span class="avs" style="display:flex;align-items:center" aria-hidden="true"></span><span style="flex:1"></span><button class="btn ink all">Resolve all</button></div><div class="col list" style="gap:8px"></div><button class="btn rs" style="align-self:flex-start">Reset</button></div><label class="row small muted" style="gap:8px;align-items:center;font-size:12.5px;line-height:1.5"><input type="checkbox" class="twk" checked> <span>Stack avatars</span></label><div class="hint">Resolve a thread, or all at once</div>`,
  desc:'Resolving fades a card and its height springs shut. The open count rolls down after, and the avatar stack fans shut with it.',
  api:'o.set(0,S.snap) h.set(0,S.base,t+EXIT) dg.set(n) fan.set(open/3) · REDUCE: instant',
  init(st){
    const T = [
      { n:'Maya', c:'#7c5cff', q:'Can we soften the lede? It reads harsh.' },
      { n:'Theo', c:'#e8734a', q:'The price needs a source before we ship.' },
      { n:'Pri', c:'#2f9e6e', q:'Closing date moved — please confirm July.' }
    ];
    const list = $(st,'.list'), avs = $(st,'.avs');
    const dg = new Digits($(st,'.dg'), 1); dg.dir = -1; dg.set(String(T.length), true);
    const fan = new Track(1); const o = [], h = [], H = [], done = [];
    const cards = T.map((c,i) => {
      const w = document.createElement('div'); w.style.cssText = 'overflow:hidden';
      const b = document.createElement('div'); b.className = 'card'; b.style.cssText = 'padding:14px 16px;display:flex;flex-direction:column;gap:6px';
      b.innerHTML = `<div class="row" style="gap:8px;align-items:center"><span class="av" style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:700;background:${c.c}">${c.n[0]}</span><span class="small" style="font-weight:600">${c.n}</span><span style="flex:1"></span><button class="btn rv" style="padding:2px 10px;font-size:12px">Resolve</button></div><span class="small">${c.q}</span>`;
      w.appendChild(b); list.appendChild(w);
      const av = document.createElement('span');
      av.style.cssText = `width:24px;height:24px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:700;background:${c.c};border:2px solid var(--card);margin-left:${i ? '-8px' : '0'};z-index:${T.length-i}`;
      av.textContent = c.n[0]; avs.appendChild(av);
      o.push(new Track(1, S.snap)); h.push(new Track(0)); H.push(0); done.push(false);
      return { w, b, av, btn:$(b,'.rv') };
    });
    requestAnimationFrame(() => cards.forEach((c,i) => { H[i] = c.b.offsetHeight; if (!done[i]) h[i].jump(H[i]); }));
    const open = () => done.filter(d => !d).length;
    const after = (dly, fn) => setTimeout(fn, REDUCE ? 0 : dly);
    const resolve = (i, at) => {
      if (done[i]) return; done[i] = true; const t0 = at ?? now();
      if (REDUCE){ o[i].jump(0); h[i].jump(0); }
      else { o[i].set(0, S.snap, t0); h[i].set(0, S.base, t0 + EXIT); }
      cards[i].btn.disabled = true;
      after(EXIT*1000 + 60, () => { dg.dir = -1; dg.set(String(open())); fan.set(open()/T.length, S.base); });
    };
    $(st,'.all').onclick = () => { const t0 = now(); let k = 0; done.forEach((d,i) => { if (!d) resolve(i, t0 + (k++)*LAG); }); };
    cards.forEach((c,i) => c.btn.onclick = () => resolve(i));
    $(st,'.rs').onclick = () => {
      done.fill(false); dg.dir = 1;
      cards.forEach((c,i) => { c.btn.disabled = false;
        if (REDUCE){ o[i].jump(1); h[i].jump(H[i]); } else { h[i].set(H[i], S.base); o[i].set(1, S.snap, now() + EXIT); }
      });
      if (REDUCE) dg.set(String(T.length), true); else after(120, () => dg.set(String(T.length)));
      fan.set(1, S.base);
    };
    const av0 = cards.map(c => c.av);
    return t => {
      cards.forEach((c,i) => { c.w.style.height = px(Math.max(0, h[i].at(t))); fade(c.b, o[i].at(t), (1-clamp(o[i].at(t)))*6); });
      dg.render(t);
      const f = clamp(fan.at(t));
      av0.forEach((a,i) => { a.style.transform = `translateX(${(-i*(1-f)*10).toFixed(2)}px) scale(${(0.85+0.15*f).toFixed(3)})`; a.style.opacity = (i < open() || open() === T.length ? 1 : 0.35).toFixed(2); });
    };
  }});

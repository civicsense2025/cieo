

atom({ id:'siteheader', cat:'Editor', name:'Site header', block:'site-header, nav-menu, search-trigger, cta-button, reading-progress', fam:['M','E','S','X','D'], wide:true, tall:true,
  html:`<style>
.sh{position:absolute;inset:10px 12px;isolation:isolate;border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden;text-align:left}
.sh-pg{position:absolute;inset:0;overflow:auto;overscroll-behavior:contain}
.sh-hd{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:8px;padding:0 20px;background:var(--card);border-bottom:1px solid var(--line-soft)}
.sh-sd{position:absolute;left:0;right:0;top:0;bottom:-1px;pointer-events:none;box-shadow:var(--shadow);opacity:0;z-index:-1}
.sh-lg{display:flex;align-items:center;gap:8px;flex:none;white-space:nowrap;font-weight:600;font-size:16px;letter-spacing:-.02em;color:var(--ink);text-decoration:none;transform-origin:0 50%;margin-right:12px}
.sh-lw{flex:none;display:flex}
.sh-mk{width:22px;height:22px;border-radius:7px;background:var(--ink);flex:none}
.sh-nv{position:relative;display:flex;gap:2px;flex:none;white-space:nowrap}
.sh-ln{position:relative;display:flex;align-items:center;height:36px;padding:0 12px;font-size:14px;font-weight:500;color:var(--muted);text-decoration:none}
.sh-ln[aria-current="page"]{color:var(--ink)}
.sh-hl{position:absolute;left:0;top:0;bottom:0;border-radius:8px;background:var(--raised);opacity:0}
.sh-ul{position:absolute;left:0;bottom:3px;height:2px;border-radius:1px;background:var(--ink)}
.sh-rt{margin-left:auto;display:flex;align-items:center;gap:8px;flex:none}
.sh-sx{position:relative;height:36px;border-radius:18px;background:var(--raised);overflow:hidden;flex:none}
.sh-sb{position:absolute;left:0;top:0;width:36px;height:36px;border:0;background:none;cursor:pointer;display:grid;place-items:center}
.sh-sx input{position:absolute;left:34px;right:12px;top:0;height:36px;border:0;background:none;color:var(--ink);font:14px var(--sans);outline:none;user-select:text;-webkit-user-select:text}
.sh-cta{height:36px;padding:0 14px;border-radius:9px;border:1px solid var(--ink);background:var(--ink);color:var(--card);font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap}
.sh-mb{display:none;position:relative;width:36px;height:36px;border:0;background:none;cursor:pointer;flex:none}
.sh-mb i{position:absolute;top:0;left:9px;width:18px;height:2px;border-radius:1px;background:var(--ink)}
.sh-rp{position:absolute;left:0;bottom:-1px;height:2px;background:var(--accent)}
.sh-mp{position:absolute;left:0;right:0;top:0;z-index:4;overflow:hidden;background:var(--card);visibility:hidden}
.sh-mp .col{padding:10px 20px 16px;gap:0}
.sh-mp a{display:block;padding:4px 0;font-size:24px;line-height:1.2;font-weight:600;letter-spacing:-.025em;color:var(--ink);text-decoration:none}
.sh-ar{max-width:640px;margin:0 auto;padding:40px 20px 90px;line-height:1.65}
.sh-ar p{margin:0 0 14px;color:var(--muted)}
.sh[data-n] .sh-hd{padding:0 12px}
.sh[data-n] .sh-nv,.sh[data-n] .sh-cta{display:none}
.sh[data-n] .sh-mb{display:block}
</style><div class="sh"><div class="sh-pg" tabindex="0" aria-label="Scrollable sample page">
<header class="sh-hd"><i class="sh-sd"></i><div class="sh-lw"><a href="#" class="sh-lg" aria-label="Fieldstone home"><i class="sh-mk"></i><span>Fieldstone</span></a></div><nav class="sh-nv" aria-label="Main"><i class="sh-hl"></i><i class="sh-ul"></i></nav>
<div class="sh-rt"><div class="sh-sx"><button type="button" class="sh-sb" aria-label="Search" aria-expanded="false">${ic(I.search,16)}</button><input id="siteheader-q" type="search" placeholder="Search the site" aria-label="Search the site" autocomplete="off"></div><button type="button" class="sh-cta">Start free</button><button type="button" class="sh-mb" aria-label="Open menu" aria-expanded="false" aria-controls="siteheader-menu"><i></i><i></i><i></i></button></div><i class="sh-rp"></i></header>
<article class="sh-ar"><p class="small" style="margin-bottom:6px">Journal · 6 minute read</p><h1 style="font-size:30px;line-height:1.1;letter-spacing:-.035em;margin:0 0 18px;font-weight:600;text-wrap:balance">What a dry stone wall teaches about page layout</h1></article>
</div><nav class="sh-mp" id="siteheader-menu" aria-label="Menu"><div class="col"></div></nav></div>`,
  desc:'Scroll the page: the progress bar tracks the scroll position one to one, and once you pass 16px the header compacts, with its height, logo scale and shadow all moving on one spring. Hovering a link slides a plate between links with lagging edges. The search button widens into a field, folding the nav (or the logo, when narrow) out of its way. Narrow: the menu button morphs into a cross and the panel opens below the header, then each link enters 40ms after the last.',
  api:'bar = scrollTop / max   hdr.set(scrollTop > 16)   plate.go(l, r)   search.w.set(open ? W : 36)   link[i].o.set(1, S.base, t + .08 + i·.04)',
  init(st){
    const sh = $(st,'.sh'), pg = $(st,'.sh-pg'), hd = $(st,'.sh-hd'), sd = $(st,'.sh-sd'), lg = $(st,'.sh-lg'), lw = $(st,'.sh-lw'), nv = $(st,'.sh-nv'), hl = $(st,'.sh-hl'), ul = $(st,'.sh-ul'), sx = $(st,'.sh-sx'), sb = $(st,'.sh-sb'), inp = $(st,'.sh-sx input'),
      cta = $(st,'.sh-cta'), mb = $(st,'.sh-mb'), lines = $$(mb,'i'), rp = $(st,'.sh-rp'), mp = $(st,'.sh-mp'), col = $(mp,'.col'), ar = $(st,'.sh-ar');
    const NAV = ['Work','Journal','Pricing','About'];
    ar.insertAdjacentHTML('beforeend', ['Every wall in the valley was built without mortar. The builder picks a stone, turns it twice, and sets it where it already wants to sit.',
      'Layout works the same way. A good section is not forced into a grid; it is placed against the sections around it until the load runs cleanly down.',
      'We rebuilt the Fieldstone homepage this spring from nine blocks. Each one carries its own spacing, so moving a block never means fixing three others.',
      'The header was the hard one. It has to be calm at the top of the page, and then get out of the way once you start reading.',
      'That is why it compacts after sixteen pixels of scroll: shorter, with a smaller logo and a soft shadow, so the content underneath keeps the screen.',
      'The thin line under it is a reading bar. It does nothing clever. It is the scroll position, drawn one to one, so you always know how much is left.',
      'Search lives in the same row. It stays a single icon until you ask for it, then it widens and the links step aside instead of wrapping.',
      'On a phone the links fold into a menu. The panel opens from under the header and the links arrive one after another, never all at once.',
      'None of this is decoration. Each movement answers one question: what changed, and where did it go?'].map(s => `<p>${s}</p>`).join(''));
    const links = NAV.map((n,i) => { const a = document.createElement('a'); a.href = '#'; a.className = 'sh-ln'; a.textContent = n; if (i === 1) a.setAttribute('aria-current','page'); nv.appendChild(a); return a; });
    const mlinks = NAV.map(n => { const a = document.createElement('a'); a.href = '#'; a.textContent = n; col.appendChild(a); return { a, o:new Track(0) }; });
    const mcta = document.createElement('button'); mcta.type = 'button'; mcta.className = 'sh-cta'; mcta.textContent = 'Start free'; mcta.style.cssText = 'display:block;margin-top:12px;width:100%;height:44px'; col.appendChild(mcta);
    const mitems = [...mlinks, { a:mcta, o:new Track(0) }];
    // collapsible slots: width and opacity spring together so the search can take their room
    const coll = el => ({ el, p:new Track(1), nat:0, measure(){ if (this.p.target === 1 && el.offsetParent){ el.style.width = 'auto'; this.nat = el.scrollWidth; } },
      draw(t){ const p = clamp(this.p.at(t)); if (p > .999){ el.style.width = 'auto'; el.style.overflow = 'visible'; el.style.opacity = '1'; } else { el.style.width = px(p*this.nat); el.style.overflow = 'hidden'; el.style.opacity = p.toFixed(3); } } });
    const navC = coll(nv), logoC = coll(lw);
    const h = edges(0,0), u = edges(0,0), ho = new Track(0, S.snap), c = new Track(0), cp = new Track(0, S.snap), sxw = new Track(36), sio = new Track(0), mo = new Track(0);
    let cur = 1, shown = false, narrow = null, searchOn = false, menuOn = false;
    const g = a => [a.offsetLeft, a.offsetLeft + a.offsetWidth];
    links.forEach((a,i) => { a.onpointerenter = () => { const [l,r] = g(a); shown ? h.go(l, r) : h.jump(l, r); shown = true; ho.set(1, S.base); };
      a.onclick = e => { e.preventDefault(); links[cur].removeAttribute('aria-current'); cur = i; a.setAttribute('aria-current','page'); const [l,r] = g(a); u.go(l + 12, r - 12); }; });
    nv.onpointerleave = () => { shown = false; ho.set(0, S.snap); };
    const underline = inst => { const [l,r] = g(links[cur]); inst ? u.jump(l + 12, r - 12) : u.go(l + 12, r - 12); };
    pg.onscroll = () => c.set(pg.scrollTop > 16 ? 1 : 0);
    cta.onpointerdown = () => cp.set(1); cta.onpointerup = cta.onpointerleave = () => cp.set(0);
    const setSearch = on => { searchOn = on; sb.setAttribute('aria-expanded', on); const t0 = now(), W = hd.clientWidth, n = pg.clientWidth < 640;
      sxw.set(on ? (n ? Math.max(120, W - 76) : 220) : 36); sio.set(on ? 1 : 0, on ? S.base : S.snap, on ? t0 + .12 : t0);
      logoC.p.set(on && n ? 0 : 1); navC.p.set(on && !n && W < 980 ? 0 : 1); if (on) setTimeout(() => inp.focus(), 0); };
    sb.onclick = () => setSearch(!searchOn);
    inp.onkeydown = e => { if (e.key === 'Escape'){ e.stopPropagation(); inp.value = ''; inp.blur(); setSearch(false); sb.focus(); } };
    inp.onblur = () => { if (!inp.value && searchOn) setSearch(false); };
    const setMenu = (on, inst) => { menuOn = on; mb.setAttribute('aria-expanded', on); mb.setAttribute('aria-label', on ? 'Close menu' : 'Open menu'); const t0 = now();
      if (inst){ mo.jump(on ? 1 : 0); mitems.forEach(x => x.o.jump(on ? 1 : 0)); return; }
      mo.set(on ? 1 : 0); mitems.forEach((x,i) => on ? x.o.set(1, S.base, t0 + .08 + i*.04) : x.o.set(0, S.snap, t0)); if (on) setTimeout(() => mlinks[0].a.focus(), 0); };
    mb.onclick = () => setMenu(!menuOn);
    mitems.forEach(x => x.a.onclick = e => { e.preventDefault(); if (menuOn) setMenu(false); });
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOn){ setMenu(false); mb.focus(); } });
    const measure = () => { navC.measure(); logoC.measure(); };
    const relayout = () => { measure(); underline(true); };
    const init = () => { narrow = pg.clientWidth < 640; sh.toggleAttribute('data-n', narrow); relayout(); }; document.fonts.ready.then(init); requestAnimationFrame(init);
    addEventListener('resize', () => { if (narrow !== null) relayout(); });
    return t => {
      const n = pg.clientWidth < 640; if (n !== narrow){ narrow = n; sh.toggleAttribute('data-n', n); if (!n && menuOn) setMenu(false, true); if (searchOn) setSearch(false); relayout(); }
      const k = clamp(c.at(t)); hd.style.height = px(lerp(narrow ? 60 : 76, narrow ? 52 : 56, k)); lg.style.transform = `scale(${lerp(1.14, 1, k).toFixed(4)})`; sd.style.opacity = k.toFixed(3);
      const max = pg.scrollHeight - pg.clientHeight; rp.style.width = (max > 0 ? pg.scrollTop/max*100 : 0).toFixed(2) + '%';
      navC.draw(t); logoC.draw(t);
      const a = h.A.at(t), b = h.B.at(t); hl.style.transform = `translateX(${px(a)})`; hl.style.width = px(b - a); hl.style.opacity = clamp(ho.at(t)).toFixed(3);
      const c2 = u.A.at(t), d = u.B.at(t); ul.style.transform = `translateX(${px(c2)})`; ul.style.width = px(d - c2);
      sx.style.width = px(sxw.at(t)); fade(inp, sio.at(t), null); inp.style.visibility = sio.at(t) < .01 ? 'hidden' : 'visible';
      cta.style.transform = `scale(${(1 - .03*clamp(cp.at(t))).toFixed(4)})`;
      const p = clamp(mo.at(t)), hh = hd.offsetHeight;
      lines[0].style.transform = `translateY(${px(11 + 6*p)}) rotate(${(45*p).toFixed(2)}deg)`; lines[1].style.transform = 'translateY(17px)'; lines[1].style.opacity = (1 - p).toFixed(3); lines[2].style.transform = `translateY(${px(23 - 6*p)}) rotate(${(-45*p).toFixed(2)}deg)`;
      mp.style.top = px(hh); mp.style.height = px(p*Math.max(0, sh.clientHeight - hh)); mp.style.visibility = p < .01 ? 'hidden' : 'visible'; mp.style.pointerEvents = p > .5 ? 'auto' : 'none';
      mitems.forEach(x => { const o = clamp(x.o.at(t)); fade(x.a, o, (1 - o)*8); });
    };
  }});
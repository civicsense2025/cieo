

/* ---------- Storefront (lane: commerce) ---------- */
(() => {
const CART_PATH = '<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/>';
const rel = (root, el) => relRect(root, el.getBoundingClientRect());
const spin = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 0 1 9 9"/></svg>';

// two-layer text swap: the new text is written to the idle layer, then the layers blur-swap
function textSwap(host, align = 'flex-start'){
  const L = [0,1].map(() => { const e = document.createElement('span'); e.className = 'layer'; e.style.justifyContent = align; host.appendChild(e); return e; });
  const sw = new Swap(0); let key = null;
  return {
    set(html, color, inst){
      const k = html + '|' + color; if (k === key) return; key = k;
      const n = inst ? sw.cur : 1 - sw.cur; L[n].innerHTML = html; L[n].style.color = color || '';
      if (inst){ sw.prev = null; sw.t = -9; } else sw.to(n);
    },
    apply(t){ L.forEach((e,k) => sw.apply(e, k, t)); }
  };
}

/* ======================================================================== product page */
const COL = { ink:{ n:'Ink', c:'var(--ink)', base:142 }, moss:{ n:'Moss', c:'var(--accent)', base:128 }, stone:{ n:'Stone', c:'var(--faint)', base:128 } };
const SZ = ['S','M','L','XL'];
const STK = { ink:[4,11,0,2], moss:[0,6,9,3], stone:[7,0,3,14] };
const BG = ['var(--raised)','var(--line-soft)','var(--raised)','var(--line-soft)'];
const garment = v => {
  const body = 'M32 22 L44 17 Q50 24 56 17 L68 22 L90 46 L80 58 L72 52 L72 106 L28 106 L28 52 L20 58 L10 46 Z';
  const ln = 'fill="none" stroke="var(--card)" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"';
  const front = `<path d="${body}" fill="var(--pp-c)"/><path d="M44 17 Q50 26 56 17" ${ln}/><path d="M50 25 V106" ${ln}/>` + [36,52,68,84,98].map(y => `<circle cx="50" cy="${y}" r="1.5" fill="var(--card)" fill-opacity=".6"/>`).join('') + `<rect x="33.5" y="60" width="11" height="13" rx="1.5" ${ln}/><rect x="55.5" y="60" width="11" height="13" rx="1.5" ${ln}/>`;
  const back = `<path d="${body}" fill="var(--pp-c)"/><path d="M44 17 Q50 21 56 17" ${ln}/><path d="M29 38 Q50 46 71 38" ${ln}/><path d="M50 46 V106" ${ln}/>`;
  const g = [front, back, `<g transform="translate(-55 -18) scale(2.1)">${front}</g>`, `<ellipse cx="50" cy="112" rx="34" ry="3.5" fill="var(--ink)" fill-opacity=".1"/><g transform="translate(3 -2) rotate(-10 50 62) scale(.9)">${back}</g>`][v];
  return `<svg viewBox="0 0 100 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${g}</svg>`;
};

atom({ id:'productpage', cat:'Storefront', name:'Product page', block:'product, gallery, cart, line-items', fam:['M','S','D','E','X'], wide:true, tall:true,
  html:`<style>
.pp{position:absolute;inset:0;container-type:inline-size;display:flex;flex-direction:column;padding:0 16px 12px;text-align:left}
.pp-hd{height:44px;flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%}
.pp-bd{flex:1;min-height:0;width:100%;max-width:780px;margin:0 auto}
.pp-in{display:flex;gap:16px;height:100%}
.pp-gal{display:flex;gap:10px;flex:none;height:100%;min-height:0}
.pp-th{--th:56px;position:relative;order:-1;display:flex;flex-direction:column;gap:8px;flex:none;align-self:flex-start}
.pp-tb{width:var(--th);height:var(--th);padding:0;border:0;border-radius:10px;overflow:hidden;cursor:pointer;display:block}
.pp-pl{position:absolute;left:0;top:0;border:2px solid var(--ink);border-radius:10px;pointer-events:none;z-index:1}
.pp-vp{position:relative;width:230px;height:100%;overflow:hidden;border-radius:12px;touch-action:pan-y;cursor:grab;background:var(--raised)}
.pp-vp:active{cursor:grabbing}
.pp-st{display:flex;width:100%;height:100%}
.pp-sl{flex:none;width:100%;height:100%}
.pp-if{flex:1;min-width:0;max-width:340px;display:flex;flex-direction:column;justify-content:center;gap:10px}
.pp-if>*{flex:none}
.pp-nm{margin:0;font-size:19px;letter-spacing:-.02em;font-weight:600;line-height:1.2}
.pp-pr{display:flex;align-items:center;gap:1px;font-size:24px;font-weight:600;letter-spacing:-.02em;line-height:1.25}
.pp-sk{position:relative;height:18px;font-size:13px;font-weight:500}
.pp-lb{display:flex;gap:6px;font-size:13px;font-weight:500;margin-bottom:6px}
.pp-sw{display:flex;gap:12px;padding:3px 4px}
.pp-sb{position:relative;width:24px;height:24px;border-radius:50%;border:1px solid var(--line);padding:0;cursor:pointer}
.pp-rg{position:absolute;inset:-5px;border:2px solid var(--ink);border-radius:50%;pointer-events:none;opacity:0}
.pp-cp{display:flex;flex-wrap:wrap;gap:6px}
.pp-ch{min-width:38px;height:30px;padding:0 8px;border-radius:8px;border:1.5px solid var(--line);background:var(--card);font-size:13px;font-weight:500;cursor:pointer}
.pp-ch:disabled{cursor:not-allowed;text-decoration:line-through}
.pp-ad{position:relative;height:40px;border:0;border-radius:10px;font-weight:500;cursor:pointer;overflow:hidden;background:var(--ink);color:var(--card);margin-top:2px}
.pp-ct{position:relative;width:36px;height:36px;border:0;background:none;cursor:pointer;display:grid;place-items:center;border-radius:10px}
.pp-bg{position:absolute;left:19px;top:1px;height:18px;min-width:18px;padding:0 5px;border-radius:9px;background:var(--ink);color:var(--card);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;opacity:0}
.pp-sc{position:absolute;inset:0;background:#0C1016;opacity:0;pointer-events:none;z-index:28}
.pp-dr{position:absolute;top:0;right:0;bottom:0;width:min(300px,88%);background:var(--card);box-shadow:var(--shadow);z-index:30;display:flex;flex-direction:column;padding:12px 14px;gap:8px;visibility:hidden}
.pp-dh{display:flex;align-items:center;justify-content:space-between;height:28px}
.pp-dx{width:28px;height:28px;border:0;background:none;border-radius:8px;cursor:pointer;display:grid;place-items:center}
.pp-dl{position:relative;flex:1;min-height:0;overflow-y:auto}
.pp-em{position:absolute;left:0;top:6px;margin:0}
.pp-lr{height:74px;padding-bottom:8px;display:flex;gap:10px;align-items:flex-start}
.pp-lh{flex:none;width:44px;height:58px;border-radius:8px;overflow:hidden;background:var(--raised)}
.pp-lc{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pp-qb{width:24px;height:24px;padding:0;border-radius:7px;line-height:1}
.pp-gh{position:absolute;left:0;top:0;width:48px;height:58px;border-radius:9px;overflow:hidden;border:1px solid var(--line);z-index:25;pointer-events:none}
@container (max-width:559px){
  .pp{padding:0 12px 10px}
  .pp-in{gap:10px}
  .pp-gal{flex-direction:column;gap:8px;width:124px}
  .pp-th{--th:28px;order:0;flex-direction:row;gap:4px}
  .pp-vp{width:124px;height:auto;flex:1;min-height:0}
  .pp-if{gap:8px}
  .pp-nm{font-size:16px}
  .pp-pr{font-size:20px}
  .pp-cp{gap:4px}
  .pp-ch{min-width:30px;padding:0 4px}
  .pp-sw{gap:10px}
  .pp-ad{height:36px}
}
</style>
<div class="pp">
  <header class="pp-hd"><span class="small muted">Shop / Outerwear</span><button type="button" class="pp-ct" aria-haspopup="dialog" aria-expanded="false" aria-label="Open cart, empty">${ic(CART_PATH,22,1.75)}<span class="pp-bg"><span class="pp-cd"></span></span></button></header>
  <div class="pp-bd"><div class="pp-in">
    <div class="pp-gal">
      <div class="pp-vp" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Product image 1 of 4"><div class="pp-st"></div></div>
      <div class="pp-th" role="group" aria-label="Choose image"><i class="pp-pl"></i></div>
    </div>
    <div class="pp-if">
      <h4 class="pp-nm">Everyday overshirt</h4>
      <div class="pp-pr"><span>$</span><span class="pp-d"></span></div>
      <div class="pp-sk" role="status"></div>
      <div><div class="pp-lb"><span>Color</span><span class="pp-cn muted"></span></div><div class="pp-sw" role="group" aria-label="Color"></div></div>
      <div><div class="pp-lb"><span>Size</span></div><div class="pp-cp" role="group" aria-label="Size"></div></div>
      <button type="button" class="pp-ad"></button>
    </div>
  </div></div>
  <div class="pp-sc"></div>
  <section class="pp-dr" role="dialog" aria-modal="true" aria-label="Cart">
    <div class="pp-dh"><b>Your cart</b><button type="button" class="pp-dx" aria-label="Close cart">${ic(I.x,16)}</button></div>
    <div class="pp-dl"><p class="pp-em small muted">Your cart is empty.</p></div>
    <div class="col" style="gap:8px"><div class="row" style="justify-content:space-between"><span class="small muted">Subtotal</span><b class="num pp-su"></b></div><button type="button" class="btn ink pp-cs" style="height:36px">Continue shopping</button></div>
  </section>
</div>`,
  desc:'Selecting a thumbnail slides the main image in the direction of travel, and the selection plate stretches to it with the leading edge first. The main image also follows a drag 1:1 and settles from release velocity. A color change morphs the garment’s fill, price digits roll, and the stock line blur-swaps. Add to cart runs in order: button confirms, a copy of the image arcs to the cart icon, the badge count rolls on arrival 400ms later, then the drawer slides in from the right when opened.',
  api:'gallery.x.release(x, v, i·W)   plate.go(l, r)   price.set(n)   fly(p = prog(t − t0)); cart.set(n, t0 + .4)   drawer.x.set(open ? 0 : W)',
  init(st){
    const root = $(st,'.pp'), ct = $(st,'.pp-ct'), vp = $(st,'.pp-vp'), strip = $(st,'.pp-st'), thw = $(st,'.pp-th'), pl = $(st,'.pp-pl'), bd = $(st,'.pp-bd');
    const swW = $(st,'.pp-sw'), cpW = $(st,'.pp-cp'), ad = $(st,'.pp-ad'), cn = $(st,'.pp-cn'), scr = $(st,'.pp-sc'), dr = $(st,'.pp-dr');
    const dd = new Digits($(st,'.pp-d'), 3), bg = $(st,'.pp-bg'), cd = new Digits($(st,'.pp-cd'), 2), dl = $(st,'.pp-dl'), em = $(st,'.pp-em'), su = $(st,'.pp-su'), xb = $(st,'.pp-dx');
    const stk = textSwap($(st,'.pp-sk'));
    let q = [];

    /* gallery: strip + selection plate */
    const slides = BG.map((bgc, v) => { const s = document.createElement('div'); s.className = 'pp-sl'; s.style.background = bgc; s.innerHTML = garment(v); strip.appendChild(s); return s; });
    const ths = BG.map((bgc, v) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-tb'; b.style.background = bgc; b.innerHTML = garment(v); b.setAttribute('aria-label', `Show image ${v + 1} of 4`); thw.appendChild(b); return b; });
    const ts = ths.map((b, i) => new Track(i === 0 ? 1 : 0));
    const gx = new Track(0), ex = edges(0,0), ey = edges(0,0);
    let W = 230, cur = 0, held = false, hx = 0, sx = 0, from = 0;
    const place = inst => { const b = ths[cur], f = inst ? 'jump' : 'go'; ex[f](b.offsetLeft, b.offsetLeft + b.offsetWidth); ey[f](b.offsetTop, b.offsetTop + b.offsetHeight); };
    const mark = () => { ths.forEach((b, i) => { b.setAttribute('aria-pressed', i === cur); ts[i].set(i === cur ? 1 : 0); }); vp.setAttribute('aria-label', `Product image ${cur + 1} of 4`); };
    const goto = (i, v = 0) => { cur = clamp(i, 0, 3); gx.release(held ? hx : gx.at(), v, cur * W); place(false); mark(); };
    ths.forEach((b, i) => b.onclick = () => goto(i));
    drag(vp, { down:p => { held = true; from = cur; sx = gx.at() + p.cx; hx = gx.at(); },
      move:p => { let v = sx - p.cx; if (v < 0) v = rb(v, 60); if (v > 3*W) v = 3*W + rb(v - 3*W, 60); hx = v; },
      up:(p, vel) => { goto(clamp(Math.round((hx + (-vel.vx)*.2)/W), from - 1, from + 1), -vel.vx); held = false; } });
    vp.onkeydown = e => { if (e.key === 'ArrowRight'){ goto(cur + 1); e.preventDefault(); } if (e.key === 'ArrowLeft'){ goto(cur - 1); e.preventDefault(); } };
    const relayout = () => { const w = vp.clientWidth; if (!w) return; W = w; gx.jump(cur * W); place(true); };
    new ResizeObserver(relayout).observe(root); document.fonts.ready.then(relayout);
    mark(); ths.forEach((b, i) => ts[i].jump(i === cur ? 1 : 0));

    /* variants */
    let col = 'moss', sz = 1, prevC = COL.moss.c, curC = COL.moss.c, lastFill = '';
    const cm = new Track(1), cKeys = Object.keys(COL);
    const sws = cKeys.map(k => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-sb'; b.style.background = COL[k].c; b.setAttribute('aria-label', COL[k].n); b.innerHTML = '<i class="pp-rg"></i>'; swW.appendChild(b); return b; });
    const rgs = sws.map(b => $(b,'.pp-rg')), sT = sws.map(() => new Track(0));
    const chs = SZ.map(s => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-ch'; b.textContent = s; cpW.appendChild(b); return b; });
    const cS = chs.map(() => new Track(0)), cD = chs.map(() => new Track(0));
    const price = () => COL[col].base + (sz === 3 ? 8 : 0);
    let shownPrice = null;
    const refresh = inst => {
      if (STK[col][sz] <= 0){ for (let d = 1; d < 4; d++){ const j = [sz + d, sz - d].find(x => x >= 0 && x < 4 && STK[col][x] > 0); if (j !== undefined){ sz = j; break; } } }
      const k = inst ? 'jump' : 'set';
      chs.forEach((b, i) => { const out = STK[col][i] <= 0; b.disabled = out; b.setAttribute('aria-pressed', i === sz); b.setAttribute('aria-label', `Size ${SZ[i]}${out ? ', sold out' : ''}`); cS[i][k](i === sz ? 1 : 0); cD[i][k](out ? 1 : 0); });
      sws.forEach((b, i) => { b.setAttribute('aria-pressed', cKeys[i] === col); sT[i][k](cKeys[i] === col ? 1 : 0); });
      cn.textContent = COL[col].n;
      const p = price(); if (p !== shownPrice){ dd.dir = shownPrice !== null && p < shownPrice ? -1 : 1; dd.set(String(p), inst); shownPrice = p; }
      const n = STK[col][sz], low = n <= 5; stk.set(low ? `Only ${n} left` : 'In stock', low ? 'var(--warning)' : 'var(--success)', inst);
    };
    sws.forEach((b, i) => b.onclick = () => { if (cKeys[i] === col) return; prevC = cm.at() > .5 ? curC : prevC; col = cKeys[i]; curC = COL[col].c; cm.jump(0); cm.set(1, S.soft); refresh(); });
    chs.forEach((b, i) => b.onclick = () => { sz = i; refresh(); });
    refresh(true);

    /* add to cart: confirm, fly, count on arrival, drawer */
    const L = ['Add to cart', ic(I.check,16,2.5) + 'Added'].map(h => { const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = h; ad.appendChild(e); return e; });
    const bsw = new Swap(0), ok = new Track(0), nu = new Track(0), cb = new Track(0), dro = new Track(0), sub = new Track(0), emT = new Track(1);
    const flights = [], lines = []; let count = 0, open = false;
    const FLY = { w:11 };
    const sync = () => {
      const act = lines.filter(l => l.v.target === 1); count = Math.min(99, act.reduce((a, l) => a + l.q, 0));
      cd.dir = 1; cd.set(String(count)); cb.set(count > 0 ? 1 : 0); emT.set(count > 0 ? 0 : 1); sub.set(act.reduce((a, l) => a + l.q*l.price, 0));
      ct.setAttribute('aria-label', `Open cart, ${count ? count + (count === 1 ? ' item' : ' items') : 'empty'}`);
    };
    const addLine = f => {
      const key = f.col + f.sz; let l = lines.find(x => x.key === key && x.v.target === 1);
      if (l){ l.q = Math.min(9, l.q + 1); l.dg.dir = 1; l.dg.set(String(l.q)); l.vt.set(l.q*l.price); }
      else {
        const w = document.createElement('div'); w.style.overflow = 'hidden';
        w.innerHTML = `<div class="pp-lr"><span class="pp-lh" style="--pp-c:${COL[f.col].c}">${garment(0)}</span><div class="pp-lc"><b class="small">Everyday overshirt</b><span class="small muted">${COL[f.col].n} · ${SZ[f.sz]}</span><div class="row" style="gap:4px"><button type="button" class="btn pp-qb pp-qm" aria-label="Decrease quantity">−</button><span class="pp-qd small"></span><button type="button" class="btn pp-qb pp-qp" aria-label="Increase quantity">+</button></div></div><span class="num small pp-lt"></span></div>`;
        dl.appendChild(w);
        l = { key, price:f.price, q:1, w, v:new Track(0).set(1), vt:new Track(f.price), dg:new Digits($(w,'.pp-qd'), 1), lt:$(w,'.pp-lt') }; l.dg.set('1', true);
        $(w,'.pp-qp').onclick = () => { if (l.q >= 9) return; l.q++; l.dg.dir = 1; l.dg.set(String(l.q)); l.vt.set(l.q*l.price); sync(); };
        $(w,'.pp-qm').onclick = () => { if (l.q <= 1){ l.v.set(0); } else { l.q--; l.dg.dir = -1; l.dg.set(String(l.q)); l.vt.set(l.q*l.price); } sync(); };
        lines.push(l);
      }
      sync();
    };
    ad.onclick = () => {
      const t0 = now(), r0 = rel(root, vp), r1 = rel(root, ct), g = document.createElement('div'); g.className = 'pp-gh'; g.style.background = BG[cur]; g.style.setProperty('--pp-c', curC); g.innerHTML = garment(cur);
      root.appendChild(g); const f = { g, t0, col, sz, price:price(), sx:r0.x + r0.w/2, sy:r0.y + r0.h/2, ex:r1.x + r1.w/2, ey:r1.y + r1.h/2 }; flights.push(f);
      bsw.to(1); ok.set(1); q = q.filter(x => x[2] !== 'back');
      q.push([t0 + .4, () => { addLine(f); nu.set(1, S.snap); }, 'arr'], [t0 + .5, () => nu.set(0), 'nu'], [t0 + 1.6, () => { bsw.to(0); ok.set(0); }, 'back']); q.sort((a, b) => a[0] - b[0]);
    };
    const setOpen = v => { if (open === v) return; open = v; openSet(dro, v); bd.inert = v; ct.setAttribute('aria-expanded', v); setTimeout(() => (v ? xb : ct).focus({ preventScroll:true }), 100); };
    ct.onclick = () => setOpen(true); xb.onclick = () => setOpen(false); scr.onclick = () => setOpen(false); $(st,'.pp-cs').onclick = () => setOpen(false);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open && st.isConnected) setOpen(false); });
    cd.set('0', true);

    return t => {
      while (q.length && q[0][0] <= t) q.shift()[1]();
      // gallery and plate
      strip.style.transform = `translateX(${px(-(held ? hx : gx.at(t)))})`;
      const a = ex.A.at(t), b = ex.B.at(t), c = ey.A.at(t), d = ey.B.at(t); pl.style.transform = `translate(${px(a)},${px(c)})`; pl.style.width = px(b - a); pl.style.height = px(d - c);
      ths.forEach((bt, i) => bt.style.opacity = (.55 + .45*clamp(ts[i].at(t))).toFixed(3));
      // color morph
      const p = clamp(cm.at(t)), fill = p > .999 ? curC : `color-mix(in oklab, ${curC} ${(p*100).toFixed(1)}%, ${prevC})`; if (fill !== lastFill){ root.style.setProperty('--pp-c', fill); lastFill = fill; }
      // variants
      sws.forEach((_, i) => { const s = clamp(sT[i].at(t)); rgs[i].style.opacity = s.toFixed(3); rgs[i].style.transform = `scale(${(.8 + .2*s).toFixed(4)})`; });
      chs.forEach((bt, i) => { const s = clamp(cS[i].at(t)), x = clamp(cD[i].at(t)); bt.style.background = mix(s,'var(--ink)','var(--card)'); bt.style.color = mix(s,'var(--card)','var(--ink)'); bt.style.borderColor = mix(s,'var(--ink)','var(--line)'); bt.style.opacity = (1 - .55*x).toFixed(3); });
      dd.render(t); stk.apply(t);
      // button
      L.forEach((e, k) => bsw.apply(e, k, t)); const g = clamp(ok.at(t)); ad.style.background = mix(g,'var(--success)','var(--ink)'); ad.style.color = mix(g,'#fff','var(--card)');
      // flights
      for (let i = flights.length - 1; i >= 0; i--) { const f = flights[i], u = clamp(prog(t, f.t0, FLY)), v = 1 - u;
        const x = v*v*f.sx + (2*v*u + u*u)*f.ex, y = (v*v + 2*v*u)*f.sy + u*u*f.ey, s = lerp(1, .32, u);
        f.g.style.transform = `translate(${px(x - 24)},${px(y - 29)}) scale(${s.toFixed(4)})`; f.g.style.opacity = (1 - clamp((u - .6)/.33)).toFixed(3);
        if (t > f.t0 + .4){ f.g.remove(); flights.splice(i, 1); } }
      // cart icon, badge
      const n = clamp(nu.at(t)), o = clamp(cb.at(t)); ct.style.transform = `scale(${(1 + .12*n).toFixed(4)})`; bg.style.opacity = o.toFixed(3); bg.style.transform = `scale(${(.6 + .4*o).toFixed(4)})`; cd.render(t);
      // drawer
      const r = clamp(dro.at(t)); dr.style.transform = `translateX(${((1 - r)*100).toFixed(2)}%)`; dr.style.visibility = r < .01 ? 'hidden' : 'visible'; scr.style.opacity = (r*.45).toFixed(3); scr.style.pointerEvents = r > .5 ? 'auto' : 'none';
      if (r > .01){
        for (let i = lines.length - 1; i >= 0; i--) { const l = lines[i], v = clamp(l.v.at(t)); l.w.style.height = px(v*74); l.w.style.opacity = v.toFixed(3); l.dg.render(t); l.lt.textContent = money(l.vt.at(t));
          if (l.v.target === 0 && v < .01){ l.w.remove(); lines.splice(i, 1); } }
        su.textContent = money(sub.at(t)); fade(em, emT.at(t), 0);
      }
    };
  }});

/* ======================================================================== checkout flow */
atom({ id:'checkoutflow', cat:'Storefront', name:'Checkout', block:'checkout, line-items, totals, payment', fam:['S','M','T','E'], wide:true, tall:true,
  html:`<style>
.cf{position:absolute;inset:0;container-type:inline-size;display:flex;align-items:center;justify-content:center}
.cf-cd{width:min(880px,calc(100% - 24px));height:calc(100% - 20px);display:flex;flex-direction:column;gap:10px;padding:12px 14px;background:var(--card);border-radius:14px;box-shadow:var(--shadow);text-align:left}
.cf-pg{flex:none;display:flex;flex-direction:column;gap:6px}
.cf-lb{display:grid;grid-template-columns:repeat(4,1fr);font-size:12px;font-weight:500}
.cf-bar{height:4px;border-radius:2px;background:var(--raised);overflow:hidden}
.cf-fl{display:block;height:100%;border-radius:2px;background:var(--ink)}
.cf-mn{flex:1;min-height:0;display:flex;gap:14px}
.cf-pn{position:relative;flex:1;min-width:0;overflow:hidden}
.cf-p{position:absolute;inset:0;padding:3px;display:flex;flex-direction:column;gap:8px}
.cf-tt{flex:none;width:190px;display:flex;flex-direction:column;gap:7px;padding:12px;background:var(--bg);border-radius:10px;font-size:13px;justify-content:center}
.cf-tt .r{display:flex;justify-content:space-between;gap:8px}
.cf-tt .tot{border-top:1px solid var(--line);padding-top:8px;margin-top:2px;font-weight:600;font-size:15px}
.cf-ac{flex:none;display:flex;justify-content:space-between;align-items:center;gap:10px}
.cf-nx{position:relative;width:150px;height:38px;border:0;border-radius:10px;color:var(--card);font-weight:500;cursor:pointer;overflow:hidden}
.cf-in{border:1.5px solid var(--line);border-radius:9px;padding:8px 11px;background:var(--card);color:var(--ink);font:14px var(--sans);outline:none;width:100%}
.cf-in:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.cf-fh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px;font-size:13px}
.cf-er{color:var(--danger);font-size:12px;opacity:0}
.cf-ro{display:flex;align-items:center;justify-content:space-between;gap:10px;height:44px}
.cf-qb{width:24px;height:24px;padding:0;border-radius:7px;line-height:1}
@container (max-width:559px){
  .cf-cd{padding:10px 12px;gap:8px}
  .cf-mn{flex-direction:column;gap:8px}
  .cf-tt{width:auto;flex-direction:row;padding:7px 10px;border-radius:9px}
  .cf-tt .r:not(.tot){display:none}
  .cf-tt .tot{flex:1;border-top:0;padding:0;margin:0;font-size:14px}
  .cf-nx{width:128px;height:36px}
  .cf-lb{font-size:11px}
}
</style>
<div class="cf"><form class="cf-cd" novalidate>
  <div class="cf-pg"><div class="cf-lb" aria-hidden="true"><span>Cart</span><span>Details</span><span>Payment</span><span>Receipt</span></div><div class="cf-bar" role="progressbar" aria-label="Checkout progress" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1"><i class="cf-fl"></i></div></div>
  <div class="cf-mn"><div class="cf-pn"></div>
    <aside class="cf-tt" aria-label="Order summary"><div class="r"><span class="muted">Subtotal</span><span class="num"></span></div><div class="r"><span class="muted">Shipping</span><span class="num"></span></div><div class="r"><span class="muted">Tax (8%)</span><span class="num"></span></div><div class="r tot"><span>Total</span><span class="num"></span></div></aside>
  </div>
  <div class="cf-ac"><button type="button" class="btn cf-bk">Back</button><button type="submit" class="cf-nx"></button></div>
</form></div>`,
  desc:'One bar fills as you move Cart, Details, Payment, Receipt, and panels slide sideways in the direction of travel with the blur swap. Changing a quantity rolls its digit first, then every money value springs to the new total together; shipping goes free at $100. Empty required fields ring in danger. Pay shows a spinner, then fills success and slides to the receipt, where the check draws and the total counts up. With Simulate decline the button and bar flash danger, a message swaps in, and you stay on Payment.',
  api:'panel.to(i, dir)   bar.set((i + 1)/4)   totals.set(sum)   pay: busy → ok | bad   receipt: check.draw(t0 + .3); total.set(sum, t0 + .25)',
  init(st){
    const form = $(st,'.cf-cd'), pn = $(st,'.cf-pn'), fl = $(st,'.cf-fl'), bar = $(st,'.cf-bar'), labs = $$(st,'.cf-lb span'), bk = $(st,'.cf-bk'), nx = $(st,'.cf-nx'), out = $$(st,'.cf-tt .num');
    const ITEMS = [{ n:'Stoneware mug', p:28, q:1 }, { n:'Linen napkins x4', p:34, q:2 }];
    const sums = () => { const s = ITEMS.reduce((a, it) => a + it.p*it.q, 0), sh = s === 0 || s >= 100 ? 0 : 8, tax = s*.08; return { s, sh, tax, tot:s + sh + tax, n:ITEMS.reduce((a, it) => a + it.q, 0) }; };
    const T = { s:new Track(0), sh:new Track(0), tax:new Track(0), tot:new Track(0) }, en = new Track(1), rc = new Track(0);
    let i = 0, dir = 1, busy = false, since = -9, q = [];
    const sw = new Swap(0), pg = new Track(.25), bsw = new Swap('next'), ok = new Track(0), bad = new Track(0), bl = new Track(0), bs = new Track(0), msw = new Swap('none');
    const mkP = h => { const d = document.createElement('div'); d.className = 'cf-p'; d.innerHTML = h; pn.appendChild(d); return d; };

    /* panel 0: cart */
    const p0 = mkP('<div class="row" style="justify-content:space-between"><b class="small">Review your cart</b><span class="small muted cf-ct"></span></div>');
    const rows = ITEMS.map(it => {
      const r = document.createElement('div'); r.className = 'cf-ro';
      r.innerHTML = `<div class="col" style="gap:1px;min-width:0;flex:1"><span class="small" style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span><span class="small muted"></span></div><div class="row" style="gap:6px;flex:none"><button type="button" class="btn cf-qb cf-m" aria-label="Decrease quantity">−</button><span class="cf-q small" style="min-width:12px;text-align:center"></span><button type="button" class="btn cf-qb cf-p2" aria-label="Increase quantity">+</button><span class="lt num small" style="min-width:58px;text-align:right"></span></div>`;
      const sp = $$(r,'.col span'); sp[0].textContent = it.n; sp[1].textContent = `$${it.p} each`;
      p0.appendChild(r); const o = { it, q0:it.q, dg:new Digits($(r,'.cf-q'), 1), lt:$(r,'.lt'), v:new Track(it.p*it.q) }; o.dg.set(String(it.q), true);
      $(r,'.cf-m').onclick = () => upd(o, -1); $(r,'.cf-p2').onclick = () => upd(o, 1); return o; });
    const cct = $(p0,'.cf-ct');

    /* panel 1: details */
    const p1 = mkP(['Full name|cf-name|text|Ada Lovelace|Enter your full name|name','Email|cf-email|email|ada@studio.co|Enter a valid email|email'].map(f => { const [l, id, ty, ph] = f.split('|');
      return `<div><div class="cf-fh"><label for="${id}" style="font-weight:500">${l}<span aria-hidden="true" class="muted"> *</span></label><span class="cf-er" id="${id}-er"></span></div><input class="cf-in" id="${id}" type="${ty}" placeholder="${ph}" autocomplete="off" required aria-describedby="${id}-er"></div>`; }).join(''));
    const F = $$(p1,'.cf-in').map((inp, k) => { const er = $(p1, '#' + inp.id + '-er'); er.textContent = ['Enter your full name','Enter a valid email'][k]; er.setAttribute('aria-hidden', 'true'); return { inp, er, e:new Track(0), ok:v => k ? /^\S+@\S+\.\S+$/.test(v.trim()) : v.trim().length > 1 }; });
    F.forEach(f => f.inp.oninput = () => { if (f.ok(f.inp.value)) clear(f); });
    const clear = f => { f.e.set(0); f.inp.removeAttribute('aria-invalid'); f.er.setAttribute('aria-hidden', 'true'); };

    /* panel 2: payment */
    const p2 = mkP(`<div class="cf-ro card" style="height:48px;padding:0 12px;box-shadow:none;border:1px solid var(--line)"><div class="row" style="gap:10px">${ic('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/>', 20, 1.75)}<div class="col" style="gap:0"><span class="small" style="font-weight:500">Visa ending 4242</span><span class="small muted">Test card, expires 09/30</span></div></div></div><label class="row small" style="gap:8px;cursor:pointer"><input type="checkbox" id="cf-decline" class="cf-dc"> Simulate decline</label><div class="cf-pm" style="position:relative;height:44px"></div>`);
    const dc = $(p2,'.cf-dc'), pm = $(p2,'.cf-pm'), ml = {};
    for (const k of ['none','bad']){ const e = document.createElement('div'); e.className = 'layer'; e.style.cssText += ';white-space:normal;justify-content:flex-start;padding:0 10px;border-radius:9px;' + (k === 'bad' ? 'background:var(--danger-tint);color:var(--danger)' : ''); if (k === 'bad') e.innerHTML = ic(I.alert, 18) + '<span class="small" style="flex:1" role="alert">Your bank declined this card. You were not charged.</span>'; pm.appendChild(e); ml[k] = e; }

    /* panel 3: receipt */
    const p3 = mkP(`<div class="row" style="gap:14px;align-items:center;margin-top:6px"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle class="cf-c1" cx="12" cy="12" r="10" pathLength="1" stroke-dasharray="1"/><path class="cf-c2" d="M7.5 12.5 10.5 15.5 16.5 9" pathLength="1" stroke-dasharray="1"/></svg><div class="col" style="gap:0"><b>Payment received</b><span class="small muted cf-mail"></span></div></div><div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:10px;margin-top:4px"><span class="muted small">Total paid</span><b class="num cf-rt" style="font-size:24px;letter-spacing:-.02em"></b></div>`);
    const c1 = $(p3,'.cf-c1'), c2 = $(p3,'.cf-c2'), rt = $(p3,'.cf-rt'), mail = $(p3,'.cf-mail');
    const panels = [p0, p1, p2, p3];

    /* primary button layers */
    const BL = { next:'Continue', pay:'Pay', busy:spin + 'Processing', ok:ic(I.check,16,2.5) + 'Paid', bad:ic(I.x,16,2.25) + 'Declined', again:'Start over' }, lay = {};
    for (const k in BL){ const e = document.createElement('span'); e.className = 'layer'; e.innerHTML = BL[k]; nx.appendChild(e); lay[k] = e; }
    const sp = $(lay.busy,'svg'); const bkT = new Track(0);

    /* totals + quantities */
    function resum(inst){ const m = sums(), k = inst ? 'jump' : 'set'; T.s[k](m.s); T.sh[k](m.sh); T.tax[k](m.tax); T.tot[k](m.tot); en[k](m.n ? 1 : 0); nx.disabled = i === 0 && !m.n; lay.pay.innerHTML = 'Pay ' + money(m.tot); cct.textContent = m.n + (m.n === 1 ? ' item' : ' items'); }
    function upd(o, d){ const n = clamp(o.it.q + d, 0, 9); if (n === o.it.q) return; o.it.q = n; o.dg.dir = d; o.dg.set(String(n)); o.v.set(o.it.p*n); resum(); }
    resum(true);

    /* steps */
    function go(n){ dir = n > i ? 1 : -1; i = n; sw.to(i); pg.set((i + 1)/4); bs.set(i === 3 ? 1 : 0); bar.setAttribute('aria-valuenow', i + 1); bkT.set(i === 1 || i === 2 ? 1 : 0); bk.disabled = !(i === 1 || i === 2);
      const k = i === 2 ? 'pay' : i === 3 ? 'again' : 'next'; bsw.to(k); if (i !== 2 && !busy) msw.to('none'); nx.disabled = i === 0 && !sums().n;
      if (i === 1) setTimeout(() => F[0].inp.focus({ preventScroll:true }), 170);
      if (i === 3){ since = now(); rc.jump(0); rc.set(sums().tot, S.soft, since + .25); mail.textContent = 'Receipt sent to ' + (F[1].inp.value.trim() || 'your email'); } }
    function reset(){ ITEMS.forEach((it, k) => { const o = rows[k]; it.q = o.q0; o.dg.dir = -1; o.dg.set(String(it.q)); o.v.set(it.p*it.q); }); F.forEach(f => { f.inp.value = ''; clear(f); }); dc.checked = false; dc.disabled = false; msw.to('none'); ok.set(0); bad.set(0); bl.set(0); resum(); go(0); }
    function pay(){
      busy = true; const t0 = now(), fail = dc.checked; bsw.to('busy'); msw.to('none'); bk.disabled = true; dc.disabled = true;
      q = fail
        ? [[t0 + 1.2, () => { bsw.to('bad'); bad.set(1); bl.set(1); msw.to('bad'); }], [t0 + 3, () => { bsw.to('pay'); bad.set(0); bl.set(0); busy = false; bk.disabled = false; dc.disabled = false; }]]
        : [[t0 + 1.2, () => { bsw.to('ok'); ok.set(1); }], [t0 + 2, () => { go(3); ok.set(0); busy = false; }]];
    }
    form.onsubmit = ev => { ev.preventDefault(); if (busy) return;
      if (i === 0){ if (sums().n) go(1); return; }
      if (i === 1){ const bad1 = F.filter(f => !f.ok(f.inp.value)); F.forEach(f => { if (bad1.includes(f)){ f.e.set(1); f.inp.setAttribute('aria-invalid', 'true'); f.er.removeAttribute('aria-hidden'); } else clear(f); }); if (bad1.length){ bad1[0].inp.focus({ preventScroll:true }); return; } go(2); return; }
      if (i === 2){ pay(); return; }
      reset(); };
    bk.onclick = () => { if (!busy && (i === 1 || i === 2)) go(i - 1); };
    bk.disabled = true; bkT.jump(0);

    return t => {
      while (q.length && q[0][0] <= t) q.shift()[1]();
      // progress: fill width, label colors, danger flash on a decline
      const g = clamp(ok.at(t)), b = clamp(bl.at(t)); fl.style.width = (clamp(pg.at(t))*100).toFixed(2) + '%'; fl.style.background = mix(Math.max(g, clamp(bs.at(t))),'var(--success)', mix(b,'var(--danger)','var(--ink)'));
      labs.forEach((l, k) => l.style.color = k <= i ? 'var(--ink)' : 'var(--faint)');
      // panels slide in the direction of travel
      panels.forEach((p, k) => { sw.apply(p, k, t, 0); const o = parseFloat(p.style.opacity); p.style.transform = `translateX(${px((1 - o)*24*(k === sw.cur ? dir : -dir))})`; p.style.pointerEvents = k === sw.cur ? 'auto' : 'none'; });
      rows.forEach(r => { r.dg.render(t); r.lt.textContent = money(r.v.at(t)); });
      const sh = T.sh.at(t); out[0].textContent = money(T.s.at(t)); out[1].textContent = T.sh.target === 0 && sh < .005 ? 'Free' : money(sh); out[2].textContent = money(T.tax.at(t)); out[3].textContent = money(T.tot.at(t));
      F.forEach(f => { const e = clamp(f.e.at(t)); f.inp.style.borderColor = mix(e,'var(--danger)','var(--line)'); fade(f.er, e, (1 - e)*-3); });
      // buttons
      for (const k in lay) bsw.apply(lay[k], k, t); for (const k in ml) msw.apply(ml[k], k, t); sp.style.transform = `rotate(${(t*420 % 360).toFixed(1)}deg)`;
      const bd = clamp(bad.at(t)); nx.style.background = `color-mix(in oklab, var(--danger) ${(bd*100).toFixed(1)}%, ${mix(g,'var(--success)','var(--ink)')})`; nx.style.color = g + bd > .3 ? '#fff' : 'var(--card)'; nx.style.opacity = (.4 + .6*clamp(en.at(t))).toFixed(3);
      const k = clamp(bkT.at(t)); bk.style.opacity = k.toFixed(3); bk.style.visibility = k < .01 ? 'hidden' : 'visible';
      // receipt: circle, then check, then the total counts up
      const s = i === 3 ? since : -9; c1.style.strokeDashoffset = (1 - clamp(prog(t, s + .15, S.soft))).toFixed(3); c2.style.strokeDashoffset = (1 - clamp(prog(t, s + .32, S.soft))).toFixed(3); rt.textContent = money(rc.at(t));
    };
  }});

/* ======================================================================== pricing section */
const PLANS = [
  { n:'Starter', m:19, y:15, f:['1 site','5 GB of media','Community support'], cta:'Choose Starter' },
  { n:'Studio', m:49, y:39, f:['Unlimited sites','100 GB of media','Priority support'], cta:'Start with Studio' },
  { n:'Business', m:129, y:103, f:['Single sign-on','1 TB of media','Dedicated manager'], cta:'Talk to sales' }
];
atom({ id:'pricingsection', cat:'Storefront', name:'Pricing section', block:'pricing, toggle, cta-button', fam:['E','S','M','X'], wide:true, tall:true,
  html:`<style>
.ps{position:absolute;inset:0;container-type:inline-size;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;padding:10px 16px}
.ps-tg{display:flex;align-items:center;flex:none}
.ps-sv{overflow:hidden;width:0;flex:none}
.ps-pill{display:inline-block;margin-left:10px;white-space:nowrap;background:var(--accent-tint);color:var(--accent);font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px}
.ps-gr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;width:100%;max-width:860px;align-items:stretch;padding-top:6px}
.ps-cd{position:relative;display:flex;flex-direction:column;gap:8px;padding:16px 16px 14px;border:1px solid var(--line);text-align:left;min-width:0}
.ps-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:22px}
.ps-nm{margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em}
.ps-tag{font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--accent-tint);color:var(--accent);white-space:nowrap}
.ps-pr{display:flex;align-items:center;gap:2px;font-size:38px;font-weight:600;letter-spacing:-.03em;line-height:1.25}
.ps-pr .u{font-size:13px;font-weight:400;letter-spacing:0;margin-left:2px;align-self:flex-end;margin-bottom:.45em;line-height:1}
.ps-nt{position:relative;height:18px;font-size:13px}
.ps-ft{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--muted);flex:1}
.ps-ft li{display:flex;gap:7px;align-items:center}
.ps-ft svg{color:var(--accent);flex:none}
.ps-cta{height:36px;border-radius:9px;border:1px solid var(--line);font-weight:500;font-size:13px;cursor:pointer;padding:0 12px;white-space:nowrap}
@container (max-width:559px){
  .ps{gap:8px;padding:8px 12px}
  .ps-gr{grid-template-columns:1fr;gap:8px}
  .ps-cd{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"hd pr" "nt cta";align-items:center;column-gap:10px;row-gap:4px;padding:8px 12px}
  .ps-hd{grid-area:hd;justify-content:flex-start;gap:8px}
  .ps-pr{grid-area:pr;justify-self:end;font-size:26px}
  .ps-nt{grid-area:nt}
  .ps-cta{grid-area:cta;height:28px;font-size:12px;padding:0 10px}
  .ps-ft{display:none}
}
</style>
<div class="ps">
  <div class="ps-tg"><div class="seg ps-sg" role="group" aria-label="Billing period"><div class="ind"></div><button type="button">Monthly</button><button type="button">Yearly</button></div><div class="ps-sv"><span class="ps-pill">Save 20%</span></div></div>
  <div class="ps-gr"></div>
</div>`,
  desc:'The segment indicator stretches to the new side, leading edge first. Then the three cards change in one wave from left to right, 60ms apart: price digits roll and the billing note blur-swaps. The Save 20% pill enters once the wave has passed (it leaves at once on monthly). The Studio card rests lifted with its button filled. Hovering or focusing another card moves the lift and fill to it, and leaving returns them to Studio.',
  api:'ind.go(l, r)   cards.forEach((c, i) => at(t0 + i·.06, c.price.set(plan), c.note.to(mode)))   pill.w.set(yearly, t0 + .18)   lift.set(i === (hover ?? featured))',
  init(st){
    const seg = $(st,'.ps-sg'), ind = $(seg,'.ind'), btns = $$(seg,'button'), gr = $(st,'.ps-gr'), sv = $(st,'.ps-sv'), pill = $(st,'.ps-pill');
    const STAG = .06, FEAT = 1, e = edges(0,0), pw = new Track(0), cards = [];
    let mode = 0, hover = -1, q = [], pillW = 90;
    const note = (p, m) => m ? `$${(p.y*12).toLocaleString('en-US')} billed yearly` : 'Billed monthly';
    PLANS.forEach((p, i) => {
      const el = document.createElement('article'); el.className = 'ps-cd card'; el.setAttribute('aria-label', p.n + ' plan');
      el.innerHTML = `<div class="ps-hd"><h4 class="ps-nm">${p.n}</h4>${i === FEAT ? '<span class="ps-tag">Most popular</span>' : ''}</div><div class="ps-pr"><span>$</span><span class="ps-d"></span><span class="u muted">/mo</span></div><div class="ps-nt muted"></div><ul class="ps-ft">${p.f.map(x => `<li>${ic(I.check, 14, 2.5)}<span>${x}</span></li>`).join('')}</ul><button type="button" class="ps-cta">${p.cta}</button>`;
      gr.appendChild(el);
      const d = new Digits($(el,'.ps-d'), 3), nt = $(el,'.ps-nt'), N = [0,1].map(m => { const s = document.createElement('span'); s.className = 'layer'; s.style.justifyContent = 'flex-start'; s.textContent = note(p, m); nt.appendChild(s); return s; });
      const c = { el, p, d, N, nsw:new Swap(0), lift:new Track(i === FEAT ? 1 : 0), cta:$(el,'.ps-cta'), shown:0 };
      c.show = (m, inst) => { if (c.shown === m && !inst) return; const old = c.shown; c.shown = m; const v = String(m ? p.y : p.m); d.dir = m > old ? -1 : 1; d.set(v, inst);
        if (inst){ c.nsw.cur = m; c.nsw.prev = null; c.nsw.t = -9; } else c.nsw.to(m); };
      c.show(0, true);
      el.addEventListener('pointerenter', () => { hover = i; aim(); }); el.addEventListener('pointerleave', () => { if (hover === i){ hover = -1; aim(); } });
      el.addEventListener('focusin', () => { hover = i; aim(); }); el.addEventListener('focusout', ev => { if (!el.contains(ev.relatedTarget) && hover === i){ hover = -1; aim(); } });
      cards.push(c);
    });
    function aim(){ const a = hover >= 0 ? hover : FEAT; cards.forEach((c, j) => c.lift.set(j === a ? 1 : 0)); }
    const pick = (m, inst) => { mode = m; btns.forEach((b, j) => b.setAttribute('aria-pressed', j === m)); const b = btns[m], f = inst ? 'jump' : 'go'; e[f](b.offsetLeft, b.offsetLeft + b.offsetWidth);
      if (inst){ cards.forEach(c => c.show(m, true)); pw.jump(m ? 1 : 0); return; }
      const t0 = now(); q = q.filter(x => x[2] !== 'w' && x[2] !== 'p');
      cards.forEach((c, j) => q.push([t0 + (j + 1)*STAG, () => c.show(m), 'w']));
      if (m) q.push([t0 + (cards.length + 1)*STAG, () => pw.set(1), 'p']); else pw.set(0, S.snap, t0);
      q.sort((a, b) => a[0] - b[0]); };
    btns.forEach((b, j) => b.onclick = () => { if (j !== mode) pick(j); });
    const init = () => { pillW = pill.offsetWidth + 10; pick(mode, true); }; document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => {
      while (q.length && q[0][0] <= t) q.shift()[1]();
      const a = e.A.at(t), b = e.B.at(t); Object.assign(ind.style, { transform:`translate(${px(a)},3px)`, width:px(b - a), height:'calc(100% - 6px)' });
      const o = clamp(pw.at(t)); sv.style.width = px(o*pillW); fade(pill, o, 0); pill.style.transform = `scale(${(.85 + .15*o).toFixed(4)})`;
      cards.forEach(c => { const L = clamp(c.lift.at(t)); c.d.render(t); c.N.forEach((n, k) => c.nsw.apply(n, k, t));
        c.el.style.transform = `translateY(${px(-6*L)}) scale(${(1 + .03*L).toFixed(4)})`; c.el.style.zIndex = L > .5 ? 2 : 1;
        c.el.style.boxShadow = `0 ${(1 + 11*L).toFixed(2)}px ${(3 + 22*L).toFixed(2)}px color-mix(in oklab, var(--ink) ${(7 + 9*L).toFixed(1)}%, transparent)`; c.el.style.borderColor = mix(L,'var(--ink)','var(--line)');
        c.cta.style.background = mix(L,'var(--ink)','var(--card)'); c.cta.style.color = mix(L,'var(--card)','var(--ink)'); c.cta.style.borderColor = mix(L,'var(--ink)','var(--line)'); });
    };
  }});
})();
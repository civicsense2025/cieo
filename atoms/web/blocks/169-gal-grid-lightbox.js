

/* ================================================================ galleries lane (Wave 7) */
(() => {
/* ---------- shared kit ----------
   Every atom here draws its photographs with PhotoKit and shares four small tools:
   cover()   shows one image cover-cropped into any rect using only transform + clip-path, so a shared element
             can change aspect ratio (4:3 tile to 3:2 viewer) on the compositor with no layout.
   Reflow    items that travel between layouts: leavers shrink to their own centre, stayers travel in order,
             arrivals grow in last. Used by the masonry and the collection morph.
   swapO     opacity of a single element that swaps content: exit 100ms, then enter.
   loader    spreads photo generation over frames so first paint never stalls. */
const PK = globalThis.PhotoKit, CAP = PK.CAPTIONS, RM = REDUCE;
const bp = w => w < 480 ? 0 : w < 900 ? 1 : 2;
const SZ = { l:[960,640], p:[640,960], s:[800,800] }, SZH = { l:[480,320], p:[320,480], s:[400,400] }, ASP = { l:1.5, p:2/3, s:1 };
const phUrl = (n, k, o = {}) => { const [w, h] = (o.half ? SZH : SZ)[k]; return PK.url(n, w, h, { tod:o.tod || 0 }); };
const loader = () => { const q = []; return { add(img, n, k, o){ q.push(() => { img.src = phUrl(n, k, o); }); }, job(fn){ q.push(fn); }, pump(max = 1){ for (let i = 0; i < max && q.length; i++) q.shift()(); }, get busy(){ return q.length; } }; };
const swapO = (t, t0) => t < t0 + EXIT ? 1 - clamp((t - t0)/EXIT)**2 : prog(t, t0 + EXIT);
const timeline = () => { const q = []; return { at(t0, fn){ q.push([t0, fn]); q.sort((a, b) => a[0] - b[0]); }, run(t){ while (q.length && q[0][0] <= t) q.shift()[1](); } }; };
const GI = {
  prev:'<path d="m15 6-6 6 6 6"/>', next:'<path d="m9 6 6 6-6 6"/>', plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>',
  fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-4"/>',
  up:'<path d="m6 15 6-6 6 6"/>', cross:'<path d="M6 6l12 12M18 6 6 18"/>'
};
// scene metadata: caption copy, EXIF-style detail, and the subject area [x, y, r] as fractions of the frame (r of height)
const META = {
  ridge:{ cam:'Leica Q3', lens:'28 mm', exp:'f/8, 1/500 s, ISO 100', place:'Tioga Road, California', date:'Oct 4, 2025', note:'First light on the crest, shot from the pullout before the wind picked up.', sub:[.62, .38, .2] },
  lake:{ cam:'Fujifilm X-T5', lens:'35 mm', exp:'f/5.6, 1/250 s, ISO 125', place:'Lake Ediza, California', date:'Oct 5, 2025', note:'The water went glass-flat for about ten minutes at sunrise.', sub:[.5, .55, .16] },
  dunes:{ cam:'Sony A7 IV', lens:'50 mm', exp:'f/11, 1/320 s, ISO 100', place:'Eureka Valley, California', date:'Oct 7, 2025', note:'Wind had redrawn every crest overnight. These are the first footprints.', sub:[.45, .7, .16] },
  city:{ cam:'Ricoh GR IIIx', lens:'40 mm', exp:'f/4, 1/400 s, ISO 200', place:'Downtown Fresno, California', date:'Oct 9, 2025', note:'Late afternoon on the east side, shot from the roof of a parking deck.', sub:[.5, .55, .2] },
  coast:{ cam:'Leica Q3', lens:'28 mm', exp:'f/8, 1/640 s, ISO 100', place:'Highway 1, Big Sur', date:'Oct 11, 2025', note:'The road bends out of the fog at the third pullout.', sub:[.4, .7, .14] },
  forest:{ cam:'Nikon Z6 II', lens:'70 mm', exp:'f/5.6, 1/160 s, ISO 400', place:'Sequoia National Forest', date:'Oct 12, 2025', note:'Spruce in flat light, exposed one stop under to keep the greens.', sub:[.5, .62, .18] },
  field:{ cam:'Fujifilm X-T5', lens:'23 mm', exp:'f/8, 1/500 s, ISO 125', place:'Central Valley, California', date:'Oct 14, 2025', note:'The last cut before the field goes to stubble.', sub:[.5, .7, .16] },
  canyon:{ cam:'Sony A7 IV', lens:'24 mm', exp:'f/11, 1/200 s, ISO 100', place:'Kolob Canyons, Utah', date:'Oct 16, 2025', note:'Canyon wall at noon. The shadow side fills in from the sand below.', sub:[.5, .55, .22] },
  harbor:{ cam:'Ricoh GR IIIx', lens:'40 mm', exp:'f/5.6, 1/320 s, ISO 160', place:'Moss Landing, California', date:'Oct 18, 2025', note:'Low tide, with the boats resting on the mud.', sub:[.5, .7, .16] },
  meadow:{ cam:'Nikon Z6 II', lens:'85 mm', exp:'f/4, 1/400 s, ISO 200', place:'Tuolumne Meadows', date:'Oct 19, 2025', note:'Cured grass after the first frost.', sub:[.5, .72, .14] },
  studio:{ cam:'Hasselblad X2D', lens:'90 mm', exp:'f/9, 1/125 s, ISO 64', place:'Studio, Oakland', date:'Oct 22, 2025', note:'Three pears on a linen table, window light from the left.', sub:[.5, .55, .14] },
  portrait:{ cam:'Hasselblad X2D', lens:'90 mm', exp:'f/4, 1/200 s, ISO 64', place:'Studio, Oakland', date:'Oct 22, 2025', note:'Window light and no fill. She had just stopped talking.', sub:[.5, .42, .2] }
};
const metaLine = n => `${META[n].cam}, ${META[n].lens}, ${META[n].exp}`;

// show an image (natural size FW x FH, origin 0 0) cover-cropped into rect (x, y, w, h) with corner radius r
function cover(el, FW, FH, x, y, w, h, r){
  if (w < .5 || h < .5){ el.style.visibility = 'hidden'; return; }
  el.style.visibility = 'visible';
  const s = Math.max(w/FW, h/FH), cx = (FW*s - w)/2/s, cy = (FH*s - h)/2/s;
  el.style.transform = `translate(${(x - cx*s).toFixed(2)}px,${(y - cy*s).toFixed(2)}px) scale(${s.toFixed(4)})`;
  el.style.clipPath = `inset(${cy.toFixed(2)}px ${cx.toFixed(2)}px round ${(r/s).toFixed(2)}px)`;
}
const relTo = (st, el) => { const a = el.getBoundingClientRect(), s = st.getBoundingClientRect(); return { x:a.left - s.left, y:a.top - s.top, w:a.width, h:a.height }; };
const FLY = S.soft;

// items that travel between layouts
class Reflow {
  constructor(){ this.it = []; }
  add(el, FW, FH, r){ const m = { el, FW, FH, r, on:false, x:new Track(0, S.soft), y:new Track(0, S.soft), w:new Track(1, S.soft), h:new Track(1, S.soft), s:new Track(0, S.base) }; el.style.width = FW + 'px'; el.style.height = FH + 'px'; this.it.push(m); return m; }
  snap(rects){ this.it.forEach((m, i) => { const r = rects[i]; if (r){ for (const a of 'xywh') m[a].jump(r[a]); m.s.jump(1); m.on = true; } else { m.s.jump(0); m.on = false; } }); }
  go(rects, t){
    const L = [], St = [], E = [];
    this.it.forEach((m, i) => { const r = rects[i]; if (r && m.on) St.push(i); else if (r) E.push(i); else if (m.on) L.push(i); });
    L.forEach((i, k) => { const m = this.it[i]; m.on = false; m.s.set(0, S.snap, t + k*.02); });
    const lag = L.length ? .08 : 0, lag2 = St.length || L.length ? .2 : 0;
    St.forEach((i, k) => { const m = this.it[i], r = rects[i]; for (const a of 'xywh') m[a].set(r[a], S.soft, t + lag + k*.03); });
    E.forEach((i, k) => { const m = this.it[i], r = rects[i]; m.on = true;
      if (m.s.at(t) < .03){ for (const a of 'xywh') m[a].jump(r[a]); m.s.jump(0); } else for (const a of 'xywh') m[a].set(r[a], S.soft, t);
      m.s.set(1, S.base, t + lag2 + k*.035); });
  }
  render(t){
    for (const m of this.it){
      const s = clamp(m.s.at(t)); if (s < .004){ m.el.style.visibility = 'hidden'; m.el.setAttribute('aria-hidden', 'true'); continue; }
      m.el.removeAttribute('aria-hidden');
      const w = m.w.at(t), h = m.h.at(t);
      cover(m.el, m.FW, m.FH, m.x.at(t) + w*(1 - s)/2, m.y.at(t) + h*(1 - s)/2, w*s, h*s, m.r*s);
      m.el.style.opacity = clamp(s*2).toFixed(3);
    }
  }
  get settled(){ return this.it.every(m => m.x.prune() + m.y.prune() + m.s.prune() === 0); }
}

document.head.insertAdjacentHTML('beforeend', `<style id="txg-shared">
.txg{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;padding:12px 14px 14px;font-size:14px;line-height:1.4;text-align:left;container-type:inline-size}
.txg *{box-sizing:border-box}
.txg h4{margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em}
.txg p{margin:0}
.txg button{font:inherit;color:inherit;cursor:pointer}
.txg img{display:block;width:100%;height:100%;object-fit:cover;-webkit-user-drag:none;user-select:none;pointer-events:none}
.txg-hd{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex:none;min-height:38px}
.txg-hd p{color:var(--muted);font-size:13px}
.txg-hint{font-size:12px;color:var(--muted);text-align:right;max-width:34ch}
@container (max-width:479px){.txg-hint{display:none}}
.txg-dk{--dk:#0C1016;--dk-ink:#EFF2F6;--dk-mut:#ABAEB3;--dk-line:#2A2F36;color:#EFF2F6}
.txg-ib{width:40px;height:40px;border-radius:50%;border:1px solid color-mix(in oklab,#EFF2F6 22%,transparent);background:color-mix(in oklab,#0C1016 74%,transparent);color:#EFF2F6;display:grid;place-items:center;padding:0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.txg-ib:hover{background:#0C1016}
.txg-ib:focus-visible,.txg-dk button:focus-visible,.txg-dk [tabindex]:focus-visible{outline:2px solid #EFF2F6;outline-offset:2px}
.txg-ph{position:absolute;left:0;top:0;transform-origin:0 0;visibility:hidden}
.txg-chips{position:relative;display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;flex:none;background:var(--raised);border-radius:11px;padding:3px;align-self:flex-start;max-width:100%}
.txg-chips::-webkit-scrollbar{display:none}
.txg-chip{border:0;background:none;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:500;white-space:nowrap;position:relative;z-index:1;flex:none}
.txg-chips>.ind{position:absolute;left:0;top:3px;bottom:3px;border-radius:8px;background:var(--card);box-shadow:var(--shadow);z-index:0}
.txg-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.txg-num{font-variant-numeric:tabular-nums}
/* grid to lightbox, swipe to dismiss */
.txg-lb-grid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(var(--c,4),minmax(0,1fr));grid-template-rows:repeat(var(--r,3),minmax(0,1fr));gap:var(--g,8px)}
.txg-tile{position:relative;border:0;padding:0;border-radius:var(--tr,8px);overflow:hidden;background:var(--raised);min-width:0;min-height:0;display:block}
.txg-tile img{position:absolute;inset:0}
.txg-tile:focus-visible{outline-offset:-3px}
.txg-lb-ov{position:absolute;inset:0;z-index:30;visibility:hidden;touch-action:none}
.txg-lb-scrim{position:absolute;inset:0;background:#0C1016;opacity:0}
.txg-lb-slot{position:absolute;inset:0;pointer-events:none}
.txg-lb-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:10px 12px}
.txg-lb-n{font:12px var(--mono);color:#ABAEB3;font-variant-numeric:tabular-nums}
.txg-lb-pv,.txg-lb-nx{position:absolute;top:calc(50% - 20px)}
.txg-lb-pv{left:12px}.txg-lb-nx{right:12px}
.txg-lb-cap{position:absolute;left:0;right:0;bottom:0;padding:10px 64px 16px;text-align:center;pointer-events:none}
.txg-lb-cap b{display:block;font-size:15px;font-weight:600}
.txg-lb-cap span{display:block;font:12px var(--mono);color:#ABAEB3;margin-top:2px}
.txg-lb[data-bp="0"] .txg-lb-pv,.txg-lb[data-bp="0"] .txg-lb-nx{top:auto;bottom:14px}
.txg-lb[data-bp="0"] .txg-lb-pv{left:12px}.txg-lb[data-bp="0"] .txg-lb-nx{right:12px}
.txg-lb[data-bp="0"] .txg-lb-cap{padding:10px 60px 18px}
.txg-lb[data-bp="0"] .txg-lb-cap span{font-size:11px}
.txg-lb-hold{position:absolute;left:0;right:0;bottom:84px;text-align:center;font-size:12px;color:#ABAEB3;pointer-events:none}
.txg-lb-film{position:absolute;left:0;right:0;bottom:56px;display:flex;gap:8px;justify-content:center;padding:6px 12px;z-index:2}
.txg-lb-th{width:58px;height:40px;border-radius:7px;border:2px solid transparent;overflow:hidden;padding:0;background:#171B21;flex:none}
.txg-lb-th img{width:100%;height:100%;object-fit:cover}
.txg-lb-th[aria-current="true"]{border-color:#EFF2F6}
.txg-lb-cap.over{background:linear-gradient(transparent,rgba(12,16,22,.78));padding-top:28px}
.txg-lb-opts{display:flex;align-items:center;gap:16px;font-size:13px;color:var(--muted);flex:none;flex-wrap:wrap}
.txg-lb-opts .txg-opt{display:flex;align-items:center;gap:6px}
.txg-lb-opts button{border:0;background:var(--raised);border-radius:8px;padding:4px 11px;font-size:12.5px;font-weight:500}
.txg-lb-opts button[aria-pressed="true"]{background:var(--ink);color:var(--card);border-color:var(--ink)}
</style>`);

/* ---------- shared: the grid to lightbox viewer (atoms 1 and 3) ---------- */
const lbHTML = (cls, hd, hint) => `<div class="txg txg-lb ${cls}"><div class="txg-hd"><div><h4>${hd[0]}</h4><p>${hd[1]}</p></div><span class="txg-hint">${hint}</span></div><div class="txg-lb-grid"></div>
<div class="txg-lb-ov txg-dk" role="dialog" aria-modal="true" aria-label="Photo viewer" inert><div class="txg-lb-scrim"></div>
<div class="txg-lb-slot"><div class="txg-ph"><img alt=""></div></div><div class="txg-lb-slot"><div class="txg-ph"><img alt=""></div></div>
<div class="txg-lb-top"><span class="txg-lb-n"></span><button class="txg-ib" data-a="close" aria-label="Close viewer">${ic(I.x, 18)}</button></div>
<button class="txg-ib txg-lb-pv" data-a="prev" aria-label="Previous photo">${ic(GI.prev, 18)}</button><button class="txg-ib txg-lb-nx" data-a="next" aria-label="Next photo">${ic(GI.next, 18)}</button>
<div class="txg-lb-cap" aria-live="polite"><b></b><span></span></div></div></div>`;

function lightbox(st, o){
  const root = $(st, '.txg-lb'), hd = $(root, '.txg-hd'), grid = $(root, '.txg-lb-grid'), ov = $(root, '.txg-lb-ov'), scrim = $(ov, '.txg-lb-scrim'), topEl = $(ov, '.txg-lb-top'), cap = $(ov, '.txg-lb-cap'), nEl = $(ov, '.txg-lb-n');
  const bClose = $(ov, '[data-a=close]'), bPrev = $(ov, '[data-a=prev]'), bNext = $(ov, '[data-a=next]'), chrome = [topEl, bPrev, bNext];
  const items = o.items, L = loader(), TL = timeline(), n = items.length;
  let thumbsOn = !!o.thumbs, capOver = o.cap === 'over';
  const film = o.thumbs ? document.createElement('div') : null;
  if (film){ film.className = 'txg-lb-film'; film.setAttribute('role', 'group'); film.setAttribute('aria-label', 'Thumbnails'); ov.insertBefore(film, topEl); chrome.push(film); }
  const thbs = film ? items.map((it, i) => { const b = document.createElement('button'); b.className = 'txg-lb-th'; b.tabIndex = -1; b.setAttribute('aria-label', `Show ${CAP[it.n]}, photo ${i + 1} of ${n}`); b.innerHTML = '<img alt="" draggable="false">'; film.appendChild(b); L.add($(b, 'img'), it.n, it.k, { half:true }); b.onclick = () => goTo(i); return b; }) : [];
  if (o.tweak){
    const bar = document.createElement('div'); bar.className = 'txg-lb-opts';
    bar.innerHTML = `<span class="txg-opt"><span>Thumbs</span><button type="button" data-k="th" data-v="on" aria-pressed="true">On</button><button type="button" data-k="th" data-v="off" aria-pressed="false">Off</button></span><span class="txg-opt"><span>Captions</span><button type="button" data-k="cap" data-v="below" aria-pressed="true">Below</button><button type="button" data-k="cap" data-v="over" aria-pressed="false">Overlay</button></span>`;
    hd.after(bar);
    $$(bar, 'button').forEach(b => b.onclick = () => {
      $$(bar, `button[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute('aria-pressed', x === b));
      if (b.dataset.k === 'th'){ thumbsOn = b.dataset.v === 'on'; film.style.display = thumbsOn ? '' : 'none'; layout(); }
      else { capOver = b.dataset.v === 'over'; cap.classList.toggle('over', capOver); layout(); }
    });
  }
  if (capOver) cap.classList.add('over');
  const tiles = items.map((it, i) => { const b = document.createElement('button'); b.className = 'txg-tile'; b.setAttribute('aria-label', `Open ${CAP[it.n]}, photo ${i + 1} of ${n}`); b.innerHTML = '<img alt="" draggable="false">'; grid.appendChild(b); L.add($(b, 'img'), it.n, it.k); b.onclick = () => open(i); return b; });
  const mkSlot = k => { const el = $$(ov, '.txg-lb-slot')[k]; return { el, ph:$(el, '.txg-ph'), img:$(el, 'img'), i:-1, F:null, tr:{ x:new Track(0, FLY), y:new Track(0, FLY), w:new Track(1, FLY), h:new Track(1, FLY), r:new Track(8, FLY) } }; };
  const slots = [mkSlot(0), mkSlot(1)], sw = new Swap(0);
  const To = new Track(0, S.base), Tc = new Track(0, S.base), Dx = new Track(0, S.soft), Dy = new Track(0, S.soft);
  const s = { open:false, closing:false, idx:0, cur:0, dir:1, capT:-9, opener:null, held:false, ax:0, ay:0, gx:0, gy:0 };
  let W = 0, H = 0;
  const fitRect = k => { const nar = W < 480, padX = nar ? 12 : 76, top = 56, bot = (capOver ? 20 : nar ? 96 : 84) + (thumbsOn && film ? 64 : 0), aw = W - 2*padX, ah = H - top - bot, a = ASP[k];
    const w = Math.max(40, Math.min(aw, ah*a)), h = w/a; return { x:(W - w)/2, y:top + (ah - h)/2, w, h, r:6 }; };
  const tileOf = i => { const r = relTo(st, tiles[i]); r.r = parseFloat(getComputedStyle(tiles[i]).borderRadius) || 8; return r; };
  const setTr = (sl, R, instant, at = now(), cfg = FLY) => { for (const a of ['x', 'y', 'w', 'h', 'r']){ if (instant) sl.tr[a].jump(R[a]); else sl.tr[a].set(R[a], cfg, at); } };
  const place = (sl, i, from) => {
    sl.i = i; sl.img.src = phUrl(items[i].n, items[i].k); sl.F = fitRect(items[i].k); sl.ph.style.width = sl.F.w + 'px'; sl.ph.style.height = sl.F.h + 'px';
    if (from && !RM){ setTr(sl, tileOf(i), true); setTr(sl, sl.F, false); } else setTr(sl, sl.F, true);
  };
  const setCap = (i, instant) => { const m = META[items[i].n]; const apply = () => { $(cap, 'b').textContent = CAP[items[i].n]; $(cap, 'span').textContent = o.meta === 'place' ? `${m.place}, ${m.date}` : metaLine(items[i].n); nEl.textContent = `${i + 1} / ${n}`; thbs.forEach((b, j) => b.setAttribute('aria-current', j === i)); }; if (instant){ apply(); s.capT = -9; } else { s.capT = now(); TL.at(now() + EXIT, apply); } };
  const hideTile = i => tiles.forEach((b, j) => $(b, 'img').style.visibility = j === i ? 'hidden' : 'visible');
  function open(i){
    if (s.open && !s.closing) return; const t = now(); const reopen = s.closing; s.open = true; s.closing = false; s.idx = i; s.opener = tiles[i];
    grid.inert = true; ov.inert = false;
    if (reopen){ const sl = slots[s.cur]; sl.i = i; setTr(sl, sl.F, false); } else { s.cur = 0; sw.cur = 0; sw.prev = null; sw.t = -9; slots[1].i = -1; place(slots[0], i, true); setCap(i, true); }
    hideTile(i); To.set(1); Tc.set(1, S.base, t + .16); setTimeout(() => bClose.focus({ preventScroll:true }), 30);
  }
  function close(){
    if (!s.open || s.closing) return; const t = now(); s.closing = true; Tc.set(0, S.snap); ov.inert = true; grid.inert = false; s.opener = tiles[s.idx];
    const sl = slots[s.cur], R = tileOf(s.idx); setTr(sl, R, RM, t + .06); To.set(0, S.soft, t + .04); s.opener.focus({ preventScroll:true });
  }
  function step(d){ goTo((s.idx + d + n) % n); }
  function goTo(i){
    if (!s.open || s.closing || i === s.idx) return; const t = now(), nx = 1 - s.cur;
    s.dir = i > s.idx ? 1 : -1; sw.to(nx, t); s.cur = nx; s.idx = i; place(slots[nx], i, false); hideTile(i); setCap(i);
  }
  bClose.onclick = close; bPrev.onclick = () => step(-1); bNext.onclick = () => step(1);
  ov.addEventListener('keydown', e => {
    if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'ArrowRight'){ e.preventDefault(); step(1); } else if (e.key === 'ArrowLeft'){ e.preventDefault(); step(-1); }
    else if (e.key === 'Tab'){ e.preventDefault(); const f = [bClose, bPrev, bNext], i = f.indexOf(document.activeElement); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  // pointer on the overlay: a tap on the backdrop closes, and with swipe a drag pulls the photo with the finger
  const samples = []; let down = null;
  ov.addEventListener('pointerdown', e => {
    if (e.button || !s.open || s.closing || e.target.closest('button')) return; const r = st.getBoundingClientRect();
    down = { x:e.clientX, y:e.clientY, t:now(), moved:false }; s.ax = e.clientX - r.left; s.ay = e.clientY - r.top; samples.length = 0; samples.push({ t:now(), x:e.clientX, y:e.clientY });
    if (o.swipe){ s.held = true; s.gx = s.gy = 0; Dx.jump(0); Dy.jump(0); } ov.setPointerCapture(e.pointerId);
  });
  ov.addEventListener('pointermove', e => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; if (Math.hypot(dx, dy) > 6) down.moved = true;
    samples.push({ t:now(), x:e.clientX, y:e.clientY }); if (samples.length > 6) samples.shift(); if (o.swipe){ s.gx = dx; s.gy = dy; }
  });
  const end = e => {
    if (!down) return; const d = down; down = null;
    if (!o.swipe){ if (!d.moved && !e.target.closest('button')) close(); return; }
    s.held = false; const a = samples[0], b = samples[samples.length - 1], dt = Math.max(1e-3, b.t - a.t), vx = (b.x - a.x)/dt, vy = (b.y - a.y)/dt, dx = s.gx, dy = s.gy;
    if (!d.moved){ close(); return; }
    const proj = dy + vy*.22;
    if (e.type === 'pointerup' && (proj > H*.2 && dy > 8 || vy > 900)){
      // dismiss: hand the dragged rect to the shared-element tracks so the flight keeps the finger's velocity
      const t = now(), sl = slots[s.cur], E = effRect(sl, t, dx, dy), k = scrimK(dy);
      s.closing = true; Tc.release(clamp(Tc.at(t))*(1 - clamp(Math.abs(dy)/70)), 0, 0, S.snap, t); ov.inert = true; grid.inert = false; s.opener = tiles[s.idx]; Dx.jump(0); Dy.jump(0);
      const R = tileOf(s.idx);
      sl.tr.x.release(E.x, vx, R.x, FLY, t); sl.tr.y.release(E.y, vy, R.y, FLY, t); sl.tr.w.release(E.w, 0, R.w, FLY, t); sl.tr.h.release(E.h, 0, R.h, FLY, t); sl.tr.r.release(E.r, 0, R.r, FLY, t);
      To.release(To.at(t)*k, 0, 0, S.base, t); s.opener.focus({ preventScroll:true });
    } else { Dx.release(dx, vx, 0, S.soft); Dy.release(dy, vy, 0, S.soft); }
  };
  ov.addEventListener('pointerup', end); ov.addEventListener('pointercancel', end);
  // the photo scales down as it is pulled, about the point the finger holds
  const pull = dy => dy > 0 ? clamp(dy/(H*.7)) : 0;
  const scrimK = dy => 1 - clamp(dy/(H*.55));
  function effRect(sl, t, dx, dy){
    const x = sl.tr.x.at(t), y = sl.tr.y.at(t), w = sl.tr.w.at(t), h = sl.tr.h.at(t), r = sl.tr.r.at(t);
    if (!o.swipe) return { x, y, w, h, r };
    const sc = 1 - .42*pull(dy), ey = dy < 0 ? rb(dy, 90) : dy;
    return { x:x + dx + (s.ax - x)*(1 - sc), y:y + ey + (s.ay - y)*(1 - sc), w:w*sc, h:h*sc, r:r + 22*(1 - sc)/.42 };
  }
  const layout = () => { W = st.clientWidth; H = st.clientHeight; const b = bp(W), c = o.cols[b]; root.dataset.bp = b; root.style.setProperty('--c', c); root.style.setProperty('--r', Math.ceil(n/c));
    if (s.open && !s.closing){ const sl = slots[s.cur]; sl.F = fitRect(items[s.idx].k); sl.ph.style.width = sl.F.w + 'px'; sl.ph.style.height = sl.F.h + 'px'; setTr(sl, sl.F, false); } };
  new ResizeObserver(layout).observe(st); layout();
  return t => {
    L.pump(); TL.run(t);
    const oo = clamp(To.at(t)), dx = s.held ? s.gx : Dx.at(t), dy = s.held ? s.gy : Dy.at(t), k = o.swipe ? scrimK(dy) : 1;
    ov.style.visibility = s.open || oo > .004 ? 'visible' : 'hidden'; scrim.style.opacity = (.94*oo*k).toFixed(3); hd.style.opacity = (1 - oo).toFixed(3);
    slots.forEach((sl, j) => {
      if (sl.i < 0){ sl.el.style.visibility = 'hidden'; return; }
      const E = effRect(sl, t, j === s.cur ? dx : 0, j === s.cur ? dy : 0); cover(sl.ph, sl.F.w, sl.F.h, E.x, E.y, E.w, E.h, E.r);
      let p = 1, tx = 0; if (j === sw.cur){ p = clamp(prog(t, sw.t + EXIT)); tx = (1 - p)*40*s.dir; } else if (j === sw.prev){ const q = clamp((t - sw.t)/EXIT); p = 1 - q*q; tx = -q*q*24*s.dir; }
      sl.el.style.opacity = p.toFixed(3); sl.el.style.transform = `translateX(${tx.toFixed(2)}px)`; if (p < .01 && j !== s.cur) sl.el.style.visibility = 'hidden'; else sl.el.style.visibility = 'visible';
    });
    const c = clamp(Tc.at(t))*(o.swipe ? 1 - clamp(Math.abs(dy)/70) : 1);
    if (capOver){ const F = slots[s.cur].F; cap.style.bottom = F ? Math.max(0, H - (F.y + F.h) + 10).toFixed(1) + 'px' : '0px'; } else cap.style.bottom = '0px';
    chrome.forEach(el => { fade(el, c, (1 - c)*-6); el.style.pointerEvents = c > .5 ? 'auto' : 'none'; }); fade(cap, c*swapO(t, s.capT), (1 - c)*8, true);
    if (s.closing){ const sl = slots[s.cur]; let done = To.prune(t) === 0 && oo < .005; for (const a in sl.tr) done = done && sl.tr[a].prune(t) === 0;
      if (done){ s.open = false; s.closing = false; hideTile(-1); slots.forEach(q => q.i = -1); } }
  };
}

atom({ id:'gal-grid-lightbox', cat:'Galleries', name:'Grid to lightbox, shared element', block:'gallery grid, lightbox, image', fam:['M','X','S'], wide:true, tall:true,
  html:lbHTML('', ['Sierra field notes', '12 photographs, October 2025'], 'Open a photo. Arrow keys step, Escape closes.'),
  desc:'Press a tile and that same photo grows out of it: position, size, crop and corner radius all spring from the tile to the viewer, while the grid behind it dims. The caption and controls arrive only after the photo is most of the way there. Stepping to the next photo is a Swap, so the old one leaves in the direction of travel before the new one arrives. Closing runs the controls out first, then flies the photo back into whichever tile it ended on. The viewer strip and the caption placement are per-demo options. Use when a grid of thumbnails needs a viewer that keeps the user oriented.',
  api:'photo.rect.set(open ? fit : tileRect); scrim.set(1); chrome.set(1, delay .16); step: exit 100ms, then enter from dir*40px; thumbs: on/off · cap: below/overlay',
  init(st){ return lightbox(st, { thumbs:true, tweak:true, cols:[3, 4, 4], meta:'exif', items:[['ridge','l'], ['lake','l'], ['portrait','p'], ['city','l'], ['studio','s'], ['coast','l'], ['forest','p'], ['dunes','l'], ['canyon','l'], ['harbor','l'], ['meadow','s'], ['field','l']].map(([n, k]) => ({ n, k })) }); } });

atom({ id:'gal-swipe-dismiss', cat:'Galleries', name:'Swipe down to dismiss', block:'gallery grid, lightbox, image', fam:['D','M','X'], wide:true, tall:true,
  html:lbHTML('', ['Field recordings', 'Open a photo, then pull it down'], 'The photo follows your finger. A quick flick closes it.'),
  desc:'Open a photo and drag it anywhere: it follows the pointer one to one and shrinks about the point you hold as you pull down, while the scrim fades with the distance and the controls fade out within the first 70 pixels. On release the pointer velocity decides: a fast flick or more than a fifth of the height hands the photo to the shared-element flight back to its tile, keeping the finger speed, and anything less springs back to centre. Use when a viewer needs the natural, touch-first way out.',
  api:'photo = fit + finger; scale = 1 − .42·pull; scrim = 1 − dy/(.55H); release: proj = dy + vy·.22 > .2H ? flyTo(tile, vy) : settle(0, vy)',
  init(st){ return lightbox(st, { swipe:true, cols:[3, 4, 4], meta:'place', items:[['harbor','l'], ['meadow','s'], ['canyon','l'], ['studio','s'], ['dunes','l'], ['portrait','p'], ['ridge','l'], ['coast','p'], ['field','l'], ['lake','l'], ['city','l'], ['forest','l']].map(([n, k]) => ({ n, k })) }); } });

/* ---------- 2. zoom, pan, rubber band ---------- */
const ZB = { l:[1440, 960], p:[960, 1440], s:[1200, 1200] }, ZT = { l:[240, 160], p:[160, 240], s:[200, 200] };
const zbig = (n, k) => PK.url(n, ZB[k][0], ZB[k][1]), zthumb = (n, k) => PK.url(n, ZT[k][0], ZT[k][1]);
document.head.insertAdjacentHTML('beforeend', `<style id="txg-zm">
.txg-zm{padding:12px}
.txg-zm-vp{position:relative;flex:1;min-height:0;border-radius:14px;background:#0C1016;overflow:hidden;touch-action:none;outline-offset:2px}
.txg-zm-ph{position:absolute;left:50%;top:50%;transform-origin:50% 50%;border-radius:4px;overflow:hidden}
.txg-zm-tools{position:absolute;top:10px;right:10px;display:flex;align-items:center;gap:6px;z-index:2}
.txg-zm-tools .txg-ib{width:36px;height:36px}
.txg-zm-pct{font:12px var(--mono);min-width:48px;text-align:center;background:color-mix(in oklab,#0C1016 74%,transparent);border:1px solid color-mix(in oklab,#EFF2F6 22%,transparent);border-radius:999px;padding:7px 8px;font-variant-numeric:tabular-nums}
.txg-zm-map{position:absolute;right:10px;bottom:10px;width:92px;border:1px solid color-mix(in oklab,#EFF2F6 34%,transparent);border-radius:6px;overflow:hidden;background-size:cover;background-position:center;pointer-events:none;z-index:2}
.txg-zm-map i{position:absolute;border:1.5px solid #EFF2F6;border-radius:3px;background:color-mix(in oklab,#EFF2F6 16%,transparent)}
.txg-zm-hint{position:absolute;left:12px;bottom:10px;max-width:calc(100% - 130px);font-size:12px;color:#ABAEB3;pointer-events:none;z-index:2}
.txg-zm-film{flex:none;display:flex;gap:8px;justify-content:center;padding-top:2px}
.txg-zm-film button{flex:1 1 0;max-width:76px;min-width:0;height:48px;border-radius:9px;border:2px solid transparent;overflow:hidden;padding:0;background:var(--raised);position:relative}
.txg-zm-film button img{position:absolute;inset:0}
.txg-zm-film button[aria-current=true]{border-color:var(--ink)}
</style>`);
atom({ id:'gal-zoom-pan', cat:'Galleries', name:'Lightbox with pinch, wheel and double-tap zoom', block:'lightbox, image zoom', fam:['D','M','S'], wide:true, tall:true,
  html:`<div class="txg txg-zm"><div class="txg-zm-vp txg-dk" tabindex="0" role="group" aria-roledescription="image viewer" aria-label="Photo viewer. Plus and minus zoom, zero fits, arrow keys pan.">
<div class="txg-zm-ph"><img alt=""></div>
<div class="txg-zm-tools"><button class="txg-ib" data-a="out" aria-label="Zoom out">${ic(GI.minus, 16)}</button><span class="txg-zm-pct" role="status" aria-label="Zoom level">100%</span><button class="txg-ib" data-a="in" aria-label="Zoom in">${ic(GI.plus, 16)}</button><button class="txg-ib" data-a="fit" aria-label="Fit photo to frame">${ic(GI.fit, 16)}</button></div>
<div class="txg-zm-map" aria-hidden="true"><i></i></div><div class="txg-zm-hint">Pinch, or hold Ctrl and scroll, to zoom. Double-tap to zoom in.</div></div>
<div class="txg-zm-film" role="group" aria-label="Photos"></div></div>`,
  desc:'The photo is a transform, not a layout: two fingers scale it about their midpoint while the midpoint drags it, a double-tap zooms to the exact point tapped, and Ctrl plus wheel (a trackpad pinch) zooms about the cursor without taking over normal scrolling. Pull past an edge and the image resists on a rubber band that grows harder the further you go; let go and a critically damped spring returns it, carrying the flick as glide that stops at the edge instead of bouncing off it. A locator in the corner shows which part you are looking at. Switching photos is a Swap that resets the zoom while the picture is invisible. Use when photographs need inspecting at pixel level.',
  api:'view = {s, x, y}; release: s → clamp(1, 5), x → glide(x + v/ω, ±bound(s)); tap², wheel: x′ = f − (f − x)·s′/s',
  init(st){
    const root = $(st, '.txg-zm'), vp = $(root, '.txg-zm-vp'), ph = $(vp, '.txg-zm-ph'), img = $(ph, 'img'), pct = $(vp, '.txg-zm-pct'), map = $(vp, '.txg-zm-map'), mapI = $(map, 'i'), film = $(root, '.txg-zm-film'), hint = $(vp, '.txg-zm-hint');
    const items = [['ridge','l'], ['canyon','l'], ['portrait','p'], ['harbor','l'], ['studio','s'], ['city','l']], MAXZ = 5, L = loader(), TL = timeline(), W0 = S.soft.w;
    const Ts = new Track(1, S.soft), Tx = new Track(0, S.soft), Ty = new Track(0, S.soft);
    let cur = 0, pend = -1, VW = 0, VH = 0, FW = 1, FH = 1, swT = -9, lastP = -1, curs = '';
    const thumbs = items.map(([n, k], i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Show ${CAP[n]}`); b.innerHTML = '<img alt="" draggable="false">'; film.appendChild(b); L.add($(b, 'img'), n, k, { half:true }); b.onclick = () => go(i); return b; });
    items.forEach(([n, k]) => L.job(() => zbig(n, k)));
    const sel = () => thumbs.forEach((b, j) => b.setAttribute('aria-current', j === (pend < 0 ? cur : pend)));
    const fit = () => { VW = vp.clientWidth; VH = vp.clientHeight; const a = ASP[items[cur][1]], mw = VW - 24, mh = VH - 24; FW = Math.max(40, Math.min(mw, mh*a)); FH = FW/a;
      ph.style.width = FW + 'px'; ph.style.height = FH + 'px'; ph.style.marginLeft = -FW/2 + 'px'; ph.style.marginTop = -FH/2 + 'px'; map.style.height = (92/a) + 'px'; hint.textContent = VW < 480 ? 'Pinch or double-tap to zoom.' : 'Pinch, or hold Ctrl and scroll, to zoom. Double-tap to zoom in.'; };
    const B = s => ({ x:Math.max(0, (FW*s - VW)/2), y:Math.max(0, (FH*s - VH)/2) });
    const show = i => { cur = i; const [n, k] = items[i]; img.src = zbig(n, k); map.style.backgroundImage = `url(${zthumb(n, k)})`; fit(); };
    const dispS = s => s < 1 ? 1 - rb(1 - s, .3) : s > MAXZ ? MAXZ + rb(s - MAXZ, 1.2) : s;
    const soft = (v, lim) => v > lim ? lim + rb(v - lim, 70) : v < -lim ? -lim - rb(-lim - v, 70) : v;
    const disp = g => { const s = dispS(g.s), b = B(s); return { s, x:soft(g.x, b.x), y:soft(g.y, b.y) }; };
    let held = false, G = { s:1, x:0, y:0 }, g0 = null, moved = 0, multi = false, lastTap = null, vr = null; const P = new Map(), samples = [];
    const view = t => held ? disp(G) : { s:Ts.at(t), x:Tx.at(t), y:Ty.at(t) };
    const rel = e => ({ x:e.clientX - vr.left - VW/2, y:e.clientY - vr.top - VH/2 });
    const mid = () => { const p = [...P.values()]; return { x:p.reduce((a, q) => a + q.x, 0)/p.length, y:p.reduce((a, q) => a + q.y, 0)/p.length, d:p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0 }; };
    const startG = () => { const m = mid(); g0 = { s:G.s, x:G.x, y:G.y, mx:m.x, my:m.y, d:m.d }; };
    const zoomAt = (fx, fy, sT) => { const s0 = Ts.target, b = B(sT); Tx.set(clamp(fx - (fx - Tx.target)*(sT/s0), -b.x, b.x)); Ty.set(clamp(fy - (fy - Ty.target)*(sT/s0), -b.y, b.y)); Ts.set(sT); };
    const reset = () => { Ts.set(1); Tx.set(0); Ty.set(0); };
    const glide = (T, from, v, lim) => { if (from < -lim || from > lim){ T.release(from, 0, clamp(from, -lim, lim), S.soft); return; } const to = clamp(from + v/W0, -lim, lim), D = to - from; T.release(from, D >= 0 ? Math.min(v, W0*D) : Math.max(v, W0*D), to, S.soft); };
    vp.addEventListener('pointerdown', e => {
      if (e.button || e.target.closest('button')) return;
      if (!P.size){ vr = vp.getBoundingClientRect(); G = { ...view(now()) }; held = true; moved = 0; multi = false; samples.length = 0; } else { G = { ...disp(G) }; multi = true; }
      vp.setPointerCapture(e.pointerId); P.set(e.pointerId, rel(e)); startG();
    });
    vp.addEventListener('pointermove', e => {
      if (!P.has(e.pointerId)) return; P.set(e.pointerId, rel(e)); const m = mid(); moved = Math.max(moved, Math.hypot(m.x - g0.mx, m.y - g0.my));
      G.s = g0.s*(m.d && g0.d ? m.d/g0.d : 1); const sd = dispS(G.s), k = sd/g0.s; G.x = m.x - (g0.mx - g0.x)*k; G.y = m.y - (g0.my - g0.y)*k;
      samples.push({ t:now(), x:m.x, y:m.y }); if (samples.length > 6) samples.shift();
    });
    const up = e => {
      if (!P.has(e.pointerId)) return; const pt = rel(e); P.delete(e.pointerId);
      if (P.size){ G = { ...disp(G) }; startG(); return; }
      held = false; const t = now(), d = disp(G), sT = clamp(G.s, 1, MAXZ), b = B(sT), k = sT/d.s, a = samples[0], z = samples[samples.length - 1], dt = a && z ? Math.max(1e-3, z.t - a.t) : 1, vx = a && !multi ? (z.x - a.x)/dt : 0, vy = a && !multi ? (z.y - a.y)/dt : 0;
      Ts.release(d.s, 0, sT, S.soft, t); glide(Tx, d.x*k, vx, b.x); glide(Ty, d.y*k, vy, b.y);
      if (!multi && moved < 8 && e.type === 'pointerup'){ if (lastTap && t - lastTap.t < .32 && Math.hypot(pt.x - lastTap.x, pt.y - lastTap.y) < 30){ lastTap = null; if (Ts.target > 1.05) reset(); else zoomAt(pt.x, pt.y, 2.6); } else lastTap = { t, x:pt.x, y:pt.y }; }
    };
    vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
    // a trackpad pinch arrives as a wheel event with ctrlKey set. Plain wheel is never touched.
    vp.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); if (held) return; vr = vp.getBoundingClientRect(); const f = rel(e); zoomAt(f.x, f.y, clamp(Ts.target*Math.exp(-clamp(e.deltaY, -60, 60)*.012), 1, MAXZ)); }, { passive:false });
    const zoomBy = k => { const sT = clamp(Ts.target*k, 1, MAXZ); if (sT < 1.05) reset(); else zoomAt(0, 0, sT); };
    $(vp, '[data-a=in]').onclick = () => zoomBy(1.6); $(vp, '[data-a=out]').onclick = () => zoomBy(1/1.6); $(vp, '[data-a=fit]').onclick = reset;
    vp.addEventListener('keydown', e => {
      if (e.target !== vp) return; const z = Ts.target > 1.05, b = B(Ts.target), pan = (T, d, lim) => T.set(clamp(T.target + d, -lim, lim));
      if (e.key === '+' || e.key === '='){ zoomBy(1.6); e.preventDefault(); } else if (e.key === '-' || e.key === '_'){ zoomBy(1/1.6); e.preventDefault(); } else if (e.key === '0'){ reset(); e.preventDefault(); }
      else if (e.key.startsWith('Arrow')){ e.preventDefault(); if (!z){ if (e.key === 'ArrowRight') go((cur + 1) % items.length); if (e.key === 'ArrowLeft') go((cur + items.length - 1) % items.length); } else { const d = 90; if (e.key === 'ArrowLeft') pan(Tx, d, b.x); if (e.key === 'ArrowRight') pan(Tx, -d, b.x); if (e.key === 'ArrowUp') pan(Ty, d, b.y); if (e.key === 'ArrowDown') pan(Ty, -d, b.y); } }
    });
    function go(i){ const t = now(); if (i === (pend < 0 ? cur : pend)) return; pend = i; swT = t; sel(); TL.at(t + EXIT, () => { show(i); pend = -1; Ts.jump(1); Tx.jump(0); Ty.jump(0); sel(); }); }
    new ResizeObserver(() => { fit(); const b = B(Ts.target); Tx.jump(clamp(Tx.target, -b.x, b.x)); Ty.jump(clamp(Ty.target, -b.y, b.y)); }).observe(vp); show(0); sel();
    return t => {
      L.pump(); TL.run(t); const v = view(t);
      ph.style.transform = `translate(${v.x.toFixed(2)}px,${v.y.toFixed(2)}px) scale(${v.s.toFixed(4)})`; ph.style.opacity = swapO(t, swT).toFixed(3);
      const p = Math.round(v.s*100); if (p !== lastP){ lastP = p; pct.textContent = p + '%'; }
      const o = clamp((v.s - 1.02)/.25); hint.style.opacity = (1 - o).toFixed(3); map.style.opacity = o.toFixed(3); map.style.visibility = o < .01 ? 'hidden' : 'visible';
      if (o > 0){ const vw = Math.min(1, VW/(FW*v.s)), vh = Math.min(1, VH/(FH*v.s)), cx = .5 - v.x/(FW*v.s), cy = .5 - v.y/(FH*v.s);
        mapI.style.left = ((cx - vw/2)*100).toFixed(2) + '%'; mapI.style.top = ((cy - vh/2)*100).toFixed(2) + '%'; mapI.style.width = (vw*100).toFixed(2) + '%'; mapI.style.height = (vh*100).toFixed(2) + '%'; }
      const c = held ? 'grabbing' : v.s > 1.02 ? 'grab' : 'zoom-in'; if (c !== curs){ curs = c; vp.style.cursor = c; }
    };
  } });

/* ---------- 4. filterable masonry ---------- */
document.head.insertAdjacentHTML('beforeend', `<style id="txg-ms">
.txg-ms-sc{flex:1;min-height:0;overflow-y:auto;position:relative;border-radius:10px;scrollbar-width:thin}
.txg-ms-in{position:relative}
.txg-ms-n,.txg-cs-n{vertical-align:-.3em}
.txg-ms-in .txg-ph{background:var(--raised)}
.txg-ms-in .txg-ph img{position:absolute;inset:0}
</style>`);
atom({ id:'gal-masonry-filter', cat:'Galleries', name:'Filterable masonry that reflows', block:'masonry gallery, filter chips', fam:['M','E','S'], wide:true, tall:true,
  html:`<div class="txg txg-ms"><div class="txg-hd"><div><h4>Contact prints</h4><p><span class="txg-num txg-ms-n"></span> of 16 photographs</p></div><span class="txg-hint">Pick a subject. Photos that stay travel to their new place.</span></div>
<div class="txg-chips" role="group" aria-label="Filter photographs by subject"><div class="ind"></div></div>
<div class="txg-ms-sc"><div class="txg-ms-in" role="list" aria-label="Photographs"></div></div><span class="txg-sr" role="status"></span></div>`,
  desc:'Choosing a subject runs three beats in order. Photos that no longer match shrink to their own centre in 100ms, staggered 20ms apart. Then the photos that stay travel to their new slots on a soft spring, one every 30ms in reading order so the reflow sweeps rather than jumps. Last, photos that now match grow in from their own centre, 200ms in. The pill behind the active filter is a two-edge indicator (leading edge first, trailing edge 60ms behind) and the count rolls its digits. Use when a gallery filters in place and people should keep track of what moved where.',
  api:'leave: s→0 (snap, k·20ms) · stay: x,y→slot (soft, 80ms + k·30ms) · enter: s→1 (base, 200ms + k·35ms) · height.set(newH)',
  init(st){
    const root = $(st, '.txg-ms'), sc = $(root, '.txg-ms-sc'), inn = $(root, '.txg-ms-in'), chipsEl = $(root, '.txg-chips'), ind = $(chipsEl, '.ind'), sr = $(root, '.txg-sr');
    const tags = [['all', 'All'], ['m', 'Mountains'], ['w', 'Water'], ['l', 'Open land'], ['c', 'City and people']];
    const items = [['ridge','l','m'], ['lake','p','w'], ['dunes','l','l'], ['city','p','c'], ['coast','l','w'], ['forest','p','l'], ['field','l','l'], ['canyon','p','m'], ['harbor','l','w'], ['meadow','s','l'], ['studio','s','c'], ['portrait','p','c'], ['ridge','p','m', 1], ['lake','l','w', 1], ['city','l','c', 1], ['canyon','l','m', 1]].map(([n, k, g, tod]) => ({ n, k, g, tod:tod || 0 }));
    const L = loader(), RF = new Reflow(), dg = new Digits($(root, '.txg-ms-n'), 2), Th = new Track(0, S.soft), ed = edges(0, 0);
    items.forEach(it => { const f = document.createElement('figure'); f.className = 'txg-ph'; f.setAttribute('role', 'listitem'); f.style.margin = 0; f.innerHTML = `<img alt="${CAP[it.n]}" draggable="false">`; inn.appendChild(f); L.add($(f, 'img'), it.n, it.k, { half:true, tod:it.tod }); RF.add(f, SZH[it.k][0], SZH[it.k][1], 8); });
    let cols = 3, g = 8, cur = 0, ready = false;
    const chips = tags.map(([k, label], i) => { const b = document.createElement('button'); b.className = 'txg-chip'; b.textContent = label; b.setAttribute('aria-pressed', 'false'); chipsEl.appendChild(b); b.onclick = () => pick(i); return b; });
    const vis = i => tags[cur][0] === 'all' || items[i].g === tags[cur][0];
    const arrange = () => { const W = sc.clientWidth, colW = (W - g*(cols - 1))/cols, colY = Array(cols).fill(0), rects = []; let any = 0;
      items.forEach((it, i) => { if (!vis(i)){ rects[i] = null; return; } any++; let c = 0; for (let k = 1; k < cols; k++) if (colY[k] < colY[c] - .5) c = k; const h = colW/ASP[it.k]; rects[i] = { x:c*(colW + g), y:colY[c], w:colW, h }; colY[c] += h + g; });
      return { rects, H:Math.max(0, Math.max(...colY) - g), n:any }; };
    const moveInd = inst => { const b = chips[cur]; ed[inst ? 'jump' : 'go'](b.offsetLeft, b.offsetLeft + b.offsetWidth); };
    function pick(i){
      const t = now(); cur = i; chips.forEach((b, j) => b.setAttribute('aria-pressed', j === i)); moveInd(); const A = arrange();
      RF.go(A.rects, t); Th.set(A.H); dg.set(String(A.n)); sr.textContent = `Showing ${A.n} of ${items.length} photographs: ${tags[i][1]}`;
    }
    new ResizeObserver(() => { const W = sc.clientWidth; cols = [2, 3, 5][bp(W)]; const A = arrange(); RF.snap(A.rects); Th.jump(A.H); moveInd(true); if (!ready){ ready = true; dg.set(String(A.n), true); chips[0].setAttribute('aria-pressed', 'true'); } }).observe(sc);
    return t => {
      L.pump(); RF.render(t); inn.style.height = Th.at(t).toFixed(1) + 'px'; dg.render(t);
      const a = ed.A.at(t), b = ed.B.at(t); ind.style.transform = `translateX(${a.toFixed(2)}px)`; ind.style.width = (b - a).toFixed(2) + 'px';
    };
  } });

/* ---------- 9. collection to collection morph ---------- */
document.head.insertAdjacentHTML('beforeend', `<style id="txg-cl">
.txg-cl-st{flex:1;min-height:0;position:relative}
.txg-cl-st .txg-ph{background:var(--raised)}
.txg-cl-st .txg-ph img{position:absolute;inset:0}
.txg-cl-t{min-width:0}
</style>`);
atom({ id:'gal-collection-morph', cat:'Galleries', name:'Collection to collection morph', block:'gallery, album switcher', fam:['M','E','S'], wide:true, tall:true,
  html:`<div class="txg txg-cl"><div class="txg-hd"><div class="txg-cl-t"><h4></h4><p></p></div><span class="txg-hint">Photos in both collections travel. The rest leave and arrive.</span></div>
<div class="txg-chips" role="group" aria-label="Collections"><div class="ind"></div></div><div class="txg-cl-st" role="list" aria-label="Photographs in this collection"></div><span class="txg-sr" role="status"></span></div>`,
  desc:'Twelve photographs are one set of elements that every collection arranges differently: a lead image with a grid, a plain grid, justified rows, tall columns. Switching runs in order. Photos not in the next collection shrink away first. Photos that are in both travel to their new slots, re-cropping as they go (a landscape becomes a tall column without a jump cut), starting 80ms later and staggered by their new position. Photos that are new to the collection grow in last. The title swaps on the same schedule: out, then in. Use when albums, smart collections or saved sets share photos and the user should see what carried over.',
  api:'next = layout(kind, ids); leave: s→0 · stay: rect→next (soft, k·30ms) · enter: s→1 (200ms+) · title: swap',
  init(st){
    const root = $(st, '.txg-cl'), stg = $(root, '.txg-cl-st'), chipsEl = $(root, '.txg-chips'), ind = $(chipsEl, '.ind'), titleEl = $(root, '.txg-cl-t'), sr = $(root, '.txg-sr');
    const P = [['ridge','l'], ['lake','l'], ['forest','l'], ['meadow','l'], ['canyon','l'], ['field','l'], ['dunes','l'], ['harbor','l'], ['portrait','p'], ['coast','l'], ['studio','s'], ['city','l']];
    const id = n => P.findIndex(p => p[0] === n);
    const COL = [
      { name:'Sierra, October', kind:'hero', ids:['ridge', 'lake', 'forest', 'meadow', 'canyon', 'field', 'dunes'], sub:'7 photographs, one lead image' },
      { name:'Short list', kind:'grid', ids:['ridge', 'harbor', 'portrait', 'canyon', 'coast', 'studio'], sub:'6 photographs, picked for the book' },
      { name:'Quiet places', kind:'rows', ids:['lake', 'meadow', 'forest', 'dunes', 'field'], sub:'5 photographs, no people' },
      { name:'People and places', kind:'cols', ids:['city', 'portrait', 'studio', 'harbor'], sub:'4 photographs, one long row' }
    ];
    const NAT = { l:[600, 400], p:[400, 600], s:[500, 500] }, L = loader(), RF = new Reflow(), TL = timeline(), ed = edges(0, 0), g = 8;
    P.forEach(([n, k]) => { const f = document.createElement('figure'); f.className = 'txg-ph'; f.setAttribute('role', 'listitem'); f.style.margin = 0; f.innerHTML = `<img alt="${CAP[n]}" draggable="false">`; stg.appendChild(f); L.add($(f, 'img'), n, k); RF.add(f, NAT[k][0], NAT[k][1], 8); });
    const LAY = {
      hero:(ids, W, H) => { const n = ids.length, r = [], wide = W >= 520, cols = 3, rows = Math.ceil((n - 1)/cols);
        if (wide){ const hw = Math.round(W*.46), cw = (W - hw - g - g*(cols - 1))/cols, ch = (H - g*(rows - 1))/rows; r.push({ x:0, y:0, w:hw, h:H }); for (let j = 0; j < n - 1; j++) r.push({ x:hw + g + (j%cols)*(cw + g), y:Math.floor(j/cols)*(ch + g), w:cw, h:ch }); }
        else { const hh = Math.round(H*.4), cw = (W - g*(cols - 1))/cols, ch = (H - hh - g - g*(rows - 1))/rows; r.push({ x:0, y:0, w:W, h:hh }); for (let j = 0; j < n - 1; j++) r.push({ x:(j%cols)*(cw + g), y:hh + g + Math.floor(j/cols)*(ch + g), w:cw, h:ch }); }
        return r; },
      grid:(ids, W, H) => { const n = ids.length, cols = W >= 520 ? 3 : 2, rows = Math.ceil(n/cols), cw = (W - g*(cols - 1))/cols, ch = (H - g*(rows - 1))/rows; return ids.map((_, j) => ({ x:(j%cols)*(cw + g), y:Math.floor(j/cols)*(ch + g), w:cw, h:ch })); },
      rows:(ids, W, H) => { const n = ids.length, R = W >= 520 ? 2 : 3, per = Math.ceil(n/R), rowsA = []; for (let i = 0; i < n; i += per) rowsA.push(ids.slice(i, i + per).map((_, j) => i + j));
        const a = i => ASP[P[id(ids[i])][1]], rh = rowsA.map(r => (W - g*(r.length - 1))/r.reduce((s, i) => s + a(i), 0)), tot = rh.reduce((s, v) => s + v, 0) + g*(rowsA.length - 1), f = Math.min(1, H/tot), out = []; let y = (H - tot*f)/2;
        rowsA.forEach((r, ri) => { const h = rh[ri]*f, rw = r.reduce((s, i) => s + a(i)*h, 0) + g*(r.length - 1); let x = (W - rw)/2; r.forEach(i => { out[i] = { x, y, w:a(i)*h, h }; x += a(i)*h + g; }); y += h + g; }); return out; },
      cols:(ids, W, H) => { const n = ids.length; if (W < 520) return LAY.grid(ids, W, H); const cw = (W - g*(n - 1))/n; return ids.map((_, j) => ({ x:j*(cw + g), y:0, w:cw, h:H })); }
    };
    let cur = 0, shown = -1, ttl = -9; const chips = COL.map((c, i) => { const b = document.createElement('button'); b.className = 'txg-chip'; b.textContent = c.name; b.setAttribute('aria-pressed', 'false'); chipsEl.appendChild(b); b.onclick = () => pick(i); return b; });
    const rectsFor = i => { const W = stg.clientWidth, H = stg.clientHeight, c = COL[i], lay = LAY[c.kind](c.ids, W, H), out = []; c.ids.forEach((n, j) => out[id(n)] = lay[j]); return out; };
    const moveInd = inst => { const b = chips[cur]; ed[inst ? 'jump' : 'go'](b.offsetLeft, b.offsetLeft + b.offsetWidth); };
    const setTitle = () => { $(titleEl, 'h4').textContent = COL[cur].name; $(titleEl, 'p').textContent = COL[cur].sub; };
    function pick(i){ if (i === cur) return; const t = now(); cur = i; chips.forEach((b, j) => b.setAttribute('aria-pressed', j === i)); moveInd(); RF.go(rectsFor(i), t); ttl = t; TL.at(t + EXIT, setTitle); sr.textContent = `${COL[i].name}: ${COL[i].sub}`; }
    new ResizeObserver(() => { RF.snap(rectsFor(cur)); moveInd(true); if (shown < 0){ shown = 1; chips[0].setAttribute('aria-pressed', 'true'); setTitle(); } }).observe(stg);
    return t => { L.pump(); TL.run(t); RF.render(t); const a = ed.A.at(t), b = ed.B.at(t); ind.style.transform = `translateX(${a.toFixed(2)}px)`; ind.style.width = (b - a).toFixed(2) + 'px'; fade(titleEl, swapO(t, ttl), (1 - swapO(t, ttl))*4, true); };
  } });

/* ---------- 5. contact sheet with a loupe ---------- */
document.head.insertAdjacentHTML('beforeend', `<style id="txg-cs">
.txg-cs-wrap{flex:1;min-height:0;position:relative;touch-action:pan-y}
.txg-cs-sheet{position:absolute;background:#0C1016;border-radius:12px;box-shadow:var(--shadow);overflow:hidden;color:#EFF2F6}
.txg-cs-in{display:grid;grid-template-columns:repeat(var(--cols,8),minmax(0,1fr));gap:10px 8px;padding:14px}
.txg-cs-f{display:block;border:0;padding:0;background:none;text-align:left;border-radius:3px;min-width:0;position:relative}
.txg-cs-f .im{display:block;position:relative;aspect-ratio:3/2;border-radius:2px;overflow:hidden;background:#171B21}
.txg-cs-f .im img{position:absolute;inset:0}
.txg-cs-f i{display:flex;justify-content:space-between;font:10px/1 var(--mono);font-style:normal;color:#ABAEB3;padding-top:5px}
.txg-cs-f.pk .im{box-shadow:0 0 0 2px #0C1016,0 0 0 4px #EFF2F6}
.txg-cs-f.pk i{color:#EFF2F6}
.txg-cs-f:focus-visible{outline:2px solid #EFF2F6;outline-offset:3px}
.txg-cs-lens{position:absolute;left:0;top:0;border-radius:50%;overflow:hidden;border:2px solid #EFF2F6;background:#0C1016;box-shadow:0 0 0 1px rgba(12,16,22,.55),0 14px 34px rgba(0,0,0,.4);pointer-events:none;z-index:5;visibility:hidden}
.txg-cs-lens .txg-cs-in{position:absolute;left:0;top:0;transform-origin:0 0;padding:14px}
.txg-cs-lab{position:absolute;left:0;top:0;z-index:5;pointer-events:none;background:#0C1016;color:#EFF2F6;border-radius:999px;font:12px var(--mono);padding:5px 11px;white-space:nowrap;visibility:hidden;box-shadow:0 0 0 1px rgba(239,242,246,.2)}
</style>`);
atom({ id:'gal-contact-loupe', cat:'Galleries', name:'Contact sheet with a loupe', block:'contact sheet, image zoom, picks', fam:['D','X','S'], wide:true, tall:true,
  html:`<div class="txg txg-cs"><div class="txg-hd"><div><h4>Roll 07, Sierra</h4><p><span class="txg-num txg-cs-n"></span> picked of 32 frames</p></div><span class="txg-hint">Move over the sheet to read a frame. Click, or press Enter, to pick it.</span></div>
<div class="txg-cs-wrap"><div class="txg-cs-sheet" role="group" aria-label="Contact sheet, 32 frames. Arrow keys move between frames, Enter picks."><div class="txg-cs-in"></div></div>
<div class="txg-cs-lens" aria-hidden="true"><div class="txg-cs-in" inert></div></div><div class="txg-cs-lab" aria-hidden="true"></div></div></div>`,
  desc:'A round loupe follows the pointer on a snap spring, so it trails the hand by a few frames instead of being glued to it. What it shows is the sheet itself, scaled 3.4 times about the lens centre, so frames cross the glass continuously and picks you have marked show up inside it. The lens pops in on enter and out on leave, and its label swaps (out, then in) as the centre crosses from one frame to the next. On touch the lens sits above the finger so it is never hidden by it; from the keyboard it parks on the focused frame. Use when people must judge sharpness or expression across many small frames without opening each one.',
  api:'lens.xy.set(pointer, snap); content = sheet·scale(3.4) translated so lens centre = sheet point; label.swap(frameUnderLens)',
  init(st){
    const root = $(st, '.txg-cs'), wrap = $(root, '.txg-cs-wrap'), sheet = $(root, '.txg-cs-sheet'), inn = $(sheet, '.txg-cs-in'), lens = $(root, '.txg-cs-lens'), lin = $(lens, '.txg-cs-in'), lab = $(root, '.txg-cs-lab'), dgp = new Digits($(root, '.txg-cs-n'), 2);
    const N = 32, TODS = [0, 1, .5], frames = []; const L = loader(), TL = timeline();
    for (let i = 0; i < N; i++){ const n = PK.NAMES[i % 12], tod = TODS[Math.floor(i/12)], num = String(i + 1).padStart(2, '0'); frames.push({ n, tod, num, cap:CAP[n], pick:false }); }
    const cell = (f, i, tag) => { const e = document.createElement(tag); e.className = 'txg-cs-f'; e.innerHTML = `<span class="im"><img alt="" draggable="false"></span><i><span>${f.num}</span><span class="pm"></span></i>`; if (tag === 'button'){ e.setAttribute('aria-label', `Frame ${f.num}, ${f.cap}`); e.setAttribute('aria-pressed', 'false'); e.tabIndex = i ? -1 : 0; } return e; };
    const base = frames.map((f, i) => { const b = cell(f, i, 'button'); inn.appendChild(b); return b; }), clones = frames.map((f, i) => { const d = cell(f, i, 'div'); lin.appendChild(d); return d; });
    frames.forEach((f, i) => L.job(() => { const u = phUrl(f.n, 'l', { half:true, tod:f.tod }); $(base[i], 'img').src = u; $(clones[i], 'img').src = u; }));
    const Lx = new Track(0, S.snap), Ly = new Track(0, S.snap), Lv = new Track(0, S.base);
    let SW = 0, SH = 0, SX = 0, SY = 0, R = 84, M = 3.4, rects = [], cols = 8, picks = 0, cur = 0, inside = false, focused = false, near = -1, labT = -9, labTxt = '', labW = 80, touch = false;
    dgp.set('0', true);
    const frameAt = (sx, sy) => { let best = -1, bd = 1e9; rects.forEach((r, i) => { const d = Math.hypot(sx - (r.x + r.w/2), sy - (r.y + r.h/2)); if (d < bd){ bd = d; best = i; } }); return best; };
    const aim = (x, y) => { const t = now(); if (Lv.at(t) < .05 && Lv.target < .5){ Lx.jump(x); Ly.jump(y); } else { Lx.set(x); Ly.set(y); } };
    const show = v => Lv.set(v ? 1 : 0, v ? S.base : S.snap);
    const layout = () => { const W = wrap.clientWidth, H = wrap.clientHeight, b = bp(W); cols = [4, 8, 8][b]; R = b ? 84 : 62; M = b ? 3.4 : 3; const rows = Math.ceil(N/cols), pad = 14, gx = 8, gy = 10, lab = 16;
      const hOf = w => { const fw = (w - 2*pad - gx*(cols - 1))/cols; return 2*pad + rows*(fw/1.5 + lab) + gy*(rows - 1); }; let w = W; for (let k = 0; k < 3; k++){ const h = hOf(w); if (h > H) w = w*H/h; }
      SW = Math.max(120, w); SH = hOf(SW); SX = (W - SW)/2; SY = Math.max(0, (H - SH)/2);
      Object.assign(sheet.style, { width:SW + 'px', height:SH + 'px', left:SX + 'px', top:SY + 'px' }); Object.assign(lin.style, { width:SW + 'px', height:SH + 'px' });
      inn.style.setProperty('--cols', cols); lin.style.setProperty('--cols', cols); lens.style.width = lens.style.height = 2*R + 'px';
      const sr = sheet.getBoundingClientRect(); rects = base.map(bn => { const r = $(bn, '.im').getBoundingClientRect(); return { x:r.left - sr.left, y:r.top - sr.top, w:r.width, h:r.height }; }); };
    new ResizeObserver(layout).observe(wrap);
    const pt = e => { const r = wrap.getBoundingClientRect(); return { x:e.clientX - r.left, y:e.clientY - r.top }; };
    const inSheet = p => p.x >= SX && p.x <= SX + SW && p.y >= SY && p.y <= SY + SH;
    wrap.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; touch = true; const p = pt(e); if (!inSheet(p)) return; inside = true; aim(p.x, p.y - R - 30); show(true); wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', e => { const p = pt(e); if (e.pointerType === 'mouse'){ touch = false; if (inSheet(p)){ inside = true; aim(p.x, p.y); show(true); } else if (inside){ inside = false; if (!focused) show(false); } } else if (inside){ aim(p.x, p.y - R - 30); } });
    const out = e => { if (e.pointerType === 'mouse' || inside){ inside = false; if (!focused) show(false); } };
    wrap.addEventListener('pointerleave', out); wrap.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') out(e); }); wrap.addEventListener('pointercancel', out);
    const setPick = (i, v) => { frames[i].pick = v; base[i].classList.toggle('pk', v); clones[i].classList.toggle('pk', v); base[i].setAttribute('aria-pressed', v); $(base[i], '.pm').textContent = $(clones[i], '.pm').textContent = v ? 'picked' : ''; picks += v ? 1 : -1; dgp.set(String(picks)); };
    base.forEach((b, i) => { b.onclick = () => setPick(i, !frames[i].pick);
      b.onfocus = () => { cur = i; base.forEach((x, j) => x.tabIndex = j === i ? 0 : -1); if (!b.matches(':focus-visible')) return; focused = true; const r = rects[i]; aim(SX + r.x + r.w/2, SY + r.y + r.h/2); show(true); };
      b.onblur = () => { focused = false; if (!inside) show(false); }; });
    sheet.addEventListener('keydown', e => { const k = e.key, d = k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : k === 'ArrowDown' ? cols : k === 'ArrowUp' ? -cols : k === 'Home' ? -N : k === 'End' ? N : 0; if (!d) return; e.preventDefault(); const j = clamp(cur + d, 0, N - 1); base[j].focus(); });
    return t => {
      L.pump(); TL.run(t); dgp.render(t); const v = clamp(Lv.at(t)), lx = Lx.at(t), ly = Ly.at(t);
      lens.style.visibility = lab.style.visibility = v < .01 ? 'hidden' : 'visible'; if (v < .01) return;
      lens.style.opacity = v.toFixed(3); lens.style.transform = `translate(${(lx - R).toFixed(1)}px,${(ly - R).toFixed(1)}px) scale(${(.82 + .18*v).toFixed(3)})`;
      lin.style.transform = `translate(${(R - M*(lx - SX)).toFixed(1)}px,${(R - M*(ly - SY)).toFixed(1)}px) scale(${M})`;
      const f = frameAt(lx - SX, ly - SY); if (f !== near){ near = f; labT = t; TL.at(t + EXIT, () => { labTxt = near < 0 ? '' : `${frames[near].num}  ${frames[near].cap}`; lab.textContent = labTxt; labW = lab.offsetWidth; }); }
      const o = swapO(t, labT)*v; lab.style.opacity = o.toFixed(3); lab.style.transform = `translate(${(lx - labW/2).toFixed(1)}px,${(ly + R + 10).toFixed(1)}px)`;
    };
  } });

/* ---------- 6. photo stack that fans out ---------- */
document.head.insertAdjacentHTML('beforeend', `<style id="txg-st">
.txg-st-zone{flex:1;min-height:0;position:relative;touch-action:manipulation}
.txg-st-c{position:absolute;left:0;top:0;padding:6px 6px 0;background:var(--card);border-radius:9px;box-shadow:var(--shadow);transform-origin:50% 100%;pointer-events:none;display:block;text-align:center}
.txg-st-c .p{display:block;position:relative;border-radius:4px;overflow:hidden;background:var(--raised)}
.txg-st-c .p img{position:absolute;inset:0}
.txg-st-c .t{display:block;font:11px/30px var(--mono);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txg-st-c:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.txg-st-tg{position:absolute;left:0;top:0;border:0;background:none;border-radius:10px;pointer-events:none}
.txg-st-tg:focus-visible{outline:2px solid var(--accent);outline-offset:6px}
.txg-st-cap{flex:none;text-align:center;min-height:42px}
.txg-st-cap b{display:block;font-size:14px;font-weight:600}
.txg-st-cap span{display:block;font:12px var(--mono);color:var(--muted)}
</style>`);
atom({ id:'gal-photo-stack', cat:'Galleries', name:'Photo stack that fans out', block:'photo stack, gallery preview', fam:['M','E','X'], wide:true, tall:true,
  html:`<div class="txg txg-st"><div class="txg-hd"><div><h4>Print box, Sierra trip</h4><p>7 prints</p></div><span class="txg-hint">Hover or tap the stack to fan it out. Pick a print to bring it to the top.</span></div>
<div class="txg-st-zone"><button class="txg-st-tg" aria-expanded="false" aria-label="Print stack, 7 prints. Show all prints"></button></div><div class="txg-st-cap" aria-live="polite"><b></b><span></span></div></div>`,
  desc:'Seven prints sit in a loose pile, each tilted a few degrees. Hover (or tap) and the top print leaves first, then each one beneath it 35ms later, all swinging out about the base of the pile into an arc. The print under the pointer lifts along its own axis while its neighbours lean away from it, and which print that is comes from the angle to the base, not from what is under the cursor, so a lifting print never flickers. Pick one and it travels to the top of the pile as the rest close from the bottom up. Use when a collection needs a compact, tactile preview that opens in place.',
  api:'fan: card.f.set(1, delay (n−1−slot)·35ms) · hover: lift along local axis, neighbours rotate ±3° · pick: slot→top, f.set(0, delay slot·25ms)',
  init(st){
    const root = $(st, '.txg-st'), zone = $(root, '.txg-st-zone'), tg = $(zone, '.txg-st-tg'), cap = $(root, '.txg-st-cap'), hdp = $(root, '.txg-hd p');
    const NM = ['ridge', 'lake', 'canyon', 'harbor', 'meadow', 'studio', 'portrait'], n = NM.length, c = (n - 1)/2, L = loader(), TL = timeline();
    const JIT = [[-5, -3, 2], [3, 2, -1], [-2, -1, 1], [4, 3, -2], [-3, -2, 1], [2, 1, 0], [-1, 0, 0]];
    const cards = NM.map((nm, k) => { const b = document.createElement('button'); b.className = 'txg-st-c'; b.tabIndex = -1; b.inert = true; b.setAttribute('aria-label', `${CAP[nm]}. Bring to the top`); b.innerHTML = `<span class="p"><img alt="" draggable="false"></span><span class="t">${CAP[nm]}</span>`; zone.insertBefore(b, tg); L.add($(b, 'img'), nm, 'p', { half:true });
      return { b, p:new Track(k, S.base), f:new Track(0, S.base), h:new Track(0, S.base), slot:k }; });
    let ord = cards.map((_, k) => k), open = false, armed = true, hover = -1, kb = n - 1, W = 0, Hh = 0, cw = 150, ch = 210, cx = 0, by = 0, step = 9, capT = -9, capK = -2;
    const slotOf = k => ord.indexOf(k);
    const layout = () => { W = zone.clientWidth; Hh = zone.clientHeight; cw = clamp(Math.min(W*(W < 480 ? .42 : .34), Hh*.74/1.4), 110, 250); ch = cw*1.4; cx = W/2; by = Math.min(Hh - 14, Hh/2 + ch*.5 + 24);
      const a = Math.asin(clamp((W/2 - 16 - cw/2)/ch, .05, 1))*180/Math.PI; step = Math.min(9.5, a/c);
      cards.forEach(k => { k.b.style.width = cw + 'px'; k.b.style.height = ch + 'px'; k.b.style.left = (cx - cw/2) + 'px'; k.b.style.top = (by - ch) + 'px'; $(k.b, '.p').style.height = (ch - 6 - 30) + 'px'; });
      Object.assign(tg.style, { width:(cw + 28) + 'px', height:(ch + 28) + 'px', left:(cx - cw/2 - 14) + 'px', top:(by - ch - 14) + 'px' }); };
    new ResizeObserver(layout).observe(zone);
    const front = () => ord[n - 1];
    const setCap = () => { const k = hover >= 0 ? ord[hover] : front(); if (k === capK) return; capK = k; capT = now(); TL.at(capT + EXIT, () => { const m = META[NM[capK]]; $(cap, 'b').textContent = CAP[NM[capK]]; $(cap, 'span').textContent = `${m.place}, ${m.date}`; }); };
    const setHover = s => { if (s === hover) return; hover = s; cards.forEach((k, i) => k.h.set(s >= 0 && ord[s] === i ? 1 : 0, S.base)); setCap(); };
    const setOpen = (v, via) => { if (v === open) return; const t = now(); open = v; tg.setAttribute('aria-expanded', v); cards.forEach(k => { k.b.inert = !v; });
      ord.forEach((ci, s) => { const k = cards[ci]; k.f.set(v ? 1 : 0, S.base, t + (v ? (n - 1 - s)*.035 : s*.025)); }); if (!v) setHover(-1);
      if (v){ kb = n - 1; cards.forEach((k, i) => k.b.tabIndex = i === ord[kb] ? 0 : -1); if (via === 'key') setTimeout(() => cards[ord[kb]].b.focus({ preventScroll:true }), 20); setHover(via === 'key' ? kb : -1); } };
    const choose = ci => { const t = now(), no = ord.filter(x => x !== ci).concat(ci); ord = no; hover = -1; cards.forEach((k, i) => { k.h.set(0, S.base); k.p.set(no.indexOf(i), S.base, t + (i === ci ? 0 : .05)); });
      open = false; tg.setAttribute('aria-expanded', false); tg.setAttribute('aria-label', `Print stack, ${n} prints. Top print: ${CAP[NM[ci]]}. Show all prints`); cards.forEach(k => k.b.inert = true);
      no.forEach((x, s) => cards[x].f.set(0, S.base, t + .06 + s*.025)); setCap(); armed = false; };
    const geo = e => { const r = zone.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, dx = px - cx, dy = by - py, dist = Math.hypot(dx, dy), idx = dx/Math.max(1, dy)*0, ang = Math.atan2(dx, dy)*180/Math.PI, f = ang/step + c;
      return { onPile:px > cx - cw/2 - 14 && px < cx + cw/2 + 14 && py > by - ch - 14 && py < by + 14, inFan:dy > -16 && dist < ch + 30 && f > -1.1 && f < n - 1 + 1.1, slot:clamp(Math.round(f), 0, n - 1) }; };
    zone.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const g = geo(e); if (!open){ if (g.onPile && armed) setOpen(true, 'ptr'); else if (!g.onPile) armed = true; } else if (!g.inFan){ setOpen(false); armed = !g.onPile; } else setHover(g.slot); });
    zone.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse'){ setOpen(false); armed = true; } });
    zone.addEventListener('pointerdown', e => { const g = geo(e); if (e.pointerType === 'mouse'){ if (open && g.inFan) choose(ord[g.slot]); return; }
      if (!open){ if (g.onPile) setOpen(true, 'ptr'); } else if (g.inFan) choose(ord[g.slot]); else setOpen(false); });
    tg.onclick = () => setOpen(!open, 'key');
    cards.forEach((k, i) => { k.b.onclick = () => { choose(i); tg.focus({ preventScroll:true }); }; k.b.onfocus = () => { if (open){ kb = slotOf(i); cards.forEach((q, j) => q.b.tabIndex = j === i ? 0 : -1); if (k.b.matches(':focus-visible')) setHover(kb); } }; });
    root.addEventListener('keydown', e => { if (!open) return; if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); setOpen(false); armed = false; tg.focus({ preventScroll:true }); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ e.preventDefault(); kb = clamp(kb + (e.key === 'ArrowRight' ? 1 : -1), 0, n - 1); cards[ord[kb]].b.focus({ preventScroll:true }); } });
    $(cap, 'b').textContent = CAP[NM[front()]]; $(cap, 'span').textContent = `${META[NM[front()]].place}, ${META[NM[front()]].date}`; capK = front();
    const lerpJ = (p, a) => { const i0 = clamp(Math.floor(p), 0, n - 1), i1 = Math.min(n - 1, i0 + 1), u = clamp(p - i0); return lerp(JIT[i0][a], JIT[i1][a], u); };
    return t => {
      L.pump(); TL.run(t); const P = cards.map(k => k.p.at(t)), Hs = cards.map(k => clamp(k.h.at(t)));
      cards.forEach((k, i) => { const p = P[i], f = clamp(k.f.at(t)), h = Hs[i]; let push = 0;
        for (let j = 0; j < n; j++) if (j !== i && Hs[j] > .001){ const d = p - P[j]; push += Hs[j]*Math.sign(d)*3.2/(1 + Math.abs(d)*.7); }
        const rot = lerp(lerpJ(p, 0), (p - c)*step, f) + push, x = lerp(lerpJ(p, 1), (p - c)*cw*.035, f), y = lerp(lerpJ(p, 2), 0, f) - (h*ch*.1);
        k.b.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${(1 + .05*h).toFixed(4)})`; k.b.style.zIndex = h > .02 ? 40 : Math.round(p) + 1; });
      fade(cap, swapO(t, capT), 0, true);
    };
  } });

/* ---------- 7. hover-focus grid ---------- */
document.head.insertAdjacentHTML('beforeend', `<style id="txg-fg">
.txg-fg-g{flex:1;min-height:0;display:grid;gap:8px}
.txg-fg-t{position:relative;border:0;padding:0;border-radius:10px;overflow:hidden;background:var(--raised);min-width:0;min-height:0;display:block;text-align:left;transform-origin:50% 50%}
.txg-fg-t img{position:absolute;inset:0}
.txg-fg-c{position:absolute;left:8px;bottom:8px;max-width:calc(100% - 16px);background:#0C1016;color:#EFF2F6;border-radius:8px;padding:6px 10px;pointer-events:none}
.txg-fg-c b{display:block;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txg-fg-c i{display:block;font:11px var(--mono);font-style:normal;color:#ABAEB3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txg-fg-t[aria-pressed=true]{outline:2px solid var(--ink);outline-offset:-2px}
</style>`);
atom({ id:'gal-hover-focus', cat:'Galleries', name:'Hover-focus grid', block:'gallery grid, image', fam:['M','E'], wide:true, tall:true,
  html:`<div class="txg txg-fg"><div class="txg-hd"><div><h4>Selected work, 2025</h4><p>10 photographs</p></div><span class="txg-hint">Hover to look at one. Click, or tap, to hold the focus.</span></div><div class="txg-fg-g" role="group" aria-label="Photographs"></div></div>`,
  desc:'The photo under the pointer stays exactly as it is and gains a small caption. Every other photo quietly drains of colour, dims and settles back 3.5 percent, and it does so in a wave: the nearest neighbours go first, the far corner last, about 14ms per 100 pixels. Moving to another photo retargets the same springs, so nothing restarts. Leaving the grid returns everything on the slow spring, over about half a second. Click or tap pins the focus so touch screens and keyboards get the same state; Escape releases it. Use when a portfolio grid should direct attention without hiding the rest.',
  api:'hover(i): others.r.set(1, soft, delay d(i,j)·.14ms/px) · i.r.set(0) · leave: all.r.set(0, lazy) · r → saturate, brightness, scale',
  init(st){
    const root = $(st, '.txg-fg'), grid = $(root, '.txg-fg-g'), L = loader();
    const NM = ['ridge', 'lake', 'portrait', 'city', 'canyon', 'harbor', 'forest', 'studio', 'dunes', 'coast'], n = NM.length;
    const PL = [ [[0,0,2,2], [2,0,1,1], [2,1,1,1], [0,2,1,2], [1,2,2,1], [1,3,1,1], [2,3,1,1], [0,4,1,1], [1,4,1,1], [2,4,1,1]],
      [[0,0,2,2], [2,0,1,1], [3,0,2,1], [2,1,1,1], [3,1,1,1], [4,1,1,1], [0,2,1,1], [1,2,2,1], [3,2,1,1], [4,2,1,1]],
      [[0,0,2,2], [2,0,1,1], [3,0,1,2], [4,0,2,1], [2,1,1,1], [4,1,1,1], [5,1,1,2], [0,2,2,1], [2,2,1,1], [3,2,2,1]] ], DIM = [[3, 5], [5, 3], [6, 3]];
    const tiles = NM.map((nm, i) => { const b = document.createElement('button'); b.className = 'txg-fg-t'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', `${CAP[nm]}, ${META[nm].date}. Hold focus on this photo`);
      b.innerHTML = `<img alt="" draggable="false"><span class="txg-fg-c"><b>${CAP[nm]}</b><i>${META[nm].place}</i></span>`; grid.appendChild(b); L.add($(b, 'img'), nm, i === 2 ? 'p' : 'l'); return { b, img:$(b, 'img'), cap:$(b, '.txg-fg-c'), r:new Track(0, S.soft), h:new Track(0, S.base), cx:0, cy:0 }; });
    let focus = -1, pin = -1, lvl = 2;
    const layout = () => { lvl = bp(root.clientWidth); const [c, r] = DIM[lvl]; grid.style.gridTemplateColumns = `repeat(${c},minmax(0,1fr))`; grid.style.gridTemplateRows = `repeat(${r},minmax(0,1fr))`;
      tiles.forEach((k, i) => { const [x, y, w, h] = PL[lvl][i]; Object.assign(k.b.style, { gridColumn:`${x + 1} / span ${w}`, gridRow:`${y + 1} / span ${h}` }); });
      const g = grid.getBoundingClientRect(); tiles.forEach(k => { const a = k.b.getBoundingClientRect(); k.cx = a.left - g.left + a.width/2; k.cy = a.top - g.top + a.height/2; }); };
    new ResizeObserver(layout).observe(grid);
    const look = i => { if (i === focus) return; const t = now(); focus = i;
      tiles.forEach((k, j) => { if (i < 0){ k.r.set(0, S.lazy, t + .15); k.h.set(0, S.base); return; } if (j === i){ k.r.set(0, S.snap, t); k.h.set(1, S.base, t); return; }
        const d = Math.hypot(k.cx - tiles[i].cx, k.cy - tiles[i].cy)*.00014; k.r.set(1, S.soft, t + d); k.h.set(0, S.base, t); }); };
    const idxOf = e => { const b = e.target.closest && e.target.closest('.txg-fg-t'); return b ? tiles.findIndex(k => k.b === b) : -1; };
    grid.addEventListener('pointermove', e => { if (e.pointerType === 'touch' || pin >= 0) return; const i = idxOf(e); if (i >= 0) look(i); });
    grid.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch' && pin < 0) look(-1); });
    const setPin = i => { pin = i; tiles.forEach((k, j) => k.b.setAttribute('aria-pressed', j === i)); look(i); };
    tiles.forEach((k, i) => { k.b.onclick = () => setPin(pin === i ? -1 : i); k.b.onfocus = () => { if (pin < 0 && k.b.matches(':focus-visible')) look(i); }; k.b.onblur = () => { if (pin < 0) requestAnimationFrame(() => { if (!grid.contains(document.activeElement) && !grid.matches(':hover')) look(-1); }); }; });
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && pin >= 0){ e.preventDefault(); e.stopPropagation(); const k = tiles[pin].b; setPin(-1); look(-1); k.focus({ preventScroll:true }); } });
    return t => { L.pump(); tiles.forEach(k => { const r = clamp(k.r.at(t)), h = clamp(k.h.at(t));
      k.img.style.filter = r > .003 ? `grayscale(${(r*.9).toFixed(3)}) brightness(${(1 - .16*r).toFixed(3)})` : 'none'; k.b.style.transform = `scale(${(1 - .035*r).toFixed(4)})`; k.b.style.opacity = (1 - .1*r).toFixed(3);
      fade(k.cap, h, (1 - h)*6, true); }); };
  } });

/* ---------- 8. caption and metadata drawer ---------- */
document.head.insertAdjacentHTML('beforeend', `<style id="txg-dr">
.txg-dr-vw{position:relative;flex:1;min-height:0;border-radius:14px;overflow:hidden;background:#0C1016;touch-action:none;outline-offset:2px}
.txg-dr-pw{position:absolute;inset:0;pointer-events:none}
.txg-dr-ph{position:absolute;left:0;top:0;transform-origin:0 0;border-radius:6px;overflow:hidden;visibility:hidden}
.txg-dr-sub{position:absolute;border:1.5px dashed #EFF2F6;border-radius:50%;opacity:0;pointer-events:none}
.txg-dr-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:8px 10px 0 14px;z-index:2}
.txg-dr-top .r{display:flex;gap:6px}
.txg-dr-top .txg-ib{width:36px;height:36px}
.txg-dr-top .txg-ib[aria-checked=true]{background:#EFF2F6;color:#0C1016}
.txg-dr-dw{position:absolute;left:0;right:0;bottom:0;background:var(--card);color:var(--ink);border-radius:18px 18px 0 0;z-index:3;box-shadow:0 -6px 24px rgba(0,0,0,.28)}
.txg-dr-pk{height:60px;display:flex;align-items:center;gap:12px;padding:0 10px 0 16px;position:relative;touch-action:none;cursor:grab}
.txg-dr-pk:active{cursor:grabbing}
.txg-dr-pk .grab{position:absolute;left:50%;top:7px;width:36px;height:4px;margin-left:-18px;border-radius:2px;background:var(--line)}
.txg-dr-pk .tt{flex:1;min-width:0;padding-top:6px}
.txg-dr-pk b{display:block;font-size:14.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txg-dr-pk span.s{display:block;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txg-dr-pk .ib{width:36px;height:36px;border-radius:50%;border:1.5px solid var(--muted);background:var(--card);display:grid;place-items:center;padding:0;margin-top:6px}
.txg-dr-bd{padding:2px 16px 16px}
.txg-dr-bd .nt{font-size:14px;color:var(--ink);max-width:62ch;margin-bottom:12px}
.txg-dr-bd dl{display:grid;grid-template-columns:repeat(var(--dc,3),minmax(0,1fr));gap:10px 16px;margin:0}
.txg-dr-bd dt{font-size:11.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.txg-dr-bd dd{margin:1px 0 0;font-size:13.5px}
.txg-dr-bd dd.m{font-family:var(--mono);font-size:12.5px}
</style>`);
atom({ id:'gal-info-drawer', cat:'Galleries', name:'Caption and metadata drawer', block:'lightbox, caption, image details', fam:['M','D','E','S'], wide:true, tall:true,
  html:`<div class="txg txg-dr"><div class="txg-hd"><div><h4>Print review</h4><p>5 photographs, Oct 2025</p></div><span class="txg-hint">Pull the drawer up. The photo steps aside so its subject stays clear.</span></div>
<div class="txg-dr-vw txg-dk" tabindex="0" role="group" aria-label="Photo with details. I toggles the drawer, arrow keys change photo.">
<div class="txg-dr-pw"><div class="txg-dr-ph"><img alt=""><span class="txg-dr-sub"></span></div></div>
<div class="txg-dr-top"><span class="txg-lb-n"></span><div class="r"><button class="txg-ib" data-a="sub" role="switch" aria-checked="false" aria-label="Show subject area">${ic('<circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="1.5"/>', 16)}</button><button class="txg-ib" data-a="prev" aria-label="Previous photo">${ic(GI.prev, 16)}</button><button class="txg-ib" data-a="next" aria-label="Next photo">${ic(GI.next, 16)}</button></div></div>
<section class="txg-dr-dw" aria-label="Photo details"><div class="txg-dr-pk"><span class="grab"></span><div class="tt"><b></b><span class="s"></span></div><button class="ib" data-a="tog" aria-expanded="false" aria-controls="gal-dr-body" aria-label="Show photo details">${ic(GI.up, 16)}</button></div>
<div class="txg-dr-bd" id="gal-dr-body" inert><p class="nt"></p><dl></dl></div></section></div></div>`,
  desc:'The drawer is one number, how far it is open, and everything reads from it. The drawer rises on a soft spring (or follows your finger one to one on its handle, and release velocity picks open or closed); the photo, 50ms behind it, slides up and shrinks just enough that the marked subject ends 16px above the drawer’s top edge, and not a pixel more. Turn on the subject marker to see the area it protects. Detail rows then fade up one after another as the drawer passes each threshold. Changing photo is a Swap, and the new photo gets its own subject maths. Use when a lightbox needs captions and EXIF without covering what the picture is about.',
  api:'open ∈ [0,1]; photo.y = lerp(y₀, y₁, open), y₁ = min(y₀, H − D − 16 − subject.bottom·s); s = min(1, (H − D − 16 − top)/subject.bottom)',
  init(st){
    const root = $(st, '.txg-dr'), vw = $(root, '.txg-dr-vw'), pw = $(vw, '.txg-dr-pw'), ph = $(vw, '.txg-dr-ph'), img = $(ph, 'img'), sub = $(ph, '.txg-dr-sub'), cnt = $(vw, '.txg-lb-n'), top = $(vw, '.txg-dr-top');
    const dw = $(vw, '.txg-dr-dw'), pk = $(dw, '.txg-dr-pk'), bd = $(dw, '.txg-dr-bd'), dl = $(bd, 'dl'), nt = $(bd, '.nt'), tt = $(pk, '.tt'), tog = $(pk, '[data-a=tog]'), swS = $(vw, '[data-a=sub]');
    const items = [['portrait', 'p'], ['harbor', 'l'], ['ridge', 'l'], ['studio', 's'], ['city', 'l']], PEEK = 60, GAP = 16, TOP = 56, L = loader(), TL = timeline(), n = items.length;
    const PXD = { l:'6000 × 4000 px', p:'4000 × 6000 px', s:'5000 × 5000 px' };
    const Lt = new Track(0, S.soft), Lp = new Track(0, S.soft), Ts = new Track(0, S.base);
    let cur = 0, VW = 0, VH = 0, D = 300, held = false, hl = 0, openT = false, swT = -9, pose = null, rows = [];
    items.forEach(([nm, k]) => L.job(() => phUrl(nm, k)));
    const fill = i => { const [nm, k] = items[i], m = META[nm]; tt.firstChild.textContent = CAP[nm]; $(tt, '.s').textContent = `${m.place}, ${m.date}`; nt.textContent = m.note;
      dl.innerHTML = [['Camera', m.cam], ['Lens', m.lens], ['Exposure', m.exp, 1], ['Place', m.place], ['Date', m.date], ['Size', PXD[k], 1]].map(([a, b, mo]) => `<div><dt>${a}</dt><dd${mo ? ' class="m"' : ''}>${b}</dd></div>`).join('');
      rows = [nt, ...$$(dl, 'div')]; cnt.textContent = `${i + 1} / ${n}`; };
    const calc = () => { const [nm, k] = items[cur], a = ASP[k], avail = VH - TOP - PEEK, pad = 14, w = Math.min(VW - 2*pad, avail*a), h = w/a, yN = TOP + (avail - h)/2, [sx, sy, sr] = META[nm].sub, ub = (sy + sr)*h;
      const s1 = clamp((VH - D - GAP - TOP)/ub, .4, 1), y1 = Math.min(yN, VH - D - GAP - ub*s1); pose = { w, h, yN, y1, s1, sx, sy, sr }; ph.style.width = w + 'px'; ph.style.height = h + 'px';
      Object.assign(sub.style, { left:((sx - sr*h/w)*100) + '%', top:((sy - sr)*100) + '%', width:(2*sr*h/w*100) + '%', height:(2*sr*100) + '%' }); };
    const show = i => { cur = i; const [nm, k] = items[i]; img.src = phUrl(nm, k); fill(i); calc(); };
    const layout = () => { VW = vw.clientWidth; VH = vw.clientHeight; const b = bp(VW); dl.style.setProperty('--dc', b ? 3 : 2); const keep = cur; let mx = 0; for (let i = 0; i < n; i++){ fill(i); mx = Math.max(mx, dw.offsetHeight); } fill(keep); D = Math.min(mx, VH - 130); dw.style.height = mx + 'px'; calc(); };
    new ResizeObserver(layout).observe(vw);
    const setOpen = (v, via) => { if (v === openT) return; const t = now(); openT = v; Lt.set(v ? 1 : 0, S.soft, t); Lp.set(v ? 1 : 0, S.soft, t + .05); tog.setAttribute('aria-expanded', v); tog.setAttribute('aria-label', v ? 'Hide photo details' : 'Show photo details'); bd.inert = !v; };
    tog.onclick = () => setOpen(!openT);
    // handle: the drawer follows the finger, release velocity decides
    let d0 = null; const sm = [];
    pk.addEventListener('pointerdown', e => { if (e.button || e.target.closest('button')) return; d0 = { y:e.clientY, l:clamp(Lt.at(now())), moved:false }; held = true; hl = d0.l; sm.length = 0; sm.push({ t:now(), y:e.clientY }); pk.setPointerCapture(e.pointerId); });
    pk.addEventListener('pointermove', e => { if (!d0) return; const dy = e.clientY - d0.y; if (Math.abs(dy) > 5) d0.moved = true; hl = clamp(d0.l - dy/Math.max(1, D - PEEK)); sm.push({ t:now(), y:e.clientY }); if (sm.length > 6) sm.shift(); });
    const up = e => { if (!d0) return; const d = d0; d0 = null; held = false; const t = now();
      if (!d.moved){ Lt.jump(hl); Lp.jump(hl); setOpen(!openT); return; }
      const a = sm[0], z = sm[sm.length - 1], v = -((z.y - a.y)/Math.max(1e-3, z.t - a.t))/Math.max(1, D - PEEK), to = hl + v*.2 > .5 ? 1 : 0;
      openT = !to; setOpen(!!to); Lt.release(hl, v, to, S.soft, t); Lp.release(hl, v, to, S.soft, t); };
    pk.addEventListener('pointerup', up); pk.addEventListener('pointercancel', up);
    const step = d => { const t = now(), ni = (cur + d + n) % n; swT = t; TL.at(t + EXIT, () => show(ni)); };
    $(vw, '[data-a=prev]').onclick = () => step(-1); $(vw, '[data-a=next]').onclick = () => step(1);
    swS.onclick = () => { const v = swS.getAttribute('aria-checked') !== 'true'; swS.setAttribute('aria-checked', v); Ts.set(v ? 1 : 0); };
    vw.addEventListener('keydown', e => { if (e.target.closest('button') && e.key !== 'Escape' && e.key !== 'i') return; if (e.key === 'i' || e.key === 'I'){ e.preventDefault(); setOpen(!openT); } else if (e.key === 'Escape' && openT){ e.preventDefault(); e.stopPropagation(); setOpen(false); tog.focus({ preventScroll:true }); }
      else if (e.key === 'ArrowRight'){ e.preventDefault(); step(1); } else if (e.key === 'ArrowLeft'){ e.preventDefault(); step(-1); } });
    show(0); bd.inert = true;
    return t => {
      L.pump(); TL.run(t); const l = held ? hl : clamp(Lt.at(t)), lp = held ? hl : clamp(Lp.at(t)), so = swapO(t, swT);
      if (pose){ const s = lerp(1, pose.s1, lp), y = lerp(pose.yN, pose.y1, lp); ph.style.transform = `translate(${((VW - pose.w*s)/2).toFixed(2)}px,${y.toFixed(2)}px) scale(${s.toFixed(4)})`; ph.style.visibility = 'visible'; }
      pw.style.opacity = so.toFixed(3); sub.style.opacity = (clamp(Ts.at(t))*.95).toFixed(3);
      dw.style.transform = `translateY(${(dw.offsetHeight - (PEEK + (D - PEEK)*l)).toFixed(2)}px)`;
      rows.forEach((r, k) => { const o = clamp((l - .22 - k*.07)/.3)*so; fade(r, o, (1 - o)*8, true); }); tt.style.opacity = so.toFixed(3); cnt.style.opacity = so.toFixed(3);
    };
  } });

/* ---------- 10. cull deck, an original idea ---------- */
document.head.insertAdjacentHTML('beforeend', `<style id="txg-cd">
.txg-cd-deck{flex:1;min-height:0;position:relative;outline-offset:-2px;border-radius:12px;touch-action:none}
.txg-cd-cards{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.txg-cd-c{position:absolute;left:0;top:0;width:0;height:0;filter:drop-shadow(0 6px 12px rgba(16,20,26,.22))}
.txg-cd-c .txg-ph{left:0;top:0}
.txg-cd-cap{flex:none;text-align:center;font-size:13.5px;min-height:20px;color:var(--ink);font-weight:500}
.txg-cd-tray{flex:none;display:flex;gap:6px;justify-content:center;align-items:center;height:44px}
.txg-cd-s{flex:none;border:1.5px dashed var(--line);border-radius:7px;background:none}
.txg-cd-bar{flex:none;display:flex;gap:10px;justify-content:center;align-items:center}
.txg-cd-bar .btn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;font-size:14px}
.txg-cd-bar .btn[disabled]{opacity:.45;cursor:default}
.txg-cd-sum{position:absolute;left:50%;top:50%;width:min(300px,86%);margin:-70px 0 0 -150px;text-align:center;visibility:hidden;z-index:10;background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:18px 16px}
.txg-cd-sum b{display:block;font-size:16px;margin-bottom:4px}
.txg-cd-sum p{color:var(--muted);font-size:13.5px;margin-bottom:12px}
</style>`);
atom({ id:'gal-cull-deck', cat:'Galleries', name:'Cull deck: keep or reject by throwing', block:'photo review, selects, gallery', fam:['D','M','X'], wide:true, tall:true,
  html:`<div class="txg txg-cd"><div class="txg-hd"><div><h4>Cull deck</h4><p class="txg-cd-st"></p></div><span class="txg-hint">Throw a photo right to keep it, left to reject it. Arrow keys work too.</span></div>
<div class="txg-cd-deck" tabindex="0" role="group" aria-label="Review deck. Right arrow keeps the top photo, left arrow rejects it, Z undoes.">
<div class="txg-cd-sum"><b>Roll reviewed</b><p></p><button class="btn ink" data-a="again">Review again</button></div></div>
<div class="txg-cd-cap" aria-hidden="true"></div><div class="txg-cd-tray" role="img" aria-label="Kept photos"></div>
<div class="txg-cd-bar"><button class="btn" data-a="rej">${ic(GI.cross, 16)}Reject</button><button class="btn" data-a="undo" disabled>${ic(GI.undo, 16)}Undo</button><button class="btn ink" data-a="keep">${ic(I.check, 16)}Keep</button></div><span class="txg-sr" role="status"></span><div class="txg-cd-cards"></div></div>`,
  desc:'The top photo follows the pointer one to one and tilts with how far it has travelled, while the photo beneath it rises and grows by exactly the same amount, so the deck advances as you pull rather than after you let go. Let go and the throw is judged by where it was heading: distance plus a fifth of a second of velocity. A keep carries your speed into a flight that shrinks and re-crops the photo into the next empty slot of the tray. A reject leaves on the other side and fades. Undo returns the last photo along its own path, and the tray slot empties. Keys do the same with no velocity. Use when a shoot has to be sorted quickly and every decision should leave a visible trace.',
  api:'pos = index + clamp(|dx|/.55w); card(i).depth = max(0, i − pos); release: |dx + vx·.2| > .38w ? fly(tray slot | off-edge, vx) : return(0, vx)',
  init(st){
    const root = $(st, '.txg-cd'), deck = $(root, '.txg-cd-deck'), lay = $(root, '.txg-cd-cards'), sum = $(deck, '.txg-cd-sum'), tray = $(root, '.txg-cd-tray'), stEl = $(root, '.txg-cd-st'), capEl = $(root, '.txg-cd-cap'), sr = $(root, '.txg-sr');
    const bKeep = $(root, '[data-a=keep]'), bRej = $(root, '[data-a=rej]'), bUndo = $(root, '[data-a=undo]'), bAgain = $(sum, '[data-a=again]');
    const NM = ['ridge', 'lake', 'canyon', 'harbor', 'meadow', 'studio', 'portrait', 'forest', 'dunes', 'coast', 'city', 'field'], N = NM.length, L = loader(), TL = timeline();
    const slots = NM.map(() => { const d = document.createElement('span'); d.className = 'txg-cd-s'; tray.appendChild(d); return d; });
    const cards = NM.map((nm, i) => { const w = document.createElement('div'); w.className = 'txg-cd-c'; w.innerHTML = '<div class="txg-ph"><img alt="" draggable="false"></div>'; lay.appendChild(w); L.add($(w, 'img'), nm, 'p');
      return { w, ph:$(w, '.txg-ph'), mode:'deck', dir:'', X:new Track(0, FLY), Y:new Track(0, FLY), Wd:new Track(1, FLY), Ht:new Track(1, FLY), Rt:new Track(0, S.soft), Rr:new Track(14, S.soft), O:new Track(1, S.base) }; });
    const pos = new Track(0, S.base), Fx = new Track(0, S.soft), Fy = new Track(0, S.soft), Tall = new Track(1, S.base), Sm = new Track(0, S.base);
    let index = 0, cw = 240, ch = 300, cx = 0, cy = 0, W = 0, H = 0, kept = 0, rejected = 0, capT = -9, held = false, g0 = null, undoing = -1; const done = [], sm = [];
    const deckRect = (i, t) => { const p = pos.at(t), d = Math.max(0, i - p), m = Math.min(d, 3), s = 1 - .06*m; let x = cx, y = cy + 16*m, rot = (i % 2 ? 1 : -1)*1.4*m;
      if (i === index){ const fx = held ? g0.fx : Fx.at(t), fy = held ? g0.fy : Fy.at(t); x += fx; y += fy; rot += fx*.045; } return { x, y, w:cw*s, h:ch*s, rot, o:clamp(4 - d)*(d > 0 || i === index ? 1 : 1) }; };
    const setCap = () => { capT = now(); TL.at(capT + EXIT, () => { capEl.textContent = index < N ? CAP[NM[index]] : ''; }); };
    const status = () => { const left = N - index; stEl.textContent = `${left} to review, ${kept} kept, ${rejected} rejected`; bUndo.disabled = !done.length; bKeep.disabled = bRej.disabled = left <= 0; };
    const layout = () => { W = deck.clientWidth; H = deck.clientHeight; const r = relTo(st, deck); cw = clamp(Math.min(W*.74, (H - 40)/1.25), 120, 330); ch = cw*1.25; cx = r.x + W/2; cy = r.y + H/2 - 10;
      const sl = clamp((tray.clientWidth - 28 - 6*(N - 1))/N, 18, 40); slots.forEach(s => { s.style.width = s.style.height = sl + 'px'; }); cards.forEach(c => { c.ph.style.width = cw + 'px'; c.ph.style.height = ch + 'px'; }); };
    new ResizeObserver(layout).observe(root);
    function decide(dir, vx, vy){
      if (index >= N || undoing >= 0) return; const t = now(), i = index, c = cards[i], E = deckRect(i, t); c.mode = 'free'; c.dir = dir;
      c.X.jump(E.x); c.Y.jump(E.y); c.Wd.jump(E.w); c.Ht.jump(E.h); c.Rt.jump(E.rot); c.Rr.jump(14); c.O.jump(1); Fx.jump(0); Fy.jump(0); held = false;
      if (dir === 'keep'){ const R = relTo(st, slots[kept]); c.X.release(E.x, vx || 0, R.x + R.w/2, FLY, t); c.Y.release(E.y, vy || 0, R.y + R.h/2, FLY, t); c.Wd.release(E.w, 0, R.w, FLY, t); c.Ht.release(E.h, 0, R.h, FLY, t); c.Rt.release(E.rot, 0, 0, S.soft, t); c.Rr.release(14, 0, 6, S.soft, t); kept++; }
      else { c.X.release(E.x, Math.min(vx || 0, -900), -cw*1.2, S.soft, t); c.Y.release(E.y, vy || 0, E.y + 40, S.soft, t); c.Rt.release(E.rot, 0, -22, S.soft, t); c.O.set(0, S.soft, t + .1); rejected++; }
      pos.release(pos.at(t), 0, i + 1, S.base, t); index = i + 1; done.push({ i, dir }); setCap(); status(); sr.textContent = `${CAP[NM[i]]}, ${dir === 'keep' ? 'kept' : 'rejected'}. ${index < N ? 'Next: ' + CAP[NM[index]] : 'All photos reviewed.'}`;
      if (index >= N){ Sm.set(1, S.base, t + .35); sum.querySelector('p').textContent = `${kept} kept and ${rejected} rejected.`; }
    }
    function undo(){
      if (!done.length || undoing >= 0) return; const t = now(), { i, dir } = done.pop(), c = cards[i]; if (dir === 'keep') kept--; else rejected--; index = i; undoing = i; Sm.set(0, S.snap, t);
      c.X.set(cx, FLY, t); c.Y.set(cy, FLY, t); c.Wd.set(cw, FLY, t); c.Ht.set(ch, FLY, t); c.Rt.set(0, S.soft, t); c.Rr.set(14, S.soft, t); c.O.set(1, S.base, t); pos.set(i, S.base, t); setCap(); status(); sr.textContent = `Undone. ${CAP[NM[i]]} is back on top.`;
    }
    function again(){ const t = now(); done.length = 0; kept = rejected = index = 0; undoing = -1; pos.jump(0); Fx.jump(0); Fy.jump(0); Sm.set(0, S.snap, t); cards.forEach(c => { c.mode = 'deck'; c.O.jump(1); }); Tall.jump(0); Tall.set(1, S.soft, t); setCap(); status(); sr.textContent = 'Deck reset.'; }
    bKeep.onclick = () => decide('keep'); bRej.onclick = () => decide('reject'); bUndo.onclick = undo; bAgain.onclick = again;
    deck.addEventListener('keydown', e => { if (e.key === 'ArrowRight'){ e.preventDefault(); decide('keep'); } else if (e.key === 'ArrowLeft'){ e.preventDefault(); decide('reject'); } else if (e.key === 'z' || e.key === 'Backspace'){ e.preventDefault(); undo(); } });
    deck.addEventListener('pointerdown', e => { if (e.button || index >= N || undoing >= 0 || e.target.closest('button')) return; const t = now(); g0 = { x:e.clientX, y:e.clientY, fx:Fx.at(t), fy:Fy.at(t), bx:Fx.at(t), by:Fy.at(t) }; held = true; sm.length = 0; sm.push({ t, x:e.clientX, y:e.clientY }); deck.setPointerCapture(e.pointerId); });
    deck.addEventListener('pointermove', e => { if (!held) return; const dx = e.clientX - g0.x + g0.bx, dy = (e.clientY - g0.y)*.6 + g0.by; g0.fx = dx; g0.fy = dy; sm.push({ t:now(), x:e.clientX, y:e.clientY }); if (sm.length > 6) sm.shift(); pos.jump(index + clamp(Math.abs(dx)/(cw*.55))); });
    const up = e => { if (!held) return; const t = now(), a = sm[0], z = sm[sm.length - 1], dt = Math.max(1e-3, z.t - a.t), vx = (z.x - a.x)/dt, vy = (z.y - a.y)/dt, fx = g0.fx, fy = g0.fy; held = false;
      if (e.type === 'pointerup' && Math.abs(fx + vx*.2) > cw*.38) decide(fx + vx*.2 > 0 ? 'keep' : 'reject', vx, vy);
      else { Fx.release(fx, vx, 0, S.soft, t); Fy.release(fy, vy*.6, 0, S.soft, t); pos.release(pos.at(t), 0, index, S.soft, t); } };
    deck.addEventListener('pointerup', up); deck.addEventListener('pointercancel', up);
    setCap(); TL.run(now() + 1); capEl.textContent = CAP[NM[0]]; status();
    return t => {
      L.pump(); TL.run(t); const tl = clamp(Tall.at(t));
      cards.forEach((c, i) => { let x, y, w, h, rot, o, r = 14, z;
        if (c.mode === 'deck'){ const E = deckRect(i, t); ({ x, y, w, h, rot, o } = E); z = 20 - Math.round(Math.max(0, i - pos.at(t))); o *= tl; }
        else { x = c.X.at(t); y = c.Y.at(t); w = c.Wd.at(t); h = c.Ht.at(t); rot = c.Rt.at(t); o = clamp(c.O.at(t)); r = c.Rr.at(t); z = c.dir === 'keep' && undoing !== i ? 12 : 40;
          if (undoing === i && c.X.prune(t) + c.Y.prune(t) + c.Wd.prune(t) + c.Rr.prune(t) === 0){ c.mode = 'deck'; undoing = -1; c.X.jump(0); } }
        if (o < .004 || c.mode === 'deck' && i < index){ c.w.style.opacity = 0; c.w.style.visibility = c.ph.style.visibility = 'hidden'; return; } c.w.style.visibility = 'visible'; c.w.style.opacity = o.toFixed(3); c.w.style.zIndex = z;
        c.w.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`; cover(c.ph, cw, ch, -w/2, -h/2, w, h, r); });
      const so = clamp(Sm.at(t)); if (so > .01){ pop(sum, so, 6); sum.style.zIndex = 60; } else sum.style.visibility = 'hidden';
      fade(capEl, swapO(t, capT), 0, true);
    };
  } });

})();
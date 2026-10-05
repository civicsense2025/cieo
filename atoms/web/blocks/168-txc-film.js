

/* ================================================================ carousels lane (tx-carousels) */
(() => {
/* ---------- shared: styles, photos, rail physics, gestures ---------- */
const PK = globalThis.PhotoKit, CAP = PK ? PK.CAPTIONS : {};
const DPR = Math.min(2, globalThis.devicePixelRatio || 1);
const SET = S.soft;
const CSS = `
.txc-root{position:absolute;inset:0;--p:24px;color:var(--ink)}
.txc-hd{position:absolute;left:var(--p);right:var(--p);top:16px;display:flex;justify-content:space-between;align-items:flex-end;gap:12px;min-width:0}
.txc-hd>div{min-width:0}
.txc-hd>span,.txc-hd>.txc-ms-sel{flex:none;white-space:nowrap}
.txc-narrow .txc-wide{display:none!important}
.txc-t{font-weight:600;font-size:15px;letter-spacing:-.01em;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txc-m{font-size:13px;color:var(--muted);line-height:1.4}
.txc-n{font-variant-numeric:tabular-nums}
.txc-ft{position:absolute;left:var(--p);right:var(--p);bottom:16px;display:flex;align-items:center;gap:8px}
.txc-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}
.txc-vp{position:absolute;overflow:hidden;touch-action:pan-y pinch-zoom;cursor:grab;-webkit-tap-highlight-color:transparent}
.txc-vp:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.txc-held,.txc-held *{cursor:grabbing!important}
.txc-tr{position:absolute;left:0;top:0;width:100%;height:100%}
.txc-ph{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none}
.txc-fr{position:relative;overflow:hidden;border-radius:12px;background:var(--raised)}
.txc-nb{flex:none;width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink);display:grid;place-items:center;cursor:pointer;padding:0}
.txc-nb[aria-disabled="true"]{opacity:.38;cursor:default}
.txc-nb.txc-l svg{transform:rotate(90deg)}.txc-nb.txc-r svg{transform:rotate(-90deg)}.txc-nb.txc-u svg{transform:rotate(180deg)}
.txc-dots{position:relative;display:flex;gap:10px;flex:none}
.txc-dots>b{width:8px;height:8px;border-radius:4px;background:var(--line)}
.txc-dots>i{position:absolute;left:0;top:0;width:8px;height:8px;border-radius:4px;background:var(--ink)}
.txc-chip{padding:3px 9px;border-radius:999px;background:rgba(12,16,22,.55);color:#fff;font-size:12px;font-weight:500;white-space:nowrap}
/* 1 filmstrip */
.txc-fs-vp{left:0;right:0}
.txc-fs-sl{position:absolute;top:0;margin:0;display:flex;flex-direction:column;gap:8px}
.txc-fs-sl figcaption{display:flex;justify-content:space-between;gap:8px;font-size:13px;color:var(--muted);white-space:nowrap;min-width:0}
.txc-fs-sl figcaption b{font-weight:500;color:var(--ink);overflow:hidden;text-overflow:ellipsis}
.txc-fs-sb{position:relative;flex:1;height:4px;border-radius:2px;background:var(--line-soft);margin-right:8px;cursor:pointer;touch-action:none}
.txc-fs-sb::before{content:"";position:absolute;left:0;right:0;top:-14px;bottom:-14px}
.txc-fs-th{position:absolute;left:0;top:0;height:100%;border-radius:2px;background:var(--ink)}
/* 2 parallax */
.txc-pa-vp{left:0;right:0}
.txc-pa-sl{position:absolute;top:0}
.txc-pa-im{position:absolute;top:0;left:-25%;width:150%!important}
.txc-pa-cap{display:flex;flex-direction:column;gap:2px;padding-top:12px;white-space:nowrap}
.txc-pa-cap b{font-size:19px;font-weight:600;letter-spacing:-.02em}
/* 3 center focus */
.txc-cf-vp{left:0;right:0}
.txc-cf-sl{position:absolute;left:0;top:0;transform-origin:50% 50%}
.txc-cf-sl .txc-fr{width:100%;height:100%;border-radius:10px}
.txc-cf-cp{position:absolute;left:0;right:0;text-align:center;display:flex;flex-direction:column;gap:2px;pointer-events:none}
.txc-cf-cp b{font-size:15px;font-weight:600}
.txc-cf-ft{justify-content:center}
.txc-cf-ft .txc-m{min-width:84px;text-align:center}
/* 4 deck */
.txc-dk-deck{position:absolute;left:0;right:0;outline:none}
.txc-dk-deck:focus-visible{outline:2px solid var(--accent);outline-offset:-2px;border-radius:14px}
.txc-dk-c{position:absolute;left:0;top:0;background:var(--card);border-radius:16px;box-shadow:var(--shadow);border:1px solid var(--line-soft);padding:8px;display:flex;flex-direction:column;gap:8px;cursor:grab;touch-action:none;transform-origin:50% 60%}
.txc-dk-c .txc-fr{flex:1;border-radius:10px}
.txc-dk-cf{display:flex;justify-content:space-between;gap:8px;padding:0 4px 2px;font-size:14px;white-space:nowrap}
.txc-dk-cf b{font-weight:600;overflow:hidden;text-overflow:ellipsis}
.txc-dk-s{position:absolute;top:20px;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:600;border:1.5px solid;pointer-events:none;opacity:0}
.txc-dk-k{left:20px;color:var(--success);background:var(--success-tint)}
.txc-dk-x{right:20px;color:var(--danger);background:var(--danger-tint)}
.txc-dk-b{justify-content:center;gap:12px}
.txc-dk-b button{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px;border-radius:20px;border:1px solid var(--line);background:var(--card);font-size:14px;font-weight:500;cursor:pointer}
.txc-dk-b button[aria-disabled="true"]{opacity:.38;cursor:default}
.txc-dk-b .txc-dk-kb{background:var(--ink);color:var(--card);border-color:var(--ink)}
.txc-dk-done{position:absolute;left:0;right:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;visibility:hidden}
.txc-dk-done b{font-size:19px;letter-spacing:-.02em}
/* 5 stories */
.txc-sy-fr{position:absolute;overflow:hidden;border-radius:18px;background:#0C1016;color:#fff;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent}
.txc-sy-fr:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.txc-sy-ph>div{position:absolute;inset:0;overflow:hidden}
.txc-sy-ph img{will-change:transform}
.txc-sy-top{position:absolute;left:0;right:0;top:0;padding:10px 10px 8px;background:rgba(12,16,22,.34)}
.txc-sy-bars{display:flex;gap:4px}
.txc-sy-bars>span{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.35);overflow:hidden}
.txc-sy-bars>span>i{display:block;height:100%;background:#fff;transform-origin:0 50%;transform:scaleX(0)}
.txc-sy-who{display:flex;align-items:center;gap:8px;margin-top:9px;font-size:13px}
.txc-sy-av{width:28px;height:28px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.2);flex:none}
.txc-sy-who span{opacity:.75}
.txc-sy-pp{margin-left:auto;width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
.txc-sy-pp:focus-visible{outline:2px solid #fff;outline-offset:2px}
.txc-sy-caps>div{position:absolute;left:10px;right:10px;bottom:10px;padding:10px 12px;border-radius:12px;background:rgba(12,16,22,.55);display:flex;flex-direction:column;gap:2px}
.txc-sy-caps span{font-size:12px;opacity:.75}
.txc-sy-caps b{font-size:16px;font-weight:600;letter-spacing:-.01em;line-height:1.3}
.txc-sy-hint{position:absolute;left:0;right:0;text-align:center;font-size:12px;color:var(--faint)}
/* 6 synced thumbs */
.txc-sn-fr{position:absolute;overflow:hidden;border-radius:14px;background:var(--raised)}
.txc-sn-vp{inset:0}
.txc-sn-sl{position:absolute;left:0;top:0;height:100%;overflow:hidden}
.txc-sn-cap{position:absolute;display:flex;justify-content:space-between;gap:12px;font-size:13px;white-space:nowrap}
.txc-sn-cap b{font-weight:500;overflow:hidden;text-overflow:ellipsis}
.txc-sn-rail{position:absolute;overflow:hidden;touch-action:pan-y pinch-zoom;padding:0}
.txc-sn-tt{position:absolute;left:0;top:0;height:100%}
.txc-sn-tb{position:absolute;top:4px;border:0;padding:0;border-radius:8px;overflow:hidden;background:var(--raised);cursor:pointer}
.txc-sn-tb:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.txc-sn-pl{position:absolute;top:0;left:0;border:2px solid var(--ink);border-radius:11px;pointer-events:none}
/* 7 loop */
.txc-lp-vp{left:0;right:0}
.txc-lp-sl{position:absolute;left:0;top:0;display:flex;flex-direction:column;gap:10px}
.txc-lp-sl figcaption{display:flex;justify-content:space-between;gap:8px;font-size:13px;color:var(--muted);white-space:nowrap}
.txc-lp-sl figcaption b{color:var(--ink);font-weight:500;overflow:hidden;text-overflow:ellipsis}
.txc-lp-sl figure{margin:0}
.txc-lp-dots{overflow:hidden}
.txc-lp-pp{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--line);background:var(--card);font-size:13px;font-weight:500;cursor:pointer}
/* 8 peek */
.txc-pk-ph{position:absolute;overflow:hidden;border-radius:28px;border:1px solid var(--line);background:var(--bg)}
.txc-pk-bar{position:absolute;left:16px;right:16px;top:18px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.txc-pk-h{font-size:19px;font-weight:600;letter-spacing:-.02em}
.txc-pk-all{border:0;background:none;color:var(--accent);font-size:14px;font-weight:600;cursor:pointer;padding:4px 0}
.txc-pk-vp{left:0;right:0}
.txc-pk-c{position:absolute;top:0;display:flex;flex-direction:column;gap:8px}
.txc-pk-c b{font-size:15px;font-weight:600;letter-spacing:-.01em}
.txc-pk-c .txc-m{margin-top:-6px}
.txc-pk-pull{position:absolute;left:0;top:0;width:72px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;pointer-events:none;opacity:0}
.txc-pk-pull svg{flex:none}
.txc-pk-lbl{position:relative;height:18px;width:100%}
.txc-pk-lbl span{position:absolute;left:0;right:0;top:0;font-size:12px;font-weight:500;color:var(--muted);white-space:nowrap}
.txc-pk-sec{position:absolute;left:16px;right:16px}
.txc-pk-sec h4{margin:0 0 8px;font-size:15px;font-weight:600}
.txc-pk-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line-soft)}
.txc-pk-row i{width:36px;height:36px;border-radius:9px;background:var(--raised);flex:none;display:grid;place-items:center;color:var(--muted)}
.txc-pk-row b{display:block;font-size:14px;font-weight:500}
.txc-pk-scrim{position:absolute;inset:0;background:#0C1016;opacity:0;visibility:hidden}
.txc-pk-sh{position:absolute;left:0;right:0;bottom:0;background:var(--card);border-radius:20px 20px 0 0;display:flex;flex-direction:column;visibility:hidden}
.txc-pk-sh header{display:flex;justify-content:space-between;align-items:center;padding:16px 16px 8px}
.txc-pk-sh header b{font-size:16px}
.txc-pk-ls{overflow:auto;padding:0 16px 16px;margin:0;list-style:none;flex:1;overscroll-behavior:contain}
.txc-pk-ls li{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--line-soft);font-size:14px}
/* 9 compare */
.txc-cm-bar{position:absolute;left:var(--p);right:var(--p);top:14px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.txc-cm-seg{position:relative;display:flex;background:var(--raised);border-radius:10px;padding:3px;min-width:0}
.txc-cm-seg button{position:relative;border:0;background:none;border-radius:7px;padding:5px 11px;font-size:13px;font-weight:500;cursor:pointer;color:var(--muted)}
.txc-cm-seg button[aria-pressed="true"]{color:var(--ink)}
.txc-cm-ind{position:absolute;left:0;top:3px;bottom:3px;background:var(--card);border-radius:7px;box-shadow:var(--shadow)}
.txc-cm-mag{display:inline-flex;align-items:center;gap:6px;flex:none;border:1px solid var(--line);background:var(--card);border-radius:9px;height:34px;padding:0 10px;font-size:13px;font-weight:500;cursor:pointer}
.txc-cm-mag[aria-pressed="true"]{background:var(--ink);color:var(--card);border-color:var(--ink)}
.txc-cm-wrap{position:absolute}
.txc-cm-fr{position:absolute;inset:0;overflow:hidden;border-radius:14px;background:var(--raised);touch-action:pan-y pinch-zoom;cursor:ew-resize}
.txc-cm-a,.txc-cm-b{position:absolute;inset:0}
.txc-cm-a>div,.txc-cm-b>div,.txc-cm-za>div,.txc-cm-zb>div{position:absolute;inset:0}
.txc-cm-za,.txc-cm-zb{position:absolute;left:0;top:0;transform-origin:0 0}
.txc-cm-lb{position:absolute;top:12px;pointer-events:none}
.txc-cm-l{left:12px}.txc-cm-r{right:12px}
.txc-cm-ln{position:absolute;top:0;bottom:0;left:-1px;width:2px;background:#fff;box-shadow:0 0 0 1px rgba(12,16,22,.16);pointer-events:none}
.txc-cm-k{position:absolute;left:0;top:0;border-radius:50%;background:#fff;color:#0C1016;box-shadow:0 0 0 1px rgba(12,16,22,.14),var(--shadow);cursor:grab;touch-action:none;display:grid;place-items:center}
.txc-cm-k:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.txc-cm-lens{position:absolute;left:2px;top:2px;right:2px;bottom:2px;border-radius:50%;overflow:hidden;background:var(--raised)}
.txc-cm-zl{position:absolute;top:0;bottom:0;left:0;width:2px;background:#fff}
.txc-cm-gr{position:relative;display:grid;place-items:center}
.txc-cm-cap{position:absolute;left:var(--p);right:var(--p);margin:0;display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 12px;font-size:13px;white-space:nowrap}
.txc-narrow .txc-cm-seg button{padding:5px 8px}
.txc-cm-cap b{font-weight:500;overflow:hidden;text-overflow:ellipsis}
/* 10 reel */
.txc-rl-col{position:absolute;overflow:hidden;border-radius:18px;background:#0C1016;color:#fff;touch-action:none;cursor:grab}
.txc-rl-col:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.txc-rl-it{position:absolute;left:0;top:0;width:100%;overflow:hidden}
.txc-rl-ov{position:absolute;left:10px;right:58px;bottom:12px;padding:10px 12px;border-radius:12px;background:rgba(12,16,22,.55);display:flex;flex-direction:column;gap:2px}
.txc-rl-ov b{font-size:15px;font-weight:600;line-height:1.3}
.txc-rl-ov span{font-size:12px;opacity:.75}
.txc-rl-act{position:absolute;right:10px;bottom:14px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px}
.txc-rl-act button{width:40px;height:40px;border-radius:50%;border:0;background:rgba(12,16,22,.5);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
.txc-rl-act button[aria-pressed="true"]{background:#fff;color:#0C1016}
.txc-rl-act button:focus-visible{outline:2px solid #fff;outline-offset:2px}
.txc-rl-more{position:absolute;left:0;right:0;top:0;height:60px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:13px;color:rgba(255,255,255,.85);pointer-events:none;opacity:0}
.txc-rl-lbl{position:relative;height:18px;width:188px;white-space:nowrap}
.txc-rl-lbl span{position:absolute;left:0;right:0;top:0}
.txc-rl-nav{position:absolute;display:flex;flex-direction:column;gap:8px}
.txc-rl-nav.txc-in .txc-nb{background:rgba(12,16,22,.5);color:#fff;border-color:transparent}
/* 11 masonry */
.txc-ms-vp{left:0;right:0}
.txc-ms-it{position:absolute;left:0;top:0;padding:0;border:0;background:var(--accent-tint);border-radius:10px;overflow:hidden;cursor:pointer;color:#fff}
.txc-ms-it:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.txc-ms-in{position:absolute;inset:0;overflow:hidden;border-radius:10px;background:var(--raised)}
.txc-ms-ck{position:absolute;left:8px;top:8px;width:22px;height:22px;border-radius:50%;border:2px solid #fff;background:rgba(12,16,22,.25);display:grid;place-items:center;opacity:0}
.txc-ms-ck svg{opacity:0}
.txc-ms-cp{position:absolute;left:8px;bottom:8px;max-width:calc(100% - 16px);overflow:hidden;text-overflow:ellipsis;opacity:0}
.txc-ms-sel{display:flex;align-items:center;gap:8px}
.txc-ms-clr{border:1px solid var(--line);background:var(--card);border-radius:8px;padding:3px 9px;font-size:12.5px;cursor:pointer}
/* 12 route */
.txc-rt-map{position:absolute;border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden;touch-action:none;cursor:pointer}
.txc-rt-map:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.txc-rt-map svg{position:absolute;inset:0;width:100%;height:100%}
.txc-rt-ro{position:absolute;left:14px;top:12px;pointer-events:none;display:flex;flex-direction:column}
.txc-rt-ro b{font-size:20px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.2}
.txc-rt-vp{right:0}
.txc-rt-sl{position:absolute;top:0;display:flex;flex-direction:column;gap:6px}
.txc-rt-sl b{font-size:17px;font-weight:600;letter-spacing:-.01em;margin-top:6px}
.txc-rt-sl p{margin:0;font-size:13.5px;color:var(--muted);line-height:1.45;white-space:normal}
`;
const sty = document.createElement('style'); sty.textContent = CSS; document.head.appendChild(sty);

const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
// write a style property only when it changes (render stays cheap when settled)
const put = (el, k, v) => { const c = el._txc || (el._txc = {}); if (c[k] !== v){ c[k] = v; el.style[k] = v; } };
const tx = (x, y = 0, s) => `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)` + (s === undefined ? '' : ` scale(${s.toFixed(4)})`);
const ss = (a, b, x) => { const u = clamp((x - a)/(b - a)); return u*u*(3 - 2*u); };
const say = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
const dis = (b, v) => b && b.setAttribute('aria-disabled', v ? 'true' : 'false');
const hide = (el, h) => { if (el._h === h) return; el._h = h; h ? el.setAttribute('aria-hidden', 'true') : el.removeAttribute('aria-hidden'); };
const slide = (el, i, n, c) => { el.setAttribute('role', 'group'); el.setAttribute('aria-roledescription', 'slide'); el.setAttribute('aria-label', `${i + 1} of ${n}: ${c}`); return el; };
const nb = (d, l) => `<button type="button" class="txc-nb txc-${d}" aria-label="${l}">${ic(I.chev, 18)}</button>`;
const onSize = (st, fn) => { let w = -1, h = -1; const go = () => { const a = st.clientWidth, b = st.clientHeight; if (!a || (a === w && b === h)) return; w = a; h = b; fn(a, b); }; new ResizeObserver(go).observe(st); go(); };
// velocity that cannot overshoot a critically damped settle: toward the target at most w·distance
const capv = (x0, v, to, w = SET.w, away = 700) => { const d = to - x0, a = Math.abs(v); return d*v > 0 ? Math.sign(v)*Math.min(a, w*Math.abs(d)*.92) : Math.sign(v)*Math.min(a, away); };
// two-edge plate from a float index: leading edge reaches the next slot first, trailing edge follows
const stretch = (p, L, R) => { const n = L.length - 1; if (n < 1) return [L[0], R[0]]; const q = clamp(p, 0, n), i = Math.min(n - 1, Math.floor(q)), f = q - i; return [lerp(L[i], L[i + 1], ss(.38, 1, f)), lerp(R[i], R[i + 1], ss(0, .62, f))]; };

// photos: generated lazily at display size × DPR (bucketed), one job per frame budget, fade in once decoded
const fades = []; let fT = -1, spent = 0;
const BK = [240, 320, 480, 640, 800, 960, 1280, 1600];
const bucket = w => BK.find(b => b >= w) || 1600;
const photo = (q, name, ar, tod = 0, alt) => { const im = document.createElement('img'); im.className = 'txc-ph'; im.alt = alt ?? (CAP[name] || ''); im.draggable = false; im.style.opacity = '0'; Object.assign(im, { _n:name, _ar:ar, _tod:tod, _b:0, _q:q }); return im; };
const need = (im, dw) => { const b = bucket(dw*DPR); if (b <= im._b) return; im._b = b; const h = Math.max(1, Math.round(b/im._ar));
  im._q.push(() => { if (im._b !== b || !PK) return; const first = !im.src; im.src = PK.url(im._n, b, h, { tod:im._tod }); if (first) (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).then(() => fades.push({ el:im, t:now() })); }); };
const pump = (q, t) => { if (t !== fT){ fT = t; spent = 0; for (let i = fades.length - 1; i >= 0; i--){ const f = fades[i], p = clamp(prog(t, f.t, S.soft)); if (p > .995){ f.el.style.opacity = ''; fades.splice(i, 1); } else f.el.style.opacity = p.toFixed(3); } }
  while (q.length && spent < 9){ const s = performance.now(); q.shift()(); spent += performance.now() - s; } };

// pointer gesture: press at once (to catch a moving rail), drag after a threshold, velocity from the last 100 ms
function grab(el, h){
  let s = null, sup = 0;
  el.addEventListener('click', e => { if (performance.now() < sup){ e.stopPropagation(); e.preventDefault(); } }, true);
  el.addEventListener('pointerdown', e => { if (e.button || s || (h.skip && h.skip(e))) return; s = { id:e.pointerId, x:e.clientX, y:e.clientY, on:false, q:[[performance.now(), e.clientX, e.clientY]] }; h.press && h.press(e); });
  el.addEventListener('pointermove', e => { if (!s || e.pointerId !== s.id) return; const n = performance.now(), dx = e.clientX - s.x, dy = e.clientY - s.y;
    s.q.push([n, e.clientX, e.clientY]); while (s.q.length > 2 && n - s.q[0][0] > 100) s.q.shift();
    if (!s.on){ if (Math.hypot(dx, dy) < (h.th ?? 6)) return; s.on = true; try { el.setPointerCapture(e.pointerId); } catch (_){ } el.classList.add('txc-held'); h.start && h.start(e); }
    h.move && h.move(dx, dy, e); });
  const end = (e, cancel) => { if (!s || e.pointerId !== s.id) return; const on = s.on, q = s.q, n = performance.now(); let vx = 0, vy = 0; s = null; el.classList.remove('txc-held');
    if (on && !cancel){ const a = q[0], b = q[q.length - 1], dt = (b[0] - a[0])/1000; if (dt > .008 && n - b[0] < 70){ const k = 1/Math.max(.05, clock.scale); vx = clamp((b[1] - a[1])/dt, -6000, 6000)*k; vy = clamp((b[2] - a[2])/dt, -6000, 6000)*k; } }
    if (on) sup = n + 80; h.end && h.end(vx, vy, on, e, !!cancel); };
  el.addEventListener('pointerup', e => end(e)); el.addEventListener('pointercancel', e => end(e, true));
}

// one-dimensional rail: offset p (content moves by −p), snaps, rubber band, projection, interruptible settle
function rail(o){
  const cfg = o.cfg || SET, T = new Track(0, cfg), K = o.k ?? .2, D = o.rbd ?? 90;
  const r = { T, held:false, hx:0, base:0, i:0, si:0, wheel:false, ws:[], lw:0 };
  const N = () => o.loop ? o.count() : o.snaps().length;
  const sn = i => o.loop ? i*o.step() : (o.snaps()[i] ?? 0);
  const lo = () => sn(0), hi = () => sn(N() - 1);
  const band = v => { if (o.loop) return v; const a = lo(), b = hi(); return v < a ? a + rb(v - a, D) : v > b ? b + rb(v - b, D) : v; };
  const unrb = y => { const a = Math.min(Math.abs(y), D*.97); return Math.sign(y)*(D/.55)*(1/(1 - a/D) - 1); };
  const unband = v => { if (o.loop) return v; const a = lo(), b = hi(); return v < a ? a + unrb(v - a) : v > b ? b + unrb(v - b) : v; };
  const near = p => { if (o.loop) return Math.round(p/o.step()); const s = o.snaps(); let b = 0; for (let i = 1; i < s.length; i++) if (Math.abs(s[i] - p) < Math.abs(s[b] - p)) b = i; return b; };
  Object.assign(r, { band, near, snap:sn, count:N, lo, hi,
    pos:(t = now()) => r.held ? band(r.hx) : T.at(t),
    idx:() => o.loop ? ((r.i % N()) + N()) % N() : r.i,
    settle(x0, v, to){ T.release(x0, capv(x0, v, to, cfg.w, o.away ?? 700), to); },
    go(i, v = 0, from){ if (!o.loop) i = clamp(i, 0, N() - 1); const ch = i !== r.i; r.i = i; r.settle(from ?? T.at(now()), v, sn(i)); o.change && o.change(r.idx(), ch); },
    step(d){ if (!r.held) r.go(r.i + d); },
    home(){ r.go(o.loop ? r.i - r.idx() : 0); }, end(){ r.go(o.loop ? r.i - r.idx() + N() - 1 : N() - 1); },
    grab(){ r.held = true; r.wheel = false; r.hx = r.base = unband(T.at(now())); r.si = near(r.hx); },
    drag(d){ r.hx = r.base + d; },
    release(v){ if (!r.held) return; const p = band(r.hx); r.held = false; r.wheel = false; if (o.release && o.release(p, v)) return;
      let i = near(p + v*K); if (o.maxStep) i = clamp(i, r.si - o.maxStep, r.si + o.maxStep);
      if (i === r.si && Math.abs(v) > 320 && Math.sign(v) === Math.sign(p - sn(r.si))) i += Math.sign(v);
      r.go(i, v, p); },
    sync(){ if (r.held) return; if (!o.loop) r.i = clamp(r.i, 0, N() - 1); T.jump(sn(r.i)); },
    tick(){ if (r.wheel && performance.now() - r.lw > 130){ const a = r.ws[0], b = r.ws[r.ws.length - 1], dt = (b[0] - a[0])/1000; r.release(dt > .01 ? clamp((b[1] - a[1])/dt, -2500, 2500)/Math.max(.05, clock.scale) : 0); } },
    // horizontal trackpad swipes only; vertical wheel always scrolls the page
    wheelOn(el){ el.addEventListener('wheel', e => { if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || (r.held && !r.wheel)) return; e.preventDefault(); if (!r.wheel){ r.grab(); r.wheel = true; r.ws = []; }
      r.hx += e.deltaX*(e.deltaMode === 1 ? 16 : 1); r.lw = performance.now(); r.ws.push([r.lw, r.hx]); if (r.ws.length > 6) r.ws.shift(); }, { passive:false }); }
  });
  return r;
}
const bindRail = (vp, r, ax = 'x', o = {}) => { vp.addEventListener('scroll', () => { vp.scrollLeft = 0; vp.scrollTop = 0; });
  grab(vp, { th:o.th, skip:o.skip, press:e => { r.grab(); o.press && o.press(e); }, move:(dx, dy) => r.drag(-(ax === 'x' ? dx : dy)),
    end:(vx, vy, mv, e) => { r.release(mv ? -(ax === 'x' ? vx : vy) : 0); if (!mv && o.tap) o.tap(e); } }); };
const keysRail = (el, r, ax = 'x', extra) => el.addEventListener('keydown', e => { if (e.target !== el || e.altKey || e.metaKey || e.ctrlKey) return; const k = e.key;
  if (k === (ax === 'x' ? 'ArrowLeft' : 'ArrowUp') || (ax === 'y' && k === 'PageUp')) r.step(-1);
  else if (k === (ax === 'x' ? 'ArrowRight' : 'ArrowDown') || (ax === 'y' && k === 'PageDown')) { if (!(extra && extra(e))) r.step(1); }
  else if (k === 'Home') r.home(); else if (k === 'End') r.end(); else return; e.preventDefault(); });

/* ---------- 1. Momentum filmstrip ---------- */
atom({ id:'txc-film', cat:'Carousels', name:'Momentum filmstrip', block:'gallery (filmstrip), carousel', fam:['D','E'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-hd"><div><div class="txc-t">Field notes, week 32</div><div class="txc-m">Eight frames in their own formats</div></div><span class="txc-m txc-n txc-fs-ct" aria-hidden="true"></span></div><div class="txc-vp txc-fs-vp" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Field notes, week 32"><div class="txc-tr txc-fs-tr"></div></div><div class="txc-ft"><div class="txc-fs-sb" aria-hidden="true"><i class="txc-fs-th"></i></div>${nb('l','Previous photo')}${nb('r','Next photo')}</div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'The strip follows the pointer 1:1. On release the velocity is projected about 0.4 s ahead and the strip settles on the nearest frame edge from that same velocity, so a hard flick travels several frames and a nudge moves one. Past either end it rubber-bands and the scroll bar shortens. Inspired by Keen Slider free-snap and Flickity freeScroll; changed: frames keep their real aspect ratios and the counter reports the range in view. Use when photos come in mixed formats and people skim them fast, like a contact sheet.',
  api:'target = nearest edge(x + v·0.42); x.release(x, min(v, ω·d), target)   bar.w −= overscroll',
  init(st){
    const q = [], root = $(st,'.txc-root'), vp = $(st,'.txc-fs-vp'), tr = $(st,'.txc-fs-tr'), ct = $(st,'.txc-fs-ct'), sb = $(st,'.txc-fs-sb'), th = $(st,'.txc-fs-th'), [bl, br] = $$(st,'.txc-nb'), sr = $(st,'.txc-sr');
    const D = [['canyon',2/3,'2:3'],['lake',3/2,'3:2'],['studio',1,'1:1'],['coast',16/9,'16:9'],['portrait',4/5,'4:5'],['forest',3/2,'3:2'],['dunes',2/3,'2:3'],['harbor',5/4,'5:4']];
    const sl = D.map(([n, ar, f], i) => { const fg = slide(mk('figure','txc-fs-sl'), i, D.length, CAP[n]), fr = mk('div','txc-fr'), im = photo(q, n, ar), fc = mk('figcaption', '', '<b></b><span class="txc-n"></span>');
      fc.firstChild.textContent = CAP[n]; fc.lastChild.textContent = f; fr.appendChild(im); fg.append(fr, fc); tr.appendChild(fg); return { fg, fr, im, ar, x:0, w:0 }; });
    let W = 0, snaps = [0], cw = 1, sbw = 0;
    const upd = i => { const a = snaps[i] ?? 0, n = sl.length, full = sl.map(s => s.x >= a - 1 && s.x + s.w <= a + W + 1), f = full.indexOf(true), l = full.lastIndexOf(true);
      const txt = f < 0 ? '' : f === l ? `${f + 1} of ${n}` : `${f + 1}–${l + 1} of ${n}`; say(ct, txt); say(sr, `Showing photos ${txt.replace('–', ' to ')}`);
      dis(bl, i <= 0); dis(br, i >= snaps.length - 1); sl.forEach(s => hide(s.fg, s.x + s.w < a || s.x > a + W)); };
    const r = rail({ snaps:() => snaps, k:.42, change:upd });
    const thw = () => Math.max(28, sbw*Math.min(1, W/cw));
    onSize(st, (w, H) => { W = w; const P = W < 560 ? 16 : 24; root.style.setProperty('--p', P + 'px');
      const hs = W < 560 ? 280 : clamp(H - 236, 220, 330), g = W < 560 ? 10 : 14; let x = P;
      sl.forEach(s => { s.w = Math.round(Math.min(hs*s.ar, W - 2*P - 28)); s.x = x; s.fg.style.left = x + 'px'; s.fg.style.width = s.w + 'px'; s.fr.style.height = hs + 'px'; need(s.im, hs*s.ar); x += s.w + g; });
      cw = x - g + P; const max = Math.max(0, cw - W); snaps = []; sl.forEach(s => { const v = Math.min(s.x - P, max); if (!snaps.length || v - snaps[snaps.length - 1] > 1) snaps.push(v); });
      vp.style.top = (70 + Math.max(0, (H - 70 - 64 - hs - 30)/2)) + 'px'; vp.style.height = (hs + 30) + 'px'; sbw = sb.clientWidth; r.sync(); upd(r.i); });
    bindRail(vp, r); keysRail(vp, r); r.wheelOn(vp);
    bl.onclick = () => r.step(-1); br.onclick = () => r.step(1);
    // the scroll bar is a second handle on the same rail, scaled by content/track
    let k = 1;
    grab(sb, { th:2, press:() => { r.grab(); k = snaps[snaps.length - 1]/Math.max(1, sbw - thw()); }, move:dx => r.drag(dx*k),
      end:(vx, vy, mv, e) => { if (mv){ r.release(vx*k); return; } r.held = false; const rc = sb.getBoundingClientRect(), f = clamp((e.clientX - rc.left - thw()/2)/Math.max(1, sbw - thw())); r.go(r.near(f*snaps[snaps.length - 1])); } });
    return t => { pump(q, t); r.tick(); const p = r.pos(t), max = snaps[snaps.length - 1]; put(tr, 'transform', tx(-p));
      const tw = thw(), over = p < 0 ? -p : p > max ? p - max : 0, w2 = Math.max(10, tw - over*.6), f = max > 0 ? clamp(p/max) : 0;
      put(th, 'width', px(w2)); put(th, 'transform', tx(f*(sbw - w2))); };
  }});

/* ---------- 2. Inner parallax slides ---------- */
atom({ id:'txc-para', cat:'Carousels', name:'Inner parallax slides', block:'carousel (hero), slideshow', fam:['D','E'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-hd"><div><div class="txc-t">Bay Area loop, six stops</div><div class="txc-m">212 miles over a long weekend</div></div><span class="txc-m txc-n txc-pa-ct" aria-hidden="true"></span></div><div class="txc-vp txc-pa-vp" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Bay Area loop"><div class="txc-tr txc-pa-tr"></div></div><div class="txc-ft"><div class="txc-dots" aria-hidden="true"></div><span style="flex:1"></span>${nb('l','Previous stop')}${nb('r','Next stop')}</div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'The frame follows the finger 1:1 while its photo drifts the other way inside it, and the caption runs slightly ahead, so three depths separate as you drag. The dot plate stretches from its leading edge and the trailing edge catches up. Inspired by Swiper parallax and Codrops slideshows; changed: every offset is computed from the slide’s distance to center, so it holds mid-flick, in reverse and when interrupted. Use when each slide is a place or a story and a sense of depth helps it read as a window.',
  api:'d = (i·step − x)/step;  photo.x = −clamp(d)·0.22w;  caption.x = d·44;  plate = stretch(x/step)',
  init(st){
    const q = [], root = $(st,'.txc-root'), vp = $(st,'.txc-pa-vp'), tr = $(st,'.txc-pa-tr'), ct = $(st,'.txc-pa-ct'), dots = $(st,'.txc-dots'), [bl, br] = $$(st,'.txc-nb'), sr = $(st,'.txc-sr');
    const D = [['coast','Point Reyes headland','Mile 0 · fog lifts by ten'],['harbor','Bodega Bay','Mile 38 · boats out before six'],['forest','Armstrong redwoods','Mile 61 · cool even in August'],['lake','Lake Sonoma','Mile 94 · swim from the north cove'],['ridge','Mount Tamalpais','Mile 150 · last light on the ridge'],['city','San Francisco','Mile 212 · dinner in the Mission']];
    const sl = D.map(([n, t, m], i) => { const el = slide(mk('div','txc-pa-sl'), i, D.length, t), fr = mk('div','txc-fr'), im = photo(q, n, 1.6, 0, `${t}. ${m}`), cap = mk('div','txc-pa-cap','<b></b><span class="txc-m"></span>');
      im.classList.add('txc-pa-im'); cap.firstChild.textContent = t; cap.lastChild.textContent = m; fr.appendChild(im); el.append(fr, cap); tr.appendChild(el); return { el, fr, im, cap }; });
    D.forEach(() => dots.appendChild(mk('b'))); const pl = mk('i'); dots.appendChild(pl);
    const L = D.map((_, i) => i*18), R = L.map(v => v + 8);
    let W = 0, Ws = 300, step = 320;
    const r = rail({ snaps:() => D.map((_, i) => i*step), change:i => { say(ct, `${String(i + 1).padStart(2, '0')} / ${String(D.length).padStart(2, '0')}`); say(sr, `Stop ${i + 1} of ${D.length}: ${D[i][1]}`); dis(bl, i === 0); dis(br, i === D.length - 1); sl.forEach((s, k) => hide(s.el, k !== i)); } });
    onSize(st, (w, H) => { W = w; const P = W < 560 ? 16 : 24; root.style.setProperty('--p', P + 'px');
      Ws = Math.round(W < 560 ? W - 56 : Math.min(W*.64, 760)); const g = W < 560 ? 12 : 20, hf = Math.max(200, H - 206); step = Ws + g;
      sl.forEach((s, i) => { s.el.style.left = i*step + 'px'; s.el.style.width = Ws + 'px'; s.fr.style.height = hf + 'px'; s.im._ar = 1.5*Ws/hf; need(s.im, Ws*1.5); });
      vp.style.top = '70px'; vp.style.height = (hf + 64) + 'px'; r.sync(); r.go(r.i); });
    bindRail(vp, r); keysRail(vp, r); r.wheelOn(vp);
    bl.onclick = () => r.step(-1); br.onclick = () => r.step(1);
    return t => { pump(q, t); r.tick(); const p = r.pos(t); put(tr, 'transform', tx(W/2 - Ws/2 - p));
      sl.forEach((s, i) => { const d = (i*step - p)/step; if (Math.abs(d) > 2.2) return; put(s.im, 'transform', tx(-clamp(d, -1, 1)*Ws*.22)); put(s.cap, 'transform', tx(d*44)); put(s.cap, 'opacity', (1 - .75*Math.min(1, Math.abs(d))).toFixed(3)); });
      const [a, b] = stretch(p/step, L, R); put(pl, 'transform', tx(a)); put(pl, 'width', px(b - a)); };
  }});

/* ---------- 3. Center-focus rail ---------- */
atom({ id:'txc-focus', cat:'Carousels', name:'Center-focus rail', block:'carousel (product picker), gallery', fam:['D','M'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-hd"><div><div class="txc-t">Print shop picks</div><div class="txc-m">Eight 4×5 prints · tap a neighbour to bring it forward</div></div></div><div class="txc-vp txc-cf-vp" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Print shop picks"></div><div class="txc-ft txc-cf-ft">${nb('l','Previous print')}<span class="txc-m txc-n txc-cf-ct" aria-hidden="true"></span>${nb('r','Next print')}</div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'Each print scales and fades only by its distance from center, and spacing is integrated from that same scale curve, so gaps stay even and nothing rotates or overlaps. The caption under the center crossfades by distance while you drag. Inspired by Keen Slider’s distance-driven slides and Apple TV shelves; changed: positions come from integrating the scale, so the center print moves exactly 1:1 under the pointer. Use when one item is the subject and its neighbours are context, such as a print shop or a plan picker.',
  api:'d = (i·step − x)/step;  s = 1 − .16·min(|d|,1) − .08·clamp(|d|−1);  pos = ∫₀ᵈ s(u) du · step',
  init(st){
    const q = [], root = $(st,'.txc-root'), vp = $(st,'.txc-cf-vp'), ct = $(st,'.txc-cf-ct'), [bl, br] = $$(st,'.txc-nb'), sr = $(st,'.txc-sr');
    const D = ['portrait','studio','meadow','canyon','forest','harbor','field','city'];
    const sl = D.map((n, i) => { const el = slide(mk('div','txc-cf-sl'), i, D.length, CAP[n]), fr = mk('div','txc-fr'), im = photo(q, n, .8); fr.appendChild(im); el.appendChild(fr); el.dataset.i = i; vp.appendChild(el);
      const cp = mk('div','txc-cf-cp','<b></b><span class="txc-m"></span>'); cp.firstChild.textContent = CAP[n]; cp.lastChild.textContent = `Print ${i + 1} of ${D.length} · 4×5 in`; cp.setAttribute('aria-hidden', 'true'); vp.appendChild(cp); return { el, im, cp }; });
    const k1 = .16, k2 = .08, sc = a => 1 - k1*Math.min(a, 1) - k2*clamp(a - 1), op = a => 1 - .5*Math.min(a, 1) - .22*clamp(a - 1);
    let W = 0, w = 240, h = 300, step = 258, top = 0;
    const F = d => { const a = Math.abs(d), i1 = Math.min(a, 1), i2 = clamp(a - 1), i3 = Math.max(0, a - 2); return Math.sign(d)*step*(i1 - k1*i1*i1/2 + (1 - k1)*i2 - k2*i2*i2/2 + (1 - k1 - k2)*i3); };
    const r = rail({ snaps:() => D.map((_, i) => i*step), change:i => { say(ct, `${i + 1} of ${D.length}`); say(sr, `Print ${i + 1} of ${D.length}: ${CAP[D[i]]}`); dis(bl, i === 0); dis(br, i === D.length - 1); sl.forEach((s, k) => hide(s.el, Math.abs(k - i) > 2)); } });
    r.i = 2;
    onSize(st, (wd, H) => { W = wd; root.style.setProperty('--p', (W < 560 ? 16 : 24) + 'px');
      w = W < 560 ? Math.round(W*.6) : W < 900 ? 240 : 264; h = Math.round(w*1.25); step = w + 18; const vh = H - 70 - 64; top = Math.max(0, (vh - h - 48)/2);
      vp.style.top = '70px'; vp.style.height = vh + 'px'; sl.forEach(s => { s.el.style.width = w + 'px'; s.el.style.height = h + 'px'; s.cp.style.top = (top + h + 12) + 'px'; need(s.im, w); }); r.sync(); r.go(r.i); });
    bindRail(vp, r, 'x', { tap:e => { const el = e.target.closest('.txc-cf-sl'); if (el) r.go(+el.dataset.i); } }); keysRail(vp, r); r.wheelOn(vp);
    bl.onclick = () => r.step(-1); br.onclick = () => r.step(1);
    return t => { pump(q, t); r.tick(); const p = r.pos(t);
      sl.forEach((s, i) => { const d = (i*step - p)/step, a = Math.abs(d); if (a > 4.5){ put(s.el, 'visibility', 'hidden'); put(s.cp, 'opacity', '0'); return; } put(s.el, 'visibility', 'visible');
        put(s.el, 'transform', tx(W/2 - w/2 + F(d), top, sc(a))); put(s.el, 'opacity', op(a).toFixed(3)); put(s.cp, 'opacity', clamp(1 - a*2.4).toFixed(3)); put(s.cp, 'transform', tx(-d*24)); }); };
  }});

/* ---------- 4. Swipe deck ---------- */
atom({ id:'txc-deck', cat:'Carousels', name:'Swipe deck', block:'card stack (triage), gallery', fam:['D','X'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-hd"><div><div class="txc-t">Choose cover photos</div><div class="txc-m">Swipe right to keep, left to skip</div></div><span class="txc-m txc-n txc-dk-tl" aria-hidden="true">0 kept · 0 skipped</span></div><div class="txc-dk-deck" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Cover photo candidates. Right arrow keeps, left arrow skips, Z undoes."></div><div class="txc-dk-done"><b>All eight sorted</b><span class="txc-m txc-dk-sum"></span><button type="button" class="btn txc-dk-again">Start over</button></div><div class="txc-ft txc-dk-b"><button type="button" class="txc-dk-xb">${ic(I.x, 16)}Skip</button><button type="button" class="txc-dk-ub">Undo</button><button type="button" class="txc-dk-kb">${ic(I.check, 16)}Keep</button></div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'The top card follows the pointer 1:1 and tilts with its offset, toward the half you grabbed. Release projects position plus velocity: past 40% of the card it is thrown off at its own speed, otherwise it settles home without overshoot. The next card rises first and the rest of the stack follows 45 ms apart. Undo brings the last card back from the side it left. Use when every item needs a quick yes or no, such as triage, shortlists or review queues.',
  api:'score = x + vx·0.15;  |score| > 0.4w ? x.release(x, vx, ±off) : x.release(x, cap(vx), 0);  depth[k].set(k, t + k·45ms)',
  init(st){
    const q = [], root = $(st,'.txc-root'), deck = $(st,'.txc-dk-deck'), tl = $(st,'.txc-dk-tl'), done = $(st,'.txc-dk-done'), sum = $(st,'.txc-dk-sum'), again = $(st,'.txc-dk-again'), xb = $(st,'.txc-dk-xb'), ub = $(st,'.txc-dk-ub'), kb = $(st,'.txc-dk-kb'), sr = $(st,'.txc-sr');
    const D = ['ridge','lake','city','forest','coast','canyon','meadow','harbor'];
    const C = D.map((n, i) => { const el = slide(mk('div','txc-dk-c'), i, D.length, CAP[n]); el.innerHTML = `<div class="txc-fr"></div><div class="txc-dk-cf"><b></b><span class="txc-m txc-n">${i + 1} of ${D.length}</span></div><span class="txc-dk-s txc-dk-k" aria-hidden="true">Keep</span><span class="txc-dk-s txc-dk-x" aria-hidden="true">Skip</span>`;
      const im = photo(q, n, 1.15); el.firstChild.appendChild(im); $(el,'b').textContent = CAP[n]; deck.appendChild(el); return { el, im, n, cf:$(el,'.txc-dk-cf'), kp:$(el,'.txc-dk-k'), sk:$(el,'.txc-dk-x'), x:new Track(0, SET), y:new Track(0, SET), d:new Track(i, S.base), fate:0, sg:1 }; });
    let W = 0, H = 0, cw = 300, ch = 380, L = 0, top = 0, held = null, hx = 0, hy = 0, hist = []; const dn = new Track(0);
    const pend = () => C.filter(c => !c.fate), topc = () => pend()[0];
    const restack = (t0 = now()) => pend().forEach((c, k) => { c.d.set(k, S.base, t0 + k*.045); c.el.style.zIndex = 50 - k; hide(c.el, k > 0); });
    const ui = () => { const p = pend(), kept = C.filter(c => c.fate > 0).length, sk = C.filter(c => c.fate < 0).length; tl.textContent = `${kept} kept · ${sk} skipped`; dis(xb, !p.length); dis(kb, !p.length); dis(ub, !hist.length);
      dn.set(p.length ? 0 : 1, p.length ? S.snap : S.base, now() + (p.length ? 0 : .18)); sum.textContent = `Kept ${kept} for the cover shortlist.`; done.style.pointerEvents = p.length ? 'none' : 'auto'; };
    const decide = (c, dir, vx = 0, vy = 0, x0 = c.x.at(), y0 = c.y.at()) => { if (!c) return; c.fate = dir; hist.push(c); c.el.style.zIndex = 60; hide(c.el, true);
      const off = dir*(W/2 + cw*.9 + 60); c.x.release(x0, dir*Math.max(dir*vx, 700), off); c.y.release(y0, vy, clamp(y0 + vy*.12, -H*.4, H*.4));
      restack(); ui(); const n = pend().length; say(sr, `${dir > 0 ? 'Kept' : 'Skipped'} ${CAP[c.n]}. ${n ? n + ' left.' : 'All sorted.'}`); };
    const undo = () => { const c = hist.pop(); if (!c) return; c.fate = 0; c.x.set(0); c.y.set(0); restack(); ui(); say(sr, `Back: ${CAP[c.n]}`); };
    const all = () => { const t0 = now(); hist.slice().reverse().forEach((c, k) => { c.fate = 0; c.x.set(0, SET, t0 + k*.05); c.y.set(0, SET, t0 + k*.05); }); hist = []; restack(t0); ui(); deck.focus(); };
    onSize(st, (w, h) => { W = w; H = h; root.style.setProperty('--p', (W < 560 ? 16 : 24) + 'px'); cw = Math.min(300, W - 64); ch = Math.round(Math.min(H - 196, cw*1.32)); L = (W - cw)/2; const area = H - 72 - 80; top = Math.max(0, (area - ch - 42)/2);
      deck.style.top = '72px'; deck.style.height = area + 'px'; done.style.top = '72px'; done.style.height = area + 'px'; C.forEach(c => { c.el.style.width = cw + 'px'; c.el.style.height = ch + 'px'; need(c.im, cw); }); });
    grab(deck, { th:3, skip:e => { const c = topc(); return !c || e.target.closest('.txc-dk-c') !== c.el; },
      press:e => { const c = topc(); held = c; hx = c.x.at(); hy = c.y.at(); c.x.jump(hx); c.y.jump(hy); const rc = c.el.getBoundingClientRect(); c.sg = e.clientY - rc.top < rc.height/2 ? 1 : -1; c._b = [hx, hy]; },
      move:(dx, dy) => { if (held){ hx = held._b[0] + dx; hy = held._b[1] + dy; } },
      end:(vx, vy, mv) => { const c = held; held = null; if (!c) return; c.x.jump(hx); c.y.jump(hy); const sc = hx + vx*.15;
        if (mv && Math.abs(sc) > cw*.4) decide(c, Math.sign(sc), vx, vy, hx, hy); else { c.x.release(hx, capv(hx, vx, 0), 0); c.y.release(hy, capv(hy, vy, 0), 0); } } });
    const btn = (b, f) => b.onclick = () => { if (b.getAttribute('aria-disabled') !== 'true') f(); };
    btn(kb, () => decide(topc(), 1, 1400, -120)); btn(xb, () => decide(topc(), -1, -1400, -120)); btn(ub, undo); again.onclick = all;
    deck.addEventListener('keydown', e => { if (e.target !== deck) return; const k = e.key;
      if (k === 'ArrowRight') decide(topc(), 1, 1400, -120); else if (k === 'ArrowLeft') decide(topc(), -1, -1400, -120); else if (k === 'z' || k === 'Z' || k === 'Backspace') undo(); else return; e.preventDefault(); });
    restack(); ui();
    return t => { pump(q, t);
      C.forEach(c => { const x = held === c ? hx : c.x.at(t), y = held === c ? hy : c.y.at(t), dp = clamp(c.d.at(t), 0, 3.6), k = Math.min(dp, 3);
        const o = c.fate ? 1 : 1 - clamp(dp - 2.6), rot = clamp(x/cw, -1.6, 1.6)*7*c.sg, s = 1 - .05*k;
        put(c.el, 'transform', `translate3d(${(L + x).toFixed(2)}px,${(top + y + k*(14 + ch*.025)).toFixed(2)}px,0) rotate(${rot.toFixed(3)}deg) scale(${s.toFixed(4)})`); put(c.el, 'opacity', o.toFixed(3)); put(c.el, 'visibility', o < .01 ? 'hidden' : 'visible');
        put(c.cf, 'opacity', (1 - clamp(dp)).toFixed(3)); put(c.kp, 'opacity', clamp(x/(cw*.35)).toFixed(3)); put(c.sk, 'opacity', clamp(-x/(cw*.35)).toFixed(3)); });
      const d = clamp(dn.at(t)); put(done, 'opacity', d.toFixed(3)); put(done, 'visibility', d < .01 ? 'hidden' : 'visible'); put(done, 'transform', tx(0, (1 - d)*8)); };
  }});

/* ---------- 5. Stories ---------- */
atom({ id:'txc-story', cat:'Carousels', name:'Stories with hold to pause', block:'carousel (stories), social', fam:['T','S'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-sy-fr" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Northline Trails stories. Left and right arrows move between stories, Space pauses."><div class="txc-sy-ph"></div><div class="txc-sy-caps" aria-hidden="true"></div><div class="txc-sy-top"><div class="txc-sy-bars" aria-hidden="true"></div><div class="txc-sy-who"><div class="txc-sy-av"></div><b>Northline Trails</b><span>Today</span><button type="button" class="txc-sy-pp" aria-label="Pause stories"></button></div></div></div><div class="txc-sy-hint">Tap right for next, left for back · hold to pause</div><div class="txc-sr" aria-live="off" aria-atomic="true"></div></div>`,
  desc:'Segments fill from the clock. Holding anywhere pauses at once and, after 300 ms, fades the chrome so the photo can be read. A tap on the left third goes back, anywhere else goes forward, with an exit-then-enter swap; each photo drifts slowly while its segment runs. Inspired by Instagram stories; changed: pausing, holding and time spent off screen are all subtracted from one start time, so the bar never jumps. Use when short, ordered moments should play hands-free but stay under the viewer’s control.',
  api:'e = (frozen ? tp : t) − t0;  fill[cur] = e/5;  unfreeze: t0 += t − tp;  e ≥ 5 → next',
  init(st){
    const q = [], fr = $(st,'.txc-sy-fr'), phs = $(st,'.txc-sy-ph'), caps = $(st,'.txc-sy-caps'), bars = $(st,'.txc-sy-bars'), top = $(st,'.txc-sy-top'), pp = $(st,'.txc-sy-pp'), av = $(st,'.txc-sy-av'), hint = $(st,'.txc-sy-hint'), sr = $(st,'.txc-sr');
    const D = [['ridge',0,'6:40 am','First light at the trailhead'],['forest',.15,'7:55 am','Spruce stand above the creek'],['lake',.3,'10:20 am','Snack stop at Mirror Lake'],['meadow',.8,'5:30 pm','The long way back through the meadow'],['canyon',1,'7:05 pm','Canyon wall going gold']], DUR = 5, n = D.length;
    const P = D.map(([nm, tod, tm, cap]) => { const w = mk('div'), im = photo(q, nm, 9/16, tod, cap); w.appendChild(im); phs.appendChild(w); const c = mk('div', '', '<span></span><b></b>'); c.firstChild.textContent = tm; c.lastChild.textContent = cap; caps.appendChild(c);
      const b = mk('span', '', '<i></i>'); bars.appendChild(b); return { w, im, c, f:b.firstChild }; });
    const avi = photo(q, 'portrait', 1, 0, ''); av.appendChild(avi);
    const PAUSE = ic('<path d="M9 6v12M15 6v12"/>', 16, 2.4), PLAY = ic('<path d="M8 5.5v13l10-6.5z" fill="currentColor"/>', 16, 1.6);
    const sw = new Swap(0), chrome = new Track(1, S.base); let cur = 0, t0 = now(), tp = now(), paused = REDUCE, down = null, fz = false, lastT = now();
    const setF = () => { const f = paused || !!down; if (f && !fz) tp = now(); if (!f && fz) t0 += now() - tp; fz = f; };
    const ui = () => { pp.innerHTML = paused ? PLAY : PAUSE; pp.setAttribute('aria-label', paused ? 'Play stories' : 'Pause stories'); sr.setAttribute('aria-live', paused ? 'polite' : 'off'); };
    const go = (i, manual) => { cur = (i + n) % n; sw.to(cur); t0 = now(); tp = now(); if (manual) say(sr, `Story ${cur + 1} of ${n}: ${D[cur][3]}, ${D[cur][2]}`); };
    setF(); ui();
    onSize(st, (W, H) => { let fh = Math.min(H - 64, 640), fw = Math.round(fh*9/16); if (fw > W - 32){ fw = W - 32; fh = Math.round(fw*16/9); }
      Object.assign(fr.style, { width:fw + 'px', height:fh + 'px', left:((W - fw)/2) + 'px', top:Math.max(12, (H - fh - 36)/2) + 'px' }); hint.style.top = (Math.max(12, (H - fh - 36)/2) + fh + 12) + 'px';
      P.forEach(p => need(p.im, fw)); need(avi, 28); });
    fr.addEventListener('pointerdown', e => { if (e.button || e.target.closest('.txc-sy-pp')) return; down = { rt:performance.now(), x:e.clientX, y:e.clientY, id:e.pointerId }; setF(); });
    const up = (e, cancel) => { if (!down || e.pointerId !== down.id) return; const d = down; down = null; setF(); chrome.set(1);
      if (!cancel && performance.now() - d.rt < 260 && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 12){ const rc = fr.getBoundingClientRect(); go(cur + (e.clientX - rc.left < rc.width/3 ? -1 : 1), true); } };
    fr.addEventListener('pointerup', e => up(e)); fr.addEventListener('pointercancel', e => up(e, true)); fr.addEventListener('pointerleave', e => up(e, true));
    pp.onclick = () => { paused = !paused; setF(); ui(); say(sr, paused ? `Paused on story ${cur + 1} of ${n}` : 'Playing'); };
    fr.addEventListener('keydown', e => { if (e.target !== fr) return; const k = e.key;
      if (k === 'ArrowRight') go(cur + 1, true); else if (k === 'ArrowLeft') go(cur - 1, true); else if (k === ' ' || k === 'k') pp.onclick(); else return; e.preventDefault(); });
    return t => { pump(q, t); if (t - lastT > .25 && !fz) t0 += t - lastT; lastT = t;
      if (down && performance.now() - down.rt > 300) chrome.set(0);
      let e = (fz ? tp : t) - t0; if (!fz && e >= DUR){ go(cur + 1); e = 0; } const f = clamp(e/DUR);
      P.forEach((p, i) => { put(p.f, 'transform', `scaleX(${(i < cur ? 1 : i > cur ? 0 : f).toFixed(4)})`);
        let o = 0; if (i === sw.cur) o = clamp(prog(t, sw.t + EXIT)); else if (i === sw.prev){ const u = clamp((t - sw.t)/EXIT); o = 1 - u*u; }
        put(p.w, 'opacity', o.toFixed(3)); put(p.w, 'visibility', o < .01 ? 'hidden' : 'visible');
        if (i === cur && !REDUCE) put(p.im, 'transform', `scale(${(1.03 + .06*f).toFixed(4)}) translate3d(${((i % 2 ? -1 : 1)*f*6).toFixed(2)}px,0,0)`);
        sw.apply(p.c, i, t, 6); });
      const c = clamp(chrome.at(t)); put(top, 'opacity', c.toFixed(3)); put(caps, 'opacity', c.toFixed(3)); };
  }});

/* ---------- 6. Synced main and thumbnails ---------- */
atom({ id:'txc-sync', cat:'Carousels', name:'Synced thumbnail rail', block:'gallery (product), carousel', fam:['D','E'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-hd"><div><div class="txc-t">Trip report: Mirror Lake loop</div><div class="txc-m">Eight photos from the trail</div></div></div><div class="txc-sn-fr"><div class="txc-vp txc-sn-vp" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Trip report photos"><div class="txc-tr txc-sn-tr"></div></div></div><div class="txc-sn-cap"><b></b><span class="txc-m txc-n"></span></div><div class="txc-sn-rail"><div class="txc-sn-tt" role="tablist" aria-label="Choose photo"><i class="txc-sn-pl"></i></div></div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'The main photo drags 1:1. The thumbnail plate is a pure function of that position: its leading edge reaches the next thumb first and its trailing edge follows, so it stretches mid-move in either direction and can never drift out of sync. The rail recenters on the active thumb and can be flicked on its own. Inspired by Swiper thumbs and Flickity asNavFor; changed: one position drives both, instead of two carousels messaging each other. Use when people compare similar photos and need detail and overview at once, such as product galleries.',
  api:'p = x/step;  [a, b] = stretch(p, thumbL, thumbR);  rail.settle(center(thumb[round p]))',
  init(st){
    const q = [], root = $(st,'.txc-root'), frm = $(st,'.txc-sn-fr'), vp = $(st,'.txc-sn-vp'), tr = $(st,'.txc-sn-tr'), cap = $(st,'.txc-sn-cap'), rl = $(st,'.txc-sn-rail'), tt = $(st,'.txc-sn-tt'), pl = $(st,'.txc-sn-pl'), sr = $(st,'.txc-sr');
    const D = ['lake','ridge','forest','meadow','canyon','dunes','coast','field'], n = D.length;
    const sl = D.map((nm, i) => { const el = slide(mk('div','txc-sn-sl'), i, n, CAP[nm]); el.id = `txc-sync-p${i}`; el.setAttribute('role', 'tabpanel'); const im = photo(q, nm, 1.5); el.appendChild(im); tr.appendChild(el);
      const b = mk('button','txc-sn-tb'); Object.assign(b, { type:'button', tabIndex:i ? -1 : 0 }); b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', el.id); b.setAttribute('aria-label', `Photo ${i + 1}: ${CAP[nm]}`); const ti = photo(q, nm, 1.5, 0, ''); b.appendChild(ti); tt.appendChild(b); b.onclick = () => r.go(i);
      return { el, im, b, ti }; });
    let fw = 600, fh = 400, tw = 72, th = 48, g = 8, off = 0, max = 0, Ls = [], Rs = [];
    const r = rail({ snaps:() => D.map((_, i) => i*(fw + 12)), change:i => { sl.forEach((s, k) => { s.b.setAttribute('aria-selected', k === i); s.b.tabIndex = k === i ? 0 : -1; hide(s.el, k !== i); });
      $(cap,'b').textContent = CAP[D[i]]; $(cap,'span').textContent = `${i + 1} of ${n}`; say(sr, `Photo ${i + 1} of ${n}: ${CAP[D[i]]}`); if (!t2.held) t2.settle(t2.pos(), 0, clamp(Ls[i] + tw/2 - fw/2, 0, max)); } });
    const t2 = rail({ snaps:() => [0, max], k:.3, release:(p, v) => { t2.settle(p, v, clamp(p + v*.3, 0, max)); return true; } });
    onSize(st, (W, H) => { const P = W < 560 ? 16 : 24; root.style.setProperty('--p', P + 'px'); tw = W < 560 ? 60 : 72; th = Math.round(tw/1.5); g = W < 560 ? 6 : 8;
      const ar = W < 560 ? .9 : 1.5; fw = Math.round(Math.min(W - 2*P, (H - 196)*ar, 760)); fh = Math.round(fw/ar); const fx = (W - fw)/2, fy = 68 + Math.max(0, (H - 68 - 16 - fh - 34 - th - 8 - 4)/2);
      Object.assign(frm.style, { left:fx + 'px', top:fy + 'px', width:fw + 'px', height:fh + 'px' }); Object.assign(cap.style, { left:fx + 'px', width:fw + 'px', top:(fy + fh + 10) + 'px' });
      Object.assign(rl.style, { left:(fx - 4) + 'px', width:(fw + 8) + 'px', top:(fy + fh + 40) + 'px', height:(th + 8) + 'px' });
      const cw = n*(tw + g) - g; off = cw < fw ? (fw - cw)/2 + 4 : 4; max = Math.max(0, cw + 8 - (fw + 8));
      Ls = sl.map((_, i) => off + i*(tw + g)); Rs = Ls.map(v => v + tw); pl.style.height = (th + 8) + 'px'; tt.style.width = (cw + 8) + 'px';
      sl.forEach((s, i) => { s.el.style.width = fw + 'px'; s.el.style.transform = tx(i*(fw + 12)); Object.assign(s.b.style, { left:Ls[i] + 'px', width:tw + 'px', height:th + 'px' }); need(s.im, fw); need(s.ti, tw); });
      r.sync(); r.go(r.i); t2.T.jump(clamp(Ls[r.i] + tw/2 - fw/2, 0, max)); });
    bindRail(vp, r); keysRail(vp, r); r.wheelOn(vp); bindRail(rl, t2); t2.wheelOn(rl);
    tt.addEventListener('keydown', e => { const k = e.key, i = r.i; let j = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? n - 1 : null; if (j === null) return; e.preventDefault(); j = clamp(j, 0, n - 1); r.go(j); sl[j].b.focus({ preventScroll:true }); });
    rl.addEventListener('scroll', () => { rl.scrollLeft = 0; });
    return t => { pump(q, t); r.tick(); t2.tick(); const p = r.pos(t), s = fw + 12, x2 = t2.pos(t); put(tr, 'transform', tx(-p)); put(tt, 'transform', tx(-x2));
      const [a, b] = stretch(p/s, Ls, Rs); put(pl, 'transform', tx(a - 4)); put(pl, 'width', px(b - a + 8));
      sl.forEach((v, i) => put(v.b, 'opacity', (.5 + .5*Math.max(0, 1 - Math.abs(p/s - i))).toFixed(3))); };
  }});

/* ---------- 7. Infinite loop ---------- */
atom({ id:'txc-loop', cat:'Carousels', name:'Infinite loop', block:'carousel (testimonial, logo), slideshow', fam:['D','T'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-hd"><div><div class="txc-t">Postcards from the coast road</div><div class="txc-m">Keeps going past the last card</div></div></div><div class="txc-vp txc-lp-vp" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Postcards from the coast road"></div><div class="txc-ft"><div class="txc-dots txc-lp-dots" aria-hidden="true"></div><span class="txc-m txc-n txc-lp-ct txc-wide" aria-hidden="true"></span><span style="flex:1"></span><button type="button" class="txc-lp-pp"></button>${nb('l','Previous postcard')}${nb('r','Next postcard')}</div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'Each slide is placed modulo the loop length from one unbounded position, so the track never resets, velocity carries across the seam and a flick can be caught anywhere. Across the seam the dot indicator drains out of the last slot while it fills the first, so it never jumps back across the row. Autoplay steps every four seconds and holds while hovered or focused. Inspired by Embla’s slide looper; changed: placement is computed per slide, never by cloning or teleporting the track. Use when a set has no natural end, such as postcards, testimonials or logos.',
  api:'rel = ((i·step − x) mod L + 1.5L) mod L − L/2;  seam: dot[n−1] drains as dot[0] fills',
  init(st){
    const q = [], root = $(st,'.txc-root'), vp = $(st,'.txc-lp-vp'), dots = $(st,'.txc-lp-dots'), ct = $(st,'.txc-lp-ct'), ppb = $(st,'.txc-lp-pp'), [bl, br] = $$(st,'.txc-nb'), sr = $(st,'.txc-sr');
    const D = ['coast','harbor','dunes','city','canyon','field','meadow','lake'], n = D.length;
    const sl = D.map((nm, i) => { const el = slide(mk('div','txc-lp-sl'), i, n, CAP[nm]), fr = mk('div','txc-fr'), im = photo(q, nm, .85), fc = mk('div', '', '<figcaption><b></b><span class="txc-n"></span></figcaption>');
      fc.querySelector('b').textContent = CAP[nm]; fc.querySelector('span').textContent = `No. ${i + 1}`; fr.appendChild(im); el.append(fr, fc.firstChild); vp.appendChild(el); return { el, fr, im }; });
    D.forEach(() => dots.appendChild(mk('b'))); const i1 = mk('i'), i2 = mk('i'); dots.append(i1, i2);
    let W = 0, w = 260, step = 278, top = 0, auto = !REDUCE, last = now(), hov = false, foc = false;
    const r = rail({ loop:true, count:() => n, step:() => step, change:i => { last = now(); say(ct, `${i + 1} of ${n}`); if (!auto) say(sr, `Postcard ${i + 1} of ${n}: ${CAP[D[i]]}`); } });
    const ui = () => { ppb.innerHTML = auto ? `${ic('<path d="M9 6v12M15 6v12"/>', 14, 2.4)}<span class="txc-wide">Pause</span>` : `${ic('<path d="M8 5.5v13l10-6.5z" fill="currentColor"/>', 14, 1.6)}<span class="txc-wide">Play</span>`; ppb.setAttribute('aria-label', auto ? 'Pause autoplay' : 'Start autoplay'); sr.setAttribute('aria-live', auto ? 'off' : 'polite'); };
    ppb.onclick = () => { auto = !auto; last = now(); ui(); }; ui();
    onSize(st, (wd, H) => { W = wd; root.classList.toggle('txc-narrow', W < 560); root.style.setProperty('--p', (W < 560 ? 16 : 24) + 'px'); w = W < 560 ? Math.round(W*.7) : W < 900 ? 250 : 288; const h = Math.round(w*1.18); step = w + 18;
      const vh = H - 70 - 64; top = Math.max(0, (vh - h - 32)/2); vp.style.top = '70px'; vp.style.height = vh + 'px'; sl.forEach(s => { s.el.style.width = w + 'px'; s.fr.style.height = h + 'px'; need(s.im, w); }); r.sync(); r.go(r.i); });
    bindRail(vp, r); keysRail(vp, r); r.wheelOn(vp);
    bl.onclick = () => r.step(-1); br.onclick = () => r.step(1);
    root.addEventListener('pointerenter', () => hov = true); root.addEventListener('pointerleave', () => { hov = false; last = now(); });
    root.addEventListener('focusin', () => foc = true); root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)){ foc = false; last = now(); } });
    return t => { pump(q, t); r.tick(); if (auto && !hov && !foc && !r.held && t - last > 4) r.step(1);
      const p = r.pos(t), Lp = n*step;
      sl.forEach((s, i) => { const rel = (((i*step - p) % Lp) + Lp*1.5) % Lp - Lp/2, vis = Math.abs(rel) < W/2 + w; put(s.el, 'visibility', vis ? 'visible' : 'hidden'); if (vis) put(s.el, 'transform', tx(W/2 - w/2 + rel, top)); hide(s.el, Math.abs(rel) > W/2); });
      const m = (((p/step) % n) + n) % n, L1 = (n - 1)*18;
      if (m <= n - 1){ put(i1, 'transform', tx(m*18)); put(i1, 'width', '8px'); put(i2, 'width', '0px'); }
      else { const f = m - (n - 1); put(i1, 'transform', tx(L1 + 8*f)); put(i1, 'width', px(8*(1 - f))); put(i2, 'transform', tx(0)); put(i2, 'width', px(8*f)); } };
  }});

/* ---------- 8. Peek and pull (phone shelf) ---------- */
const TRAILS = [['Mirror Lake loop','lake','4.2 mi · Moderate · 2 h 10 min','4.8 (312)'],['Castle Peak saddle','ridge','6.1 mi · Hard · 3 h 40 min','4.9 (208)'],['Donner rim','canyon','3.4 mi · Easy · 1 h 30 min','4.6 (541)'],['Spruce creek','forest','5.0 mi · Moderate · 2 h 35 min','4.7 (129)'],['Sagehen meadow','meadow','2.6 mi · Easy · 1 h 05 min','4.5 (96)'],['Tahoe shore path','coast','7.3 mi · Easy · 2 h 50 min','4.8 (733)']];
const MORE = [['Frog Lake overlook','3.8 mi'],['Summit Lake','4.4 mi'],['Loch Leven lakes','7.6 mi'],['Pole Creek','5.2 mi'],['Coldstream canyon','6.9 mi'],['Page Meadows','3.1 mi']];
atom({ id:'txc-peek', cat:'Carousels', name:'Peek and pull shelf', block:'carousel (shelf), mobile list', fam:['D','X'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-pk-ph"><div class="txc-pk-bar"><div><div class="txc-pk-h">Nearby trails</div><div class="txc-m">Within 20 miles of Truckee</div></div><button type="button" class="txc-pk-all" aria-haspopup="dialog">See all</button></div>
    <div class="txc-vp txc-pk-vp" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Nearby trails"><div class="txc-tr txc-pk-tr"></div><div class="txc-pk-pull" aria-hidden="true"><svg width="36" height="36" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="none" stroke="var(--line)" stroke-width="2"/><circle class="txc-pk-rg" cx="22" cy="22" r="20" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 22 22)"/><path d="M15 22h14M23 16l6 6-6 6" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="txc-pk-lbl"><span>See all 12</span><span>Release</span></div></div></div>
    <div class="txc-pk-sec"><h4>Saved routes</h4><div class="txc-pk-row"><i>${ic(I.lib, 16)}</i><div><b>Sunrise on Castle Peak</b><span class="txc-m">Saved Tuesday · 6.1 mi</span></div></div><div class="txc-pk-row"><i>${ic(I.user, 16)}</i><div><b>Lakes loop with Ada</b><span class="txc-m">Shared with you · 9.4 mi</span></div></div><div class="txc-pk-row"><i>${ic(I.file, 16)}</i><div><b>Snowshoe, Sagehen</b><span class="txc-m">Winter route · 2.6 mi</span></div></div></div>
    <div class="txc-pk-scrim"></div><div class="txc-pk-sh" role="dialog" aria-modal="true" aria-label="All trails near Truckee"><header><b>All 12 trails</b><button type="button" class="btn txc-pk-dn">Done</button></header><ul class="txc-pk-ls">${TRAILS.map(x => `<li><span>${x[0]}</span><span class="txc-m">${x[2].split(' · ')[0]}</span></li>`).join('')}${MORE.map(x => `<li><span>${x[0]}</span><span class="txc-m">${x[1]}</span></li>`).join('')}</ul></div></div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'Cards align to the left margin and the next one peeks in, so a phone screen always shows there is more. Dragging past the last card rubber-bands into a ring that fills with the stretch; past the mark the label swaps to Release, and letting go opens the full list as a sheet while the shelf settles back. Inspired by the App Store and Airbnb shelves; changed: the “see all” target lives inside the overscroll instead of a separate button. Use when a horizontal shelf sits inside a vertically scrolling phone screen.',
  api:'pull = band(x) − max;  ring = pull/52;  release: pull > 52 → sheet.set(1); x.release(x, v, max)',
  init(st){
    const q = [], ph = $(st,'.txc-pk-ph'), vp = $(st,'.txc-pk-vp'), tr = $(st,'.txc-pk-tr'), pull = $(st,'.txc-pk-pull'), rg = $(st,'.txc-pk-rg'), lbs = $$(st,'.txc-pk-lbl span'), sec = $(st,'.txc-pk-sec'), scrim = $(st,'.txc-pk-scrim'), sh = $(st,'.txc-pk-sh'), dn = $(st,'.txc-pk-dn'), all = $(st,'.txc-pk-all'), sr = $(st,'.txc-sr');
    const n = TRAILS.length;
    const cs = TRAILS.map(([nm, sc, meta, rt], i) => { const el = slide(mk('div','txc-pk-c'), i, n, nm), fr = mk('div','txc-fr'), im = photo(q, sc, 1.5, 0, ''), b = mk('b'), m = mk('span','txc-m'), r2 = mk('span','txc-m txc-n');
      b.textContent = nm; m.textContent = meta; r2.textContent = `★ ${rt}`; r2.setAttribute('aria-label', `Rated ${rt.replace(' (', ' from ').replace(')', ' reviews')}`); fr.appendChild(im); el.append(fr, b, m, r2); tr.appendChild(el); return { el, fr, im, x:0 }; });
    let cw = 360, cdw = 280, g = 10, snaps = [0], max = 0, opener = null, shH = 400; const sw = new Swap(0), shT = new Track(0);
    const r = rail({ snaps:() => snaps, rbd:110, change:i => { say(sr, `Trail ${i + 1} of ${n}: ${TRAILS[i][0]}`); cs.forEach((c, k) => hide(c.el, c.x + cdw < snaps[i] || c.x > snaps[i] + cw)); },
      release:p => { if (p - max > 52) open(vp); return false; } });
    const open = from => { opener = from; shT.set(1, S.base); sh.style.visibility = 'visible'; dn.focus({ preventScroll:true }); say(sr, 'All 12 trails, list opened'); };
    const close = () => { shT.set(0, S.snap); (opener || all).focus({ preventScroll:true }); };
    all.onclick = () => open(all); dn.onclick = close; scrim.onclick = close;
    sh.addEventListener('keydown', e => { if (e.key === 'Escape'){ e.preventDefault(); close(); } if (e.key === 'Tab'){ e.preventDefault(); dn.focus(); } });
    onSize(st, (W, H) => { cw = Math.min(W - 32, 390); const chh = H - 32; Object.assign(ph.style, { width:cw + 'px', height:chh + 'px', left:((W - cw)/2) + 'px', top:'16px' });
      cdw = Math.round((cw - 16)*.8); const phh = Math.round(cdw/1.5), cardH = phh + 70; let x = 16;
      cs.forEach(c => { c.x = x; c.el.style.left = x + 'px'; c.el.style.width = cdw + 'px'; c.fr.style.height = phh + 'px'; need(c.im, cdw); x += cdw + g; });
      const right = x - g + 16; max = Math.max(0, right - cw); snaps = cs.map(c => Math.min(c.x - 16, max)); pull.style.top = (phh/2 - 30) + 'px'; vp.style.top = '84px'; vp.style.height = cardH + 'px';
      sec.style.top = (84 + cardH + 18) + 'px'; shH = Math.round(chh*.78); sh.style.height = shH + 'px'; r.sync(); r.go(r.i); });
    bindRail(vp, r); keysRail(vp, r); r.wheelOn(vp);
    return t => { pump(q, t); r.tick(); const p = r.pos(t); put(tr, 'transform', tx(-p));
      const pl = Math.max(0, p - max), k = clamp(pl/52); put(rg, 'strokeDashoffset', (1 - k).toFixed(4)); put(pull, 'opacity', clamp((pl - 6)/22).toFixed(3)); put(pull, 'transform', tx(cw - (pl + 16)/2 - 36));
      sw.to(k >= 1 && r.held ? 1 : 0, t); lbs.forEach((l, i) => sw.apply(l, i, t, 4));
      const o = clamp(shT.at(t)); put(sh, 'transform', tx(0, (1 - o)*(shH + 8))); put(sh, 'visibility', o < .01 && shT.target === 0 ? 'hidden' : 'visible'); put(scrim, 'opacity', (o*.32).toFixed(3)); put(scrim, 'visibility', o < .01 ? 'hidden' : 'visible'); };
  }});

/* ---------- 9. Before and after lens ---------- */
const SCN = [['ridge','Ridge'],['harbor','Harbor'],['city','City'],['lake','Lake']];
atom({ id:'txc-compare', cat:'Carousels', name:'Before and after lens', block:'compare slider (before/after), image', fam:['D','M'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-cm-bar"><div class="txc-cm-seg" role="group" aria-label="Scene"><i class="txc-cm-ind"></i>${SCN.map((s, i) => `<button type="button" aria-pressed="${i === 0}">${s[1]}</button>`).join('')}</div><button type="button" class="txc-cm-mag" aria-pressed="false" aria-label="Magnify">${ic(I.search, 15)}<span class="txc-wide" aria-hidden="true">Magnify</span></button></div>
    <div class="txc-cm-wrap"><div class="txc-cm-fr"><div class="txc-cm-a"></div><div class="txc-cm-b"></div><span class="txc-chip txc-cm-lb txc-cm-l" aria-hidden="true">Midday</span><span class="txc-chip txc-cm-lb txc-cm-r" aria-hidden="true">Golden hour</span><i class="txc-cm-ln"></i></div>
    <div class="txc-cm-k" role="slider" tabindex="0" aria-label="Divider between midday and golden hour" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-describedby="txc-compare-help"><div class="txc-cm-lens"><div class="txc-cm-za"></div><div class="txc-cm-zb"></div><i class="txc-cm-zl"></i></div><span class="txc-cm-gr"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 7-5 5 5 5M15 7l5 5-5 5"/></svg></span></div></div>
    <p class="txc-cm-cap"><b></b><span class="txc-m">Drag the handle · hold to magnify</span></p><span id="txc-compare-help" class="txc-sr">Left and right arrows move the divider, Shift or Page keys move it faster, Home and End go to the edges. Enter toggles the magnifier.</span></div>`,
  desc:'The divider tracks the pointer exactly; a tap on the photo glides it to the tap and then tracks 1:1, and a fast release carries it a little further without overshoot. While held, the knob opens into a 2.25× lens centred on the seam, so both lights can be compared at the same pixel; on touch the lens floats above the finger. It is a real slider: arrows, Shift, Page keys, Home and End, and Enter or Magnify keep the lens open. Inspired by Juxtapose and the iOS text loupe. Use when two aligned images differ in detail, such as edits, relights, or before and after.',
  api:'x = held ? pointer + catch(t) : x.at(t);  lens: L = 40 + 108·open, zoom = 1 + 1.25·open;  after.clip = inset(0 0 0 x)',
  init(st){
    const q = [], root = $(st,'.txc-root'), seg = $(st,'.txc-cm-seg'), ind = $(st,'.txc-cm-ind'), sbs = $$(seg,'button'), mag = $(st,'.txc-cm-mag'), wrap = $(st,'.txc-cm-wrap'), fr = $(st,'.txc-cm-fr'), A = $(st,'.txc-cm-a'), B = $(st,'.txc-cm-b'), ln = $(st,'.txc-cm-ln'), lL = $(st,'.txc-cm-l'), lR = $(st,'.txc-cm-r');
    const kn = $(st,'.txc-cm-k'), lens = $(st,'.txc-cm-lens'), ZA = $(st,'.txc-cm-za'), ZB = $(st,'.txc-cm-zb'), zl = $(st,'.txc-cm-zl'), gr = $(st,'.txc-cm-gr'), capb = $(st,'.txc-cm-cap b');
    const X = new Track(.5, SET), Y = new Track(.5, SET), cx = new Track(0, S.base), cy = new Track(0, S.base), open = new Track(0, S.base), ie = edges(0, 0), sw = new Swap(0);
    let pressRT = 0, fw = 600, fh = 380, Lmax = 148, held = false, pf = .5, pyf = .5, lift = 0, rect = null, magOn = false, want = 0, lastV = -1;
    const scenes = SCN.map(([nm, label]) => { const lay = [A, B, ZA, ZB].map((par, j) => { const d = mk('div'), im = photo(q, nm, 1.6, j % 2, j < 2 ? (j ? `${CAP[nm]}, golden hour` : `${CAP[nm]}, midday`) : ''); d.appendChild(im); par.appendChild(d); return { d, im }; }); return { nm, label, lay, asked:false, ready:false }; });
    const ask = s => { if (s.asked) return; s.asked = true; s.lay.forEach(l => need(l.im, fw)); Promise.all(s.lay.slice(0, 2).map(l => new Promise(res => { const ok = () => res(); if (l.im.complete && l.im.src) ok(); else { l.im.addEventListener('load', ok, { once:true }); l.im.addEventListener('error', ok, { once:true }); } }))).then(() => { s.ready = true; if (scenes[want] === s) sw.to(want); }); };
    const pick = (i, inst) => { want = i; sbs.forEach((b, j) => b.setAttribute('aria-pressed', i === j)); const b = sbs[i]; ie[inst ? 'jump' : 'go'](b.offsetLeft, b.offsetLeft + b.offsetWidth); capb.textContent = CAP[SCN[i][0]]; const s = scenes[i]; ask(s); if (s.ready) sw.to(i); };
    sbs.forEach((b, i) => b.onclick = () => pick(i));
    const setMag = v => { magOn = v; mag.setAttribute('aria-pressed', v); open.set(v || held ? 1 : 0); };
    mag.onclick = () => setMag(!magOn);
    onSize(st, (W, H) => { const P = W < 560 ? 16 : 24; root.style.setProperty('--p', P + 'px'); root.classList.toggle('txc-narrow', W < 560); const ar = clamp((Math.min(W - 2*P, 980))/(H - 118), .66, 1.6);
      fw = Math.round(Math.min(W - 2*P, (H - 118)*ar, 980)); fh = Math.round(fw/ar); if (fh > H - 118){ fh = H - 118; fw = Math.round(fh*ar); } Lmax = W < 560 ? 116 : 148;
      const fx = (W - fw)/2; Object.assign(wrap.style, { left:fx + 'px', top:'60px', width:fw + 'px', height:fh + 'px' }); Object.assign($(st,'.txc-cm-cap').style, { top:(60 + fh + 12) + 'px', left:fx + 'px', right:'auto', width:fw + 'px' }); Object.assign($(st,'.txc-cm-bar').style, { left:fx + 'px', right:'auto', width:fw + 'px' });
      [ZA, ZB].forEach(z => { z.style.width = fw + 'px'; z.style.height = fh + 'px'; }); scenes.forEach(s => { s.lay.forEach(l => l.im._ar = ar); if (s.asked){ s.asked = false; ask(s); } });
      lL._w = lL.offsetWidth; lR._w = lR.offsetWidth; pick(want, true); });
    // pointer: frame glides to the tap then tracks 1:1; knob keeps its grab offset; touch lifts the lens above the finger
    const begin = (e, onKnob) => { rect = fr.getBoundingClientRect(); held = true; lift = e.pointerType === 'mouse' ? 0 : Math.min(Lmax*.62, 80)/fh; pf = (e.clientX - rect.left)/fw; pyf = (e.clientY - rect.top)/fh;
      // offsets start at the knob's current place, then glide: frame taps catch up to the pointer, touch lifts the lens above the finger
      const x0 = X.at(), y0 = Y.at(); cx.jump(x0 - pf); cy.jump(y0 - pyf); if (!onKnob) cx.set(0); if (!onKnob || lift) cy.set(-lift); pressRT = performance.now(); if (onKnob) open.set(1); };
    const mv = e => { pf = (e.clientX - rect.left)/fw; pyf = (e.clientY - rect.top)/fh; };
    const finish = vx => { if (!held) return; const t = now(), x0 = clamp(pf + cx.at(t)), y0 = clamp(pyf + cy.at(t), .06, .94); held = false; let v = Math.abs(vx) > 480 ? vx/fw : 0; const to = clamp(x0 + v*.06);
      X.release(x0, capv(x0, v, to, SET.w), to); Y.jump(y0); open.set(magOn ? 1 : 0); kn.setAttribute('aria-valuenow', Math.round(to*100)); };
    grab(fr, { th:3, press:e => { if (e.pointerType === 'mouse') begin(e, false); }, start:e => { if (!held) begin(e, false); open.set(1); }, move:(dx, dy, e) => mv(e),
      end:(vx, vy, moved, e, cancel) => { if (held){ finish(cancel ? 0 : vx); return; } if (!moved && !cancel){ rect = fr.getBoundingClientRect(); const to = clamp((e.clientX - rect.left)/fw); X.set(to); kn.setAttribute('aria-valuenow', Math.round(to*100)); } } });
    grab(kn, { th:0, press:e => begin(e, true), move:(dx, dy, e) => mv(e), end:vx => finish(vx) });
    kn.addEventListener('keydown', e => { const k = e.key, cur = X.target*100, big = e.shiftKey ? 10 : 1; let v = null;
      if (k === 'ArrowLeft' || k === 'ArrowDown') v = cur - big; else if (k === 'ArrowRight' || k === 'ArrowUp') v = cur + big; else if (k === 'PageDown') v = cur - 10; else if (k === 'PageUp') v = cur + 10; else if (k === 'Home') v = 0; else if (k === 'End') v = 100;
      else if (k === 'Enter' || k === ' '){ e.preventDefault(); setMag(!magOn); return; } else return; e.preventDefault(); v = clamp(Math.round(v), 0, 100); X.set(v/100); kn.setAttribute('aria-valuenow', v); });
    return t => { pump(q, t); if (held && performance.now() - pressRT > 180) open.set(1);
      const x = held ? clamp(pf + cx.at(t)) : X.at(t), y = held ? clamp(pyf + cy.at(t), .06, .94) : Y.at(t), xp = x*fw, yp = y*fh, o = clamp(open.at(t)), L = 40 + (Lmax - 40)*o, Z = 1 + 1.25*o, Li = L - 4;
      put(B, 'clipPath', `inset(0 0 0 ${xp.toFixed(2)}px)`); put(ln, 'transform', tx(xp));
      put(kn, 'width', px(L)); put(kn, 'height', px(L)); put(kn, 'transform', tx(xp - L/2, yp - L/2));
      const lt = `translate3d(${(Li/2 - xp*Z).toFixed(2)}px,${(Li/2 - yp*Z).toFixed(2)}px,0) scale(${Z.toFixed(4)})`; put(ZA, 'transform', lt); put(ZB, 'transform', lt); put(ZB, 'clipPath', `inset(0 0 0 ${xp.toFixed(2)}px)`); put(zl, 'transform', tx(Li/2 - 1));
      put(lens, 'opacity', ss(0, .3, o).toFixed(3)); put(gr, 'opacity', (1 - ss(0, .3, o)).toFixed(3));
      put(lL, 'opacity', clamp((xp - 12 - (lL._w || 60) - 8)/36).toFixed(3)); put(lR, 'opacity', clamp((fw - xp - 12 - (lR._w || 90) - 8)/36).toFixed(3));
      const a = ie.A.at(t), b = ie.B.at(t); put(ind, 'transform', tx(a)); put(ind, 'width', px(b - a));
      scenes.forEach((s, i) => { let so = 0; if (i === sw.cur) so = clamp(prog(t, sw.t + EXIT)); else if (i === sw.prev){ const u = clamp((t - sw.t)/EXIT); so = 1 - u*u; } s.lay.forEach(l => { put(l.d, 'opacity', so.toFixed(3)); put(l.d, 'visibility', so < .01 ? 'hidden' : 'visible'); }); });
      const v = Math.round(x*100); if (v !== lastV){ lastV = v; kn.setAttribute('aria-valuenow', v); kn.setAttribute('aria-valuetext', `${v}% midday, ${100 - v}% golden hour`); } };
  }});

/* ---------- 10. Vertical reel ---------- */
const REELS = [['canyon','Canyon rim at seven','@northline · 0:24'],['forest','Creek crossing in the spruce stand','@northline · 0:18'],['city','Trailhead town at dawn','@ada.walks · 0:31'],['coast','Coast road, mile 38','@northline · 0:22'],['meadow','Lupine season on the high meadow','@sam.outside · 0:15']];
const REELS2 = [['ridge','The saddle at half past eleven','@northline · 0:27'],['harbor','Low tide at Bodega','@ada.walks · 0:19'],['field','Late summer field','@sam.outside · 0:12'],['dunes','Dunes after wind','@northline · 0:33']];
atom({ id:'txc-reel', cat:'Carousels', name:'Vertical reel', block:'carousel (vertical, video feed), mobile', fam:['D','X'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-rl-col" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Trail reels. Up and down arrows move between reels."><div class="txc-tr txc-rl-tr"></div><div class="txc-rl-more" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2"/><circle class="txc-rl-rg" cx="22" cy="22" r="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 22 22)"/><path d="M22 29V15M16 21l6-6 6 6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="txc-rl-lbl"><span>Pull up for the next four</span><span>Release to load them</span><span>That’s everything for today</span></div></div></div><div class="txc-rl-nav">${nb('u','Previous reel')}${nb('d','Next reel')}</div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'Vertical drag is 1:1 and a flick moves at most one reel, like Reels and Shorts; captions trail their photo slightly so the move reads as depth. Pulling up past the last reel fills a ring; released past the mark, the next four are appended and the same release velocity carries straight into the first of them. The arrow keys and buttons do the same, including loading the next set. Use when each item fills a phone screen and people move through them one at a time.',
  api:'i = clamp(nearest(y + v·0.2), i₀ ± 1);  pull > 60 → append(4), y.release(y, v, (n₀)·h)',
  init(st){
    const q = [], col = $(st,'.txc-rl-col'), tr = $(st,'.txc-rl-tr'), more = $(st,'.txc-rl-more'), rg = $(st,'.txc-rl-rg'), lbs = $$(st,'.txc-rl-lbl span'), nav = $(st,'.txc-rl-nav'), [bu, bd] = $$(st,'.txc-nb'), sr = $(st,'.txc-sr');
    const its = [], sw = new Swap(0); let cw = 300, ch = 530, loaded = false;
    const add = (list, j0) => list.forEach(([nm, title, meta], j) => { const i = j0 + j, el = mk('div','txc-rl-it'), im = photo(q, nm, 9/16, 0, title), ov = mk('div','txc-rl-ov','<b></b><span></span>'), act = mk('div','txc-rl-act', `<button type="button" aria-pressed="false" aria-label="Save reel">${ic('<path d="M6 4h12v17l-6-4-6 4z"/>', 18)}</button><span>Save</span>`);
      ov.firstChild.textContent = title; ov.lastChild.textContent = meta; el.append(im, ov, act); tr.appendChild(el); const b = act.firstChild; b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
      its.push({ el, im, ov, title }); need(im, cw); el.style.height = ch + 'px'; el.style.transform = tx(0, i*ch); });
    const lab = () => its.forEach((it, i) => slide(it.el, i, its.length, it.title));
    add(REELS, 0); lab();
    const r = rail({ snaps:() => its.map((_, i) => i*ch), maxStep:1, rbd:120, change:i => { say(sr, `Reel ${i + 1} of ${its.length}: ${its[i].title}`); dis(bu, i === 0); dis(bd, i === its.length - 1 && loaded); its.forEach((it, k) => hide(it.el, k !== i)); },
      release:(p, v) => { if (!loaded && p - r.hi() > 60){ loadMore(v, p); return true; } return false; } });
    const loadMore = (v = 0, from) => { const n0 = its.length; loaded = true; add(REELS2, n0); lab(); r.go(n0, v, from); };
    onSize(st, (W, H) => { ch = Math.min(H - 32, 640); cw = Math.round(ch*9/16); if (cw > W - 32){ cw = W - 32; ch = Math.round(cw*16/9); }
      const L = (W - cw)/2, T = (H - ch)/2; Object.assign(col.style, { left:L + 'px', top:T + 'px', width:cw + 'px', height:ch + 'px' });
      const out = W - (L + cw) >= 64; nav.classList.toggle('txc-in', !out); Object.assign(nav.style, out ? { left:(L + cw + 16) + 'px', top:(T + ch/2 - 40) + 'px' } : { left:(L + cw - 46) + 'px', top:(T + 10) + 'px' });
      its.forEach((it, i) => { it.el.style.height = ch + 'px'; it.el.style.transform = tx(0, i*ch); need(it.im, cw); }); r.sync(); r.go(r.i); });
    bindRail(col, r, 'y'); keysRail(col, r, 'y', () => { if (r.i === its.length - 1 && !loaded){ loadMore(); return true; } return false; });
    bu.onclick = () => r.step(-1); bd.onclick = () => { if (r.i === its.length - 1 && !loaded) loadMore(); else r.step(1); };
    return t => { pump(q, t); const p = r.pos(t); put(tr, 'transform', tx(0, -p));
      its.forEach((it, i) => { const d = (i*ch - p)/ch; if (Math.abs(d) > 1.5) return; put(it.ov, 'transform', tx(0, d*36)); put(it.ov, 'opacity', clamp(1 - Math.abs(d)*1.2).toFixed(3)); });
      const pl = Math.max(0, p - r.hi()), k = clamp(pl/60); put(more, 'transform', tx(0, ch - pl/2 - 30)); put(more, 'opacity', clamp((pl - 6)/22).toFixed(3)); put(rg, 'strokeDashoffset', (loaded ? 1 : 1 - k).toFixed(4)); sw.to(loaded ? 2 : k >= 1 && r.held ? 1 : 0, t); lbs.forEach((l, i) => sw.apply(l, i, t, 4)); };
  }});

/* ---------- 11. Masonry row carousel ---------- */
atom({ id:'txc-mason', cat:'Carousels', name:'Masonry row carousel', block:'gallery (masonry), media picker', fam:['D','M'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-hd"><div><div class="txc-t">Pick photos for the album</div><div class="txc-m">Every photo at its own shape</div></div><div class="txc-ms-sel"><span class="txc-m txc-n txc-ms-ct">None selected</span><button type="button" class="txc-ms-clr" hidden>Clear</button></div></div><div class="txc-vp txc-ms-vp" role="region" aria-roledescription="carousel" aria-label="Album candidates"><div class="txc-tr txc-ms-tr"></div></div><div class="txc-ft"><span class="txc-m txc-wide">Tab through photos · Enter selects</span><span style="flex:1"></span>${nb('l','Previous page')}${nb('r','Next page')}</div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'Photos keep their exact aspect ratios: tall ones span both rows and wide ones pair up in a column whose width makes both fit exactly. The rail free-scrolls with momentum and snaps to column edges; selecting shrinks the photo inside its frame and fills the check. Tab walks every photo and the rail follows focus. Inspired by Google Photos’ justified grid; changed: packed by column so it scrolls sideways. Use when portrait and landscape photos must be picked quickly without cropping them.',
  api:'pair w = (H − g)/(1/a₁ + 1/a₂);  tall w = H·a;  target = nearest column(x + v·0.4)',
  init(st){
    const q = [], root = $(st,'.txc-root'), vp = $(st,'.txc-ms-vp'), tr = $(st,'.txc-ms-tr'), ct = $(st,'.txc-ms-ct'), clr = $(st,'.txc-ms-clr'), [bl, br] = $$(st,'.txc-nb'), sr = $(st,'.txc-sr');
    const D = [['ridge',1.5,0],['portrait',.75,0],['lake',1.5,0],['city',1.33,0],['canyon',.67,0],['coast',1.78,0],['field',1.5,0],['studio',1,0],['forest',.8,0],['harbor',1.5,1],['dunes',1.33,0],['meadow',.67,1],['ridge',1.78,1],['lake',1.5,1]];
    const its = D.map(([nm, ar, tod], i) => { const cap = CAP[nm] + (tod ? ', golden hour' : ''), b = mk('button','txc-ms-it'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', cap);
      const inn = mk('span','txc-ms-in'), im = photo(q, nm, ar, tod, ''), ck = mk('span','txc-ms-ck', ic(I.check, 12, 3)), cp = mk('span','txc-chip txc-ms-cp'); cp.textContent = cap; inn.appendChild(im); b.append(inn, ck, cp); tr.appendChild(b);
      const it = { b, inn, im, ck, cp, ar, cap, sel:new Track(0, S.base), hv:new Track(0, S.base), on:false, x:0, w:0, i }; b.onclick = () => { it.on = !it.on; b.setAttribute('aria-pressed', it.on); it.sel.set(it.on ? 1 : 0); count(); };
      b.addEventListener('pointerenter', () => it.hv.set(1)); b.addEventListener('pointerleave', () => it.hv.set(0)); b.addEventListener('focus', () => { it.hv.set(1); follow(it); }); b.addEventListener('blur', () => it.hv.set(0)); return it; });
    const count = () => { const n = its.filter(x => x.on).length; ct.textContent = n ? `${n} selected` : 'None selected'; clr.hidden = !n; say(sr, n ? `${n} selected` : 'Selection cleared'); };
    clr.onclick = () => { its.forEach(x => { x.on = false; x.b.setAttribute('aria-pressed', 'false'); x.sel.set(0); }); count(); };
    let W = 0, P = 24, snaps = [0], cols = [];
    const r = rail({ snaps:() => snaps, k:.4, change:i => { dis(bl, i === 0); dis(br, i === snaps.length - 1); } });
    const follow = it => { const p = r.T.target; if (it.x < p + P - 1) r.go(r.near(it.x - P)); else if (it.x + it.w > p + W - P + 1){ const need2 = it.x + it.w - W + P; let k = snaps.findIndex(v => v >= need2 - 1); r.go(k < 0 ? snaps.length - 1 : k); } };
    onSize(st, (wd, H) => { W = wd; P = W < 560 ? 16 : 24; root.style.setProperty('--p', P + 'px'); const g = 8, Ha = Math.round(Math.min(H - 70 - 66, W < 560 ? W : W*.56)); root.classList.toggle('txc-narrow', W < 560);
      const qu = its.slice(); cols = []; while (qu.length){ const a = qu.shift(); if (a.ar < .95){ cols.push([a]); continue; } const j = qu.findIndex(b => b.ar >= .95); cols.push(j < 0 ? [a] : [a, qu.splice(j, 1)[0]]); }
      let x = P; cols.forEach(c => { if (c.length === 1){ const it = c[0], w = Math.round(Math.min(Ha*it.ar, W - 2*P)); Object.assign(it.b.style, { left:x + 'px', top:'0px', width:w + 'px', height:Ha + 'px' }); it.x = x; it.w = w; need(it.im, w); c.x = x; x += w + g; }
        else { const w = Math.round((Ha - g)/(1/c[0].ar + 1/c[1].ar)), h1 = Math.round(w/c[0].ar); Object.assign(c[0].b.style, { left:x + 'px', top:'0px', width:w + 'px', height:h1 + 'px' }); Object.assign(c[1].b.style, { left:x + 'px', top:(h1 + g) + 'px', width:w + 'px', height:(Ha - h1 - g) + 'px' });
          c.forEach(it => { it.x = x; it.w = w; need(it.im, w); }); c.x = x; x += w + g; } });
      const max = Math.max(0, x - g + P - W); snaps = []; cols.forEach(c => { const v = Math.min(c.x - P, max); if (!snaps.length || v - snaps[snaps.length - 1] > 1) snaps.push(v); });
      vp.style.top = (70 + Math.max(0, (H - 70 - 66 - Ha)/2)) + 'px'; vp.style.height = Ha + 'px'; r.sync(); r.go(r.i); });
    bindRail(vp, r); r.wheelOn(vp);
    bl.onclick = () => r.go(r.near(r.T.target - (W - 2*P)*.9)); br.onclick = () => r.go(r.near(r.T.target + (W - 2*P)*.9));
    return t => { pump(q, t); r.tick(); put(tr, 'transform', tx(-r.pos(t)));
      its.forEach(it => { const s = clamp(it.sel.at(t)), h = clamp(it.hv.at(t)), sh = Math.max(s, h); put(it.inn, 'transform', `scale(${(1 - .08*s).toFixed(4)})`); put(it.ck, 'opacity', sh.toFixed(3));
        put(it.ck, 'background', s > .5 ? 'var(--ink)' : 'rgba(12,16,22,.25)'); put(it.ck, 'borderColor', s > .5 ? 'var(--ink)' : '#fff'); put(it.ck, 'color', s > .5 ? 'var(--card)' : '#fff'); put(it.ck.firstChild, 'opacity', s.toFixed(3)); put(it.cp, 'opacity', h.toFixed(3)); }); };
  }});

/* ---------- 12. Route-linked carousel (original) ---------- */
const STOPS = [['Trailhead','field',0,400,'Fill water at the ranger kiosk; the lot is full by seven on weekends.'],['Spruce stand','forest',1.2,445,'Cool and quiet. The creek crossing has good stepping stones.'],['Mirror Lake','lake',2.4,530,'Flat water before nine; the best reflection is from the east shore.'],['Ridge saddle','ridge',3.9,690,'The steepest pitch of the day: 900 feet in a mile and a half.'],['High meadow','meadow',5.1,825,'Lupine through July. Stay on the boardwalk across the wet section.'],['Canyon rim','canyon',6.6,980,'The wall turns orange about an hour before sunset.'],['Back at the lot','field',8.2,1090,'8.2 miles and 2,140 feet of climbing, door to door.']];
const hm = m => { const h = Math.floor(m/60), mm = Math.floor(m % 60); return `${(h + 11) % 12 + 1}:${String(mm).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
atom({ id:'txc-route', cat:'Carousels', name:'Route-linked carousel', block:'carousel (itinerary, tour), map', fam:['D','E','T'], wide:true, tall:true,
  html:`<div class="txc-root"><div class="txc-hd"><div><div class="txc-t">Mirror Lake loop, one day</div><div class="txc-m">8.2 miles, seven stops</div></div></div><div class="txc-rt-map" tabindex="0" role="slider" aria-label="Position on the route" aria-valuemin="1" aria-valuemax="7" aria-valuenow="1"><svg aria-hidden="true"></svg><div class="txc-rt-ro" aria-hidden="true"><b class="txc-rt-tm">6:40 am</b><span class="txc-m txc-n txc-rt-mi">Mile 0.0 of 8.2</span></div></div><div class="txc-vp txc-rt-vp" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Stops on the Mirror Lake loop"><div class="txc-tr txc-rt-tr"></div></div><div class="txc-ft txc-rt-ft">${nb('l','Previous stop')}${nb('r','Next stop')}<span class="txc-m txc-n txc-rt-ct" aria-hidden="true"></span></div><div class="txc-sr" aria-live="polite" aria-atomic="true"></div></div>`,
  desc:'The carousel position is the hiker’s place on the trail: the marker, the inked part of the route, the clock and the mile counter are all computed from the same scroll value, and each stop’s photo is lit for its hour, warming from midday to golden hour. Dragging the marker along the map scrubs the carousel, and arrow keys step stop to stop on either one. Inspired by Strava route replays and Apple Maps guides; changed: the map is a second handle on one rail, not a separate view. Use when slides happen in a place or in sequence and showing where you are matters, such as itineraries, tours or timelines.',
  api:'p = x/step;  marker = path[k].at(f·len);  dashoffset[k] = len·(1 − clamp(p − k));  clock = lerp(time[k], time[k+1], f)',
  init(st){
    const q = [], root = $(st,'.txc-root'), map = $(st,'.txc-rt-map'), svg = $(st,'.txc-rt-map svg'), tm = $(st,'.txc-rt-tm'), mi = $(st,'.txc-rt-mi'), vp = $(st,'.txc-rt-vp'), tr = $(st,'.txc-rt-tr'), ft = $(st,'.txc-rt-ft'), ct = $(st,'.txc-rt-ct'), [bl, br] = $$(st,'.txc-nb'), sr = $(st,'.txc-sr');
    const n = STOPS.length, NS = 'http://www.w3.org/2000/svg';
    const sl = STOPS.map(([nm, sc, mile, mins, note], i) => { const el = slide(mk('div','txc-rt-sl'), i, n, nm), fr = mk('div','txc-fr'), im = photo(q, sc, 1.5, i/(n - 1), `${nm} at ${hm(mins)}`), b = mk('b'), m = mk('span','txc-m txc-n'), p = mk('p');
      b.textContent = nm; m.textContent = `Mile ${mile.toFixed(1)} · ${hm(mins)}`; p.textContent = note; fr.appendChild(im); el.append(fr, b, m, p); tr.appendChild(el); return { el, fr, im }; });
    let sw2 = 400, step = 420, segs = [], marker = null, dots = [], lastRo = '';
    const r = rail({ snaps:() => STOPS.map((_, i) => i*step), change:i => { const s = STOPS[i]; say(ct, `Stop ${i + 1} of ${n}`); say(sr, `Stop ${i + 1} of ${n}: ${s[0]}, mile ${s[2].toFixed(1)}, ${hm(s[3])}`); dis(bl, i === 0); dis(br, i === n - 1);
      map.setAttribute('aria-valuenow', i + 1); map.setAttribute('aria-valuetext', `Stop ${i + 1} of ${n}: ${s[0]}, mile ${s[2].toFixed(1)}`); sl.forEach((v, k) => hide(v.el, k !== i)); } });
    const el = (tag, at) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); return e; };
    const drawMap = (mw, mh) => { svg.innerHTML = ''; svg.setAttribute('viewBox', `0 0 ${mw} ${mh}`); const portrait = mh > mw*1.1, pad = 22;
      const N0 = [[.28,.88],[.16,.68],[.40,.56],[.24,.33],[.52,.15],[.82,.36],[.48,.86]], N = portrait ? N0 : N0.map(([x, y]) => [1 - y, x]);
      const top = portrait ? 62 : 8, left = portrait ? pad : 120; const pt = N.map(([x, y]) => [left + x*(mw - left - pad), top + y*(mh - top - pad)]);
      // contour lines of the hill the loop climbs
      const hc = [left + .55*(mw - left - pad), top + .42*(mh - top - pad)];
      [.18, .3, .43].forEach((k, j) => { let d = ''; for (let a = 0; a <= 48; a++){ const th = a/48*Math.PI*2, rr = 1 + .09*Math.sin(3*th + j) + .05*Math.sin(5*th + 2*j), x = hc[0] + Math.cos(th)*rr*k*(mw - left), y = hc[1] + Math.sin(th)*rr*k*(mh - top)*.8; d += (a ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
        svg.appendChild(el('path', { d:d + 'Z', fill:'none', stroke:'var(--line)', 'stroke-width':1, opacity:.8 })); });
      svg.appendChild(el('ellipse', { cx:pt[2][0] + 18, cy:pt[2][1] + 4, rx:16, ry:9, fill:'var(--raised)' }));
      const P2 = i => pt[clamp(i, 0, n - 1)]; segs = [];
      for (let i = 0; i < n - 1; i++){ const a = P2(i), b = P2(i + 1), c1 = [a[0] + (b[0] - P2(i - 1)[0])/6, a[1] + (b[1] - P2(i - 1)[1])/6], c2 = [b[0] - (P2(i + 2)[0] - a[0])/6, b[1] - (P2(i + 2)[1] - a[1])/6];
        const d = `M${a[0]} ${a[1]}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b[0]} ${b[1]}`; svg.appendChild(el('path', { d, fill:'none', stroke:'var(--line)', 'stroke-width':3, 'stroke-linecap':'round' }));
        const ov = el('path', { d, fill:'none', stroke:'var(--ink)', 'stroke-width':3, 'stroke-linecap':'round' }); svg.appendChild(ov); const len = ov.getTotalLength(), smp = [];
        for (let k = 0; k <= 40; k++){ const p = ov.getPointAtLength(len*k/40); smp.push([p.x, p.y]); } ov.style.strokeDasharray = `${len} ${len}`; segs.push({ ov, len, smp }); }
      dots = pt.map(([x, y]) => { const c = el('circle', { cx:x, cy:y, r:4.5, fill:'var(--card)', stroke:'var(--ink)', 'stroke-width':1.5 }); svg.appendChild(c); return c; });
      marker = el('g', {}); marker.appendChild(el('circle', { r:9, fill:'var(--ink)', stroke:'var(--card)', 'stroke-width':3 })); svg.appendChild(marker); lastRo = ''; };
    onSize(st, (W, H) => { const P = W < 560 ? 16 : 24; root.style.setProperty('--p', P + 'px'); const wide = W >= 700, top = 70;
      let mw, mh, cx, ct2, ch;
      if (wide){ mw = Math.round(Math.min(360, W*.36)); mh = H - top - 18; Object.assign(map.style, { left:P + 'px', top:top + 'px', width:mw + 'px', height:mh + 'px' }); cx = P + mw + 24; ct2 = top; ch = H - top - 70; }
      else { mw = W - 2*P; mh = 150; Object.assign(map.style, { left:P + 'px', top:top + 'px', width:mw + 'px', height:mh + 'px' }); cx = 0; ct2 = top + mh + 14; ch = H - ct2 - 64; }
      const avail = W - cx - (wide ? 0 : 0); sw2 = Math.round(wide ? Math.min(avail - 64, 520) : W - 2*P - 28); step = sw2 + 16; const phh = Math.round(Math.min(sw2/1.5, ch - 104));
      Object.assign(vp.style, { left:cx + 'px', top:ct2 + 'px', height:ch + 'px' }); ft.style.left = (wide ? cx : P) + 'px';
      sl.forEach((s, i) => { s.el.style.left = ((wide ? 0 : P) + i*step) + 'px'; s.el.style.width = sw2 + 'px'; s.fr.style.height = phh + 'px'; need(s.im, sw2); });
      drawMap(mw - 2, mh - 2); r.sync(); r.go(r.i); });
    bindRail(vp, r); keysRail(vp, r); r.wheelOn(vp); bl.onclick = () => r.step(-1); br.onclick = () => r.step(1);
    // the map is a second handle: nearest sampled point on the route → float index → rail offset
    let mrect = null; const fromPt = e => { const sx = (e.clientX - mrect.left - 1), sy = (e.clientY - mrect.top - 1); let best = 1e9, bp = 0; segs.forEach((s, k) => s.smp.forEach(([x, y], j) => { const d = (x - sx)**2 + (y - sy)**2; if (d < best){ best = d; bp = k + j/40; } })); return bp; };
    grab(map, { th:3, press:() => { mrect = map.getBoundingClientRect(); }, start:e => { r.grab(); r.hx = fromPt(e)*step; }, move:(dx, dy, e) => { if (r.held) r.hx = fromPt(e)*step; },
      end:(vx, vy, mv, e) => { if (mv) r.release(0); else r.go(Math.round(fromPt(e))); } });
    map.addEventListener('keydown', e => { const k = e.key; if (k === 'ArrowRight' || k === 'ArrowUp') r.step(1); else if (k === 'ArrowLeft' || k === 'ArrowDown') r.step(-1); else if (k === 'Home') r.home(); else if (k === 'End') r.end(); else return; e.preventDefault(); });
    return t => { pump(q, t); r.tick(); const x = r.pos(t), pf = clamp(x/step, 0, n - 1), k = Math.min(n - 2, Math.floor(pf)), f = pf - k; put(tr, 'transform', tx(-x));
      segs.forEach((s, j) => put(s.ov, 'strokeDashoffset', (s.len*(1 - clamp(pf - j))).toFixed(2)));
      const sg = segs[k]; if (sg){ const u = f*40, a = Math.floor(u), b = Math.min(40, a + 1), w = u - a, P0 = sg.smp[a], P1 = sg.smp[b]; put(marker, 'transform', `translate(${lerp(P0[0], P1[0], w).toFixed(2)}px,${lerp(P0[1], P1[1], w).toFixed(2)}px)`); }
      dots.forEach((d, i) => { const v = pf >= i - .001 ? 'var(--ink)' : 'var(--card)'; if (d._f !== v){ d._f = v; d.setAttribute('fill', v); } });
      const ro = `${hm(lerp(STOPS[k][3], STOPS[k + 1][3], f))}|Mile ${lerp(STOPS[k][2], STOPS[k + 1][2], f).toFixed(1)} of 8.2`; if (ro !== lastRo){ lastRo = ro; const [a, b] = ro.split('|'); tm.textContent = a; mi.textContent = b; } };
  }});
})();
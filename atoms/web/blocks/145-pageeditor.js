

/* ---------- Editor: page editor, unsaved-changes bar, site header ---------- */
atom({ id:'pageeditor', cat:'Editor', name:'Page editor', block:'section, heading, every block inspector', fam:['M','E','S','X'], wide:true, tall:true,
  html:`<style>
.pe{position:absolute;inset:0;overflow:hidden;isolation:isolate;background:var(--bg);font-size:13px;text-align:left}
.pe-out{position:absolute;left:0;top:0;bottom:0;width:140px;padding:10px 8px;background:var(--tile);border-right:1px solid var(--line);z-index:3}
.pe-ttl{font-size:12px;font-weight:500;color:var(--muted);padding:0 8px 8px}
.pe-lst{position:relative;display:flex;flex-direction:column;gap:2px}
.pe-pl{position:absolute;border-radius:8px;background:var(--raised);pointer-events:none;opacity:0}
.pe-it{position:relative;display:flex;align-items:center;gap:8px;width:100%;padding:7px 8px;border:0;border-radius:8px;background:none;color:var(--ink);font-weight:500;text-align:left;cursor:pointer}
.pe-cv{position:absolute;left:140px;top:0;bottom:0;right:0;overflow:auto;overscroll-behavior:contain;z-index:1}
.pe-pg{position:relative;padding:12px;display:flex;flex-direction:column;gap:8px}
.pe-bk{position:relative;border-radius:10px;border:1.5px solid var(--muted);cursor:pointer;background:var(--pe-bg);color:var(--pe-fg)}
.pe-bk h4{margin:0;overflow-wrap:anywhere}
.pe-bk p{margin:0;overflow-wrap:anywhere}
.pe-rg{position:absolute;left:0;top:0;border:2px solid var(--accent);border-radius:13px;pointer-events:none;opacity:0;z-index:2}
.pe-in{position:absolute;right:0;top:0;bottom:0;width:232px;background:var(--card);border-left:1px solid var(--line);z-index:4;visibility:hidden;display:flex;flex-direction:column}
.pe-gr{display:none;height:22px;flex:none;place-items:center;cursor:grab;touch-action:none}
.pe-gr i{width:36px;height:4px;border-radius:2px;background:var(--line)}
.pe-lys{position:relative;flex:1;min-height:0}
.pe-ly{position:absolute;inset:0;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px}
.pe-lh{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.pe-lh b{font-size:14px;letter-spacing:-.01em}
.pe-lh span{font-size:12px;color:var(--muted)}
.pe-f{display:flex;flex-direction:column;gap:5px;min-width:0}
.pe-f label,.pe-f .pe-fl{font-size:12px;font-weight:500;color:var(--muted)}
.pe-f input,.pe-f textarea{width:100%;border:1.5px solid var(--muted);border-radius:8px;background:var(--bg);color:var(--ink);font:13px/1.45 var(--sans);padding:7px 9px;resize:none;user-select:text;-webkit-user-select:text}
.pe-sw{position:relative;display:flex;gap:8px;padding:3px;align-self:flex-start}
.pe-sw button{position:relative;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--muted);cursor:pointer;padding:0}
.pe-sq{position:absolute;left:0;top:0;height:30px;border-radius:10px;border:2px solid var(--ink);pointer-events:none}
.pe[data-n] .pe-out{right:0;bottom:auto;width:auto;height:46px;padding:6px 8px;border-right:0;border-bottom:1px solid var(--line)}
.pe[data-n] .pe-ttl{display:none}
.pe[data-n] .pe-lst{flex-direction:row;gap:4px;height:34px}
.pe[data-n] .pe-it{width:auto;padding:0 12px;align-items:center}
.pe[data-n] .pe-it svg{display:none}
.pe[data-n] .pe-cv{left:0;top:46px}
.pe[data-n] .pe-in{left:0;right:0;top:auto;width:auto;height:164px;border-left:0;border-radius:16px 16px 0 0;box-shadow:var(--shadow)}
.pe[data-n] .pe-gr{display:grid}
.pe[data-n] .pe-ly{display:grid;grid-template-columns:1fr 1fr;align-content:start;gap:8px 12px;padding:0 14px 8px}
.pe[data-n] .pe-lh span{display:none}
.pe[data-n] .pe-bgf{flex-direction:row;align-items:center;justify-content:space-between}
.pe[data-n] .pe-lh,.pe[data-n] .pe-bgf{grid-column:1/-1}
.pe[data-n] .pe-f textarea{height:40px}
</style><div class="pe">
<div class="pe-out"><div class="pe-ttl">Blocks</div><div class="pe-lst" role="group" aria-label="Page blocks"><i class="pe-pl"></i></div></div>
<div class="pe-cv" tabindex="-1"><div class="pe-pg"></div></div>
<aside class="pe-in" aria-label="Block inspector"><div class="pe-gr" aria-hidden="true"><i></i></div><div class="pe-lys"></div></aside>
</div>`,
  desc:'The first click on a block springs a selection ring onto it, lights the outline plate and slides the inspector in from the right (a bottom sheet when narrow), without swapping fields. After that the ring morphs between blocks with x, y, width and height springs, the outline plate follows with lagging edges, and the inspector fields blur-swap to the new block. Typing in Heading edits the canvas live; a Background swatch morphs that block’s color. Escape, or a click on empty canvas, fades the ring and sends the inspector away.',
  api:'ring.{x,y,w,h}.set(block rect)   plate.go(a, b)   inspector.to(type)   bg.set(swatch)   Esc: ring.o, inspector.o → 0',
  init(st){
    const pe = $(st,'.pe'), lst = $(st,'.pe-lst'), pl = $(st,'.pe-pl'), cv = $(st,'.pe-cv'), pg = $(st,'.pe-pg'), insp = $(st,'.pe-in'), gr = $(st,'.pe-gr'), lys = $(st,'.pe-lys');
    const IW = 232, SH = 164;
    const SW = [['Paper','var(--card)','var(--ink)'],['Sage','var(--accent-tint)','var(--ink)'],['Sand','var(--warning-tint)','var(--ink)'],['Mist','var(--raised)','var(--ink)'],['Ink','#0C1016','#EFF2F6']];
    const PAD = 'padding:20px 18px';
    const BL = [
      { n:'Hero', ic:'<rect x="3" y="4" width="18" height="11" rx="2"/><path d="M7 19h10"/>', bg:1,
        f:[['h','Heading','in','Build the page, not the plumbing'],['b','Button label','in','Start free']],
        m:`<div style="${PAD};display:flex;flex-direction:column;gap:8px;align-items:flex-start"><h4 class="pe-h" style="font-size:22px;line-height:1.15;letter-spacing:-.03em;font-weight:600;max-width:20ch;text-wrap:balance"></h4><p style="opacity:.7;max-width:38ch">Drag blocks, edit text and publish in one click.</p><span class="pe-b" style="margin-top:4px;padding:6px 12px;border-radius:8px;background:var(--pe-fg);color:var(--pe-bg);font-weight:500"></span></div>` },
      { n:'Text', ic:I.alL, bg:0,
        f:[['h','Heading','in','Why we built it'],['p','Body','ta','Studio keeps layout, content and publishing in one place, so the change you make in the editor is the change visitors see.']],
        m:`<div style="padding:14px 18px;display:flex;flex-direction:column;gap:6px"><h4 class="pe-h" style="font-size:15px;letter-spacing:-.01em;font-weight:600"></h4><p class="pe-p" style="opacity:.75;line-height:1.55"></p></div>` },
      { n:'Pricing', ic:'<rect x="4" y="4" width="7" height="16" rx="1.5"/><rect x="13" y="4" width="7" height="16" rx="1.5"/>', bg:3,
        f:[['h','Heading','in','Simple pricing'],['p','Studio price','in','$24']],
        m:`<div style="padding:14px 18px;display:flex;flex-direction:column;gap:10px"><h4 class="pe-h" style="font-size:15px;letter-spacing:-.01em;font-weight:600"></h4><div style="display:flex;gap:8px"><div style="flex:1;border:1px solid color-mix(in oklab,var(--pe-fg) 18%,transparent);border-radius:8px;padding:8px 10px;display:flex;flex-direction:column"><span style="opacity:.7">Starter</span><b style="font-size:17px;letter-spacing:-.02em">Free</b></div><div style="flex:1;border:1px solid color-mix(in oklab,var(--pe-fg) 18%,transparent);border-radius:8px;padding:8px 10px;display:flex;flex-direction:column"><span style="opacity:.7">Studio</span><span><b class="pe-p" style="font-size:17px;letter-spacing:-.02em"></b><span style="opacity:.7"> per month</span></span></div></div></div>` },
      { n:'Footer', ic:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18"/>', bg:4,
        f:[['t','Footer text','in','© 2026 Harbor Studio · Made with Studio']],
        m:`<p class="pe-t" style="padding:14px 18px;opacity:.85"></p>` }
    ];
    // outline, canvas blocks and inspector layers
    const rows = BL.map((b,k) => { const r = document.createElement('button'); r.type = 'button'; r.className = 'pe-it'; r.setAttribute('aria-pressed','false'); r.innerHTML = ic(b.ic,15) + '<span>' + b.n + '</span>'; lst.appendChild(r); return r; });
    pg.innerHTML = BL.map((b,k) => `<div class="pe-bk" role="button" tabindex="0" aria-pressed="false" aria-label="${b.n} block">${b.m}</div>`).join('') + '<i class="pe-rg"></i>';
    const bks = $$(pg,'.pe-bk'), ring = $(pg,'.pe-rg');
    const tgt = (k, key) => $(bks[k], '.pe-' + key);
    const M = BL.map(b => ({ i:b.bg, fb:SW[b.bg][1], ff:SW[b.bg][2], tb:SW[b.bg][1], tf:SW[b.bg][2], tr:new Track(1), sq:edges(b.bg*32, b.bg*32 + 30), cb:'', cf:'' }));
    const lays = BL.map((b,k) => { const d = document.createElement('div'); d.className = 'pe-ly';
      d.innerHTML = `<div class="pe-lh"><b>${b.n}</b><span>Esc to deselect</span></div>` + b.f.map(([key,lab,kind]) => { const id = `pe-${k}-${key}`;
        return `<div class="pe-f${kind === 'ta' ? ' pe-w' : ''}"><label for="${id}">${lab}</label>${kind === 'ta' ? `<textarea id="${id}" rows="3" maxlength="160"></textarea>` : `<input id="${id}" maxlength="60" autocomplete="off">`}</div>`; }).join('')
        + `<div class="pe-f pe-w pe-bgf"><span class="pe-fl" id="pe-${k}-bgl">Background</span><div class="pe-sw" role="group" aria-labelledby="pe-${k}-bgl">${SW.map(([n,c],i) => `<button type="button" aria-label="${n}" aria-pressed="${i === b.bg}" style="background:${c}"></button>`).join('')}<i class="pe-sq"></i></div></div>`;
      lys.appendChild(d);
      b.f.forEach(([key,,,def]) => { const inp = $(d,'#pe-' + k + '-' + key); inp.value = def; tgt(k, key).textContent = def;
        inp.addEventListener('input', () => { tgt(k, key).textContent = inp.value; }); });
      const sws = $$(d,'.pe-sw button');
      sws.forEach((s,i) => s.onclick = () => setBg(k, i, sws));
      return { d, sq:$(d,'.pe-sq'), sws }; });
    // color morph: the new color grows out of whatever is currently showing
    function setBg(k, i, sws){ const m = M[k]; if (m.i === i) return; const t0 = now(), p = clamp(m.tr.at(t0));
      m.fb = p > .999 ? m.tb : `color-mix(in oklab, ${m.tb} ${(p*100).toFixed(1)}%, ${m.fb})`; m.ff = p > .999 ? m.tf : `color-mix(in oklab, ${m.tf} ${(p*100).toFixed(1)}%, ${m.ff})`;
      m.tb = SW[i][1]; m.tf = SW[i][2]; m.i = i; m.tr.jump(0).set(1, S.soft, t0); m.sq.go(i*32, i*32 + 30, t0); sws.forEach((s,j) => s.setAttribute('aria-pressed', i === j)); }

    let sel = -1, lastK = 0, last = [0,0,0,0], narrow = null, held = false, hp = 1, auto = false;
    const R = [0,1,2,3].map(() => new Track(0)), ringO = new Track(0), plO = new Track(0), inspO = new Track(0), pEd = edges(0,0), sw = new Swap(0), sc = new Track(0, S.soft);
    const rectOf = k => { const b = bks[k]; return [b.offsetLeft - 3, b.offsetTop - 3, b.offsetWidth + 6, b.offsetHeight + 6]; };
    const geo = k => { const r = rows[k]; return narrow ? [r.offsetLeft, r.offsetLeft + r.offsetWidth] : [r.offsetTop, r.offsetTop + r.offsetHeight]; };
    const replate = () => { Object.assign(pl.style, narrow ? { left:'0', right:'auto', top:'0', bottom:'0', width:'0', height:'auto' } : { left:'0', right:'0', top:'0', bottom:'auto', width:'auto', height:'0' }); const [a,b] = geo(lastK); pEd.jump(a, b); };
    const reveal = k => { const b = bks[k], vh = cv.clientHeight - (narrow ? SH : 0), cur = cv.scrollTop, top = b.offsetTop - 8, bot = b.offsetTop + b.offsetHeight + 8; let dest = cur;
      if (top < cur) dest = top; else if (bot > cur + vh) dest = Math.min(top, bot - vh);
      if (Math.abs(dest - cur) > 1){ sc.jump(cur).set(dest); auto = true; } };
    const mark = () => { rows.forEach((r,j) => r.setAttribute('aria-pressed', j === sel)); bks.forEach((b,j) => b.setAttribute('aria-pressed', j === sel)); };
    const select = k => {
      if (k === sel) return; const t0 = now(), seen = clamp(ringO.at(t0)) > .05, was = sel, live = rectOf(k);
      if (seen) R.forEach((r,i) => r.jump(last[i] - live[i]).set(0, S.base)); else R.forEach(r => r.jump(0));
      const [a,b] = geo(k); if (clamp(plO.at(t0)) > .05) pEd.go(a, b); else pEd.jump(a, b);
      if (was < 0 && clamp(inspO.at(t0)) < .05){ sw.cur = k; sw.prev = null; sw.t = -9; } else sw.to(k);
      sel = k; lastK = k; openSet(ringO, true); openSet(plO, true); openSet(inspO, true); mark(); reveal(k);
    };
    const deselect = () => { if (sel < 0) return; if (insp.contains(document.activeElement)) bks[sel].focus({ preventScroll:true });
      sel = -1; openSet(ringO, false); openSet(plO, false); openSet(inspO, false); mark(); };
    rows.forEach((r,k) => r.onclick = () => select(k));
    bks.forEach((b,k) => { b.onclick = () => select(k); b.onkeydown = e => { if (e.target === b && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); select(k); } }; });
    cv.addEventListener('click', e => { if (!e.target.closest('.pe-bk')) deselect(); });
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && sel >= 0){ e.preventDefault(); deselect(); } });
    const stop = () => auto = false; cv.addEventListener('wheel', stop, { passive:true }); cv.addEventListener('touchstart', stop, { passive:true });
    let y0 = 0;
    drag(gr, { down:p => { held = true; y0 = p.cy; hp = clamp(inspO.at(), 0, 1.1); }, move:p => { const dy = p.cy - y0; hp = 1 - (dy > 0 ? dy : rb(dy, 30))/SH; },
      up:(p, v) => { held = false; const close = hp < .7 || v.vy > 500; if (close) deselect(); inspO.release(hp, -v.vy/SH, close ? 0 : 1, S.base); } });
    const init = () => { narrow = st.clientWidth < 640; pe.toggleAttribute('data-n', narrow); replate(); }; document.fonts.ready.then(init); requestAnimationFrame(init);
    return t => {
      const n = st.clientWidth < 640; if (n !== narrow){ narrow = n; pe.toggleAttribute('data-n', n); replate(); }
      const p = held ? hp : clamp(inspO.at(t), 0, 1.1), pc = clamp(p);
      cv.style.right = narrow ? '0' : px(IW*pc); pg.style.paddingBottom = px(12 + (narrow ? SH*pc : 0));
      insp.style.visibility = pc < .01 ? 'hidden' : 'visible'; insp.style.opacity = clamp(pc*2).toFixed(3); insp.style.pointerEvents = pc > .5 ? 'auto' : 'none';
      insp.style.transform = narrow ? `translateY(${px((1-p)*(SH + 8))})` : `translateX(${px((1-p)*(IW + 8))})`;
      lays.forEach((l,k) => { sw.apply(l.d, k, t, 4); const e = M[k].sq; l.sq.style.transform = `translateX(${px(e.A.at(t))})`; l.sq.style.width = px(e.B.at(t) - e.A.at(t)); });
      // selection ring: live block rect plus a decaying spring offset, so reflow never fights the motion
      const live = rectOf(lastK); last = live.map((v,i) => v + R[i].at(t));
      ring.style.transform = `translate(${px(last[0])},${px(last[1])})`; ring.style.width = px(Math.max(0, last[2])); ring.style.height = px(Math.max(0, last[3])); ring.style.opacity = clamp(ringO.at(t)).toFixed(3);
      const a = pEd.A.at(t), b = pEd.B.at(t); if (narrow){ pl.style.transform = `translateX(${px(a)})`; pl.style.width = px(Math.max(0, b - a)); } else plate(pl, a, b); pl.style.opacity = clamp(plO.at(t)).toFixed(3);
      M.forEach((m,k) => { const q = clamp(m.tr.at(t)); if (q > .999){ m.fb = m.tb; m.ff = m.tf; }
        const cb = q > .999 ? m.tb : `color-mix(in oklab, ${m.tb} ${(q*100).toFixed(1)}%, ${m.fb})`, cf = q > .999 ? m.tf : `color-mix(in oklab, ${m.tf} ${(q*100).toFixed(1)}%, ${m.ff})`;
        if (cb !== m.cb){ m.cb = cb; bks[k].style.setProperty('--pe-bg', cb); } if (cf !== m.cf){ m.cf = cf; bks[k].style.setProperty('--pe-fg', cf); } });
      if (auto){ cv.scrollTop = sc.at(t); if (!sc.prune(t)){ auto = false; cv.scrollTop = sc.target; } }
    };
  }});
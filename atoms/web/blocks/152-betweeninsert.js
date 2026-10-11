

(() => {
/* ================================================================ editor organisms, wave 2
   Evidence: app/platform/src/editor/{BetweenInsert,CanvasBlockToolbar,BlockLibraryPanel}.tsx,
   app/platform/src/components/admin/QuickCreate.tsx, gesso/features/editor/keys/ShortcutsOverlay.tsx */

const later = fn => setTimeout(fn, 90/clock.scale);
const EI = {
  plus:'<path d="M12 5v14M5 12h14"/>', up:'<path d="m6 15 6-6 6 6"/>', down:'<path d="m6 9 6 6 6-6"/>',
  trash:'<path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  bold:'<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', italic:'<path d="M10 5h7M7 19h7M14 5l-4 14"/>',
  replace:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>', crop:'<path d="M6 3v13a2 2 0 0 0 2 2h13M3 6h13a2 2 0 0 1 2 2v13"/>',
  variant:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  heading:'<path d="M6 5v14M18 5v14M6 12h12"/>', image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 16-5-5-8 8"/>',
  button:'<rect x="3" y="8" width="18" height="8" rx="4"/>', quote:'<path d="M9 7H5v6h4c0 2-1 3-3 4M19 7h-4v6h4c0 2-1 3-3 4"/>',
  gallery:'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  form:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5"/>', columns:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  divider:'<path d="M4 12h16"/>', video:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
  box:'<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>',
  copy:I.copy, link:I.link, align:I.alC, text:I.alL, page:I.file, post:I.pen
};

/* mini block kinds shared by the three canvas atoms. tk = toolbar family */
const BK = {
  heading:{ H:44, label:'Heading', tk:'text', html:f => `<b style="font-size:17px;letter-spacing:-.015em;font-weight:600">${f ? 'New heading' : 'Spring market is open'}</b>` },
  text:{ H:56, label:'Text', tk:'text', html:f => `<span class="muted" style="font-size:12.5px;line-height:1.45">${f ? 'Start typing here, or press slash for more blocks.' : 'Saturdays 8am to 1pm at the old rail yard.'}</span>` },
  image:{ H:64, label:'Image', tk:'image', html:f => `<span class="eb-ph" style="width:52px;height:40px;flex:none">${ic(EI.image,18)}</span><span class="small muted">${f ? 'Choose an image' : 'market-stalls.jpg'}</span>` },
  button:{ H:44, label:'Button', tk:'button', html:f => `<span class="btn ink" style="padding:4px 12px;pointer-events:none">${f ? 'Button label' : 'Reserve a stall'}</span>` },
  quote:{ H:56, label:'Quote', tk:'text', html:() => `<span style="font-size:13px;font-style:italic">“Best tomatoes in the county.”</span>` },
  gallery:{ H:64, label:'Gallery', tk:'image', html:() => [0,1,2].map(() => `<span class="eb-ph" style="width:40px;height:40px;flex:none">${ic(EI.image,16)}</span>`).join('') },
  form:{ H:72, label:'Form', tk:'text', html:() => `<span class="col" style="gap:6px;flex:1"><span class="eb-ph" style="height:16px;justify-content:start;padding-left:6px;font-size:10.5px">Name</span><span class="eb-ph" style="height:16px;justify-content:start;padding-left:6px;font-size:10.5px">Email</span></span><span class="btn ink" style="padding:3px 10px;pointer-events:none">Send</span>` },
  columns:{ H:64, label:'Columns', tk:'text', html:() => `<span class="eb-ph" style="flex:1;height:40px"></span><span class="eb-ph" style="flex:1;height:40px"></span>` },
  divider:{ H:24, label:'Divider', tk:'text', html:() => `<span style="flex:1;height:1px;background:var(--line)"></span>` },
  video:{ H:64, label:'Video', tk:'image', html:() => `<span class="eb-ph" style="width:72px;height:40px;flex:none">${ic(EI.video,18)}</span><span class="small muted">Opening day tour</span>` }
};
const EBCSS = `<style>
.eb{position:absolute;left:0;right:0;top:0;overflow:hidden}
.eb-f{position:relative;overflow:hidden}
.eb-i{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:10px;padding:0 12px;border-radius:10px;background:var(--card);overflow:hidden;font-size:13px;line-height:1.35}
.eb-ph{display:grid;place-items:center;border-radius:6px;background:var(--raised);color:var(--muted)}
</style>`;

/* Stack of absolutely placed blocks. Each block has y/h/o springs; a layout pass writes y targets
   from block heights, so inserting opens height while the blocks below slide by the same spring. */
function makeStack(host, { pad = 12, gap = 8, tail = null } = {}){
  const items = []; let selected = null;
  const live = () => items.filter(i => !i.dying);
  const api = {
    items, live, host,
    get selected(){ return selected; },
    add(kind, idx, inst, fresh){
      const d = BK[kind], L = live(), at = idx == null || idx >= L.length ? L.length : idx, before = L[at];
      const el = document.createElement('div'); el.className = 'eb'; el.innerHTML = `<div class="eb-i" style="height:${d.H}px">${d.html(fresh)}</div>`;
      host.insertBefore(el, before ? before.el : tail);
      const it = { kind, H:d.H, el, inner:el.firstChild, y:new Track(0), h:new Track(0), o:new Track(0), sel:new Track(0, S.snap), fresh:true, dying:false, fmt:{}, gone:0 };
      items.splice(before ? items.indexOf(before) : items.length, 0, it);
      if (inst){ it.h.jump(d.H); it.o.jump(1); } else { it.h.set(d.H); it.o.set(1, S.base, now() + .06); }
      api.lay(inst); return it;
    },
    lay(inst){
      let y = pad;
      for (const it of live()){ if (inst || it.fresh){ it.y.jump(y); it.fresh = false; } else it.y.set(y); y += it.H + gap; }
      host.style.height = px(Math.max(pad*2, y - gap + pad));
    },
    remove(it){ it.dying = true; it.h.set(0, S.snap); it.o.set(0, S.snap); it.gone = now() + .7; if (selected === it) selected = null; api.lay(); },
    move(it, dir){
      const L = live(), i = L.indexOf(it), o = L[i + dir]; if (!o) return false;
      const a = items.indexOf(it), b = items.indexOf(o); [items[a], items[b]] = [items[b], items[a]];
      dir < 0 ? host.insertBefore(it.el, o.el) : host.insertBefore(o.el, it.el);
      api.lay(); return true;
    },
    select(it){ selected = it; items.forEach(x => x.sel.set(x === it ? 1 : 0)); },
    clear(){ items.forEach(i => i.el.remove()); items.length = 0; selected = null; },
    indexAt(py){ const L = live(); for (let i = 0; i < L.length; i++) if (py < L[i].y.target + L[i].H/2) return i; return L.length; },
    slotY(idx){
      const L = live(); if (!L.length) return pad;
      if (idx <= 0) return L[0].y.target - gap/2;
      if (idx >= L.length){ const l = L[L.length - 1]; return l.y.target + l.H + gap/2; }
      return (L[idx-1].y.target + L[idx-1].H + L[idx].y.target)/2;
    },
    render(t){
      for (const it of items.slice()){
        const h = clamp(it.h.at(t), 0, it.H), o = clamp(it.o.at(t)), s = clamp(it.sel.at(t));
        it.el.style.transform = `translateY(${px(it.y.at(t))})`; it.el.style.height = px(h);
        it.inner.style.opacity = o.toFixed(3); it.inner.style.borderColor = mix(s,'var(--accent)','var(--line-soft)'); it.inner.style.background = mix(s,'var(--accent-tint)','var(--card)');
        if (it.gone && t > it.gone){ it.el.remove(); items.splice(items.indexOf(it), 1); }
      }
    }
  };
  return api;
}
const reveal = (cv, it, pad = 14) => {
  const top = it.y.target - pad, bot = it.y.target + it.H + pad;
  if (bot > cv.scrollTop + cv.clientHeight) cv.scrollTop = bot - cv.clientHeight; else if (top < cv.scrollTop) cv.scrollTop = Math.max(0, top);
};

/* ---------------------------------------------------------------- 1 */
atom({ id:'betweeninsert', cat:'Editor', name:'Between-blocks insert', block:'BetweenInsert, Block Library (compact)', fam:['M','S','X'], wide:true, tall:true,
  html:`${EBCSS}<style>
.bi-cv{position:relative;width:min(520px,94%);height:270px;margin-top:40px;overflow-x:hidden;overflow-y:auto;padding:4px 12px;border-radius:14px;background:var(--bg);box-shadow:var(--shadow)}
.bi-gap{position:relative}
.bi-ln{position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;border-radius:1px;background:var(--accent);pointer-events:none;opacity:0}
.bi-mp{position:absolute;left:50%;top:50%;overflow:hidden;opacity:0}
.bi-pl{position:absolute;inset:0;display:grid;place-items:center;border:0;background:none;padding:0;cursor:pointer;color:var(--card)}
.bi-pk{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:2px;padding:0 4px;white-space:nowrap}
.bi-it{display:inline-flex;align-items:center;gap:3px;height:28px;padding:0 7px;border:0;border-radius:8px;background:none;font-size:12.5px;font-weight:500;cursor:pointer}
.bi-it:hover{background:var(--raised)}
.bi-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style><div class="bi-cv" role="region" aria-label="Page blocks"></div><div class="small muted" style="position:absolute;top:14px;left:16px">Hover the gap between two blocks</div><button type="button" class="btn bi-rs" style="position:absolute;top:10px;right:12px">Reset</button><div class="bi-sr" role="status"></div>`,
  desc:'Hovering the gap draws a thin line with a plus. Clicking morphs the plus into a row of block choices, and the gap opens to make room. Picking one grows the new block from zero height at that gap while everything below slides down on the same spring.',
  api:'gap.hv.set(hover)   click: gap.h.set(54), plus → picker (morph + swap)   pick: block.h.set(H), rows below shift',
  init(st){
    const cv = $(st,'.bi-cv'), sr = $(st,'.bi-sr'), touch = matchMedia('(hover:none)').matches;
    const KINDS = ['heading','text','image','button'], GH = 18, GO = 54;
    let rows = [], open = null;
    const mkBlock = (kind, inst, fresh) => {
      const d = BK[kind], el = document.createElement('div'); el.className = 'eb-f'; el.innerHTML = `<div class="eb-i" style="height:${d.H}px">${d.html(fresh)}</div>`;
      const r = { gap:false, el, inner:el.firstChild, h:new Track(inst ? d.H : 0), o:new Track(inst ? 1 : 0) };
      if (!inst){ r.h.set(d.H); r.o.set(1, S.base, now() + .06); } return r;
    };
    const mkGap = inst => {
      const el = document.createElement('div'); el.className = 'bi-gap';
      el.innerHTML = `<i class="bi-ln"></i><div class="bi-mp"><button type="button" class="bi-pl" aria-label="Insert a block here" aria-haspopup="true" aria-expanded="false">${ic(EI.plus,14,2.5)}</button><div class="bi-pk" role="group" aria-label="Choose a block to insert">${KINDS.map(k => `<button type="button" class="bi-it" data-k="${k}">${ic(EI[k],12)}${BK[k].label}</button>`).join('')}</div></div>`;
      const g = { gap:true, el, ln:$(el,'.bi-ln'), mp:$(el,'.bi-mp'), pl:$(el,'.bi-pl'), pk:$(el,'.bi-pk'), h:new Track(inst ? GH : 0), hv:new Track(touch ? 1 : 0), op:new Track(0), sw:new Swap('pl') };
      if (!inst) g.h.set(GH);
      g.pl.onclick = () => open === g ? closeGap(g, true) : openGap(g);
      el.addEventListener('pointerenter', () => { if (!touch) g.hv.set(1); });
      el.addEventListener('pointerleave', () => { if (!touch) g.hv.set(0); });
      el.addEventListener('focusin', () => g.hv.set(1));
      el.addEventListener('focusout', e => { if (!touch && !el.contains(e.relatedTarget)) g.hv.set(0); });
      $$(g.pk,'.bi-it').forEach(b => b.onclick = () => pick(g, b.dataset.k));
      g.pk.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const b = $$(g.pk,'.bi-it'), i = b.indexOf(document.activeElement); if (i < 0) return;
        e.preventDefault(); b[(i + (e.key === 'ArrowRight' ? 1 : b.length - 1)) % b.length].focus();
      });
      return g;
    };
    function openGap(g){
      if (open && open !== g) closeGap(open);
      open = g; g.op.set(1); g.h.set(GO); g.sw.to('pk'); g.pl.setAttribute('aria-expanded','true');
      later(() => open === g && $(g.pk,'.bi-it').focus());
    }
    function closeGap(g, focus){
      if (open === g) open = null;
      g.op.set(0); g.h.set(GH); g.sw.to('pl'); g.pl.setAttribute('aria-expanded','false');
      if (focus) later(() => g.pl.focus());
    }
    function pick(g, kind){
      const i = rows.indexOf(g); closeGap(g);
      const b = mkBlock(kind, false, true), n = mkGap(false);
      rows.splice(i + 1, 0, b, n); g.el.after(b.el); b.el.after(n.el);
      sr.textContent = `Inserted ${BK[kind].label.toLowerCase()} block`; n.pl.focus();
    }
    const build = () => {
      cv.innerHTML = ''; rows = []; open = null; sr.textContent = '';
      const add = r => { rows.push(r); cv.appendChild(r.el); };
      add(mkGap(true)); ['heading','text','image'].forEach(k => { add(mkBlock(k, true)); add(mkGap(true)); });
    };
    build(); $(st,'.bi-rs').onclick = build;
    st.addEventListener('pointerdown', e => { if (open && !open.el.contains(e.target)) closeGap(open); });
    st.addEventListener('keydown', e => { if (e.key === 'Escape' && open){ e.stopPropagation(); closeGap(open, true); } });
    return t => {
      const PW = Math.min(290, cv.clientWidth - 28);
      for (const r of rows){
        r.el.style.height = px(Math.max(0, r.h.at(t)));
        if (!r.gap){ r.inner.style.opacity = clamp(r.o.at(t)).toFixed(3); continue; }
        const o = clamp(r.op.at(t)), v = Math.max(clamp(r.hv.at(t)), o);
        Object.assign(r.mp.style, { width:px(lerp(22, PW, o)), height:px(lerp(22, 38, o)), borderRadius:px(lerp(11, 14, o)), opacity:v.toFixed(3),
          transform:`translate(-50%,-50%) scale(${lerp(.8, 1, v).toFixed(4)})`, background:mix(o,'var(--card)','var(--accent)'), border:`1.5px solid ${mix(o,'var(--muted)','var(--accent)')}`,
          boxShadow:o > .02 ? `0 1px 2px rgba(16,20,26,${(.07*o).toFixed(3)}),0 6px 18px rgba(16,20,26,${(.06*o).toFixed(3)})` : 'none' });
        r.ln.style.opacity = (v*(1 - o)).toFixed(3); r.ln.style.transform = `scaleX(${lerp(.6, 1, v).toFixed(4)})`;
        r.sw.apply(r.pl,'pl',t,2); r.sw.apply(r.pk,'pk',t,3);
      }
    };
  }});

/* ---------------------------------------------------------------- 2 */
const TBTY = {
  text:[['bold','Bold'],['italic','Italic'],['link','Link'],['align','Align text']],
  image:[['replace','Replace image'],['alt','Edit alt text'],['crop','Crop']],
  button:[['link','Edit link'],['variant','Switch style']]
};
const tbBtn = ([a, l]) => `<button type="button" class="bt-b" data-a="${a}" aria-label="${l}" title="${l}"${a === 'bold' || a === 'italic' ? ' aria-pressed="false"' : ''}>${a === 'alt' ? 'Alt' : ic(EI[a],14)}</button>`;
const tbWidth = k => 28*TBTY[k].length + 125;
atom({ id:'blocktoolbar', cat:'Editor', name:'Floating block toolbar', block:'CanvasBlockToolbar', fam:['E','S','X'], wide:true, tall:true,
  html:`${EBCSS}<style>
.bt-cv{position:relative;width:min(560px,94%);height:276px;margin-top:40px;overflow-x:hidden;overflow-y:auto;border-radius:14px;background:var(--bg);box-shadow:var(--shadow)}
.bt-in{position:relative;margin:0 16px}
.bt-in>.eb{cursor:pointer}.bt-in>.eb:focus-visible{outline:none}.bt-in>.eb:focus-visible .btb-i{outline:2px solid var(--accent);outline-offset:-2px}
.bt-tb{position:absolute;left:0;top:0;height:32px;border-radius:9px;background:var(--card);box-shadow:var(--shadow);overflow:hidden;visibility:hidden}
.bt-g{position:absolute;top:2px;display:flex;gap:2px}
.bt-b{width:26px;height:26px;display:grid;place-items:center;border:0;border-radius:6px;background:none;color:var(--muted);cursor:pointer;padding:0;font:600 10.5px var(--sans)}
.bt-b:hover:not(:disabled){background:var(--raised);color:var(--ink)}
.bt-b[aria-pressed="true"]{background:var(--accent-tint);color:var(--accent)}
.bt-b.dg:hover:not(:disabled){color:var(--danger)}
.bt-b:disabled{opacity:.35;cursor:default}
.bt-dv{position:absolute;top:7px;width:1px;height:16px;background:var(--line)}
.bt-bold{font-weight:700!important}.bt-bold *{font-weight:700!important}.bt-ital *{font-style:italic!important}.bt-lnk *{text-decoration:underline;text-decoration-color:var(--accent);text-underline-offset:3px}
.bt-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style><div class="bt-cv"><div class="bt-in"><div class="bt-tb" role="toolbar" aria-label="Block actions">
${Object.keys(TBTY).map(k => `<div class="bt-g" data-ty="${k}" style="left:3px">${TBTY[k].map(tbBtn).join('')}</div>`).join('')}
<i class="bt-dv" style="right:117px"></i>
<div class="bt-g" style="right:3px"><button type="button" class="bt-b" data-a="up" aria-label="Move up" title="Move up">${ic(EI.up,14)}</button><button type="button" class="bt-b" data-a="down" aria-label="Move down" title="Move down">${ic(EI.down,14)}</button><button type="button" class="bt-b" data-a="dup" aria-label="Duplicate" title="Duplicate">${ic(EI.copy,14)}</button><button type="button" class="bt-b dg" data-a="del" aria-label="Delete" title="Delete">${ic(EI.trash,14)}</button></div>
</div></div></div>
<div style="position:absolute;top:14px;left:16px;width:60%;height:20px"><span class="bt-hint small muted layer" style="justify-content:flex-start">Click a block, or Tab to one</span><span class="bt-msg small layer" style="justify-content:flex-start;color:var(--ink)"></span></div>
<button type="button" class="btn bt-rs" style="position:absolute;top:10px;right:12px">Reset</button><div class="bt-sr" role="status"></div>`,
  desc:'Selecting a block raises one toolbar at its top edge. Choosing another block glides the same toolbar over: whichever edge leads the move goes first, the other lags 60ms. The block-type actions swap by the blur rule (text, image, button) while the toolbar widens or narrows, and move, duplicate and delete stay put at the end.',
  api:'tb.{left,right} = edges(block.right − width(type))   tb.y.set(block.y − 11)   typeActions.to(kind)',
  init(st){
    const cv = $(st,'.bt-cv'), host = $(st,'.bt-in'), tb = $(st,'.bt-tb'), sr = $(st,'.bt-sr'), hint = $(st,'.bt-hint'), msg = $(st,'.bt-msg');
    const stack = makeStack(host, { pad:14, gap:8, tail:tb });
    const groups = {}; $$(tb,'.bt-g[data-ty]').forEach(g => groups[g.dataset.ty] = g);
    const sw = new Swap('text'), sm = new Swap('hint'), E = edges(0,0), ty = new Track(0), vis = new Track(0);
    let q = [];
    const btn = a => $(tb,`.bt-g[style*="right"] [data-a=${a}]`);
    const say = m => { sr.textContent = m; msg.textContent = m; sm.to('msg'); const t0 = now(); q = [[t0 + 2.2, () => sm.to('hint')]]; };
    const paint = it => {
      const c = it.inner.classList; c.toggle('bt-bold', !!it.fmt.bold); c.toggle('bt-ital', !!it.fmt.italic); c.toggle('bt-lnk', !!it.fmt.link);
      it.inner.style.justifyContent = ['flex-start','center','flex-end'][it.fmt.align || 0];
      const b = $(it.inner,'.btn'); if (b) b.classList.toggle('ink', !it.fmt.variant);
    };
    function sync(){
      const it = stack.selected, L = stack.live();
      L.forEach((x, i) => x.el.setAttribute('aria-label', `${BK[x.kind].label} block, ${i + 1} of ${L.length}`));
      if (!it){ vis.set(0, S.snap); return; }
      const k = BK[it.kind].tk, i = L.indexOf(it), right = host.clientWidth + 4, left = right - tbWidth(k), y = it.y.target - 11;
      if (vis.target < .5){ E.jump(left, right); ty.jump(y); sw.cur = k; sw.prev = null; sw.t = -9; vis.set(1); }
      else { E.go(left, right); ty.set(y); sw.to(k); }
      tb.setAttribute('aria-label', `Actions for ${BK[it.kind].label.toLowerCase()} block ${i + 1}`);
      btn('up').disabled = i === 0; btn('down').disabled = i === L.length - 1; btn('dup').disabled = L.length >= 7;
      for (const a of ['bold','italic']) $(groups.text, `[data-a=${a}]`).setAttribute('aria-pressed', !!it.fmt[a]);
    }
    function choose(it){ if (stack.selected === it) return; stack.select(it); sync(); }
    function wire(it){
      it.el.tabIndex = 0; it.el.setAttribute('role','group');
      it.el.addEventListener('pointerdown', () => choose(it)); it.el.addEventListener('focus', () => choose(it));
      it.el.addEventListener('keydown', e => {
        const L = stack.live(), i = L.indexOf(it);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ const n = L[i + (e.key === 'ArrowDown' ? 1 : -1)]; if (n){ e.preventDefault(); n.el.focus(); reveal(cv, n); } }
        else if (e.key === 'Enter' && e.target === it.el){ e.preventDefault(); const b = $$(tb,'button:not(:disabled)').find(x => getComputedStyle(x).visibility !== 'hidden'); b && b.focus(); }
        else if (e.key === 'Escape'){ stack.select(null); sync(); it.el.blur(); }
      });
      return it;
    }
    const load = () => { stack.clear(); vis.jump(0); ['heading','text','image','button'].forEach(k => wire(stack.add(k, null, true))); sync(); };
    load(); $(st,'.bt-rs').onclick = load;
    cv.addEventListener('pointerdown', e => { if (!e.target.closest('.eb') && !e.target.closest('.bt-tb')){ stack.select(null); sync(); } });
    addEventListener('resize', () => sync());
    const labelOf = it => BK[it.kind].label.toLowerCase();
    tb.addEventListener('click', e => {
      const b = e.target.closest('button'), it = stack.selected; if (!b || b.disabled || !it) return;
      const a = b.dataset.a, L = stack.live(), i = L.indexOf(it);
      if (a === 'up' || a === 'down'){ if (stack.move(it, a === 'up' ? -1 : 1)){ say(`Moved ${labelOf(it)} block ${a}`); sync(); reveal(cv, it); } }
      else if (a === 'dup'){ const c = wire(stack.add(it.kind, i + 1)); c.fmt = { ...it.fmt }; paint(c); stack.select(c); sync(); reveal(cv, c); say(`Duplicated ${labelOf(it)} block`); }
      else if (a === 'del'){ const n = L[i + 1] || L[i - 1] || null; stack.remove(it); stack.select(n); sync(); say(`Deleted ${labelOf(it)} block`); if (n) n.el.focus(); }
      else if (a === 'bold' || a === 'italic' || a === 'link'){ it.fmt[a] = !it.fmt[a]; paint(it); sync(); say(`${b.getAttribute('aria-label')} ${it.fmt[a] ? 'on' : 'off'}`); }
      else if (a === 'align'){ it.fmt.align = ((it.fmt.align || 0) + 1) % 3; paint(it); say(`Aligned ${['left','center','right'][it.fmt.align]}`); }
      else if (a === 'variant'){ it.fmt.variant = !it.fmt.variant; paint(it); say(it.fmt.variant ? 'Outline style' : 'Solid style'); }
      else if (a === 'replace') say('Opens the media library to swap the image');
      else if (a === 'alt') say('Opens the alt text field');
      else if (a === 'crop') say('Starts the crop handles on the image');
    });
    tb.addEventListener('keydown', e => {
      if (e.key === 'Escape' && stack.selected){ e.stopPropagation(); stack.selected.el.focus(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        const b = $$(tb,'button:not(:disabled)').filter(x => getComputedStyle(x).visibility !== 'hidden'), i = b.indexOf(document.activeElement); if (i < 0) return;
        e.preventDefault(); b[(i + (e.key === 'ArrowRight' ? 1 : b.length - 1)) % b.length].focus();
      }
    });
    return t => {
      while (q.length && q[0][0] <= t) q.shift()[1]();
      stack.render(t);
      const p = clamp(vis.at(t)), a = E.A.at(t), b = E.B.at(t);
      Object.assign(tb.style, { left:px(a), top:px(ty.at(t)), width:px(Math.max(0, b - a)) });
      pop(tb, p, -4);
      for (const k in groups) sw.apply(groups[k], k, t, 0);
      sm.apply(hint,'hint',t,2); sm.apply(msg,'msg',t,2);
    };
  }});

/* ---------------------------------------------------------------- 3 */
atom({ id:'blocklibrary', cat:'Editor', name:'Block library panel', block:'BlockLibraryPanel', fam:['D','S','M'], wide:true, tall:true,
  html:`${EBCSS}<style>
.bl-w{position:relative;width:min(720px,96%);height:276px;margin-top:40px;display:grid;grid-template-columns:clamp(150px,40%,240px) minmax(0,1fr);gap:12px}
.bl-p{display:flex;flex-direction:column;gap:8px;padding:10px;min-height:0}
.bl-sl{display:flex;align-items:center;gap:6px;height:34px;padding:0 10px;border:1.5px solid var(--muted);border-radius:9px;background:var(--bg);color:var(--muted)}
.bl-sl:focus-within{outline:2px solid var(--accent);outline-offset:2px}
.bl-q{flex:1;min-width:0;border:0;background:none;font:inherit;font-size:13px;color:var(--ink);outline:none!important;user-select:text;-webkit-user-select:text}
.bl-ta{position:relative;flex:1;min-height:0}
.bl-t{position:absolute;left:0;top:0;height:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:10px;background:var(--card);font-size:11.5px;font-weight:500;cursor:grab;touch-action:none;padding:0}
.bl-t:hover{border-color:var(--line)}
.bl-cv{position:relative;overflow-x:hidden;overflow-y:auto;border-radius:14px;background:var(--bg);box-shadow:var(--shadow)}
.bl-in{position:relative;margin:0 10px}
.bl-ln{position:absolute;left:0;right:0;top:0;height:3px;margin-top:-1.5px;border-radius:2px;background:var(--accent);pointer-events:none;opacity:0}
.bl-gh{position:absolute;left:0;top:0;z-index:40;pointer-events:none;visibility:hidden;background:var(--card);border-color:var(--line);cursor:grabbing}
.bl-em{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;visibility:hidden}
</style><div class="bl-w"><aside class="card bl-p" aria-label="Block library"><label class="bl-sl">${ic(I.search,14)}<input id="blocklibrary-q" class="bl-q" type="text" placeholder="Search blocks…" aria-label="Search blocks" autocomplete="off"></label><div class="bl-ta"><div class="bl-em"><b class="small">No blocks found</b><span class="small muted">Try “text,” “image,” or “form.”</span><button type="button" class="btn bl-clr">Clear search</button></div></div></aside><div class="bl-cv" role="region" aria-label="Page canvas"><div class="bl-in"></div></div></div><div class="bl-gh bl-t" aria-hidden="true"></div><div class="small muted" style="position:absolute;top:14px;left:16px">Drag a tile onto the page, or press Enter on one</div>`,
  desc:'Typing filters the tiles in place: misses fade out while the matches spring into the freed slots. Dragging a tile lifts a ghost that stays exactly under the pointer. Over the page, one accent line slides between blocks to show where it will land. On release the ghost settles into the slot and the new block opens to full height while the blocks below slide down.',
  api:'tiles: o.set(match), slot.set(rank)   drag: ghost = pointer − grab   line.y.set(slotY(indexAt(y)))   drop: ghost.release(v) → block.h.set(H)',
  init(st){
    const ta = $(st,'.bl-ta'), q = $(st,'.bl-q'), cv = $(st,'.bl-cv'), host = $(st,'.bl-in'), gh = $(st,'.bl-gh'), em = $(st,'.bl-em');
    const line = document.createElement('i'); line.className = 'bl-ln'; host.appendChild(line);
    const stack = makeStack(host, { pad:12, gap:8, tail:line });
    ['heading','text','image'].forEach(k => stack.add(k, null, true));
    const TL = [['heading','headline title h1 h2'],['text','paragraph body copy'],['image','photo picture'],['button','buttons cta link'],['quote','pullquote testimonial'],['gallery','photos portfolio images'],['form','signup survey contact'],['columns','column grid layout']];
    const tiles = TL.map(([k, al]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'bl-t'; b.setAttribute('aria-label', `Add ${BK[k].label.toLowerCase()} block`);
      b.innerHTML = `${ic(EI[k],16)}<span>${BK[k].label}</span>`; ta.appendChild(b);
      return { k, b, hay:`${BK[k].label} ${al}`.toLowerCase(), x:new Track(0), y:new Track(0), o:new Track(1), dim:new Track(0, S.snap), shown:true };
    });
    const emo = new Track(0), gx = new Track(0), gy = new Track(0), go = new Track(0, S.snap), lt = new Track(0, S.snap), lo = new Track(0, S.snap), ly = new Track(0, S.snap);
    const lay = inst => {
      const tw = (ta.clientWidth - 6)/2; let n = 0;
      for (const tl of tiles){
        tl.b.style.width = px(tw); if (!tl.shown) continue;
        const x = (n % 2)*(tw + 6), y = Math.floor(n/2)*52;
        if (inst || tl.o.at(now()) < .05){ tl.x.jump(x); tl.y.jump(y); } else { tl.x.set(x); tl.y.set(y); }
        n++;
      }
    };
    const filter = () => {
      const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean); let n = 0;
      for (const tl of tiles){
        const show = words.every(w => tl.hay.includes(w));
        if (show !== tl.shown){ tl.shown = show; tl.o.set(show ? 1 : 0, show ? S.base : S.snap); }
        if (show) n++;
      }
      lay(); emo.set(n ? 0 : 1, n ? S.snap : S.base);
    };
    q.addEventListener('input', filter);
    q.addEventListener('keydown', e => {
      if (e.key === 'Escape' && q.value){ e.stopPropagation(); q.value = ''; filter(); }
      else if (e.key === 'Enter'){ const tl = tiles.find(x => x.shown); if (tl){ e.preventDefault(); insertEnd(tl.k); } }
    });
    $(st,'.bl-clr').onclick = () => { q.value = ''; filter(); q.focus(); };
    function insertEnd(k){ const it = stack.add(k); reveal(cv, it); }
    let held = null, started = false, over = false, idx = 0, hx = 0, hy = 0, ox = 0, oy = 0, sx = 0, sy = 0;
    const gsz = () => [parseFloat(gh.style.width) || 0, parseFloat(gh.style.height) || 0];
    tiles.forEach(tl => {
      tl.b.onclick = e => { if (e.detail === 0) insertEnd(tl.k); };
      drag(tl.b, {
        down:p => { held = tl; started = false; over = false; sx = p.cx; sy = p.cy; ox = p.x; oy = p.y; gh.innerHTML = tl.b.innerHTML; gh.style.width = px(p.w); gh.style.height = px(p.h); },
        move:p => {
          if (!held) return;
          if (!started){ if (Math.hypot(p.cx - sx, p.cy - sy) < 4) return; started = true; gx.jump(0); gy.jump(0); go.set(1); lt.set(1); held.dim.set(1); }
          const r = st.getBoundingClientRect(), c = cv.getBoundingClientRect(), hr = host.getBoundingClientRect();
          hx = p.cx - r.left - ox; hy = p.cy - r.top - oy;
          const inside = p.cx > c.left && p.cx < c.right && p.cy > c.top && p.cy < c.bottom;
          if (inside){ const i = stack.indexAt(p.cy - hr.top), y = stack.slotY(i); if (!over) ly.jump(y); else if (i !== idx) ly.set(y); idx = i; }
          if (inside !== over){ over = inside; lo.set(inside ? 1 : 0); }
        },
        up:(p, v) => {
          if (!held) return; const tl = held; held = null; tl.dim.set(0);
          if (!started){ insertEnd(tl.k); return; }
          started = false; lt.set(0); lo.set(0);
          const r = st.getBoundingClientRect(), [gw, gH] = gsz();
          if (over){
            const hr = host.getBoundingClientRect();
            gx.release(hx, v.vx, hr.left - r.left + host.clientWidth/2 - gw/2); gy.release(hy, v.vy, hr.top - r.top + stack.slotY(idx) - gH/2);
            go.set(0, S.snap, now() + .04); const it = stack.add(tl.k, idx); reveal(cv, it);
          } else {
            const b = tl.b.getBoundingClientRect();
            gx.release(hx, v.vx, b.left - r.left); gy.release(hy, v.vy, b.top - r.top); go.set(0, S.base, now() + .05);
          }
          over = false;
        }
      });
    });
    requestAnimationFrame(() => lay(true)); addEventListener('resize', () => lay(true));
    return t => {
      for (const tl of tiles){
        const o = clamp(tl.o.at(t)), d = clamp(tl.dim.at(t));
        Object.assign(tl.b.style, { transform:`translate(${px(tl.x.at(t))},${px(tl.y.at(t))}) scale(${lerp(.94, 1, o).toFixed(4)})`, opacity:(o*(1 - .55*d)).toFixed(3), visibility:o < .01 ? 'hidden' : 'visible' });
      }
      stack.render(t);
      const g = clamp(go.at(t)), l = clamp(lt.at(t)), holding = held && started;
      Object.assign(gh.style, { visibility:g < .01 ? 'hidden' : 'visible', opacity:g.toFixed(3), transform:`translate(${px(holding ? hx : gx.at(t))},${px(holding ? hy : gy.at(t))}) scale(${(1 + .04*l).toFixed(4)})`,
        boxShadow:l > .02 ? `0 ${px(4 + 10*l)} ${px(8 + 20*l)} rgba(0,0,0,${(.1 + .12*l).toFixed(3)})` : 'none' });
      line.style.opacity = clamp(lo.at(t)).toFixed(3); line.style.transform = `translateY(${px(ly.at(t))})`;
      const e = clamp(emo.at(t)); em.style.opacity = e.toFixed(3); em.style.visibility = e < .01 ? 'hidden' : 'visible'; em.style.transform = `translateY(${px((1 - e)*6)})`;
    };
  }});

/* ---------------------------------------------------------------- 4 */
const QK = { page:['Page', EI.page, 'A landing or info page', 'Page title'], post:['Post', EI.post, 'An article, note, or essay', 'Post headline'], product:['Product', EI.box, 'An item with media and variants', 'Product name'], form:['Form', EI.form, 'Collect replies from readers', 'Form name'] };
atom({ id:'quickcreate', cat:'Editor', name:'Quick create', block:'QuickCreate', fam:['M','S','X'], wide:true, tall:true,
  html:`<style>
.qc-c{position:relative;width:min(480px,94%);height:262px;margin-top:40px;overflow:hidden}
.qc-h{position:absolute;left:0;right:0;top:0;height:52px;display:flex;align-items:center;gap:8px;padding:0 16px;border-bottom:1px solid var(--line-soft);font-weight:600;font-size:14px}
.qc-ls{position:absolute;left:0;right:0;top:52px;bottom:0;overflow:hidden}
.qc-r{position:absolute;left:0;right:0;top:0;overflow:hidden}
.qc-ri{position:absolute;left:0;right:0;top:0;height:40px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--line-soft);font-size:13.5px}
.qc-ic{display:grid;place-items:center;width:26px;height:26px;flex:none;border-radius:8px;background:var(--raised);color:var(--muted);line-height:1}
.qc-c.opt .qc-ic svg,.qc-c.opt .qc-L0 svg,.qc-c.opt .qc-mi .qc-ic svg{transform:translateY(.5px)}
.qc-c.opt .qc-ic{padding-top:1px}
.qc-cf{position:absolute;bottom:8px;left:16px;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)}
.qc-s{position:absolute;right:12px;top:9px;overflow:hidden;box-shadow:var(--shadow)}
.qc-mi{display:flex;align-items:center;gap:10px;width:100%;height:44px;padding:0 10px;border:0;border-radius:9px;background:none;text-align:left;cursor:pointer;color:inherit}
.qc-mi:hover,.qc-mi:focus-visible{background:var(--raised)}
.qc-mi:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.qc-kc{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:999px;background:var(--raised);font-size:12px;font-weight:500;flex:none}
.qc-in{flex:1;min-width:0;border:0;border-bottom:1.5px solid var(--muted);background:none;font:inherit;font-size:13.5px;color:var(--ink);padding:4px 2px;border-radius:6px;user-select:text;-webkit-user-select:text}
.qc-go:disabled{opacity:.4;cursor:default}
.qc-x{display:grid;place-items:center;width:26px;height:26px;flex:none;border:0;border-radius:7px;background:none;color:var(--muted);cursor:pointer}
.qc-x:hover{background:var(--raised);color:var(--ink)}
</style><div class="card qc-c"><div class="qc-h"><span class="qc-ht">Content</span><span class="qc-ct small muted num"></span></div><div class="qc-ls"></div>
<div class="qc-s">
<button type="button" class="layer qc-L0" aria-haspopup="menu" aria-expanded="false" style="border:0;background:none;cursor:pointer;font-weight:500;font-size:13px;gap:6px">${ic(EI.plus,14,2.5)}New</button>
<div class="layer qc-L1" role="menu" aria-label="Create a new item" style="flex-direction:column;align-items:stretch;justify-content:flex-start;gap:0;padding:4px">${Object.keys(QK).map(k => `<button type="button" role="menuitem" class="qc-mi" data-k="${k}"><span class="qc-ic">${ic(QK[k][1],15)}</span><span class="col" style="gap:0;min-width:0"><b style="font-size:13.5px;font-weight:600">${QK[k][0]}</b><span class="muted" style="font-size:12px;line-height:1.3">${QK[k][2]}</span></span></button>`).join('')}</div>
<form class="layer qc-L2" autocomplete="off" style="justify-content:flex-start;gap:6px;padding:0 5px 0 6px"><span class="qc-kc"><i class="qc-kic" style="display:inline-flex"></i><span class="qc-kl"></span></span><input id="quickcreate-title" class="qc-in" type="text" aria-label="Title"><button type="submit" class="btn ink qc-go" style="padding:3px 11px" disabled>Create</button><button type="button" class="qc-x" aria-label="Cancel">${ic(I.x,14)}</button></form>
<div class="layer qc-L3" role="status">${ic(I.check,14,3)}<span>Created</span></div>
</div></div><button type="button" class="btn qc-rs" style="position:absolute;top:10px;right:12px">Reset</button><div class="row small muted qc-cf">Centering<div class="seg qc-cs" role="group" aria-label="Icon centering" style="display:inline-flex"><div class="ind"></div><button type="button">Optical</button><button type="button">Geometric</button></div></div>`,
  desc:'The New button is one surface. Clicking grows it into a menu of kinds, whose rows rise in 35ms apart. Choosing a kind morphs the same surface into a one-line form that stretches across the header and fades the title out. Submitting turns it into a green Created pill, and only then does the new row open at the top of the list while the others slide down.',
  api:'surface.{w,h,r,tone}.set(state)   menuRows[i].set(1, t + i·0.035)   submit: to("done") → +0.16s row.h.set(40), others y.set(+40) → +1.7s to("btn")',
  init(st){
    const card = $(st,'.qc-c'), sf = $(st,'.qc-s'), ls = $(st,'.qc-ls'), ttl = $(st,'.qc-ht'), cnt = $(st,'.qc-ct'), form = $(sf,'.qc-L2');
    const L = { btn:$(sf,'.qc-L0'), menu:$(sf,'.qc-L1'), form, done:$(sf,'.qc-L3') };
    const inp = $(sf,'.qc-in'), go = $(sf,'.qc-go'), kl = $(sf,'.qc-kl'), kic = $(sf,'.qc-kic'), mis = $$(sf,'.qc-mi'), xb = $(sf,'.qc-x');
    const T = [0,1,2,3,4].map(() => new Track(0)), sw = new Swap('btn'), ho = new Track(1), me = mis.map(() => new Track(0));
    let state = 'btn', kind = 'page', q = [], rows = []; const RH = 40;
    const FW = () => Math.min(420, card.clientWidth - 24);
    const ST = k => ({ btn:[92,34,10,1,0], menu:[244,184,14,0,0], form:[FW(),38,10,0,0], done:[116,34,10,0,1] })[k];
    const to = (k, t = now(), inst) => {
      state = k; sw.to(k, t); ST(k).forEach((v, i) => inst ? T[i].jump(v) : T[i].set(v, S.base, t)); ho.set(k === 'form' ? 0 : 1, S.snap, t);
      L.btn.setAttribute('aria-expanded', k === 'menu');
      if (k === 'menu') me.forEach((tr, i) => { tr.jump(0); tr.set(1, S.base, t + .1 + i*.035); });
    };
    const mkRow = (kd, title, status, inst) => {
      const el = document.createElement('div'), tone = status === 'Draft' ? 'warning' : 'success'; el.className = 'qc-r';
      el.innerHTML = `<div class="qc-ri"><span class="qc-ic">${ic(QK[kd][1],14)}</span><span class="qc-t" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-weight:500"></span><span class="small muted">${QK[kd][0]}</span><span class="small" style="padding:2px 8px;border-radius:999px;font-weight:500;background:var(--${tone}-tint);color:var(--${tone})">${status}</span></div>`;
      $(el,'.qc-t').textContent = title; ls.appendChild(el);
      return { el, ri:el.firstChild, y:new Track(0), h:new Track(inst ? RH : 0), o:new Track(inst ? 1 : 0), hl:new Track(0) };
    };
    const lay = (fresh, inst) => rows.forEach((r, i) => r === fresh || inst ? r.y.jump(i*RH) : r.y.set(i*RH));
    const addRow = (kd, title) => {
      const r = mkRow(kd, title, 'Draft', false); rows.unshift(r); lay(r);
      r.h.set(RH); r.o.set(1, S.base, now() + .05); r.hl.jump(1); r.hl.set(0, S.lazy, now() + .4);
      while (rows.length > 8){ const d = rows.pop(); d.el.remove(); }
      cnt.textContent = rows.length + ' items';
    };
    const reset = () => {
      rows.forEach(r => r.el.remove()); rows = [mkRow('page','About the market','Published',true), mkRow('post','Opening day recap','Published',true), mkRow('product','Stall booth kit','Draft',true)];
      lay(null, true); cnt.textContent = rows.length + ' items'; q = []; inp.value = ''; go.disabled = true; to('btn', now(), true); sw.cur = 'btn'; sw.prev = null; sw.t = -9;
    };
    reset(); $(st,'.qc-rs').onclick = reset;
    const cseg = $(st,'.qc-cs'), cind = $(cseg,'.ind'), cbtns = $$(cseg,'button'), ce = edges(0,0);
    card.classList.add('opt');
    const pickC = (i, inst) => { const b = cbtns[i]; inst ? ce.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth) : ce.go(b.offsetLeft, b.offsetLeft + b.offsetWidth); card.classList.toggle('opt', i === 0); };
    cbtns.forEach((b,i) => b.onclick = () => pickC(i)); requestAnimationFrame(() => pickC(0, true));
    const cancel = focus => { if (state !== 'menu' && state !== 'form') return; to('btn'); if (focus) later(() => L.btn.focus()); };
    L.btn.onclick = () => { if (state === 'btn'){ to('menu'); later(() => state === 'menu' && mis[0].focus()); } else if (state === 'menu') cancel(true); };
    mis.forEach(m => m.onclick = () => {
      kind = m.dataset.k; kl.textContent = QK[kind][0]; kic.innerHTML = ic(QK[kind][1],13); inp.placeholder = QK[kind][3]; inp.setAttribute('aria-label', `Title for new ${QK[kind][0].toLowerCase()}`);
      inp.value = ''; go.disabled = true; to('form'); later(() => state === 'form' && inp.focus());
    });
    inp.addEventListener('input', () => go.disabled = !inp.value.trim());
    xb.onclick = () => cancel(true);
    form.addEventListener('submit', e => {
      e.preventDefault(); const v = inp.value.trim(); if (!v || state !== 'form') return;
      const t0 = now(), kd = kind;
      to('done', t0);
      q = [[t0 + .16, () => addRow(kd, v)], [t0 + 1.7, tt => { to('btn', tt); later(() => { if (document.activeElement === document.body || st.contains(document.activeElement)) L.btn.focus(); }); }]];
    });
    sf.addEventListener('keydown', e => {
      if (e.key === 'Escape' && (state === 'menu' || state === 'form')){ e.stopPropagation(); cancel(true); }
      else if (state === 'menu' && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End')){
        e.preventDefault(); const i = mis.indexOf(document.activeElement), n = mis.length;
        mis[e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowDown' ? 1 : n - 1) + (i < 0 ? 1 : 0)) % n].focus();
      }
    });
    st.addEventListener('pointerdown', e => { if (state === 'menu' && !sf.contains(e.target)) to('btn'); });
    addEventListener('resize', () => { if (state === 'form') T[0].jump(FW()); });
    return t => {
      while (q.length && q[0][0] <= t){ const [tt, fn] = q.shift(); fn(tt); }
      const [w, h, r, d, g] = T.map(x => x.at(t));
      const ca = ce.A.at(t), cb = ce.B.at(t); Object.assign(cind.style, { transform:`translate(${px(ca)},3px)`, width:px(Math.max(0, cb - ca)), height:'calc(100% - 6px)' });
      Object.assign(sf.style, { width:px(w), height:px(h), borderRadius:px(r), background:mix(g,'var(--success-tint)',mix(d,'var(--ink)','var(--card)')), color:mix(g,'var(--success)',mix(d,'var(--card)','var(--ink)')),
        borderColor:mix(g,'var(--success)',mix(d,'var(--ink)','var(--line)')), boxShadow:d < .5 ? 'var(--shadow)' : 'none' });
      for (const k in L) sw.apply(L[k], k, t, 3);
      mis.forEach((m, i) => { const e = clamp(me[i].at(t)); fade(m, e, (1 - e)*6, false); });
      ttl.style.opacity = clamp(ho.at(t)).toFixed(3);
      for (const r2 of rows){
        r2.el.style.transform = `translateY(${px(r2.y.at(t))})`; r2.el.style.height = px(Math.max(0, r2.h.at(t)));
        r2.ri.style.opacity = clamp(r2.o.at(t)).toFixed(3); r2.ri.style.background = mix(r2.hl.at(t),'var(--accent-tint)','var(--card)');
      }
    };
  }});

/* ---------------------------------------------------------------- 5 */
const SG = [
  ['View', [['Zoom in','⌘='],['Zoom out','⌘-'],['Reset zoom and recenter','⌘0'],['Pan','Space + drag'],['Next artboard',']']]],
  ['Edit', [['Undo','⌘Z'],['Redo','⌘⇧Z'],['Copy','⌘C'],['Paste','⌘V'],['Duplicate','⌘D'],['Delete selection','⌫'],['Edit text, or enter node editing','Enter']]],
  ['Selection', [['Step back one level','Esc'],['Select every block on the artboard','⌘A'],['Group','⌘G'],['Lock or unlock','⌘L'],['Hide or show','H'],['Nudge 1px','Arrows'],['Nudge 10px','⇧ Arrows']]],
  ['Arrange', [['Bring forward','⌘]'],['Send backward','⌘['],['Bring to front','⌘⇧]'],['Send to back','⌘⇧[']]],
  ['Draw', [['Illustration mode','D'],['Place text','T'],['Place a rectangle','R'],['Place an image','I']]],
  ['Document', [['Shortcuts overlay','?'],['Focus Find','⌘F'],['Quick export','⌘⇧E']]]
];
atom({ id:'shortcuts', cat:'Editor', name:'Shortcuts overlay', block:'ShortcutsOverlay', fam:['X','S'], tall:true,
  html:`<style>
.sc-ed{position:absolute;inset:12px;overflow:hidden}
.sc-ed:focus-visible{outline-offset:-2px}
.sc-k{font:500 11.5px var(--mono);padding:1px 6px;border-radius:5px;background:var(--raised);color:var(--muted);white-space:nowrap}
.sc-sc{position:absolute;inset:0;z-index:29;background:color-mix(in oklab,var(--ink) 30%,transparent);visibility:hidden;opacity:0}
.sc-sh{position:absolute;inset:0;margin:auto;width:min(360px,92%);height:min(306px,calc(100% - 24px));display:flex;flex-direction:column;overflow:hidden;visibility:hidden}
.sc-f{display:flex;align-items:center;gap:6px;height:36px;margin:8px 14px 0;padding:0 10px;border:1.5px solid var(--muted);border-radius:9px;background:var(--bg);color:var(--muted);flex:none}
.sc-f:focus-within{outline:2px solid var(--accent);outline-offset:1px}
.sc-q{flex:1;min-width:0;border:0;background:none;font:inherit;font-size:13px;color:var(--ink);outline:none!important;user-select:text;-webkit-user-select:text}
.sc-bd{position:relative;flex:1;min-height:0;overflow-y:auto;padding:0 14px}
.sc-in{position:relative}
.sc-gh,.shk-r{position:absolute;left:0;right:0;top:0}
.sc-gh{margin:0;height:24px;display:flex;align-items:flex-end;padding-bottom:4px;font-size:11.5px;font-weight:600;letter-spacing:.02em;color:var(--muted)}
.shk-r{height:30px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px}
.sc-em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 20px;visibility:hidden}
.sc-ft{margin:0;padding:6px 14px 8px;border-top:1px solid var(--line-soft);flex:none;font-size:12px}
</style>
<div class="card sc-ed" tabindex="0" aria-label="Poster canvas. Press question mark to open keyboard shortcuts.">
<div class="row" style="height:42px;padding:0 10px 0 14px;border-bottom:1px solid var(--line-soft)"><b class="small">Market poster</b><span class="muted small">Artboard 1</span><span style="flex:1"></span><button type="button" class="btn sc-op" aria-haspopup="dialog" aria-expanded="false" style="display:flex;align-items:center;gap:6px;padding:4px 10px">Shortcuts<kbd class="sc-k">?</kbd></button></div>
<div style="position:absolute;left:0;right:0;top:42px;bottom:0;overflow:hidden"><div style="position:absolute;left:24px;top:22px;padding:6px 10px;border:1.5px solid var(--accent);border-radius:2px"><b style="font-size:24px;letter-spacing:-.02em">Spring market</b></div><div class="small muted" style="position:absolute;left:34px;top:84px">Saturdays, 8am to 1pm</div><div style="position:absolute;right:28px;top:26px;width:70px;height:70px;border-radius:50%;background:var(--accent-tint)"></div><div style="position:absolute;left:24px;right:24px;bottom:22px;height:44px;border-radius:8px;background:var(--raised)"></div></div>
</div>
<div class="sc-sc"></div>
<div class="card sc-sh" role="dialog" aria-modal="true" aria-labelledby="shortcuts-ttl">
<div class="row" style="height:44px;padding:0 8px 0 14px;border-bottom:1px solid var(--line-soft);flex:none"><h2 id="shortcuts-ttl" style="margin:0;font-size:14px;font-weight:600;flex:1">Keyboard shortcuts</h2><span class="sc-n small muted num" role="status"></span><button type="button" class="sc-cl" aria-label="Close shortcuts" style="width:30px;height:30px;padding:0;display:grid;place-items:center;border:0;border-radius:8px;background:none;cursor:pointer">${ic(I.x,15)}</button></div>
<label class="sc-f">${ic(I.search,14)}<input id="shortcuts-q" class="sc-q" type="text" placeholder="Filter, for example “undo”" aria-label="Filter shortcuts" autocomplete="off"></label>
<div class="sc-bd" style="margin-top:6px"><div class="sc-in"></div><div class="sc-em"><span class="small muted"></span></div></div>
<p class="sc-ft small muted">Keys are inert while a text field has focus, except Esc.</p>
</div>
<div class="hint">Press ? while pointing here, or use the button</div>`,
  desc:'Pressing ? dims the canvas and lifts the sheet in. The rows then rise in one after another, 35ms apart. Typing filters in place: non-matching rows fade out, group headings leave with their last row, and the remaining rows glide up. Escape closes it and hands focus back.',
  api:'sheet.o.set(open)   rows[i].e.set(1, t + .1 + i·0.035)   filter: row.o.set(match), row.y.set(rank·30)   Esc → open.set(0)',
  init(st){
    const ed = $(st,'.sc-ed'), op = $(st,'.sc-op'), sc = $(st,'.sc-sc'), sh = $(st,'.sc-sh'), inp = $(st,'.sc-q'), cl = $(st,'.sc-cl'), bd = $(st,'.sc-bd'), inn = $(st,'.sc-in'), cnt = $(st,'.sc-n'), em = $(st,'.sc-em'), emt = $(em,'span');
    const expand = c => c.replace(/⌘/g,' cmd command ').replace(/⇧/g,' shift ').replace(/⌥/g,' alt option ').replace(/⌫/g,' delete backspace ').replace(/\?/g,' question ');
    const items = []; let total = 0;
    for (const [g, rows] of SG){
      const h = document.createElement('h3'); h.className = 'sc-gh'; h.textContent = g; inn.appendChild(h); items.push({ t:'h', g, el:h });
      for (const [label, chord] of rows){
        const r = document.createElement('div'); r.className = 'shk-r'; r.innerHTML = '<span></span><kbd class="sc-k"></kbd>'; r.firstChild.textContent = label; r.lastChild.textContent = chord; inn.appendChild(r);
        items.push({ t:'r', g, el:r, hay:`${label} ${chord} ${expand(chord)} ${g}`.toLowerCase() }); total++;
      }
    }
    items.forEach(it => { it.y = new Track(0); it.o = new Track(1); it.e = new Track(1); });
    const opT = new Track(0), emo = new Track(0); let last = null;
    const isOpen = () => opT.target === 1;
    const lay = inst => {
      const words = inp.value.trim().toLowerCase().split(/\s+/).filter(Boolean); let n = 0;
      for (const it of items) if (it.t === 'r'){ it.show = words.every(w => it.hay.includes(w)); if (it.show) n++; }
      for (const it of items) if (it.t === 'h') it.show = items.some(r => r.t === 'r' && r.g === it.g && r.show);
      let y = 0;
      for (const it of items){ if (!it.show) continue; if (it.t === 'h' && y) y += 8; it.ty = y; y += it.t === 'h' ? 24 : 30; }
      inn.style.height = px(y + 8);
      for (const it of items){
        if (inst){ it.y.jump(it.ty || 0); it.o.jump(it.show ? 1 : 0); continue; }
        if (it.show){ if (it.o.target < .5) it.y.jump(it.ty); else it.y.set(it.ty); it.o.set(1, S.base); } else it.o.set(0, S.snap);
      }
      cnt.textContent = n === total ? `${total} shortcuts` : `${n} of ${total}`;
      emt.textContent = n ? '' : `No shortcut matches “${inp.value.trim()}”`; emo.set(n ? 0 : 1, n ? S.snap : S.base);
    };
    lay(true);
    const open = () => {
      if (isOpen()) return; last = document.activeElement; inp.value = ''; lay(true); bd.scrollTop = 0;
      const t0 = now(); let i = 0; for (const it of items) if (it.show){ it.e.jump(0); it.e.set(1, S.base, t0 + .1 + Math.min(i++, 10)*.035); }
      openSet(opT, true); op.setAttribute('aria-expanded','true'); later(() => isOpen() && inp.focus());
    };
    const close = () => {
      if (!isOpen()) return; openSet(opT, false); op.setAttribute('aria-expanded','false');
      const f = last && document.contains(last) && last !== document.body ? last : ed; f.focus();
    };
    op.onclick = open; cl.onclick = close;
    inp.addEventListener('input', () => { lay(); bd.scrollTop = 0; });
    sc.addEventListener('pointerdown', close);
    sh.addEventListener('keydown', e => {
      if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'Tab'){ const f = [inp, cl], i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0){ e.preventDefault(); cl.focus(); } else if (!e.shiftKey && i === 1){ e.preventDefault(); inp.focus(); } else if (i < 0){ e.preventDefault(); inp.focus(); } }
    });
    document.addEventListener('keydown', e => {
      if (!(st.matches(':hover') || st.contains(document.activeElement))) return;
      if (e.key === 'Escape' && isOpen()){ e.preventDefault(); close(); }
      else if (e.key === '?' && !isOpen()){ const el = e.target; if (el && el.closest && el.closest('input,textarea,[contenteditable]')) return; e.preventDefault(); open(); }
    });
    return t => {
      const p = clamp(opT.at(t));
      sc.style.opacity = p.toFixed(3); sc.style.visibility = p < .01 ? 'hidden' : 'visible'; sc.style.pointerEvents = p > .5 ? 'auto' : 'none';
      pop(sh, p, 8);
      for (const it of items){
        const o = clamp(it.o.at(t)), e = clamp(it.e.at(t));
        Object.assign(it.el.style, { opacity:(o*e).toFixed(3), visibility:o*e < .01 ? 'hidden' : 'visible', transform:`translateY(${px(it.y.at(t) + (1 - e)*8)})` });
      }
      const eo = clamp(emo.at(t)); em.style.opacity = eo.toFixed(3); em.style.visibility = eo < .01 ? 'hidden' : 'visible';
    };
  }});
})();
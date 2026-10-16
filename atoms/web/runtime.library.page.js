/* ================================================================ library.page */
const CATS = ['Foundations','Content','Forms','Inputs','Overlays','Navigation','Layout','Data','Media','Interactive','Dynamic','Newsletter','Chrome','Commerce','Documents','Admin','Writing','Design tools','Email','SEO','Social','Files and browsing','AI chat','Scheduling','Video calls','Guidance','Maps','Views','Editor','Storefront','Workspace','Landing','Admin kit','Workflow','Status and records','MCP and agents','Agent activity','Mega menus','Headers','Footers','Photo effects','Image transitions','Carousels','Galleries','Scroll stories','Auth'];
const groupsEl = document.getElementById('groups'), groupEls = {};
CATS.forEach(c => {
  const id = 'cat-' + c.toLowerCase().replace(/\s+/g,'-'), g = document.createElement('section'); g.className = 'group'; g.id = id;
  g.innerHTML = `<h2>${c}</h2><div class="grid"></div>`; groupsEl.appendChild(g); groupEls[c] = g;
});
const CATGROUPS = { 'Photos and transitions':['Photo effects','Image transitions','Carousels','Galleries','Scroll stories'],
  'Basics':['Foundations','Content','Layout','Interactive','Dynamic','Media'],
  'Forms and input':['Forms','Inputs','Auth','Newsletter','Scheduling','Guidance'],
  'Overlays and navigation':['Overlays','Navigation','Mega menus','Headers','Footers','Chrome'],
  'Data and admin':['Data','Admin','Admin kit','Status and records','Views'],
  'Workflows and editing':['Workflow','Editor','Documents','Writing','Design tools','Files and browsing'],
  'Sites and commerce':['Commerce','Storefront','Landing','Workspace','Maps'],
  'Online jobs':['Email','SEO','Social','AI chat','MCP and agents','Agent activity','Video calls'] };
const placed = new Set(Object.values(CATGROUPS).flat()), rest = CATS.filter(c => !placed.has(c)); if (rest.length) CATGROUPS['More'] = rest;
const jumpEl = document.getElementById('jump'), jumpBtn = document.getElementById('jumpbtn'), jumpLinks = {};
Object.entries(CATGROUPS).forEach(([gname, cs]) => { const d = document.createElement('div'); d.innerHTML = `<h4>${gname}</h4>`;
  cs.filter(c => groupEls[c]).forEach(c => { const a = document.createElement('a'); a.href = '#' + groupEls[c].id; a.append(c); a.appendChild(document.createElement('span')); jumpLinks[c] = a; d.appendChild(a); }); jumpEl.appendChild(d); });
const setJump = open => { jumpEl.hidden = !open; jumpBtn.setAttribute('aria-expanded', open); };
jumpBtn.onclick = () => setJump(jumpEl.hidden);
jumpEl.addEventListener('click', e => { if (e.target.closest('a')) setJump(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !jumpEl.hidden){ setJump(false); jumpBtn.focus(); } });
document.addEventListener('pointerdown', e => { if (!jumpEl.hidden && !e.target.closest('#jump,#jumpbtn')) setJump(false); });
const FAMN = { M:'Morph', S:'Swap', D:'Drag', E:'Edges', X:'Enter/exit', T:'Time' };
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
A.forEach(a => {
  const el = document.createElement('article'); el.className = 'tile' + (a.wide ? ' wide' : '') + (a.tall ? ' tall' : '') + (a.big ? ' big' : ''); el.id = a.id;
  el.innerHTML = `<header><h3></h3><div class="fam">${a.fam.map(f => `<span title="${FAMN[f]}">${f}</span>`).join('')}</div><button class="infobtn" aria-label="Toggle details" aria-expanded="false">ⓘ</button></header><div class="block"></div><div class="stage">${a.html}</div><footer><div class="tileinfo"><p></p><pre>${esc(a.api)}</pre></div></footer>`;
  $(el,'h3').textContent = a.name; $(el,'.block').textContent = a.block; $(el,'footer p').textContent = a.desc;
  const infoBtn = $(el,'.infobtn'), tileInfo = $(el,'.tileinfo');
  infoBtn.onclick = () => { const open = tileInfo.classList.toggle('open'); infoBtn.setAttribute('aria-expanded', String(open)); };
  const grid = $(groupEls[a.cat],'.grid'); a.wide ? grid.insertBefore(el, grid.querySelector('.tile:not(.wide)')) : grid.appendChild(el); a.el = el; a.visible = false;
});
const detailToggle = document.getElementById('detailToggle');
if (detailToggle) detailToggle.addEventListener('click', () => {
  const next = !(detailToggle.getAttribute('aria-expanded') === 'true');
  A.forEach(a => { if (!a.el) return; const ti = a.el.querySelector('.tileinfo'), ib = a.el.querySelector('.infobtn'); if (ti) ti.classList.toggle('open', next); if (ib) ib.setAttribute('aria-expanded', String(next)); });
  detailToggle.setAttribute('aria-expanded', String(next));
  detailToggle.textContent = next ? 'Hide all' : 'Show all';
});
// lazy tiles: init on first approach, render only while visible
const io = new IntersectionObserver(es => es.forEach(e => {
  const a = A.find(x => x.el === e.target); if (!a) return;
  if (e.isIntersecting && !a.inited) { a.inited = true; try { a.render = a.init($(a.el,'.stage')); } catch (err) { console.error(a.id, err); a.render = null; } }
  a.visible = e.isIntersecting;
}), { rootMargin:'400px' });
A.forEach(a => { a.inited = false; a.render = null; io.observe(a.el); });

// segmented controls on the bar reuse the edge atom
function segControl(root, onPick, start = 0){
  const ind = $(root,'.ind'), btns = $$(root,'button'), e = edges(0,0), ey = edges(0,0); let cur = start;
  const pick = (i, inst) => { cur = i; const b = btns[i]; btns.forEach((x,j) => x.setAttribute('aria-pressed', i === j));
    const f = inst ? 'jump' : 'go'; e[f](b.offsetLeft, b.offsetLeft + b.offsetWidth); ey[f](b.offsetTop, b.offsetTop + b.offsetHeight); onPick(i, b); };
  btns.forEach((b,i) => b.onclick = () => pick(i)); const init = () => pick(cur, true); document.fonts.ready.then(init); init();
  addEventListener('resize', () => { const b = btns[cur]; e.jump(b.offsetLeft, b.offsetLeft + b.offsetWidth); ey.jump(b.offsetTop, b.offsetTop + b.offsetHeight); });
  return t => { const a = e.A.at(t), b = e.B.at(t), c = ey.A.at(t), d = ey.B.at(t); ind.style.transform = `translate(${px(a)},${px(c)})`; ind.style.width = px(b - a); ind.style.height = px(d - c); };
}
const countEl = document.getElementById('count');
const famRender = segControl(document.getElementById('famseg'), (i, b) => {
  const f = b.dataset.f; let n = 0;
  A.forEach(a => { const show = f === '*' || a.fam.includes(f); a.el.hidden = !show; if (show) n++; });
  CATS.forEach(c => { const n = $$(groupEls[c],'.tile').filter(x => !x.hidden).length; groupEls[c].hidden = !n; if (jumpLinks[c]){ jumpLinks[c].hidden = !n; jumpLinks[c].lastChild.textContent = n; } });
  $$(jumpEl,'div').forEach(d => d.hidden = !$$(d,'a').some(a => !a.hidden));
  countEl.textContent = `${n} atoms`;
});
const spdRender = segControl(document.getElementById('spdseg'), (i, b) => clock.scale = +b.dataset.s);

// shared hash helpers (hash wins over localStorage on init)
const hashP = () => new URLSearchParams(location.hash.slice(1));
const setHash = (k, v) => { const p = hashP(); p.set(k, v); history.replaceState(null, '', '#' + p); };
// columns: range input drives --cols; small-screen clamp lives in CSS only
const colRange = document.getElementById('colRange'), colOut = document.getElementById('colOut');
const applyCols = v => { document.documentElement.style.setProperty('--cols', v); colOut.textContent = v; };
colRange.min = 2; colRange.max = 5;
colRange.value = clamp(+(hashP().get('cols') || localStorage.getItem('lib-cols') || 3), 2, 5);
applyCols(colRange.value);
colRange.oninput = () => { applyCols(colRange.value); localStorage.setItem('lib-cols', colRange.value); setHash('cols', colRange.value); };
const colRender = () => {};
// theme: '' = system (CSS prefers-color-scheme decides), else forced white/black
const themeOrder = ['system','white','black'];
const themeInit = hashP().get('theme') || localStorage.getItem('lib-theme') || 'system';
const themeRender = segControl(document.getElementById('themeSeg'), (i, b) => {
  document.documentElement.dataset.theme = b.dataset.t === 'system' ? '' : b.dataset.t;
  localStorage.setItem('lib-theme', b.dataset.t); setHash('theme', b.dataset.t);
}, Math.max(0, themeOrder.indexOf(themeInit)));

// floating tweaks: collapse to a pill while scrolling, spring back on idle
const tweaks = document.getElementById('tweaks'), twBody = document.getElementById('twBody'), twToggle = document.getElementById('twToggle');
const tw = new Track(0); let twManual = localStorage.getItem('lib-tw') === '1', twIdle = 0, twLastY = scrollY, twLastT = performance.now(), twVel = 0, twBodyH = 0, twMeasured = false;
const twSyncBtn = () => { twToggle.textContent = twManual ? 'Tweaks' : 'Hide'; twToggle.setAttribute('aria-expanded', String(!twManual)); };
twToggle.onclick = () => { twManual = !twManual; localStorage.setItem('lib-tw', twManual ? '1' : '0'); twSyncBtn(); tw.set(twManual ? 1 : 0, twManual ? S.snap : S.soft); };
twSyncBtn(); if (twManual) tw.jump(1);
addEventListener('scroll', () => {
  const t = performance.now(), y = scrollY; twVel = (y - twLastY) / Math.max(1, t - twLastT); twLastY = y; twLastT = t;
  if (!twManual) tw.set(1, S.snap);
  clearTimeout(twIdle); twIdle = setTimeout(() => { if (!twManual) tw.release(clamp(tw.at()), Math.max(-3, Math.min(3, -twVel * 2)), 0, S.soft); }, 1100);
}, { passive: true });
const twRender = t => {
  if (!twMeasured) { twBody.style.maxHeight = 'none'; twBodyH = twBody.offsetHeight || 0; if (twBodyH) twMeasured = true; else return; }
  const k = clamp(tw.at(t));
  twBody.style.maxHeight = px((1 - k) * twBodyH);
  twBody.style.opacity = (1 - k).toFixed(3);
  twBody.style.visibility = k > 0.97 ? 'hidden' : 'visible';
  twBody.style.transform = `translateY(${(k * 10).toFixed(2)}px)`;
  tweaks.style.transform = `scale(${(1 - k * 0.03).toFixed(4)})`;
};

// agent focus: scroll-linked zoom — nearest tile flies into a 95vw/95vh overlay, reverses on scroll back
const AGENTCATS = new Set(['MCP and agents', 'Agent activity', 'AI chat']);
CATS.forEach(c => { if (AGENTCATS.has(c) && groupEls[c]) groupEls[c].dataset.agentGroup = '1'; });
const scrim = document.getElementById('focusScrim');
let held = null;
A.forEach(a => {
  if (!AGENTCATS.has(a.cat)) return;
  a.el.dataset.agent = '1'; a.fx = new Track(0, S.soft); a.fxT = 0;
  a.ph = null; a.first = null; a.closing = false; a.dismissed = false;
});
const lastRect = () => ({ x: innerWidth * 0.025, y: innerHeight * 0.025, w: innerWidth * 0.95, h: innerHeight * 0.95 });
const focusTile = a => {
  if (a.fxT === 1) return;
  A.forEach(o => { if (o !== a && o.fx && o.fxT === 1) unfocusTile(o); });
  const r = (a.ph || a.el).getBoundingClientRect();
  a.first = { x: r.left, y: r.top, w: Math.max(1, r.width), h: Math.max(1, r.height) };
  if (!a.ph) {
    const ph = document.createElement('div'); ph.className = 'tilePH';
    ph.style.height = px(r.height); ph.style.gridColumn = getComputedStyle(a.el).gridColumn;
    a.el.parentNode.insertBefore(ph, a.el); a.ph = ph;
  }
  a.el.classList.add('focus'); a.closing = false; a.fxT = 1; a.fx.set(1, S.soft);
};
const unfocusTile = a => {
  if (a.fxT === 0 && !a.ph) return;
  if (a.ph) { const r = a.ph.getBoundingClientRect(); a.first = { x: r.left, y: r.top, w: Math.max(1, r.width), h: Math.max(1, r.height) }; }
  a.fxT = 0; a.closing = true; a.fx.set(0, S.soft);
};
const dismissAll = () => {
  let any = false;
  A.forEach(a => { if (!a.fx) return; a.dismissed = true; if (a.fxT === 1) { unfocusTile(a); any = true; } });
  return any;
};
scrim.addEventListener('click', () => dismissAll());
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (dismissAll()) { e.preventDefault(); e.stopPropagation(); }
});
const agentRender = t => {
  const vh = innerHeight || 800, mid = vh / 2, last = lastRect();
  let peak = 0;
  // scroll-linked zoom: nearest-to-center tile owns the zoom, target follows scroll continuously
  for (const a of A) {
    if (!a.fx) continue;
    // off-screen tiles can never be nearest the center; skipping them keeps this loop from measuring ~80 tiles per frame
    if (!a.visible && a !== held) { a._d = 9; a.dismissed = false; continue; }
    const anchor = (a.ph || a.el).getBoundingClientRect();
    a._d = Math.abs(anchor.top + anchor.height / 2 - mid) / (vh * 0.5);
    if (a._d > 0.6) a.dismissed = false;
  }
  let best = null, bestD = 9;
  for (const a of A) {
    if (!a.fx || !a.visible || a.el.hidden || a.dismissed) continue;
    if (a._d < 0.55 && a._d < bestD) { bestD = a._d; best = a; }
  }
  if (held && (!held.fx || held.fxT === 0)) held = null;
  if (!held && best) { focusTile(best); held = best; }
  if (held && (held._d > 0.62 || held.el.hidden || held.dismissed)) { unfocusTile(held); held = null; }
  for (const a of A) {
    if (!a.fx) continue;
    if (a === held && held) a.fx.set(clamp(1 - held._d / 0.55), S.soft);
    const k = clamp(a.fx.at(t));
    if (k > 0.001) peak = Math.max(peak, k);
    if (a.first && a.fxT === 1) {
      const f = a.first, ke = k * k * (3 - 2 * k);
      const cx = f.x + (last.x - f.x) * ke, cy = f.y + (last.y - f.y) * ke;
      const cw = f.w + (last.w - f.w) * ke, ch = f.h + (last.h - f.h) * ke;
      if (k > 0.999) { a.el.style.left = ''; a.el.style.top = ''; a.el.style.width = ''; a.el.style.height = ''; a.first = null; }
      else { a.el.style.left = px(cx); a.el.style.top = px(cy); a.el.style.width = px(cw); a.el.style.height = px(ch); }
    } else if (a.closing) {
      const f = a.first || { x: last.x, y: last.y, w: last.w, h: last.h }, ke = k * k * (3 - 2 * k);
      const cx = f.x + (last.x - f.x) * ke, cy = f.y + (last.y - f.y) * ke;
      const cw = f.w + (last.w - f.w) * ke, ch = f.h + (last.h - f.h) * ke;
      a.el.style.left = px(cx); a.el.style.top = px(cy); a.el.style.width = px(cw); a.el.style.height = px(ch);
      if (k < 0.02) {
        a.el.classList.remove('focus'); a.el.style.left = ''; a.el.style.top = ''; a.el.style.width = ''; a.el.style.height = '';
        if (a.ph) { a.ph.remove(); a.ph = null; }
        a.first = null; a.closing = false;
      }
    }
  }
  // writes are guarded: re-setting the hidden attribute every frame invalidates style even when nothing changed
  const show = peak > 0.01;
  scrim.style.opacity = peak.toFixed(3);
  if (scrim.hidden === show) scrim.hidden = !show;
  scrim.style.visibility = show ? 'visible' : 'hidden';
  scrim.style.pointerEvents = show ? 'auto' : 'none';
};

function frame(ms){
  const dt = Math.min(.05, (ms - clock.last)/1000); clock.last = ms; clock.t += dt*clock.scale; const t = clock.t;
  // agentRender reads layout, so it runs before anything writes styles this frame (one layout per frame, not one per reader)
  agentRender(t); famRender(t); spdRender(t); colRender(t); themeRender(t); twRender(t);
  for (const a of A) if (a.render && a.visible && !a.el.hidden) a.render(t);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ================================================================ page */
const CATS = ['Foundations','Content','Forms','Inputs','Overlays','Navigation','Layout','Data','Media','Interactive','Dynamic','Newsletter','Chrome','Commerce','Documents','Admin','Writing','Design tools','Email','SEO','Social','Files and browsing','AI chat','Scheduling','Video calls','Guidance','Maps','Views','Editor','Storefront','Workspace','Landing','Admin kit','Workflow','Status and records','MCP and agents','Agent activity','Mega menus','Headers','Footers','Photo effects','Image transitions','Carousels','Galleries','Scroll stories'];
const groupsEl = document.getElementById('groups'), groupEls = {};
CATS.forEach(c => {
  const id = 'cat-' + c.toLowerCase().replace(/\s+/g,'-'), g = document.createElement('section'); g.className = 'group'; g.id = id;
  g.innerHTML = `<h2>${c}</h2><div class="grid"></div>`; groupsEl.appendChild(g); groupEls[c] = g;
});
const CATGROUPS = { 'Photos and transitions':['Photo effects','Image transitions','Carousels','Galleries','Scroll stories'],
  'Basics':['Foundations','Content','Layout','Interactive','Dynamic','Media'],
  'Forms and input':['Forms','Inputs','Newsletter','Scheduling','Guidance'],
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
  el.innerHTML = `<header><h3></h3><div class="fam">${a.fam.map(f => `<span title="${FAMN[f]}">${f}</span>`).join('')}</div></header><div class="block"></div><div class="stage">${a.html}</div><footer><p></p><pre>${esc(a.api)}</pre></footer>`;
  $(el,'h3').textContent = a.name; $(el,'.block').textContent = a.block; $(el,'footer p').textContent = a.desc;
  const grid = $(groupEls[a.cat],'.grid'); a.wide ? grid.insertBefore(el, grid.querySelector('.tile:not(.wide)')) : grid.appendChild(el); a.el = el; a.visible = false;
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

function frame(ms){
  const dt = Math.min(.05, (ms - clock.last)/1000); clock.last = ms; clock.t += dt*clock.scale; const t = clock.t;
  famRender(t); spdRender(t);
  for (const a of A) if (a.render && a.visible && !a.el.hidden) a.render(t);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

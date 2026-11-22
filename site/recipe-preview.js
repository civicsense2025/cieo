// Live preview tiles built from real Motion Atoms recipes.
//
// One module, one shared animation loop. The homepage hands us a container and
// a list of { chunk, id } pairs; we import the real runtime and category chunk,
// collect the requested atoms, and mount each as an animated tile. Nothing is
// fabricated and nothing outside this module is mutated.

const MOUNTED = new WeakMap();
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

function motionQuery() {
  return typeof matchMedia === 'function' ? matchMedia(REDUCE_QUERY) : null;
}

function note(doc, message) {
  const el = doc.createElement('p');
  el.className = 'rp-missing';
  el.textContent = message;
  return el;
}

// Mark a representative subject inside the stage so a host page can give it a
// focus ring. A boolean data attribute is behavior-free, so this is safe for
// every atom; keep any mark the library already set.
function markSubject(stage) {
  const skip = /^(BUTTON|INPUT|SELECT|TEXTAREA|LABEL)$/;
  const preferred = ['.n', '.num', '.puck', '.dot', '.fl', '.ind', 'svg', '.card'];
  let subject = null;
  for (const selector of preferred) {
    const found = stage.querySelector(selector);
    if (found && !skip.test(found.tagName) && !found.hasAttribute('data-focus')) {
      subject = found;
      break;
    }
  }
  if (!subject) {
    subject = Array.from(stage.children).find(
      (el) => !el.classList.contains('hint') && !skip.test(el.tagName)
    );
  }
  try {
    (subject || stage).setAttribute('data-focus', '');
  } catch {
    /* a non-element stage cannot be marked */
  }
}

function createTile(spec, atom, doc) {
  const id = spec.id;
  const el = doc.createElement('article');
  el.className = 'recipe-preview';
  el.id = id;

  const header = doc.createElement('header');
  const title = doc.createElement('h3');
  title.textContent = typeof atom.name === 'string' ? atom.name : id;
  const cat = doc.createElement('span');
  cat.className = 'rp-cat';
  cat.textContent = typeof atom.cat === 'string' ? atom.cat : '';
  header.append(title, cat);

  const stage = doc.createElement('div');
  stage.className = 'rp-stage';
  // atom.html is library-authored markup, never caller-supplied text.
  stage.innerHTML = typeof atom.html === 'string' ? atom.html : '';
  markSubject(stage);

  const link = doc.createElement('a');
  link.className = 'rp-link';
  link.href = './recipes/#' + id;
  link.textContent = 'Open recipe →';

  el.append(header, stage, link);

  const tile = { el, stage, id, atom, render: null, visible: true };
  el.__rpTile = tile;
  return tile;
}

/**
 * Mount a few real recipe atoms as live preview tiles.
 *
 * @param {Element} container target element (tiles are appended in spec order)
 * @param {{chunk:string,id:string}[]} specs atoms to collect from the library
 * @returns {Promise<{destroy:()=>void}>} handle that tears everything down
 */
export async function mountFeaturedRecipes(container, specs = []) {
  const noop = { destroy() {} };
  if (!container || typeof container.appendChild !== 'function') return noop;

  // A second mount on the same container retires the first one.
  const previous = MOUNTED.get(container);
  if (previous) previous.destroy();

  const doc = container.ownerDocument || document;
  const win = doc.defaultView || globalThis;
  const raf = typeof win.requestAnimationFrame === 'function'
    ? win.requestAnimationFrame.bind(win)
    : (fn) => setTimeout(() => fn(Date.now()), 16);
  const caf = typeof win.cancelAnimationFrame === 'function'
    ? win.cancelAnimationFrame.bind(win)
    : (id) => clearTimeout(id);
  const nowMs = () => (win.performance && typeof win.performance.now === 'function'
    ? win.performance.now() : Date.now());

  const mq = motionQuery();
  const state = {
    rafId: 0,
    io: null,
    tiles: [],
    destroyed: false,
    reduced: !!(mq && mq.matches),
    onMotion: null,
    onVisibility: null,
    cancelFrame: null,
    destroy() {
      if (state.destroyed) return;
      state.destroyed = true;
      if (state.rafId && state.cancelFrame) state.cancelFrame(state.rafId);
      state.rafId = 0;
      try { if (state.io) state.io.disconnect(); } catch { /* ignore */ }
      try { if (mq && state.onMotion) mq.removeEventListener('change', state.onMotion); } catch { /* ignore */ }
      try { doc.removeEventListener('visibilitychange', state.onVisibility); } catch { /* ignore */ }
      try { container.replaceChildren(); } catch { container.innerHTML = ''; }
      state.tiles.length = 0;
      if (MOUNTED.get(container) === state) MOUNTED.delete(container);
    },
  };
  state.cancelFrame = caf;
  MOUNTED.set(container, state);

  const list = Array.isArray(specs) ? specs : [];

  // Load the runtime first; without its clock there is no motion to drive.
  let core;
  try {
    ({ recipeCore: core } = await import('./recipes/runtime.js'));
  } catch {
    if (state.destroyed) return { destroy() {} };
    container.appendChild(note(doc, 'Recipe previews are unavailable right now.'));
    return { destroy() { state.destroy(); } };
  }
  if (state.destroyed) return { destroy() {} };

  const clock = core.clock;
  state.core = core;

  const anyVisible = () => state.tiles.some(
    (tile) => tile.visible && tile.render && !tile.el.hidden
  );

  function ensureLoop() {
    if (state.destroyed || state.reduced || state.rafId || doc.hidden) return;
    if (!anyVisible()) return;
    clock.last = nowMs();
    state.rafId = raf(tick);
  }

  function tick(ms) {
    state.rafId = 0;
    if (state.destroyed || state.reduced || doc.hidden) return;
    // Mirrors site/recipes/recipes.js: cap dt, advance the shared clock,
    // render every visible tile, and never let one tile break the frame.
    const dt = Math.min(0.05, Math.max(0, (ms - clock.last) / 1000));
    clock.last = ms;
    clock.t += dt * clock.scale;
    const t = clock.t;
    let stillVisible = false;
    for (const tile of state.tiles) {
      if (tile.visible && tile.render && !tile.el.hidden) {
        stillVisible = true;
        try { tile.render(t); } catch { tile.render = null; }
      }
    }
    if (stillVisible && !state.destroyed && !state.reduced && !doc.hidden) {
      state.rafId = raf(tick);
    }
  }

  function renderStatic() {
    for (const tile of state.tiles) {
      if (!tile.render) continue;
      try { tile.render(0); } catch { tile.render = null; }
    }
  }

  // Collect atoms from each unique chunk. Grouping avoids repeated imports.
  const byChunk = new Map();
  const chunks = [...new Set(list.map((s) => s && s.chunk).filter((c) => typeof c === 'string' && c))];
  await Promise.all(chunks.map(async (chunk) => {
    let atoms = [];
    try {
      const url = new URL(`./recipes/chunks/${chunk}.js`, import.meta.url);
      const mod = await import(url.href);
      if (mod && typeof mod.mountCategory === 'function') {
        mod.mountCategory({
          ...core,
          atom(o) { atoms.push(o); },
        });
      }
    } catch {
      atoms = [];
    }
    byChunk.set(chunk, atoms);
  }));
  if (state.destroyed) return { destroy() {} };

  // Build in spec order; a missing chunk or id becomes a quiet text note.
  const fragment = doc.createDocumentFragment();
  for (const spec of list) {
    const id = spec && typeof spec.id === 'string' ? spec.id : '';
    const chunk = spec && typeof spec.chunk === 'string' ? spec.chunk : '';
    const atoms = byChunk.get(chunk) || [];
    const atom = atoms.find(
      (o) => o && o.id === id && typeof o.file === 'string' && o.file.length > 0
    );
    if (!atom || typeof atom.init !== 'function' || typeof atom.html !== 'string') {
      fragment.appendChild(note(doc, `Recipe preview unavailable${id ? `: ${id}` : ''}.`));
      continue;
    }
    const tile = createTile(spec, atom, doc);
    state.tiles.push(tile);
    fragment.appendChild(tile.el);
  }
  if (state.destroyed) return { destroy() {} };
  container.appendChild(fragment);

  // Initialize only after the nodes are attached, because some atoms measure.
  for (const tile of state.tiles) {
    try {
      const render = tile.atom.init(tile.stage);
      tile.render = typeof render === 'function' ? render : null;
    } catch {
      tile.render = null;
    }
  }

  // Skip off-screen tiles: only near-viewport tiles join the animation loop.
  if (typeof win.IntersectionObserver === 'function') {
    state.io = new win.IntersectionObserver((entries) => {
      for (const entry of entries) {
        const tile = entry.target.__rpTile;
        if (tile) tile.visible = entry.isIntersecting;
      }
      ensureLoop();
    }, { rootMargin: '320px' });
    for (const tile of state.tiles) state.io.observe(tile.el);
  }

  state.onMotion = (event) => {
    state.reduced = !!event.matches;
    if (state.reduced) {
      if (state.rafId) { caf(state.rafId); state.rafId = 0; }
      renderStatic();
    } else {
      ensureLoop();
    }
  };
  if (mq && typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', state.onMotion);
  }

  state.onVisibility = () => { if (!doc.hidden) ensureLoop(); };
  doc.addEventListener('visibilitychange', state.onVisibility);

  if (state.reduced) {
    // Reduced motion: one settled frame, no requestAnimationFrame loop.
    renderStatic();
  } else {
    ensureLoop();
  }

  return { destroy() { state.destroy(); } };
}

// Self-booting integration: the homepage declares its featured list as JSON on
// a host element. Module scripts are deferred, so the element normally exists;
// the readyState branch also covers an early import. A malformed attribute is
// ignored rather than breaking the page.
function autoMount() {
  if (typeof document === 'undefined') return;
  try {
    const host = document.querySelector('[data-recipe-preview]');
    if (!host) return;
    const specs = JSON.parse(host.dataset.recipePreview || '[]');
    if (Array.isArray(specs) && specs.length) {
      mountFeaturedRecipes(host, specs).catch(() => {});
    }
  } catch {
    /* invalid configuration — leave the page untouched */
  }
}

if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoMount, { once: true });
} else {
  autoMount();
}

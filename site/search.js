import { enhanceCodeBlocks } from './copy-button.js';
/* Global ⌘K / Ctrl+K instant search modal across Components, Motion Recipes, Foundations, and Composites. */
const scriptEl = document.querySelector('script[data-site-up]');
const up = scriptEl?.getAttribute('data-site-up') || './';

let indexPromise = null;
let modal = null;
let input = null;
let listEl = null;
let statusEl = null;
let results = [];
let activeIdx = 0;
let lastTrigger = null;
let inerted = [];

function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(new URL('./search-index.json', import.meta.url))
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => (Array.isArray(d.items) ? d.items : []))
      .catch(() => []);
  }
  return indexPromise;
}

function resolveHref(href) {
  if (href.startsWith('../')) return up === './' ? href : `${up}${href}`;
  return `${up}${href}`;
}

function scoreItem(item, q) {
  if (!q) return item.kind === 'foundation' ? 4 : item.kind === 'component' ? 3 : item.kind === 'composite' ? 2 : 1;
  const title = item.title.toLowerCase();
  const sub = (item.subtitle || '').toLowerCase();
  const tags = (item.tags || '').toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 55;
  if (tags.includes(q)) return 35;
  if (sub.includes(q)) return 20;
  return 0;
}

function renderResults() {
  if (!listEl) return;
  listEl.replaceChildren();
  if (!results.length) {
    const empty = document.createElement('li');
    empty.className = 'site-search-empty';
    empty.textContent = 'No matching components, recipes, composites, or guides.';
    listEl.appendChild(empty);
    if (statusEl) statusEl.textContent = '0 results';
    input?.setAttribute('aria-expanded', 'false');
    return;
  }
  if (statusEl) statusEl.textContent = `${results.length} results`;
  input?.setAttribute('aria-expanded', 'true');
  results.forEach((item, idx) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.id = `site-search-opt-${idx}`;
    li.setAttribute('aria-selected', String(idx === activeIdx));
    const a = document.createElement('a');
    a.href = resolveHref(item.href);
    a.className = 'site-search-row';
    const badge = document.createElement('span');
    badge.className = 'site-search-kind';
    badge.textContent = item.badge || item.kind;
    const main = document.createElement('span');
    main.className = 'site-search-title';
    main.textContent = item.title;
    const sub = document.createElement('span');
    sub.className = 'site-search-sub';
    sub.textContent = item.subtitle || '';
    a.append(badge, main, sub);
    a.addEventListener('mouseenter', () => {
      activeIdx = idx;
      syncActive();
    });
    a.addEventListener('click', () => closeSearch(false));
    li.appendChild(a);
    listEl.appendChild(li);
  });
}

function syncActive() {
  if (!listEl || !input) return;
  const rows = listEl.querySelectorAll('[role="option"]');
  rows.forEach((r, i) => r.setAttribute('aria-selected', String(i === activeIdx)));
  const active = rows[activeIdx];
  if (active) {
    input.setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView?.({ block: 'nearest' });
  } else {
    input.removeAttribute('aria-activedescendant');
  }
}

/** The placeholder states what the loaded index really holds, so it cannot drift from the site. */
function describeIndex(all) {
  if (!input || !all.length) return;
  const n = (kind) => all.filter((i) => i.kind === kind).length;
  input.placeholder = `Search ${n('component')} components, ${n('recipe')} recipes, ${n('composite')} composites, foundations…`;
}

async function runFilter() {
  const all = await loadIndex();
  describeIndex(all);
  const q = (input?.value || '').trim().toLowerCase();
  const scored = [];
  for (const item of all) {
    const s = scoreItem(item, q);
    if (s > 0) scored.push([s, item]);
  }
  scored.sort((a, b) => b[0] - a[0] || a[1].title.localeCompare(b[1].title));
  results = scored.slice(0, 36).map(([, item]) => item);
  activeIdx = 0;
  renderResults();
  syncActive();
}

function ensureModal() {
  if (modal) return modal;
  modal = document.createElement('div');
  modal.className = 'site-search-backdrop';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="site-search-dialog" role="dialog" aria-modal="true" aria-label="Search Cieo">
      <div class="site-search-bar">
        <label for="site-search-input" class="site-sr">Search components, motion recipes, composites, and foundations</label>
        <input id="site-search-input" type="search" role="combobox" aria-expanded="false" aria-controls="site-search-list" aria-autocomplete="list" placeholder="Search the library, recipes, composites, foundations…" autocomplete="off">
        <button type="button" class="site-search-esc" data-search-close aria-label="Close search">Esc</button>
      </div>
      <ul id="site-search-list" class="site-search-list" role="listbox" aria-label="Search results"></ul>
      <p class="site-sr" role="status" aria-live="polite" data-search-status></p>
    </div>
  `;
  document.body.appendChild(modal);
  input = modal.querySelector('#site-search-input');
  listEl = modal.querySelector('#site-search-list');
  statusEl = modal.querySelector('[data-search-status]');

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-search-close]')) closeSearch(true);
  });
  input.addEventListener('input', () => { runFilter(); });
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch(true);
    } else if (e.key === 'ArrowDown') {
      if (!results.length) return;
      e.preventDefault();
      activeIdx = (activeIdx + 1) % results.length;
      syncActive();
    } else if (e.key === 'ArrowUp') {
      if (!results.length) return;
      e.preventDefault();
      activeIdx = (activeIdx - 1 + results.length) % results.length;
      syncActive();
    } else if (e.key === 'Enter' && results[activeIdx]) {
      e.preventDefault();
      window.location.href = resolveHref(results[activeIdx].href);
      closeSearch(false);
    } else if (e.key === 'Tab') {
      const closeBtn = modal.querySelector('[data-search-close]');
      if (e.shiftKey && document.activeElement === input) {
        e.preventDefault();
        closeBtn?.focus();
      } else if (!e.shiftKey && document.activeElement === closeBtn) {
        e.preventDefault();
        input.focus();
      }
    }
  });
  return modal;
}

/** While the dialog is open the rest of the page is inert (no focus, no assistive-tech reach) and does not scroll. */
function lockPage(dialogHost) {
  inerted = [...document.body.children].filter((el) => el !== dialogHost && !el.inert && el.tagName !== 'SCRIPT');
  inerted.forEach((el) => { el.inert = true; });
  document.documentElement.style.overflow = 'hidden';
}

function unlockPage() {
  inerted.forEach((el) => { el.inert = false; });
  inerted = [];
  document.documentElement.style.overflow = '';
}

function openSearch(trigger) {
  lastTrigger = trigger || document.activeElement;
  const el = ensureModal();
  el.hidden = false;
  lockPage(el);
  runFilter();
  input?.focus();
  input?.select();
}

function closeSearch(restoreFocus) {
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  input?.setAttribute('aria-expanded', 'false');
  unlockPage();
  if (restoreFocus && lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest?.('[data-search-open]');
  if (btn) {
    e.preventDefault();
    openSearch(btn);
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (modal && !modal.hidden) closeSearch(true);
    else openSearch(document.activeElement);
  }
});

// Phone menu: the two-line button opens the nav panel under the header; Escape or a link closes it.
const menuBtn = document.querySelector('[data-site-menu]');
if (menuBtn) {
  const header = menuBtn.closest('.site-header');
  const setOpen = (open) => { header.toggleAttribute('data-menu-open', open); menuBtn.setAttribute('aria-expanded', String(open)); };
  menuBtn.addEventListener('click', () => setOpen(menuBtn.getAttribute('aria-expanded') !== 'true'));
  header.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setOpen(false); menuBtn.focus(); } });
  header.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}

enhanceCodeBlocks();

// One copy button for every code block on the site. It is the kit's own icon button, and the two glyphs
// (copy, check) swap with the kit's spring easing, so the confirmation moves the way the rest of Cieo does.
const SVG = (path) => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">${path}</svg>`;
const COPY = SVG('<rect x="7" y="7" width="9" height="9" rx="2"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>');
const CHECK = SVG('<path d="m4 10.5 4 4 8-9"/>');

export function copyText(text) {
  return navigator.clipboard?.writeText ? navigator.clipboard.writeText(text).catch(() => {}) : Promise.resolve();
}

// label: what the button does ("Copy code"); getText: reads the text at click time.
export function makeCopyButton(label, getText) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cieo cieo-icon-button copy-button';
  btn.dataset.size = 'sm';
  btn.title = label;
  btn.setAttribute('aria-label', label);
  btn.innerHTML = `<span class="copy-glyph" data-glyph="copy">${COPY}</span><span class="copy-glyph" data-glyph="done">${CHECK}</span>`;
  let timer;
  btn.addEventListener('click', async () => {
    await copyText(getText());
    btn.dataset.copied = '';
    btn.setAttribute('aria-label', 'Copied');
    clearTimeout(timer);
    timer = setTimeout(() => { delete btn.dataset.copied; btn.setAttribute('aria-label', label); }, 1500);
  });
  return btn;
}

// Every plain code block gets a copy button pinned to its corner. Blocks that already carry one are skipped.
export function enhanceCodeBlocks(root = document) {
  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.closest('[data-copy-skip], .copy-wrap') || pre.hasAttribute('role') || pre.closest('.cieo-import-banner')) return;
    const wrap = document.createElement('div');
    wrap.className = 'copy-wrap';
    pre.before(wrap);
    wrap.append(pre, makeCopyButton('Copy code', () => pre.querySelector('code')?.textContent ?? pre.textContent));
  });
}

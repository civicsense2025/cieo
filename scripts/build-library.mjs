#!/usr/bin/env node
// Reassembles docs/library.html from atoms/web (shell, runtime and every block, in blocks.json order).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'atoms/web');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const blocks = JSON.parse(read('blocks.json'));

// Captions: recipe demos keep a trailing `<div class="hint">…</div>` inside
// their stage HTML. The build lifts trailing plain-text hints out of the
// preview and renders the text as a caption below the stage. Block sources
// stay byte-identical in the output (see test/catalogue/build.test.mjs);
// the extraction runs in the page, mirroring gallery.js takeTrailingHint.
const CAPTION_CSS = '\n.ui-tile-caption{margin:0;padding:12px 20px 0;color:var(--muted);font-size:13px;line-height:1.5;overflow-wrap:anywhere}\n';
const CAPTION_JS = `
/* Captions (injected by scripts/build-library.mjs): lift a trailing
   plain-text .hint out of each stage into a caption below it.
   Deferred to idle: below-fold DOM shuffling stays off the critical path. */
;(() => {
  const run = () => {
  const trailing = (node, stage) => {
    let cur = node;
    while (cur && cur !== stage) {
      let sib = cur.nextSibling;
      while (sib) {
        if (sib.nodeType === 1) return false;
        if (sib.nodeType === 3 && sib.textContent.trim() !== '') return false;
        sib = sib.nextSibling;
      }
      cur = cur.parentElement;
    }
    return cur === stage;
  };
  for (const a of A) {
    const stage = a.el && a.el.querySelector('.stage');
    if (!stage) continue;
    const hints = stage.querySelectorAll('.hint');
    if (!hints.length) continue;
    const hint = hints[hints.length - 1];
    if (hint.tagName !== 'DIV' || hint.children.length || !trailing(hint, stage)) continue;
    const text = hint.textContent.trim();
    hint.remove();
    if (!text) continue;
    const cap = document.createElement('p');
    cap.className = 'ui-tile-caption';
    cap.textContent = text;
    stage.after(cap);
  }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2000 });
  else setTimeout(run, 0);
})();
`;
const before = read('shell.library.before.html').replace('</style>', () => `${CAPTION_CSS}</style>`);
const html = before + read('runtime.core.js') + blocks.map((f) => read(f)).join('') + read('runtime.library.page.js') + CAPTION_JS + read('shell.after.html');
const out = process.argv[2] ?? path.join(root, 'docs/library.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`build-library: ${blocks.length} blocks -> ${path.relative(root, out)}`);

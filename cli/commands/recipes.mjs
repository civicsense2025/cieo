import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseArgs, UsageError } from '../lib/args.mjs';
import { packageRoot } from '../lib/paths.mjs';

export const USAGE = `Usage: cieo recipes [--out <file>]

Export a single-file offline HTML bundle of the Motion Atoms recipe library.

Options:
  --out <file>  Output path (defaults to ./catalogue.html).
  --help        Show this help.
`;

const FLAGS = { out: 'string', help: 'boolean' };

const CAPTION_CSS = '\n.ui-tile-caption{margin:0;padding:12px 20px 0;color:var(--muted);font-size:13px;line-height:1.5;overflow-wrap:anywhere}\n';
const CAPTION_JS = `
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

export default async function run(rest) {
  const { flags, positionals } = parseArgs(rest, FLAGS);
  if (flags.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (positionals.length > 1) {
    throw new UsageError(`Unexpected argument '${positionals[1]}' — usage: cieo recipes [--out <file>]`);
  }
  const dest = resolve(process.cwd(), flags.out ?? positionals[0] ?? 'catalogue.html');
  const atomsDir = join(packageRoot(), 'atoms/web');
  const read = (f) => readFileSync(join(atomsDir, f), 'utf8');
  const blocks = JSON.parse(read('blocks.json'));
  const before = read('shell.library.before.html').replace('</style>', () => `${CAPTION_CSS}</style>`);
  const html = before + read('runtime.core.js') + blocks.map((f) => read(f)).join('') + read('runtime.library.page.js') + CAPTION_JS + read('shell.after.html');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  process.stdout.write(`Exported ${blocks.length} motion recipe blocks -> ${dest}\n`);
  return 0;
}

// A tile is a library part drawn live and inert, with its name underneath; the whole tile is the link.
import { readFileSync } from 'node:fs';

export function previewOf(root, dir) {
  const html = readFileSync(`${root}/site/components/${dir}.html`, 'utf8').match(/<!--preview-->([\s\S]*?)<!--\/preview-->/)?.[1] ?? '';
  // Landmarks become plain boxes (a tile is not a page region), and list items get a list to live in so the browser keeps the tile intact.
  const plain = html.replace(/<(\/?)(header|main|footer|nav|aside|section|article|form)\b/g, '<$1div');
  const wrapped = /^\s*<li\b/.test(plain) ? `<ul class="tile-list">${plain}</ul>` : plain;
  // The same markup appears on every page, so ids and the references to them are made unique per tile.
  return wrapped.replace(/\b(id|for|aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g, (_, a, v) => `${a}="${v.split(' ').map((t) => `${t}-t-${dir}`).join(' ')}"`);
}

export const tileHtml = (root, { dir, name }, hrefBase = './') =>
  `<li class="tile"><div class="tile-stage" inert><div class="tile-canvas">${previewOf(root, dir)}</div></div><a class="tile-name" href="${hrefBase}${dir}.html">${name}</a></li>`;

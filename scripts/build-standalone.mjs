#!/usr/bin/env node
// Offline preview bundler for this fixed studio graph, not a general JavaScript bundler.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(resolve(root, name), 'utf8');
const files = (dir) => readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap((entry) => {
  const name = `${dir}/${entry.name}`;
  return entry.isDirectory() ? files(name) : name.endsWith('.js') ? [name] : [];
});
const imports = {};
for (const name of [...files('design'), ...files('docs/studio')]) {
  if (name.includes('/generated/')) continue;
  const source = read(name).replace(/(from\s*|import\s*)(['"])(\.[^'"]+)\2/g, (_, prefix, quote, target) => {
    const resolved = posix.normalize(posix.join(posix.dirname(name), target));
    return `${prefix}${quote}cieo:${resolved}${quote}`;
  });
  imports[`cieo:${name}`] = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}
const css = (name) => read(name).replace(/@import\s+['"]([^'"]+)['"];?/g, (_, target) => css(posix.normalize(posix.join(posix.dirname(name), target))));
let html = read('docs/studio/index.html').replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, name) => `<style>\n${css(posix.normalize(posix.join('docs/studio', name)))}\n</style>`);
html = html.replace('<script type="module" src="./main.js"></script>', `<script type="importmap">${JSON.stringify({ imports }).replaceAll('<', '\\u003c')}</script>\n<script type="module">import 'cieo:docs/studio/main.js';</script>`);
html = html.replace('href="./index.html"', 'href="#preview"')
  .replace('href="../catalogue.html"', 'href="https://github.com/civicsense2025/cieo/blob/main/docs/catalogue.html"')
  .replace('href="../design-system.md"', 'href="https://github.com/civicsense2025/cieo/blob/improvements/portable-design-system/docs/design-system.md"');
const output = resolve(process.argv[2] ?? resolve(root, 'Cieo-studio.html'));
mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, html);
console.log(`standalone: ${relative(root, output)} (${Buffer.byteLength(html)} bytes)`);

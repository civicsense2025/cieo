#!/usr/bin/env node
// Reassembles docs/library.html from atoms/web (shell, runtime and every block, in blocks.json order).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'atoms/web');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const blocks = JSON.parse(read('blocks.json'));
const html = read('shell.library.before.html') + read('runtime.core.js') + blocks.map((f) => read(f)).join('') + read('runtime.library.page.js') + read('shell.after.html');
const out = process.argv[2] ?? path.join(root, 'docs/library.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`build-library: ${blocks.length} blocks -> ${path.relative(root, out)}`);

#!/usr/bin/env node
// One-time split of the Motion Atoms catalogue into atoms/web: runtime (core + page), one file per top-level
// block of the atoms section, and index.json. build-catalogue.mjs reassembles them; the round trip must be exact.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const [src] = process.argv.slice(2);
const html = fs.readFileSync(src, 'utf8');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'atoms/web');
const open = html.indexOf('<script>\n/* ================================================================ core */');
const close = html.lastIndexOf('</script>');
const script = html.slice(open + '<script>\n'.length, close);
const atomsAt = script.indexOf('/* ================================================================ atoms */');
const pageAt = script.indexOf('/* ================================================================ page */');
if (open < 0 || atomsAt < 0 || pageAt < 0) throw new Error('markers not found');

const sf = ts.createSourceFile('atoms.js', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const blocks = [];
for (const s of sf.statements) {
  const start = s.getFullStart();
  if (start < atomsAt || s.getStart() >= pageAt) continue;
  blocks.push({ start, end: s.getEnd() });
}
// The atoms section begins after its marker line, and the last block runs to the page marker.
blocks[0].start = atomsAt;
for (let i = 0; i < blocks.length - 1; i += 1) blocks[i].end = blocks[i + 1].start;
blocks[blocks.length - 1].end = pageAt;

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'blocks'), { recursive: true });
fs.writeFileSync(path.join(out, 'shell.before.html'), html.slice(0, open + '<script>\n'.length));
fs.writeFileSync(path.join(out, 'runtime.core.js'), script.slice(0, atomsAt));
fs.writeFileSync(path.join(out, 'runtime.page.js'), script.slice(pageAt));
fs.writeFileSync(path.join(out, 'shell.after.html'), html.slice(close));

const index = [];
const field = (text, key) => {
  const m = new RegExp(`\\b${key}\\s*:\\s*'((?:[^'\\\\]|\\\\.)*)'`).exec(text);
  return m ? m[1].replace(/\\'/g, "'") : '';
};
blocks.forEach((b, i) => {
  const text = script.slice(b.start, b.end);
  const ids = [...text.matchAll(/atom\(\{\s*id\s*:\s*'([^']+)'/g)].map((m) => m[1]);
  const file = `blocks/${String(i).padStart(3, '0')}-${ids[0] || 'shared'}.js`;
  fs.writeFileSync(path.join(out, file), text);
  for (const m of text.matchAll(/atom\(\{\s*id\s*:\s*'([^']+)'/g)) {
    const at = m.index;
    const chunk = text.slice(at, at + 4000);
    index.push({ id: m[1], category: field(chunk, 'cat'), name: field(chunk, 'name'), summary: field(chunk, 'desc'), file });
  }
});
fs.writeFileSync(path.join(out, 'index.json'), `${JSON.stringify(index, null, 1)}\n`);
fs.writeFileSync(path.join(out, 'blocks.json'), `${JSON.stringify(fs.readdirSync(path.join(out, 'blocks')).sort().map((f) => `blocks/${f}`), null, 1)}\n`);
console.log(`split-atoms: ${blocks.length} blocks, ${index.length} atoms`);

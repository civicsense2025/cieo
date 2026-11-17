#!/usr/bin/env node
// Builds the static site folder Cloudflare serves (.deploy by default).
// Starts from the entry pages, follows every local reference (links, scripts, stylesheets, url(), imports),
// and copies exactly what is reachable, at the same repo-relative paths, so the pages' relative links keep working.
// A reference to a missing file fails the build; nothing unreferenced is published.
// Usage: node scripts/build-deploy.mjs [--out <dir>]
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ENTRY_PAGES = [
  'site/components/index.html', 'site/composites/index.html',
  'docs/catalogue.html', 'docs/controls.html', 'docs/workbench.html', 'docs/library.html', 'docs/collection.html',
  'docs/studio/index.html', 'docs/agent-identity.html',
];
const TEXT = new Set(['.html', '.css', '.js', '.mjs']);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Local references inside one file: [spec, ...]. External, data and fragment-only references are skipped. */
export function localRefs(file, source) {
  const ext = extname(file);
  const found = [];
  if (ext === '.html') {
    // Inline script bodies hold demo markup and templates, not references the browser follows.
    const markup = source.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');
    // Root-absolute links in previews are sample content (a breadcrumb to /library); only stylesheets and scripts must resolve.
    for (const m of markup.matchAll(/<(\w+)\b[^>]*?\b(?:href|src)=["']([^"']+)["']/g)) {
      const needed = m[1] === 'link' || m[1] === 'script';
      if (m[2].startsWith('/') && !m[2].startsWith('//') && !needed) continue;
      found.push(m[2]);
    }
    for (const m of markup.matchAll(/url\(["']?([^"')]+)["']?\)/g)) found.push(m[1]);
  } else if (ext === '.css') {
    for (const m of source.matchAll(/url\(["']?([^"')]+)["']?\)/g)) found.push(m[1]);
    for (const m of source.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) found.push(m[1]);
  } else {
    for (const m of source.matchAll(/(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)["'](\.{1,2}\/[^"']+)["']/g)) found.push(m[1]);
  }
  return found.filter((s) => !/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(s)).map((s) => s.split(/[?#]/)[0]).filter(Boolean);
}

/** Resolves entry pages to the set of repo-relative files to publish, plus any broken references. */
export function collect(repo = root, entries = ENTRY_PAGES) {
  const files = new Set(), missing = [], queue = [...entries];
  while (queue.length) {
    const rel = queue.pop();
    if (files.has(rel)) continue;
    const abs = join(repo, rel);
    if (!existsSync(abs) || !statSync(abs).isFile()) { missing.push(rel); continue; }
    files.add(rel);
    if (!TEXT.has(extname(rel))) continue;
    for (const spec of localRefs(rel, readFileSync(abs, 'utf8'))) {
      if (spec.startsWith('/')) { missing.push(`${rel} -> ${spec} (root-absolute paths break under a path prefix)`); continue; }
      const target = relative(repo, resolve(dirname(abs), spec));
      if (target.startsWith('..') || target.split(sep).includes('node_modules')) { missing.push(`${rel} -> ${spec} (outside the site)`); continue; }
      const abs2 = join(repo, target);
      // A folder link is served as that folder's index page.
      queue.push((existsSync(abs2) && statSync(abs2).isDirectory() ? join(target, 'index.html') : target).split(sep).join('/'));
    }
  }
  return { files: [...files].sort(), missing: missing.sort() };
}

export function build(out, repo = root) {
  const { files, missing } = collect(repo);
  if (missing.length) throw new Error(`Broken references:\n  ${missing.join('\n  ')}`);
  rmSync(out, { recursive: true, force: true });
  for (const f of files) { mkdirSync(dirname(join(out, f)), { recursive: true }); cpSync(join(repo, f), join(out, f)); }
  writeFileSync(join(out, '_redirects'), '/ /site/components/ 302\n');
  writeFileSync(join(out, '_headers'), [
    '/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', '  Permissions-Policy: camera=(), microphone=(), geolocation=()', '',
    '/*.html', '  Cache-Control: public, max-age=300', '',
    '/*.css', '  Cache-Control: public, max-age=3600', '/*.js', '  Cache-Control: public, max-age=3600', '',
  ].join('\n'));
  return files;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--out');
  const out = resolve(root, i > 0 ? process.argv[i + 1] : '.deploy');
  try {
    const files = build(out);
    const bytes = files.reduce((n, f) => n + statSync(join(out, f)).size, 0);
    console.log(`deploy folder: ${files.length} files, ${(bytes / 1048576).toFixed(1)} MB -> ${relative(root, out) || '.'}`);
  } catch (e) { console.error(e.message); process.exit(1); }
}

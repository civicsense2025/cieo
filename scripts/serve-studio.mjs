#!/usr/bin/env node
// Local preview only: loopback binding, no dependencies, no directory listing or write routes.
import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { dirname, resolve, extname, sep, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const port = Number(process.env.PORT ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new RangeError('PORT must be 1024–65535.');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.md': 'text/plain', '.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  const end = (status, text) => { response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end(text); };
  if (!['GET', 'HEAD'].includes(request.method)) { end(405, 'Read-only preview.'); return; }
  try {
    const parsed = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(parsed.pathname);
    const target = await realpath(resolve(root, `.${pathname.endsWith('/') ? pathname + 'index.html' : pathname}`));
    if (!target.startsWith(root + sep) || !['docs', 'design', 'tokens'].includes(relative(root, target).split(sep)[0])) { end(403, 'Outside the preview.'); return; }
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': `${types[extname(target)] ?? 'text/plain'}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'" });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { end(404, 'Not found. Open /docs/studio/.'); }
});
server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Cieo studio: http://127.0.0.1:${port}/docs/studio/`));

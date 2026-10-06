#!/usr/bin/env node
// Renders docs/controls-demo.mjs to static HTML and writes docs/controls.html, which hydrates the same tree.
// Run after npm run build. The static markup is exactly what a server renders, so the page also shows no-JS behaviour.
import fs from 'node:fs';
import path from 'node:path';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Demo } from '../docs/controls-demo.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const REACT = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/react/package.json'), 'utf8')).version;
const body = renderToString(h(Demo));
const cdn = 'https://esm.sh';
const imports = {
  react: `${cdn}/react@${REACT}`,
  'react/jsx-runtime': `${cdn}/react@${REACT}/jsx-runtime`,
  'react-dom/client': `${cdn}/react-dom@${REACT}/client?deps=react@${REACT}`,
};

const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Controls</title>
<link rel="stylesheet" href="../tokens/tokens.css">
<link rel="stylesheet" href="../dist/controls/controls.css">
<style>
:root { color-scheme: light; font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
body { margin: 0; padding: 24px 16px 64px; background: #f4f4f2; color: #111; }
header { max-width: 1240px; margin: 0 auto 20px; display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: baseline; justify-content: space-between; }
header h1 { margin: 0; font-size: 22px; letter-spacing: -0.01em; }
header p { margin: 4px 0 0; color: #555; max-width: 60ch; }
.demo-tools { display: flex; gap: 16px; align-items: center; font-size: 13px; }
.demo-panels { max-width: 1240px; margin: 0 auto 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 560px), 1fr)); gap: 20px; }
.demo-panel { box-sizing: border-box; max-width: 1240px; margin: 0 auto; width: 100%; padding: 20px; border-radius: 16px; background: var(--panel); color: var(--cieo-control-fg); border: 1px solid var(--cieo-control-border); }
.demo-panel h2 { margin: 0 0 4px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--cieo-control-muted); }
.demo-panel[data-theme="light"] {
  color-scheme: light; --panel: #fff;
  --cieo-control-bg: #fff; --cieo-control-fg: #111; --cieo-control-muted: #6b6b6b;
  --cieo-control-border: rgb(0 0 0 / 0.16); --cieo-control-border-strong: rgb(0 0 0 / 0.42); --cieo-control-raised: #f1f1ef;
  --cieo-control-accent: #111; --cieo-control-accent-fg: #fff; --cieo-control-success: #4a6b1f; --cieo-control-danger: #b0342f; --cieo-control-success-fg: #fff;
}
.demo-panel[data-theme="dark"] {
  color-scheme: dark; --panel: #161616;
  --cieo-control-bg: #1f1f1f; --cieo-control-fg: #f2f2f0; --cieo-control-muted: #a3a3a0;
  --cieo-control-border: rgb(255 255 255 / 0.16); --cieo-control-border-strong: rgb(255 255 255 / 0.42); --cieo-control-raised: #2c2c2b;
  --cieo-control-popover-bg: #242424; --cieo-control-knob: #f2f2f0;
  --cieo-control-accent: #f2f2f0; --cieo-control-accent-fg: #111; --cieo-control-success: #a6cf7c; --cieo-control-danger: #f08a84; --cieo-control-success-fg: #111;
  --cieo-control-shadow: 0 12px 32px rgb(0 0 0 / 0.5);
}
.demo-panel[data-theme="dark"] .cieo-switch-knob { box-shadow: none; }
.demo-panel[data-theme="dark"] .cieo-toggle-input:checked + .cieo-switch-track .cieo-switch-knob { background: #111; }
.demo-section { padding: 16px 0; border-bottom: 1px solid var(--cieo-control-border); }
.demo-section:last-child { border-bottom: 0; }
.demo-section h3 { margin: 0 0 12px; font-size: 13px; font-weight: 600; }
.demo-row { display: flex; flex-wrap: wrap; gap: 12px 16px; align-items: flex-start; }
.demo-row > .cieo-field, .demo-row > .cieo-search:not([data-collapsible]) { flex: 1 1 220px; }
.demo-row > .cieo-field--textarea { flex-basis: 100%; }
.demo-row > .cieo-range { flex: 1 1 100%; }
.demo-stack { display: grid; gap: 8px; }
.demo-section:first-child .demo-row { align-items: center; }
.demo-form { display: flex; flex-wrap: wrap; gap: 12px 16px; align-items: flex-end; }
.demo-form > .cieo-field, .demo-form > .cieo-search { flex: 1 1 200px; }
.demo-out { max-width: 1240px; margin: 12px auto 0; font: 13px/1.4 ui-monospace, Menlo, monospace; color: var(--cieo-control-muted); }
code { font: 12px ui-monospace, Menlo, monospace; }
</style>
<header>
  <div><h1>Controls</h1><p>Form controls for cieo/controls. Server-rendered, then hydrated: with scripts off every control still works and the filter form submits the same values.</p></div>
  <div class="demo-tools">
    <label><input type="checkbox" id="reduce"> Reduced motion</label>
  </div>
</header>
<div id="root">${body}</div>
<p class="demo-out" id="submitted"></p>
<script type="importmap">${JSON.stringify({ imports })}</script>
<script type="module">
import { createElement as h } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Demo } from './controls-demo.mjs';
const out = document.getElementById('submitted');
const q = new URLSearchParams(location.search);
if (out && [...q].length) out.textContent = 'Submitted: ' + q.toString();
hydrateRoot(document.getElementById('root'), h(Demo), { onRecoverableError: (e) => console.error('hydration', e) });
document.getElementById('reduce').addEventListener('change', (e) => {
  document.documentElement.dataset.motion = e.currentTarget.checked ? 'reduced' : '';
  document.dispatchEvent(new Event('motion:change'));
});
window.__hydrated = true;
</script>
</html>
`;
const out = path.join(root, 'docs/controls.html');
fs.writeFileSync(out, html);
console.log(`build-controls-demo: wrote ${path.relative(root, out)} (react ${REACT})`);

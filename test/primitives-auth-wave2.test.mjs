// test/primitives-auth-wave2.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AuthPasskeyButton keeps its accessible name and signals pending by text plus aria-busy', () => {
  const src = readFileSync('src/primitives/AuthPasskeyButton/AuthPasskeyButton.tsx', 'utf8');
  assert.match(src, /Continue with a passkey/);
  assert.match(src, /aria-busy/);
  assert.match(src, /Waiting for your passkey/);
  assert.match(src, /onPress/);
  assert.match(src, /disabled=\{/);
});

test('AuthPasskeyButton shows a text fallback note when WebAuthn is unsupported', () => {
  const src = readFileSync('src/primitives/AuthPasskeyButton/AuthPasskeyButton.tsx', 'utf8');
  assert.match(src, /supported/);
  assert.match(src, /passkey/i);
  assert.match(src, /password|code/);
});

test('AuthSsoButtons renders one named button per provider with pending by text plus aria-busy', () => {
  const src = readFileSync('src/primitives/AuthSsoButtons/AuthSsoButtons.tsx', 'utf8');
  assert.match(src, /providers/);
  assert.match(src, /pendingId/);
  assert.match(src, /onPress\??:\s*\(id/);
  assert.match(src, /aria-busy/);
  assert.match(src, /Connecting to/);
});

test('Wave 2 manifests carry the passkey atom and SSO molecule ids', () => {
  const pk = JSON.parse(readFileSync('src/primitives/AuthPasskeyButton/manifest.json', 'utf8'));
  assert.equal(pk.id, 'core.auth-passkey-button');
  assert.equal(pk.layer, 'atom');
  const sso = JSON.parse(readFileSync('src/primitives/AuthSsoButtons/manifest.json', 'utf8'));
  assert.equal(sso.id, 'core.auth-sso-buttons');
  assert.equal(sso.layer, 'molecule');
  const pendingId = sso.properties.find((p) => p.id === 'pendingId');
  assert.ok(pendingId, 'sso manifest documents pendingId');
});

test('Wave 2 CSS keeps 44px targets with a 2px accent focus and a reduced-motion block', () => {
  for (const f of ['design/styles/primitives/auth-passkey-button.css', 'design/styles/primitives/auth-sso-buttons.css']) {
    const css = readFileSync(f, 'utf8');
    assert.match(css, /44px|2\.75rem/);
    assert.match(css, /:focus-visible/);
    assert.match(css, /2px solid/);
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /pointer:\s*coarse/);
  }
});

test('Wave 2 recipes use 1.5px muted edges, 44px buttons, inline text errors, and trailing hints', () => {
  const src = readFileSync('atoms/web/blocks/559-auth-wave2.js', 'utf8');
  assert.match(src, /id:'auth-passkey'/);
  assert.match(src, /id:'auth-sso'/);
  assert.match(src, /1\.5px solid var\(--muted\)/);
  assert.match(src, /height:44px/);
  assert.match(src, /role="alert"|role="status"/);
  assert.match(src, /<div class="hint">[^<]*<\/div>/);
});

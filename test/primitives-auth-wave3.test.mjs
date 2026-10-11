// test/primitives-auth-wave3.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AuthInviteAccept names the org on both action buttons', () => {
  const src = readFileSync('src/primitives/AuthInviteAccept/AuthInviteAccept.tsx', 'utf8');
  assert.match(src, /orgName/);
  assert.match(src, /Accept invite to /);
  assert.match(src, /Decline invite to /);
  assert.match(src, /inviterName/);
  assert.match(src, /role="alert"|role="status"/);
});

test('AuthInviteAccept manifest is a molecule with accept/decline events', () => {
  const m = JSON.parse(readFileSync('src/primitives/AuthInviteAccept/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.auth-invite-accept');
  assert.equal(m.layer, 'molecule');
  assert.ok(m.properties.find((p) => p.id === 'orgName' && p.required));
  assert.ok(m.events.find((e) => e.id === 'onAccept'));
  assert.ok(m.events.find((e) => e.id === 'onDecline'));
});

test('AuthSessionList uses list roles and names each revoke button per device', () => {
  const src = readFileSync('src/primitives/AuthSessionList/AuthSessionList.tsx', 'utf8');
  assert.match(src, /role="list"/);
  assert.match(src, /role="listitem"/);
  assert.match(src, /This device/);
  assert.match(src, /Revoke .*session/);
  assert.match(src, /onRevoke/);
});

test('AuthSessionList manifest is a molecule with a sessions array', () => {
  const m = JSON.parse(readFileSync('src/primitives/AuthSessionList/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.auth-session-list');
  assert.equal(m.layer, 'molecule');
  assert.ok(m.properties.find((p) => p.id === 'sessions' && p.required));
});

test('AuthAccountCard gates sign out behind inline Confirm/Cancel', () => {
  const src = readFileSync('src/primitives/AuthAccountCard/AuthAccountCard.tsx', 'utf8');
  assert.match(src, /Sign out of all devices\?/);
  assert.match(src, /Confirm/);
  assert.match(src, /Cancel/);
  assert.match(src, /signOutConfirm/);
  assert.match(src, /avatarInitials/);
});

test('AuthAccountCard manifest is an organism with signOutConfirm default false', () => {
  const m = JSON.parse(readFileSync('src/primitives/AuthAccountCard/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.auth-account-card');
  assert.equal(m.layer, 'organism');
  const flag = m.properties.find((p) => p.id === 'signOutConfirm');
  assert.ok(flag && flag.default === false);
});

test('Wave 3 CSS uses flat surfaces, 2px accent focus, and reduced motion', () => {
  for (const f of ['auth-invite-accept', 'auth-session-list', 'auth-account-card']) {
    const css = readFileSync(`design/styles/primitives/${f}.css`, 'utf8');
    assert.match(css, /:focus-visible/);
    assert.match(css, /2px solid/);
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /pointer:\s*coarse|min-height:\s*2\.75rem/);
  }
});

test('Wave 3 CSS avoids hairline borders on cards', () => {
  for (const f of ['auth-invite-accept', 'auth-session-list', 'auth-account-card']) {
    const css = readFileSync(`design/styles/primitives/${f}.css`, 'utf8');
    assert.doesNotMatch(css, /1px solid/);
  }
});

test('Wave 3 doc pages carry the catalogue markers and a prev/next chain', () => {
  const pages = [
    ['site/components/AuthInviteAccept.html', 'AuthInviteAccept'],
    ['site/components/AuthSessionList.html', 'AuthSessionList'],
    ['site/components/AuthAccountCard.html', 'AuthAccountCard'],
  ];
  for (const [file, name] of pages) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, new RegExp(`<title>${name} · Cieo</title>`));
    assert.match(html, /<span data-level>(molecule|organism)<\/span>/);
    assert.match(html, new RegExp(`<h1>${name}<\/h1>`));
    assert.match(html, /<div data-preview>/);
    assert.match(html, /<div role="tablist"/);
    assert.match(html, /<code data-code>/);
    assert.match(html, /<tbody>.*<\/tbody>/s);
    assert.match(html, /<div data-do>/);
    assert.match(html, /<div data-dont>/);
    assert.match(html, /<a data-prev/);
    assert.match(html, /<a data-next/);
  }
  const invite = readFileSync('site/components/AuthInviteAccept.html', 'utf8');
  assert.match(invite, /href="\.\/AuthSessionList\.html"/);
  const sessions = readFileSync('site/components/AuthSessionList.html', 'utf8');
  assert.match(sessions, /href="\.\/AuthAccountCard\.html"/);
});

test('Wave 3 recipes exist with visible confirmation states and hints', () => {
  const src = readFileSync('atoms/web/blocks/560-auth-wave3.js', 'utf8');
  for (const id of ['auth-invite', 'auth-sessions', 'auth-account']) {
    assert.match(src, new RegExp(`id:'${id}'`));
  }
  assert.match(src, /<div class="hint">[^<]*<\/div>/);
  assert.match(src, /This device/);
  assert.match(src, /Sign out of all devices\?/);
  assert.match(src, /height:44px/);
});

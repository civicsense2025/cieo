import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('onboarding renders every step with scripts disabled', () => {
  const html = readFileSync('site/composites/onboarding.html', 'utf8');
  for (const s of ['Get set up in four short moves', 'Welcome to Cieo', 'Tell us who is joining', 'Display name', 'Pick an avatar', 'Shape the workspace', 'Digest emails', 'All set', 'Invite a teammate', 'CIEO-START-7Q2D', 'Copy invite code', 'Start over', 'Skip setup', 'Skip this step']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});

test('onboarding uses shipped parts with linked built-from', () => {
  const html = readFileSync('site/composites/onboarding.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 8, 'data-parts missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.ok(!parts.includes('Button'), 'native buttons only — Button primitive must not ship');
  assert.ok(html.includes('<section data-built-from>') || html.includes('<section class="onboard-built" data-built-from>'), 'built-from section missing');
  for (const p of parts) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
});

test('onboarding JS steps, validates, and copies locally without network', () => {
  const html = readFileSync('site/composites/onboarding.html', 'utf8');
  const js = readFileSync('site/composites/onboarding.js', 'utf8');
  for (const s of ['data-step-panel', 'data-step', 'data-next', 'data-back', 'data-skip', 'data-progress', 'data-referral-code', 'data-copy', 'data-restart', 'navigator.clipboard', 'execCommand', 'fallback', 'CIEO-']) {
    assert.ok(js.includes(s), `JS missing hook: ${s}`);
  }
  for (const bad of ['fetch(', 'XMLHttpRequest']) {
    assert.ok(!js.includes(bad) && !html.includes(bad), `network marker: ${bad}`);
  }
});

test('onboarding carries no foreign markers', () => {
  const html = readFileSync('site/composites/onboarding.html', 'utf8');
  const js = readFileSync('site/composites/onboarding.js', 'utf8');
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!html.toLowerCase().includes(bad) && !js.toLowerCase().includes(bad), `foreign marker: ${bad}`);
  }
});

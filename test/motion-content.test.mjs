import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('content animations are token-driven and guarded', () => {
  for (const dir of ['Avatar','AvatarGroup','AvatarGroupOverflow','AvatarStatusDot','Badge','Text','Icon','Kbd','Code','CodeBlock','Heading','Blockquote','Citation','Markdown','Thumbnail','Token','StatusDot','EmptyState','Banner','Timer','Timestamp','Skeleton']) {
    const p = `design/styles/primitives/${dir.toLowerCase()}.css`;
    if (!existsSync(p)) continue;
    const css = readFileSync(p,'utf8');
    if (/(animation|transition|@keyframes)/.test(css)) assert.ok(css.includes('var(--motion-') || css.includes('prefers-reduced-motion'), `${dir} animates without token or guard`);
  }
});

test('Skeleton exposes motion contract', () => {
  const src = readFileSync('src/primitives/Skeleton/Skeleton.tsx','utf8');
  assert.match(src, /data-motion=\{motion === false \? 'off' : undefined\}/);
  const m = JSON.parse(readFileSync('src/primitives/Skeleton/manifest.json','utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
});

test('Skeleton period is token-driven', () => {
  const css = readFileSync('design/styles/primitives/skeleton.css','utf8');
  assert.ok(!css.includes('1.5s'));
  assert.match(css, /var\(--motion-duration-lazy/);
});

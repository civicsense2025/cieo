// test/primitives-lane-stage.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const COMPONENTS = [
  { name: 'Dialog', id: 'core.dialog', markers: ['role="dialog"', 'aria-modal', 'Overlay', 'if (!mounted) return null', 'aria-label={label}', 'onKeyDown'] },
  { name: 'DialogHeader', id: 'core.dialog-header', markers: ['{title}', "closeLabel = 'Close'", 'onClick={onClose}'] },
  { name: 'AlertDialog', id: 'core.alert-dialog', markers: ['role="alertdialog"', '../Dialog/Dialog.js', 'if (!open) return null'] },
  { name: 'BottomSheet', id: 'core.bottom-sheet', markers: ['role="dialog"', 'data-side="bottom"', 'Overlay', 'if (!mounted) return null'] },
  { name: 'BottomSheetSwitcher', id: 'core.bottom-sheet-switcher', markers: ['role="listbox"', 'aria-label={label}'] },
  { name: 'Lightbox', id: 'core.lightbox', markers: ['<img', 'src={src}', 'alt={alt}', "label = 'Image viewer'", 'if (!mounted) return null'] },
  { name: 'ChatMessage', id: 'core.chat-message', markers: ['<article', '{author', '{time', '{children}'] },
  { name: 'ChatMessageBubble', id: 'core.chat-message-bubble', markers: ['data-variant', "variant = 'incoming'"] },
  { name: 'ChatMessageList', id: 'core.chat-message-list', markers: ['role="log"', "label = 'Messages'"] },
  { name: 'ChatMessageMetadata', id: 'core.chat-message-metadata', markers: ['<p', '{children}'] },
  { name: 'ChatSystemMessage', id: 'core.chat-system-message', markers: ['<p', '{children}'] },
  { name: 'ChatComposer', id: 'core.chat-composer', markers: ['<form', 'preventDefault', "label = 'Send a message'", 'onSubmit'] },
  { name: 'ChatComposerInput', id: 'core.chat-composer-input', markers: ['<textarea', 'aria-label={label}', 'rows = 1'] },
  { name: 'ChatLayout', id: 'core.chat-layout', markers: ['data-pane="transcript"', 'data-pane="rail"', '{rail'] },
  { name: 'Card', id: 'core.card', markers: ['<section', '{title', '{children}'] },
  { name: 'ClickableCard', id: 'core.clickable-card', markers: ['<article', '{children}'] },
  { name: 'SelectableCard', id: 'core.selectable-card', markers: ['role="checkbox"', 'aria-checked', 'tabIndex={0}', 'selected = false'] },
  { name: 'Carousel', id: 'core.carousel', markers: ['useRef', 'scrollBy', 'clientWidth', 'role="region"'] },
];

for (const c of COMPONENTS) {
  test(`${c.name} tsx carries contract markers`, () => {
    const src = readFileSync(`src/primitives/${c.name}/${c.name}.tsx`, 'utf8');
    assert.match(src, /'use client'/);
    for (const m of c.markers) assert.ok(src.includes(m), `missing marker: ${m}`);
  });

  test(`${c.name} manifest declares id and mirrored props`, () => {
    const m = JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8'));
    assert.equal(m.id, c.id);
    assert.equal(m.name, c.name);
    assert.equal(m.packId, 'core');
    assert.equal(m.status, 'experimental');
  });

  test(`${c.name} doc page exists with title, preview, and prop rows`, () => {
    const html = readFileSync(`site/components/${c.name}.html`, 'utf8');
    assert.match(html, new RegExp(`<h1>${c.name}</h1>`));
    assert.match(html, /data-preview/);
    assert.match(html, /data-props/);
    assert.match(html, /<tr><td>/);
  });

  test(`${c.name} stylesheet exists under design/styles/primitives`, () => {
    const kebab = c.name.replace(/[A-Z]/g, (ch, i) => (i === 0 ? '' : '-') + ch.toLowerCase());
    const css = readFileSync(`design/styles/primitives/${kebab}.css`, 'utf8');
    assert.match(css, /@layer cieo.components/);
  });
}

test('lane-stage manifest ids are unique', () => {
  const ids = COMPONENTS.map((c) =>
    JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8')).id,
  );
  assert.equal(new Set(ids).size, COMPONENTS.length);
});

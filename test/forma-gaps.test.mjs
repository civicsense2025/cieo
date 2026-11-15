// Forma gaps: the six new primitives plus the three covered-with-addition hooks.
// Render assertions run against dist/ (npm test builds first); contract markers
// against src/; motion and token rules against the stylesheets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { DropZone } from '../dist/primitives/DropZone/DropZone.js';
import { CompareCurtain } from '../dist/primitives/CompareCurtain/CompareCurtain.js';
import { PreviewStage } from '../dist/primitives/PreviewStage/PreviewStage.js';
import { Toast } from '../dist/primitives/Toast/Toast.js';
import { ClipRange, formatClipTime } from '../dist/primitives/ClipRange/ClipRange.js';
import { PaletteSwatches } from '../dist/primitives/PaletteSwatches/PaletteSwatches.js';
import { SegmentedControl } from '../dist/primitives/SegmentedControl/SegmentedControl.js';
import { SegmentedControlItem } from '../dist/primitives/SegmentedControlItem/SegmentedControlItem.js';
import { NumberInput } from '../dist/primitives/NumberInput/NumberInput.js';
import { buttonClassName } from '../dist/controls/classes.js';

const src = (name) => readFileSync(`src/primitives/${name}/${name}.tsx`, 'utf8');
const css = (file) => readFileSync(`design/styles/primitives/${file}`, 'utf8');

test('DropZone renders one tab stop: an explicit button, never an implicit label', () => {
  const html = renderToStaticMarkup(h(DropZone, { label: 'Source image', chooseLabel: 'Choose image', hint: 'PNG or JPEG', onFiles() {} }));
  assert.match(html, /role="region"/);
  assert.match(html, /aria-label="Source image"/);
  assert.match(html, /<span class="cieo-btn-text">Choose image<\/span><\/button>/);
  assert.match(html, /type="file"/);
  assert.match(html, /tabindex="-1"/i);
  assert.match(html, /PNG or JPEG/);
  const code = src('DropZone');
  assert.ok(code.includes('input.current?.click()'), 'button activates the input');
  assert.ok(!code.includes('<label'), 'no wrapping label, so no implicit activation');
  assert.ok(code.includes('onDragEnter') && code.includes('onDrop'), 'drag handlers owned');
  assert.ok(code.includes('role="alert"'), 'error announces once');
});

test('DropZone error state marks the zone and announces', () => {
  const html = renderToStaticMarkup(h(DropZone, { label: 'Source image', chooseLabel: 'Choose image', error: 'Too large', onFiles() {} }));
  assert.match(html, /data-error="true"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /Too large/);
});

test('CompareCurtain is a slider with keyboard support and live text', () => {
  const html = renderToStaticMarkup(h(CompareCurtain, { label: 'Comparison divider', valueText: 'vector result visible', before: 'a', after: 'b', position: 42, onMove() {} }));
  assert.match(html, /role="slider"/);
  assert.match(html, /aria-label="Comparison divider"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="100"/);
  assert.match(html, /aria-valuenow="42"/);
  assert.match(html, /aria-valuetext="42 percent vector result visible"/);
  assert.match(html, /clip-path:\s*inset\(0 58/);
  const code = src('CompareCurtain');
  for (const marker of ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'useSpring', 'setPointerCapture', 'aria-orientation']) {
    assert.ok(code.includes(marker), `missing marker: ${marker}`);
  }
});

test('PreviewStage regions, toolbar, and backdrop switch render with names', () => {
  const html = renderToStaticMarkup(h(PreviewStage, {
    label: 'Vector result', zoom: 2, onZoomChange() {}, fitted: false, onFitChange() {},
    backdrop: 'light', onBackdropChange() {}, children: 'art',
  }));
  assert.match(html, /role="region"/);
  assert.match(html, /aria-label="Vector result"/);
  assert.match(html, /aria-label="Zoom in"/);
  assert.match(html, /aria-label="Zoom out"/);
  assert.match(html, /aria-label="Reset zoom"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /aria-label="Preview backdrop"/);
  assert.match(html, /data-backdrop="light"/);
  const code = src('PreviewStage');
  assert.ok(code.includes('SegmentedControl'), 'backdrop reuses the segmented control');
  assert.ok(code.includes('Digits'), 'zoom readout rolls');
});

test('Toast announces once and names its dismiss', () => {
  const info = renderToStaticMarkup(h(Toast, { message: 'Saved', open: true, onDone() {} }));
  assert.match(info, /role="status"/);
  assert.match(info, /Saved/);
  assert.match(info, /aria-label="Dismiss"/);
  const danger = renderToStaticMarkup(h(Toast, { message: 'Failed', tone: 'danger', open: true, onDone() {}, duration: 0, children: 'x' }));
  assert.match(danger, /role="alert"/);
  const code = src('Toast');
  for (const marker of ['usePresence', 'useDismiss', 'setTimeout', 'duration <= 0']) {
    assert.ok(code.includes(marker), `missing marker: ${marker}`);
  }
});

test('ClipRange pairs two labelled native sliders with a tied readout', () => {
  const html = renderToStaticMarkup(h(ClipRange, { label: 'Clip range', startLabel: 'Start', lengthLabel: 'Length', max: 12, start: 2, length: 4, onStartChange() {}, onLengthChange() {} }));
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Clip range"/);
  assert.match(html, /<label[^>]*>Start<\/label>/);
  assert.match(html, /<label[^>]*>Length<\/label>/);
  assert.equal((html.match(/type="range"/g) || []).length, 2);
  assert.match(html, /0:02\.0 – 0:06\.0/);
});

test('formatClipTime renders m:ss.t and clamps garbage', () => {
  assert.equal(formatClipTime(0), '0:00.0');
  assert.equal(formatClipTime(65.25), '1:05.2');
  assert.equal(formatClipTime(125.9), '2:05.9');
  assert.equal(formatClipTime(-3), '0:00.0');
  assert.equal(formatClipTime(Number.NaN), '0:00.0');
});

test('ClipRange length ceiling follows the start', () => {
  const html = renderToStaticMarkup(h(ClipRange, { label: 'Clip range', startLabel: 'Start', lengthLabel: 'Length', max: 12, start: 11, length: 4, onStartChange() {}, onLengthChange() {} }));
  assert.match(html, /0:11\.0 – 0:12\.0/);
});

test('PaletteSwatches is a radiogroup of named radios sharing one name', () => {
  const swatches = [
    { value: '#1F201C', label: 'Ink #1F201C', color: '#1F201C' },
    { value: '#3D63DD', label: 'Focus #3D63DD', color: '#3D63DD' },
  ];
  const html = renderToStaticMarkup(h(PaletteSwatches, { label: 'Vector colors', name: 'fill', swatches, value: '#1F201C', onValueChange() {} }));
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /aria-label="Vector colors"/);
  assert.equal((html.match(/type="radio"/g) || []).length, 2);
  assert.match(html, /name="fill"/);
  assert.match(html, /aria-label="Ink #1F201C"/);
  assert.match(html, /checked/);
  const code = src('PaletteSwatches');
  assert.ok(!code.includes('role="radio"'), 'native radios carry the semantics, not divs');
});

test('pill shape composes on buttons and link-styled anchors', () => {
  assert.equal(buttonClassName({ shape: 'pill' }), 'cieo-ctl cieo-btn cieo-btn--secondary cieo-btn--md cieo-btn--pill');
  assert.equal(buttonClassName({ variant: 'primary', size: 'sm', shape: 'pill' }), 'cieo-ctl cieo-btn cieo-btn--primary cieo-btn--sm cieo-btn--pill');
  assert.equal(buttonClassName(), 'cieo-ctl cieo-btn cieo-btn--secondary cieo-btn--md');
  assert.match(readFileSync('src/controls/controls.css', 'utf8'), /\.cieo-btn--pill\s*\{\s*border-radius:\s*var\(--cieo-radius-pill/);
});

test('SegmentedControlItem renders link semantics when href is set', () => {
  const link = renderToStaticMarkup(h(SegmentedControl, { label: 'Tools', value: 'vectorize' }, h(SegmentedControlItem, { value: 'vectorize', href: '/vectorize' }, 'Vectorize')));
  assert.match(link, /<a[^>]*href="\/vectorize"/);
  assert.match(link, /aria-current="page"/);
  assert.ok(!link.includes('aria-pressed'), 'links use aria-current, not aria-pressed');
  const button = renderToStaticMarkup(h(SegmentedControl, { label: 'Tools', value: 'week' }, h(SegmentedControlItem, { value: 'week' }, 'Week')));
  assert.match(button, /<button[^>]*aria-pressed="true"/);
});

test('NumberInput renders its unit after the input', () => {
  const html = renderToStaticMarkup(h(NumberInput, { label: 'Longest edge', unit: 'px', value: 512, onChange() {} }));
  assert.match(html, /<span class="cieo-input-unit">px<\/span>/);
  const plain = renderToStaticMarkup(h(NumberInput, { label: 'Qty', value: 1, onChange() {} }));
  assert.ok(!plain.includes('cieo-input-unit'), 'no unit span without the prop');
});

test('new stylesheets read tokens and guard motion', () => {
  for (const file of ['dropzone.css', 'compare-curtain.css', 'preview-stage.css', 'toast.css', 'clip-range.css', 'palette-swatches.css', 'number-input.css']) {
    const content = css(file);
    assert.ok(content.includes('@layer cieo.components'), `${file} missing layer`);
    assert.ok(!/var\(--(?!cieo-|motion-)/.test(content), `${file} references a non-token variable`);
  }
  for (const file of ['dropzone.css', 'preview-stage.css', 'palette-swatches.css']) {
    assert.match(css(file), /prefers-reduced-motion/, `${file} animates without a reduced-motion guard`);
  }
  assert.match(readFileSync('src/controls/controls.css', 'utf8'), /--cieo-radius-pill/);
});

test('new primitives are exported, registered, and documented', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const barrel = readFileSync('src/primitives/index.ts', 'utf8');
  const index = JSON.parse(readFileSync('registry/index.json', 'utf8'));
  for (const name of ['DropZone', 'CompareCurtain', 'PreviewStage', 'Toast', 'ClipRange', 'PaletteSwatches']) {
    assert.ok(pkg.exports[`./${name}`], `package export missing: ${name}`);
    assert.ok(barrel.includes(`from './${name}/${name}.js'`), `barrel missing: ${name}`);
    assert.ok(index.components[name], `registry index missing: ${name}`);
    assert.ok(existsSync(`site/components/${name}.html`), `doc page missing: ${name}`);
    assert.ok(existsSync(`src/primitives/${name}/manifest.json`), `manifest missing: ${name}`);
    assert.ok(existsSync(`src/primitives/${name}/README.md`), `readme missing: ${name}`);
    const html = readFileSync(`site/components/${name}.html`, 'utf8');
    assert.ok(html.includes(`<h1>${name}</h1>`), `doc h1 missing: ${name}`);
  }
});

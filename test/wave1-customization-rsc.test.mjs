import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { TopicChip } from '../dist/primitives/TopicChip/TopicChip.js';
import { LegendItem } from '../dist/primitives/LegendItem/LegendItem.js';
import { RollCall } from '../dist/primitives/RollCall/RollCall.js';
import { Portrait } from '../dist/primitives/Portrait/Portrait.js';
import { CompareCurtain } from '../dist/primitives/CompareCurtain/CompareCurtain.js';
import { PaletteSwatches } from '../dist/primitives/PaletteSwatches/PaletteSwatches.js';
import { PreviewStage } from '../dist/primitives/PreviewStage/PreviewStage.js';
import { IconButton } from '../dist/primitives/IconButton/IconButton.js';
import { Button, Select, TextField, TextArea, SearchField, Checkbox, Switch, RadioGroup, Radio, Range } from '../dist/controls/index.js';
import { Selector } from '../dist/primitives/Selector/Selector.js';
import { Slider } from '../dist/primitives/Slider/Slider.js';
import { PowerSearch } from '../dist/primitives/PowerSearch/PowerSearch.js';
import { CheckboxInput } from '../dist/primitives/CheckboxInput/CheckboxInput.js';
import * as Primitives from '../dist/primitives/index.js';

const PURE_RSC = [
  'Stack', 'HStack', 'VStack', 'Grid', 'GridSpan', 'Center', 'Section',
  'Text', 'Heading', 'Icon', 'Badge', 'Divider', 'Kbd', 'Code',
  'Blockquote', 'Citation', 'Card', 'BigNumber', 'BlockPanel',
  'Table', 'TableBody', 'TableRow', 'TableCell', 'TableFooter', 'TableHeader',
];

test('Bug Class A: TopicChip, LegendItem, RollCall, Portrait preserve slotProps.root.style while protecting owned vars/geometry', () => {
  const chipPlain = render(h(TopicChip, { slotProps: { root: { style: { paddingInline: 10 } } } }, 'Civic'));
  assert.match(chipPlain, /class="cieo cieo-p-topic-chip"/);
  assert.match(chipPlain, /padding-inline:10px/);

  const chipDot = render(h(TopicChip, { dot: '#e45', slotProps: { root: { style: { paddingInline: 10, '--cieo-topic-dot': '#000' } } } }, 'Civic'));
  assert.match(chipDot, /padding-inline:10px/);
  assert.match(chipDot, /--cieo-topic-dot:#e45/);
  assert.doesNotMatch(chipDot, /--cieo-topic-dot:#000/);

  const legend = render(h(LegendItem, { color: '#2468ac', slotProps: { root: { style: { marginInlineEnd: 12, '--cieo-legend': '#000' } } } }, 'Passed'));
  assert.match(legend, /class="cieo cieo-p-legend-item"/);
  assert.match(legend, /margin-inline-end:12px/);
  assert.match(legend, /--cieo-legend:#2468ac/);

  const roll = render(h(RollCall, {
    columns: 2,
    groups: [{ id: 'g1', title: 'Aye', color: '#3a7', members: [{ id: 'm1', name: 'Ada' }] }],
    slotProps: { root: { style: { gap: 20, columnCount: 99 } } },
  }));
  assert.match(roll, /class="cieo cieo-p-roll-call"/);
  assert.match(roll, /gap:20px/);
  assert.match(roll, /column-count:2/);
  assert.doesNotMatch(roll, /column-count:99/);

  const portrait = render(h(Portrait, { src: '/a.png', ring: '#123', slotProps: { root: { style: { opacity: 0.9, '--cieo-portrait-ring': '#fff' } } } }));
  assert.match(portrait, /class="cieo cieo-p-portrait"/);
  assert.match(portrait, /opacity:0\.9/);
  assert.match(portrait, /--cieo-portrait-ring:#123/);
});

test('Bug Class B: CompareCurtain, PaletteSwatches, PreviewStage, IconButton preserve owned geometry and merge caller styles', () => {
  const curtain = render(h(CompareCurtain, {
    label: 'Compare',
    valueText: 'after visible',
    before: 'A',
    after: 'B',
    position: 40,
    slotProps: {
      after: { style: { opacity: 0.85, clipPath: 'none' } },
      divider: { style: { width: 4, insetInlineStart: '99%' } },
    },
  }));
  assert.match(curtain, /opacity:0\.85/);
  assert.match(curtain, /clip-path:inset\(0 60\.00% 0 0\)/);
  assert.match(curtain, /width:4px/);
  assert.match(curtain, /inset-inline-start:40\.00%/);

  const swatches = render(h(PaletteSwatches, {
    label: 'Colors',
    name: 'c',
    swatches: [{ value: 'ink', label: 'Ink', color: '#1f201c' }],
    slotProps: { dot: { style: { outlineOffset: 3, backgroundColor: '#ffffff' } } },
  }));
  assert.match(swatches, /outline-offset:3px/);
  assert.match(swatches, /background-color:#1f201c/);

  const stage = render(h(PreviewStage, {
    label: 'Stage',
    fitted: false,
    zoom: 2,
    slotProps: { media: { style: { opacity: 0.75, scale: '99' } } },
  }, 'Art'));
  assert.match(stage, /opacity:0\.75/);
  assert.match(stage, /scale:2\b/);
  assert.doesNotMatch(stage, /scale:99/);

  const ib = render(h(IconButton, {
    label: 'Close',
    style: { color: 'rgb(10, 20, 30)' },
    slotProps: { root: { className: 'host-ib', style: { padding: 6, color: 'pink' } } },
  }, '×'));
  assert.match(ib, /host-ib/);
  assert.match(ib, /padding:6px/);
  assert.match(ib, /color:rgb\(10, 20, 30\)/);
});

test('controls and delegated primitives expose slotProps without leaking executable overrides', () => {
  const btn = render(h(Button, { slotProps: { root: { className: 'host-btn', 'data-testid': 'b', onClick: 'bad' }, text: { className: 'host-btn-text' } } }, 'Save'));
  assert.match(btn, /host-btn/);
  assert.match(btn, /host-btn-text/);
  assert.match(btn, /data-testid="b"/);
  assert.doesNotMatch(btn, /onClick/);

  const sel = render(h(Selector, { label: 'Sort', options: ['New', 'Old'], slotProps: { root: { className: 'host-sel' }, label: { className: 'host-sel-label' }, native: { className: 'host-sel-native' } } }));
  assert.match(sel, /host-sel\b/);
  assert.match(sel, /host-sel-label/);
  assert.match(sel, /host-sel-native/);

  const tf = render(h(TextField, { label: 'Email', error: 'Required', slotProps: { root: { className: 'host-tf' }, box: { className: 'host-tf-box' }, input: { className: 'host-tf-in', value: 'hijack' }, label: { className: 'host-tf-lbl' }, error: { className: 'host-tf-err' } } }));
  assert.match(tf, /host-tf\b/);
  assert.match(tf, /host-tf-box/);
  assert.match(tf, /host-tf-in/);
  assert.match(tf, /host-tf-lbl/);
  assert.match(tf, /host-tf-err/);
  assert.doesNotMatch(tf, /hijack/);

  const ta = render(h(TextArea, { label: 'Bio', showCount: true, slotProps: { root: { className: 'host-ta' }, textarea: { className: 'host-ta-ctrl' }, count: { className: 'host-ta-cnt' } } }));
  assert.match(ta, /host-ta\b/);
  assert.match(ta, /host-ta-ctrl/);
  assert.match(ta, /host-ta-cnt/);

  const sf = render(h(PowerSearch, { label: 'Find', showLabel: true, slotProps: { root: { className: 'host-sf' }, box: { className: 'host-sf-box' }, input: { className: 'host-sf-in' }, label: { className: 'host-sf-lbl' } } }));
  assert.match(sf, /host-sf\b/);
  assert.match(sf, /host-sf-box/);
  assert.match(sf, /host-sf-in/);
  assert.match(sf, /host-sf-lbl/);

  const cb = render(h(CheckboxInput, { label: 'Agree', slotProps: { root: { className: 'host-cb' }, input: { className: 'host-cb-in' }, indicator: { className: 'host-cb-box' }, label: { className: 'host-cb-lbl' } } }));
  assert.match(cb, /host-cb\b/);
  assert.match(cb, /host-cb-in/);
  assert.match(cb, /host-cb-box/);
  assert.match(cb, /host-cb-lbl/);

  const sw = render(h(Switch, { label: 'Mute', slotProps: { root: { className: 'host-sw' }, track: { className: 'host-sw-trk' }, knob: { className: 'host-sw-knb' } } }));
  assert.match(sw, /host-sw\b/);
  assert.match(sw, /host-sw-trk/);
  assert.match(sw, /host-sw-knb/);

  const rg = render(h(RadioGroup, { label: 'Plan', name: 'plan', slotProps: { root: { className: 'host-rg' }, legend: { className: 'host-rg-leg' }, items: { className: 'host-rg-items' } } },
    h(Radio, { value: 'free', label: 'Free', slotProps: { root: { className: 'host-rad' }, indicator: { className: 'host-rad-dot' } } })));
  assert.match(rg, /host-rg\b/);
  assert.match(rg, /host-rg-leg/);
  assert.match(rg, /host-rg-items/);
  assert.match(rg, /host-rad\b/);
  assert.match(rg, /host-rad-dot/);

  const rng = render(h(Slider, { label: 'Gain', min: 0, max: 100, defaultValue: 25, showValue: true, slotProps: { root: { className: 'host-rng', style: { marginTop: 4, '--cieo-range-p': '99' } }, input: { className: 'host-rng-in' }, value: { className: 'host-rng-val' } } }));
  assert.match(rng, /host-rng\b/);
  assert.match(rng, /host-rng-in/);
  assert.match(rng, /host-rng-val/);
  assert.match(rng, /margin-top:4px/);
  assert.match(rng, /--cieo-range-p:25\.000/);
});

test('orphaned CSS selectors (.cieo-label, .cieo-tab-indicator), overlay/modal z-index tokens, and exiting motion rules are wired', () => {
  const controlsCss = readFileSync('design/styles/controls.css', 'utf8');
  assert.match(controlsCss, /\.cieo-label\b/);
  assert.match(controlsCss, /label:where\(\.cieo\)/);

  const tabListCss = readFileSync('design/styles/primitives/tab-list.css', 'utf8');
  assert.match(tabListCss, /position:\s*relative/);
  assert.match(tabListCss, /\.cieo-tab-indicator\b/);
  assert.match(tabListCss, /--cieo-tabs-indicator-color/);

  const overlayCss = readFileSync('design/styles/primitives/overlay.css', 'utf8');
  assert.match(overlayCss, /--cieo-overlay-z,\s*calc\(var\(--cieo-layer-modal,\s*40\)\s*-\s*1\)/);
  assert.match(overlayCss, /--cieo-scrim-alpha,\s*0\.45/);

  for (const [file, zVar, layerVar] of [
    ['dialog.css', '--cieo-dialog-z', '--cieo-layer-modal'],
    ['bottom-sheet.css', '--cieo-sheet-z', '--cieo-layer-modal'],
    ['lightbox.css', '--cieo-dialog-z', '--cieo-layer-modal'],
    ['toast.css', '--cieo-toast-z', '--cieo-layer-toast'],
  ]) {
    const css = readFileSync(`design/styles/primitives/${file}`, 'utf8');
    assert.doesNotMatch(css, /--cieo-popover-z/, `${file} must not hijack --cieo-popover-z`);
    assert.ok(css.includes(zVar) && css.includes(layerVar), `${file} uses ${zVar} -> ${layerVar}`);
  }

  const motionCss = readFileSync('design/styles/primitives/motion.css', 'utf8');
  for (const choice of ['fade', 'rise', 'scale']) {
    assert.match(motionCss, new RegExp(`\\[data-exiting='${choice}'\\]`));
  }
  for (const comp of ['Dialog', 'BottomSheet', 'Lightbox', 'Toast']) {
    const src = readFileSync(`src/primitives/${comp}/${comp}.tsx`, 'utf8');
    assert.doesNotMatch(src, /void\s+exiting/, `${comp} must wire exiting into usePresence`);
    assert.doesNotMatch(src, /motionAttrs\(\{\s*motion,\s*entering/, `${comp} must not double-animate CSS [data-entering] over JS usePresence`);
  }
});

test('pure layout, typography, and display primitives are Server Components (no use client)', () => {
  for (const name of PURE_RSC) {
    const src = readFileSync(`src/primitives/${name}/${name}.tsx`, 'utf8');
    const built = readFileSync(`dist/primitives/${name}/${name}.js`, 'utf8');
    assert.doesNotMatch(src, /^['"]use client['"]/m, `${name}.tsx must not declare 'use client'`);
    assert.doesNotMatch(built, /^['"]use client['"]/m, `${name}.js must not emit 'use client'`);
  }
  // Interactive components retain 'use client'
  for (const clientName of ['Dialog', 'Popover', 'TabList', 'VoiceRecorder', 'AudioPlayer', 'TableHeaderCell', 'Collapsible']) {
    const src = readFileSync(`src/primitives/${clientName}/${clientName}.tsx`, 'utf8');
    assert.match(src, /^'use client';/m, `${clientName}.tsx must retain 'use client'`);
  }
});

test('canonical taxonomy aliases and schemas/component.schema.json exist and match all manifests', () => {
  assert.equal(Primitives.ProportionBar, Primitives.ShareBar);
  assert.equal(Primitives.GroupedRoster, Primitives.RollCall);
  assert.equal(Primitives.TagChip, Primitives.TopicChip);
  assert.equal(Primitives.MonoText, Primitives.ReferenceText);
  assert.equal(Primitives.PageBar, Primitives.FrameBar);

  assert.ok(existsSync('schemas/component.schema.json'), 'schemas/component.schema.json must exist');
  const schema = JSON.parse(readFileSync('schemas/component.schema.json', 'utf8'));
  assert.equal(schema.type, 'object');
  const required = new Set(schema.required);
  const dirs = readdirSync('src/primitives', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  assert.equal(dirs.length, 255);
  for (const dir of dirs) {
    const m = JSON.parse(readFileSync(join('src/primitives', dir, 'manifest.json'), 'utf8'));
    for (const req of required) assert.ok(Object.hasOwn(m, req), `${dir}/manifest.json missing required ${req}`);
    for (const key of Object.keys(m)) assert.ok(Object.hasOwn(schema.properties, key), `${dir}/manifest.json has undocumented key ${key}`);
    assert.ok(schema.properties.layer.enum.includes(m.layer), `${dir} invalid layer ${m.layer}`);
    assert.ok(schema.properties.packId.enum.includes(m.packId), `${dir} invalid packId ${m.packId}`);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Slot, mergeSlotProps, mergeRefs } from '../dist/primitives/Slot/Slot.js';
import { MotionFrame } from '../dist/primitives/MotionFrame/MotionFrame.js';
import { MorphSurface } from '../dist/primitives/MorphSurface/MorphSurface.js';
import { StaggerGroup, computeStaggerDelays } from '../dist/primitives/StaggerGroup/StaggerGroup.js';
import { CollapsibleGroup } from '../dist/primitives/CollapsibleGroup/CollapsibleGroup.js';
import { Collapsible } from '../dist/primitives/Collapsible/Collapsible.js';
import { CieoI18nProvider, I18nProvider, useCieoI18n } from '../dist/primitives/I18nProvider/I18nProvider.js';
import { Button as PrimitiveButton } from '../dist/primitives/Button/Button.js';
import { TextField as PrimitiveTextField } from '../dist/primitives/TextField/TextField.js';
import { TextArea as PrimitiveTextArea } from '../dist/primitives/TextArea/TextArea.js';
import { Switch as PrimitiveSwitch } from '../dist/primitives/Switch/Switch.js';
import { RadioGroup as PrimitiveRadioGroup } from '../dist/primitives/RadioGroup/RadioGroup.js';
import { Button, Select, TextField, TextArea, Switch, RadioGroup, buttonClassName } from '../dist/controls/index.js';
import { SegmentedControl } from '../dist/primitives/SegmentedControl/SegmentedControl.js';
import { SegmentedControlItem } from '../dist/primitives/SegmentedControlItem/SegmentedControlItem.js';
import { DropdownMenu } from '../dist/primitives/DropdownMenu/DropdownMenu.js';
import { DropdownMenuItem } from '../dist/primitives/DropdownMenuItem/DropdownMenuItem.js';
import { CommandPalette } from '../dist/primitives/CommandPalette/CommandPalette.js';
import { CommandPaletteInput } from '../dist/primitives/CommandPaletteInput/CommandPaletteInput.js';
import { BottomSheet } from '../dist/primitives/BottomSheet/BottomSheet.js';
import { Dialog } from '../dist/primitives/Dialog/Dialog.js';
import { AlertDialog } from '../dist/primitives/AlertDialog/AlertDialog.js';
import { Lightbox } from '../dist/primitives/Lightbox/Lightbox.js';
import { Toast } from '../dist/primitives/Toast/Toast.js';
import { ToggleButtonGroup } from '../dist/primitives/ToggleButtonGroup/ToggleButtonGroup.js';
import { ToggleButton } from '../dist/primitives/ToggleButton/ToggleButton.js';
import { IconButton } from '../dist/primitives/IconButton/IconButton.js';
import { ClickableCard } from '../dist/primitives/ClickableCard/ClickableCard.js';
import { SideNavItem } from '../dist/primitives/SideNavItem/SideNavItem.js';
import { TopNavItem } from '../dist/primitives/TopNavItem/TopNavItem.js';
import { TopNavHeading } from '../dist/primitives/TopNavHeading/TopNavHeading.js';
import { TopNavMegaMenuItem } from '../dist/primitives/TopNavMegaMenuItem/TopNavMegaMenuItem.js';
import { BreadcrumbItem } from '../dist/primitives/BreadcrumbItem/BreadcrumbItem.js';
import { useGestureSpring, useSharedAxis } from '../dist/react/index.js';
import {
  useFieldValidation,
  useReorder,
  useListboxMenu,
  useSelection,
} from '../dist/state/react.js';

test('Slot: polymorphic asChild merges className, style, ARIA, refs, and chains event handlers', () => {
  const calls = [];
  const merged = mergeSlotProps(
    {
      className: 'slot-cls',
      style: { padding: 8, color: 'red' },
      'aria-label': 'Launch',
      onClick: () => calls.push('slot'),
    },
    {
      className: 'child-cls',
      style: { color: 'blue', margin: 4 },
      onClick: () => calls.push('child'),
    },
  );
  assert.equal(merged.className, 'slot-cls child-cls');
  assert.deepEqual(merged.style, { padding: 8, color: 'blue', margin: 4 });
  assert.equal(merged['aria-label'], 'Launch');
  merged.onClick({});
  assert.deepEqual(calls, ['child', 'slot']);

  const seenRefs = [];
  const objRef = { current: null };
  const refFn = mergeRefs((v) => seenRefs.push(v), objRef);
  const node = { tag: 'A' };
  refFn(node);
  assert.equal(seenRefs[0], node);
  assert.equal(objRef.current, node);

  const asAnchor = renderToStaticMarkup(
    h(Slot, { asChild: true, className: 'cieo-slot', 'aria-current': 'page', slotProps: { root: { className: 'host-slot' } } },
      h('a', { href: '/docs', className: 'link' }, 'Docs')),
  );
  assert.match(asAnchor, /^<a\b/);
  assert.match(asAnchor, /href="\/docs"/);
  assert.match(asAnchor, /aria-current="page"/);
  assert.match(asAnchor, /cieo-slot/);
  assert.match(asAnchor, /host-slot/);
  assert.match(asAnchor, /link/);
});

test('MotionFrame, MorphSurface, and StaggerGroup use real spring primitives without raw CSS durations', () => {
  const mfSrc = readFileSync('src/primitives/MotionFrame/MotionFrame.tsx', 'utf8');
  assert.match(mfSrc, /ResizeObserver/);
  assert.match(mfSrc, /useSharedAxis/);

  const msSrc = readFileSync('src/primitives/MorphSurface/MorphSurface.tsx', 'utf8');
  assert.match(msSrc, /SpringRect/);

  const delays = computeStaggerDelays(25, 45, 300);
  assert.equal(delays.length, 25);
  assert.equal(delays[0], 0);
  assert.ok(delays[24] <= 300.0001, `expected max delay <= 300ms, got ${delays[24]}`);
  assert.deepEqual(computeStaggerDelays(4, 40, 300), [0, 40, 80, 120]);

  const mfHtml = renderToStaticMarkup(h(MotionFrame, { contentKey: 'step-2', direction: 1 }, h('p', null, 'Step 2')));
  assert.match(mfHtml, /cieo-motion-frame/);
  assert.match(mfHtml, /Step 2/);

  const msHtml = renderToStaticMarkup(h(MorphSurface, { layoutId: 'card-42' }, h('div', null, 'Expanded')));
  assert.match(msHtml, /cieo-morph-surface/);
  assert.match(msHtml, /Expanded/);

  const sgHtml = renderToStaticMarkup(h(StaggerGroup, null, h('span', { key: '1' }, 'One'), h('span', { key: '2' }, 'Two')));
  assert.match(sgHtml, /cieo-stagger-group/);
  assert.match(sgHtml, /One/);
  assert.match(sgHtml, /Two/);
});

test('CollapsibleGroup & Collapsible: single and multiple accordion coordination + ResizeObserver height spring + slotProps', () => {
  const singleHtml = renderToStaticMarkup(
    h(CollapsibleGroup, { label: 'FAQ', defaultValue: 'q2' },
      h(Collapsible, { value: 'q1', title: 'First', slotProps: { trigger: { className: 'trig-1' }, panel: { className: 'pan-1' } } }, 'Answer 1'),
      h(Collapsible, { value: 'q2', title: 'Second', slotProps: { trigger: { className: 'trig-2' }, panel: { className: 'pan-2' } } }, 'Answer 2')),
  );
  assert.doesNotMatch(singleHtml, /Answer 1/);
  assert.match(singleHtml, /Answer 2/);
  assert.match(singleHtml, /trig-2/);
  assert.match(singleHtml, /pan-2/);

  const multiHtml = renderToStaticMarkup(
    h(CollapsibleGroup, { label: 'Filters', multiple: true, defaultValue: ['a', 'b'] },
      h(Collapsible, { value: 'a', title: 'Brand' }, 'Brand options'),
      h(Collapsible, { value: 'b', title: 'Size' }, 'Size options'),
      h(Collapsible, { value: 'c', title: 'Price' }, 'Price options')),
  );
  assert.match(multiHtml, /Brand options/);
  assert.match(multiHtml, /Size options/);
  assert.doesNotMatch(multiHtml, /Price options/);

  const colSrc = readFileSync('src/primitives/Collapsible/Collapsible.tsx', 'utf8');
  assert.match(colSrc, /ResizeObserver/);
});

test('First-class delegated primitive wrappers strictly alias cieo/controls without forking', () => {
  assert.equal(PrimitiveButton, Button);
  assert.equal(PrimitiveTextField, TextField);
  assert.equal(PrimitiveTextArea, TextArea);
  assert.equal(PrimitiveSwitch, Switch);
  assert.equal(PrimitiveRadioGroup, RadioGroup);
});

test('CieoI18nProvider / I18nProvider provides locale, dir, and overridable interface strings', () => {
  assert.equal(I18nProvider, CieoI18nProvider);
  function Probe() {
    const i18n = useCieoI18n();
    return h('span', { 'data-locale': i18n.locale, 'data-dir': i18n.dir, 'data-dismiss': i18n.strings.dismiss }, i18n.strings.uncertain);
  }
  const html = renderToStaticMarkup(
    h(CieoI18nProvider, { locale: 'ar', dir: 'rtl', strings: { dismiss: 'إغلاق' } }, h(Probe)),
  );
  assert.match(html, /dir="rtl"/);
  assert.match(html, /lang="ar"/);
  assert.match(html, /data-dismiss="إغلاق"/);
  assert.match(html, /Sending could not be confirmed/);
});

test('cieo/react exports useGestureSpring and useSharedAxis and remaining cieo/state/react hooks render on SSR', () => {
  assert.equal(typeof useGestureSpring, 'function');
  assert.equal(typeof useSharedAxis, 'function');
  function StateProbe() {
    const fv = useFieldValidation({ validate: (v) => (v.length > 0 ? null : 'Required') });
    const ro = useReorder({ order: ['x', 'y'] });
    const lb = useListboxMenu({ options: [{ id: '1', label: 'One' }] });
    const sel = useSelection({ items: ['a', 'b'], initialSelected: ['b'] });
    return h('div', { 'data-fv': fv.status, 'data-ro': ro.order.join(','), 'data-lb': String(lb.open), 'data-sel': sel.value });
  }
  const html = renderToStaticMarkup(h(StateProbe));
  assert.match(html, /data-fv="idle"/);
  assert.match(html, /data-ro="x,y"/);
  assert.match(html, /data-lb="false"/);
  assert.match(html, /data-sel="b"/);
});

test('Button control supports failed and uncertain states, asChild, size lg, and tone', () => {
  const failedHtml = renderToStaticMarkup(h(Button, { state: 'failed', failedLabel: 'Retry save', tone: 'danger', size: 'lg' }, 'Save'));
  assert.match(failedHtml, /data-state="failed"/);
  assert.match(failedHtml, /data-tone="danger"/);
  assert.match(failedHtml, /cieo-btn--lg/);
  assert.match(failedHtml, /cieo-btn--tone-danger/);
  assert.match(failedHtml, /Retry save/);
  assert.doesNotMatch(failedHtml, /aria-busy="true"/);

  const uncertainHtml = renderToStaticMarkup(h(Button, { state: 'uncertain' }, 'Send'));
  assert.match(uncertainHtml, /data-state="uncertain"/);
  assert.match(uncertainHtml, /Sending could not be confirmed/);

  const asChildHtml = renderToStaticMarkup(
    h(Button, { asChild: true, variant: 'primary', size: 'sm' }, h('a', { href: '/checkout' }, 'Checkout')),
  );
  assert.match(asChildHtml, /^<a\b/);
  assert.match(asChildHtml, /href="\/checkout"/);
  assert.match(asChildHtml, /cieo-btn--primary/);
  assert.match(asChildHtml, /cieo-btn--sm/);
  assert.equal(buttonClassName(), 'cieo-ctl cieo-btn cieo-btn--secondary cieo-btn--md');
});

test('Component wiring upgrades: SegmentedControl, DropdownMenu, CommandPalette, BottomSheet, Dialog, AlertDialog, Lightbox, Toast, Select, ToggleButtonGroup, and asChild/ref primitives', () => {
  // SegmentedControl sliding indicator + roving
  const segSrc = readFileSync('src/primitives/SegmentedControl/SegmentedControl.tsx', 'utf8');
  assert.match(segSrc, /useEdges/);
  assert.match(segSrc, /roveFocus/);
  const segHtml = renderToStaticMarkup(
    h(SegmentedControl, { label: 'Density', defaultValue: 'compact' },
      h(SegmentedControlItem, { value: 'comfortable' }, 'Comfortable'),
      h(SegmentedControlItem, { value: 'compact' }, 'Compact')),
  );
  assert.match(segHtml, /cieo-segmented-control-indicator/);
  assert.match(segHtml, /aria-pressed="true"[^>]*>Compact/);

  // DropdownMenu + CommandPalette spring presence + controllable state
  assert.match(readFileSync('src/primitives/DropdownMenu/DropdownMenu.tsx', 'utf8'), /usePresence/);
  assert.match(readFileSync('src/primitives/DropdownMenu/DropdownMenu.tsx', 'utf8'), /useControllableState/);
  assert.match(readFileSync('src/primitives/CommandPalette/CommandPalette.tsx', 'utf8'), /usePresence/);
  assert.match(readFileSync('src/primitives/CommandPalette/CommandPalette.tsx', 'utf8'), /useControllableState/);
  const cpUncontrolled = renderToStaticMarkup(
    h(CommandPalette, { label: 'Commands', defaultQuery: 'deploy' }, h(CommandPaletteInput, { label: 'Search' })),
  );
  assert.match(cpUncontrolled, /value="deploy"/);
  assert.equal(renderToStaticMarkup(h(CommandPalette, { label: 'Commands', open: false }, 'empty')), '');

  // BottomSheet detents + PointerVelocityTracker + controllable state
  const bsSrc = readFileSync('src/primitives/BottomSheet/BottomSheet.tsx', 'utf8');
  assert.match(bsSrc, /PointerVelocityTracker/);
  assert.match(bsSrc, /projectToDetent/);
  assert.match(bsSrc, /useControllableState/);
  const bsHtml = renderToStaticMarkup(
    h(BottomSheet, { label: 'Inspector', defaultOpen: true, detents: [0, 0.5, 0.9], defaultDetent: 0.5 }, 'Sheet body'),
  );
  assert.match(bsHtml, /Sheet body/);
  assert.match(bsHtml, /data-detent="0\.5"/);

  // Dialog, AlertDialog, Lightbox, Toast, Select useControllableState
  for (const p of [
    'src/primitives/Dialog/Dialog.tsx',
    'src/primitives/AlertDialog/AlertDialog.tsx',
    'src/primitives/Lightbox/Lightbox.tsx',
    'src/primitives/Toast/Toast.tsx',
    'src/controls/Select.tsx',
  ]) {
    assert.match(readFileSync(p, 'utf8'), /useControllableState/, `${p} uses useControllableState`);
  }
  assert.match(renderToStaticMarkup(h(Dialog, { label: 'Edit', defaultOpen: true }, 'Dialog body')), /Dialog body/);
  assert.match(renderToStaticMarkup(h(AlertDialog, { label: 'Confirm', defaultOpen: true }, 'Alert body')), /Alert body/);
  assert.match(renderToStaticMarkup(h(Lightbox, { src: '/img.jpg', alt: 'Photo', defaultOpen: true })), /src="\/img\.jpg"/);
  assert.equal(renderToStaticMarkup(h(Toast, { message: 'Hidden', defaultOpen: false })), '');

  // ToggleButtonGroup multiple?: boolean
  const multiTbg = renderToStaticMarkup(
    h(ToggleButtonGroup, { label: 'Format', multiple: true, defaultValue: ['bold', 'underline'] },
      h(ToggleButton, { label: 'Bold', value: 'bold' }, 'B'),
      h(ToggleButton, { label: 'Italic', value: 'italic' }, 'I'),
      h(ToggleButton, { label: 'Underline', value: 'underline' }, 'U')),
  );
  assert.match(multiTbg, /aria-pressed="true" aria-label="Bold"/);
  assert.match(multiTbg, /aria-pressed="false" aria-label="Italic"/);
  assert.match(multiTbg, /aria-pressed="true" aria-label="Underline"/);

  // IconButton, ClickableCard, nav items: asChild + React 19 ref
  assert.match(renderToStaticMarkup(h(IconButton, { asChild: true, label: 'Home' }, h('a', { href: '/' }, '⌂'))), /^<a\b[^>]*href="\/"[^>]*aria-label="Home"/);
  assert.match(renderToStaticMarkup(h(ClickableCard, { asChild: true }, h('section', { 'data-card': '1' }, h('a', { href: '/p' }, 'Post')))), /^<section\b[^>]*class="cieo cieo-clickable-card"/);
  assert.match(renderToStaticMarkup(h(SideNavItem, { asChild: true, current: true }, h('a', { href: '/inbox' }, 'Inbox'))), /^<a\b[^>]*href="\/inbox"[^>]*aria-current="page"/);
  assert.match(renderToStaticMarkup(h(TopNavItem, { asChild: true, current: true }, h('a', { href: '/work' }, 'Work'))), /^<a\b[^>]*href="\/work"[^>]*aria-current="page"/);
  assert.match(renderToStaticMarkup(h(TopNavHeading, { asChild: true }, h('a', { href: '/home' }, 'Brand'))), /^<a\b[^>]*href="\/home"[^>]*class="cieo cieo-top-nav-heading"/);
  assert.match(renderToStaticMarkup(h(TopNavMegaMenuItem, { asChild: true, title: 'API', description: 'Docs' }, h('a', { href: '/api' }))), /^<a\b[^>]*href="\/api"/);
  assert.match(renderToStaticMarkup(h(BreadcrumbItem, { asChild: true, current: true }, h('span', null, 'Here'))), /^<span\b[^>]*aria-current="page"/);
});

test('Every handwritten src/ file is strictly <= 300 lines', () => {
  const GENERATED = new Set(['src/primitives/index.ts', 'src/agent/icons.ts']);
  const violations = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if ((p.endsWith('.ts') || p.endsWith('.tsx')) && !GENERATED.has(p) && statSync(p).isFile()) {
        const lines = readFileSync(p, 'utf8').split('\n').length - (readFileSync(p, 'utf8').endsWith('\n') ? 1 : 0);
        if (lines > 300) violations.push(`${p}: ${lines}L`);
      }
    }
  }
  walk('src');
  assert.deepEqual(violations, []);
});

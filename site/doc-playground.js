// site/doc-playground.js — M3-caliber interactive component stage, multi-platform tabs, and live FSM explorer.
import { brands, createTheme, densities, grounds, radii, variables } from '../design/index.js';
import { rovingTabs } from './roving-tabs.js';
import { makeCopyButton } from './copy-button.js';
import {
  createAsyncActionMachine,
  createDisclosureMachine,
  createFieldValidationMachine,
  createListboxMenuMachine,
  createReorderMachine,
  createSelectionMachine,
  createSheetDetentsMachine,
  createToastQueueMachine,
} from '../dist/state/index.js';

// 1. Multi-platform tablist (click + ArrowLeft/ArrowRight/Home/End + #panel-id deep links).
// Panels are hidden through the attribute and an inline display, because stylesheet display rules on .doc-stage beat [hidden].
const tabs = [...document.querySelectorAll('.doc-tabs [role="tab"]')];
if (tabs.length) {
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  // The stage toolbar belongs to the Preview panel only.
  const previewOnly = [...document.querySelectorAll('[data-stage-toolbar]')];
  const setShown = (el, on) => { el.hidden = !on; el.style.display = on ? '' : 'none'; };
  const select = rovingTabs(tabs, (index) => {
    panels.forEach((panel, j) => { if (panel) setShown(panel, index === j); });
    previewOnly.forEach((el) => setShown(el, index === 0));
  });
  const fromHash = () => {
    const i = panels.findIndex((p) => p && `#${p.id}` === location.hash);
    if (i >= 0) select(i);
  };
  addEventListener('hashchange', fromHash);
  select(0);
  fromHash();
  // Code panels: keyboard-scrollable and each carries its own copy button.
  tabs.forEach((tab, i) => {
    const panel = panels[i];
    if (!panel || panel.tagName !== 'PRE') return;
    panel.tabIndex = 0;
    panel.style.fontFamily = 'var(--cieo-font-mono, ui-monospace, monospace)';
    panel.style.whiteSpace = 'pre';
    panel.style.overflow = 'auto';
    const btn = makeCopyButton('Copy code', () => panel.querySelector('code')?.textContent ?? panel.textContent);
    btn.dataset.copyCode = panel.id;
    panel.before(btn);
    panel.copyButton = btn;
  });
  // Keep each copy button next to its panel's visibility.
  const syncCopy = () => panels.forEach((p) => { if (p?.copyButton) setShown(p.copyButton, !p.hidden); });
  tabs.forEach((t) => t.addEventListener('click', syncCopy));
  addEventListener('hashchange', syncCopy);
  tabs.forEach((t) => t.addEventListener('keydown', () => queueMicrotask(syncCopy)));
  syncCopy();
}

// 2. Copy import button: swapped for the shared spring-animated icon button.
const staticCopy = document.querySelector('[data-copy-import]');
if (staticCopy) {
  const copyBtn = makeCopyButton('Copy import', () => document.querySelector('[data-import]')?.textContent || '');
  copyBtn.dataset.copyImport = '';
  staticCopy.replaceWith(copyBtn);
}

// 3. Interactive Stage Toolbar + Slow-Mo + Manifest Prop Knobs
const toolbar = document.querySelector('[data-stage-toolbar]');
const stage = document.querySelector('[data-preview]');
const codeEl = document.querySelector('[data-code]');
const baseCode = codeEl ? codeEl.textContent : '';

if (stage) {
  // Overlay components (Dialog, Sheet, Lightbox) position a fixed scrim; containing it keeps the scrim and the dialog inside the stage so they cannot cover the page's own tabs.
  stage.style.contain = 'layout paint';
}

if (toolbar && stage) {
  const compName = toolbar.dataset.component || 'Component';
  let knobs = [];
  try { knobs = JSON.parse(toolbar.dataset.knobs || '[]'); } catch { knobs = []; }

  const selHtml = (attr, label, entries, current) => {
    const opts = entries.map(([v, t]) => `<option value="${v}"${v === current ? ' selected' : ''}>${t}</option>`).join('');
    return `<label class="doc-knob"><span>${label}</span><select data-stage-${attr}>${opts}</select></label>`;
  };

  const brandEntries = Object.entries(brands).map(([k, v]) => [k, v.label || k]);
  const groundEntries = Object.entries(grounds).map(([k, v]) => [k, v.label || k]);
  const densityEntries = Object.entries(densities).map(([k, v]) => [k, v.label || k]);
  const radiusEntries = Object.entries(radii).map(([k, v]) => [k, v.label || k]);

  const knobControls = knobs.map((k) => {
    if (k.kind === 'boolean') {
      return `<label class="doc-knob doc-knob-check"><input type="checkbox" data-prop-knob="${k.id}"${k.def === 'true' ? ' checked' : ''}><span>${k.id}</span></label>`;
    }
    const opts = ['(default)', ...k.options].map((o) => `<option value="${o === '(default)' ? '' : o}">${o}</option>`).join('');
    return `<label class="doc-knob"><span>${k.id}</span><select data-prop-knob="${k.id}">${opts}</select></label>`;
  }).join('');

  toolbar.innerHTML = [
    selHtml('brand', 'Brand', brandEntries, 'instrument'),
    selHtml('ground', 'Ground', groundEntries, 'paper'),
    selHtml('scheme', 'Scheme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], 'system'),
    selHtml('density', 'Density', densityEntries, 'comfortable'),
    selHtml('radius', 'Corners', radiusEntries, 'pill'),
    selHtml('preset', 'Spring', [['snap', 'snap (ω 34)'], ['base', 'base (ω 22)'], ['soft', 'soft (ω 15)'], ['lazy', 'lazy (ω 9)']], 'base'),
    `<div class="doc-speed-group" role="group" aria-label="Time dilation"><button type="button" data-stage-speed="1" aria-pressed="true">1×</button><button type="button" data-stage-speed="0.25" aria-pressed="false">0.25×</button><button type="button" data-stage-speed="0.1" aria-pressed="false">0.1×</button></div>`,
    knobControls,
  ].join('');

  let speedScale = 1;
  // Slow motion stretches every motion token the stage reads: durations grow by 1/speed and spring frequencies shrink by speed.
  const DURATION_TOKENS = { 'base': 300, 'exit': 100, 'lazy': 740, 'snap': 200, 'soft': 440 };
  const OMEGA_TOKENS = { base: 22, lazy: 9, snap: 34, soft: 15 };
  // The Spring menu repoints the "base" tokens, which most components animate with, at the chosen preset; slow motion then stretches whatever is chosen.
  const applyTimeScale = () => {
    const preset = toolbar.querySelector('[data-stage-preset]')?.value || 'base';
    const set = (name, value, keep) => (keep ? stage.style.setProperty(name, value) : stage.style.removeProperty(name));
    const custom = speedScale !== 1;
    for (const [k, ms] of Object.entries(DURATION_TOKENS)) set(`--cieo-motion-duration-${k}`, `${Math.round((k === 'base' ? DURATION_TOKENS[preset] : ms) / speedScale)}ms`, custom || (k === 'base' && preset !== 'base'));
    for (const [k, w] of Object.entries(OMEGA_TOKENS)) set(`--cieo-motion-spring-${k}-w`, String(+((k === 'base' ? OMEGA_TOKENS[preset] : w) * speedScale).toFixed(2)), custom || (k === 'base' && preset !== 'base'));
    set('--cieo-motion-lag', `${Math.round(60 / speedScale)}ms`, custom);
  };
  const syncStage = () => {
    const brand = toolbar.querySelector('[data-stage-brand]').value;
    const ground = toolbar.querySelector('[data-stage-ground]').value;
    const schemeRaw = toolbar.querySelector('[data-stage-scheme]').value;
    const scheme = schemeRaw === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : schemeRaw;
    const density = toolbar.querySelector('[data-stage-density]').value;
    const radius = toolbar.querySelector('[data-stage-radius]').value;

    const theme = createTheme({ brand, ground, scheme, density, radius });
    const vars = variables(theme);
    for (const [k, v] of Object.entries(vars)) stage.style.setProperty(k, v);
    stage.style.colorScheme = scheme;

    applyTimeScale();
  };

  toolbar.querySelectorAll('select[data-stage-brand], select[data-stage-ground], select[data-stage-scheme], select[data-stage-density], select[data-stage-radius], select[data-stage-preset]')
    .forEach((el) => el.addEventListener('change', syncStage));

  const speedBtns = [...toolbar.querySelectorAll('[data-stage-speed]')];
  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      speedScale = Number(btn.dataset.stageSpeed || '1');
      speedBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      syncStage();
    });
  });

  // Live prop knobs -> mutate preview root data-* / disabled + code snippet
  const propInputs = [...toolbar.querySelectorAll('[data-prop-knob]')];
  const syncProps = () => {
    const target = stage.firstElementChild;
    const activeProps = [];
    for (const input of propInputs) {
      const prop = input.dataset.propKnob;
      if (input.type === 'checkbox') {
        if (input.checked) {
          activeProps.push(prop);
          if (target) {
            if (prop === 'disabled') {
              target.setAttribute('aria-disabled', 'true');
              if ('disabled' in target) target.disabled = true;
            } else {
              target.dataset[prop] = 'true';
            }
          }
        } else if (target) {
          if (prop === 'disabled') {
            target.removeAttribute('aria-disabled');
            if ('disabled' in target) target.disabled = false;
          } else {
            delete target.dataset[prop];
          }
        }
      } else {
        const val = input.value;
        if (val) {
          activeProps.push(`${prop}="${val}"`);
          if (target) target.dataset[prop] = val;
        } else if (target) {
          delete target.dataset[prop];
        }
      }
    }
    if (codeEl) {
      if (!activeProps.length) codeEl.textContent = baseCode;
      else codeEl.textContent = `<${compName} ${activeProps.join(' ')}>\n  …\n</${compName}>`;
    }
  };
  propInputs.forEach((el) => el.addEventListener('change', syncProps));
  syncStage();
}

// 4. Live FSM State Matrix powered by dist/state/index.js
const fsmSection = document.querySelector('[data-fsm-machine]');
if (fsmSection) {
  const kind = fsmSection.dataset.fsmMachine;
  const mount = fsmSection.querySelector('[data-fsm-mount]');

  const buildDriver = () => {
    switch (kind) {
      case 'asyncAction': {
        const m = createAsyncActionMachine();
        return {
          label: () => m.getSnapshot().status,
          snapshot: () => m.getSnapshot(),
          actions: [
            ['PRESS', () => m.send({ type: 'PRESS' })],
            ['RESOLVE', () => m.send({ type: 'RESOLVE' })],
            ['REJECT', () => m.send({ type: 'REJECT', error: 'Network error' })],
            ['TIMEOUT', () => m.send({ type: 'TIMEOUT' })],
            ['CANCEL', () => m.send({ type: 'CANCEL' })],
            ['RESET', () => m.send({ type: 'RESET' })],
          ],
        };
      }
      case 'disclosure': {
        const m = createDisclosureMachine();
        return {
          label: () => m.getSnapshot().status,
          snapshot: () => m.getSnapshot(),
          actions: [
            ['OPEN', () => m.send({ type: 'OPEN' })],
            ['COMPLETE', () => m.send({ type: 'COMPLETE' })],
            ['CLOSE', () => m.send({ type: 'CLOSE' })],
            ['TOGGLE', () => m.send({ type: 'TOGGLE' })],
          ],
        };
      }
      case 'sheetDetents': {
        const m = createSheetDetentsMachine({ detents: [0, 0.5, 0.9], initialDetent: 0.5 });
        return {
          label: () => `${m.getSnapshot().status} @ ${m.getSnapshot().activeDetent}`,
          snapshot: () => m.getSnapshot(),
          actions: [
            ['SNAP 0.5', () => m.send({ type: 'SNAP_TO', detent: 0.5 })],
            ['SNAP 0.9', () => m.send({ type: 'SNAP_TO', detent: 0.9 })],
            ['FLICK UP', () => m.send({ type: 'RELEASE', position: 0.58, velocity: { x: 0, y: 1.4 } })],
            ['DISMISS', () => m.send({ type: 'DISMISS' })],
          ],
        };
      }
      case 'listboxMenu': {
        const m = createListboxMenuMachine({ items: [{ value: 'alpha', label: 'Alpha' }, { value: 'beta', label: 'Beta' }, { value: 'gamma', label: 'Gamma' }] });
        return {
          label: () => `${m.getSnapshot().open ? 'open' : 'closed'} (idx ${m.getSnapshot().activeIndex})`,
          snapshot: () => m.getSnapshot(),
          actions: [
            ['OPEN', () => m.send({ type: 'OPEN' })],
            ['ARROW DOWN', () => m.send({ type: 'KEY_DOWN', key: 'ArrowDown' })],
            ['ENTER', () => m.send({ type: 'KEY_DOWN', key: 'Enter' })],
            ['ESCAPE', () => m.send({ type: 'KEY_DOWN', key: 'Escape' })],
          ],
        };
      }
      case 'selection': {
        const m = createSelectionMachine({ items: ['day', 'week', 'month'], defaultValue: 'day' });
        return {
          label: () => `selected: ${[...m.getSnapshot().selected].join(', ') || 'none'}`,
          snapshot: () => m.getSnapshot(),
          actions: [
            ['SELECT day', () => m.send({ type: 'SELECT', value: 'day' })],
            ['SELECT week', () => m.send({ type: 'SELECT', value: 'week' })],
            ['SELECT month', () => m.send({ type: 'SELECT', value: 'month' })],
            ['FOCUS +1', () => m.send({ type: 'MOVE_FOCUS', delta: 1 })],
          ],
        };
      }
      case 'reorder': {
        const m = createReorderMachine({ order: ['one', 'two', 'three'] });
        return {
          label: () => m.getSnapshot().order.join(' → '),
          snapshot: () => m.getSnapshot(),
          actions: [
            ['LIFT one', () => m.send({ type: 'LIFT', id: 'one', mode: 'keyboard' })],
            ['MOVE → 2', () => m.send({ type: 'MOVE', overIndex: 2 })],
            ['DROP', () => m.send({ type: 'DROP' })],
            ['CANCEL', () => m.send({ type: 'CANCEL' })],
          ],
        };
      }
      case 'fieldValidation': {
        const m = createFieldValidationMachine({
          validate: (v) => (v.includes('@') ? { valid: true } : { valid: false, message: 'Enter an @ address.' }),
        });
        return {
          label: () => m.getSnapshot().status,
          snapshot: () => m.getSnapshot(),
          actions: [
            ['INPUT "ada"', () => m.send({ type: 'INPUT', value: 'ada' })],
            ['BLUR (punish late)', () => m.send({ type: 'BLUR' })],
            ['INPUT "ada@cieo.dev" (reward early)', () => m.send({ type: 'INPUT', value: 'ada@cieo.dev' })],
            ['RESET', () => m.send({ type: 'RESET' })],
          ],
        };
      }
      case 'toastQueue': {
        let seq = 1;
        const q = createToastQueueMachine({ maxVisible: 2 });
        return {
          label: () => `visible ${q.getSnapshot().visible.length} · queued ${q.getSnapshot().queued.length}`,
          snapshot: () => q.getSnapshot(),
          actions: [
            ['ENQUEUE', () => q.enqueue({ id: `t${seq++}`, message: 'Saved', durationMs: 4000 })],
            ['HIGH PRIORITY', () => q.enqueue({ id: `p${seq++}`, message: 'Action needed', priority: 'high', durationMs: 5000 })],
            ['SWIPE DISMISS', () => { const f = q.getSnapshot().visible[0]; return q.dismiss(f ? f.id : 'none', { x: 420, y: 0 }); }],
            ['TICK 4s', () => { q.tick(4000); return { event: { type: 'TICK' }, next: q.getSnapshot() }; }],
          ],
        };
      }
      default:
        return null;
    }
  };

  const driver = buildDriver();
  if (driver && mount) {
    mount.innerHTML = `<div class="doc-fsm-bar"><span class="doc-fsm-pill" data-fsm-status></span><div class="doc-fsm-actions" data-fsm-btns></div></div><pre class="doc-fsm-log" data-fsm-out></pre>`;
    const statusEl = mount.querySelector('[data-fsm-status]');
    const btnsEl = mount.querySelector('[data-fsm-btns]');
    const outEl = mount.querySelector('[data-fsm-out]');

    const renderEnvelope = (env) => {
      statusEl.textContent = driver.label();
      outEl.textContent = JSON.stringify(env || { state: driver.snapshot() }, null, 2);
    };

    driver.actions.forEach(([label, runAction]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'doc-button';
      b.textContent = label;
      b.addEventListener('click', () => renderEnvelope(runAction()));
      btnsEl.appendChild(b);
    });
    renderEnvelope(null);
  }
}

// Marks the page interactive so tests and assistive tooling can wait for the tabs, knobs and machines to be wired.
document.documentElement.dataset.playgroundReady = 'true';

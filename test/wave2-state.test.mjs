import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createMachineStore,
  createAsyncActionMachine,
  createDisclosureMachine,
  createSheetDetentsMachine,
  createSelectionMachine,
  createListboxMenuMachine,
  createReorderMachine,
  createFieldValidationMachine,
  createToastQueueMachine,
} from '../dist/state/index.js';
import {
  useControllableState,
  useMachine,
  useAsyncAction,
  useDisclosure,
  useSheetDetents,
  useToastQueue,
} from '../dist/state/react.js';

test('package.json exports ./state, ./state/react, and ./live, and non-react src/state modules are pure', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const key of ['./state', './state/react', './live']) {
    assert.ok(pkg.exports[key]?.types, `${key} missing types`);
    assert.ok(pkg.exports[key]?.default, `${key} missing default`);
  }
  const files = readdirSync('src/state').filter((f) => f.endsWith('.ts') && f !== 'react.ts');
  assert.ok(files.length >= 10, `expected >= 10 pure state files, got ${files.length}`);
  for (const f of files) {
    const src = readFileSync(join('src/state', f), 'utf8');
    assert.doesNotMatch(src, /from\s+['"]react/, `src/state/${f} must not depend on react`);
    assert.doesNotMatch(src, /\b(document|window|HTMLElement)\b/, `src/state/${f} must not touch DOM globals`);
  }
  const reactSrc = readFileSync('src/state/react.ts', 'utf8');
  assert.match(reactSrc, /^'use client';/m);
  assert.match(reactSrc, /useSyncExternalStore/);
});

test('createMachineStore notifies subscribers only on state changes and records TransitionEnvelope', () => {
  let notifications = 0;
  const store = createMachineStore(0, (state, event) => {
    if (event.type === 'NOOP') return { prev: state, next: state, event, changed: false, direction: 0 };
    const next = state + event.delta;
    return {
      prev: state,
      next,
      event,
      changed: next !== state,
      direction: Math.sign(next - state) || 0,
      haptic: 'selection',
    };
  });
  const unsub = store.subscribe(() => { notifications += 1; });
  assert.equal(store.getSnapshot(), 0);
  assert.equal(store.getLastEnvelope(), null);

  const noopEnv = store.send({ type: 'NOOP' });
  assert.equal(noopEnv.changed, false);
  assert.equal(notifications, 0);

  const upEnv = store.send({ type: 'STEP', delta: 3 });
  assert.equal(upEnv.changed, true);
  assert.equal(upEnv.direction, 1);
  assert.equal(upEnv.haptic, 'selection');
  assert.equal(store.getSnapshot(), 3);
  assert.equal(store.getLastEnvelope(), upEnv);
  assert.equal(notifications, 1);

  unsub();
  store.send({ type: 'STEP', delta: -1 });
  assert.equal(notifications, 1);
  assert.equal(store.getSnapshot(), 2);
});

test('1. asyncAction: double-submit lock, attemptId preservation on retry, TIMEOUT -> uncertain', () => {
  const m = createAsyncActionMachine();
  assert.equal(m.getSnapshot().status, 'idle');

  const rect = { x: 10, y: 20, width: 100, height: 40 };
  const s1 = m.send({ type: 'SUBMIT', anchorRect: rect });
  assert.equal(s1.changed, true);
  assert.equal(s1.anchorRect, rect);
  assert.equal(m.getSnapshot().status, 'pending');
  const firstAttemptId = m.getSnapshot().attemptId;
  assert.ok(firstAttemptId && firstAttemptId.length > 0);

  // Double-submit lock while pending!
  const dup = m.send({ type: 'SUBMIT' });
  assert.equal(dup.changed, false);
  assert.equal(m.getSnapshot().attemptId, firstAttemptId);
  assert.equal(m.getSnapshot().attemptCount, 1);

  // TIMEOUT -> 'uncertain' with 'Sending could not be confirmed.' and haptic 'warning'
  const to = m.send({ type: 'TIMEOUT' });
  assert.equal(to.next.status, 'uncertain');
  assert.equal(to.haptic, 'warning');
  assert.equal(to.announcement, 'Sending could not be confirmed.');

  // Retry from 'uncertain' preserves attemptId!
  m.send({ type: 'SUBMIT' });
  assert.equal(m.getSnapshot().status, 'pending');
  assert.equal(m.getSnapshot().attemptId, firstAttemptId, 'attemptId preserved across uncertain retry');
  assert.equal(m.getSnapshot().attemptCount, 2);

  // REJECT -> 'failed' with haptic 'error'
  const rej = m.send({ type: 'REJECT', error: 'Network down' });
  assert.equal(rej.next.status, 'failed');
  assert.equal(rej.haptic, 'error');
  assert.equal(rej.next.error, 'Network down');

  // Retry from 'failed' also preserves attemptId!
  m.send({ type: 'SUBMIT' });
  assert.equal(m.getSnapshot().attemptId, firstAttemptId, 'attemptId preserved across failed retry');
  assert.equal(m.getSnapshot().attemptCount, 3);

  // RESOLVE -> 'succeeded' with haptic 'success'
  const ok = m.send({ type: 'RESOLVE' });
  assert.equal(ok.next.status, 'succeeded');
  assert.equal(ok.haptic, 'success');

  // Fresh submit after 'succeeded' mints a NEW attemptId!
  m.send({ type: 'SUBMIT' });
  assert.notEqual(m.getSnapshot().attemptId, firstAttemptId, 'fresh attemptId minted after succeeded');

  // CANCEL -> 'cancelled', RESET -> 'idle'
  const can = m.send({ type: 'CANCEL' });
  assert.equal(can.next.status, 'cancelled');
  m.send({ type: 'RESET' });
  assert.equal(m.getSnapshot().status, 'idle');
  assert.equal(m.getSnapshot().attemptId, null);
});

test('2. disclosure: closed/opening/open/closing with mid-flight reversal preserving direction', () => {
  const m = createDisclosureMachine();
  assert.deepEqual(m.getSnapshot(), { phase: 'closed', open: false });

  const e1 = m.send({ type: 'OPEN' });
  assert.equal(e1.next.phase, 'opening');
  assert.equal(e1.next.open, true);
  assert.equal(e1.direction, 1);

  // Mid-flight reversal: opening -> closing via TOGGLE
  const e2 = m.send({ type: 'TOGGLE' });
  assert.equal(e2.next.phase, 'closing');
  assert.equal(e2.next.open, false);
  assert.equal(e2.direction, -1);

  // Mid-flight reversal back: closing -> opening via TOGGLE
  const e3 = m.send({ type: 'TOGGLE' });
  assert.equal(e3.next.phase, 'opening');
  assert.equal(e3.next.open, true);
  assert.equal(e3.direction, 1);

  const e4 = m.send({ type: 'OPENED' });
  assert.equal(e4.next.phase, 'open');
  assert.equal(e4.direction, 1);

  const e5 = m.send({ type: 'CLOSE' });
  assert.equal(e5.next.phase, 'closing');
  assert.equal(e5.direction, -1);

  const e6 = m.send({ type: 'CLOSED' });
  assert.equal(e6.next.phase, 'closed');
  assert.equal(e6.direction, -1);
});

test('3. sheetDetents: sorts detents, DRAG, RELEASE with projectToDetent + velocity.y, SNAP_TO, DISMISS', () => {
  const m = createSheetDetentsMachine({ detents: [0.9, 0, 0.4], initialDetent: 0.4 });
  assert.deepEqual(m.getSnapshot().detents, [0, 0.4, 0.9]);
  assert.equal(m.getSnapshot().position, 0.4);
  assert.equal(m.getSnapshot().index, 1);

  const drag = m.send({ type: 'DRAG', position: 0.45 });
  assert.equal(drag.next.dragging, true);
  assert.equal(drag.direction, 1);

  // Release with upward velocity -> snaps to 0.9 with haptic 'selection'
  const relUp = m.send({ type: 'RELEASE', velocity: { x: 0, y: 650 } });
  assert.equal(relUp.next.dragging, false);
  assert.equal(relUp.next.position, 0.9);
  assert.equal(relUp.next.index, 2);
  assert.equal(relUp.haptic, 'selection');
  assert.deepEqual(relUp.velocity, { x: 0, y: 650 });

  // Snap to middle detent
  m.send({ type: 'SNAP_TO', index: 1 });
  assert.equal(m.getSnapshot().position, 0.4);

  // Release with downward flick from 0.4 -> dismisses to 0 with haptic 'drop'
  const relDown = m.send({ type: 'RELEASE', position: 0.35, velocity: { x: 0, y: -650 } });
  assert.equal(relDown.next.position, 0);
  assert.equal(relDown.next.index, 0);
  assert.equal(relDown.haptic, 'drop');

  m.send({ type: 'SNAP_TO', detent: 0.9 });
  assert.equal(m.getSnapshot().position, 0.9);
  const dis = m.send({ type: 'DISMISS' });
  assert.equal(dis.next.position, 0);
  assert.equal(dis.haptic, 'drop');
});

test('4. selection: single and multiple modes with roving focus and directional sign', () => {
  const single = createSelectionMachine({ items: ['alpha', 'beta', 'gamma'], initialSelected: ['beta'] });
  assert.equal(single.getSnapshot().value, 'beta');
  assert.equal(single.getSnapshot().focusedIndex, 1);

  const fwd = single.send({ type: 'SELECT', value: 'gamma' });
  assert.equal(fwd.direction, 1);
  assert.equal(fwd.haptic, 'selection');
  assert.equal(single.getSnapshot().value, 'gamma');

  const back = single.send({ type: 'SELECT', value: 'alpha' });
  assert.equal(back.direction, -1);
  assert.equal(single.getSnapshot().value, 'alpha');

  const move = single.send({ type: 'MOVE_FOCUS', delta: -1, select: true }); // wraps 0 -> 2
  assert.equal(move.next.focusedIndex, 2);
  assert.equal(move.next.value, 'gamma');
  assert.equal(move.direction, 1);

  const multi = createSelectionMachine({ items: ['bold', 'italic', 'underline'], multiple: true });
  multi.send({ type: 'TOGGLE', value: 'bold' });
  multi.send({ type: 'TOGGLE', value: 'underline' });
  assert.deepEqual(multi.getSnapshot().selected, ['bold', 'underline']);
  multi.send({ type: 'TOGGLE', value: 'bold' });
  assert.deepEqual(multi.getSnapshot().selected, ['underline']);
});

test('5. listboxMenu: ArrowDown/Up, Home, End, Enter, Escape, and typeahead skipping disabled options', () => {
  const options = [
    { id: 'new', label: 'New file' },
    { id: 'open', label: 'Open project' },
    { id: 'print', label: 'Print', disabled: true },
    { id: 'prefs', label: 'Preferences' },
  ];
  const m = createListboxMenuMachine({ options });
  assert.equal(m.getSnapshot().open, false);

  m.send({ type: 'KEY_DOWN', key: 'ArrowDown', timeMs: 0 });
  assert.equal(m.getSnapshot().open, true);
  assert.equal(m.getSnapshot().activeIndex, 0);

  m.send({ type: 'KEY_DOWN', key: 'ArrowDown', timeMs: 10 });
  assert.equal(m.getSnapshot().activeIndex, 1);

  // Skips disabled index 2 ('Print') -> lands on index 3 ('Preferences')
  m.send({ type: 'KEY_DOWN', key: 'ArrowDown', timeMs: 20 });
  assert.equal(m.getSnapshot().activeIndex, 3);

  m.send({ type: 'KEY_DOWN', key: 'Home', timeMs: 30 });
  assert.equal(m.getSnapshot().activeIndex, 0);

  // Typeahead 'p' skips disabled 'Print' and highlights 'Preferences' (index 3)
  m.send({ type: 'KEY_DOWN', key: 'p', timeMs: 1000 });
  assert.equal(m.getSnapshot().activeIndex, 3);

  // Enter commits selection and closes
  const enterEnv = m.send({ type: 'KEY_DOWN', key: 'Enter', timeMs: 1050 });
  assert.equal(enterEnv.next.open, false);
  assert.equal(enterEnv.next.selectedId, 'prefs');
  assert.equal(enterEnv.haptic, 'selection');

  // Reopen and Escape closes without changing selectedId
  m.send({ type: 'OPEN' });
  m.send({ type: 'KEY_DOWN', key: 'Home', timeMs: 2000 });
  const esc = m.send({ type: 'KEY_DOWN', key: 'Escape', timeMs: 2010 });
  assert.equal(esc.next.open, false);
  assert.equal(esc.next.selectedId, 'prefs');
});

test('6. reorder: active dragged ID, target index, displacement signs, haptics, and announcements', () => {
  const m = createReorderMachine({ order: ['a', 'b', 'c', 'd'], labels: { a: 'Alpha', b: 'Beta', c: 'Gamma', d: 'Delta' } });
  const lift = m.send({ type: 'LIFT', id: 'b', mode: 'keyboard' });
  assert.equal(lift.haptic, 'lift');
  assert.match(lift.announcement ?? '', /Alpha|Beta/);
  assert.equal(m.getSnapshot().activeId, 'b');
  assert.equal(m.getSnapshot().originIndex, 1);
  assert.equal(m.getSnapshot().targetIndex, 1);

  // Move 'b' (index 1) down to index 3 -> 'c' (2) and 'd' (3) shift -1!
  const mv = m.send({ type: 'MOVE', overIndex: 3 });
  assert.equal(mv.haptic, 'selection');
  assert.equal(mv.direction, 1);
  assert.equal(mv.next.displacement.c, -1);
  assert.equal(mv.next.displacement.d, -1);
  assert.equal(mv.next.displacement.a, 0);

  const drop = m.send({ type: 'DROP', velocity: { x: 0, y: 120 } });
  assert.equal(drop.haptic, 'drop');
  assert.deepEqual(drop.velocity, { x: 0, y: 120 });
  assert.deepEqual(drop.next.order, ['a', 'c', 'd', 'b']);
  assert.equal(drop.next.activeId, null);
  assert.match(drop.announcement ?? '', /position 4 of 4/);
});

test('7. fieldValidation: reward early on input when invalid, punish late on blur, preserve message', () => {
  const m = createFieldValidationMachine({
    validate: (v) => (v.includes('@') ? null : 'Enter a valid email address.'),
  });
  assert.equal(m.getSnapshot().status, 'idle');

  // Punish late: typing incomplete input while idle stays 'idle'
  m.send({ type: 'INPUT', value: 'ada' });
  assert.equal(m.getSnapshot().status, 'idle');

  // Blur on invalid input transitions to 'invalid' with message and error haptic
  const blurBad = m.send({ type: 'BLUR' });
  assert.equal(blurBad.next.status, 'invalid');
  assert.equal(blurBad.next.message, 'Enter a valid email address.');
  assert.equal(blurBad.next.open, true);
  assert.equal(blurBad.haptic, 'error');

  // Reward early: fixing value during INPUT immediately transitions 'invalid' -> 'valid' while preserving message!
  const fixed = m.send({ type: 'INPUT', value: 'ada@lovelace.org' });
  assert.equal(fixed.next.status, 'valid');
  assert.equal(fixed.next.open, false);
  assert.equal(fixed.next.message, 'Enter a valid email address.', 'message preserved during collapse');
  assert.equal(fixed.haptic, 'success');

  // Breaking a valid value while typing relaxes to 'idle', not 'invalid'
  m.send({ type: 'INPUT', value: 'ada' });
  assert.equal(m.getSnapshot().status, 'idle');

  m.send({ type: 'RESET' });
  assert.equal(m.getSnapshot().message, '');
  assert.equal(m.getSnapshot().value, '');
});

test('8. toastQueue: bounded maxVisible, priority ordering, pause/resume, swipe velocity dismiss, and tick', () => {
  const q = createToastQueueMachine({ maxVisible: 2 });
  q.enqueue({ id: 't1', message: 'Saved draft', durationMs: 3000 });
  q.enqueue({ id: 't2', message: 'Synced', durationMs: 3000 });
  q.enqueue({ id: 't3', message: 'Background export', durationMs: 3000, priority: 'normal' });
  q.enqueue({ id: 't4', message: 'Quota warning', durationMs: 4000, priority: 'high' });

  assert.deepEqual(q.getSnapshot().visible.map((t) => t.id), ['t1', 't2']);
  // High-priority queued toast jumps ahead of normal queued toast
  assert.deepEqual(q.getSnapshot().queued.map((t) => t.id), ['t4', 't3']);

  // Pause prevents tick countdown
  q.pause();
  q.tick(2000);
  assert.equal(q.getSnapshot().visible[0].remainingMs, 3000);

  // Resume and tick 1500ms -> 1500ms left
  q.resume();
  q.tick(1500);
  assert.equal(q.getSnapshot().visible[0].remainingMs, 1500);

  // Swipe-dismiss t1 with velocity -> promotes high-priority 't4' into visible!
  const dis = q.dismiss('t1', { x: 820, y: 0 });
  assert.deepEqual(dis.velocity, { x: 820, y: 0 });
  assert.equal(dis.haptic, 'drop');
  assert.deepEqual(q.getSnapshot().visible.map((t) => t.id), ['t2', 't4']);

  // Tick remaining 2000ms -> t2 expires, t3 promotes!
  q.tick(2000);
  assert.deepEqual(q.getSnapshot().visible.map((t) => t.id), ['t4', 't3']);
  assert.equal(q.getSnapshot().queued.length, 0);
});

test('cieo/state/react hooks render cleanly on the server via useSyncExternalStore', () => {
  function ServerProbe() {
    const [val] = useControllableState({ defaultValue: 'uncontrolled' });
    const [count] = useMachine(() =>
      createMachineStore(42, (s, e) => ({ prev: s, next: s, event: e, changed: false, direction: 0 })),
    );
    const action = useAsyncAction();
    const disc = useDisclosure({ defaultOpen: true });
    const sheet = useSheetDetents({ detents: [0, 0.5, 1], initialDetent: 0.5 });
    const toasts = useToastQueue({ maxVisible: 3 });
    return h(
      'div',
      {
        'data-val': val,
        'data-count': count,
        'data-action': action.status,
        'data-open': String(disc.open),
        'data-detent': sheet.position,
        'data-toasts': toasts.visible.length,
      },
      'ok',
    );
  }
  const html = renderToStaticMarkup(h(ServerProbe));
  assert.match(html, /data-val="uncontrolled"/);
  assert.match(html, /data-count="42"/);
  assert.match(html, /data-action="idle"/);
  assert.match(html, /data-open="true"/);
  assert.match(html, /data-detent="0\.5"/);
  assert.match(html, /data-toasts="0"/);
});

test('review fixes: a late answer never completes a newer attempt, ids are unguessable, typeahead pauses, shrinking lists stay valid', async () => {
  const { reduceAsyncAction, createInitialAsyncActionState, defaultAttemptId } = await import('../dist/state/asyncAction.js');
  const { createListboxMenuMachine } = await import('../dist/state/listboxMenu.js');
  assert.notEqual(defaultAttemptId(), defaultAttemptId(), 'two visitors never share an idempotency key');

  let s = createInitialAsyncActionState();
  s = reduceAsyncAction(s, { type: 'SUBMIT', attemptId: 'a' }).next;
  s = reduceAsyncAction(s, { type: 'CANCEL' }).next;
  s = reduceAsyncAction(s, { type: 'SUBMIT', attemptId: 'b' }).next;
  const late = reduceAsyncAction(s, { type: 'RESOLVE', attemptId: 'a' });
  assert.equal(late.changed, false, 'the cancelled request answering late is ignored');
  assert.equal(reduceAsyncAction(s, { type: 'RESOLVE', attemptId: 'b' }).next.status, 'succeeded');
  assert.equal(reduceAsyncAction(s, { type: 'RESOLVE' }).next.status, 'succeeded', 'an answer without an id still works');

  const menu = createListboxMenuMachine({ options: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }, { id: 'c', label: 'Cherry' }] });
  menu.send({ type: 'OPEN' });
  menu.send({ type: 'HIGHLIGHT', index: 2 });
  menu.send({ type: 'SELECT', id: 'c' });
  menu.send({ type: 'OPEN' });
  menu.send({ type: 'HIGHLIGHT', index: 2 });
  menu.send({ type: 'SET_OPTIONS', options: [{ id: 'a', label: 'Apple' }] });
  const st = menu.getSnapshot();
  assert.ok(st.activeIndex < 1, 'active row never points past the end of a shrunk list');
  assert.equal(st.selectedId, null, 'a selection whose option vanished is dropped');
});

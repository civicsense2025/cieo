'use client';
/* React hooks for headless state machines. All hooks use useSyncExternalStore for concurrent-safe subscriptions. */
import { useCallback, useMemo, useRef, useSyncExternalStore, useState } from 'react';
import { createMachineStore, type MachineStore, type TransitionEnvelope } from './types.js';
import { createAsyncActionMachine, type AsyncActionOptions, type AsyncActionState, type AsyncActionEvent } from './asyncAction.js';
import { createDisclosureMachine, type DisclosureMachineOptions, type DisclosureState, type DisclosureEvent } from './disclosure.js';
import { createSheetDetentsMachine, type SheetDetentsOptions, type SheetDetentsState, type SheetDetentsEvent } from './sheetDetents.js';
import { createToastQueueMachine, type ToastQueueOptions, type ToastQueueStore } from './toastQueue.js';
import { createFieldValidationMachine, type FieldValidationOptions, type FieldValidationState, type FieldValidationEvent } from './fieldValidation.js';
import { createReorderMachine, type ReorderOptions, type ReorderState, type ReorderEvent } from './reorder.js';
import { createListboxMenuMachine, type ListboxMenuOptions, type ListboxMenuState, type ListboxMenuEvent } from './listboxMenu.js';
import { createSelectionMachine, type SelectionOptions, type SelectionState, type SelectionEvent } from './selection.js';

/* ——— useControllableState ——— */

export interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (next: T) => void;
}

export function useControllableState<T>(opts: UseControllableStateOptions<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const { value, defaultValue, onChange } = opts;
  const [internal, setInternal] = useState<T>(() => (value !== undefined ? value : defaultValue) as T);
  const effective = value !== undefined ? value : internal;
  const latestRef = useRef({ value, effective, onChange });
  latestRef.current = { value, effective, onChange };
  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    const cur = latestRef.current;
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(cur.effective) : next;
    cur.effective = resolved;
    if (cur.value === undefined) setInternal(resolved);
    cur.onChange?.(resolved);
  }, []);
  return [effective, setValue];
}

/* ——— useMachine ——— */

export function useMachine<S, E>(
  factory: () => MachineStore<S, E>,
): [S, (event: E) => TransitionEnvelope<S, E>, MachineStore<S, E>] {
  const storeRef = useRef<MachineStore<S, E> | null>(null);
  if (!storeRef.current) storeRef.current = factory();
  const store = storeRef.current;
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const send = useCallback((event: E) => store.send(event), [store]);
  return [snapshot, send, store];
}

/* ——— useAsyncAction ——— */

export function useAsyncAction(opts: AsyncActionOptions = {}) {
  const storeRef = useRef<MachineStore<AsyncActionState, AsyncActionEvent> | null>(null);
  if (!storeRef.current) storeRef.current = createAsyncActionMachine(opts);
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => ({
    ...state,
    submit: (o?: { attemptId?: string }) => store.send({ type: 'SUBMIT', attemptId: o?.attemptId }),
    resolve: (o?: { announcement?: string }) => store.send({ type: 'RESOLVE', announcement: o?.announcement }),
    reject: (o?: { error?: string; announcement?: string }) => store.send({ type: 'REJECT', error: o?.error, announcement: o?.announcement }),
    timeout: () => store.send({ type: 'TIMEOUT' }),
    cancel: () => store.send({ type: 'CANCEL' }),
    reset: () => store.send({ type: 'RESET' }),
  }), [state, store]);
}

/* ——— useDisclosure ——— */

export function useDisclosure(opts: DisclosureMachineOptions = {}) {
  const storeRef = useRef<MachineStore<DisclosureState, DisclosureEvent> | null>(null);
  if (!storeRef.current) storeRef.current = createDisclosureMachine(opts);
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => ({
    ...state,
    onOpen: () => store.send({ type: 'OPEN' }),
    onOpened: () => store.send({ type: 'OPENED' }),
    onClose: () => store.send({ type: 'CLOSE' }),
    onClosed: () => store.send({ type: 'CLOSED' }),
    toggle: () => store.send({ type: 'TOGGLE' }),
  }), [state, store]);
}

/* ——— useSheetDetents ——— */

export function useSheetDetents(opts: SheetDetentsOptions = {}) {
  const storeRef = useRef<MachineStore<SheetDetentsState, SheetDetentsEvent> | null>(null);
  if (!storeRef.current) storeRef.current = createSheetDetentsMachine(opts);
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => ({
    ...state,
    drag: (position: number) => store.send({ type: 'DRAG', position }),
    release: (velocity?: { x: number; y: number }) => store.send({ type: 'RELEASE', velocity }),
    snapTo: (index: number) => store.send({ type: 'SNAP_TO', index }),
    dismiss: () => store.send({ type: 'DISMISS' }),
  }), [state, store]);
}

/* ——— useToastQueue ——— */

export function useToastQueue(opts: ToastQueueOptions = {}) {
  const storeRef = useRef<ToastQueueStore | null>(null);
  if (!storeRef.current) storeRef.current = createToastQueueMachine(opts);
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => ({
    ...state,
    enqueue: store.enqueue,
    pause: store.pause,
    resume: store.resume,
    dismiss: store.dismiss,
    tick: store.tick,
  }), [state, store]);
}

/* ——— useFieldValidation ——— */

export function useFieldValidation(opts: FieldValidationOptions) {
  const validateRef = useRef(opts.validate);
  validateRef.current = opts.validate;
  const storeRef = useRef<MachineStore<FieldValidationState, FieldValidationEvent> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createFieldValidationMachine({
      ...opts,
      validate: (value: string) => validateRef.current(value),
    });
  }
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => ({
    ...state,
    input: (value: string) => store.send({ type: 'INPUT', value }),
    blur: () => store.send({ type: 'BLUR' }),
    reset: () => store.send({ type: 'RESET' }),
  }), [state, store]);
}

/* ——— useReorder ——— */

export function useReorder(opts: ReorderOptions) {
  const storeRef = useRef<MachineStore<ReorderState, ReorderEvent> | null>(null);
  if (!storeRef.current) storeRef.current = createReorderMachine(opts);
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => ({
    ...state,
    lift: (id: string, mode: 'keyboard' | 'pointer') => store.send({ type: 'LIFT', id, mode }),
    move: (overIndex: number) => store.send({ type: 'MOVE', overIndex }),
    drop: (velocity?: { x: number; y: number }) => store.send({ type: 'DROP', velocity }),
    cancel: () => store.send({ type: 'CANCEL' }),
  }), [state, store]);
}

/* ——— useListboxMenu ——— */

export function useListboxMenu(opts: ListboxMenuOptions = {}) {
  const storeRef = useRef<MachineStore<ListboxMenuState, ListboxMenuEvent> | null>(null);
  if (!storeRef.current) storeRef.current = createListboxMenuMachine(opts);
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => ({
    ...state,
    send: (event: ListboxMenuEvent) => store.send(event),
  }), [state, store]);
}

/* ——— useSelection ——— */

export function useSelection<T extends string = string>(opts: SelectionOptions<T> = {}) {
  const storeRef = useRef<MachineStore<SelectionState<T>, SelectionEvent<T>> | null>(null);
  if (!storeRef.current) storeRef.current = createSelectionMachine(opts);
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => ({
    ...state,
    select: (value: T) => store.send({ type: 'SELECT', value }),
    toggle: (value: T) => store.send({ type: 'TOGGLE', value }),
    moveFocus: (delta: -1 | 1) => store.send({ type: 'MOVE_FOCUS', delta }),
    clear: () => store.send({ type: 'CLEAR' }),
  }), [state, store]);
}

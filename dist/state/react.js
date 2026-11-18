'use client';
/* React hooks for headless state machines. All hooks use useSyncExternalStore for concurrent-safe subscriptions. */
import { useCallback, useMemo, useRef, useSyncExternalStore, useState } from 'react';
import { createAsyncActionMachine } from './asyncAction.js';
import { createDisclosureMachine } from './disclosure.js';
import { createSheetDetentsMachine } from './sheetDetents.js';
import { createToastQueueMachine } from './toastQueue.js';
import { createFieldValidationMachine } from './fieldValidation.js';
import { createReorderMachine } from './reorder.js';
import { createListboxMenuMachine } from './listboxMenu.js';
import { createSelectionMachine } from './selection.js';
export function useControllableState(opts) {
    const { value, defaultValue, onChange } = opts;
    const [internal, setInternal] = useState(() => (value !== undefined ? value : defaultValue));
    const effective = value !== undefined ? value : internal;
    const latestRef = useRef({ value, effective, onChange });
    latestRef.current = { value, effective, onChange };
    const setValue = useCallback((next) => {
        const cur = latestRef.current;
        const resolved = typeof next === 'function' ? next(cur.effective) : next;
        cur.effective = resolved;
        if (cur.value === undefined)
            setInternal(resolved);
        cur.onChange?.(resolved);
    }, []);
    return [effective, setValue];
}
/* ——— useMachine ——— */
export function useMachine(factory) {
    const storeRef = useRef(null);
    if (!storeRef.current)
        storeRef.current = factory();
    const store = storeRef.current;
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const send = useCallback((event) => store.send(event), [store]);
    return [snapshot, send, store];
}
/* ——— useAsyncAction ——— */
export function useAsyncAction(opts = {}) {
    const storeRef = useRef(null);
    if (!storeRef.current)
        storeRef.current = createAsyncActionMachine(opts);
    const store = storeRef.current;
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return useMemo(() => ({
        ...state,
        submit: (o) => store.send({ type: 'SUBMIT', attemptId: o?.attemptId }),
        resolve: (o) => store.send({ type: 'RESOLVE', announcement: o?.announcement }),
        reject: (o) => store.send({ type: 'REJECT', error: o?.error, announcement: o?.announcement }),
        timeout: () => store.send({ type: 'TIMEOUT' }),
        cancel: () => store.send({ type: 'CANCEL' }),
        reset: () => store.send({ type: 'RESET' }),
    }), [state, store]);
}
/* ——— useDisclosure ——— */
export function useDisclosure(opts = {}) {
    const storeRef = useRef(null);
    if (!storeRef.current)
        storeRef.current = createDisclosureMachine(opts);
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
export function useSheetDetents(opts = {}) {
    const storeRef = useRef(null);
    if (!storeRef.current)
        storeRef.current = createSheetDetentsMachine(opts);
    const store = storeRef.current;
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return useMemo(() => ({
        ...state,
        drag: (position) => store.send({ type: 'DRAG', position }),
        release: (velocity) => store.send({ type: 'RELEASE', velocity }),
        snapTo: (index) => store.send({ type: 'SNAP_TO', index }),
        dismiss: () => store.send({ type: 'DISMISS' }),
    }), [state, store]);
}
/* ——— useToastQueue ——— */
export function useToastQueue(opts = {}) {
    const storeRef = useRef(null);
    if (!storeRef.current)
        storeRef.current = createToastQueueMachine(opts);
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
export function useFieldValidation(opts) {
    const validateRef = useRef(opts.validate);
    validateRef.current = opts.validate;
    const storeRef = useRef(null);
    if (!storeRef.current) {
        storeRef.current = createFieldValidationMachine({
            ...opts,
            validate: (value) => validateRef.current(value),
        });
    }
    const store = storeRef.current;
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return useMemo(() => ({
        ...state,
        input: (value) => store.send({ type: 'INPUT', value }),
        blur: () => store.send({ type: 'BLUR' }),
        reset: () => store.send({ type: 'RESET' }),
    }), [state, store]);
}
/* ——— useReorder ——— */
export function useReorder(opts) {
    const storeRef = useRef(null);
    if (!storeRef.current)
        storeRef.current = createReorderMachine(opts);
    const store = storeRef.current;
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return useMemo(() => ({
        ...state,
        lift: (id, mode) => store.send({ type: 'LIFT', id, mode }),
        move: (overIndex) => store.send({ type: 'MOVE', overIndex }),
        drop: (velocity) => store.send({ type: 'DROP', velocity }),
        cancel: () => store.send({ type: 'CANCEL' }),
    }), [state, store]);
}
/* ——— useListboxMenu ——— */
export function useListboxMenu(opts = {}) {
    const storeRef = useRef(null);
    if (!storeRef.current)
        storeRef.current = createListboxMenuMachine(opts);
    const store = storeRef.current;
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return useMemo(() => ({
        ...state,
        send: (event) => store.send(event),
    }), [state, store]);
}
/* ——— useSelection ——— */
export function useSelection(opts = {}) {
    const storeRef = useRef(null);
    if (!storeRef.current)
        storeRef.current = createSelectionMachine(opts);
    const store = storeRef.current;
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return useMemo(() => ({
        ...state,
        select: (value) => store.send({ type: 'SELECT', value }),
        toggle: (value) => store.send({ type: 'TOGGLE', value }),
        moveFocus: (delta) => store.send({ type: 'MOVE_FOCUS', delta }),
        clear: () => store.send({ type: 'CLEAR' }),
    }), [state, store]);
}

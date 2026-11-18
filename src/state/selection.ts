/* Headless single/multiple selection and roving focus machine with directional transition sign. */
import { createMachineStore, unchanged, type AnchorRect, type MachineStore, type TransitionEnvelope } from './types.js';

export interface SelectionState<T extends string = string> {
  readonly items: readonly T[];
  readonly selected: readonly T[];
  readonly value: T | null;
  readonly multiple: boolean;
  readonly focusedIndex: number;
  readonly loop: boolean;
}

export type SelectionEvent<T extends string = string> =
  | { readonly type: 'SELECT'; readonly value: T; readonly anchorRect?: AnchorRect }
  | { readonly type: 'TOGGLE'; readonly value: T; readonly anchorRect?: AnchorRect }
  | { readonly type: 'FOCUS'; readonly index: number }
  | { readonly type: 'MOVE_FOCUS'; readonly delta: -1 | 1; readonly select?: boolean }
  | { readonly type: 'HOME'; readonly select?: boolean }
  | { readonly type: 'END'; readonly select?: boolean }
  | { readonly type: 'SET_ITEMS'; readonly items: readonly T[] }
  | { readonly type: 'CLEAR' };

export interface SelectionOptions<T extends string = string> {
  readonly items?: readonly T[];
  readonly initialSelected?: readonly T[];
  readonly multiple?: boolean;
  readonly loop?: boolean;
}

export function createInitialSelectionState<T extends string = string>(options: SelectionOptions<T> = {}): SelectionState<T> {
  const items = [...(options.items ?? [])];
  const multiple = options.multiple ?? false;
  const rawSelected = (options.initialSelected ?? []).filter((v) => items.includes(v));
  const selected = multiple ? rawSelected : rawSelected.slice(0, 1);
  const firstIdx = selected.length > 0 ? items.indexOf(selected[0]!) : items.length > 0 ? 0 : -1;
  return {
    items,
    selected,
    value: selected[0] ?? null,
    multiple,
    focusedIndex: firstIdx,
    loop: options.loop ?? true,
  };
}

function directionBetween(prevIdx: number, nextIdx: number): -1 | 0 | 1 {
  if (prevIdx < 0 || nextIdx < 0 || prevIdx === nextIdx) return 0;
  return Math.sign(nextIdx - prevIdx) as -1 | 0 | 1;
}

export function reduceSelection<T extends string = string>(
  state: SelectionState<T>,
  event: SelectionEvent<T>,
): TransitionEnvelope<SelectionState<T>, SelectionEvent<T>> {
  switch (event.type) {
    case 'SELECT': {
      const idx = state.items.indexOf(event.value);
      if (idx === -1) return unchanged(state, event);
      const prevPrimary = state.value !== null ? state.items.indexOf(state.value) : state.focusedIndex;
      const nextSelected = state.multiple
        ? state.selected.includes(event.value)
          ? state.selected
          : [...state.selected, event.value]
        : [event.value];
      if (nextSelected.length === state.selected.length && nextSelected.every((v, i) => v === state.selected[i]) && idx === state.focusedIndex) {
        return unchanged(state, event);
      }
      return {
        prev: state,
        next: { ...state, selected: nextSelected, value: nextSelected[0] ?? null, focusedIndex: idx },
        event,
        changed: true,
        direction: directionBetween(prevPrimary, idx),
        anchorRect: event.anchorRect,
        haptic: 'selection',
      };
    }
    case 'TOGGLE': {
      const idx = state.items.indexOf(event.value);
      if (idx === -1) return unchanged(state, event);
      const has = state.selected.includes(event.value);
      const nextSelected = state.multiple
        ? has
          ? state.selected.filter((v) => v !== event.value)
          : [...state.selected, event.value]
        : has
          ? []
          : [event.value];
      const prevIdx = state.focusedIndex;
      return {
        prev: state,
        next: { ...state, selected: nextSelected, value: nextSelected[0] ?? null, focusedIndex: idx },
        event,
        changed: true,
        direction: directionBetween(prevIdx, idx),
        anchorRect: event.anchorRect,
        haptic: 'selection',
      };
    }
    case 'FOCUS': {
      if (state.items.length === 0) return unchanged(state, event);
      const idx = Math.min(state.items.length - 1, Math.max(0, event.index));
      if (idx === state.focusedIndex) return unchanged(state, event);
      return {
        prev: state,
        next: { ...state, focusedIndex: idx },
        event,
        changed: true,
        direction: directionBetween(state.focusedIndex, idx),
      };
    }
    case 'MOVE_FOCUS':
    case 'HOME':
    case 'END': {
      const n = state.items.length;
      if (n === 0) return unchanged(state, event);
      let nextIdx: number;
      if (event.type === 'HOME') nextIdx = 0;
      else if (event.type === 'END') nextIdx = n - 1;
      else if (state.focusedIndex < 0) nextIdx = event.delta > 0 ? 0 : n - 1;
      else {
        const raw = state.focusedIndex + event.delta;
        nextIdx = raw < 0 ? (state.loop ? n - 1 : 0) : raw >= n ? (state.loop ? 0 : n - 1) : raw;
      }
      const nextSelected =
        event.select && !state.multiple ? [state.items[nextIdx]!] : state.selected;
      const selChanged = nextSelected.length !== state.selected.length || nextSelected[0] !== state.selected[0];
      if (nextIdx === state.focusedIndex && !selChanged) return unchanged(state, event);
      return {
        prev: state,
        next: { ...state, focusedIndex: nextIdx, selected: nextSelected, value: nextSelected[0] ?? null },
        event,
        changed: true,
        direction: directionBetween(state.focusedIndex, nextIdx),
        ...(selChanged ? { haptic: 'selection' as const } : {}),
      };
    }
    case 'SET_ITEMS': {
      const items = [...event.items];
      const selected = state.selected.filter((v) => items.includes(v));
      const focusedIndex = items.length === 0 ? -1 : Math.min(items.length - 1, Math.max(0, state.focusedIndex));
      return {
        prev: state,
        next: { ...state, items, selected, value: selected[0] ?? null, focusedIndex },
        event,
        changed: true,
        direction: 0,
      };
    }
    case 'CLEAR': {
      if (state.selected.length === 0) return unchanged(state, event);
      return { prev: state, next: { ...state, selected: [], value: null }, event, changed: true, direction: 0 };
    }
  }
}

export function createSelectionMachine<T extends string = string>(
  options: SelectionOptions<T> = {},
): MachineStore<SelectionState<T>, SelectionEvent<T>> {
  return createMachineStore(createInitialSelectionState(options), reduceSelection);
}

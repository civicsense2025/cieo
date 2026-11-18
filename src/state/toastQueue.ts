/* Headless toast queue: bounded FIFO with priority, pause/resume, swipe dismiss with velocity, tick countdown. */
import type { TransitionEnvelope, Vector2 } from './types.js';

export interface ToastEntry {
  readonly id: string;
  readonly message: string;
  readonly durationMs: number;
  readonly priority: 'normal' | 'high';
  readonly remainingMs: number;
}

export interface ToastQueueState {
  readonly visible: readonly ToastEntry[];
  readonly queued: readonly ToastEntry[];
  readonly paused: boolean;
}

export interface ToastEnqueueOptions {
  readonly id: string;
  readonly message: string;
  readonly durationMs: number;
  readonly priority?: 'normal' | 'high';
}

export interface ToastQueueOptions {
  readonly maxVisible?: number;
}

export interface ToastQueueStore {
  getSnapshot(): ToastQueueState;
  subscribe(listener: () => void): () => void;
  enqueue(options: ToastEnqueueOptions): void;
  pause(): void;
  resume(): void;
  dismiss(id: string, velocity?: Vector2): TransitionEnvelope<ToastQueueState, { type: 'DISMISS' }>;
  tick(deltaMs: number): void;
}

function insertByPriority(queue: ToastEntry[], entry: ToastEntry): ToastEntry[] {
  const result = [...queue];
  if (entry.priority === 'high') {
    // Insert after last high-priority entry
    let insertAt = 0;
    for (let i = 0; i < result.length; i++) {
      if (result[i]!.priority === 'high') insertAt = i + 1;
    }
    result.splice(insertAt, 0, entry);
  } else {
    result.push(entry);
  }
  return result;
}

export function createToastQueueMachine(options: ToastQueueOptions = {}): ToastQueueStore {
  const maxVisible = options.maxVisible ?? 3;
  let state: ToastQueueState = { visible: [], queued: [], paused: false };
  const listeners = new Set<() => void>();

  function notify() {
    for (const fn of [...listeners]) fn();
  }

  function promote(): void {
    while (state.visible.length < maxVisible && state.queued.length > 0) {
      const [next, ...rest] = state.queued;
      state = { ...state, visible: [...state.visible, next!], queued: rest };
    }
  }

  const store: ToastQueueStore = {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },

    enqueue(opts) {
      const entry: ToastEntry = {
        id: opts.id,
        message: opts.message,
        durationMs: opts.durationMs,
        priority: opts.priority ?? 'normal',
        remainingMs: opts.durationMs,
      };
      if (state.visible.length < maxVisible) {
        state = { ...state, visible: [...state.visible, entry] };
      } else {
        state = { ...state, queued: insertByPriority([...state.queued], entry) };
      }
      notify();
    },

    pause() {
      if (state.paused) return;
      state = { ...state, paused: true };
      notify();
    },

    resume() {
      if (!state.paused) return;
      state = { ...state, paused: false };
      notify();
    },

    dismiss(id, velocity?): TransitionEnvelope<ToastQueueState, { type: 'DISMISS' }> {
      const prev = state;
      const visibleIdx = state.visible.findIndex((t) => t.id === id);
      const queuedIdx = visibleIdx < 0 ? state.queued.findIndex((t) => t.id === id) : -1;
      if (visibleIdx < 0 && queuedIdx < 0) {
        return {
          prev,
          next: prev,
          event: { type: 'DISMISS' as const },
          changed: false,
          direction: 0 as const,
        };
      }
      if (visibleIdx >= 0) {
        const visible = state.visible.filter((t) => t.id !== id);
        state = { ...state, visible };
        promote();
      } else {
        state = { ...state, queued: state.queued.filter((t) => t.id !== id) };
      }
      const next = state;
      notify();
      return {
        prev,
        next,
        event: { type: 'DISMISS' as const },
        changed: true,
        direction: -1 as const,
        haptic: 'drop' as const,
        ...(velocity !== undefined ? { velocity } : {}),
      };
    },

    tick(deltaMs) {
      if (state.paused || state.visible.length === 0) return;
      const updated = state.visible.map((t) => ({
        ...t,
        remainingMs: t.remainingMs - deltaMs,
      }));
      const expired = updated.filter((t) => t.remainingMs <= 0);
      const surviving = updated.filter((t) => t.remainingMs > 0);
      if (expired.length === 0 && surviving.length === state.visible.length) {
        state = { ...state, visible: surviving };
        notify();
        return;
      }
      state = { ...state, visible: surviving };
      promote();
      notify();
    },
  };

  return store;
}

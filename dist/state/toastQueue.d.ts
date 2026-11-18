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
    dismiss(id: string, velocity?: Vector2): TransitionEnvelope<ToastQueueState, {
        type: 'DISMISS';
    }>;
    tick(deltaMs: number): void;
}
export declare function createToastQueueMachine(options?: ToastQueueOptions): ToastQueueStore;

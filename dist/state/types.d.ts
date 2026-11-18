export type HapticIntent = 'selection' | 'lift' | 'drop' | 'success' | 'warning' | 'error';
export interface Vector2 {
    readonly x: number;
    readonly y: number;
}
export interface AnchorRect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}
export interface TransitionEnvelope<S, E> {
    readonly prev: S;
    readonly next: S;
    readonly event: E;
    readonly changed: boolean;
    readonly direction: -1 | 0 | 1;
    readonly velocity?: Vector2;
    readonly anchorRect?: AnchorRect;
    readonly haptic?: HapticIntent;
    readonly announcement?: string;
}
export type MachineReducer<S, E> = (state: S, event: E) => TransitionEnvelope<S, E>;
export interface MachineStore<S, E> {
    getSnapshot(): S;
    getLastEnvelope(): TransitionEnvelope<S, E> | null;
    send(event: E): TransitionEnvelope<S, E>;
    subscribe(listener: () => void): () => void;
}
export declare function unchanged<S, E>(state: S, event: E): TransitionEnvelope<S, E>;
/** Creates a pure external store compatible with React's useSyncExternalStore. */
export declare function createMachineStore<S, E>(initialState: S, reducer: MachineReducer<S, E>): MachineStore<S, E>;

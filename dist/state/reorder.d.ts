import { type MachineStore, type TransitionEnvelope, type Vector2 } from './types.js';
export interface ReorderState {
    readonly order: readonly string[];
    readonly activeId: string | null;
    readonly originIndex: number;
    readonly targetIndex: number;
    readonly displacement: Readonly<Record<string, -1 | 0 | 1>>;
    readonly mode: 'keyboard' | 'pointer' | null;
}
export type ReorderEvent = {
    readonly type: 'LIFT';
    readonly id: string;
    readonly mode: 'keyboard' | 'pointer';
} | {
    readonly type: 'MOVE';
    readonly overIndex: number;
} | {
    readonly type: 'DROP';
    readonly velocity?: Vector2;
} | {
    readonly type: 'CANCEL';
};
export interface ReorderOptions {
    readonly order: readonly string[];
    readonly labels?: Readonly<Record<string, string>>;
}
export declare function createInitialReorderState(options: ReorderOptions): ReorderState;
export declare function reduceReorder(state: ReorderState, event: ReorderEvent, labels?: Readonly<Record<string, string>>): TransitionEnvelope<ReorderState, ReorderEvent>;
export declare function createReorderMachine(options: ReorderOptions): MachineStore<ReorderState, ReorderEvent>;

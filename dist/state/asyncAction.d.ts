import { type AnchorRect, type MachineStore, type TransitionEnvelope } from './types.js';
export type AsyncActionStatus = 'idle' | 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'uncertain';
export interface AsyncActionState {
    readonly status: AsyncActionStatus;
    readonly attemptId: string | null;
    readonly attemptCount: number;
    readonly error?: string;
}
export type AsyncActionEvent = {
    readonly type: 'SUBMIT';
    readonly attemptId?: string;
    readonly anchorRect?: AnchorRect;
} | {
    readonly type: 'RESOLVE';
    readonly announcement?: string;
} | {
    readonly type: 'REJECT';
    readonly error?: string;
    readonly announcement?: string;
} | {
    readonly type: 'TIMEOUT';
    readonly announcement?: string;
} | {
    readonly type: 'CANCEL';
    readonly announcement?: string;
} | {
    readonly type: 'RESET';
};
export interface AsyncActionOptions {
    readonly initialStatus?: AsyncActionStatus;
    readonly createAttemptId?: (attemptNumber: number) => string;
}
export declare function createInitialAsyncActionState(initialStatus?: AsyncActionStatus): AsyncActionState;
export declare function reduceAsyncAction(state: AsyncActionState, event: AsyncActionEvent, mintId?: (attemptNumber: number) => string): TransitionEnvelope<AsyncActionState, AsyncActionEvent>;
export declare function createAsyncActionMachine(options?: AsyncActionOptions): MachineStore<AsyncActionState, AsyncActionEvent>;

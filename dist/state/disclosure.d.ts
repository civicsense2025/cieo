import { type AnchorRect, type MachineStore, type TransitionEnvelope, type Vector2 } from './types.js';
export type DisclosurePhase = 'closed' | 'opening' | 'open' | 'closing';
export interface DisclosureState {
    readonly phase: DisclosurePhase;
    readonly open: boolean;
}
export type DisclosureEvent = {
    readonly type: 'OPEN';
    readonly anchorRect?: AnchorRect;
} | {
    readonly type: 'OPENED';
} | {
    readonly type: 'CLOSE';
    readonly velocity?: Vector2;
} | {
    readonly type: 'CLOSED';
} | {
    readonly type: 'TOGGLE';
    readonly anchorRect?: AnchorRect;
};
export interface DisclosureMachineOptions {
    readonly defaultOpen?: boolean;
}
export declare function createInitialDisclosureState(defaultOpen?: boolean): DisclosureState;
export declare function reduceDisclosure(state: DisclosureState, event: DisclosureEvent): TransitionEnvelope<DisclosureState, DisclosureEvent>;
export declare function createDisclosureMachine(options?: DisclosureMachineOptions): MachineStore<DisclosureState, DisclosureEvent>;

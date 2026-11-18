import { type AnchorRect, type MachineStore, type TransitionEnvelope } from './types.js';
export interface SelectionState<T extends string = string> {
    readonly items: readonly T[];
    readonly selected: readonly T[];
    readonly value: T | null;
    readonly multiple: boolean;
    readonly focusedIndex: number;
    readonly loop: boolean;
}
export type SelectionEvent<T extends string = string> = {
    readonly type: 'SELECT';
    readonly value: T;
    readonly anchorRect?: AnchorRect;
} | {
    readonly type: 'TOGGLE';
    readonly value: T;
    readonly anchorRect?: AnchorRect;
} | {
    readonly type: 'FOCUS';
    readonly index: number;
} | {
    readonly type: 'MOVE_FOCUS';
    readonly delta: -1 | 1;
    readonly select?: boolean;
} | {
    readonly type: 'HOME';
    readonly select?: boolean;
} | {
    readonly type: 'END';
    readonly select?: boolean;
} | {
    readonly type: 'SET_ITEMS';
    readonly items: readonly T[];
} | {
    readonly type: 'CLEAR';
};
export interface SelectionOptions<T extends string = string> {
    readonly items?: readonly T[];
    readonly initialSelected?: readonly T[];
    readonly multiple?: boolean;
    readonly loop?: boolean;
}
export declare function createInitialSelectionState<T extends string = string>(options?: SelectionOptions<T>): SelectionState<T>;
export declare function reduceSelection<T extends string = string>(state: SelectionState<T>, event: SelectionEvent<T>): TransitionEnvelope<SelectionState<T>, SelectionEvent<T>>;
export declare function createSelectionMachine<T extends string = string>(options?: SelectionOptions<T>): MachineStore<SelectionState<T>, SelectionEvent<T>>;

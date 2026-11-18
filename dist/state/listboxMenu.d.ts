import { type AnchorRect, type MachineStore, type TransitionEnvelope } from './types.js';
export interface ListboxOption {
    readonly id: string;
    readonly label: string;
    readonly disabled?: boolean;
}
export interface ListboxMenuState {
    readonly options: readonly ListboxOption[];
    readonly open: boolean;
    readonly activeIndex: number;
    readonly selectedId: string | null;
    readonly typeaheadBuffer: string;
    readonly lastTypeaheadMs: number;
}
export type ListboxMenuEvent = {
    readonly type: 'OPEN';
    readonly anchorRect?: AnchorRect;
} | {
    readonly type: 'CLOSE';
} | {
    readonly type: 'TOGGLE';
    readonly anchorRect?: AnchorRect;
} | {
    readonly type: 'HIGHLIGHT';
    readonly index: number;
} | {
    readonly type: 'SELECT';
    readonly id: string;
} | {
    readonly type: 'KEY_DOWN';
    readonly key: string;
    readonly timeMs?: number;
} | {
    readonly type: 'SET_OPTIONS';
    readonly options: readonly ListboxOption[];
};
export interface ListboxMenuOptions {
    readonly options?: readonly ListboxOption[];
    readonly defaultOpen?: boolean;
    readonly initialSelectedId?: string | null;
    readonly loop?: boolean;
    readonly typeaheadTimeoutMs?: number;
}
export declare function createInitialListboxMenuState(options?: ListboxMenuOptions): ListboxMenuState;
export declare function reduceListboxMenu(state: ListboxMenuState, event: ListboxMenuEvent, loop?: boolean, timeoutMs?: number): TransitionEnvelope<ListboxMenuState, ListboxMenuEvent>;
export declare function createListboxMenuMachine(options?: ListboxMenuOptions): MachineStore<ListboxMenuState, ListboxMenuEvent>;

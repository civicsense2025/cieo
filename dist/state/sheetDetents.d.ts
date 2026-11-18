import { type MachineStore, type TransitionEnvelope, type Vector2 } from './types.js';
export interface SheetDetentsState {
    readonly detents: readonly number[];
    readonly index: number;
    readonly position: number;
    readonly dragging: boolean;
}
export type SheetDetentsEvent = {
    readonly type: 'DRAG';
    readonly position: number;
} | {
    readonly type: 'RELEASE';
    readonly position?: number;
    readonly velocity?: Vector2;
} | {
    readonly type: 'SNAP_TO';
    readonly index?: number;
    readonly detent?: number;
} | {
    readonly type: 'DISMISS';
    readonly velocity?: Vector2;
};
export interface SheetDetentsOptions {
    readonly detents?: readonly number[];
    readonly initialDetent?: number;
    readonly initialIndex?: number;
    readonly velocityThreshold?: number;
}
export declare function createInitialSheetDetentsState(options?: SheetDetentsOptions): SheetDetentsState;
export declare function reduceSheetDetents(state: SheetDetentsState, event: SheetDetentsEvent, velocityThreshold?: number): TransitionEnvelope<SheetDetentsState, SheetDetentsEvent>;
export declare function createSheetDetentsMachine(options?: SheetDetentsOptions): MachineStore<SheetDetentsState, SheetDetentsEvent>;

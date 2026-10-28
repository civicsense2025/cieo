import type { PrimitivePartProps } from '../parts.js';
export interface CharacterCountRingProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        track?: PrimitivePartProps;
        arc?: PrimitivePartProps;
        number?: PrimitivePartProps;
    };
    /** Characters used so far. Required. */
    length: number;
    /** The limit. Required. */
    max: number;
    /** Remaining characters at which the ring warns and shows the countdown. Defaults to 20. */
    warnAt?: number;
}
export interface RingState {
    /** 0 to 1, how full the ring is. */
    fraction: number;
    /** Characters left; negative once past the limit. */
    remaining: number;
    tone: 'normal' | 'warning' | 'danger';
    /** True when the countdown number should be visible inside the ring. */
    showNumber: boolean;
}
/** Pure ring state. Bad input (NaN, negatives) clamps to an empty ring; a limit of 0 or less is always full and over. */
export declare function ringState(length: number, max: number, warnAt?: number): RingState;
/** Screen-reader sentence for the current count. */
export declare function ringAnnouncement(remaining: number): string;
export declare function CharacterCountRing({ className, slotProps, length, max, warnAt }: CharacterCountRingProps): import("react/jsx-runtime").JSX.Element;

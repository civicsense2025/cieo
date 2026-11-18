import { type ReactNode } from 'react';
import type { MotionKind } from '../core/spring.js';
export interface Swap<T> {
    shown: T;
    leaving: T | null;
    key: number;
    done: (key: number) => void;
}
/** Holds the outgoing value while it exits; reduced motion skips the exit, and a timer clears it if no animation event arrives. */
export declare function useSwap<T>(value: T, fallbackMs?: number): Swap<T>;
/** Text swap: the old value drifts up and fades out, then the new one fades in, in one grid cell so nothing reflows mid-swap. */
export declare function SwapText({ value, className, render }: {
    value: string | number;
    className?: string;
    render?: (v: string | number) => ReactNode;
}): import("react/jsx-runtime").JSX.Element;
/** Rolling number: only changed digits roll, in the direction of change. The first render is instant. */
export declare function Digits({ value, className, kind }: {
    value: number | string;
    className?: string;
    kind?: MotionKind;
}): import("react/jsx-runtime").JSX.Element;

import { type ReactNode, type RefObject } from 'react';
import { type MotionKind, type Preset, type SpringConfig } from '../core/spring.js';
import { type PresenceOptions } from '../dom/index.js';
export declare function useReducedMotion(): boolean;
export interface SpringOptions {
    preset?: Preset | SpringConfig;
    kind?: MotionKind;
    onSettle?: (value: number) => void;
}
/** Follows `target` with a critically damped spring and hands each frame to onFrame without re-rendering. Reduced motion jumps. */
export declare function useSpring(target: number, onFrame: (value: number) => void, opts?: SpringOptions): void;
/** Like useSpring but returns the value as state (re-renders per frame). Use for small, isolated readouts only. */
export declare function useSpringValue(target: number, opts?: SpringOptions): number;
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
/** Text that swaps with the DOM helper whenever `value` changes (no wrapper markup left behind). */
export declare function useSwapEffect(ref: RefObject<Element | null>, value: string, opts?: {
    y?: number;
    blur?: number;
}): void;
/** Sliding indicator: when `key` changes, the indicator springs from its old span with a leading and a lagging edge. */
export declare function useEdges(indicator: RefObject<Element | null>, key: unknown, opts?: {
    disabled?: boolean;
}): void;
/** FLIP reflow: children of `container` slide from where they were to where they are after a render that changed `key`. */
export declare function useFlip(container: RefObject<Element | null>, key: unknown, opts?: {
    stagger?: number;
    clip?: Element;
}): void;
/** Mount/unmount with a shared enter/exit spring. Returns whether to render and a ref for the element. */
export declare function usePresence<T extends HTMLElement>(open: boolean, opts?: PresenceOptions & {
    disabled?: boolean;
}): {
    mounted: boolean;
    ref: RefObject<T | null>;
};
export { S, EXIT, LAG, ARRIVE, Track, allowed, now, resp, prog, setMotionState } from '../core/spring.js';
export type { Preset, SpringConfig, MotionKind } from '../core/spring.js';

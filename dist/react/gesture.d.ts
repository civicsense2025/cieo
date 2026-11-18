import { type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { type MotionKind, type Preset, type SpringConfig } from '../core/spring.js';
export interface GestureBounds {
    min?: number;
    max?: number;
    dimension?: number;
    resistance?: number;
}
export interface GestureReleaseInfo {
    readonly value: number;
    readonly velocity: number;
    readonly target: number;
}
export interface UseGestureSpringOptions {
    axis?: 'x' | 'y';
    preset?: Preset | SpringConfig;
    kind?: MotionKind;
    bounds?: GestureBounds;
    disabled?: boolean;
    resolveTarget?: (value: number, velocity: number) => number;
    onFrame?: (value: number) => void;
    onRelease?: (info: GestureReleaseInfo) => void;
    onSettle?: (value: number) => void;
}
interface PointerLike {
    pointerId: number;
    button?: number;
    clientX: number;
    clientY: number;
    timeStamp?: number;
    currentTarget?: {
        setPointerCapture?: (id: number) => void;
        releasePointerCapture?: (id: number) => void;
    } | null;
}
export interface GestureSpringResult<T extends HTMLElement = HTMLDivElement> {
    ref: RefObject<T | null>;
    handlers: {
        onPointerDown: (event: ReactPointerEvent<T> | PointerLike) => void;
        onPointerMove: (event: ReactPointerEvent<T> | PointerLike) => void;
        onPointerUp: (event: ReactPointerEvent<T> | PointerLike) => void;
        onPointerCancel: (event: ReactPointerEvent<T> | PointerLike) => void;
    };
    release: (from: number, velocity: number, to: number) => void;
    jump: (to: number) => void;
}
/** Tracks pointer movement with rubber-band bounds and hands release velocity directly into Track.release. */
export declare function useGestureSpring<T extends HTMLElement = HTMLDivElement>(opts?: UseGestureSpringOptions): GestureSpringResult<T>;
export interface SharedAxisOptions {
    axis?: 'x' | 'y';
    distance?: number;
    preset?: Preset | SpringConfig;
    disabled?: boolean;
}
/** Directional shared-axis arrival: slides and fades from `direction * distance` whenever `key` changes. */
export declare function useSharedAxis<T extends HTMLElement = HTMLDivElement>(key: unknown, direction: -1 | 0 | 1, opts?: SharedAxisOptions): {
    ref: RefObject<T | null>;
    direction: -1 | 0 | 1;
};
export {};

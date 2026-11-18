import { type MotionKind, type SpringConfig } from '../core/spring.js';
import { type Cancel, type From, type Targets } from './paint.js';
export interface PresenceOptions {
    kind?: MotionKind;
    from?: Partial<From>;
    cfg?: SpringConfig;
    delay?: number;
    stagger?: number;
    remove?: boolean;
    done?: () => void;
}
export declare function enter(target: Targets, opts?: PresenceOptions): Cancel;
export declare const exit: (el: HTMLElement, opts?: PresenceOptions) => Cancel;
export interface SwapOptions {
    kind?: MotionKind;
    y?: number;
    blur?: number;
    cfg?: SpringConfig;
    done?: () => void;
}
/** The old content leaves in EXIT (100 ms, ease-in), then the new content springs in. Never overlapping. */
export declare function swap(host: Element, next: string | Node, opts?: SwapOptions): Cancel;
export declare function track(el: Element, prop: string, value: number, opts?: {
    kind?: MotionKind;
    cfg?: SpringConfig;
}): Cancel;

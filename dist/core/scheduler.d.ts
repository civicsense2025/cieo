import { type SpringConfig } from './spring.js';
export type MotionKind = 'feedback' | 'entrance' | 'ambient';
export interface MotionState {
    paused: boolean;
    reduced: boolean;
    hidden: boolean;
}
/** Lets an app supply its own pause / reduced-motion switch. Call setMotionState(null) to restore defaults. */
export declare function setMotionState(fn: (() => Partial<MotionState>) | null): void;
/** One cached media query list instead of a matchMedia call per job per frame. */
export declare function reducedQuery(): MediaQueryList | null;
export declare function state(): MotionState;
/** Every attribute that turns motion down for a subtree below <html>: the component prop (motion={false} →
    data-motion="off"), a host-level reduced preference, and the legacy flag. JS springs honour all three; the
    page-level form on <html> is read by state(), so setMotionState() can still override it. */
export declare const REDUCED_SUBTREE = "[data-motion=\"off\"], [data-motion=\"reduced\"], [data-reduced-motion=\"true\"]";
/** True when el sits inside a subtree whose motion is off or reduced. A descendant cannot opt back in. */
export declare function subtreeReduced(el?: Element | null): boolean;
export declare function onscreen(el?: Element | null): boolean;
export declare function allowed(kind?: MotionKind, el?: Element | null): boolean;
/** The preset a helper should use: paused feedback still shows, on the fastest spring. */
export declare const config: (kind: MotionKind, cfg?: SpringConfig) => SpringConfig;
export interface Job {
    step: (t: number) => boolean | void;
    kind?: MotionKind;
    finish?: () => void;
}
/** When the motion state changes, running springs that are no longer allowed jump to their end state. */
export declare function sync(): void;
/** Schedules a job and returns cancel(), which finishes it at once. Disallowed jobs finish immediately. */
export declare function run(step: Job | Job['step'], opts?: {
    kind?: MotionKind;
    finish?: () => void;
}): () => void;
export declare const active: () => number;

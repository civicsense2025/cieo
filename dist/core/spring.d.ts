export interface SpringConfig {
    /** Natural frequency in rad/s. Settles (99.9%) in about 9.2 / w seconds. */
    w: number;
}
export declare const S: {
    readonly snap: {
        readonly w: 34;
    };
    readonly base: {
        readonly w: 22;
    };
    readonly soft: {
        readonly w: 15;
    };
    readonly lazy: {
        readonly w: 9;
    };
};
export type Preset = keyof typeof S;
export declare const EXIT = 0.1;
export declare const LAG = 0.06;
export declare const BLUR = 4;
export declare const STAGGER_MAX = 0.3;
export declare const ARRIVE = 0.45;
export declare const now: () => number;
export declare const clamp: (v: number, a?: number, b?: number) => number;
/** Offset left after dt seconds for a critically damped spring released at offset x0 with velocity v0. */
export declare const resp: (dt: number, x0: number, v0: number, cfg: SpringConfig) => number;
/** Velocity of the same spring after dt seconds. */
export declare const vel: (dt: number, x0: number, v0: number, cfg: SpringConfig) => number;
/** 0 → 1 progress of a step that started at t0. */
export declare const prog: (t: number, t0: number, cfg?: SpringConfig) => number;
/** Seconds until a unit step is within `epsilon` of its target. */
export declare function settleTime(cfg: SpringConfig, epsilon?: number): number;
/** A value that retargets as a sum of springs: each new target adds one spring from its own start time. */
export declare class Track {
    target: number;
    cfg: SpringConfig;
    private ev;
    constructor(v: number, cfg?: SpringConfig);
    set(to: number, cfg?: SpringConfig, t?: number): this;
    /** Restarts from `from` with velocity v0 (units per second), e.g. after a drag ends. */
    release(from: number, v0: number, to: number, cfg?: SpringConfig, t?: number): this;
    jump(v: number): this;
    at(t?: number): number;
    velocity(t?: number): number;
    /** Drops springs whose remaining envelope is under 1e-3; returns how many still move. */
    prune(t?: number): number;
    get moving(): boolean;
}
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

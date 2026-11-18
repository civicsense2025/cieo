export interface SpringConfig {
    /** Natural frequency in rad/s. Settles (99.9%) in about 9.2 / w seconds at critical damping. */
    w: number;
    /** Optional damping ratio (0.7 <= z <= 1.0, default 1). Clamped to 1 when reduced motion is active. */
    z?: number;
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
/** Offset left after dt seconds for a spring released at offset x0 with velocity v0. */
export declare function resp(dt: number, x0: number, v0: number, cfg: SpringConfig): number;
/** Velocity of the same spring after dt seconds. */
export declare function vel(dt: number, x0: number, v0: number, cfg: SpringConfig): number;
/** 0 → 1 progress of a step that started at t0. */
export declare const prog: (t: number, t0: number, cfg?: SpringConfig) => number;
/** Seconds until a unit step stays within `epsilon` of its target. */
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
export { setMotionState, reducedQuery, state, REDUCED_SUBTREE, subtreeReduced, onscreen, allowed, config, sync, run, active, type MotionKind, type MotionState, type Job, } from './scheduler.js';

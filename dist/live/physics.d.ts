/** Asymptotic UIScrollView rubber-band curve: slope `resistance` at 0, strictly bounded by `dimension`. */
export declare function rubberBand(overshoot: number, dimension: number, resistance?: number): number;
/** Projects an inertial stopping value given initial velocity (units/sec) and per-millisecond deceleration rate. */
export declare function projectMomentum(value: number, velocity: number, decelerationRate?: number): number;
/** Snaps a dragged value and release velocity to the projected detent, handling both normalized [0..1] and pixel detents. */
export declare function projectToDetent(value: number, velocity: number, detents: readonly number[], velocityThreshold?: number): number;
/** Bounded sliding-window pointer velocity estimator (returns px/second; prunes samples older than 100 ms). */
export declare class PointerVelocityTracker {
    private samples;
    private readonly windowMs;
    private readonly maxSamples;
    constructor(windowMs?: number, maxSamples?: number);
    addSample(x: number, y: number, timeMs: number): void;
    velocity(): {
        x: number;
        y: number;
    };
    reset(): void;
}

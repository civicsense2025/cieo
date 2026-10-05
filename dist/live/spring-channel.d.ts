export interface SpringSample {
    readonly value: number;
    readonly velocity: number;
    readonly moving: boolean;
}
export interface LiveSpringOptions {
    readonly w?: number;
    readonly positionTolerance?: number;
    readonly velocityTolerance?: number;
}
export declare class SpringChannel {
    private origin;
    private speed;
    private epoch;
    private destination;
    private w;
    private readonly positionTolerance;
    private readonly velocityTolerance;
    constructor(value: number, atSeconds: number, options?: LiveSpringOptions);
    get target(): number;
    sample(atSeconds: number): SpringSample;
    retarget(to: number, atSeconds: number, w?: number): void;
    release(from: number, velocity: number, to: number, atSeconds: number, w?: number): void;
    jump(to: number, atSeconds: number): void;
}

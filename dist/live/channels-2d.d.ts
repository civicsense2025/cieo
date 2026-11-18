import { type LiveSpringOptions } from './spring-channel.js';
export interface Vector2DValue {
    readonly x: number;
    readonly y: number;
}
export interface Vector2DSample {
    readonly x: number;
    readonly y: number;
    readonly vx: number;
    readonly vy: number;
    readonly moving: boolean;
}
export declare class SpringVector2D {
    private readonly cx;
    private readonly cy;
    constructor(initial: Vector2DValue, atSeconds: number, options?: LiveSpringOptions);
    get target(): Vector2DValue;
    sample(atSeconds: number): Vector2DSample;
    retarget(to: Vector2DValue, atSeconds: number, w?: number, zeta?: number): void;
    release(from: Vector2DValue, velocity: Vector2DValue, to: Vector2DValue, atSeconds: number, w?: number, zeta?: number): void;
    jump(to: Vector2DValue, atSeconds: number): void;
}
export interface RectGeometry {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly radius?: number;
}
export interface RectSample {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly radius: number;
    readonly moving: boolean;
}
/** Five-channel SpringChannel bundle (x, y, width, height, radius) for interruptible Container Transform. */
export declare class SpringRect {
    private readonly cx;
    private readonly cy;
    private readonly cw;
    private readonly ch;
    private readonly cr;
    constructor(initial: RectGeometry, atSeconds: number, options?: LiveSpringOptions);
    get target(): Required<RectGeometry>;
    sample(atSeconds: number): RectSample;
    retarget(to: RectGeometry, atSeconds: number, w?: number, zeta?: number): void;
    release(from: RectGeometry, velocity: Partial<RectGeometry>, to: RectGeometry, atSeconds: number, w?: number, zeta?: number): void;
    jump(to: RectGeometry, atSeconds: number): void;
}

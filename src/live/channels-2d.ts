/* Paired 2D vector and 5-channel Container Transform geometry springs built on SpringChannel. */
import { SpringChannel, type LiveSpringOptions } from './spring-channel.js';

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

export class SpringVector2D {
  private readonly cx: SpringChannel;
  private readonly cy: SpringChannel;

  constructor(initial: Vector2DValue, atSeconds: number, options: LiveSpringOptions = {}) {
    this.cx = new SpringChannel(initial.x, atSeconds, options);
    this.cy = new SpringChannel(initial.y, atSeconds, options);
  }

  get target(): Vector2DValue {
    return { x: this.cx.target, y: this.cy.target };
  }

  sample(atSeconds: number): Vector2DSample {
    const sx = this.cx.sample(atSeconds);
    const sy = this.cy.sample(atSeconds);
    return {
      x: sx.value,
      y: sy.value,
      vx: sx.velocity,
      vy: sy.velocity,
      moving: sx.moving || sy.moving,
    };
  }

  retarget(to: Vector2DValue, atSeconds: number, w?: number, zeta?: number): void {
    this.cx.retarget(to.x, atSeconds, w, zeta);
    this.cy.retarget(to.y, atSeconds, w, zeta);
  }

  release(
    from: Vector2DValue,
    velocity: Vector2DValue,
    to: Vector2DValue,
    atSeconds: number,
    w?: number,
    zeta?: number,
  ): void {
    this.cx.release(from.x, velocity.x, to.x, atSeconds, w, zeta);
    this.cy.release(from.y, velocity.y, to.y, atSeconds, w, zeta);
  }

  jump(to: Vector2DValue, atSeconds: number): void {
    this.cx.jump(to.x, atSeconds);
    this.cy.jump(to.y, atSeconds);
  }
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
export class SpringRect {
  private readonly cx: SpringChannel;
  private readonly cy: SpringChannel;
  private readonly cw: SpringChannel;
  private readonly ch: SpringChannel;
  private readonly cr: SpringChannel;

  constructor(initial: RectGeometry, atSeconds: number, options: LiveSpringOptions = {}) {
    this.cx = new SpringChannel(initial.x, atSeconds, options);
    this.cy = new SpringChannel(initial.y, atSeconds, options);
    this.cw = new SpringChannel(initial.width, atSeconds, options);
    this.ch = new SpringChannel(initial.height, atSeconds, options);
    this.cr = new SpringChannel(initial.radius ?? 0, atSeconds, options);
  }

  get target(): Required<RectGeometry> {
    return {
      x: this.cx.target,
      y: this.cy.target,
      width: this.cw.target,
      height: this.ch.target,
      radius: this.cr.target,
    };
  }

  sample(atSeconds: number): RectSample {
    const sx = this.cx.sample(atSeconds);
    const sy = this.cy.sample(atSeconds);
    const sw = this.cw.sample(atSeconds);
    const sh = this.ch.sample(atSeconds);
    const sr = this.cr.sample(atSeconds);
    return {
      x: sx.value,
      y: sy.value,
      width: Math.max(0, sw.value),
      height: Math.max(0, sh.value),
      radius: Math.max(0, sr.value),
      moving: sx.moving || sy.moving || sw.moving || sh.moving || sr.moving,
    };
  }

  retarget(to: RectGeometry, atSeconds: number, w?: number, zeta?: number): void {
    this.cx.retarget(to.x, atSeconds, w, zeta);
    this.cy.retarget(to.y, atSeconds, w, zeta);
    this.cw.retarget(to.width, atSeconds, w, zeta);
    this.ch.retarget(to.height, atSeconds, w, zeta);
    if (to.radius !== undefined) this.cr.retarget(to.radius, atSeconds, w, zeta);
  }

  release(
    from: RectGeometry,
    velocity: Partial<RectGeometry>,
    to: RectGeometry,
    atSeconds: number,
    w?: number,
    zeta?: number,
  ): void {
    this.cx.release(from.x, velocity.x ?? 0, to.x, atSeconds, w, zeta);
    this.cy.release(from.y, velocity.y ?? 0, to.y, atSeconds, w, zeta);
    this.cw.release(from.width, velocity.width ?? 0, to.width, atSeconds, w, zeta);
    this.ch.release(from.height, velocity.height ?? 0, to.height, atSeconds, w, zeta);
    this.cr.release(from.radius ?? this.cr.target, velocity.radius ?? 0, to.radius ?? this.cr.target, atSeconds, w, zeta);
  }

  jump(to: RectGeometry, atSeconds: number): void {
    this.cx.jump(to.x, atSeconds);
    this.cy.jump(to.y, atSeconds);
    this.cw.jump(to.width, atSeconds);
    this.ch.jump(to.height, atSeconds);
    if (to.radius !== undefined) this.cr.jump(to.radius, atSeconds);
  }
}

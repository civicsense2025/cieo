export interface SpringSample {
  readonly value: number;
  readonly velocity: number;
  readonly moving: boolean;
}
export interface LiveSpringOptions {
  readonly w?: number;
  readonly zeta?: number;
  readonly positionTolerance?: number;
  readonly velocityTolerance?: number;
}
const bound = (value: number, name: string, min: number, max: number): number => {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(name);
  return value;
};

// A live control needs current position and velocity, not an ever-growing event history.
export class SpringChannel {
  private origin: number;
  private speed = 0;
  private epoch: number;
  private destination: number;
  private w: number;
  private zeta: number;
  private readonly positionTolerance: number;
  private readonly velocityTolerance: number;

  constructor(value: number, atSeconds: number, options: LiveSpringOptions = {}) {
    this.origin = this.destination = bound(value, 'value', -1e12, 1e12);
    this.epoch = bound(atSeconds, 'atSeconds', 0, Number.MAX_SAFE_INTEGER);
    this.w = bound(options.w ?? 22, 'w', 0.001, 10_000);
    this.zeta = bound(options.zeta ?? 1, 'zeta', 0.7, 1);
    this.positionTolerance = bound(options.positionTolerance ?? 0.001, 'positionTolerance', 1e-12, 1e6);
    this.velocityTolerance = bound(options.velocityTolerance ?? 0.001, 'velocityTolerance', 1e-12, 1e6);
  }

  get target(): number { return this.destination; }

  sample(atSeconds: number): SpringSample {
    bound(atSeconds, 'atSeconds', this.epoch, Number.MAX_SAFE_INTEGER);
    const dt = atSeconds - this.epoch;
    const offset = this.origin - this.destination;
    if (this.zeta >= 1) {
      const u = this.w * dt;
      if (u > 745) return { value: this.destination, velocity: 0, moving: false };
      const e = Math.exp(-u);
      const a = this.speed + this.w * offset;
      const remaining = e * (offset + a * dt);
      const velocity = e * (this.speed - this.w * a * dt);
      // A zero crossing is not rest; the envelope guards later rebound.
      const positionEnvelope = e * (1 + u) * (Math.abs(offset) + Math.abs(this.speed) / this.w);
      const velocityEnvelope = this.w * positionEnvelope + e * Math.abs(this.speed);
      const moving = positionEnvelope > this.positionTolerance || velocityEnvelope > this.velocityTolerance;
      return moving
        ? { value: this.destination + remaining, velocity, moving }
        : { value: this.destination, velocity: 0, moving: false };
    }
    const alpha = this.zeta * this.w;
    const u = alpha * dt;
    if (u > 745) return { value: this.destination, velocity: 0, moving: false };
    const wd = this.w * Math.sqrt(1 - this.zeta * this.zeta);
    const e = Math.exp(-u);
    const cos = Math.cos(wd * dt);
    const sin = Math.sin(wd * dt);
    const remaining = e * (offset * cos + ((this.speed + alpha * offset) / wd) * sin);
    const velocity = e * (this.speed * cos - ((alpha * this.speed + this.w * this.w * offset) / wd) * sin);
    const m = Math.min(dt, 1 / wd);
    const positionEnvelope = e * (Math.abs(offset) * (1 + alpha * m) + Math.abs(this.speed) * m);
    const velocityEnvelope = this.w * positionEnvelope + e * Math.abs(this.speed);
    const moving = positionEnvelope > this.positionTolerance || velocityEnvelope > this.velocityTolerance;
    return moving
      ? { value: this.destination + remaining, velocity, moving }
      : { value: this.destination, velocity: 0, moving: false };
  }

  retarget(to: number, atSeconds: number, w = this.w, zeta = this.zeta): void {
    bound(to, 'target', -1e12, 1e12);
    bound(w, 'w', 0.001, 10_000);
    bound(zeta, 'zeta', 0.7, 1);
    const current = this.sample(atSeconds);
    this.origin = current.value;
    this.speed = current.velocity;
    this.destination = to;
    this.epoch = atSeconds;
    this.w = w;
    this.zeta = zeta;
  }

  release(from: number, velocity: number, to: number, atSeconds: number, w = this.w, zeta = this.zeta): void {
    bound(from, 'from', -1e12, 1e12);
    bound(velocity, 'velocity', -1e12, 1e12);
    bound(to, 'target', -1e12, 1e12);
    bound(atSeconds, 'atSeconds', this.epoch, Number.MAX_SAFE_INTEGER);
    bound(w, 'w', 0.001, 10_000);
    bound(zeta, 'zeta', 0.7, 1);
    this.origin = from;
    this.speed = velocity;
    this.destination = to;
    this.epoch = atSeconds;
    this.w = w;
    this.zeta = zeta;
  }

  jump(to: number, atSeconds: number): void { this.release(to, 0, to, atSeconds); }
}

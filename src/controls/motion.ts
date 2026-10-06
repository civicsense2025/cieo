/* One spring-driven number painted onto the DOM by the caller (a width, a height, a custom property).
   Retargeting mid-flight is continuous; reduced motion, a hidden page or an offscreen element jumps. */
import { S, Track, allowed, config, now, run, type SpringConfig } from '../core/spring.js';

export class Driver {
  private tr: Track;
  private stop: (() => void) | null = null;

  constructor(
    initial: number,
    private paint: (v: number) => void,
    private settled?: (v: number) => void,
  ) {
    this.tr = new Track(initial);
  }

  get value(): number {
    return this.tr.at(now());
  }

  get target(): number {
    return this.tr.target;
  }

  to(v: number, opts: { cfg?: SpringConfig; jump?: boolean; el?: Element | null } = {}): void {
    if (opts.jump || !allowed('feedback', opts.el)) {
      this.stop?.();
      this.tr.jump(v);
      this.paint(v);
      this.settled?.(v);
      return;
    }
    if (v === this.tr.target && !this.stop) return;
    this.tr.set(v, config('feedback', opts.cfg ?? S.base));
    if (this.stop) return;
    this.stop = run({
      kind: 'feedback',
      step: (t) => {
        this.paint(this.tr.at(t));
        return this.tr.prune(t) > 0;
      },
      finish: () => {
        this.stop = null;
        this.tr.jump(this.tr.target);
        this.paint(this.tr.target);
        this.settled?.(this.tr.target);
      },
    });
  }

  cancel(): void {
    this.stop?.();
  }
}

export const px = (v: number): string => `${v.toFixed(2)}px`;

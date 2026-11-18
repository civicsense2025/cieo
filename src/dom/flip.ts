/* FLIP: measure children, apply the mutation, then spring each child from its old place to its new one.
   Newly shown children fade up in place from ARRIVE (never from 0). A child that would travel more than half
   its width or more than one 56 px row fades in place instead of sliding; so does one that would start outside
   opts.clip. Hidden or removed children simply go (call exit first to animate them). */
import { ARRIVE, S, Track, allowed, clamp, config, now, type MotionKind, type SpringConfig } from '../core/spring.js';
import { animate, gapFor, noop, owners, st, type Cancel } from './paint.js';

const ROW = 56;
export const longMove = (a: DOMRect, b: DOMRect): boolean => Math.abs(a.left - b.left) > 0.5 * b.width || Math.abs(a.top - b.top) > ROW;
const inside = (r: DOMRect, c: DOMRect) => r.top >= c.top - 0.5 && r.bottom <= c.bottom + 0.5 && r.left >= c.left - 0.5 && r.right <= c.right + 0.5;
const inView = (r: DOMRect) => r.width + r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;

export interface FlipOptions {
  kind?: MotionKind;
  cfg?: SpringConfig;
  stagger?: number;
  clip?: Element;
  arrive?: number;
  y?: number;
  /** Positions measured before a mutation that already happened (React renders); skips the internal measure. */
  before?: Map<Element, DOMRect>;
  done?: () => void;
}

export function flip(container: Element, mutate: () => void, opts: FlipOptions = {}): Cancel {
  const kind = opts.kind || 'feedback';
  if (!allowed(kind, container)) {
    mutate();
    opts.done?.();
    return noop;
  }
  const kids = [...container.children];
  kids.forEach((el) => owners.get(el)?.());
  const before = opts.before ?? new Map(kids.map((el) => [el, el.getBoundingClientRect()]));
  mutate();
  const afterKids = [...container.children];
  const after: DOMRect[] = afterKids.map((el) => el.getBoundingClientRect());
  const clip = opts.clip?.getBoundingClientRect();
  const arrive = opts.arrive ?? ARRIVE;
  const moves: Array<{ el: Element; dx: number; dy: number; o0: number; p?: Track }> = [];
  for (let i = 0; i < afterKids.length; i += 1) {
    const el = afterKids[i];
    const a = after[i];
    const b = before.get(el);
    const was = !!b && b.width + b.height > 0;
    if (!(a.width + a.height) || !(inView(a) || (was && inView(b!)))) continue;
    const start = was ? new DOMRect(b!.left, b!.top, a.width, a.height) : null;
    const dist = was ? Math.abs(b!.left - a.left) + Math.abs(b!.top - a.top) : 0;
    if (!was || longMove(b!, a) || (clip && start && !inside(start, clip))) {
      if (!was || dist >= 0.5) moves.push({ el, dx: 0, dy: opts.y ?? 4, o0: arrive });
    } else if (dist >= 0.5) moves.push({ el, dx: b!.left - a.left, dy: b!.top - a.top, o0: 1 });
  }
  if (!moves.length) {
    opts.done?.();
    return noop;
  }
  const cfg = config(kind, opts.cfg || S.base);
  const gap = gapFor(moves.length, opts.stagger);
  const t0 = now();
  moves.forEach((m, i) => {
    m.p = new Track(0).set(1, cfg, t0 + i * gap);
  });
  return animate(
    moves.map((m) => m.el),
    {
      kind,
      step(t) {
        let moving = false;
        for (const m of moves) {
          const p = clamp(m.p!.at(t));
          const q = 1 - p;
          st(m.el).transform = `translate(${(m.dx * q).toFixed(2)}px, ${(m.dy * q).toFixed(2)}px)`;
          if (m.o0 < 1) st(m.el).opacity = (m.o0 + (1 - m.o0) * p).toFixed(3);
          if (m.p!.prune(t) > 0) moving = true;
        }
        return moving;
      },
      finish: opts.done,
    },
  );
}

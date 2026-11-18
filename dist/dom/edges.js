/* Sliding indicator edges (1D horizontal, 1D vertical, or 2D): leading edge moves first, trailing edge LAG later. */
import { LAG, S, Track, allowed, config, now } from '../core/spring.js';
import { animate, noop, owners, st } from './paint.js';
const isElement = (x) => typeof Element !== 'undefined' ? x instanceof Element : typeof x?.getBoundingClientRect === 'function';
const span = (x) => (isElement(x) ? x.getBoundingClientRect() : x);
/** An indicator already laid out at its new place springs from an old span; the leading edge moves first, the trailing edge LAG later. */
export function edges(el, from, to, opts = {}) {
    const kind = opts.kind || 'feedback';
    if (!allowed(kind, el)) {
        owners.get(el)?.();
        opts.done?.();
        return noop;
    }
    const axis = opts.axis ?? 'x';
    const useX = axis === 'x' || axis === 'both';
    const useY = axis === 'y' || axis === 'both';
    const A = span(from);
    owners.get(el)?.();
    const B = span(to ?? el);
    const aL = A.left ?? 0, aR = A.right ?? aL, bL = B.left ?? 0, bR = B.right ?? bL;
    const aT = A.top ?? 0, aB = A.bottom ?? aT, bT = B.top ?? 0, bB = B.bottom ?? bT;
    const distX = useX ? Math.abs(aL - bL) + Math.abs(aR - bR) : 0;
    const distY = useY ? Math.abs(aT - bT) + Math.abs(aB - bB) : 0;
    if (distX + distY < 0.5) {
        opts.done?.();
        return noop;
    }
    const cfg = config(kind, opts.cfg || S.base);
    const t0 = now();
    const lag = opts.lag ?? LAG;
    const W = Math.max(1, bR - bL);
    const H = Math.max(1, bB - bT);
    const loX = new Track(aL), hiX = new Track(aR);
    const loY = new Track(aT), hiY = new Track(aB);
    if (useX) {
        const right = bL >= aL;
        (right ? hiX : loX).set(right ? bR : bL, cfg, t0);
        (right ? loX : hiX).set(right ? bL : bR, cfg, t0 + lag);
    }
    if (useY) {
        const down = bT >= aT;
        (down ? hiY : loY).set(down ? bB : bT, cfg, t0);
        (down ? loY : hiY).set(down ? bT : bB, cfg, t0 + lag);
    }
    return animate([el], {
        kind,
        step(t) {
            if (axis === 'x') {
                const l = loX.at(t), r = hiX.at(t);
                st(el).transformOrigin = '0 50%';
                st(el).transform = `translateX(${(l - bL).toFixed(2)}px) scaleX(${((r - l) / W).toFixed(4)})`;
                return loX.prune(t) + hiX.prune(t) > 0;
            }
            if (axis === 'y') {
                const top = loY.at(t), bot = hiY.at(t);
                st(el).transformOrigin = '50% 0';
                st(el).transform = `translateY(${(top - bT).toFixed(2)}px) scaleY(${((bot - top) / H).toFixed(4)})`;
                return loY.prune(t) + hiY.prune(t) > 0;
            }
            const l = loX.at(t), r = hiX.at(t);
            const top = loY.at(t), bot = hiY.at(t);
            st(el).transformOrigin = '0 0';
            st(el).transform = `translate(${(l - bL).toFixed(2)}px, ${(top - bT).toFixed(2)}px) scale(${((r - l) / W).toFixed(4)}, ${((bot - top) / H).toFixed(4)})`;
            return loX.prune(t) + hiX.prune(t) + loY.prune(t) + hiY.prune(t) > 0;
        },
        finish: opts.done,
    });
}

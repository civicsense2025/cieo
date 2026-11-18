'use client';
/* Gesture-coupled spring and directional shared-axis hooks. Writes directly to the DOM/onFrame per frame. */
import { useEffect, useRef } from 'react';
import { ARRIVE, S, Track, allowed, config, now, run } from '../core/spring.js';
import { enter } from '../dom/index.js';
import { PointerVelocityTracker, rubberBand } from '../live/physics.js';
import { useIso } from './hooks.js';
const cfgOf = (p) => (typeof p === 'string' ? S[p] : p);
function clampRubber(raw, bounds) {
    if (!bounds)
        return raw;
    const dim = bounds.dimension ?? 240;
    const res = bounds.resistance ?? 0.55;
    if (bounds.min !== undefined && raw < bounds.min)
        return bounds.min + rubberBand(raw - bounds.min, dim, res);
    if (bounds.max !== undefined && raw > bounds.max)
        return bounds.max + rubberBand(raw - bounds.max, dim, res);
    return raw;
}
/** Tracks pointer movement with rubber-band bounds and hands release velocity directly into Track.release. */
export function useGestureSpring(opts = {}) {
    const ref = useRef(null);
    const latest = useRef(opts);
    latest.current = opts;
    const track = useRef(null);
    if (!track.current)
        track.current = new Track(0, cfgOf(opts.preset ?? 'base'));
    const tracker = useRef(new PointerVelocityTracker());
    const cancel = useRef(null);
    const drag = useRef(null);
    const paint = (value, settled) => {
        const o = latest.current;
        if (o.onFrame)
            o.onFrame(value);
        else if (ref.current) {
            ref.current.style.transform = settled && value === 0 ? '' : o.axis === 'y' ? `translateY(${value.toFixed(2)}px)` : `translateX(${value.toFixed(2)}px)`;
        }
        if (settled)
            o.onSettle?.(value);
    };
    const release = (from, velocity, to) => {
        const o = latest.current;
        const kind = o.kind ?? 'feedback';
        const tr = track.current;
        cancel.current?.();
        cancel.current = null;
        if (o.disabled || !allowed(kind)) {
            tr.jump(to);
            paint(to, true);
            return;
        }
        tr.release(from, velocity, to, config(kind, cfgOf(o.preset ?? 'base')), now());
        cancel.current = run({
            kind,
            step: (t) => {
                paint(tr.at(t), false);
                return tr.prune(t) > 0;
            },
            finish: () => {
                cancel.current = null;
                tr.jump(tr.target);
                paint(tr.target, true);
            },
        });
    };
    const jump = (to) => {
        cancel.current?.();
        cancel.current = null;
        track.current.jump(to);
        paint(to, true);
    };
    useEffect(() => () => cancel.current?.(), []);
    const coordOf = (e) => ((latest.current.axis ?? 'x') === 'y' ? e.clientY : e.clientX);
    const timeOf = (e) => (typeof e.timeStamp === 'number' && Number.isFinite(e.timeStamp) ? e.timeStamp : now() * 1000);
    const onPointerDown = (e) => {
        if (latest.current.disabled || (e.button !== undefined && e.button !== 0))
            return;
        cancel.current?.();
        cancel.current = null;
        const startVal = track.current.at(now());
        drag.current = { id: e.pointerId, startCoord: coordOf(e), startVal, current: startVal };
        tracker.current.reset();
        tracker.current.addSample(e.clientX, e.clientY, timeOf(e));
        e.currentTarget?.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId)
            return;
        tracker.current.addSample(e.clientX, e.clientY, timeOf(e));
        const next = clampRubber(d.startVal + (coordOf(e) - d.startCoord), latest.current.bounds);
        d.current = next;
        track.current.jump(next);
        paint(next, false);
    };
    const finishPointer = (e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId)
            return;
        drag.current = null;
        tracker.current.addSample(e.clientX, e.clientY, timeOf(e));
        e.currentTarget?.releasePointerCapture?.(e.pointerId);
        const velVec = tracker.current.velocity();
        const v = (latest.current.axis ?? 'x') === 'y' ? velVec.y : velVec.x;
        const target = latest.current.resolveTarget ? latest.current.resolveTarget(d.current, v) : 0;
        latest.current.onRelease?.({ value: d.current, velocity: v, target });
        release(d.current, v, target);
    };
    return {
        ref,
        handlers: { onPointerDown, onPointerMove, onPointerUp: finishPointer, onPointerCancel: finishPointer },
        release,
        jump,
    };
}
/** Directional shared-axis arrival: slides and fades from `direction * distance` whenever `key` changes. */
export function useSharedAxis(key, direction, opts = {}) {
    const ref = useRef(null);
    const prevKey = useRef({ set: false, key });
    useIso(() => {
        if (!prevKey.current.set) {
            prevKey.current = { set: true, key };
            return;
        }
        if (Object.is(prevKey.current.key, key))
            return;
        prevKey.current.key = key;
        const el = ref.current;
        if (!el || opts.disabled || direction === 0)
            return;
        const dist = (opts.distance ?? 16) * direction;
        const axis = opts.axis ?? 'x';
        return enter(el, {
            cfg: cfgOf(opts.preset ?? 'base'),
            from: { x: axis === 'x' ? dist : 0, y: axis === 'y' ? dist : 0, opacity: ARRIVE, scale: 1, blur: 0 },
        });
    }, [key, direction, opts.axis, opts.distance, opts.disabled]);
    return { ref, direction };
}

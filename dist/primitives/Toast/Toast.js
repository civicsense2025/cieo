'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* Toast. Transient status notice with auto-dismiss and an optional action. Host owns open state; closing plays the
   exit spring before unmounting. Reduced motion shows and hides the end state. */
import { useEffect, useRef } from 'react';
import { useDismiss, usePresence } from '../../react/index.js';
import { motionAttrs } from '../motion.js';
/** Starts (or restarts) the deadline for a duration at now. Non-positive durations never fire. */
export function startToastDeadline(duration, now) {
    return duration > 0 ? { remaining: duration, firesAt: now + duration } : { remaining: 0, firesAt: null };
}
/** Freezes a running deadline at now; the returned remaining resumes it later. Idles pass through. */
export function pauseToastDeadline(state, now) {
    if (state.firesAt === null)
        return state;
    return { remaining: Math.max(0, state.firesAt - now), firesAt: null };
}
/** ms to arm when resuming a paused deadline; 0 means no timer. */
export function resumeToastDelay(state) {
    return state.firesAt === null ? state.remaining : 0;
}
export function Toast({ className, slotProps, message, tone = 'info', open = true, onDone, duration = 5000, dismissLabel = 'Dismiss', children, motion, entering = 'rise', exiting = 'rise' }) {
    const { mounted, ref } = usePresence(open, { disabled: motion === false });
    const done = useRef(onDone);
    done.current = onDone;
    useDismiss(open, () => done.current?.(), [ref], { outside: false });
    const timer = useRef(null);
    const deadline = useRef(startToastDeadline(duration, Date.now()));
    function clearTimer() {
        if (timer.current !== null) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    }
    function arm(ms) {
        clearTimer();
        if (ms <= 0 || !open) {
            deadline.current = { remaining: 0, firesAt: null };
            return;
        }
        deadline.current = startToastDeadline(ms, Date.now());
        timer.current = setTimeout(() => {
            timer.current = null;
            deadline.current = { remaining: 0, firesAt: null };
            done.current?.();
        }, ms);
    }
    useEffect(() => {
        arm(duration);
        return clearTimer;
    }, [open, duration, message]);
    /* WCAG 2.2 timing: hovering or focusing pauses the deadline; leaving or
       blurring outside resumes it with the time that was left. */
    function pause() {
        deadline.current = pauseToastDeadline(deadline.current, Date.now());
        clearTimer();
    }
    function resume() {
        if (timer.current === null)
            arm(resumeToastDelay(deadline.current));
    }
    void exiting;
    if (!mounted)
        return null;
    return (_jsxs("div", { ref: ref, role: tone === 'danger' || tone === 'warning' ? 'alert' : 'status', "data-tone": tone, className: "cieo cieo-toast", onPointerEnter: pause, onPointerLeave: resume, onFocus: pause, onBlur: (e) => {
            if (!e.currentTarget.contains(e.relatedTarget))
                resume();
        }, ...motionAttrs({ motion, entering, exiting }), ...customizePart(slotProps?.root, "cieo cieo-toast", undefined, className), children: [_jsx("p", { className: "cieo-toast-message", ...customizePart(slotProps?.message, "cieo-toast-message", undefined), children: message }), children ? _jsx("div", { className: "cieo-toast-action", ...customizePart(slotProps?.action, "cieo-toast-action", undefined), children: children }) : null, _jsx("button", { type: "button", "aria-label": dismissLabel, className: "cieo-toast-dismiss", onClick: () => done.current?.(), ...customizePart(slotProps?.dismiss, "cieo-toast-dismiss", undefined), children: "\u00D7" })] }));
}

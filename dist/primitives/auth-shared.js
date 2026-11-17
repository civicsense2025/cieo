'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from 'react';
import { customizePart } from './customization.js';
import { useReducedMotion, useSpring, useSwap, subtreeReduced } from '../react/index.js';
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function HeightSpring({ target, element }) {
    useSpring(target, (value) => {
        if (element.current)
            element.current.style.blockSize = `${Math.max(0, value)}px`;
    }, { preset: 'soft', kind: 'feedback' });
    return null;
}
function HeightJump({ target, element }) {
    useLayoutEffect(() => {
        if (element.current)
            element.current.style.blockSize = `${Math.max(0, target)}px`;
    }, [target, element]);
    return null;
}
export function useAuthMotionDisabled(element) {
    const [disabled, setDisabled] = useState(false);
    useLayoutEffect(() => {
        const sync = () => setDisabled(subtreeReduced(element.current));
        sync();
        if (typeof MutationObserver === 'undefined')
            return;
        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-motion', 'data-reduced-motion'] });
        return () => observer.disconnect();
    }, [element]);
    return disabled;
}
export function AuthMotionFrame({ value, children, focus = FOCUSABLE }) {
    const { shown, leaving, key, done } = useSwap(value, 520);
    const frame = useRef(null);
    const inner = useRef(null);
    const previous = useRef(value);
    const [height, setHeight] = useState(null);
    const localMotionDisabled = useAuthMotionDisabled(frame);
    const reducedMotion = useReducedMotion();
    const motionDisabled = localMotionDisabled || reducedMotion;
    useLayoutEffect(() => {
        const element = inner.current;
        if (!element)
            return;
        const measure = () => setHeight(element.offsetHeight);
        measure();
        if (typeof ResizeObserver === 'undefined')
            return;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    useLayoutEffect(() => {
        if (Object.is(previous.current, value))
            return;
        previous.current = value;
        const pane = inner.current?.querySelector('[data-auth-motion-phase="enter"]') ?? inner.current?.querySelector('[data-auth-motion-phase="rest"]');
        const target = focus === false ? null : pane?.querySelector(focus) ?? pane;
        target?.focus({ preventScroll: true });
    }, [value, focus]);
    useLayoutEffect(() => {
        if (motionDisabled && leaving !== null)
            done(key);
    }, [motionDisabled, leaving, key, done]);
    const phase = (candidate) => leaving === candidate ? 'leave' : leaving !== null && shown === candidate ? 'enter' : 'rest';
    const onEnd = (event) => {
        if (event.target === event.currentTarget)
            done(key);
    };
    return (_jsxs("div", { ref: frame, className: "cieo-auth-motion-frame", "data-auth-motion-frame": "", children: [height !== null ? motionDisabled ? _jsx(HeightJump, { target: height, element: frame }) : _jsx(HeightSpring, { target: height, element: frame }) : null, _jsxs("div", { ref: inner, className: "cieo-auth-motion-inner", children: [leaving !== null ? (_jsx("div", { className: "cieo-auth-motion-pane", "data-auth-motion-pane": "", "data-auth-motion-phase": phase(leaving), "aria-hidden": "true", inert: true, onAnimationEnd: onEnd, children: children(leaving, false) }, `out-${key}`)) : null, _jsx("div", { className: "cieo-auth-motion-pane", "data-auth-motion-pane": "", "data-auth-motion-phase": phase(shown), children: children(shown, true) }, `in-${key}`)] })] }));
}
export function AuthSwapText({ value }) {
    const { shown, leaving, key, done } = useSwap(value, 520);
    const root = useRef(null);
    const localMotionDisabled = useAuthMotionDisabled(root);
    const reducedMotion = useReducedMotion();
    const motionDisabled = localMotionDisabled || reducedMotion;
    useLayoutEffect(() => {
        if (motionDisabled && leaving !== null)
            done(key);
    }, [motionDisabled, leaving, key, done]);
    return (_jsxs("span", { ref: root, className: "cieo-swap cieo-auth-swap", children: [leaving !== null ? _jsx("span", { className: "cieo-swap-out cieo-auth-swap-out", "aria-hidden": "true", onAnimationEnd: (event) => { if (event.target === event.currentTarget)
                    done(key); }, children: leaving }, `out-${key}`) : null, _jsx("span", { className: "cieo-swap-in cieo-auth-swap-in", "data-swap": leaving !== null ? '' : undefined, children: shown }, `in-${key}`)] }));
}
export function AuthMotionMessage({ id, value, className, role }) {
    const text = value ?? '';
    const { shown, leaving, key, done } = useSwap(text, 520);
    const root = useRef(null);
    const localMotionDisabled = useAuthMotionDisabled(root);
    const reducedMotion = useReducedMotion();
    const motionDisabled = localMotionDisabled || reducedMotion;
    const open = Boolean(shown || leaving);
    useLayoutEffect(() => {
        if (motionDisabled && leaving !== null)
            done(key);
    }, [motionDisabled, leaving, key, done]);
    return (_jsx("span", { ref: root, id: id, className: `cieo-auth-motion-message ${className}`, "data-open": open ? '' : undefined, role: role, "aria-live": role === 'status' ? 'polite' : undefined, "aria-atomic": role ? 'true' : undefined, children: _jsxs("span", { className: "cieo-swap cieo-auth-swap cieo-auth-motion-message-inner", children: [leaving ? _jsx("span", { className: "cieo-swap-out cieo-auth-swap-out", "aria-hidden": "true", onAnimationEnd: (event) => { if (event.target === event.currentTarget)
                        done(key); }, children: leaving }, `out-${key}`) : null, _jsx("span", { className: "cieo-swap-in cieo-auth-swap-in", "data-swap": leaving !== null ? '' : undefined, children: shown }, `in-${key}`)] }) }));
}
export function AuthCardShell({ id, title, status, style, children, footer, className, slotProps, slots }) {
    return (_jsxs("section", { className: "cieo cieo-auth-card", "aria-labelledby": `${id}-title`, style: style, ...customizePart(slotProps?.root, 'cieo cieo-auth-card', style, className), children: [_jsx("h2", { className: "cieo-auth-card-title", id: `${id}-title`, ...customizePart(slotProps?.title, 'cieo-auth-card-title'), children: title }), slots?.beforeForm, children, slots?.afterForm, _jsx(AuthMotionMessage, { className: "cieo-auth-status", role: "status", value: status }), slots?.footer !== undefined ? (slots.footer === null ? null : _jsx("div", { className: "cieo-auth-routes", ...customizePart(slotProps?.footer, 'cieo-auth-routes'), children: slots.footer })) : (footer ? _jsx("p", { className: "cieo-auth-routes", ...customizePart(slotProps?.footer, 'cieo-auth-routes'), children: footer }) : null)] }));
}

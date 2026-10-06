'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* Button. Press feedback is a CSS transition on the snap spring, so it works before hydration. With `state`, the
   label blur-swaps to a spinner and then a check in place (surface and cart recipes) while the width springs to fit. */
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import { S } from '../core/spring.js';
import { buttonClassName } from './classes.js';
import { CheckIcon, SpinnerIcon } from './icons.js';
import { Driver, px } from './motion.js';
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export const Button = forwardRef(function Button(props, ref) {
    const { variant, size, block, icon, state, pendingLabel = 'Working', doneLabel, className, type, onClick, children, ...rest } = props;
    const iconOnly = children === undefined || children === null;
    const morph = state !== undefined;
    const busy = state === 'pending';
    const own = useRef(null);
    const setRef = (el) => {
        own.current = el;
        if (typeof ref === 'function')
            ref(el);
        else if (ref)
            ref.current = el;
    };
    const width = useRef(null);
    /* Width morph: inactive layers are out of flow, so the natural width is the active layer's. Spring from the width
       on screen to the new natural width, then hand the width back to layout. */
    useIso(() => {
        const el = own.current;
        if (!el || !morph || block)
            return;
        const d = width.current;
        /* While animating, value is the width on screen; once settled it is the last natural width. */
        const from = d?.value;
        el.style.width = '';
        const natural = el.getBoundingClientRect().width;
        if (!d || from === undefined) {
            width.current = new Driver(natural, (v) => (el.style.width = px(v)), () => (el.style.width = ''));
            return;
        }
        if (Math.abs(from - natural) < 0.5)
            return d.to(natural, { jump: true });
        el.style.width = px(from);
        d.to(natural, { cfg: S.base, el });
    }, [state]);
    useEffect(() => () => width.current?.cancel(), []);
    const click = (e) => {
        if (busy || rest['aria-disabled'] === true || rest['aria-disabled'] === 'true') {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };
    const label = (_jsxs(_Fragment, { children: [icon, iconOnly ? null : _jsx("span", { className: "cieo-btn-text", children: children })] }));
    return (_jsx("button", { ...rest, ref: setRef, type: type ?? 'button', className: buttonClassName({ variant, size, block, iconOnly, className }), "data-state": morph ? state : undefined, "aria-busy": busy || undefined, "aria-disabled": busy ? true : rest['aria-disabled'], onClick: click, children: morph ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "cieo-layer", "data-on": state === 'idle' || undefined, "aria-hidden": state !== 'idle' || undefined, children: label }), _jsx("span", { className: "cieo-layer", "data-on": state === 'pending' || undefined, "aria-hidden": "true", children: _jsx(SpinnerIcon, {}) }), _jsxs("span", { className: "cieo-layer cieo-btn-done", "data-on": state === 'done' || undefined, "aria-hidden": "true", children: [_jsx(CheckIcon, { draw: true }), doneLabel ? _jsx("span", { className: "cieo-btn-text", children: doneLabel }) : null] }), _jsx("span", { className: "cieo-vh", role: "status", children: state === 'pending' ? pendingLabel : state === 'done' ? (doneLabel ?? 'Done') : '' })] })) : (label) }));
});

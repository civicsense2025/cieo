'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* Button. Press feedback is a CSS transition on the snap spring, so it works before hydration. With `state`, the
   label blur-swaps to pending/done/failed/uncertain layers in place while the width springs to fit. */
import { Children, cloneElement, forwardRef, isValidElement, useEffect, useLayoutEffect, useRef, } from 'react';
import { S } from '../core/spring.js';
import { buttonClassName } from './classes.js';
import { AlertIcon, CheckIcon, SpinnerIcon } from './icons.js';
import { Driver, px } from './motion.js';
import { customizeControlPart } from './parts.js';
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export const Button = forwardRef(function Button(props, ref) {
    const { variant, size, tone, shape, block, asChild = false, icon, state, pendingLabel = 'Working', doneLabel, failedLabel, uncertainLabel = 'Sending could not be confirmed', slotProps, className, type, onClick, children, ...rest } = props;
    const iconOnly = !asChild && (children === undefined || children === null);
    const morph = state !== undefined;
    const busy = state === 'pending';
    const isDone = state === 'done' || state === 'succeeded';
    const isFailed = state === 'failed';
    const isUncertain = state === 'uncertain';
    const own = useRef(null);
    const setRef = (el) => {
        own.current = el;
        if (typeof ref === 'function')
            ref(el);
        else if (ref)
            ref.current = el;
    };
    const width = useRef(null);
    useIso(() => {
        const el = own.current;
        if (!el || !morph || block)
            return;
        const d = width.current;
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
    const rootClass = buttonClassName({ variant, size, tone, shape, block, iconOnly, className });
    const renderLabel = (content) => (_jsxs(_Fragment, { children: [icon, iconOnly ? null : _jsx("span", { className: "cieo-btn-text", ...customizeControlPart(slotProps?.text, 'cieo-btn-text'), children: content })] }));
    const renderBody = (content) => morph ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "cieo-layer", "data-on": state === 'idle' || undefined, "aria-hidden": state !== 'idle' || undefined, children: renderLabel(content) }), _jsx("span", { className: "cieo-layer", "data-on": busy || undefined, "aria-hidden": "true", ...customizeControlPart(slotProps?.pending, 'cieo-layer'), children: _jsx(SpinnerIcon, {}) }), _jsxs("span", { className: "cieo-layer cieo-btn-done", "data-on": isDone || undefined, "aria-hidden": "true", ...customizeControlPart(slotProps?.done, 'cieo-layer cieo-btn-done'), children: [_jsx(CheckIcon, { draw: true }), doneLabel ? _jsx("span", { className: "cieo-btn-text", ...customizeControlPart(slotProps?.text, 'cieo-btn-text'), children: doneLabel }) : null] }), _jsxs("span", { className: "cieo-layer cieo-btn-failed", "data-on": isFailed || undefined, "aria-hidden": "true", ...customizeControlPart(slotProps?.failed, 'cieo-layer cieo-btn-failed'), children: [_jsx(AlertIcon, {}), failedLabel ? _jsx("span", { className: "cieo-btn-text", ...customizeControlPart(slotProps?.text, 'cieo-btn-text'), children: failedLabel }) : null] }), _jsxs("span", { className: "cieo-layer cieo-btn-uncertain", "data-on": isUncertain || undefined, "aria-hidden": "true", ...customizeControlPart(slotProps?.uncertain, 'cieo-layer cieo-btn-uncertain'), children: [_jsx(AlertIcon, {}), _jsx("span", { className: "cieo-btn-text", ...customizeControlPart(slotProps?.text, 'cieo-btn-text'), children: uncertainLabel })] }), _jsx("span", { className: "cieo-vh", role: "status", children: busy ? pendingLabel : isDone ? (doneLabel ?? 'Done') : isFailed ? (failedLabel ?? 'Failed') : isUncertain ? uncertainLabel : '' })] })) : (renderLabel(content));
    const customizedRoot = customizeControlPart(slotProps?.root, rootClass, rest.style);
    if (asChild && Children.count(children) === 1 && isValidElement(children)) {
        const child = children;
        const childRef = child.props.ref ?? child.ref;
        const mergedClass = [customizedRoot.className ?? rootClass, child.props.className].filter(Boolean).join(' ');
        const mergedStyle = customizedRoot.style || child.props.style
            ? { ...customizedRoot.style, ...child.props.style }
            : undefined;
        const childClick = child.props.onClick;
        const isDisabled = Boolean(busy ||
            rest.disabled ||
            rest['aria-disabled'] === true ||
            rest['aria-disabled'] === 'true' ||
            child.props.disabled ||
            child.props['aria-disabled'] === true ||
            child.props['aria-disabled'] === 'true');
        return cloneElement(child, {
            ...rest,
            ...customizedRoot,
            ...child.props,
            className: mergedClass,
            style: mergedStyle,
            'data-state': morph ? state : undefined,
            'data-tone': tone,
            'aria-busy': busy || undefined,
            'aria-disabled': isDisabled || undefined,
            tabIndex: isDisabled ? -1 : (child.props.tabIndex ?? rest.tabIndex),
            onClick: (e) => {
                if (isDisabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                childClick?.(e);
                onClick?.(e);
            },
            ref: (el) => {
                setRef(el);
                if (typeof childRef === 'function')
                    childRef(el);
                else if (childRef && typeof childRef === 'object')
                    childRef.current = el;
            },
            children: morph || icon ? renderBody(child.props.children) : child.props.children,
        });
    }
    return (_jsx("button", { ...rest, ref: setRef, type: type ?? 'button', className: rootClass, "data-state": morph ? state : undefined, "data-tone": tone, "aria-busy": busy || undefined, "aria-disabled": busy ? true : rest['aria-disabled'], onClick: click, ...customizedRoot, children: renderBody(children) }));
});

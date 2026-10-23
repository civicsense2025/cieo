// src/primitives/ThumbsFeedback/ThumbsFeedback.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* ThumbsFeedback. "Was this helpful?" as a short ask, an optional detail step with reasons and a comment, then a thank-you. The host owns what happens to the result. */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { SwapText, roveFocus, useSpring, useSwap } from '../../react/index.js';
export const THUMBS_INITIAL = { step: 'ask', value: null };
/** Pure step machine. ask -> detail (or straight to done when that thumb has no reasons) -> done. Changing the thumb while in detail keeps the step. done is final. */
export function thumbsStep(state, event) {
    if (state.step === 'done')
        return state;
    if (event.type === 'rate') {
        if (state.step === 'detail')
            return { step: 'detail', value: event.value };
        return { step: event.hasReasons ? 'detail' : 'done', value: event.value };
    }
    if (state.step === 'detail')
        return { step: 'done', value: state.value };
    return state;
}
function Thumb({ dir }) {
    return (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 20 20", width: "20", height: "20", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", style: dir === 'down' ? { transform: 'scaleY(-1)' } : undefined, children: _jsx("path", { d: "M7 9v8H4V9h3zm0 0l3-6c1.4 0 2.2 1 2 2.3L11.6 8H16a1.5 1.5 0 0 1 1.5 1.8l-1 5.5A2 2 0 0 1 14.5 17H7" }) }));
}
function HeightDriver({ target, outer }) {
    useSpring(target, (v) => { if (outer.current)
        outer.current.style.height = `${v}px`; }, { preset: 'soft' });
    return null;
}
export function ThumbsFeedback({ question = 'Was this helpful?', onRate, reasons, onSubmit, thanks = 'Thanks for the feedback.' }) {
    const [state, setState] = useState(THUMBS_INITIAL);
    const [picked, setPicked] = useState([]);
    const [comment, setComment] = useState('');
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [height, setHeight] = useState(null);
    const thanksRef = useRef(null);
    const first = useRef(true);
    const commentId = useId();
    const swap = useSwap(state.step);
    const list = (v) => (v && reasons ? reasons[v] : undefined) ?? [];
    useLayoutEffect(() => {
        const el = innerRef.current;
        if (!el || typeof ResizeObserver === 'undefined')
            return;
        const measure = () => setHeight(el.offsetHeight);
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        if (state.step === 'detail')
            outerRef.current?.querySelector('[data-view="detail"] .cieo-thumbs-reason')?.focus();
        if (state.step === 'done')
            thanksRef.current?.focus();
    }, [state.step]);
    const rate = (value) => {
        if (state.step === 'done')
            return;
        const has = list(value).length > 0;
        if (state.value !== value)
            setPicked([]);
        setState((s) => thumbsStep(s, { type: 'rate', value, hasReasons: has }));
        onRate?.(value);
        if (state.step === 'ask' && !has)
            onSubmit({ value, reasons: [], comment: '' });
    };
    const finish = (send) => {
        if (state.step !== 'detail' || !state.value)
            return;
        setState((s) => thumbsStep(s, { type: send ? 'submit' : 'skip' }));
        onSubmit({ value: state.value, reasons: send ? picked : [], comment: send ? comment.trim() : '' });
    };
    const thumbs = (pressedValue, locked) => (_jsx("div", { className: "cieo-thumbs-buttons", role: "group", "aria-label": question, children: ['up', 'down'].map((v) => (_jsx("button", { type: "button", className: "cieo-thumbs-thumb", "aria-label": v === 'up' ? 'Yes, helpful' : 'No, not helpful', "aria-pressed": pressedValue === v, disabled: locked, onClick: () => rate(v), children: _jsx(Thumb, { dir: v }) }, v))) }));
    const view = (step, live) => {
        if (step === 'ask') {
            return (_jsxs("div", { className: "cieo-thumbs-view", "data-view": "ask", children: [_jsx("p", { className: "cieo-thumbs-question", children: question }), thumbs(null, !live)] }));
        }
        if (step === 'detail') {
            const chips = list(state.value);
            return (_jsxs("div", { className: "cieo-thumbs-view", "data-view": "detail", children: [_jsxs("div", { className: "cieo-thumbs-head", children: [_jsx("p", { className: "cieo-thumbs-question", children: question }), thumbs(state.value, !live)] }), _jsx("div", { className: "cieo-thumbs-reasons", role: "group", "aria-label": "Reasons", onKeyDown: (e) => { roveFocus(e, e.currentTarget, 'button', { orientation: 'horizontal' }); }, children: chips.map((r) => (_jsx("button", { type: "button", className: "cieo-thumbs-reason", "aria-pressed": picked.includes(r), disabled: !live, onClick: () => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r])), children: r }, r))) }), _jsx("label", { className: "cieo-thumbs-comment-label", htmlFor: `${commentId}-${live ? 'live' : 'old'}`, children: "Anything to add? (optional)" }), _jsx("textarea", { id: `${commentId}-${live ? 'live' : 'old'}`, className: "cieo-thumbs-comment", rows: 2, value: comment, disabled: !live, onChange: (e) => setComment(e.target.value) }), _jsxs("div", { className: "cieo-thumbs-actions", children: [_jsx("button", { type: "button", className: "cieo-thumbs-submit", disabled: !live, onClick: () => finish(true), children: "Submit" }), _jsx("button", { type: "button", className: "cieo-thumbs-skip", disabled: !live, onClick: () => finish(false), children: "Skip" })] })] }));
        }
        return (_jsx("div", { className: "cieo-thumbs-view", "data-view": "done", children: _jsx("p", { ref: live ? thanksRef : undefined, className: "cieo-thumbs-thanks", tabIndex: live ? -1 : undefined, role: live ? 'status' : undefined, children: _jsx(SwapText, { value: thanks }) }) }));
    };
    return (_jsx("div", { className: "cieo cieo-thumbs-feedback", "data-step": state.step, "data-value": state.value ?? undefined, children: _jsxs("div", { ref: outerRef, className: "cieo-thumbs-panel", children: [height !== null ? _jsx(HeightDriver, { target: height, outer: outerRef }) : null, _jsxs("div", { ref: innerRef, className: "cieo-thumbs-inner", children: [swap.leaving !== null ? (_jsx("div", { className: "cieo-thumbs-leaving", "aria-hidden": "true", inert: true, onAnimationEnd: (e) => { if (e.target === e.currentTarget)
                                swap.done(swap.key); }, children: view(swap.leaving, false) }, `o${swap.key}`)) : null, _jsx("div", { className: "cieo-thumbs-entering", "data-swap": swap.leaving !== null ? '' : undefined, children: view(swap.shown, true) }, `i${swap.key}`)] })] }) }));
}

// src/primitives/CommentComposer/CommentComposer.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* CommentComposer. Input row for a thread: autosizing text, tool and attachment slots, a recorder slot, reply context and a character ring. Host owns the value, the media and what submit does. */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { SwapText, useSwap } from '../../react/index.js';
import { CharacterCountRing } from '../CharacterCountRing/CharacterCountRing.js';
import { ReplyPreview } from '../ReplyPreview/ReplyPreview.js';
/** Length in characters as a person counts them (emoji count once). */
export function composerLength(value) {
    let n = 0;
    for (const _ of value)
        n += 1;
    return n;
}
/** Posting is allowed when not busy or disabled, within the limit, and there is text or an attachment. */
export function composerCanSubmit({ value, hasAttachments, maxLength, pending, disabled }) {
    if (pending || disabled)
        return false;
    if (typeof maxLength === 'number' && maxLength > 0 && composerLength(value) > maxLength)
        return false;
    return value.trim() !== '' || Boolean(hasAttachments);
}
/** The count ring appears once `threshold` (default 80%) of the limit is used. No limit, no ring. */
export function composerShowsCount(length, maxLength, threshold = 0.8) {
    return typeof maxLength === 'number' && maxLength > 0 && length >= maxLength * threshold;
}
/** Keyboard map for the text input: Cmd/Ctrl+Enter posts, Escape cancels a reply. Enter alone is a newline. Composition (IME) keystrokes never act. */
export function composerKeyAction(e, replying) {
    if (e.isComposing)
        return null;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
        return 'submit';
    if (e.key === 'Escape' && replying)
        return 'cancel-reply';
    return null;
}
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
export function CommentComposer({ className, slotProps, value, onValueChange, onSubmit, placeholder = 'Add to thread…', label = 'Add to thread', avatar, tools, attachments, hasAttachments, recorder, replyingTo, onCancelReply, maxLength, submitLabel = 'Post', pending, disabled }) {
    const input = useRef(null);
    const recorderPane = useRef(null);
    const lastRecorder = useRef(null);
    const had = useRef(Boolean(recorder));
    if (recorder)
        lastRecorder.current = recorder;
    const want = recorder ? 'recorder' : 'text';
    const { shown, leaving, key, done } = useSwap(want);
    const length = composerLength(value);
    const can = composerCanSubmit({ value, hasAttachments, maxLength, pending, disabled });
    const submit = () => {
        if (composerCanSubmit({ value, hasAttachments, maxLength, pending, disabled }))
            onSubmit(value.trim());
    };
    useIso(() => {
        const el = input.current;
        if (!el)
            return;
        el.style.blockSize = 'auto';
        el.style.blockSize = `${el.scrollHeight}px`;
    }, [value, shown]);
    useEffect(() => {
        const has = Boolean(recorder);
        if (has === had.current)
            return;
        had.current = has;
        if (has) {
            const pane = recorderPane.current;
            const target = pane?.querySelector(FOCUSABLE) ?? pane;
            target?.focus({ preventScroll: true });
        }
        else
            input.current?.focus({ preventScroll: true });
    }, [recorder]);
    const onKeyDown = (e) => {
        const action = composerKeyAction({ key: e.key, metaKey: e.metaKey, ctrlKey: e.ctrlKey, isComposing: e.nativeEvent.isComposing }, Boolean(replyingTo && onCancelReply));
        if (action === 'submit') {
            e.preventDefault();
            submit();
        }
        else if (action === 'cancel-reply') {
            e.preventDefault();
            onCancelReply?.();
        }
    };
    const onForm = (e) => {
        e.preventDefault();
        submit();
    };
    const onPaneEnd = (e) => {
        if (e.target === e.currentTarget)
            done(key);
    };
    const textVisible = shown === 'text' || leaving === 'text';
    const recorderVisible = (shown === 'recorder' && Boolean(recorder)) || leaving === 'recorder';
    const phase = (pane) => (leaving === pane ? 'leave' : shown === pane && leaving !== null ? 'enter' : 'rest');
    return (_jsxs("form", { "aria-label": label, onSubmit: onForm, className: "cieo cieo-comment-composer", "data-disabled": disabled ? '' : undefined, ...customizePart(slotProps?.root, "cieo cieo-comment-composer", undefined, className), children: [replyingTo ? (_jsx("div", { className: "cieo-comment-composer-reply", ...customizePart(slotProps?.reply, "cieo-comment-composer-reply"), children: _jsx(ReplyPreview, { variant: "composer", author: replyingTo.author, excerpt: replyingTo.excerpt, onDismiss: onCancelReply }) })) : null, _jsxs("div", { className: "cieo-comment-composer-row", ...customizePart(slotProps?.row, "cieo-comment-composer-row"), children: [avatar ? _jsx("div", { className: "cieo-comment-composer-avatar", ...customizePart(slotProps?.avatar, "cieo-comment-composer-avatar"), children: avatar }) : null, _jsxs("div", { className: "cieo-comment-composer-main", ...customizePart(slotProps?.main, "cieo-comment-composer-main"), children: [_jsxs("div", { className: "cieo-comment-composer-panes", ...customizePart(slotProps?.panes, "cieo-comment-composer-panes"), children: [textVisible ? (_jsx("div", { className: "cieo-comment-composer-pane", "data-pane": "text", "data-phase": phase('text'), inert: leaving === 'text' || undefined, onAnimationEnd: leaving === 'text' ? onPaneEnd : undefined, ...customizePart(slotProps?.pane, "cieo-comment-composer-pane"), children: _jsx("textarea", { ref: input, rows: 1, value: value, "aria-label": label, placeholder: placeholder, disabled: disabled, onChange: (e) => onValueChange(e.target.value), onKeyDown: onKeyDown, className: "cieo-comment-composer-input", ...customizePart(slotProps?.input, "cieo-comment-composer-input") }) })) : null, recorderVisible ? (_jsx("div", { ref: recorderPane, tabIndex: -1, className: "cieo-comment-composer-pane", "data-pane": "recorder", "data-phase": phase('recorder'), inert: leaving === 'recorder' || undefined, onAnimationEnd: leaving === 'recorder' ? onPaneEnd : undefined, ...customizePart(slotProps?.pane, "cieo-comment-composer-pane"), children: recorder ?? lastRecorder.current })) : null] }), attachments ? _jsx("div", { className: "cieo-comment-composer-attachments", ...customizePart(slotProps?.attachments, "cieo-comment-composer-attachments"), children: attachments }) : null, _jsxs("div", { className: "cieo-comment-composer-bar", ...customizePart(slotProps?.bar, "cieo-comment-composer-bar"), children: [tools ? (_jsx("div", { className: "cieo-comment-composer-tools", role: "group", "aria-label": "Add to your post", ...customizePart(slotProps?.tools, "cieo-comment-composer-tools"), children: tools })) : (_jsx("span", {})), composerShowsCount(length, maxLength) ? _jsx(CharacterCountRing, { length: length, max: maxLength }) : null, _jsx("button", { type: "submit", className: "cieo-comment-composer-submit", disabled: !can, "aria-busy": pending ? true : undefined, ...customizePart(slotProps?.submit, "cieo-comment-composer-submit"), children: _jsx(SwapText, { value: pending ? 'Posting…' : submitLabel }) })] })] })] })] }));
}

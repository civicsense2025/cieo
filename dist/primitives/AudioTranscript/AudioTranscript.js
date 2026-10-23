// src/primitives/AudioTranscript/AudioTranscript.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AudioTranscript. Word-by-word follow-along text for a clip: the spoken word is highlighted, and with onSeek a word can be clicked or chosen by keyboard to jump there. The host owns time. */
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../react/index.js';
/** Index of the word being spoken at time t: the last word that has started. Gaps keep the previous word until the next starts; -1 before the first word or with no words. Words must be sorted by start. */
export function activeWordIndex(words, t) {
    if (!Number.isFinite(t))
        return -1;
    let lo = 0;
    let hi = words.length - 1;
    let found = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (words[mid].start <= t) {
            found = mid;
            lo = mid + 1;
        }
        else
            hi = mid - 1;
    }
    return found;
}
/** Next focus-marker index for a key, clamped to the words; null for keys that do nothing. */
export function transcriptKeyStep(key, index, count) {
    if (count <= 0)
        return null;
    const last = count - 1;
    const at = Math.min(last, Math.max(0, index));
    if (key === 'ArrowRight' || key === 'ArrowDown')
        return Math.min(last, at + 1);
    if (key === 'ArrowLeft' || key === 'ArrowUp')
        return Math.max(0, at - 1);
    if (key === 'Home')
        return 0;
    if (key === 'End')
        return last;
    return null;
}
/** Quiet time after the reader last scrolled before following the audio again, in ms. */
export const TRANSCRIPT_QUIET_MS = 4000;
/** True when the reader has not scrolled by hand within the quiet period. */
export function shouldAutoScroll(now, lastUserScroll, quietMs = TRANSCRIPT_QUIET_MS) {
    return lastUserScroll === null || now - lastUserScroll >= quietMs;
}
/** New scrollTop that brings a word into view (centred), or null when it is already fully visible. */
export function transcriptScrollTop(wordTop, wordHeight, viewHeight, scrollTop) {
    if (wordTop >= scrollTop && wordTop + wordHeight <= scrollTop + viewHeight)
        return null;
    return Math.max(0, wordTop + wordHeight / 2 - viewHeight / 2);
}
export function AudioTranscript({ words, current, onSeek, label }) {
    const uid = useId();
    const box = useRef(null);
    const glow = useRef(null);
    const placed = useRef(false);
    const userScrolledAt = useRef(null);
    const reduced = useReducedMotion();
    const active = activeWordIndex(words, current);
    const [focus, setFocus] = useState(null);
    const wordId = (i) => `${uid}-w${i}`;
    const seekable = !!onSeek;
    // The highlight is one element that glides to the active word; written through the ref, no state.
    const place = () => {
        const el = box.current?.querySelector('[data-active]');
        const g = glow.current;
        if (!g)
            return;
        if (!el) {
            g.dataset.visible = 'false';
            return;
        }
        g.dataset.visible = 'true';
        g.style.setProperty('--x', `${el.offsetLeft}px`);
        g.style.setProperty('--y', `${el.offsetTop}px`);
        g.style.setProperty('--w', `${el.offsetWidth}px`);
        g.style.setProperty('--h', `${el.offsetHeight}px`);
        if (!placed.current) {
            placed.current = true;
            requestAnimationFrame(() => {
                if (glow.current)
                    glow.current.dataset.ready = '';
            });
        }
    };
    useLayoutEffect(place, [active, words]);
    useEffect(() => {
        const b = box.current;
        if (!b || typeof ResizeObserver === 'undefined')
            return;
        const ro = new ResizeObserver(place);
        ro.observe(b);
        return () => ro.disconnect();
    }, []);
    useEffect(() => {
        const b = box.current;
        const el = b?.querySelector('[data-active]');
        if (!b || !el || !shouldAutoScroll(performance.now(), userScrolledAt.current))
            return;
        const top = transcriptScrollTop(el.offsetTop, el.offsetHeight, b.clientHeight, b.scrollTop);
        if (top !== null)
            b.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    }, [active, reduced]);
    const markScrolled = () => {
        userScrolledAt.current = performance.now();
    };
    const choose = (i) => {
        setFocus(i);
        if (words[i])
            onSeek?.(words[i].start);
    };
    const onKeyDown = (e) => {
        if (!seekable || e.altKey || e.ctrlKey || e.metaKey)
            return;
        const at = focus ?? Math.max(0, active);
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            choose(at);
            return;
        }
        const next = transcriptKeyStep(e.key, at, words.length);
        if (next === null)
            return;
        e.preventDefault();
        setFocus(next);
        document.getElementById(wordId(next))?.scrollIntoView({ block: 'nearest' });
    };
    const focused = focus === null ? Math.max(0, active) : Math.min(focus, words.length - 1);
    return (_jsxs("div", { ref: box, className: "cieo cieo-audio-transcript", "aria-label": label, "data-seekable": seekable ? '' : undefined, ...(seekable ? { role: 'listbox', tabIndex: 0, 'aria-activedescendant': words.length ? wordId(focused) : undefined, onKeyDown, onFocus: () => setFocus((f) => f ?? Math.max(0, active)), onBlur: () => setFocus(null) } : { role: 'group' }), onWheel: markScrolled, onTouchMove: markScrolled, children: [_jsx("span", { ref: glow, className: "cieo-audio-transcript-highlight", "aria-hidden": "true", "data-visible": "false", style: { '--x': '0px', '--y': '0px', '--w': '0px', '--h': '0px' } }), words.map((w, i) => (_jsxs(Fragment, { children: [_jsx("span", { id: wordId(i), className: "cieo-audio-transcript-word", "data-active": i === active ? '' : undefined, "data-focused": seekable && focus !== null && i === focused ? '' : undefined, ...(seekable ? { role: 'option', 'aria-selected': i === active, onClick: () => choose(i) } : {}), children: w.text }), i < words.length - 1 ? ' ' : null] }, i)))] }));
}

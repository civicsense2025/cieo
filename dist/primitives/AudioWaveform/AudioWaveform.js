// src/primitives/AudioWaveform/AudioWaveform.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AudioWaveform. Bars drawn from a clip's peaks; the played part fills continuously and, when the host passes onSeek, the whole thing is a scrubber. The host owns time. */
import { useRef } from 'react';
import { speakAudioTime } from '../AudioTime/AudioTime.js';
/** Shortest a bar can be, as a fraction of full height, so silence still shows a tick. */
export const WAVEFORM_FLOOR = 0.08;
/** Seconds one arrow key moves the playhead. */
export const WAVEFORM_KEY_SECONDS = 5;
/** Maximum bars rendered or produced by public waveform helpers. */
export const MAX_WAVEFORM_BARS = 128;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const finite = (n) => (Number.isFinite(n) ? n : 0);
/** Reduces peaks to `count` bars: each bar is the loudest peak in its bucket, scaled so the loudest bar is 1, never below the floor. Empty or silent input gives all floor values. */
export function waveformBars(peaks, count) {
    const n = Math.min(MAX_WAVEFORM_BARS, Math.max(0, Math.floor(finite(count))));
    if (n === 0)
        return [];
    const total = peaks.length;
    if (total === 0)
        return Array.from({ length: n }, () => WAVEFORM_FLOOR);
    const raw = Array.from({ length: n }, (_, i) => {
        const start = Math.min(total - 1, Math.floor((i * total) / n));
        const end = Math.max(start + 1, Math.floor(((i + 1) * total) / n));
        let max = 0;
        for (let j = start; j < Math.min(total, end); j++)
            max = Math.max(max, Math.abs(finite(peaks[j])));
        return max;
    });
    const top = Math.max(...raw);
    if (top <= 0)
        return raw.map(() => WAVEFORM_FLOOR);
    return raw.map((v) => Math.max(WAVEFORM_FLOOR, v / top));
}
/** Seconds under a pointer at x within a track of the given width. Clamped to 0..duration; a zero-width track or unknown duration gives 0. */
export function seekFromPointer(x, width, duration) {
    if (!(width > 0) || !Number.isFinite(duration) || duration <= 0)
        return 0;
    return clamp(x / width, 0, 1) * duration;
}
/** New playhead for a key on the scrubber, clamped to 0..duration; null for keys that do nothing. Arrows move 5 s, Page keys 10 percent, Home and End jump to the ends. */
export function waveformKeyStep(key, current, duration) {
    const d = Number.isFinite(duration) ? Math.max(0, duration) : 0;
    const c = finite(current);
    const to = (t) => clamp(t, 0, d);
    if (key === 'ArrowLeft' || key === 'ArrowDown')
        return to(c - WAVEFORM_KEY_SECONDS);
    if (key === 'ArrowRight' || key === 'ArrowUp')
        return to(c + WAVEFORM_KEY_SECONDS);
    if (key === 'PageDown')
        return to(c - d * 0.1);
    if (key === 'PageUp')
        return to(c + d * 0.1);
    if (key === 'Home')
        return 0;
    if (key === 'End')
        return d;
    return null;
}
/** Spoken position for a scrubber: "12 seconds of 1 minute 3 seconds". */
export function audioSeekText(current, duration) {
    return `${speakAudioTime(current)} of ${speakAudioTime(duration)}`;
}
/** Pointer-scrub and keyboard handlers shared by the waveform and the player's plain track. No state: the host re-renders from onSeek. */
export function useScrub(duration, current, onSeek) {
    const dragging = useRef(false);
    const seekAt = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onSeek?.(seekFromPointer(e.clientX - r.left, r.width, duration));
    };
    return {
        onPointerDown(e) {
            if (!onSeek || e.button > 0)
                return;
            dragging.current = true;
            e.currentTarget.setPointerCapture?.(e.pointerId);
            seekAt(e);
        },
        onPointerMove(e) {
            if (dragging.current)
                seekAt(e);
        },
        onPointerUp(e) {
            dragging.current = false;
            e.currentTarget.releasePointerCapture?.(e.pointerId);
        },
        onPointerCancel() {
            dragging.current = false;
        },
        onKeyDown(e) {
            if (!onSeek || e.altKey || e.ctrlKey || e.metaKey)
                return;
            const next = waveformKeyStep(e.key, current, duration);
            if (next === null)
                return;
            e.preventDefault();
            onSeek(next);
        },
    };
}
/** Total entrance stagger across all bars, in ms. */
const STAGGER_MS = 240;
export function AudioWaveform({ peaks, duration, current, onSeek, label, bars = 48 }) {
    const requested = Number.isFinite(bars) ? Math.floor(bars) : bars === Number.POSITIVE_INFINITY ? MAX_WAVEFORM_BARS : 1;
    const count = Math.min(MAX_WAVEFORM_BARS, Math.max(1, requested));
    const heights = waveformBars(peaks, count);
    const d = Number.isFinite(duration) ? Math.max(0, duration) : 0;
    const c = clamp(finite(current), 0, d);
    const progress = d > 0 ? c / d : 0;
    const scrub = useScrub(d, c, onSeek);
    const style = { '--progress': progress, '--step': `${(STAGGER_MS / count).toFixed(2)}ms` };
    const draw = (hidden) => (_jsx("span", { className: hidden ? 'cieo-audio-waveform-bars cieo-audio-waveform-played' : 'cieo-audio-waveform-bars', "aria-hidden": "true", children: heights.map((h, i) => (_jsx("span", { className: "cieo-audio-waveform-bar", style: { '--h': h, '--i': i } }, i))) }));
    const common = { className: 'cieo cieo-audio-waveform', style, 'data-seekable': onSeek ? '' : undefined, 'aria-label': label };
    if (!onSeek) {
        return (_jsxs("div", { ...common, role: "img", children: [draw(false), draw(true)] }));
    }
    return (_jsxs("div", { ...common, role: "slider", tabIndex: 0, "aria-valuemin": 0, "aria-valuemax": d, "aria-valuenow": Math.floor(c), "aria-valuetext": audioSeekText(c, d), "aria-orientation": "horizontal", ...scrub, children: [draw(false), draw(true)] }));
}

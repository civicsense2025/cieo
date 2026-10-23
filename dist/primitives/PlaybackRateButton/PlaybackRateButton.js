// src/primitives/PlaybackRateButton/PlaybackRateButton.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* PlaybackRateButton. One button that cycles the playback speed (1x, 1.5x, 2x). The host owns the rate and applies it to the audio. */
import { SwapText } from '../../react/index.js';
/** Default speeds the button cycles through. */
export const DEFAULT_PLAYBACK_RATES = [1, 1.5, 2];
/** A playback rate the browser can apply; invalid values normalize to normal speed. */
export function normalizePlaybackRate(rate) {
    return Number.isFinite(rate) && rate > 0 ? rate : 1;
}
/** Valid unique rates in the host's order. An empty list means the control is disabled; an all-invalid non-empty list falls back to 1×. */
export function normalizePlaybackRates(rates) {
    if (Array.isArray(rates) && rates.length === 0)
        return [];
    const valid = Array.isArray(rates) ? [...new Set(rates.filter((rate) => Number.isFinite(rate) && rate > 0))] : [];
    return valid.length > 0 ? valid : [1];
}
/** The rate after `rate` in the cycle. A rate not in the list starts the cycle over at the first one; an empty list changes nothing. */
export function nextRate(rates, rate) {
    const valid = normalizePlaybackRates(rates);
    const current = normalizePlaybackRate(rate);
    if (valid.length === 0)
        return current;
    const i = valid.indexOf(current);
    return i < 0 ? valid[0] : valid[(i + 1) % valid.length];
}
/** Accessible name: "Playback speed, 1.5 times". */
export function playbackRateName(rate) {
    const safe = normalizePlaybackRate(rate);
    return `Playback speed, ${safe} ${safe === 1 ? 'time' : 'times'}`;
}
export function PlaybackRateButton({ rate, rates = DEFAULT_PLAYBACK_RATES, onRateChange }) {
    const safeRate = normalizePlaybackRate(rate);
    const safeRates = normalizePlaybackRates(rates);
    return (_jsx("button", { type: "button", className: "cieo cieo-playback-rate-button", "aria-label": playbackRateName(safeRate), disabled: safeRates.length === 0, onClick: safeRates.length === 0 ? undefined : () => onRateChange(nextRate(safeRates, safeRate)), children: _jsx(SwapText, { value: `${safeRate}×` }) }));
}

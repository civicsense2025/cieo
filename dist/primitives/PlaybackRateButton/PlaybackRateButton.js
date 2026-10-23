// src/primitives/PlaybackRateButton/PlaybackRateButton.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* PlaybackRateButton. One button that cycles the playback speed (1x, 1.5x, 2x). The host owns the rate and applies it to the audio. */
import { SwapText } from '../../react/index.js';
/** Default speeds the button cycles through. */
export const DEFAULT_PLAYBACK_RATES = [1, 1.5, 2];
/** The rate after `rate` in the cycle. A rate not in the list starts the cycle over at the first one; an empty list changes nothing. */
export function nextRate(rates, rate) {
    if (rates.length === 0)
        return rate;
    const i = rates.indexOf(rate);
    return i < 0 ? rates[0] : rates[(i + 1) % rates.length];
}
/** Accessible name: "Playback speed, 1.5 times". */
export function playbackRateName(rate) {
    return `Playback speed, ${rate} ${rate === 1 ? 'time' : 'times'}`;
}
export function PlaybackRateButton({ rate, rates = DEFAULT_PLAYBACK_RATES, onRateChange }) {
    return (_jsx("button", { type: "button", className: "cieo cieo-playback-rate-button", "aria-label": playbackRateName(rate), onClick: () => onRateChange(nextRate(rates, rate)), children: _jsx(SwapText, { value: `${rate}×` }) }));
}

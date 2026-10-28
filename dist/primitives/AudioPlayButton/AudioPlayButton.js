// src/primitives/AudioPlayButton/AudioPlayButton.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* AudioPlayButton. Round play/pause toggle whose icon morphs between the two shapes. The host owns the playing state; this owns the name, the busy ring and the morph. */
/** Accessible name for the button: "Play Voice note" or "Pause Voice note". Hosts in other languages
 *  pass their own verbs; the clip's name always follows them. */
export function audioPlayButtonName(playing, label, verbs = {}) {
    return `${playing ? (verbs.pause ?? 'Pause') : (verbs.play ?? 'Play')} ${label}`;
}
export function AudioPlayButton({ className, slotProps, playing, loading = false, label, onToggle, size = 'md', playLabel, pauseLabel }) {
    return (_jsxs("button", { type: "button", className: "cieo cieo-audio-play-button", "aria-label": audioPlayButtonName(playing, label, { play: playLabel, pause: pauseLabel }), "aria-busy": loading || undefined, "data-playing": playing ? '' : undefined, "data-loading": loading ? '' : undefined, "data-size": size, onClick: onToggle, ...customizePart(slotProps?.root, "cieo cieo-audio-play-button", undefined, className), children: [_jsxs("span", { className: "cieo-audio-play-button-icon", "aria-hidden": "true", ...customizePart(slotProps?.icon, "cieo-audio-play-button-icon", undefined), children: [_jsx("span", { className: "cieo-audio-play-button-half", "data-half": "left", ...customizePart(slotProps?.pauseHalf, "cieo-audio-play-button-half", undefined) }), _jsx("span", { className: "cieo-audio-play-button-half", "data-half": "right", ...customizePart(slotProps?.pauseHalf, "cieo-audio-play-button-half", undefined) })] }), _jsx("span", { className: "cieo-audio-play-button-ring", "aria-hidden": "true", ...customizePart(slotProps?.ring, "cieo-audio-play-button-ring", undefined) })] }));
}

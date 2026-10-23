// src/primitives/AudioPlayButton/AudioPlayButton.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AudioPlayButton. Round play/pause toggle whose icon morphs between the two shapes. The host owns the playing state; this owns the name, the busy ring and the morph. */
/** Accessible name for the button: "Play Voice note" or "Pause Voice note". */
export function audioPlayButtonName(playing, label) {
    return `${playing ? 'Pause' : 'Play'} ${label}`;
}
export function AudioPlayButton({ playing, loading = false, label, onToggle, size = 'md' }) {
    return (_jsxs("button", { type: "button", className: "cieo cieo-audio-play-button", "aria-label": audioPlayButtonName(playing, label), "aria-busy": loading || undefined, "data-playing": playing ? '' : undefined, "data-loading": loading ? '' : undefined, "data-size": size, onClick: onToggle, children: [_jsxs("span", { className: "cieo-audio-play-button-icon", "aria-hidden": "true", children: [_jsx("span", { className: "cieo-audio-play-button-half", "data-half": "left" }), _jsx("span", { className: "cieo-audio-play-button-half", "data-half": "right" })] }), _jsx("span", { className: "cieo-audio-play-button-ring", "aria-hidden": "true" })] }));
}

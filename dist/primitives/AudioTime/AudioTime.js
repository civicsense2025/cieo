// src/primitives/AudioTime/AudioTime.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AudioTime. Elapsed and total time for a clip (0:12 / 1:03), or the time left (-0:51). Tabular digits keep the width steady while it ticks. */
/** m:ss under an hour, h:mm:ss above. Negative and non-finite input reads as 0:00. */
export function formatAudioTime(seconds) {
    const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, '0');
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
/** Spoken form for assistive text: "1 minute 3 seconds". */
export function speakAudioTime(seconds) {
    const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    const part = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    const parts = [h ? part(h, 'hour') : '', m ? part(m, 'minute') : '', r || (!h && !m) ? part(r, 'second') : ''].filter(Boolean);
    return parts.join(' ');
}
export function AudioTime({ current, duration, mode = 'elapsed' }) {
    const known = duration !== undefined && Number.isFinite(duration);
    let text;
    let spoken;
    if (mode === 'total') {
        text = known ? formatAudioTime(duration) : '--:--';
        spoken = known ? speakAudioTime(duration) : 'length unknown';
    }
    else if (mode === 'remaining' && known) {
        const left = Math.max(0, duration - current);
        text = `-${formatAudioTime(left)}`;
        spoken = `${speakAudioTime(left)} left`;
    }
    else {
        text = known ? `${formatAudioTime(current)} / ${formatAudioTime(duration)}` : formatAudioTime(current);
        spoken = known ? `${speakAudioTime(current)} of ${speakAudioTime(duration)}` : speakAudioTime(current);
    }
    return (_jsxs("span", { className: "cieo cieo-audio-time", "data-mode": mode, children: [_jsx("span", { "aria-hidden": "true", children: text }), _jsx("span", { className: "cieo-sr-only", children: spoken })] }));
}

// src/primitives/VoiceRecorder/VoiceRecorder.tsx
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* VoiceRecorder. Records a voice clip from the microphone and hands it to the host as a blob with its length and waveform peaks. The host owns upload and storage. */
import { useEffect, useRef, useState } from 'react';
import { AudioLevelMeter, rmsLevel } from '../AudioLevelMeter/AudioLevelMeter.js';
import { AudioTime, speakAudioTime } from '../AudioTime/AudioTime.js';
import { IconButton } from '../IconButton/IconButton.js';
export const recorderIdle = { phase: 'idle', elapsed: 0, reason: null };
/** True while a microphone, or a request for one, is in use. */
export function isRecorderActive(phase) {
    return phase === 'requesting' || phase === 'recording' || phase === 'paused';
}
/** Pure recorder state machine. Cancel from any state goes back to idle, and only stop or limit reach done, so a cancelled take can never produce a clip. */
export function voiceRecorderStep(state, event) {
    const { phase } = state;
    const to = (next, extra = {}) => ({ phase: next, elapsed: state.elapsed, reason: null, ...extra });
    switch (event.type) {
        case 'start':
            return phase === 'idle' || phase === 'done' || phase === 'error' ? to('requesting', { elapsed: 0 }) : state;
        case 'granted':
            return phase === 'requesting' ? to('recording') : state;
        case 'denied':
            return phase === 'requesting' ? to('error', { reason: 'denied' }) : state;
        case 'unsupported':
            return phase === 'idle' || phase === 'requesting' ? to('error', { reason: 'unsupported', elapsed: 0 }) : state;
        case 'pause':
            return phase === 'recording' ? to('paused') : state;
        case 'resume':
            return phase === 'paused' ? to('recording') : state;
        case 'stop':
        case 'limit':
            return phase === 'recording' || phase === 'paused' ? to('done') : state;
        case 'tick': {
            if (phase !== 'recording')
                return state;
            const elapsed = Number.isFinite(event.elapsed) ? Math.max(0, Math.floor(event.elapsed)) : state.elapsed;
            return elapsed === state.elapsed ? state : { ...state, elapsed };
        }
        case 'fail':
            return isRecorderActive(phase) ? to('error', { reason: 'failed' }) : state;
        case 'cancel':
        case 'reset':
            return phase === 'idle' && state.elapsed === 0 ? state : recorderIdle;
    }
}
/** True when a step finished a take, which is the only moment a clip may be handed to the host. */
export function shouldEmitClip(prev, next) {
    return isRecorderActive(prev.phase) && next.phase === 'done';
}
const MIME_PREFERENCE = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];
/** First recording format the browser supports, in order of preference, or '' to let the browser choose. */
export function pickRecorderMimeType(isTypeSupported) {
    for (const type of MIME_PREFERENCE) {
        try {
            if (isTypeSupported(type))
                return type;
        }
        catch {
            /* treat a throwing probe as unsupported */
        }
    }
    return '';
}
/** Shrinks samples (0..1 loudness readings) to `count` bars, each the loudest reading in its slice. Empty input gives []. */
export function downsamplePeaks(samples, count = 64) {
    const n = samples.length;
    const bars = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
    if (!n || !bars)
        return [];
    return Array.from({ length: bars }, (_, i) => {
        const start = Math.floor((i * n) / bars);
        const end = Math.max(start + 1, Math.floor(((i + 1) * n) / bars));
        let peak = 0;
        for (let j = start; j < end && j < n; j += 1) {
            const v = samples[j];
            if (Number.isFinite(v))
                peak = Math.max(peak, Math.min(1, Math.abs(v)));
        }
        return peak;
    });
}
/** Pixels the pointer may slide left in hold mode before the take is thrown away. */
export const HOLD_CANCEL_DISTANCE = 80;
/** Hold-to-record gesture: sliding left past 80px means cancel, anything else keeps recording. */
export function holdGesture(dx) {
    return Number.isFinite(dx) && dx < -HOLD_CANCEL_DISTANCE ? 'cancel' : 'record';
}
/** Seconds left before the limit, never below 0. */
export function remainingSeconds(elapsed, maxDuration) {
    return Math.max(0, Math.ceil(maxDuration - elapsed));
}
/** True in the last 10 seconds of a take, when the clock switches to a countdown. Short limits (10s or less) never warn. */
export function isNearLimit(elapsed, maxDuration) {
    return maxDuration > 10 && remainingSeconds(elapsed, maxDuration) <= 10;
}
/** Sentence for the live region. Only discrete events are announced, never the running clock. */
export function recorderAnnouncement(kind, seconds = 0) {
    switch (kind) {
        case 'recording':
            return 'Recording';
        case 'paused':
            return 'Paused';
        case 'cancelled':
            return 'Recording cancelled';
        case 'denied':
            return 'Microphone access is blocked. Allow it in your browser settings.';
        case 'unsupported':
            return 'Voice recording is not supported in this browser.';
        case 'failed':
            return 'Recording failed. Try again.';
        case 'release-to-cancel':
            return 'Release to cancel';
        case 'limit':
            return `Time limit reached. Recording stopped, ${speakAudioTime(seconds)}`;
        case 'stopped':
            return `Recording stopped, ${speakAudioTime(seconds)}`;
    }
}
const takeMs = (t) => t.banked + (t.since ? performance.now() - t.since : 0);
function release(t) {
    clearInterval(t.timer);
    t.stream.getTracks().forEach((track) => track.stop());
    void t.ctx?.close().catch(() => { });
}
const Glyph = ({ d }) => (_jsx("svg", { viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: d }) }));
const MIC = 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3';
const TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3';
const PAUSE = 'M8 5v14M16 5v14';
const RESUME = 'M7 4l13 8-13 8z';
const STOP = 'M5 12l5 5L20 7';
export function VoiceRecorder({ onRecorded, onCancel, maxDuration = 120, autoStart = false, label = 'Record a voice reply', mode = 'tap' }) {
    const limit = Number.isFinite(maxDuration) ? Math.max(1, maxDuration) : 120;
    const [state, setState] = useState(recorderIdle);
    const [level, setLevel] = useState(0);
    const [message, setMessage] = useState('');
    const [hold, setHold] = useState('record');
    const stateRef = useRef(state);
    const take = useRef(null);
    const session = useRef(0);
    const holdFrom = useRef(null);
    const live = useRef({ onRecorded, onCancel, limit });
    live.current = { onRecorded, onCancel, limit };
    const send = (event) => {
        const next = voiceRecorderStep(stateRef.current, event);
        stateRef.current = next;
        setState(next);
        return next;
    };
    const fail = () => {
        session.current += 1;
        const t = take.current;
        take.current = null;
        if (t) {
            t.recorder.onstop = null;
            try {
                if (t.recorder.state !== 'inactive')
                    t.recorder.stop();
            }
            catch {
                /* recorder already dead */
            }
            release(t);
        }
        setLevel(0);
        send({ type: 'fail' });
        setMessage(recorderAnnouncement('failed'));
    };
    /** Throws the take away without ever emitting a clip. */
    const cancel = (notify = true) => {
        session.current += 1;
        const t = take.current;
        take.current = null;
        if (t) {
            t.recorder.ondataavailable = null;
            t.recorder.onstop = null;
            try {
                if (t.recorder.state !== 'inactive')
                    t.recorder.stop();
            }
            catch {
                /* recorder already dead */
            }
            release(t);
        }
        if (!isRecorderActive(stateRef.current.phase))
            return;
        setLevel(0);
        setHold('record');
        holdFrom.current = null;
        send({ type: 'cancel' });
        setMessage(recorderAnnouncement('cancelled'));
        if (notify)
            live.current.onCancel?.();
    };
    const finish = (kind) => {
        const t = take.current;
        if (!t || (stateRef.current.phase !== 'recording' && stateRef.current.phase !== 'paused'))
            return;
        take.current = null;
        clearInterval(t.timer);
        const duration = Math.min(live.current.limit, Math.round(takeMs(t) / 100) / 10);
        const mimeType = t.recorder.mimeType || t.mime || 'audio/webm';
        t.recorder.onstop = () => {
            release(t);
            live.current.onRecorded({ blob: new Blob(t.chunks, { type: mimeType }), mimeType, duration, peaks: downsamplePeaks(t.peaks) });
        };
        session.current += 1;
        setLevel(0);
        setHold('record');
        holdFrom.current = null;
        send({ type: kind });
        setMessage(recorderAnnouncement(kind === 'limit' ? 'limit' : 'stopped', duration));
        try {
            if (t.recorder.state !== 'inactive')
                t.recorder.stop();
            else
                t.recorder.onstop?.(new Event('stop'));
        }
        catch {
            release(t);
        }
    };
    const sample = (t) => {
        if (!t.since)
            return;
        const ms = takeMs(t);
        let l = 0;
        if (t.analyser) {
            t.analyser.getFloatTimeDomainData(t.buffer);
            l = rmsLevel(t.buffer);
            t.peaks.push(l);
        }
        const q = Math.round(l * 50) / 50;
        if (q !== t.lastLevel) {
            t.lastLevel = q;
            setLevel(q);
        }
        const whole = Math.floor(ms / 1000);
        if (whole !== t.lastSecond) {
            t.lastSecond = whole;
            send({ type: 'tick', elapsed: whole });
        }
        if (ms / 1000 >= live.current.limit)
            finish('limit');
    };
    const begin = () => {
        if (isRecorderActive(stateRef.current.phase))
            return;
        const mine = ++session.current;
        send({ type: 'start' });
        setMessage('');
        const media = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
        if (!media?.getUserMedia || typeof MediaRecorder === 'undefined') {
            send({ type: 'unsupported' });
            setMessage(recorderAnnouncement('unsupported'));
            return;
        }
        media.getUserMedia({ audio: true }).then((stream) => {
            if (mine !== session.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            let t;
            try {
                const mime = pickRecorderMimeType((type) => MediaRecorder.isTypeSupported?.(type) ?? false);
                const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
                const chunks = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size)
                        chunks.push(e.data);
                };
                let ctx = null;
                let analyser = null;
                try {
                    const Ctor = window.AudioContext ?? window.webkitAudioContext;
                    if (Ctor) {
                        ctx = new Ctor();
                        analyser = ctx.createAnalyser();
                        analyser.fftSize = 1024;
                        ctx.createMediaStreamSource(stream).connect(analyser);
                        void ctx.resume?.().catch(() => { });
                    }
                }
                catch {
                    /* the clip still records; it just has no waveform */
                }
                t = { stream, recorder, ctx, analyser, buffer: new Float32Array(analyser?.fftSize ?? 0), chunks, peaks: [], timer: 0, banked: 0, since: 0, mime, lastSecond: 0, lastLevel: 0 };
                recorder.start();
                t.since = performance.now();
                t.timer = setInterval(() => sample(t), 50);
            }
            catch {
                stream.getTracks().forEach((track) => track.stop());
                send({ type: 'fail' });
                setMessage(recorderAnnouncement('failed'));
                return;
            }
            take.current = t;
            stream.getAudioTracks()[0]?.addEventListener('ended', () => {
                if (take.current === t)
                    fail();
            });
            send({ type: 'granted' });
            setMessage(recorderAnnouncement('recording'));
        }, (err) => {
            if (mine !== session.current)
                return;
            const name = err?.name;
            if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
                send({ type: 'denied' });
                setMessage(recorderAnnouncement('denied'));
            }
            else if (name === 'NotFoundError' || name === 'TypeError') {
                send({ type: 'unsupported' });
                setMessage(recorderAnnouncement('unsupported'));
            }
            else {
                send({ type: 'fail' });
                setMessage(recorderAnnouncement('failed'));
            }
        });
    };
    const togglePause = () => {
        const t = take.current;
        if (!t)
            return;
        try {
            if (stateRef.current.phase === 'recording') {
                t.banked = takeMs(t);
                t.since = 0;
                t.recorder.pause();
                setLevel(0);
                send({ type: 'pause' });
                setMessage(recorderAnnouncement('paused'));
            }
            else if (stateRef.current.phase === 'paused') {
                t.recorder.resume();
                t.since = performance.now();
                send({ type: 'resume' });
                setMessage(recorderAnnouncement('recording'));
            }
        }
        catch {
            fail();
        }
    };
    const phase = state.phase;
    const active = isRecorderActive(phase);
    useEffect(() => {
        if (autoStart)
            begin();
        return () => {
            /* Unmount: stop the microphone and drop the take. No clip, no onCancel. */
            session.current += 1;
            const t = take.current;
            take.current = null;
            if (t) {
                t.recorder.ondataavailable = null;
                t.recorder.onstop = null;
                try {
                    if (t.recorder.state !== 'inactive')
                        t.recorder.stop();
                }
                catch {
                    /* recorder already dead */
                }
                release(t);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!active)
            return;
        const onKey = (e) => {
            if (e.key !== 'Escape')
                return;
            e.preventDefault();
            cancel();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
    const onMicClick = (e) => {
        if (mode === 'hold') {
            if (e.detail !== 0)
                return; /* pointer clicks are handled by the hold gesture; keyboard falls back to tap */
            if (phase === 'recording' || phase === 'paused')
                finish('stop');
            else if (!active)
                begin();
            return;
        }
        if (!active)
            begin();
    };
    const onHoldDown = (e) => {
        if (mode !== 'hold' || e.button !== 0 || active)
            return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        holdFrom.current = e.clientX;
        setHold('record');
        begin();
    };
    const onHoldMove = (e) => {
        if (holdFrom.current === null)
            return;
        const next = holdGesture(e.clientX - holdFrom.current);
        setHold((prev) => {
            if (prev !== next && next === 'cancel')
                setMessage(recorderAnnouncement('release-to-cancel'));
            return next;
        });
    };
    const onHoldUp = (e) => {
        if (holdFrom.current === null)
            return;
        const gesture = holdGesture(e.clientX - holdFrom.current);
        holdFrom.current = null;
        setHold('record');
        if (gesture === 'cancel' || stateRef.current.phase === 'requesting')
            cancel();
        else if (stateRef.current.phase === 'recording')
            finish('stop');
    };
    const near = isNearLimit(state.elapsed, limit);
    const showMic = mode === 'hold' || !active;
    const holding = mode === 'hold' && active && holdFrom.current !== null;
    const errorText = state.reason ? recorderAnnouncement(state.reason) : '';
    return (_jsxs("div", { role: "group", "aria-label": label, className: "cieo cieo-voice-recorder", "data-phase": phase, "data-mode": mode, "data-warning": near && phase !== 'paused' ? '' : undefined, "data-hold": holding ? hold : undefined, children: [showMic ? (_jsx("button", { type: "button", className: "cieo-voice-recorder-mic", "aria-label": mode === 'hold' && (phase === 'recording' || phase === 'paused') ? 'Stop recording' : label, "data-active": active ? '' : undefined, onClick: onMicClick, onPointerDown: onHoldDown, onPointerMove: onHoldMove, onPointerUp: onHoldUp, onPointerCancel: () => cancel(), children: _jsx(Glyph, { d: MIC }) })) : null, active ? (_jsxs("div", { className: "cieo-voice-recorder-live", children: [_jsx("span", { className: "cieo-voice-recorder-dot", "aria-hidden": "true", "data-paused": phase === 'paused' ? '' : undefined }), phase === 'requesting' ? (_jsx("span", { className: "cieo-voice-recorder-hint", children: "Waiting for the microphone" })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "cieo-voice-recorder-time", "data-warning": near ? '' : undefined, children: near ? _jsx(AudioTime, { current: state.elapsed, duration: limit, mode: "remaining" }) : _jsx(AudioTime, { current: state.elapsed }) }), _jsx(AudioLevelMeter, { level: phase === 'recording' ? level : 0 })] })), holding ? (_jsx("span", { className: "cieo-voice-recorder-hint", "aria-hidden": "true", children: hold === 'cancel' ? 'Release to cancel' : 'Slide left to cancel' })) : null, _jsxs("span", { className: "cieo-voice-recorder-actions", children: [_jsx(IconButton, { label: "Cancel recording", size: "sm", onClick: () => cancel(), children: _jsx(Glyph, { d: TRASH }) }), mode === 'tap' && phase !== 'requesting' ? (_jsx(IconButton, { label: phase === 'paused' ? 'Resume recording' : 'Pause recording', size: "sm", onClick: togglePause, children: _jsx(Glyph, { d: phase === 'paused' ? RESUME : PAUSE }) })) : null, phase !== 'requesting' && mode === 'tap' ? (_jsx(IconButton, { label: "Stop recording", size: "sm", className: "cieo-voice-recorder-stop", onClick: () => finish('stop'), children: _jsx(Glyph, { d: STOP }) })) : null] })] })) : null, phase === 'error' ? (_jsxs("span", { className: "cieo-voice-recorder-error", children: [_jsx("span", { children: errorText }), state.reason !== 'unsupported' ? (_jsx("button", { type: "button", className: "cieo-voice-recorder-retry", onClick: () => begin(), children: "Try again" })) : null] })) : null, _jsx("span", { role: "status", "aria-live": "polite", "aria-atomic": "true", className: "cieo-sr-only", children: message })] }));
}

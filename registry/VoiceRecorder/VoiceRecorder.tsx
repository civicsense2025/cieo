// src/primitives/VoiceRecorder/VoiceRecorder.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* VoiceRecorder. Records a voice clip from the microphone and hands it to the host as a blob with its length and waveform peaks. The host owns upload and storage. */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { usePresence } from '../../react/index.js';
import { rmsLevel } from '../AudioLevelMeter/AudioLevelMeter.js';
import { MAX_WAVEFORM_BARS } from '../AudioWaveform/AudioWaveform.js';
import { AudioTime, speakAudioTime } from '../AudioTime/AudioTime.js';
import { IconButton } from '../IconButton/IconButton.js';
import { RECORDER_LIVE_BAR_COUNT, createRecorderLiveHistory, pushRecorderLiveLevel, recorderLiveBarPresentation } from './recorderVisual.js';

export type RecorderPhase = 'idle' | 'requesting' | 'recording' | 'paused' | 'done' | 'error';
export type RecorderErrorReason = 'denied' | 'unsupported' | 'failed';

export interface RecorderState {
  phase: RecorderPhase;
  /** Whole seconds recorded so far. */
  elapsed: number;
  /** Set only in the error phase. */
  reason: RecorderErrorReason | null;
}

export type RecorderEvent =
  | { type: 'start' }
  | { type: 'granted' }
  | { type: 'denied' }
  | { type: 'unsupported' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'cancel' }
  | { type: 'tick'; elapsed: number }
  | { type: 'limit' }
  | { type: 'fail' }
  | { type: 'reset' };

export const recorderIdle: RecorderState = { phase: 'idle', elapsed: 0, reason: null };

/** True while a microphone, or a request for one, is in use. */
export function isRecorderActive(phase: RecorderPhase): boolean {
  return phase === 'requesting' || phase === 'recording' || phase === 'paused';
}

/** Pure recorder state machine. Cancel from any state goes back to idle, and only stop or limit reach done, so a cancelled take can never produce a clip. */
export function voiceRecorderStep(state: RecorderState, event: RecorderEvent): RecorderState {
  const { phase } = state;
  const to = (next: RecorderPhase, extra: Partial<RecorderState> = {}): RecorderState => ({ phase: next, elapsed: state.elapsed, reason: null, ...extra });
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
      if (phase !== 'recording') return state;
      const elapsed = Number.isFinite(event.elapsed) ? Math.max(0, Math.floor(event.elapsed)) : state.elapsed;
      return elapsed === state.elapsed ? state : { ...state, elapsed };
    }
    case 'fail':
      return isRecorderActive(phase) || phase === 'done' ? to('error', { reason: 'failed' }) : state;
    case 'cancel':
    case 'reset':
      return phase === 'idle' && state.elapsed === 0 ? state : recorderIdle;
  }
}

/** True when a step finished a take, which is the only moment a clip may be handed to the host. */
export function shouldEmitClip(prev: RecorderState, next: RecorderState): boolean {
  return isRecorderActive(prev.phase) && next.phase === 'done';
}

const MIME_PREFERENCE = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];
const useRecorderEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function useRecorderMotionDisabled(root: RefObject<HTMLElement | null>): boolean {
  const [disabled, setDisabled] = useState(false);
  useRecorderEffect(() => {
    const sync = () => setDisabled(Boolean(root.current?.closest('[data-motion="off"], [data-motion="reduced"], [data-reduced-motion="true"]')));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-motion', 'data-reduced-motion'] });
    return () => observer.disconnect();
  }, [root]);
  return disabled;
}

/** First recording format the browser supports, in order of preference, or '' to let the browser choose. */
export function pickRecorderMimeType(isTypeSupported: (type: string) => boolean): string {
  for (const type of MIME_PREFERENCE) {
    try {
      if (isTypeSupported(type)) return type;
    } catch {
      /* treat a throwing probe as unsupported */
    }
  }
  return '';
}

/** Shrinks samples (0..1 loudness readings) to `count` bars, each the loudest reading in its slice. Empty input gives []. */
export function downsamplePeaks(samples: number[], count = 64): number[] {
  const n = samples.length;
  const bars = Number.isFinite(count) ? Math.min(MAX_WAVEFORM_BARS, Math.max(0, Math.floor(count))) : 0;
  if (!n || !bars) return [];
  return Array.from({ length: bars }, (_, i) => {
    const start = Math.floor((i * n) / bars);
    const end = Math.max(start + 1, Math.floor(((i + 1) * n) / bars));
    let peak = 0;
    for (let j = start; j < end && j < n; j += 1) {
      const v = samples[j];
      if (Number.isFinite(v)) peak = Math.max(peak, Math.min(1, Math.abs(v)));
    }
    return peak;
  });
}

/** Pixels the pointer may slide left in hold mode before the take is thrown away. */
export const HOLD_CANCEL_DISTANCE = 80;

/** Hold-to-record gesture: sliding left past 80px means cancel, anything else keeps recording. */
export function holdGesture(dx: number): 'record' | 'cancel' {
  return Number.isFinite(dx) && dx < -HOLD_CANCEL_DISTANCE ? 'cancel' : 'record';
}

/** Milliseconds a take may still run before it hits the limit, never below 0. Used to arm the limit timer at start and resume. */
export function limitRemainingMs(bankedMs: number, limitSeconds: number): number {
  const banked = Number.isFinite(bankedMs) ? Math.max(0, bankedMs) : 0;
  return Math.max(0, Math.round(limitSeconds * 1000 - banked));
}

/** Real recorded length in seconds to one decimal, from milliseconds. Never clamped to the limit. */
export function clipDuration(ms: number): number {
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 100) / 10) : 0;
}

/** State a recorder returns to when its effect is cleaned up (unmount or a StrictMode remount), so the next mount can start a fresh take. */
export function recorderAfterCleanup(state: RecorderState): RecorderState {
  return voiceRecorderStep(state, { type: 'cancel' });
}

/** Seconds left before the limit, never below 0. */
export function remainingSeconds(elapsed: number, maxDuration: number): number {
  return Math.max(0, Math.ceil(maxDuration - elapsed));
}

/** True in the last 10 seconds of a take, when the clock switches to a countdown. Short limits (10s or less) never warn. */
export function isNearLimit(elapsed: number, maxDuration: number): boolean {
  return maxDuration > 10 && remainingSeconds(elapsed, maxDuration) <= 10;
}

export type RecorderAnnouncement = 'recording' | 'paused' | 'cancelled' | 'denied' | 'unsupported' | 'failed' | 'release-to-cancel' | 'stopped' | 'limit';

/** Sentence for the live region. Only discrete events are announced, never the running clock. */
export function recorderAnnouncement(kind: RecorderAnnouncement, seconds = 0): string {
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

export interface VoiceClip {
  /** The recorded audio. */
  blob: Blob;
  /** Format of the blob, for example audio/webm;codecs=opus. */
  mimeType: string;
  /** Length in seconds, paused time excluded. */
  duration: number;
  /** 64 loudness readings from 0 to 1, ready for a waveform. */
  peaks: number[];
}

export interface VoiceRecorderProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; mic?: PrimitivePartProps; live?: PrimitivePartProps; hint?: PrimitivePartProps; time?: PrimitivePartProps; waveform?: PrimitivePartProps; actions?: PrimitivePartProps; error?: PrimitivePartProps; retry?: PrimitivePartProps };

  /** Called once with the finished clip when the person stops, or the time limit is reached. Never called after a cancel. */
  onRecorded: (clip: VoiceClip) => void;
  /** Called when the person cancels an active take (button, Escape, or sliding away in hold mode). */
  onCancel?: () => void;
  /** Longest take in seconds. Recording stops by itself at the limit. Defaults to 120. */
  maxDuration?: number;
  /** Ask for the microphone as soon as the component mounts. Browsers may still require a tap first. */
  autoStart?: boolean;
  /** Accessible name of the recorder and its start button. Defaults to "Record a voice reply". */
  label?: string;
  /** tap: press to start, press to stop. hold: record while the button is held, slide left to cancel. Defaults to tap. */
  mode?: 'tap' | 'hold';
}

interface Take {
  attempt: number;
  stream: MediaStream;
  recorder: MediaRecorder;
  ctx: AudioContext | null;
  analyser: AnalyserNode | null;
  buffer: Float32Array;
  chunks: Blob[];
  peaks: number[];
  timer: ReturnType<typeof setInterval> | null;
  /** Fires at the limit even when the interval is throttled (background tabs). */
  limitTimer: ReturnType<typeof setTimeout> | null;
  /** Milliseconds recorded before the current stretch. */
  banked: number;
  /** performance.now() when the current stretch began; 0 while paused. */
  since: number;
  mime: string;
  lastSecond: number;
  released: boolean;
  failed: boolean;
  discarded: boolean;
  finalized: boolean;
  trackListeners: Array<{ track: MediaStreamTrack; listener: () => void }>;
}

const takeMs = (t: Take): number => t.banked + (t.since ? performance.now() - t.since : 0);

function stopTracks(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      /* continue releasing the rest of the stream */
    }
  });
}

function closeContext(ctx: AudioContext | null): void {
  if (!ctx) return;
  try {
    void ctx.close().catch(() => {});
  } catch {
    /* context already closed */
  }
}

function release(t: Take): void {
  if (t.released) return;
  t.released = true;
  if (t.timer !== null) clearInterval(t.timer);
  t.timer = null;
  if (t.limitTimer !== null) clearTimeout(t.limitTimer);
  t.limitTimer = null;
  t.trackListeners.forEach(({ track, listener }) => {
    try {
      track.removeEventListener('ended', listener);
    } catch {
      /* listener already detached */
    }
  });
  t.trackListeners = [];
  stopTracks(t.stream);
  closeContext(t.ctx);
  t.ctx = null;
}

function detachRecorder(t: Take): void {
  t.recorder.ondataavailable = null;
  t.recorder.onstop = null;
  t.recorder.onerror = null;
}

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);
const MIC = 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3';
const TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3';
const PAUSE = 'M8 5v14M16 5v14';
const RESUME = 'M7 4l13 8-13 8z';
const STOP = 'M5 12l5 5L20 7';

export function VoiceRecorder({ className, slotProps, onRecorded, onCancel, maxDuration = 120, autoStart = false, label = 'Record a voice reply', mode = 'tap' }: VoiceRecorderProps) {
  const limit = Number.isFinite(maxDuration) ? Math.max(1, maxDuration) : 120;
  const [state, setState] = useState<RecorderState>(recorderIdle);
  const [message, setMessage] = useState('');
  const [hold, setHold] = useState<'record' | 'cancel'>('record');
  const root = useRef<HTMLDivElement>(null);
  const micButton = useRef<HTMLButtonElement>(null);
  const liveWaveform = useRef<HTMLSpanElement>(null);
  const liveHistory = useRef(createRecorderLiveHistory());
  const restoreMicFocusOnExit = useRef(false);
  const stateRef = useRef(state);
  const take = useRef<Take | null>(null);
  const ownedTakes = useRef(new Set<Take>());
  const currentAttempt = useRef<number | null>(null);
  const mounted = useRef(false);
  const session = useRef(0);
  const holdFrom = useRef<number | null>(null);
  const live = useRef({ onRecorded, onCancel, limit });
  live.current = { onRecorded, onCancel, limit };

  const focusIsInLivePanel = (): boolean => {
    if (typeof document === 'undefined') return false;
    const panel = root.current?.querySelector('.cieo-voice-recorder-live');
    return Boolean(panel?.contains(document.activeElement));
  };

  const paintLiveWaveform = () => {
    const el = liveWaveform.current;
    if (!el) return;
    const history = liveHistory.current;
    for (let i = 0; i < el.children.length; i += 1) {
      const bar = el.children[i] as HTMLElement;
      const presentation = recorderLiveBarPresentation(history[i] ?? 0);
      bar.style.transform = `scaleY(${presentation.scale.toFixed(3)})`;
      bar.style.opacity = presentation.opacity.toFixed(3);
    }
  };

  const resetLiveWaveform = () => {
    liveHistory.current = createRecorderLiveHistory();
    paintLiveWaveform();
  };

  const send = (event: RecorderEvent): RecorderState => {
    const next = voiceRecorderStep(stateRef.current, event);
    stateRef.current = next;
    setState(next);
    return next;
  };

  const fail = (candidate?: Take) => {
    const t = candidate ?? take.current;
    const isCurrent = t ? currentAttempt.current === t.attempt : currentAttempt.current !== null;
    if (t) {
      if (t.failed || t.discarded || t.finalized) return;
      t.failed = true;
      t.discarded = true;
      if (take.current === t) take.current = null;
      ownedTakes.current.delete(t);
      detachRecorder(t);
      try {
        if (t.recorder.state !== 'inactive') t.recorder.stop();
      } catch {
        /* recorder already dead */
      }
      release(t);
    }
    if (!isCurrent) return;
    currentAttempt.current = null;
    if (isRecorderActive(stateRef.current.phase) || stateRef.current.phase === 'done') send({ type: 'fail' });
    setMessage(recorderAnnouncement('failed'));
  };

  /** Cancels only the active request or recording; earlier pending stop events remain independently owned. */
  const cancel = (options: { notify?: boolean; restoreFocus?: boolean } = {}) => {
    session.current += 1;
    currentAttempt.current = null;
    const t = take.current;
    take.current = null;
    if (t) {
      t.discarded = true;
      ownedTakes.current.delete(t);
      detachRecorder(t);
      try {
        if (t.recorder.state !== 'inactive') t.recorder.stop();
      } catch {
        /* recorder already dead */
      }
      release(t);
    }
    if (!isRecorderActive(stateRef.current.phase)) return;
    if (options.restoreFocus && focusIsInLivePanel()) restoreMicFocusOnExit.current = true;
    setHold('record');
    holdFrom.current = null;
    send({ type: 'cancel' });
    setMessage(recorderAnnouncement('cancelled'));
    if (options.notify !== false) live.current.onCancel?.();
  };

  const finish = (kind: 'stop' | 'limit', restoreFocus = false) => {
    const t = take.current;
    if (!t || t.failed || t.discarded || (stateRef.current.phase !== 'recording' && stateRef.current.phase !== 'paused')) return;
    if (restoreFocus && focusIsInLivePanel()) restoreMicFocusOnExit.current = true;
    take.current = null;
    if (t.timer !== null) clearInterval(t.timer);
    t.timer = null;
    if (t.limitTimer !== null) clearTimeout(t.limitTimer);
    t.limitTimer = null;
    const duration = clipDuration(takeMs(t));
    const mimeType = t.recorder.mimeType || t.mime || 'audio/webm';
    t.recorder.onerror = () => fail(t);
    t.recorder.onstop = () => {
      if (t.finalized) return;
      t.finalized = true;
      const shouldDeliver = mounted.current && ownedTakes.current.has(t) && !t.failed && !t.discarded;
      ownedTakes.current.delete(t);
      if (currentAttempt.current === t.attempt) currentAttempt.current = null;
      detachRecorder(t);
      release(t);
      if (shouldDeliver) live.current.onRecorded({ blob: new Blob(t.chunks, { type: mimeType }), mimeType, duration, peaks: downsamplePeaks(t.peaks) });
    };
    setHold('record');
    holdFrom.current = null;
    send({ type: kind });
    setMessage(recorderAnnouncement(kind === 'limit' ? 'limit' : 'stopped', duration));
    try {
      if (t.recorder.state !== 'inactive') t.recorder.stop();
      else t.recorder.onstop?.(new Event('stop'));
    } catch {
      fail(t);
      return;
    }
    // Keep the recorder listeners until dataavailable then stop, but release the microphone and analyser now.
    release(t);
  };

  const sample = (t: Take) => {
    if (!t.since || t.released || t.failed || t.discarded) return;
    const ms = takeMs(t);
    let l = 0;
    if (t.analyser) {
      t.analyser.getFloatTimeDomainData(t.buffer as Float32Array<ArrayBuffer>);
      l = rmsLevel(t.buffer);
      t.peaks.push(l);
    }
    const q = Math.round(l * 50) / 50;
    pushRecorderLiveLevel(liveHistory.current, q);
    paintLiveWaveform();
    const whole = Math.floor(ms / 1000);
    if (whole !== t.lastSecond) {
      t.lastSecond = whole;
      send({ type: 'tick', elapsed: whole });
    }
    if (ms / 1000 >= live.current.limit) finish('limit');
  };

  const begin = () => {
    if (isRecorderActive(stateRef.current.phase)) return;
    resetLiveWaveform();
    const mine = ++session.current;
    currentAttempt.current = mine;
    send({ type: 'start' });
    setMessage('');
    const media = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
    if (!media?.getUserMedia || typeof MediaRecorder === 'undefined') {
      currentAttempt.current = null;
      send({ type: 'unsupported' });
      setMessage(recorderAnnouncement('unsupported'));
      return;
    }
    let request: Promise<MediaStream>;
    try {
      request = media.getUserMedia({ audio: true });
    } catch {
      fail();
      return;
    }
    Promise.resolve(request).then(
      (stream) => {
        if (mine !== currentAttempt.current || !mounted.current) {
          stopTracks(stream);
          return;
        }
        let t: Take | null = null;
        try {
          const mime = pickRecorderMimeType((type) => MediaRecorder.isTypeSupported?.(type) ?? false);
          const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
          t = {
            attempt: mine,
            stream,
            recorder,
            ctx: null,
            analyser: null,
            buffer: new Float32Array(0),
            chunks: [],
            peaks: [],
            timer: null,
            limitTimer: null,
            banked: 0,
            since: 0,
            mime,
            lastSecond: 0,
            released: false,
            failed: false,
            discarded: false,
            finalized: false,
            trackListeners: [],
          };
          recorder.ondataavailable = (e) => {
            if (!t!.failed && !t!.discarded && !t!.finalized && e.data.size) t!.chunks.push(e.data);
          };
          recorder.onerror = () => fail(t!);
          try {
            const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (Ctor) {
              const ctx = new Ctor();
              t.ctx = ctx;
              try {
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 1024;
                ctx.createMediaStreamSource(stream).connect(analyser);
                void ctx.resume?.().catch(() => {});
                t.analyser = analyser;
                t.buffer = new Float32Array(analyser.fftSize);
              } catch {
                closeContext(ctx);
                t.ctx = null;
                t.analyser = null;
                t.buffer = new Float32Array(0);
              }
            }
          } catch {
            /* the clip still records when a level analyser is unavailable */
          }
          take.current = t;
          ownedTakes.current.add(t);
          recorder.start();
          if (t.failed || t.discarded || t.released) return;
          t.since = performance.now();
          t.timer = setInterval(() => sample(t!), 50);
          t.limitTimer = setTimeout(() => {
            if (take.current === t) finish('limit');
          }, limitRemainingMs(0, live.current.limit));
          stream.getAudioTracks().forEach((track) => {
            const listener = () => {
              if (ownedTakes.current.has(t!) && !t!.released) fail(t!);
            };
            track.addEventListener('ended', listener);
            t!.trackListeners.push({ track, listener });
            if (track.readyState === 'ended') listener();
          });
          if (t.failed || t.discarded || t.released) return;
          send({ type: 'granted' });
          setMessage(recorderAnnouncement('recording'));
        } catch {
          if (t) fail(t);
          else {
            stopTracks(stream);
            fail();
          }
        }
      },
      (err: unknown) => {
        if (mine !== currentAttempt.current) return;
        const name = (err as { name?: string } | null)?.name;
        if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
          currentAttempt.current = null;
          send({ type: 'denied' });
          setMessage(recorderAnnouncement('denied'));
        } else if (name === 'NotFoundError' || name === 'TypeError') {
          currentAttempt.current = null;
          send({ type: 'unsupported' });
          setMessage(recorderAnnouncement('unsupported'));
        } else {
          fail();
        }
      },
    );
  };

  const togglePause = () => {
    const t = take.current;
    if (!t) return;
    try {
      if (stateRef.current.phase === 'recording') {
        t.banked = takeMs(t);
        t.since = 0;
        if (t.limitTimer !== null) clearTimeout(t.limitTimer);
        t.limitTimer = null;
        t.recorder.pause();
        send({ type: 'pause' });
        setMessage(recorderAnnouncement('paused'));
      } else if (stateRef.current.phase === 'paused') {
        t.recorder.resume();
        t.since = performance.now();
        const resumed = t;
        resumed.limitTimer = setTimeout(() => {
          if (take.current === resumed) finish('limit');
        }, limitRemainingMs(resumed.banked, live.current.limit));
        send({ type: 'resume' });
        setMessage(recorderAnnouncement('recording'));
      }
    } catch {
      fail();
    }
  };

  const phase = state.phase;
  const active = isRecorderActive(phase);
  const motionDisabled = useRecorderMotionDisabled(root);
  const livePresence = usePresence<HTMLDivElement>(active, {
    disabled: motionDisabled,
    kind: 'feedback',
    from: { x: -4, y: 0, scale: 0.985, opacity: 0.45 },
  });
  const lastLive = useRef({ phase: 'requesting' as RecorderPhase, elapsed: 0, near: false, holding: false, hold: 'record' as 'record' | 'cancel' });

  useRecorderEffect(() => {
    if (active || !restoreMicFocusOnExit.current) return;
    restoreMicFocusOnExit.current = false;
    micButton.current?.focus({ preventScroll: true });
  }, [active]);

  useRecorderEffect(() => {
    mounted.current = true;
    if (autoStart) begin();
    return () => {
      /* Unmount: stop the microphone and drop the take. No clip, no onCancel. */
      mounted.current = false;
      session.current += 1;
      currentAttempt.current = null;
      const owned = [...ownedTakes.current];
      ownedTakes.current.clear();
      take.current = null;
      holdFrom.current = null;
      stateRef.current = recorderIdle;
      setState(stateRef.current);
      owned.forEach((t) => {
        t.discarded = true;
        detachRecorder(t);
        try {
          if (t.recorder.state !== 'inactive') t.recorder.stop();
        } catch {
          /* recorder already dead */
        }
        release(t);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      cancel({ restoreFocus: true });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMicClick = (e: { detail: number }) => {
    if (mode === 'hold') {
      if (e.detail !== 0) return; /* pointer clicks are handled by the hold gesture; keyboard falls back to tap */
      if (phase === 'recording' || phase === 'paused') finish('stop');
      else if (!active) begin();
      return;
    }
    if (!active) begin();
  };
  const onHoldDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (mode !== 'hold' || e.button !== 0 || active) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    holdFrom.current = e.clientX;
    setHold('record');
    begin();
  };
  const onHoldMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (holdFrom.current === null) return;
    const next = holdGesture(e.clientX - holdFrom.current);
    setHold((prev) => {
      if (prev !== next && next === 'cancel') setMessage(recorderAnnouncement('release-to-cancel'));
      return next;
    });
  };
  const onHoldUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (holdFrom.current === null) return;
    const gesture = holdGesture(e.clientX - holdFrom.current);
    holdFrom.current = null;
    setHold('record');
    if (gesture === 'cancel' || stateRef.current.phase === 'requesting') cancel();
    else if (stateRef.current.phase === 'recording') finish('stop');
  };

  const near = isNearLimit(state.elapsed, limit);
  if (active) lastLive.current = { phase, elapsed: state.elapsed, near, holding: mode === 'hold' && holdFrom.current !== null, hold };
  const shownLive = lastLive.current;
  const shownPhase = shownLive.phase;
  const shownNear = shownLive.near;
  const shownHolding = shownLive.holding;
  const showMic = mode === 'hold' || !active;
  const holding = mode === 'hold' && active && holdFrom.current !== null;
  const errorText = state.reason ? recorderAnnouncement(state.reason) : '';

  return (
    <div ref={root} role="group" aria-label={label} className="cieo cieo-voice-recorder" data-phase={phase} data-mode={mode} data-warning={near && phase !== 'paused' ? '' : undefined} data-hold={holding ? hold : undefined} {...customizePart(slotProps?.root, "cieo cieo-voice-recorder", undefined, className)}>
      {showMic ? (
        <button
          ref={micButton}
          type="button"
          className="cieo-voice-recorder-mic"
          aria-label={mode === 'hold' && (phase === 'recording' || phase === 'paused') ? 'Stop recording' : label}
          data-active={active ? '' : undefined}
          onClick={onMicClick}
          onPointerDown={onHoldDown}
          onPointerMove={onHoldMove}
          onPointerUp={onHoldUp}
          onPointerCancel={() => cancel()} {...customizePart(slotProps?.mic, "cieo-voice-recorder-mic")}
        >
          <Glyph d={MIC} />
        </button>
      ) : null}
      {livePresence.mounted ? (
        <div ref={livePresence.ref} className="cieo-voice-recorder-live" data-presence={active ? 'present' : 'exit'} aria-hidden={!active ? true : undefined} inert={!active || undefined} {...customizePart(slotProps?.live, "cieo-voice-recorder-live")}>
          <span className="cieo-voice-recorder-dot" aria-hidden="true" data-paused={shownPhase === 'paused' ? '' : undefined} />
          {shownPhase === 'requesting' ? (
            <span className="cieo-voice-recorder-hint" {...customizePart(slotProps?.hint, "cieo-voice-recorder-hint")}>Waiting for the microphone</span>
          ) : (
            <>
              <span className="cieo-voice-recorder-time" data-warning={shownNear ? '' : undefined} {...customizePart(slotProps?.time, "cieo-voice-recorder-time")}>
                {shownNear ? <AudioTime current={shownLive.elapsed} duration={limit} mode="remaining" /> : <AudioTime current={shownLive.elapsed} />}
              </span>
              <span ref={liveWaveform} role="img" aria-label="Microphone level" className="cieo-voice-recorder-waveform" data-paused={shownPhase === 'paused' ? '' : undefined} {...customizePart(slotProps?.waveform, "cieo-voice-recorder-waveform")}>
                {Array.from({ length: RECORDER_LIVE_BAR_COUNT }, (_, i) => {
                  const presentation = recorderLiveBarPresentation(liveHistory.current[i] ?? 0);
                  return <span key={i} aria-hidden="true" className="cieo-voice-recorder-waveform-bar" style={{ '--cieo-recorder-bar-index': i, transform: `scaleY(${presentation.scale.toFixed(3)})`, opacity: presentation.opacity.toFixed(3) } as CSSProperties} />;
                })}
              </span>
            </>
          )}
          {shownHolding ? (
            <span className="cieo-voice-recorder-hint" aria-hidden="true" {...customizePart(slotProps?.hint, "cieo-voice-recorder-hint")}>
              {shownLive.hold === 'cancel' ? 'Release to cancel' : 'Slide left to cancel'}
            </span>
          ) : null}
          <span className="cieo-voice-recorder-actions" {...customizePart(slotProps?.actions, "cieo-voice-recorder-actions")}>
            <IconButton label="Cancel recording" size="sm" onClick={() => cancel({ restoreFocus: true })}>
              <Glyph d={TRASH} />
            </IconButton>
            {mode === 'tap' && shownPhase !== 'requesting' ? (
              <IconButton label={shownPhase === 'paused' ? 'Resume recording' : 'Pause recording'} size="sm" onClick={togglePause}>
                <Glyph d={shownPhase === 'paused' ? RESUME : PAUSE} />
              </IconButton>
            ) : null}
            {shownPhase !== 'requesting' && mode === 'tap' ? (
              <IconButton label="Stop recording" size="sm" className="cieo-voice-recorder-stop" onClick={() => finish('stop', true)}>
                <Glyph d={STOP} />
              </IconButton>
            ) : null}
          </span>
        </div>
      ) : null}
      {phase === 'error' ? (
        <span className="cieo-voice-recorder-error" {...customizePart(slotProps?.error, "cieo-voice-recorder-error")}>
          <span>{errorText}</span>
          {state.reason !== 'unsupported' ? (
            <button type="button" className="cieo-voice-recorder-retry" onClick={() => begin()} {...customizePart(slotProps?.retry, "cieo-voice-recorder-retry")}>
              Try again
            </button>
          ) : null}
        </span>
      ) : null}
      <span role="status" aria-live="polite" aria-atomic="true" className="cieo-sr-only">
        {message}
      </span>
    </div>
  );
}

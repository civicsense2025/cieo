// src/primitives/VoiceRecorder/VoiceRecorder.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* VoiceRecorder. Records a voice clip from the microphone and hands it to the host as a blob with its length and waveform peaks. The host owns upload and storage. */
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { subtreeReduced, usePresence } from '../../react/index.js';
import { rmsLevel } from '../AudioLevelMeter/AudioLevelMeter.js';
import { createRecorderLiveHistory, pushRecorderLiveLevel, recorderLiveBarPresentation } from './recorderVisual.js';
import {
  HOLD_CANCEL_DISTANCE, clipDuration, downsamplePeaks, holdGesture, isNearLimit, isRecorderActive,
  limitRemainingMs, pickRecorderMimeType, recorderAfterCleanup, recorderAnnouncement, recorderIdle,
  remainingSeconds, shouldEmitClip, voiceRecorderStep,
  type RecorderAnnouncement, type RecorderErrorReason, type RecorderEvent, type RecorderPhase, type RecorderState, type VoiceClip,
} from './recorderState.js';
import { detachRecorder, releaseTake, requestMediaTake, takeMs, type Take } from './recorderTake.js';
import { Glyph, MIC, RecorderErrorBar, RecorderLivePanel } from './RecorderControls.js';

export { recorderIdle, isRecorderActive, voiceRecorderStep, shouldEmitClip, pickRecorderMimeType, downsamplePeaks, HOLD_CANCEL_DISTANCE, holdGesture, limitRemainingMs, clipDuration, recorderAfterCleanup, remainingSeconds, isNearLimit, recorderAnnouncement };
export type { RecorderPhase, RecorderErrorReason, RecorderState, RecorderEvent, RecorderAnnouncement, VoiceClip };

const useRecorderEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function useRecorderMotionDisabled(root: RefObject<HTMLElement | null>): boolean {
  const [disabled, setDisabled] = useState(false);
  useRecorderEffect(() => {
    const sync = () => setDisabled(subtreeReduced(root.current));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-motion', 'data-reduced-motion'] });
    return () => observer.disconnect();
  }, [root]);
  return disabled;
}

export interface VoiceRecorderProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; mic?: PrimitivePartProps; live?: PrimitivePartProps; hint?: PrimitivePartProps; time?: PrimitivePartProps; waveform?: PrimitivePartProps; actions?: PrimitivePartProps; error?: PrimitivePartProps; retry?: PrimitivePartProps };
  onRecorded: (clip: VoiceClip) => void;
  onCancel?: () => void;
  maxDuration?: number;
  autoStart?: boolean;
  label?: string;
  mode?: 'tap' | 'hold';
}

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

  const focusIsInLivePanel = (): boolean =>
    typeof document !== 'undefined' && Boolean(root.current?.querySelector('.cieo-voice-recorder-live')?.contains(document.activeElement));

  const paintLiveWaveform = () => {
    const el = liveWaveform.current;
    if (!el) return;
    for (let i = 0; i < el.children.length; i += 1) {
      const bar = el.children[i] as HTMLElement;
      const p = recorderLiveBarPresentation(liveHistory.current[i] ?? 0);
      bar.style.transform = `scaleY(${p.scale.toFixed(3)})`;
      bar.style.opacity = p.opacity.toFixed(3);
    }
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
      t.failed = true; t.discarded = true;
      if (take.current === t) take.current = null;
      ownedTakes.current.delete(t);
      detachRecorder(t);
      try { if (t.recorder.state !== 'inactive') t.recorder.stop(); } catch { /* already dead */ }
      releaseTake(t);
    }
    if (!isCurrent) return;
    currentAttempt.current = null;
    if (isRecorderActive(stateRef.current.phase) || stateRef.current.phase === 'done') send({ type: 'fail' });
    setMessage(recorderAnnouncement('failed'));
  };

  const cancel = (options: { notify?: boolean; restoreFocus?: boolean } = {}) => {
    session.current += 1;
    currentAttempt.current = null;
    const t = take.current;
    take.current = null;
    if (t) {
      t.discarded = true;
      ownedTakes.current.delete(t);
      detachRecorder(t);
      try { if (t.recorder.state !== 'inactive') t.recorder.stop(); } catch { /* already dead */ }
      releaseTake(t);
    }
    if (!isRecorderActive(stateRef.current.phase)) return;
    if (options.restoreFocus && focusIsInLivePanel()) restoreMicFocusOnExit.current = true;
    setHold('record');
    holdFrom.current = null;
    send({ type: 'cancel' });
    setMessage(recorderAnnouncement('canceled'));
    if (options.notify !== false) live.current.onCancel?.();
  };

  const finish = (kind: 'stop' | 'limit', restoreFocus = false) => {
    const t = take.current;
    if (!t || t.failed || t.discarded || (stateRef.current.phase !== 'recording' && stateRef.current.phase !== 'paused')) return;
    if (restoreFocus && focusIsInLivePanel()) restoreMicFocusOnExit.current = true;
    take.current = null;
    if (t.timer !== null) { clearInterval(t.timer); t.timer = null; }
    if (t.limitTimer !== null) { clearTimeout(t.limitTimer); t.limitTimer = null; }
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
      releaseTake(t);
      if (shouldDeliver) live.current.onRecorded({ blob: new Blob(t.chunks, { type: mimeType }), mimeType, duration, peaks: downsamplePeaks(t.peaks) });
    };
    setHold('record');
    holdFrom.current = null;
    send({ type: kind });
    setMessage(recorderAnnouncement(kind === 'limit' ? 'limit' : 'stopped', duration));
    try {
      if (t.recorder.state !== 'inactive') t.recorder.stop();
      else t.recorder.onstop?.(new Event('stop'));
    } catch { fail(t); return; }
    releaseTake(t);
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
    pushRecorderLiveLevel(liveHistory.current, Math.round(l * 50) / 50);
    paintLiveWaveform();
    const whole = Math.floor(ms / 1000);
    if (whole !== t.lastSecond) { t.lastSecond = whole; send({ type: 'tick', elapsed: whole }); }
    if (ms / 1000 >= live.current.limit) finish('limit');
  };

  const begin = () => {
    if (isRecorderActive(stateRef.current.phase)) return;
    liveHistory.current = createRecorderLiveHistory();
    paintLiveWaveform();
    const mine = ++session.current;
    currentAttempt.current = mine;
    send({ type: 'start' });
    setMessage('');
    requestMediaTake({
      mine, currentAttempt, mounted, take, ownedTakes,
      getLimit: () => live.current.limit,
      send, announce: (k) => setMessage(recorderAnnouncement(k)),
      sample, finishLimit: () => finish('limit'), fail,
    });
  };

  const togglePause = () => {
    const t = take.current;
    if (!t) return;
    try {
      if (stateRef.current.phase === 'recording') {
        t.banked = takeMs(t); t.since = 0;
        if (t.limitTimer !== null) { clearTimeout(t.limitTimer); t.limitTimer = null; }
        t.recorder.pause(); send({ type: 'pause' }); setMessage(recorderAnnouncement('paused'));
      } else if (stateRef.current.phase === 'paused') {
        t.recorder.resume(); t.since = performance.now();
        t.limitTimer = setTimeout(() => { if (take.current === t) finish('limit'); }, limitRemainingMs(t.banked, live.current.limit));
        send({ type: 'resume' }); setMessage(recorderAnnouncement('recording'));
      }
    } catch { fail(); }
  };

  const phase = state.phase;
  const active = isRecorderActive(phase);
  const motionDisabled = useRecorderMotionDisabled(root);
  const livePresence = usePresence<HTMLDivElement>(active, { disabled: motionDisabled, kind: 'feedback', from: { x: -4, y: 0, scale: 0.985, opacity: 0.45 } });
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
      mounted.current = false; session.current += 1; currentAttempt.current = null;
      const owned = [...ownedTakes.current]; ownedTakes.current.clear();
      take.current = null; holdFrom.current = null; stateRef.current = recorderIdle; setState(stateRef.current);
      owned.forEach((t) => { t.discarded = true; detachRecorder(t); try { if (t.recorder.state !== 'inactive') t.recorder.stop(); } catch { /* noop */ } releaseTake(t); });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); cancel({ restoreFocus: true }); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMicClick = (e: { detail: number }) => {
    if (mode === 'hold') {
      if (e.detail !== 0) return;
      if (phase === 'recording' || phase === 'paused') finish('stop'); else if (!active) begin();
      return;
    }
    if (!active) begin();
  };
  const onHoldDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (mode !== 'hold' || e.button !== 0 || active) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    holdFrom.current = e.clientX; setHold('record'); begin();
  };
  const onHoldMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (holdFrom.current === null) return;
    const next = holdGesture(e.clientX - holdFrom.current);
    setHold((prev) => { if (prev !== next && next === 'cancel') setMessage(recorderAnnouncement('release-to-cancel')); return next; });
  };
  const onHoldUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (holdFrom.current === null) return;
    const gesture = holdGesture(e.clientX - holdFrom.current);
    holdFrom.current = null; setHold('record');
    if (gesture === 'cancel' || stateRef.current.phase === 'requesting') cancel();
    else if (stateRef.current.phase === 'recording') finish('stop');
  };

  const near = isNearLimit(state.elapsed, limit);
  if (active) lastLive.current = { phase, elapsed: state.elapsed, near, holding: mode === 'hold' && holdFrom.current !== null, hold };
  const showMic = mode === 'hold' || !active;
  const holding = mode === 'hold' && active && holdFrom.current !== null;
  const errorText = state.reason ? recorderAnnouncement(state.reason) : '';

  return (
    <div ref={root} role="group" aria-label={label} className="cieo cieo-voice-recorder" data-phase={phase} data-mode={mode} data-warning={near && phase !== 'paused' ? '' : undefined} data-hold={holding ? hold : undefined} {...customizePart(slotProps?.root, 'cieo cieo-voice-recorder', undefined, className)}>
      {showMic ? (
        <button ref={micButton} type="button" className="cieo-voice-recorder-mic" aria-label={mode === 'hold' && (phase === 'recording' || phase === 'paused') ? 'Stop recording' : label} data-active={active ? '' : undefined} onClick={onMicClick} onPointerDown={onHoldDown} onPointerMove={onHoldMove} onPointerUp={onHoldUp} onPointerCancel={() => cancel()} {...customizePart(slotProps?.mic, 'cieo-voice-recorder-mic')}>
          <Glyph d={MIC} />
        </button>
      ) : null}
      {livePresence.mounted ? (
        <RecorderLivePanel panelRef={livePresence.ref} waveformRef={liveWaveform} history={liveHistory.current} active={active} mode={mode} limit={limit} shown={lastLive.current} slotProps={slotProps} onCancel={() => cancel({ restoreFocus: true })} onTogglePause={togglePause} onStop={() => finish('stop', true)} />
      ) : null}
      {phase === 'error' ? <RecorderErrorBar reason={state.reason} errorText={errorText} slotProps={slotProps} onRetry={() => begin()} /> : null}
      <span role="status" aria-live="polite" aria-atomic="true" className="cieo-sr-only">{message}</span>
    </div>
  );
}

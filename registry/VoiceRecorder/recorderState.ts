/* Pure state machine, peak downsampling, gesture thresholds, and live announcements for VoiceRecorder. */
import { speakAudioTime } from '../AudioTime/AudioTime.js';
import { MAX_WAVEFORM_BARS } from '../AudioWaveform/AudioWaveform.js';

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

/** Milliseconds a take may still run before it hits the limit, never below 0. */
export function limitRemainingMs(bankedMs: number, limitSeconds: number): number {
  const banked = Number.isFinite(bankedMs) ? Math.max(0, bankedMs) : 0;
  return Math.max(0, Math.round(limitSeconds * 1000 - banked));
}

/** Real recorded length in seconds to one decimal, from milliseconds. Never clamped to the limit. */
export function clipDuration(ms: number): number {
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 100) / 10) : 0;
}

/** State a recorder returns to when its effect is cleaned up, so the next mount can start a fresh take. */
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

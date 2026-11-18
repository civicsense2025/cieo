/* MediaStream, MediaRecorder, and AudioContext lifecycle helpers for VoiceRecorder. */
import { limitRemainingMs, pickRecorderMimeType, recorderAnnouncement, type RecorderAnnouncement, type RecorderEvent } from './recorderState.js';

export interface Take {
  attempt: number;
  stream: MediaStream;
  recorder: MediaRecorder;
  ctx: AudioContext | null;
  analyser: AnalyserNode | null;
  buffer: Float32Array;
  chunks: Blob[];
  peaks: number[];
  timer: ReturnType<typeof setInterval> | null;
  limitTimer: ReturnType<typeof setTimeout> | null;
  banked: number;
  since: number;
  mime: string;
  lastSecond: number;
  released: boolean;
  failed: boolean;
  discarded: boolean;
  finalized: boolean;
  trackListeners: Array<{ track: MediaStreamTrack; listener: () => void }>;
}

export const takeMs = (t: Take): number => t.banked + (t.since ? performance.now() - t.since : 0);

export function stopTracks(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    try { track.stop(); } catch { /* continue releasing the rest of the stream */ }
  });
}

export function closeContext(ctx: AudioContext | null): void {
  if (!ctx) return;
  try { void ctx.close().catch(() => {}); } catch { /* context already closed */ }
}

export function releaseTake(t: Take): void {
  if (t.released) return;
  t.released = true;
  if (t.timer !== null) { clearInterval(t.timer); t.timer = null; }
  if (t.limitTimer !== null) { clearTimeout(t.limitTimer); t.limitTimer = null; }
  t.trackListeners.forEach(({ track, listener }) => {
    try { track.removeEventListener('ended', listener); } catch { /* listener already detached */ }
  });
  t.trackListeners = [];
  stopTracks(t.stream);
  closeContext(t.ctx);
  t.ctx = null;
}

export function detachRecorder(t: Take): void {
  t.recorder.ondataavailable = null;
  t.recorder.onstop = null;
  t.recorder.onerror = null;
}

export function createTake(attempt: number, stream: MediaStream, onFail: (t: Take) => void): Take {
  const mime = pickRecorderMimeType((type) => MediaRecorder.isTypeSupported?.(type) ?? false);
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const t: Take = {
    attempt, stream, recorder, ctx: null, analyser: null, buffer: new Float32Array(0),
    chunks: [], peaks: [], timer: null, limitTimer: null, banked: 0, since: 0, mime,
    lastSecond: 0, released: false, failed: false, discarded: false, finalized: false, trackListeners: [],
  };
  recorder.ondataavailable = (e) => {
    if (!t.failed && !t.discarded && !t.finalized && e.data.size) t.chunks.push(e.data);
  };
  recorder.onerror = () => onFail(t);
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
        t.ctx = null; t.analyser = null; t.buffer = new Float32Array(0);
      }
    }
  } catch { /* the clip still records when a level analyser is unavailable */ }
  return t;
}

export function requestMediaTake(params: {
  mine: number;
  currentAttempt: { current: number | null };
  mounted: { current: boolean };
  take: { current: Take | null };
  ownedTakes: { current: Set<Take> };
  getLimit: () => number;
  send: (event: RecorderEvent) => void;
  announce: (kind: RecorderAnnouncement) => void;
  sample: (t: Take) => void;
  finishLimit: () => void;
  fail: (t?: Take) => void;
}): void {
  const { mine, currentAttempt, mounted, take, ownedTakes, getLimit, send, announce, sample, finishLimit, fail } = params;
  const media = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
  if (!media?.getUserMedia || typeof MediaRecorder === 'undefined') {
    currentAttempt.current = null;
    send({ type: 'unsupported' });
    announce('unsupported');
    return;
  }
  let request: Promise<MediaStream>;
  try { request = media.getUserMedia({ audio: true }); } catch { fail(); return; }
  Promise.resolve(request).then(
    (stream) => {
      if (mine !== currentAttempt.current || !mounted.current) { stopTracks(stream); return; }
      let t: Take | null = null;
      try {
        t = createTake(mine, stream, fail);
        take.current = t;
        ownedTakes.current.add(t);
        t.recorder.start();
        if (t.failed || t.discarded || t.released) return;
        t.since = performance.now();
        t.timer = setInterval(() => sample(t!), 50);
        t.limitTimer = setTimeout(() => { if (take.current === t) finishLimit(); }, limitRemainingMs(0, getLimit()));
        stream.getAudioTracks().forEach((track) => {
          const listener = () => { if (ownedTakes.current.has(t!) && !t!.released) fail(t!); };
          track.addEventListener('ended', listener);
          t!.trackListeners.push({ track, listener });
          if (track.readyState === 'ended') listener();
        });
        if (t.failed || t.discarded || t.released) return;
        send({ type: 'granted' });
        announce('recording');
      } catch {
        if (t) fail(t); else { stopTracks(stream); fail(); }
      }
    },
    (err: unknown) => {
      if (mine !== currentAttempt.current) return;
      const name = (err as { name?: string } | null)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
        currentAttempt.current = null; send({ type: 'denied' }); announce('denied');
      } else if (name === 'NotFoundError' || name === 'TypeError') {
        currentAttempt.current = null; send({ type: 'unsupported' }); announce('unsupported');
      } else fail();
    },
  );
}

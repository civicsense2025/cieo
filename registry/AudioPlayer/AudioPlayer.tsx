// src/primitives/AudioPlayer/AudioPlayer.tsx
'use client';
/* AudioPlayer. One clip with play/pause, a scrubber, the clock and (in full) speed. It owns the audio element and keeps only one player in the document playing at a time. */
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AudioPlayButton } from '../AudioPlayButton/AudioPlayButton.js';
import { AudioTime } from '../AudioTime/AudioTime.js';
import { AudioWaveform, audioSeekText, useScrub } from '../AudioWaveform/AudioWaveform.js';
import { DEFAULT_PLAYBACK_RATES, normalizePlaybackRate, normalizePlaybackRates, PlaybackRateButton } from '../PlaybackRateButton/PlaybackRateButton.js';

export type AudioPlayerState = 'loading' | 'ready' | 'playing' | 'ended' | 'error';
export type AudioPlayerEvent = 'loadedmetadata' | 'play' | 'pause' | 'ended' | 'error' | 'retry' | 'source';

/** Pure state step driven by the audio element's events. Error is sticky until retry; ended returns to ready-to-play on the next play. */
export function audioPlayerStep(state: AudioPlayerState, event: AudioPlayerEvent): AudioPlayerState {
  if (event === 'source') return 'loading';
  if (event === 'retry') return state === 'error' ? 'loading' : state;
  if (state === 'error') return state;
  switch (event) {
    case 'error':
      return 'error';
    case 'loadedmetadata':
      return state === 'loading' ? 'ready' : state;
    case 'play':
      return 'playing';
    case 'pause':
      return state === 'playing' ? 'ready' : state;
    case 'ended':
      return 'ended';
  }
}

let tokenCount = 0;

/** Unique token for one player instance. Not useId, which repeats across separate React roots on one page. Also unique across separately bundled copies of this module. */
export function createAudioPlayerToken(): string {
  tokenCount += 1;
  return `cieo-audio-${tokenCount}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

/** Event other copies of the player listen for on the document. detail.id is the token of the player that started. */
export const AUDIO_PLAY_EVENT = 'cieo:audio-play';

interface Registered {
  pause: () => void;
}
const players = new Map<string, Registered>();

/** Registers a player so a later one can pause it. Also listens for the document event, so separately bundled copies cooperate. Returns the cleanup. */
export function registerAudioPlayer(id: string, pause: () => void, target: EventTarget | null = typeof document === 'undefined' ? null : document): () => void {
  const entry = { pause };
  players.set(id, entry);
  const onOther = (e: Event) => {
    if ((e as CustomEvent<{ id?: string }>).detail?.id !== id) pause();
  };
  target?.addEventListener(AUDIO_PLAY_EVENT, onOther);
  return () => {
    if (players.get(id) === entry) players.delete(id);
    target?.removeEventListener(AUDIO_PLAY_EVENT, onOther);
  };
}

/** Called when player `id` starts: pauses every other registered player and announces it for other copies of this module. */
export function claimAudioPlayback(id: string, target: EventTarget | null = typeof document === 'undefined' ? null : document): void {
  for (const [other, p] of players) if (other !== id) p.pause();
  target?.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id } }));
}

export interface AudioPlayerProps {
  /** URL of the audio file. */
  src: string;
  /** What the clip is (e.g. "Voice note from Ana"). Names the player and its buttons. Required. */
  label: string;
  /** Loudness samples for a waveform scrubber. Without them a thin progress track is drawn. */
  peaks?: number[];
  /** Clip length in seconds when known up front, so the clock and track are right before metadata loads. */
  duration?: number;
  /** compact is the voice-note pill for comments and message bubbles; full adds speed and time left. Defaults to compact. */
  variant?: 'compact' | 'full';
  /** Speeds the speed button cycles through in the full variant. Defaults to [1, 1.5, 2]. */
  rates?: number[];
  /** Fires when playback starts. */
  onPlay?: () => void;
  /** Fires when playback pauses (not when the clip ends). */
  onPause?: () => void;
  /** Fires when the clip reaches its end. */
  onEnded?: () => void;
  /** Fires about four times a second while playing, and after a seek, with the playhead in seconds. */
  onTimeUpdate?: (seconds: number) => void;
}

export function AudioPlayer({ src, label, peaks, duration, variant = 'compact', rates = DEFAULT_PLAYBACK_RATES, onPlay, onPause, onEnded, onTimeUpdate }: AudioPlayerProps) {
  const tokenRef = useRef<string | null>(null);
  if (tokenRef.current === null) tokenRef.current = createAudioPlayerToken();
  const id = tokenRef.current;
  const root = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const renderedSource = useRef(src);
  renderedSource.current = src;
  const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
  const [phase, dispatch] = useReducer(audioPlayerStep, 'loading');
  const [metaDuration, setMetaDuration] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const validRates = useMemo(() => normalizePlaybackRates(rates), [rates]);
  const rateListKey = validRates.join('\u0000');
  const [rate, setRate] = useState(validRates[0] ?? 1);
  const appliedRate = useRef(normalizePlaybackRate(rate));
  const known = metaDuration ?? duration ?? 0;
  const live = useRef({ known, onPlay, onPause, onEnded, onTimeUpdate, seconds });
  live.current = { known, onPlay, onPause, onEnded, onTimeUpdate, seconds };

  // Smooth progress: the fill is a CSS variable written per frame; React state only moves once per whole second.
  const paint = useCallback((t: number) => {
    const d = live.current.known;
    root.current?.style.setProperty('--cieo-audio-progress', String(d > 0 ? Math.min(1, Math.max(0, t / d)) : 0));
    const whole = Math.floor(t);
    if (whole !== live.current.seconds) {
      live.current.seconds = whole;
      setSeconds(whole);
    }
  }, []);

  // The fill var is written only here (never through the style prop) so a re-render can't snap it back to a whole second.
  useEffect(() => paint(audio.current?.currentTime ?? 0), [known, paint, src]);

  useIsoLayoutEffect(() => {
    dispatch('source');
    setMetaDuration(null);
    setSeconds(0);
    live.current.seconds = 0;
    root.current?.style.setProperty('--cieo-audio-progress', '0');
  }, [src]);

  useEffect(() => {
    if (validRates.length === 0) return;
    setRate((current) => validRates.includes(current) ? current : validRates[0]!);
  }, [rateListKey, validRates]);

  useEffect(() => {
    const current = audio.current;
    return () => {
      if (!current) return;
      try {
        current.pause();
      } catch {
        /* the media element may already be detached */
      }
      queueMicrotask(() => {
        if (audio.current === current) return;
        try {
          current.removeAttribute('src');
          current.load();
        } catch {
          /* the media element may already be detached */
        }
      });
    };
  }, [src]);

  useEffect(() => registerAudioPlayer(id, () => audio.current?.pause()), [id]);

  useEffect(() => {
    if (phase !== 'playing') return;
    let frame = 0;
    const tick = () => {
      if (audio.current) paint(audio.current.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, paint]);

  useEffect(() => {
    if (!audio.current) return;
    const safeRate = normalizePlaybackRate(rate);
    try {
      audio.current.defaultPlaybackRate = safeRate;
      audio.current.playbackRate = safeRate;
      appliedRate.current = safeRate;
    } catch {
      /* keep the label aligned with the last rate the browser accepted */
      if (rate !== appliedRate.current) setRate(appliedRate.current);
    }
  }, [rate, phase, src]);

  const changeRate = (next: number) => {
    const safe = normalizePlaybackRate(next);
    const current = audio.current;
    if (!current) {
      setRate(safe);
      return;
    }
    try {
      current.defaultPlaybackRate = safe;
      current.playbackRate = safe;
      appliedRate.current = safe;
      setRate(safe);
    } catch {
      setRate(appliedRate.current);
    }
  };

  const seek = (t: number) => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = t;
    paint(t);
    live.current.onTimeUpdate?.(t);
  };
  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (phase === 'playing') {
      a.pause();
      return;
    }
    if (phase === 'ended') seek(0);
    a.play()?.catch((err: unknown) => {
      if (a !== audio.current || renderedSource.current !== src) return;
      const name = (err as { name?: string } | null)?.name;
      if (name !== 'AbortError' && name !== 'NotAllowedError') dispatch('error');
    });
  };
  const retry = () => {
    dispatch('retry');
    audio.current?.load();
  };

  const total = known > 0 ? known : undefined;
  const track = useScrub(known, seconds, seek);
  const resting = seconds === 0 && phase !== 'playing';
  const status = (
    <div className="cieo-audio-player-error">
      <span role="alert">Couldn&apos;t play this clip</span>
      <button type="button" className="cieo-audio-player-retry" onClick={retry}>Retry</button>
    </div>
  );
  const scrubber =
    phase === 'error' ? status : peaks && peaks.length > 0 ? (
      <AudioWaveform peaks={peaks} duration={known} current={seconds} onSeek={seek} label={`Seek in ${label}`} />
    ) : (
      <div className="cieo-audio-player-track" {...track} role="slider" tabIndex={0} aria-label={`Seek in ${label}`} aria-valuemin={0} aria-valuemax={known} aria-valuenow={Math.floor(seconds)} aria-valuetext={audioSeekText(seconds, known)} aria-orientation="horizontal">
        <span className="cieo-audio-player-fill" aria-hidden="true" />
      </div>
    );

  return (
    <div ref={root} className="cieo cieo-audio-player" role="group" aria-label={label} data-variant={variant} data-state={phase}>
      <audio
        key={src}
        ref={audio}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          if (e.currentTarget !== audio.current || renderedSource.current !== src) return;
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setMetaDuration(d);
          dispatch('loadedmetadata');
        }}
        onDurationChange={(e) => {
          if (e.currentTarget !== audio.current || renderedSource.current !== src) return;
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setMetaDuration(d);
        }}
        onPlay={(e) => {
          if (e.currentTarget !== audio.current || renderedSource.current !== src) return;
          claimAudioPlayback(id);
          dispatch('play');
          live.current.onPlay?.();
        }}
        onPause={(e) => {
          if (e.currentTarget !== audio.current || renderedSource.current !== src) return;
          dispatch('pause');
          if (!e.currentTarget.ended) live.current.onPause?.();
        }}
        onEnded={(e) => {
          if (e.currentTarget !== audio.current || renderedSource.current !== src) return;
          if (audio.current) audio.current.currentTime = 0;
          paint(0);
          dispatch('ended');
          live.current.onEnded?.();
        }}
        onError={(e) => {
          if (e.currentTarget === audio.current && renderedSource.current === src) dispatch('error');
        }}
        onTimeUpdate={(e) => {
          if (e.currentTarget === audio.current && renderedSource.current === src) live.current.onTimeUpdate?.(e.currentTarget.currentTime);
        }}
      />
      <AudioPlayButton playing={phase === 'playing'} loading={phase === 'loading'} label={label} onToggle={toggle} size={variant === 'full' ? 'lg' : 'md'} />
      <div className="cieo-audio-player-main">
        {variant === 'full' ? (
          <>
            {scrubber}
            <div className="cieo-audio-player-times">
              <AudioTime current={seconds} />
              <AudioTime current={seconds} duration={total} mode={total ? 'remaining' : 'elapsed'} />
            </div>
          </>
        ) : (
          scrubber
        )}
      </div>
      {variant === 'compact' ? <AudioTime current={seconds} duration={total} mode={resting ? 'total' : 'remaining'} /> : null}
      {variant === 'full' && phase !== 'error' ? <PlaybackRateButton rate={rate} rates={validRates} onRateChange={changeRate} /> : null}
    </div>
  );
}

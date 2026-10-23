// src/primitives/AudioPlayButton/AudioPlayButton.tsx
'use client';
/* AudioPlayButton. Round play/pause toggle whose icon morphs between the two shapes. The host owns the playing state; this owns the name, the busy ring and the morph. */

/** Accessible name for the button: "Play Voice note" or "Pause Voice note". */
export function audioPlayButtonName(playing: boolean, label: string): string {
  return `${playing ? 'Pause' : 'Play'} ${label}`;
}

export interface AudioPlayButtonProps {
  /** True while the clip plays; the button then offers Pause. */
  playing: boolean;
  /** True while the clip is loading; shows a ring and sets aria-busy. */
  loading?: boolean;
  /** Name of the clip, read after Play or Pause (e.g. "Voice note from Ana"). Required. */
  label: string;
  /** Called when the button is pressed (click, Space or Enter). */
  onToggle: () => void;
  /** Button size. Defaults to md. */
  size?: 'sm' | 'md' | 'lg';
}

export function AudioPlayButton({ playing, loading = false, label, onToggle, size = 'md' }: AudioPlayButtonProps) {
  return (
    <button type="button" className="cieo cieo-audio-play-button" aria-label={audioPlayButtonName(playing, label)} aria-busy={loading || undefined} data-playing={playing ? '' : undefined} data-loading={loading ? '' : undefined} data-size={size} onClick={onToggle}>
      <span className="cieo-audio-play-button-icon" aria-hidden="true">
        <span className="cieo-audio-play-button-half" data-half="left" />
        <span className="cieo-audio-play-button-half" data-half="right" />
      </span>
      <span className="cieo-audio-play-button-ring" aria-hidden="true" />
    </button>
  );
}

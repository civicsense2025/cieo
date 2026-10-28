// src/primitives/AudioPlayButton/AudioPlayButton.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* AudioPlayButton. Round play/pause toggle whose icon morphs between the two shapes. The host owns the playing state; this owns the name, the busy ring and the morph. */

/** Accessible name for the button: "Play Voice note" or "Pause Voice note". Hosts in other languages
 *  pass their own verbs; the clip's name always follows them. */
export function audioPlayButtonName(
  playing: boolean,
  label: string,
  verbs: { play?: string; pause?: string } = {},
): string {
  return `${playing ? (verbs.pause ?? 'Pause') : (verbs.play ?? 'Play')} ${label}`;
}

export interface AudioPlayButtonProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; icon?: PrimitivePartProps; pauseHalf?: PrimitivePartProps; ring?: PrimitivePartProps };

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
  /** The verb read before `label` while paused, in the host's language. Defaults to "Play". */
  playLabel?: string;
  /** The verb read before `label` while playing, in the host's language. Defaults to "Pause". */
  pauseLabel?: string;
}

export function AudioPlayButton({ className, slotProps, playing, loading = false, label, onToggle, size = 'md', playLabel, pauseLabel }: AudioPlayButtonProps) {
  return (
    <button type="button" className="cieo cieo-audio-play-button" aria-label={audioPlayButtonName(playing, label, { play: playLabel, pause: pauseLabel })} aria-busy={loading || undefined} data-playing={playing ? '' : undefined} data-loading={loading ? '' : undefined} data-size={size} onClick={onToggle} {...customizePart(slotProps?.root, "cieo cieo-audio-play-button", undefined, className)}>
      <span className="cieo-audio-play-button-icon" aria-hidden="true" {...customizePart(slotProps?.icon, "cieo-audio-play-button-icon", undefined)}>
        <span className="cieo-audio-play-button-half" data-half="left" {...customizePart(slotProps?.pauseHalf, "cieo-audio-play-button-half", undefined)} />
        <span className="cieo-audio-play-button-half" data-half="right" {...customizePart(slotProps?.pauseHalf, "cieo-audio-play-button-half", undefined)} />
      </span>
      <span className="cieo-audio-play-button-ring" aria-hidden="true" {...customizePart(slotProps?.ring, "cieo-audio-play-button-ring", undefined)} />
    </button>
  );
}

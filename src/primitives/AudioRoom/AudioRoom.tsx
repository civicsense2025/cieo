// src/primitives/AudioRoom/AudioRoom.tsx
'use client';
/* AudioRoom. The shell of a live audio room: title and listener count, a stage of speakers that glide into place, and the person's own controls. The host owns the audio connection. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import { useId, useRef, type ReactNode } from 'react';
import { useFlip } from '../../react/index.js';
import { CompactCount } from '../CompactCount/CompactCount.js';
import { SpeakerTile, type SpeakerRole } from '../SpeakerTile/SpeakerTile.js';

export interface AudioRoomSpeaker {
  /** Stable id; the stage animates by it when people join, leave or move. */
  id: string;
  /** Display name. */
  name: string;
  /** Avatar node (usually an Avatar). */
  avatar: ReactNode;
  /** Live loudness, 0 to 1. */
  level?: number;
  /** Shows the muted badge. */
  muted?: boolean;
  /** Role in the room. */
  role?: SpeakerRole;
  /** Shows the raised-hand badge. */
  handRaised?: boolean;
}

export interface AudioRoomSelf {
  /** Whether the person's own microphone is muted. */
  muted: boolean;
  /** Whether the person's hand is up. */
  handRaised: boolean;
  /** Only people who may speak get a mute button. */
  canSpeak: boolean;
}

/** Stage order key: changes when someone joins, leaves or moves, so the stage knows to animate. */
export function stageKey(speakers: readonly { id: string }[]): string {
  return speakers.map((s) => s.id).join('\u0000');
}

export interface AudioRoomProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; header?: PrimitivePartProps; title?: PrimitivePartProps; listeners?: PrimitivePartProps; count?: PrimitivePartProps; stage?: PrimitivePartProps; speaker?: PrimitivePartProps; controls?: PrimitivePartProps; control?: PrimitivePartProps; reactions?: PrimitivePartProps };
  /** Room title; also the accessible name of the region. */
  title: string;
  /** People on stage, in display order. */
  speakers: AudioRoomSpeaker[];
  /** How many people are listening. Shown in short form with the exact number read aloud. */
  listenerCount: number;
  /** Optional listener faces (for example an AvatarGroup) beside the count. */
  listeners?: ReactNode;
  /** The person's own state. */
  self: AudioRoomSelf;
  /** Called when the mute button is pressed. */
  onToggleMute: () => void;
  /** Called when the raise-hand button is pressed. */
  onToggleHand: () => void;
  /** Called when Leave is pressed. */
  onLeave: () => void;
  /** Slot for a reaction picker or buttons, placed in the control bar. */
  reactions?: ReactNode;
}

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);
const MIC = 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3';
const MIC_OFF = 'M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.9-.8M5 11a7 7 0 0 0 11.2 5.6M19 11a7 7 0 0 1-.6 2.8M12 18v3M3 3l18 18';
const LEAVE = 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9';

export function AudioRoom({ title, speakers, listenerCount, listeners, self, onToggleMute, onToggleHand, onLeave, reactions, className, slotProps }: AudioRoomProps) {
  const headingId = useId();
  const stage = useRef<HTMLUListElement>(null);
  useFlip(stage, stageKey(speakers));
  return (
    <section aria-labelledby={headingId} className="cieo cieo-audio-room" {...customizePart(slotProps?.root, "cieo cieo-audio-room", undefined, className)}>
      <header className="cieo-audio-room-header" {...customizePart(slotProps?.header, "cieo-audio-room-header", undefined)}>
        <h2 id={headingId} className="cieo-audio-room-title" {...customizePart(slotProps?.title, "cieo-audio-room-title", undefined)}>
          {title}
        </h2>
        <span className="cieo-audio-room-listeners" {...customizePart(slotProps?.listeners, "cieo-audio-room-listeners", undefined)}>
          {listeners}
          <span className="cieo-audio-room-count" {...customizePart(slotProps?.count, "cieo-audio-room-count", undefined)}>
            <CompactCount value={listenerCount} unit="listening" hideZero={false} />
            <span aria-hidden="true"> listening</span>
          </span>
        </span>
      </header>
      <ul ref={stage} aria-label="Speakers" className="cieo-audio-room-stage" {...customizePart(slotProps?.stage, "cieo-audio-room-stage", undefined)}>
        {speakers.map((s) => (
          <li key={s.id} className="cieo-audio-room-seat" {...customizePart(slotProps?.speaker, "cieo-audio-room-seat", undefined)}>
            <SpeakerTile name={s.name} avatar={s.avatar} level={s.level} muted={s.muted} role={s.role} handRaised={s.handRaised} size="lg" />
          </li>
        ))}
      </ul>
      <div role="group" aria-label="Your controls" className="cieo-audio-room-controls" {...customizePart(slotProps?.controls, "cieo-audio-room-controls", undefined)}>
        {self.canSpeak ? (
          <button type="button" className="cieo-audio-room-button" aria-pressed={self.muted} onClick={onToggleMute} {...customizePart(slotProps?.control, "cieo-audio-room-button", undefined)}>
            <Glyph d={self.muted ? MIC_OFF : MIC} />
            <span>Mute</span>
          </button>
        ) : null}
        <button type="button" className="cieo-audio-room-button" aria-pressed={self.handRaised} onClick={onToggleHand} {...customizePart(slotProps?.control, "cieo-audio-room-button", undefined)}>
          <span aria-hidden="true">{'✋'}</span>
          <span>Raise hand</span>
        </button>
        {reactions ? <span className="cieo-audio-room-reactions" {...customizePart(slotProps?.reactions, "cieo-audio-room-reactions", undefined)}>{reactions}</span> : null}
        <button type="button" className="cieo-audio-room-button" data-tone="danger" onClick={onLeave} {...customizePart(slotProps?.control, "cieo-audio-room-button", undefined)}>
          <Glyph d={LEAVE} />
          <span>Leave</span>
        </button>
      </div>
    </section>
  );
}

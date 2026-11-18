'use client';
/* Subviews and SVG glyphs for VoiceRecorder. */
import type { CSSProperties, RefObject } from 'react';
import { AudioTime } from '../AudioTime/AudioTime.js';
import { customizePart } from '../customization.js';
import { IconButton } from '../IconButton/IconButton.js';
import type { PrimitivePartProps } from '../parts.js';
import type { RecorderErrorReason, RecorderPhase } from './recorderState.js';
import { RECORDER_LIVE_BAR_COUNT, recorderLiveBarPresentation } from './recorderVisual.js';

export const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);

export const MIC = 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3';
const TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3';
const PAUSE = 'M8 5v14M16 5v14';
const RESUME = 'M7 4l13 8-13 8z';
const STOP = 'M5 12l5 5L20 7';

export interface RecorderSlotProps {
  root?: PrimitivePartProps;
  mic?: PrimitivePartProps;
  live?: PrimitivePartProps;
  hint?: PrimitivePartProps;
  time?: PrimitivePartProps;
  waveform?: PrimitivePartProps;
  actions?: PrimitivePartProps;
  error?: PrimitivePartProps;
  retry?: PrimitivePartProps;
}

export interface RecorderLiveSnapshot {
  phase: RecorderPhase;
  elapsed: number;
  near: boolean;
  holding: boolean;
  hold: 'record' | 'cancel';
}

export function RecorderLivePanel(props: {
  panelRef: RefObject<HTMLDivElement | null>;
  waveformRef: RefObject<HTMLSpanElement | null>;
  history: number[];
  active: boolean;
  mode: 'tap' | 'hold';
  limit: number;
  shown: RecorderLiveSnapshot;
  slotProps?: RecorderSlotProps;
  onCancel: () => void;
  onTogglePause: () => void;
  onStop: () => void;
}) {
  const { panelRef, waveformRef, history, active, mode, limit, shown, slotProps, onCancel, onTogglePause, onStop } = props;
  const { phase: shownPhase, near: shownNear, holding: shownHolding } = shown;
  return (
    <div ref={panelRef} className="cieo-voice-recorder-live" data-presence={active ? 'present' : 'exit'} aria-hidden={!active ? true : undefined} inert={!active || undefined} {...customizePart(slotProps?.live, 'cieo-voice-recorder-live')}>
      <span className="cieo-voice-recorder-dot" aria-hidden="true" data-paused={shownPhase === 'paused' ? '' : undefined} />
      {shownPhase === 'requesting' ? (
        <span className="cieo-voice-recorder-hint" {...customizePart(slotProps?.hint, 'cieo-voice-recorder-hint')}>Waiting for the microphone</span>
      ) : (
        <>
          <span className="cieo-voice-recorder-time" data-warning={shownNear ? '' : undefined} {...customizePart(slotProps?.time, 'cieo-voice-recorder-time')}>
            {shownNear ? <AudioTime current={shown.elapsed} duration={limit} mode="remaining" /> : <AudioTime current={shown.elapsed} />}
          </span>
          <span ref={waveformRef} role="img" aria-label="Microphone level" className="cieo-voice-recorder-waveform" data-paused={shownPhase === 'paused' ? '' : undefined} {...customizePart(slotProps?.waveform, 'cieo-voice-recorder-waveform')}>
            {Array.from({ length: RECORDER_LIVE_BAR_COUNT }, (_, i) => {
              const presentation = recorderLiveBarPresentation(history[i] ?? 0);
              return <span key={i} aria-hidden="true" className="cieo-voice-recorder-waveform-bar" style={{ '--cieo-recorder-bar-index': i, transform: `scaleY(${presentation.scale.toFixed(3)})`, opacity: presentation.opacity.toFixed(3) } as CSSProperties} />;
            })}
          </span>
        </>
      )}
      {shownHolding ? (
        <span className="cieo-voice-recorder-hint" aria-hidden="true" {...customizePart(slotProps?.hint, 'cieo-voice-recorder-hint')}>
          {shown.hold === 'cancel' ? 'Release to cancel' : 'Slide left to cancel'}
        </span>
      ) : null}
      <span className="cieo-voice-recorder-actions" {...customizePart(slotProps?.actions, 'cieo-voice-recorder-actions')}>
        <IconButton label="Cancel recording" size="sm" onClick={onCancel}>
          <Glyph d={TRASH} />
        </IconButton>
        {mode === 'tap' && shownPhase !== 'requesting' ? (
          <IconButton label={shownPhase === 'paused' ? 'Resume recording' : 'Pause recording'} size="sm" onClick={onTogglePause}>
            <Glyph d={shownPhase === 'paused' ? RESUME : PAUSE} />
          </IconButton>
        ) : null}
        {shownPhase !== 'requesting' && mode === 'tap' ? (
          <IconButton label="Stop recording" size="sm" className="cieo-voice-recorder-stop" onClick={onStop}>
            <Glyph d={STOP} />
          </IconButton>
        ) : null}
      </span>
    </div>
  );
}

export function RecorderErrorBar(props: { reason: RecorderErrorReason | null; errorText: string; slotProps?: RecorderSlotProps; onRetry: () => void }) {
  const { reason, errorText, slotProps, onRetry } = props;
  return (
    <span className="cieo-voice-recorder-error" {...customizePart(slotProps?.error, 'cieo-voice-recorder-error')}>
      <span>{errorText}</span>
      {reason !== 'unsupported' ? (
        <button type="button" className="cieo-voice-recorder-retry" onClick={onRetry} {...customizePart(slotProps?.retry, 'cieo-voice-recorder-retry')}>
          Try again
        </button>
      ) : null}
    </span>
  );
}

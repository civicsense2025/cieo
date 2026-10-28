import { type KeyboardEvent, type PointerEvent } from 'react';
import type { PrimitivePartProps } from '../parts.js';
/** Shortest a bar can be, as a fraction of full height, so silence still shows a tick. */
export declare const WAVEFORM_FLOOR = 0.08;
/** Seconds one arrow key moves the playhead. */
export declare const WAVEFORM_KEY_SECONDS = 5;
/** Maximum bars rendered or produced by public waveform helpers. */
export declare const MAX_WAVEFORM_BARS = 128;
/** Reduces peaks to `count` bars: each bar is the loudest peak in its bucket, scaled so the loudest bar is 1, never below the floor. Empty or silent input gives all floor values. */
export declare function waveformBars(peaks: number[], count: number): number[];
/** Seconds under a pointer at x within a track of the given width. Clamped to 0..duration; a zero-width track or unknown duration gives 0. */
export declare function seekFromPointer(x: number, width: number, duration: number): number;
/** New playhead for a key on the scrubber, clamped to 0..duration; null for keys that do nothing. Arrows move 5 s, Page keys 10 percent, Home and End jump to the ends. */
export declare function waveformKeyStep(key: string, current: number, duration: number): number | null;
/** Spoken position for a scrubber: "12 seconds of 1 minute 3 seconds". */
export declare function audioSeekText(current: number, duration: number): string;
/** Pointer-scrub and keyboard handlers shared by the waveform and the player's plain track. No state: the host re-renders from onSeek. */
export declare function useScrub(duration: number, current: number, onSeek: ((seconds: number) => void) | undefined): {
    onPointerDown(e: PointerEvent<HTMLElement>): void;
    onPointerMove(e: PointerEvent<HTMLElement>): void;
    onPointerUp(e: PointerEvent<HTMLElement>): void;
    onPointerCancel(): void;
    onKeyDown(e: KeyboardEvent<HTMLElement>): void;
};
export interface AudioWaveformProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        bars?: PrimitivePartProps;
        bar?: PrimitivePartProps;
    };
    /** Loudness samples for the clip, any length, any scale (0..1 typical). Empty draws a row of ticks. */
    peaks: number[];
    /** Clip length in seconds. */
    duration: number;
    /** Playhead in seconds. */
    current: number;
    /** Called with the new playhead when the reader scrubs or uses the keys. Omit for a read-only picture. */
    onSeek?: (seconds: number) => void;
    /** What the waveform is (e.g. "Voice note from Ana"). Required. */
    label: string;
    /** How many bars to draw. Defaults to 48. */
    bars?: number;
}
export declare function AudioWaveform({ className, slotProps, peaks, duration, current, onSeek, label, bars }: AudioWaveformProps): import("react/jsx-runtime").JSX.Element;

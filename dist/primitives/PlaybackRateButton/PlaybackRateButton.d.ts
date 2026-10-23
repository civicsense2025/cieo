/** Default speeds the button cycles through. */
export declare const DEFAULT_PLAYBACK_RATES: number[];
/** A playback rate the browser can apply; invalid values normalize to normal speed. */
export declare function normalizePlaybackRate(rate: number): number;
/** Valid unique rates in the host's order. An empty list means the control is disabled; an all-invalid non-empty list falls back to 1×. */
export declare function normalizePlaybackRates(rates: number[] | undefined): number[];
/** The rate after `rate` in the cycle. A rate not in the list starts the cycle over at the first one; an empty list changes nothing. */
export declare function nextRate(rates: number[], rate: number): number;
/** Accessible name: "Playback speed, 1.5 times". */
export declare function playbackRateName(rate: number): string;
export interface PlaybackRateButtonProps {
    /** Current speed, where 1 is normal. */
    rate: number;
    /** Speeds to cycle through, in order. Defaults to [1, 1.5, 2]. */
    rates?: number[];
    /** Called with the next speed when pressed. */
    onRateChange: (next: number) => void;
}
export declare function PlaybackRateButton({ rate, rates, onRateChange }: PlaybackRateButtonProps): import("react/jsx-runtime").JSX.Element;

/** Bounded rolling window used by the recorder's live waveform. */
export declare const RECORDER_LIVE_BAR_COUNT = 24;
/** A silent, fixed-size live history. The recorder mutates this buffer instead of rendering on every audio sample. */
export declare function createRecorderLiveHistory(): number[];
/** Adds one loudness sample and drops anything older than the fixed visual window. */
export declare function pushRecorderLiveLevel(history: number[], level: number): number[];
/** Final composited geometry for one live bar. Silence stays visible and louder samples become more opaque. */
export declare function recorderLiveBarPresentation(level: number): {
    scale: number;
    opacity: number;
};

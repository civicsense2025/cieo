/** Bounded rolling window used by the recorder's live waveform. */
export const RECORDER_LIVE_BAR_COUNT = 24;
const clampLevel = (level) => (Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0);
/** A silent, fixed-size live history. The recorder mutates this buffer instead of rendering on every audio sample. */
export function createRecorderLiveHistory() {
    return Array.from({ length: RECORDER_LIVE_BAR_COUNT }, () => 0);
}
/** Adds one loudness sample and drops anything older than the fixed visual window. */
export function pushRecorderLiveLevel(history, level) {
    const keep = Math.max(0, RECORDER_LIVE_BAR_COUNT - 1);
    if (history.length > keep)
        history.splice(0, history.length - keep);
    while (history.length < keep)
        history.unshift(0);
    history.push(clampLevel(level));
    return history;
}
/** Final composited geometry for one live bar. Silence stays visible and louder samples become more opaque. */
export function recorderLiveBarPresentation(level) {
    const value = clampLevel(level);
    return {
        scale: Math.round((0.1 + 0.9 * value) * 1000) / 1000,
        opacity: Math.round((0.45 + 0.55 * value) * 1000) / 1000,
    };
}

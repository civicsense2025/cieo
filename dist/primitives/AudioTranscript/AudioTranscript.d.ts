export interface TranscriptWord {
    /** The word as written, with its punctuation. */
    text: string;
    /** Second the word starts. */
    start: number;
    /** Second the word ends. */
    end: number;
}
/** Index of the word being spoken at time t: the last word that has started. Gaps keep the previous word until the next starts; -1 before the first word or with no words. Words must be sorted by start. */
export declare function activeWordIndex(words: {
    start: number;
    end: number;
}[], t: number): number;
/** Next focus-marker index for a key, clamped to the words; null for keys that do nothing. */
export declare function transcriptKeyStep(key: string, index: number, count: number): number | null;
/** Quiet time after the reader last scrolled before following the audio again, in ms. */
export declare const TRANSCRIPT_QUIET_MS = 4000;
/** True when the reader has not scrolled by hand within the quiet period. */
export declare function shouldAutoScroll(now: number, lastUserScroll: number | null, quietMs?: number): boolean;
/** New scrollTop that brings a word into view (centred), or null when it is already fully visible. */
export declare function transcriptScrollTop(wordTop: number, wordHeight: number, viewHeight: number, scrollTop: number): number | null;
export interface AudioTranscriptProps {
    /** Words with their start and end seconds, in order. */
    words: TranscriptWord[];
    /** Playhead in seconds. */
    current: number;
    /** Called with a word's start when it is clicked or chosen with Enter. Omit for read-only follow-along. */
    onSeek?: (seconds: number) => void;
    /** What the transcript is (e.g. "Transcript of Voice note from Ana"). Required. */
    label: string;
}
export declare function AudioTranscript({ words, current, onSeek, label }: AudioTranscriptProps): import("react/jsx-runtime").JSX.Element;

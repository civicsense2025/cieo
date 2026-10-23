/** m:ss under an hour, h:mm:ss above. Negative and non-finite input reads as 0:00. */
export declare function formatAudioTime(seconds: number): string;
/** Spoken form for assistive text: "1 minute 3 seconds". */
export declare function speakAudioTime(seconds: number): string;
export interface AudioTimeProps {
    /** Seconds played so far. */
    current: number;
    /** Clip length in seconds. Omit while it is still unknown. */
    duration?: number;
    /** elapsed shows "0:12 / 1:03"; remaining shows "-0:51"; total shows only the length, for a clip that has not started. Defaults to elapsed. */
    mode?: 'elapsed' | 'remaining' | 'total';
}
export declare function AudioTime({ current, duration, mode }: AudioTimeProps): import("react/jsx-runtime").JSX.Element;

export type AudioPlayerState = 'loading' | 'ready' | 'playing' | 'ended' | 'error';
export type AudioPlayerEvent = 'loadedmetadata' | 'play' | 'pause' | 'ended' | 'error' | 'retry' | 'source';
/** Pure state step driven by the audio element's events. Error is sticky until retry; ended returns to ready-to-play on the next play. */
export declare function audioPlayerStep(state: AudioPlayerState, event: AudioPlayerEvent): AudioPlayerState;
/** Unique token for one player instance. Not useId, which repeats across separate React roots on one page. Also unique across separately bundled copies of this module. */
export declare function createAudioPlayerToken(): string;
/** Event other copies of the player listen for on the document. detail.id is the token of the player that started. */
export declare const AUDIO_PLAY_EVENT = "cieo:audio-play";
/** Registers a player so a later one can pause it. Also listens for the document event, so separately bundled copies cooperate. Returns the cleanup. */
export declare function registerAudioPlayer(id: string, pause: () => void, target?: EventTarget | null): () => void;
/** Called when player `id` starts: pauses every other registered player and announces it for other copies of this module. */
export declare function claimAudioPlayback(id: string, target?: EventTarget | null): void;
export interface AudioPlayerProps {
    /** URL of the audio file. */
    src: string;
    /** What the clip is (e.g. "Voice note from Ana"). Names the player and its buttons. Required. */
    label: string;
    /** Loudness samples for a waveform scrubber. Without them a thin progress track is drawn. */
    peaks?: number[];
    /** Clip length in seconds when known up front, so the clock and track are right before metadata loads. */
    duration?: number;
    /** compact is the voice-note pill for comments and message bubbles; full adds speed and time left. Defaults to compact. */
    variant?: 'compact' | 'full';
    /** Speeds the speed button cycles through in the full variant. Defaults to [1, 1.5, 2]. */
    rates?: number[];
    /** Fires when playback starts. */
    onPlay?: () => void;
    /** Fires when playback pauses (not when the clip ends). */
    onPause?: () => void;
    /** Fires when the clip reaches its end. */
    onEnded?: () => void;
    /** Fires about four times a second while playing, and after a seek, with the playhead in seconds. */
    onTimeUpdate?: (seconds: number) => void;
}
export declare function AudioPlayer({ src, label, peaks, duration, variant, rates, onPlay, onPause, onEnded, onTimeUpdate }: AudioPlayerProps): import("react/jsx-runtime").JSX.Element;

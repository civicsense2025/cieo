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

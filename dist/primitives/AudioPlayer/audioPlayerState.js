/* Pure state machine and cross-root playback coordination for AudioPlayer. */
/** Pure state step driven by the audio element's events. Error is sticky until retry; ended returns to ready-to-play on the next play. */
export function audioPlayerStep(state, event) {
    if (event === 'source')
        return 'loading';
    if (event === 'retry')
        return state === 'error' ? 'loading' : state;
    if (state === 'error')
        return state;
    switch (event) {
        case 'error':
            return 'error';
        case 'loadedmetadata':
            return state === 'loading' ? 'ready' : state;
        case 'play':
            return 'playing';
        case 'pause':
            return state === 'playing' ? 'ready' : state;
        case 'ended':
            return 'ended';
    }
}
let tokenCount = 0;
/** Unique token for one player instance. Not useId, which repeats across separate React roots on one page. Also unique across separately bundled copies of this module. */
export function createAudioPlayerToken() {
    tokenCount += 1;
    return `cieo-audio-${tokenCount}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}
/** Event other copies of the player listen for on the document. detail.id is the token of the player that started. */
export const AUDIO_PLAY_EVENT = 'cieo:audio-play';
const players = new Map();
/** Registers a player so a later one can pause it. Also listens for the document event, so separately bundled copies cooperate. Returns the cleanup. */
export function registerAudioPlayer(id, pause, target = typeof document === 'undefined' ? null : document) {
    const entry = { pause };
    players.set(id, entry);
    const onOther = (e) => {
        if (e.detail?.id !== id)
            pause();
    };
    target?.addEventListener(AUDIO_PLAY_EVENT, onOther);
    return () => {
        if (players.get(id) === entry)
            players.delete(id);
        target?.removeEventListener(AUDIO_PLAY_EVENT, onOther);
    };
}
/** Called when player `id` starts: pauses every other registered player and announces it for other copies of this module. */
export function claimAudioPlayback(id, target = typeof document === 'undefined' ? null : document) {
    for (const [other, p] of players)
        if (other !== id)
            p.pause();
    target?.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id } }));
}

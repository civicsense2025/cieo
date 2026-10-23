export type RecorderPhase = 'idle' | 'requesting' | 'recording' | 'paused' | 'done' | 'error';
export type RecorderErrorReason = 'denied' | 'unsupported' | 'failed';
export interface RecorderState {
    phase: RecorderPhase;
    /** Whole seconds recorded so far. */
    elapsed: number;
    /** Set only in the error phase. */
    reason: RecorderErrorReason | null;
}
export type RecorderEvent = {
    type: 'start';
} | {
    type: 'granted';
} | {
    type: 'denied';
} | {
    type: 'unsupported';
} | {
    type: 'pause';
} | {
    type: 'resume';
} | {
    type: 'stop';
} | {
    type: 'cancel';
} | {
    type: 'tick';
    elapsed: number;
} | {
    type: 'limit';
} | {
    type: 'fail';
} | {
    type: 'reset';
};
export declare const recorderIdle: RecorderState;
/** True while a microphone, or a request for one, is in use. */
export declare function isRecorderActive(phase: RecorderPhase): boolean;
/** Pure recorder state machine. Cancel from any state goes back to idle, and only stop or limit reach done, so a cancelled take can never produce a clip. */
export declare function voiceRecorderStep(state: RecorderState, event: RecorderEvent): RecorderState;
/** True when a step finished a take, which is the only moment a clip may be handed to the host. */
export declare function shouldEmitClip(prev: RecorderState, next: RecorderState): boolean;
/** First recording format the browser supports, in order of preference, or '' to let the browser choose. */
export declare function pickRecorderMimeType(isTypeSupported: (type: string) => boolean): string;
/** Shrinks samples (0..1 loudness readings) to `count` bars, each the loudest reading in its slice. Empty input gives []. */
export declare function downsamplePeaks(samples: number[], count?: number): number[];
/** Pixels the pointer may slide left in hold mode before the take is thrown away. */
export declare const HOLD_CANCEL_DISTANCE = 80;
/** Hold-to-record gesture: sliding left past 80px means cancel, anything else keeps recording. */
export declare function holdGesture(dx: number): 'record' | 'cancel';
/** Seconds left before the limit, never below 0. */
export declare function remainingSeconds(elapsed: number, maxDuration: number): number;
/** True in the last 10 seconds of a take, when the clock switches to a countdown. Short limits (10s or less) never warn. */
export declare function isNearLimit(elapsed: number, maxDuration: number): boolean;
export type RecorderAnnouncement = 'recording' | 'paused' | 'cancelled' | 'denied' | 'unsupported' | 'failed' | 'release-to-cancel' | 'stopped' | 'limit';
/** Sentence for the live region. Only discrete events are announced, never the running clock. */
export declare function recorderAnnouncement(kind: RecorderAnnouncement, seconds?: number): string;
export interface VoiceClip {
    /** The recorded audio. */
    blob: Blob;
    /** Format of the blob, for example audio/webm;codecs=opus. */
    mimeType: string;
    /** Length in seconds, paused time excluded. */
    duration: number;
    /** 64 loudness readings from 0 to 1, ready for a waveform. */
    peaks: number[];
}
export interface VoiceRecorderProps {
    /** Called once with the finished clip when the person stops, or the time limit is reached. Never called after a cancel. */
    onRecorded: (clip: VoiceClip) => void;
    /** Called when the person cancels an active take (button, Escape, or sliding away in hold mode). */
    onCancel?: () => void;
    /** Longest take in seconds. Recording stops by itself at the limit. Defaults to 120. */
    maxDuration?: number;
    /** Ask for the microphone as soon as the component mounts. Browsers may still require a tap first. */
    autoStart?: boolean;
    /** Accessible name of the recorder and its start button. Defaults to "Record a voice reply". */
    label?: string;
    /** tap: press to start, press to stop. hold: record while the button is held, slide left to cancel. Defaults to tap. */
    mode?: 'tap' | 'hold';
}
export declare function VoiceRecorder({ onRecorded, onCancel, maxDuration, autoStart, label, mode }: VoiceRecorderProps): import("react/jsx-runtime").JSX.Element;

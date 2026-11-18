import { type RecorderAnnouncement, type RecorderEvent } from './recorderState.js';
export interface Take {
    attempt: number;
    stream: MediaStream;
    recorder: MediaRecorder;
    ctx: AudioContext | null;
    analyser: AnalyserNode | null;
    buffer: Float32Array;
    chunks: Blob[];
    peaks: number[];
    timer: ReturnType<typeof setInterval> | null;
    limitTimer: ReturnType<typeof setTimeout> | null;
    banked: number;
    since: number;
    mime: string;
    lastSecond: number;
    released: boolean;
    failed: boolean;
    discarded: boolean;
    finalized: boolean;
    trackListeners: Array<{
        track: MediaStreamTrack;
        listener: () => void;
    }>;
}
export declare const takeMs: (t: Take) => number;
export declare function stopTracks(stream: MediaStream): void;
export declare function closeContext(ctx: AudioContext | null): void;
export declare function releaseTake(t: Take): void;
export declare function detachRecorder(t: Take): void;
export declare function createTake(attempt: number, stream: MediaStream, onFail: (t: Take) => void): Take;
export declare function requestMediaTake(params: {
    mine: number;
    currentAttempt: {
        current: number | null;
    };
    mounted: {
        current: boolean;
    };
    take: {
        current: Take | null;
    };
    ownedTakes: {
        current: Set<Take>;
    };
    getLimit: () => number;
    send: (event: RecorderEvent) => void;
    announce: (kind: RecorderAnnouncement) => void;
    sample: (t: Take) => void;
    finishLimit: () => void;
    fail: (t?: Take) => void;
}): void;

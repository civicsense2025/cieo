export type FinishReason = 'settled' | 'cancelled' | 'gated' | 'failed' | 'disposed';
export interface FrameEnvironment {
    request(callback: (milliseconds: number) => void): number;
    cancel(handle: number): void;
    allowed(): boolean;
    onError(error: unknown): void;
}
export interface FrameJob {
    step(seconds: number): boolean;
    finish?(reason: FinishReason): void;
}
export declare class FrameScheduler {
    private readonly environment;
    private readonly capacity;
    private readonly jobs;
    private handle;
    private epoch;
    private ticking;
    private closed;
    private lastTime;
    constructor(environment: FrameEnvironment, capacity?: number);
    get active(): number;
    start(job: FrameJob): () => void;
    sync(): void;
    dispose(): void;
    private finish;
    private report;
    private ensureFrame;
    private cancelIdleFrame;
    private tick;
}

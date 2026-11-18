import type { PrimitivePartProps } from '../parts.js';
import { HOLD_CANCEL_DISTANCE, clipDuration, downsamplePeaks, holdGesture, isNearLimit, isRecorderActive, limitRemainingMs, pickRecorderMimeType, recorderAfterCleanup, recorderAnnouncement, recorderIdle, remainingSeconds, shouldEmitClip, voiceRecorderStep, type RecorderAnnouncement, type RecorderErrorReason, type RecorderEvent, type RecorderPhase, type RecorderState, type VoiceClip } from './recorderState.js';
export { recorderIdle, isRecorderActive, voiceRecorderStep, shouldEmitClip, pickRecorderMimeType, downsamplePeaks, HOLD_CANCEL_DISTANCE, holdGesture, limitRemainingMs, clipDuration, recorderAfterCleanup, remainingSeconds, isNearLimit, recorderAnnouncement };
export type { RecorderPhase, RecorderErrorReason, RecorderState, RecorderEvent, RecorderAnnouncement, VoiceClip };
export interface VoiceRecorderProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        mic?: PrimitivePartProps;
        live?: PrimitivePartProps;
        hint?: PrimitivePartProps;
        time?: PrimitivePartProps;
        waveform?: PrimitivePartProps;
        actions?: PrimitivePartProps;
        error?: PrimitivePartProps;
        retry?: PrimitivePartProps;
    };
    onRecorded: (clip: VoiceClip) => void;
    onCancel?: () => void;
    maxDuration?: number;
    autoStart?: boolean;
    label?: string;
    mode?: 'tap' | 'hold';
}
export declare function VoiceRecorder({ className, slotProps, onRecorded, onCancel, maxDuration, autoStart, label, mode }: VoiceRecorderProps): import("react/jsx-runtime").JSX.Element;

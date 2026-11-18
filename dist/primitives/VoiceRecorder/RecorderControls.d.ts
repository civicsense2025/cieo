import type { RefObject } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import type { RecorderErrorReason, RecorderPhase } from './recorderState.js';
export declare const Glyph: ({ d }: {
    d: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const MIC = "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3";
export interface RecorderSlotProps {
    root?: PrimitivePartProps;
    mic?: PrimitivePartProps;
    live?: PrimitivePartProps;
    hint?: PrimitivePartProps;
    time?: PrimitivePartProps;
    waveform?: PrimitivePartProps;
    actions?: PrimitivePartProps;
    error?: PrimitivePartProps;
    retry?: PrimitivePartProps;
}
export interface RecorderLiveSnapshot {
    phase: RecorderPhase;
    elapsed: number;
    near: boolean;
    holding: boolean;
    hold: 'record' | 'cancel';
}
export declare function RecorderLivePanel(props: {
    panelRef: RefObject<HTMLDivElement | null>;
    waveformRef: RefObject<HTMLSpanElement | null>;
    history: number[];
    active: boolean;
    mode: 'tap' | 'hold';
    limit: number;
    shown: RecorderLiveSnapshot;
    slotProps?: RecorderSlotProps;
    onCancel: () => void;
    onTogglePause: () => void;
    onStop: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function RecorderErrorBar(props: {
    reason: RecorderErrorReason | null;
    errorText: string;
    slotProps?: RecorderSlotProps;
    onRetry: () => void;
}): import("react/jsx-runtime").JSX.Element;

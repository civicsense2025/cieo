import type { PrimitivePartProps } from '../parts.js';
/** Loudness of a block of samples (-1..1) as 0..1 on a perceptual dB scale: -60 dB or quieter is 0, 0 dB is 1. Empty input is 0. */
export declare function rmsLevel(samples: ArrayLike<number>): number;
/** Bar heights (0.1..1) for a level: the middle bars rise the most, the outer ones follow at half height, and every bar keeps a visible stub. */
export declare function levelBars(level: number, count: number): number[];
export interface AudioLevelMeterProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        bar?: PrimitivePartProps;
    };
    /** Controlled loudness, 0 to 1. When set it wins over the stream. */
    level?: number;
    /** Live microphone stream. The meter makes its own analyser in an effect and closes it on cleanup. */
    stream?: MediaStream;
    /** Number of bars. Defaults to 5. */
    bars?: number;
    /** Accessible name. Defaults to "Microphone level". */
    label?: string;
}
export declare function AudioLevelMeter({ className, slotProps, level, stream, bars, label }: AudioLevelMeterProps): import("react/jsx-runtime").JSX.Element;

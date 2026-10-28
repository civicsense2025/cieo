import type { PrimitivePartProps } from '../parts.js';
/** Total length of the ring, in milliseconds. */
export declare const BELL_WIGGLE_MS = 420;
/** Largest swing of the ring, in degrees. */
export declare const BELL_WIGGLE_DEGREES = 12;
/** Bell angle in degrees at progress t (0 to 1): a damped swing that starts and ends at rest. Out-of-range t clamps. */
export declare function bellWiggleAngle(t: number): number;
/** Keyframe angles sampled from the damped swing, first and last at rest. */
export declare function bellWiggleFrames(steps?: number): number[];
export interface NotifyToggleProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        icon?: PrimitivePartProps;
        bell?: PrimitivePartProps;
        badge?: PrimitivePartProps;
    };
    /** Whether notifications are on. */
    on: boolean;
    /** Called on every press; the host flips `on`. */
    onToggle: () => void;
    /** Accessible name, a request in plain words. Defaults to "Notify me about new replies". */
    label?: string;
    /** Control height. Defaults to md. */
    size?: 'sm' | 'md';
}
export declare function NotifyToggle({ className, slotProps, on, onToggle, label, size }: NotifyToggleProps): import("react/jsx-runtime").JSX.Element;

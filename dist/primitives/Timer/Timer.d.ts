import type { PrimitivePartProps } from '../parts.js';
export interface TimerProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Total seconds. Required. */
    seconds: number;
}
export declare function Timer({ className, slotProps, seconds }: TimerProps): import("react/jsx-runtime").JSX.Element;

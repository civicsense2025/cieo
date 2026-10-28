import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface StepProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Step state. Defaults to todo. */
    state?: 'done' | 'current' | 'todo';
    children: ReactNode;
}
export declare function Step({ className, slotProps, state, children }: StepProps): import("react/jsx-runtime").JSX.Element;

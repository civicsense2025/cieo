import type { ReactNode } from 'react';
export interface StepProps {
    /** Step state. Defaults to todo. */
    state?: 'done' | 'current' | 'todo';
    children: ReactNode;
}
export declare function Step({ state, children }: StepProps): import("react/jsx-runtime").JSX.Element;

import type { PrimitivePartProps } from '../parts.js';
export interface StepListStep {
    title: string;
    detail?: string;
}
export type StepState = 'done' | 'current' | 'upcoming';
export interface StepListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    steps: StepListStep[];
    /** Index of the step in progress; earlier steps are done. */
    current: number;
    nextLabel?: string;
    /** Spoken after a finished step. */
    doneLabel?: string;
    /** Spoken before each step, such as "Step 2 of 4". */
    stepLabel?: (n: number, total: number) => string;
}
/** Clamps the current step into the list, so a stale index never marks everything done. */
export declare function stepState(index: number, current: number, count: number): StepState;
export declare function StepList({ className, slotProps, steps, current, nextLabel, doneLabel, stepLabel }: StepListProps): import("react/jsx-runtime").JSX.Element;

export interface StepperStep {
    label: string;
    state: 'done' | 'current' | 'todo';
}
export interface StepperProps {
    /** Accessible name for the progress nav. Required. */
    label: string;
    /** Steps in order; exactly one should be current. Required. */
    steps: StepperStep[];
}
export declare function Stepper({ label, steps }: StepperProps): import("react/jsx-runtime").JSX.Element;

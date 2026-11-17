import type { PrimitivePartProps } from '../parts.js';
export interface NumberedStep {
    title: string;
    detail?: string;
}
export interface NumberedStepsProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    steps: NumberedStep[];
}
export declare function NumberedSteps({ className, slotProps, steps }: NumberedStepsProps): import("react/jsx-runtime").JSX.Element;

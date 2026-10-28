import type { PrimitivePartProps } from '../parts.js';
export interface ProgressBarProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    value: number;
    max?: number;
    label: string;
}
export declare function ProgressBar({ className, slotProps, value, max, label }: ProgressBarProps): import("react/jsx-runtime").JSX.Element;

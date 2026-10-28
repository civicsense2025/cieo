import type { PrimitivePartProps } from '../parts.js';
export interface SelectorOptionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Submitted value. Required. */
    value: string;
    /** Visible text. Defaults to the value. */
    label?: string;
    /** Whether the option is unavailable. Defaults to false. */
    disabled?: boolean;
}
export declare function SelectorOption({ className, slotProps, value, label, disabled }: SelectorOptionProps): import("react/jsx-runtime").JSX.Element;

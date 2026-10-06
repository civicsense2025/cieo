import { type InputHTMLAttributes, type ReactNode } from 'react';
export type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    label: ReactNode;
    hideLabel?: boolean;
    /** Show the current value next to the label, rolling as it changes. */
    showValue?: boolean;
    formatValue?: (value: number) => string;
};
export declare const Range: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
    label: ReactNode;
    hideLabel?: boolean;
    /** Show the current value next to the label, rolling as it changes. */
    showValue?: boolean;
    formatValue?: (value: number) => string;
} & import("react").RefAttributes<HTMLInputElement>>;

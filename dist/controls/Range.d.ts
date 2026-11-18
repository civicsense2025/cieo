import { type InputHTMLAttributes, type ReactNode } from 'react';
import { type ControlPartProps } from './parts.js';
export interface RangeSlotProps {
    root?: ControlPartProps;
    header?: ControlPartProps;
    label?: ControlPartProps;
    value?: ControlPartProps;
    input?: ControlPartProps;
}
export type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    label: ReactNode;
    hideLabel?: boolean;
    /** Show the current value next to the label, rolling as it changes. */
    showValue?: boolean;
    formatValue?: (value: number) => string;
    slotProps?: RangeSlotProps;
};
export declare const Range: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
    label: ReactNode;
    hideLabel?: boolean;
    /** Show the current value next to the label, rolling as it changes. */
    showValue?: boolean;
    formatValue?: (value: number) => string;
    slotProps?: RangeSlotProps;
} & import("react").RefAttributes<HTMLInputElement>>;

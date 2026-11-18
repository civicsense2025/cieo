import { type InputHTMLAttributes, type ReactNode } from 'react';
import { type ControlPartProps } from './parts.js';
type InputBase = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>;
interface ToggleTextSlots {
    text?: ControlPartProps;
    label?: ControlPartProps;
    description?: ControlPartProps;
}
export interface CheckboxSlotProps extends ToggleTextSlots {
    root?: ControlPartProps;
    hit?: ControlPartProps;
    input?: ControlPartProps;
    indicator?: ControlPartProps;
}
export interface SwitchSlotProps extends ToggleTextSlots {
    root?: ControlPartProps;
    hit?: ControlPartProps;
    input?: ControlPartProps;
    track?: ControlPartProps;
    knob?: ControlPartProps;
}
export interface RadioGroupSlotProps {
    root?: ControlPartProps;
    legend?: ControlPartProps;
    description?: ControlPartProps;
    items?: ControlPartProps;
}
export interface RadioSlotProps extends ToggleTextSlots {
    root?: ControlPartProps;
    hit?: ControlPartProps;
    input?: ControlPartProps;
    indicator?: ControlPartProps;
}
interface ToggleOwn {
    /** Required: the visible name. Use hideLabel to keep it for assistive tech only. */
    label: ReactNode;
    hideLabel?: boolean;
    description?: ReactNode;
}
export type CheckboxProps = InputBase & ToggleOwn & {
    indeterminate?: boolean;
    slotProps?: CheckboxSlotProps;
};
export declare const Checkbox: import("react").ForwardRefExoticComponent<InputBase & ToggleOwn & {
    indeterminate?: boolean;
    slotProps?: CheckboxSlotProps;
} & import("react").RefAttributes<HTMLInputElement>>;
export type SwitchProps = InputBase & ToggleOwn & {
    slotProps?: SwitchSlotProps;
};
export declare const Switch: import("react").ForwardRefExoticComponent<InputBase & ToggleOwn & {
    slotProps?: SwitchSlotProps;
} & import("react").RefAttributes<HTMLInputElement>>;
export interface RadioGroupProps {
    /** Required: rendered as the fieldset legend. */
    label: ReactNode;
    hideLabel?: boolean;
    description?: ReactNode;
    name: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    form?: string;
    orientation?: 'vertical' | 'horizontal';
    className?: string;
    slotProps?: RadioGroupSlotProps;
    children: ReactNode;
}
export declare function RadioGroup(props: RadioGroupProps): import("react/jsx-runtime").JSX.Element;
export type RadioProps = Omit<InputBase, 'value'> & ToggleOwn & {
    value: string;
    slotProps?: RadioSlotProps;
};
export declare const Radio: import("react").ForwardRefExoticComponent<Omit<InputBase, "value"> & ToggleOwn & {
    value: string;
    slotProps?: RadioSlotProps;
} & import("react").RefAttributes<HTMLInputElement>>;
export {};

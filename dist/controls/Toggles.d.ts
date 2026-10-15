import { type InputHTMLAttributes, type ReactNode } from 'react';
type InputBase = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>;
interface ToggleOwn {
    /** Required: the visible name. Use hideLabel to keep it for assistive tech only. */
    label: ReactNode;
    hideLabel?: boolean;
    description?: ReactNode;
}
export type CheckboxProps = InputBase & ToggleOwn & {
    indeterminate?: boolean;
};
export declare const Checkbox: import("react").ForwardRefExoticComponent<InputBase & ToggleOwn & {
    indeterminate?: boolean;
} & import("react").RefAttributes<HTMLInputElement>>;
export type SwitchProps = InputBase & ToggleOwn;
export declare const Switch: import("react").ForwardRefExoticComponent<InputBase & ToggleOwn & import("react").RefAttributes<HTMLInputElement>>;
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
    children: ReactNode;
}
export declare function RadioGroup(props: RadioGroupProps): import("react/jsx-runtime").JSX.Element;
export type RadioProps = Omit<InputBase, 'value'> & ToggleOwn & {
    value: string;
};
export declare const Radio: import("react").ForwardRefExoticComponent<Omit<InputBase, "value"> & ToggleOwn & {
    value: string;
} & import("react").RefAttributes<HTMLInputElement>>;
export {};

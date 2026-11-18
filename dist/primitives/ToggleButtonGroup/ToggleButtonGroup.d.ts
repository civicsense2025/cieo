import { type JSX, type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ToggleButtonGroupContextValue {
    value?: string;
    values?: readonly string[];
    multiple?: boolean;
    isSelected?: (itemValue: string) => boolean;
    onSelect?: (value: string) => void;
}
export declare const ToggleButtonGroupContext: import("react").Context<ToggleButtonGroupContextValue | null>;
export interface ToggleButtonGroupProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group (e.g. "Text style"). Required. */
    label: string;
    /** Allow multiple buttons to be pressed simultaneously. Defaults to false. */
    multiple?: boolean;
    /** Selected button value (single) or values (multiple) when controlled. */
    value?: string | readonly string[];
    /** Initial selected value (single) or values (multiple) when uncontrolled. */
    defaultValue?: string | readonly string[];
    /** Called with the next selected value (single) or values array (multiple). */
    onValueChange?: ((value: string) => void) | ((value: string[]) => void);
    children: ReactNode;
}
export declare function ToggleButtonGroup(props: ToggleButtonGroupProps & {
    multiple: true;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[]) => void;
}): JSX.Element;
export declare function ToggleButtonGroup(props: ToggleButtonGroupProps & {
    multiple?: false;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}): JSX.Element;

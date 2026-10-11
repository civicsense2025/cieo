import { type ReactNode } from 'react';
export interface ToggleButtonGroupContextValue {
    value?: string;
    onSelect?: (value: string) => void;
}
export declare const ToggleButtonGroupContext: import("react").Context<ToggleButtonGroupContextValue | null>;
export interface ToggleButtonGroupProps {
    /** Accessible name for the group (e.g. "Text style"). Required. */
    label: string;
    /** Selected button value when controlled. */
    value?: string;
    /** Initial selected value when uncontrolled. */
    defaultValue?: string;
    /** Called with the newly selected value. Host owns persistence. */
    onValueChange?: (value: string) => void;
    children: ReactNode;
}
export declare function ToggleButtonGroup({ label, value, defaultValue, onValueChange, children }: ToggleButtonGroupProps): import("react/jsx-runtime").JSX.Element;

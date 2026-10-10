import { type ReactNode } from 'react';
export interface DropdownMenuRadioGroupContextValue {
    value?: string;
    onSelect?: (value: string) => void;
}
export declare const DropdownMenuRadioGroupContext: import("react").Context<DropdownMenuRadioGroupContextValue | null>;
export interface DropdownMenuRadioGroupProps {
    /** Accessible name when the group needs its own announcement. Optional; the menu label usually covers it. */
    label?: string;
    /** Picked item value when controlled. */
    value?: string;
    /** Initial picked value when uncontrolled. */
    defaultValue?: string;
    /** Called with the newly picked value. Host owns persistence. */
    onValueChange?: (value: string) => void;
    children: ReactNode;
}
export declare function DropdownMenuRadioGroup({ label, value, defaultValue, onValueChange, children }: DropdownMenuRadioGroupProps): import("react/jsx-runtime").JSX.Element;

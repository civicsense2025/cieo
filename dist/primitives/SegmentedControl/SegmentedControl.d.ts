import { type ReactNode } from 'react';
export interface SegmentedControlContextValue {
    value?: string;
    onSelect?: (value: string) => void;
}
export declare const SegmentedControlContext: import("react").Context<SegmentedControlContextValue | null>;
export interface SegmentedControlProps {
    /** Accessible name for the control (e.g. "View density"). Required. */
    label: string;
    /** Picked segment value when controlled. */
    value?: string;
    /** Initial picked value when uncontrolled. */
    defaultValue?: string;
    /** Called with the newly picked value. Host owns persistence. */
    onValueChange?: (value: string) => void;
    children: ReactNode;
}
export declare function SegmentedControl({ label, value, defaultValue, onValueChange, children }: SegmentedControlProps): import("react/jsx-runtime").JSX.Element;

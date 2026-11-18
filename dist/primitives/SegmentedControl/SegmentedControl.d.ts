import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface SegmentedControlContextValue {
    value?: string;
    onSelect?: (value: string) => void;
    registerItem?: (value: string, el: HTMLElement | null) => void;
}
export declare const SegmentedControlContext: import("react").Context<SegmentedControlContextValue | null>;
export interface SegmentedControlProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        indicator?: PrimitivePartProps;
    };
    /** Accessible name for the control (e.g. "View density"). Required. */
    label: string;
    /** Picked segment value when controlled. */
    value?: string;
    /** Initial picked value when uncontrolled. */
    defaultValue?: string;
    /** Called with the newly picked value. Host owns persistence. */
    onValueChange?: (value: string) => void;
    /** False renders the sliding indicator end state instantly. Defaults to true. */
    motion?: boolean;
    children: ReactNode;
}
export declare function SegmentedControl({ className, slotProps, label, value, defaultValue, onValueChange, motion, children, }: SegmentedControlProps): import("react/jsx-runtime").JSX.Element;

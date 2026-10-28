import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TabContextValue {
    value?: string;
    onSelect?: (value: string) => void;
    registerTab?: (value: string, el: HTMLButtonElement | null) => void;
}
export declare const TabContext: import("react").Context<TabContextValue | null>;
export interface TabListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        indicator?: PrimitivePartProps;
    };
    /** Accessible name for the tab row (e.g. "Settings sections"). Required. */
    label: string;
    /** Selected tab value when controlled. */
    value?: string;
    /** Initial selected value when uncontrolled. */
    defaultValue?: string;
    /** Called with the newly selected value. Host owns panels and persistence. */
    onValueChange?: (value: string) => void;
    /** False renders the end state instantly. Defaults to true. */
    motion?: boolean;
    children: ReactNode;
}
export declare function TabList({ label, value, defaultValue, onValueChange, motion, children, className, slotProps }: TabListProps): import("react/jsx-runtime").JSX.Element;

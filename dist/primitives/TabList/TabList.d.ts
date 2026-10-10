import { type ReactNode } from 'react';
export interface TabContextValue {
    value?: string;
    onSelect?: (value: string) => void;
}
export declare const TabContext: import("react").Context<TabContextValue | null>;
export interface TabListProps {
    /** Accessible name for the tab row (e.g. "Settings sections"). Required. */
    label: string;
    /** Selected tab value when controlled. */
    value?: string;
    /** Initial selected value when uncontrolled. */
    defaultValue?: string;
    /** Called with the newly selected value. Host owns panels and persistence. */
    onValueChange?: (value: string) => void;
    children: ReactNode;
}
export declare function TabList({ label, value, defaultValue, onValueChange, children }: TabListProps): import("react/jsx-runtime").JSX.Element;

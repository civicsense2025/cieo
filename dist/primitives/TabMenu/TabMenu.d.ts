import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface TabMenuProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the menu (e.g. "Account sections"). Required. */
    label: string;
    /** Selected tab value when controlled. */
    value?: string;
    /** Initial selected value when uncontrolled. */
    defaultValue?: string;
    /** Called with the newly selected value. Host owns panels and persistence. */
    onValueChange?: (value: string) => void;
    children: ReactNode;
}
export declare function TabMenu({ className, slotProps, label, value, defaultValue, onValueChange, children }: TabMenuProps): import("react/jsx-runtime").JSX.Element;

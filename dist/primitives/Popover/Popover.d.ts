import { type ReactNode } from 'react';
export interface PopoverProps {
    /** Trigger element that toggles the panel. Required slot. */
    trigger: ReactNode;
    /** Controlled open state. Optional. */
    open?: boolean;
    /** Uncontrolled initial state. Defaults to false. */
    defaultOpen?: boolean;
    /** Host open hook. Optional. */
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}
export declare function Popover({ trigger, open, defaultOpen, onOpenChange, children }: PopoverProps): import("react/jsx-runtime").JSX.Element;

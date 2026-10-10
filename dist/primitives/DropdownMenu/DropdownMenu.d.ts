import { type ReactNode } from 'react';
export interface DropdownMenuProps {
    /** Accessible name for the menu (e.g. "File actions"). Required. */
    label: string;
    /** Open state when controlled. */
    open?: boolean;
    /** Initial open state when uncontrolled. Defaults to false. */
    defaultOpen?: boolean;
    /** Called with the next open state. Host trigger calls onOpenChange(true). */
    onOpenChange?: (open: boolean) => void;
    /** Opener control (usually a Button). Exactly one. */
    trigger: ReactNode;
    children: ReactNode;
}
export declare function DropdownMenu({ label, open, defaultOpen, onOpenChange, trigger, children }: DropdownMenuProps): import("react/jsx-runtime").JSX.Element;

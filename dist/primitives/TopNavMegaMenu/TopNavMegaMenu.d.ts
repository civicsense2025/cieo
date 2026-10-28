import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface TopNavMegaMenuProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        panel?: PrimitivePartProps;
    };
    /** Trigger content (e.g. "Products"). Required. */
    trigger: ReactNode;
    /** Controlled open state. */
    open?: boolean;
    /** Uncontrolled initial state. Defaults to false. */
    defaultOpen?: boolean;
    /** Open-state change handler. */
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}
export declare function TopNavMegaMenu({ className, slotProps, trigger, open, defaultOpen, onOpenChange, children }: TopNavMegaMenuProps): import("react/jsx-runtime").JSX.Element;

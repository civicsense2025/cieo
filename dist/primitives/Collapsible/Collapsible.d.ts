import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CollapsibleProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        trigger?: PrimitivePartProps;
        panel?: PrimitivePartProps;
    };
    /** Button label for the disclosure. Required. */
    title: string;
    /** Optional item key when coordinated inside CollapsibleGroup. */
    value?: string;
    /** Controlled open state; omit for internal or group state. */
    open?: boolean;
    /** Initial open state for internal state. Defaults to false. */
    defaultOpen?: boolean;
    /** Called with the next open state on toggle. */
    onOpenChange?: (open: boolean) => void;
    /** Revealed content. Required. */
    children: ReactNode;
}
export declare function Collapsible({ className, slotProps, title, value, open, defaultOpen, onOpenChange, children, }: CollapsibleProps): import("react/jsx-runtime").JSX.Element;

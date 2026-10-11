import { type ReactNode } from 'react';
export interface CollapsibleProps {
    /** Button label for the disclosure. Required. */
    title: string;
    /** Controlled open state; omit for internal state. */
    open?: boolean;
    /** Initial open state for internal state. Defaults to false. */
    defaultOpen?: boolean;
    /** Called with the next open state on toggle. */
    onOpenChange?: (open: boolean) => void;
    /** Revealed content. Required. */
    children: ReactNode;
}
export declare function Collapsible({ title, open, defaultOpen, onOpenChange, children }: CollapsibleProps): import("react/jsx-runtime").JSX.Element;

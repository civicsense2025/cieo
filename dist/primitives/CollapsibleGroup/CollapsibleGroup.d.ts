import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface CollapsibleGroupProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group. Required. */
    label: string;
    /** Collapsible children. Required. */
    children: ReactNode;
}
export declare function CollapsibleGroup({ className, slotProps, label, children }: CollapsibleGroupProps): import("react/jsx-runtime").JSX.Element;

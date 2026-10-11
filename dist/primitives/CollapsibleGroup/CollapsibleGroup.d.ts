import type { ReactNode } from 'react';
export interface CollapsibleGroupProps {
    /** Accessible name for the group. Required. */
    label: string;
    /** Collapsible children. Required. */
    children: ReactNode;
}
export declare function CollapsibleGroup({ label, children }: CollapsibleGroupProps): import("react/jsx-runtime").JSX.Element;

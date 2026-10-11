import type { ReactNode } from 'react';
export interface TopNavProps {
    /** Accessible name for the primary nav. Defaults to Primary. */
    label?: string;
    children: ReactNode;
}
export declare function TopNav({ label, children }: TopNavProps): import("react/jsx-runtime").JSX.Element;

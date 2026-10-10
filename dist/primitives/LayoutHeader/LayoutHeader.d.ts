import type { ReactNode } from 'react';
export interface LayoutHeaderProps {
    /** Accessible name for the header landmark. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function LayoutHeader({ label, children }: LayoutHeaderProps): import("react/jsx-runtime").JSX.Element;

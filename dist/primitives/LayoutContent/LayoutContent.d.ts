import type { ReactNode } from 'react';
export interface LayoutContentProps {
    /** Accessible name for the main landmark. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function LayoutContent({ label, children }: LayoutContentProps): import("react/jsx-runtime").JSX.Element;

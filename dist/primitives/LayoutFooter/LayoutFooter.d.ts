import type { ReactNode } from 'react';
export interface LayoutFooterProps {
    /** Accessible name for the footer landmark. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function LayoutFooter({ label, children }: LayoutFooterProps): import("react/jsx-runtime").JSX.Element;

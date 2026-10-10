import type { ReactNode } from 'react';
export interface LayoutPanelProps {
    /** Accessible name for the complementary landmark. Required. */
    label: string;
    /** Edge the panel sits on. Defaults to 'right'. */
    side?: 'left' | 'right';
    children: ReactNode;
}
export declare function LayoutPanel({ label, side, children }: LayoutPanelProps): import("react/jsx-runtime").JSX.Element;

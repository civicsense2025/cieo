import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface LayoutPanelProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the complementary landmark. Required. */
    label: string;
    /** Edge the panel sits on. Defaults to 'right'. */
    side?: 'left' | 'right';
    children: ReactNode;
}
export declare function LayoutPanel({ className, slotProps, label, side, children }: LayoutPanelProps): import("react/jsx-runtime").JSX.Element;

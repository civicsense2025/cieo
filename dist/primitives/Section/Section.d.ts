import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface SectionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        title?: PrimitivePartProps;
    };
    /** Visible title rendered as a heading. Optional. */
    title?: string;
    /** Accessible name when there is no visible title. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function Section({ className, slotProps, title, label, children }: SectionProps): import("react/jsx-runtime").JSX.Element;

import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface SectionHeaderProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    title: string;
    level?: 2 | 3 | 4;
    /** A link, count or menu after the title. */
    action?: ReactNode;
}
export declare function SectionHeader({ className, slotProps, title, level, action }: SectionHeaderProps): import("react/jsx-runtime").JSX.Element;

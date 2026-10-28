import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface CardProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        heading?: PrimitivePartProps;
    };
    /** Card heading. Omit for title-less cards. */
    title?: string;
    children: ReactNode;
}
export declare function Card({ title, children, className, slotProps }: CardProps): import("react/jsx-runtime").JSX.Element;

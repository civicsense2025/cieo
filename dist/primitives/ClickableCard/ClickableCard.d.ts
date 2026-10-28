import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface ClickableCardProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    children: ReactNode;
}
export declare function ClickableCard({ children, className, slotProps }: ClickableCardProps): import("react/jsx-runtime").JSX.Element;

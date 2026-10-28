import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface ListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    ordered?: boolean;
    label?: string;
    children: ReactNode;
}
export declare function List({ className, slotProps, ordered, label, children }: ListProps): import("react/jsx-runtime").JSX.Element;

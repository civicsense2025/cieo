import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ListItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    children: ReactNode;
}
export declare function ListItem({ className, slotProps, children }: ListItemProps): import("react/jsx-runtime").JSX.Element;

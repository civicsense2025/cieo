import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface LegendItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    color: string;
    children: ReactNode;
}
export declare function LegendItem({ className, slotProps, color, children }: LegendItemProps): import("react/jsx-runtime").JSX.Element;

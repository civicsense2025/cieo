import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface ToolbarProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        title?: PrimitivePartProps;
        actions?: PrimitivePartProps;
    };
    label: string;
    title?: ReactNode;
    children: ReactNode;
}
export declare function Toolbar({ className, slotProps, label, title, children }: ToolbarProps): import("react/jsx-runtime").JSX.Element;

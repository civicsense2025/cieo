import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface BlockPanelProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    tone?: 'block' | 'surface' | 'accent';
    children: ReactNode;
}
export declare function BlockPanel({ className, slotProps, tone, children }: BlockPanelProps): import("react/jsx-runtime").JSX.Element;

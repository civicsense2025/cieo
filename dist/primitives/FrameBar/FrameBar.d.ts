import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface FrameBarProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    leading: ReactNode;
    trailing?: ReactNode;
    edge?: 'top' | 'bottom';
}
export declare function FrameBar({ className, slotProps, leading, trailing, edge }: FrameBarProps): import("react/jsx-runtime").JSX.Element;

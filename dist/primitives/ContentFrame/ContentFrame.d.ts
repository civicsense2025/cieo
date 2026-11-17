import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ContentFrameProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    ground?: 'page' | 'block';
    top?: ReactNode;
    bottom?: ReactNode;
    children: ReactNode;
}
export declare function ContentFrame({ className, slotProps, ground, top, bottom, children }: ContentFrameProps): import("react/jsx-runtime").JSX.Element;

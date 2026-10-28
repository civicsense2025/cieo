import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TextProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    as?: 'p' | 'span' | 'div';
    size?: 'default' | 'small';
    children: ReactNode;
}
export declare function Text({ className, slotProps, as: Tag, size, children }: TextProps): import("react/jsx-runtime").JSX.Element;

import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface IconProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name. Omit for decorative icons next to visible text. */
    label?: string;
    /** Glyph size. Defaults to md. */
    size?: 'sm' | 'md';
    /** The single glyph node (svg or character). */
    children: ReactNode;
}
export declare function Icon({ className, slotProps, label, size, children }: IconProps): import("react/jsx-runtime").JSX.Element;

import type { ReactNode } from 'react';
export interface IconProps {
    /** Accessible name. Omit for decorative icons next to visible text. */
    label?: string;
    /** Glyph size. Defaults to md. */
    size?: 'sm' | 'md';
    /** The single glyph node (svg or character). */
    children: ReactNode;
}
export declare function Icon({ label, size, children }: IconProps): import("react/jsx-runtime").JSX.Element;

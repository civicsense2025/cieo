import type { PrimitivePartProps } from '../parts.js';
export interface AvatarGroupOverflowProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Hidden face count shown as +N. Required. */
    count: number;
    /** Disc size, matches the stack faces. Defaults to md. */
    size?: 'sm' | 'md';
}
export declare function AvatarGroupOverflow({ className, slotProps, count, size }: AvatarGroupOverflowProps): import("react/jsx-runtime").JSX.Element;

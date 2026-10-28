import type { PrimitivePartProps } from '../parts.js';
export interface ThumbnailProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Approved image URL. Required. */
    src: string;
    /** Image description for readers who cannot see it. Required. */
    alt: string;
    /** Preview size. Defaults to md. */
    size?: 'sm' | 'md' | 'lg';
}
export declare function Thumbnail({ className, slotProps, src, alt, size }: ThumbnailProps): import("react/jsx-runtime").JSX.Element;

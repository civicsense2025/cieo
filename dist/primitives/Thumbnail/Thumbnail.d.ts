export interface ThumbnailProps {
    /** Approved image URL. Required. */
    src: string;
    /** Image description for readers who cannot see it. Required. */
    alt: string;
    /** Preview size. Defaults to md. */
    size?: 'sm' | 'md' | 'lg';
}
export declare function Thumbnail({ src, alt, size }: ThumbnailProps): import("react/jsx-runtime").JSX.Element;

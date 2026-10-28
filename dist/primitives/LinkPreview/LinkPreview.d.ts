import type { PrimitivePartProps } from '../parts.js';
export type LinkPreviewVariant = 'large' | 'compact';
/** Hostname without a leading www., or an empty string when the address does not parse as http(s). */
export declare function displayDomain(url: string): string;
export interface LinkPreviewImage {
    /** Image address. Must be an absolute credential-free http(s) URL. */
    src: string;
    /** Text alternative; use an empty string when the title already says it. */
    alt: string;
    /** Intrinsic width in pixels, used to reserve space. */
    width?: number;
    /** Intrinsic height in pixels, used to reserve space. */
    height?: number;
}
export interface LinkPreviewProps {
    className?: string;
    slotProps?: {
        titleText?: PrimitivePartProps;
        root?: PrimitivePartProps;
        media?: PrimitivePartProps;
        body?: PrimitivePartProps;
        content?: PrimitivePartProps;
        site?: PrimitivePartProps;
        favicon?: PrimitivePartProps;
        siteName?: PrimitivePartProps;
        domain?: PrimitivePartProps;
        title?: PrimitivePartProps;
        description?: PrimitivePartProps;
    };
    /** Address the card opens. Only credential-free absolute http(s) URLs render as links. */
    url: string;
    /** Page title, clamped to two lines. */
    title: string;
    /** Optional branding shown beside the favicon. The parsed destination hostname stays visible. */
    siteName?: string;
    /** Short summary, shown on the large card only. */
    description?: string;
    /** Lead image: 16:9 on top for large, a square thumbnail for compact. */
    image?: LinkPreviewImage;
    /** Small site icon address. */
    favicon?: string;
    /** large puts the image on top; compact puts a thumbnail on the left. Defaults to large. */
    variant?: LinkPreviewVariant;
    /** True shows a skeleton with the same footprint, then cross-fades to the content when it turns false. */
    loading?: boolean;
}
export declare function LinkPreview({ className, slotProps, url, title, siteName, description, image, favicon, variant, loading }: LinkPreviewProps): import("react/jsx-runtime").JSX.Element;

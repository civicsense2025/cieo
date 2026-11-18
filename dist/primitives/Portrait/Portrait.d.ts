import type { PrimitivePartProps } from '../parts.js';
export interface PortraitProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    src?: string;
    size?: 'small' | 'regular' | 'large';
    /** Ring color, such as a party color. */
    ring?: string;
    /** Grayscale by blend, so the ring keeps its color. */
    grayscale?: boolean;
}
/** A quoted CSS url() value. Quotes, backslashes, parentheses and control characters are percent-encoded; JSON escaping is not CSS escaping. */
export declare function cssUrl(src: string): string;
export declare function Portrait({ className, slotProps, src, size, ring, grayscale }: PortraitProps): import("react/jsx-runtime").JSX.Element;

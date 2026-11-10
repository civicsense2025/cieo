import type { PrimitivePartProps } from '../parts.js';
export interface PortraitProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    src?: string;
    size?: 'small' | 'regular' | 'large';
    /** Ring colour, such as a party colour. */
    ring?: string;
    /** Grayscale by blend, so the ring keeps its colour. */
    grayscale?: boolean;
}
export declare function Portrait({ className, slotProps, src, size, ring, grayscale }: PortraitProps): import("react/jsx-runtime").JSX.Element;

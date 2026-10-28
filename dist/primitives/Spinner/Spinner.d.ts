import type { PrimitivePartProps } from '../parts.js';
export interface SpinnerProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        ring?: PrimitivePartProps;
    };
    label?: string;
    size?: 'sm' | 'md'; /** False stops rotation via data-motion="off". Defaults to true. */
    motion?: boolean;
}
export declare function Spinner({ className, slotProps, label, size, motion }: SpinnerProps): import("react/jsx-runtime").JSX.Element;

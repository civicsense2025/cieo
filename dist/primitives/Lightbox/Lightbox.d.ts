import { type MotionProps } from '../motion.js';
import type { PrimitivePartProps } from '../parts.js';
export interface LightboxProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        image?: PrimitivePartProps;
        close?: PrimitivePartProps;
    };
    /** Image source. Required. */
    src: string;
    /** Image alternative text. Required. */
    alt: string;
    /** Whether the viewer is open when controlled. Plays exit before unmounting when closed. */
    open?: boolean;
    /** Initial open state when uncontrolled. Defaults to false. */
    defaultOpen?: boolean;
    /** Called with the next open state. */
    onOpenChange?: (open: boolean) => void;
    /** Called on Escape, scrim press or host close affordances. Optional. */
    onClose?: () => void;
    /** Whether pressing the scrim calls onClose. Defaults to true. */
    dismissOnOutsidePress?: boolean;
    /** Accessible name for the viewer dialog. Defaults to Image viewer. */
    label?: string;
}
export declare function Lightbox({ src, alt, open: openProp, defaultOpen, onOpenChange, onClose: onCloseProp, dismissOnOutsidePress, label, motion, entering, exiting, className, slotProps, }: LightboxProps): import("react/jsx-runtime").JSX.Element | null;

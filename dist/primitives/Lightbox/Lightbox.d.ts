import { type MotionProps } from '../motion.js';
export interface LightboxProps extends MotionProps {
    /** Image source. Required. */
    src: string;
    /** Image alternative text. Required. */
    alt: string;
    /** Whether the viewer is open. Plays exit before unmounting when closed. */
    open?: boolean;
    /** Called on Escape, scrim press or host close affordances. Optional. */
    onClose?: () => void;
    /** Whether pressing the scrim calls onClose. Defaults to true. */
    dismissOnOutsidePress?: boolean;
    /** Accessible name for the viewer dialog. Defaults to Image viewer. */
    label?: string;
}
export declare function Lightbox({ src, alt, open, onClose, dismissOnOutsidePress, label, motion, entering, exiting }: LightboxProps): import("react/jsx-runtime").JSX.Element | null;

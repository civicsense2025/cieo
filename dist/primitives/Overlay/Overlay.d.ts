import type { PrimitivePartProps } from '../parts.js';
export interface OverlayProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Called when the scrim is pressed. Optional. */
    onPress?: () => void;
}
export declare function Overlay({ className, slotProps, onPress }?: OverlayProps): import("react/jsx-runtime").JSX.Element;

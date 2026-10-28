import type { CSSProperties } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface AuthPasskeyButtonProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        button?: PrimitivePartProps;
    };
    id: string;
    /** Button label. Defaults to "Continue with a passkey". */
    label?: string;
    /** Ceremony in flight: label swaps to waiting text and the button busies. */
    pending?: boolean;
    disabled?: boolean;
    /** False on devices without WebAuthn: shows the fallback note. Defaults to true. */
    supported?: boolean;
    style?: CSSProperties;
    onPress?: () => void;
}
export declare function AuthPasskeyButton({ className, slotProps, id, label, pending, disabled, supported, style, onPress }: AuthPasskeyButtonProps): import("react/jsx-runtime").JSX.Element;

import type { CSSProperties } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface AuthOtpInputProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        label?: PrimitivePartProps;
        boxes?: PrimitivePartProps;
        input?: PrimitivePartProps;
    };
    id: string;
    /** Number of boxes, 4-8. Defaults to 6. */
    length?: number;
    label?: string;
    error?: string;
    disabled?: boolean;
    style?: CSSProperties;
    /** Fires once the last box fills. */
    onComplete?: (code: string) => void;
    onChange?: (code: string) => void;
}
export declare function AuthOtpInput({ className, slotProps, id, length, label, error, disabled, style, onComplete, onChange }: AuthOtpInputProps): import("react/jsx-runtime").JSX.Element;

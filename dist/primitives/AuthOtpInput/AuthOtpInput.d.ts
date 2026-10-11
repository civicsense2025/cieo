import type { CSSProperties } from 'react';
export interface AuthOtpInputProps {
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
export declare function AuthOtpInput({ id, length, label, error, disabled, style, onComplete, onChange }: AuthOtpInputProps): import("react/jsx-runtime").JSX.Element;

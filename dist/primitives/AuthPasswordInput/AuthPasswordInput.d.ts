import type { CSSProperties } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface AuthPasswordInputProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        label?: PrimitivePartProps;
        control?: PrimitivePartProps;
        input?: PrimitivePartProps;
        toggle?: PrimitivePartProps;
        strength?: PrimitivePartProps;
    };
    id: string;
    label?: string;
    value?: string;
    defaultValue?: string;
    error?: string;
    disabled?: boolean;
    /** Show the strength meter. Defaults to true. */
    showStrength?: boolean;
    /** Autocomplete token. Defaults to "current-password". */
    autoComplete?: string;
    style?: CSSProperties;
    onChange?: (value: string) => void;
    onBlur?: () => void;
}
export declare function AuthPasswordInput({ className, slotProps, id, label, value, defaultValue, error, disabled, showStrength, autoComplete, style, onChange, onBlur }: AuthPasswordInputProps): import("react/jsx-runtime").JSX.Element;

import type { CSSProperties } from 'react';
export interface AuthEmailFieldProps {
    /** Input id, also used to bind the label and the error message. */
    id: string;
    /** Visible label text. Defaults to "Email". */
    label?: string;
    /** Controlled value. Omit for uncontrolled use with defaultValue. */
    value?: string;
    /** Uncontrolled initial value. */
    defaultValue?: string;
    /** Error text. When set, the input is marked invalid and the message is announced. */
    error?: string;
    /** Disabled state. */
    disabled?: boolean;
    style?: CSSProperties;
    onChange?: (value: string) => void;
    onBlur?: () => void;
}
export declare function AuthEmailField({ id, label, value, defaultValue, error, disabled, style, onChange, onBlur }: AuthEmailFieldProps): import("react/jsx-runtime").JSX.Element;

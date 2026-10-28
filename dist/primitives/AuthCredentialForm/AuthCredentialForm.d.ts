import type { PrimitivePartProps } from '../parts.js';
import type { CSSProperties } from 'react';
export interface AuthCredentialFormProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        submit?: PrimitivePartProps;
    };
    id: string;
    /** Sign-in hides the strength meter; sign-up shows it. Defaults to "signin". */
    mode?: 'signin' | 'signup';
    pending?: boolean;
    error?: string;
    style?: CSSProperties;
    onSubmit: (values: {
        email: string;
        password: string;
    }) => void;
}
export declare function AuthCredentialForm({ className, slotProps, id, mode, pending, error, style, onSubmit }: AuthCredentialFormProps): import("react/jsx-runtime").JSX.Element;

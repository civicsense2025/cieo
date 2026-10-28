import type { PrimitivePartProps } from '../parts.js';
import type { CSSProperties } from 'react';
export interface AuthMfaChallengeProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        recovery?: PrimitivePartProps;
        label?: PrimitivePartProps;
        input?: PrimitivePartProps;
        submit?: PrimitivePartProps;
        toggle?: PrimitivePartProps;
    };
    id: string;
    pending?: boolean;
    error?: string;
    style?: CSSProperties;
    onSubmit: (code: string) => void;
    onRecovery: (code: string) => void;
}
export declare function AuthMfaChallenge({ className, slotProps, id, pending, error, style, onSubmit, onRecovery }: AuthMfaChallengeProps): import("react/jsx-runtime").JSX.Element;

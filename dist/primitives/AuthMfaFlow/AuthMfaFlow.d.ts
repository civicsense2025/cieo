import type { CSSProperties } from 'react';
export interface AuthMfaFlowProps {
    id: string;
    title?: string;
    pending?: boolean;
    error?: string;
    status?: string;
    resendIn?: number;
    style?: CSSProperties;
    onSubmit: (code: string) => void;
    onRecovery: (code: string) => void;
    onResend?: () => void;
}
export declare function AuthMfaFlow({ id, title, pending, error, status, resendIn, style, onSubmit, onRecovery, onResend }: AuthMfaFlowProps): import("react/jsx-runtime").JSX.Element;

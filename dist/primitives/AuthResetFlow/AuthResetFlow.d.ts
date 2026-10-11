import type { CSSProperties } from 'react';
export interface AuthResetFlowProps {
    id: string;
    title?: string;
    step: 'request' | 'confirm';
    pending?: boolean;
    error?: string;
    status?: string;
    signinHref?: string;
    style?: CSSProperties;
    onRequest: (email: string) => void;
    onConfirm: (password: string) => void;
}
export declare function AuthResetFlow({ id, title, step, pending, error, status, signinHref, style, onRequest, onConfirm }: AuthResetFlowProps): import("react/jsx-runtime").JSX.Element;

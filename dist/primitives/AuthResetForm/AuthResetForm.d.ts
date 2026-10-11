import type { CSSProperties } from 'react';
export interface AuthResetFormProps {
    id: string;
    step: 'request' | 'confirm';
    pending?: boolean;
    error?: string;
    style?: CSSProperties;
    onRequest: (email: string) => void;
    onConfirm: (password: string) => void;
}
export declare function AuthResetForm({ id, step, pending, error, style, onRequest, onConfirm }: AuthResetFormProps): import("react/jsx-runtime").JSX.Element;

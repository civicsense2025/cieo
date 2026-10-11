import type { CSSProperties } from 'react';
export interface AuthSignUpCardProps {
    id: string;
    title?: string;
    pending?: boolean;
    error?: string;
    status?: string;
    signinHref?: string;
    style?: CSSProperties;
    onSubmit: (values: {
        email: string;
        password: string;
    }) => void;
}
export declare function AuthSignUpCard({ id, title, pending, error, status, signinHref, style, onSubmit }: AuthSignUpCardProps): import("react/jsx-runtime").JSX.Element;

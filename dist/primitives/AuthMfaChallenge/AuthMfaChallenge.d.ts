import type { CSSProperties } from 'react';
export interface AuthMfaChallengeProps {
    id: string;
    pending?: boolean;
    error?: string;
    style?: CSSProperties;
    onSubmit: (code: string) => void;
    onRecovery: (code: string) => void;
}
export declare function AuthMfaChallenge({ id, pending, error, style, onSubmit, onRecovery }: AuthMfaChallengeProps): import("react/jsx-runtime").JSX.Element;

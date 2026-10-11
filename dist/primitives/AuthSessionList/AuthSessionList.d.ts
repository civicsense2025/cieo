import type { CSSProperties } from 'react';
export interface AuthSession {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current?: boolean;
}
export interface AuthSessionListProps {
    id: string;
    sessions: AuthSession[];
    style?: CSSProperties;
    onRevoke: (id: string) => void;
}
export declare function AuthSessionList({ id, sessions, style, onRevoke }: AuthSessionListProps): import("react/jsx-runtime").JSX.Element;

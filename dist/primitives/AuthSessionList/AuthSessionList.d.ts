import type { PrimitivePartProps } from '../parts.js';
import { type CSSProperties } from 'react';
export interface AuthSession {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current?: boolean;
}
export interface AuthSessionListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        cardTitle?: PrimitivePartProps;
        sessions?: PrimitivePartProps;
        session?: PrimitivePartProps;
        sessionDevice?: PrimitivePartProps;
        sessionMeta?: PrimitivePartProps;
        sessionCurrent?: PrimitivePartProps;
        revoke?: PrimitivePartProps;
    };
    id: string;
    sessions: AuthSession[];
    style?: CSSProperties;
    onRevoke: (id: string) => void;
}
export declare function AuthSessionList({ className, slotProps, id, sessions, style, onRevoke }: AuthSessionListProps): import("react/jsx-runtime").JSX.Element;

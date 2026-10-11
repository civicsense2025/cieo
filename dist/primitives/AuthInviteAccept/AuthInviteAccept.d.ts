import type { CSSProperties } from 'react';
export interface AuthInviteAcceptProps {
    id: string;
    orgName: string;
    inviterName: string;
    role: string;
    pending?: boolean;
    error?: string;
    style?: CSSProperties;
    onAccept: () => void;
    onDecline: () => void;
}
export declare function AuthInviteAccept({ id, orgName, inviterName, role, pending, error, style, onAccept, onDecline }: AuthInviteAcceptProps): import("react/jsx-runtime").JSX.Element;
